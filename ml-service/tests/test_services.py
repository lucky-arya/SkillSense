"""
Tests for the ML service gap analyzer and recommender
"""

import pytest
from app.services.gap_analyzer import gap_analyzer_service, ROLE_REQUIREMENTS
from app.services.recommender import recommender_service, LEARNING_RESOURCES


# ── Gap Analyzer Tests ──────────────────────────────────────────────


class TestGapAnalyzer:
    """Tests for GapAnalyzerService"""

    def _make_profile(self, skills):
        """Helper to build a skill profile dict"""
        return {
            "userId": "test-user",
            "skills": skills,
            "overallScore": 50,
            "lastUpdated": "2024-01-01T00:00:00Z",
        }

    def test_analyze_frontend_developer_full_gaps(self):
        """User with no skills should have gaps for every requirement"""
        profile = self._make_profile([])
        result = gap_analyzer_service.analyze_gaps("u1", profile, "frontend_developer")

        assert "gaps" in result
        assert "overallReadiness" in result
        assert "strengthAreas" in result
        assert "improvementAreas" in result

        # All required skills should appear as gaps
        assert len(result["gaps"]) == len(ROLE_REQUIREMENTS["frontend_developer"]["skills"])
        assert result["overallReadiness"] < 100

    def test_analyze_no_gaps_when_all_met(self):
        """User who exceeds all requirements should have 0 gaps"""
        role_skills = ROLE_REQUIREMENTS["frontend_developer"]["skills"]
        user_skills = [
            {
                "skillId": s["skillId"],
                "skillName": s["skillName"],
                "proficiencyLevel": 5,
                "confidence": 0.9,
                "assessedAt": "2024-01-01T00:00:00Z",
                "source": "quiz",
            }
            for s in role_skills
        ]
        profile = self._make_profile(user_skills)

        result = gap_analyzer_service.analyze_gaps("u2", profile, "frontend_developer")

        assert len(result["gaps"]) == 0
        assert result["overallReadiness"] == 100.0

    def test_priority_ordering(self):
        """Gaps should be sorted by priority: critical > high > medium > low"""
        profile = self._make_profile([])
        result = gap_analyzer_service.analyze_gaps("u3", profile, "software_engineer")

        priorities = [g["priority"] for g in result["gaps"]]
        order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        numeric = [order[p] for p in priorities]
        assert numeric == sorted(numeric)

    def test_default_fallback_for_unknown_role(self):
        """Unknown role ID should fall back to default role requirements"""
        profile = self._make_profile([])
        result = gap_analyzer_service.analyze_gaps("u4", profile, "unknown_role_xyz")

        default_skills = {s["skillName"] for s in ROLE_REQUIREMENTS["default"]["skills"]}
        gap_skills = {g["skillName"] for g in result["gaps"]}
        assert gap_skills == default_skills

    def test_partial_skills_give_partial_readiness(self):
        """Meeting some requirements should give partial readiness"""
        role_skills = ROLE_REQUIREMENTS["backend_developer"]["skills"]
        # Meet only the first requirement
        user_skills = [
            {
                "skillId": role_skills[0]["skillId"],
                "skillName": role_skills[0]["skillName"],
                "proficiencyLevel": role_skills[0]["requiredLevel"],
                "confidence": 0.8,
                "assessedAt": "2024-01-01T00:00:00Z",
                "source": "quiz",
            }
        ]
        profile = self._make_profile(user_skills)
        result = gap_analyzer_service.analyze_gaps("u5", profile, "backend_developer")

        assert 0 < result["overallReadiness"] < 100
        assert len(result["strengthAreas"]) >= 1

    def test_all_role_keys_exist(self):
        """All 5 seeded roles + default should be in ROLE_REQUIREMENTS"""
        expected = {
            "frontend_developer",
            "backend_developer",
            "full_stack_developer",
            "data_scientist",
            "software_engineer",
            "default",
        }
        assert expected.issubset(set(ROLE_REQUIREMENTS.keys()))

    def test_estimated_time_positive(self):
        """Every gap's estimatedTimeToClose should be positive"""
        profile = self._make_profile([])
        result = gap_analyzer_service.analyze_gaps("u6", profile, "frontend_developer")

        for gap in result["gaps"]:
            assert gap["estimatedTimeToClose"] > 0


# ── Recommender Tests ──────────────────────────────────────────────


class TestRecommender:
    """Tests for RecommenderService"""

    def test_empty_gaps_returns_empty(self):
        recs = recommender_service.generate_recommendations("u1", [])
        assert recs == []

    def test_returns_recommendations_for_known_skill(self):
        gaps = [
            {
                "skillId": "js",
                "skillName": "JavaScript",
                "currentLevel": 1,
                "requiredLevel": 4,
                "gapSize": 3,
                "priority": "critical",
                "importance": "must_have",
                "estimatedTimeToClose": 60,
            }
        ]
        recs = recommender_service.generate_recommendations("u2", gaps)
        assert len(recs) > 0
        assert all(r["skillName"] == "JavaScript" for r in recs)

    def test_recommendations_limited_to_10(self):
        """Should not return more than 10 recommendations"""
        gaps = [
            {
                "skillId": f"skill{i}",
                "skillName": f"Skill {i}",
                "currentLevel": 1,
                "requiredLevel": 4,
                "gapSize": 3,
                "priority": "high",
                "importance": "must_have",
                "estimatedTimeToClose": 40,
            }
            for i in range(20)
        ]
        recs = recommender_service.generate_recommendations("u3", gaps)
        assert len(recs) <= 10

    def test_no_duplicate_resources(self):
        """Each recommendation title+provider should be unique"""
        gaps = [
            {
                "skillId": "js",
                "skillName": "JavaScript",
                "currentLevel": 1,
                "requiredLevel": 5,
                "gapSize": 4,
                "priority": "critical",
                "importance": "must_have",
                "estimatedTimeToClose": 80,
            },
        ]
        recs = recommender_service.generate_recommendations("u4", gaps)
        keys = [(r["title"], r["provider"]) for r in recs]
        assert len(keys) == len(set(keys))

    def test_recommendation_has_required_fields(self):
        gaps = [
            {
                "skillId": "react",
                "skillName": "React",
                "currentLevel": 0,
                "requiredLevel": 4,
                "gapSize": 4,
                "priority": "critical",
                "importance": "must_have",
                "estimatedTimeToClose": 80,
            }
        ]
        recs = recommender_service.generate_recommendations("u5", gaps)
        required_fields = {
            "skillId", "skillName", "resourceType", "title",
            "description", "url", "provider", "estimatedDuration", "priority",
        }
        for rec in recs:
            assert required_fields.issubset(set(rec.keys())), (
                f"Missing fields: {required_fields - set(rec.keys())}"
            )

    def test_resource_catalog_covers_all_core_skills(self):
        """Key skills from seed data should have resources (not just default)"""
        core_keys = [
            "javascript", "react", "typescript", "python", "sql",
            "git", "datastructures", "algorithms", "systemdesign",
            "machinelearning",
        ]
        for key in core_keys:
            assert key in LEARNING_RESOURCES, f"Missing resources for '{key}'"
            assert len(LEARNING_RESOURCES[key]) > 0
