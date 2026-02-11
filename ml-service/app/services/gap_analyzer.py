"""
SkillSense AI - Gap Analyzer Service

Analyzes skill gaps between user's current profile and target role requirements.
Uses intelligent prioritization and time estimation.
"""

from typing import List, Dict, Any
import numpy as np

from app.config import settings


# Role requirements dictionary keyed by lowercase role title
# The backend sends a MongoDB ObjectId as target_role_id, but the skill profile
# and role data come through as context.  We match by normalized title when an
# ObjectId lookup fails.
ROLE_REQUIREMENTS = {
    "frontend_developer": {
        "title": "Frontend Developer",
        "skills": [
            {"skillId": "js", "skillName": "JavaScript", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "react", "skillName": "React", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "typescript", "skillName": "TypeScript", "requiredLevel": 3, "importance": "good_to_have"},
            {"skillId": "git", "skillName": "Git", "requiredLevel": 3, "importance": "must_have"},
            {"skillId": "rest", "skillName": "REST APIs", "requiredLevel": 3, "importance": "good_to_have"},
            {"skillId": "communication", "skillName": "Communication", "requiredLevel": 3, "importance": "good_to_have"},
            {"skillId": "problemsolving", "skillName": "Problem Solving", "requiredLevel": 4, "importance": "must_have"},
        ]
    },
    "backend_developer": {
        "title": "Backend Developer",
        "skills": [
            {"skillId": "nodejs", "skillName": "Node.js", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "js", "skillName": "JavaScript", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "sql", "skillName": "SQL", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "rest", "skillName": "REST APIs", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "systemdesign", "skillName": "System Design", "requiredLevel": 3, "importance": "good_to_have"},
            {"skillId": "git", "skillName": "Git", "requiredLevel": 3, "importance": "must_have"},
            {"skillId": "problemsolving", "skillName": "Problem Solving", "requiredLevel": 4, "importance": "must_have"},
        ]
    },
    "full_stack_developer": {
        "title": "Full Stack Developer",
        "skills": [
            {"skillId": "js", "skillName": "JavaScript", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "react", "skillName": "React", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "nodejs", "skillName": "Node.js", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "typescript", "skillName": "TypeScript", "requiredLevel": 3, "importance": "good_to_have"},
            {"skillId": "sql", "skillName": "SQL", "requiredLevel": 3, "importance": "must_have"},
            {"skillId": "rest", "skillName": "REST APIs", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "git", "skillName": "Git", "requiredLevel": 3, "importance": "must_have"},
            {"skillId": "systemdesign", "skillName": "System Design", "requiredLevel": 3, "importance": "good_to_have"},
        ]
    },
    "data_scientist": {
        "title": "Data Scientist",
        "skills": [
            {"skillId": "python", "skillName": "Python", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "ml", "skillName": "Machine Learning", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "sql", "skillName": "SQL", "requiredLevel": 3, "importance": "must_have"},
            {"skillId": "ds", "skillName": "Data Structures", "requiredLevel": 3, "importance": "good_to_have"},
            {"skillId": "algo", "skillName": "Algorithms", "requiredLevel": 3, "importance": "good_to_have"},
            {"skillId": "communication", "skillName": "Communication", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "problemsolving", "skillName": "Problem Solving", "requiredLevel": 5, "importance": "must_have"},
        ]
    },
    "software_engineer": {
        "title": "Software Engineer",
        "skills": [
            {"skillId": "ds", "skillName": "Data Structures", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "algo", "skillName": "Algorithms", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "systemdesign", "skillName": "System Design", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "git", "skillName": "Git", "requiredLevel": 3, "importance": "must_have"},
            {"skillId": "problemsolving", "skillName": "Problem Solving", "requiredLevel": 5, "importance": "must_have"},
            {"skillId": "communication", "skillName": "Communication", "requiredLevel": 3, "importance": "good_to_have"},
            {"skillId": "teamwork", "skillName": "Teamwork", "requiredLevel": 3, "importance": "good_to_have"},
            {"skillId": "agile", "skillName": "Agile Methodology", "requiredLevel": 3, "importance": "good_to_have"},
        ]
    },
    "default": {
        "title": "Software Engineer",
        "skills": [
            {"skillId": "ds", "skillName": "Data Structures", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "algo", "skillName": "Algorithms", "requiredLevel": 4, "importance": "must_have"},
            {"skillId": "systemdesign", "skillName": "System Design", "requiredLevel": 3, "importance": "good_to_have"},
        ]
    }
}

# Reverse lookup: normalized title -> key
_TITLE_TO_KEY = {
    v["title"].lower().replace(" ", "_"): k
    for k, v in ROLE_REQUIREMENTS.items()
    if k != "default"
}


class GapAnalyzerService:
    """Service for analyzing skill gaps with intelligent prioritization"""
    
    def analyze_gaps(
        self,
        user_id: str,
        skill_profile: Dict[str, Any],
        target_role_id: str
    ) -> Dict[str, Any]:
        """
        Analyze gaps between user's skills and target role requirements.
        
        Algorithm:
        1. Get role requirements (from DB in production)
        2. Compare each required skill with user's current level
        3. Calculate gap size and priority
        4. Estimate time to close each gap
        5. Identify strengths and improvement areas
        
        Args:
            user_id: User identifier
            skill_profile: User's current skill profile
            target_role_id: Target role identifier
            
        Returns:
            Gap analysis with prioritized gaps and recommendations
        """
        # Get role requirements
        role_reqs = self._get_role_requirements(target_role_id)
        
        # Build user skill map
        user_skills = {
            s["skillId"]: s 
            for s in skill_profile.get("skills", [])
        }
        
        gaps = []
        strength_areas = []
        improvement_areas = []
        
        for req in role_reqs["skills"]:
            skill_id = req["skillId"]
            required_level = req["requiredLevel"]
            
            # Get user's current level (default to 0 if not assessed)
            user_skill = user_skills.get(skill_id, {})
            current_level = user_skill.get("proficiencyLevel", 0)
            
            # Calculate gap
            gap_size = max(0, required_level - current_level)
            
            if gap_size > 0:
                # Calculate priority based on gap size and importance
                priority = self._calculate_priority(gap_size, req["importance"])
                
                # Estimate time to close gap
                estimated_time = self._estimate_time_to_close(gap_size, skill_id)
                
                gaps.append({
                    "skillId": skill_id,
                    "skillName": req["skillName"],
                    "currentLevel": current_level,
                    "requiredLevel": required_level,
                    "gapSize": gap_size,
                    "priority": priority,
                    "importance": req["importance"],
                    "estimatedTimeToClose": estimated_time,
                })
                
                improvement_areas.append(req["skillName"])
            else:
                # User meets or exceeds requirement
                strength_areas.append(req["skillName"])
        
        # Sort gaps by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        gaps.sort(key=lambda g: priority_order.get(g["priority"], 4))
        
        # Calculate overall readiness
        overall_readiness = self._calculate_readiness(gaps, role_reqs["skills"])
        
        return {
            "gaps": gaps,
            "overallReadiness": overall_readiness,
            "strengthAreas": strength_areas[:5],  # Top 5
            "improvementAreas": improvement_areas[:5],
        }
    
    def _get_role_requirements(self, role_id: str) -> Dict[str, Any]:
        """
        Get role skill requirements.
        
        Lookup order:
        1. Exact key match (e.g. "frontend_developer")
        2. Normalized title match (e.g. "Frontend Developer" -> "frontend_developer")
        3. Fallback to default
        """
        # Exact key match
        if role_id in ROLE_REQUIREMENTS:
            return ROLE_REQUIREMENTS[role_id]
        
        # Try normalized title match
        normalized = role_id.lower().replace(" ", "_").replace("-", "_")
        if normalized in ROLE_REQUIREMENTS:
            return ROLE_REQUIREMENTS[normalized]
        
        # Try reverse title lookup
        if normalized in _TITLE_TO_KEY:
            return ROLE_REQUIREMENTS[_TITLE_TO_KEY[normalized]]
        
        return ROLE_REQUIREMENTS["default"]
    
    def _calculate_priority(self, gap_size: int, importance: str) -> str:
        """
        Calculate gap priority based on size and skill importance.
        
        Priority Matrix:
        |           | must_have | good_to_have | nice_to_have |
        |-----------|-----------|--------------|--------------|
        | gap >= 3  | critical  | high         | medium       |
        | gap == 2  | high      | medium       | low          |
        | gap == 1  | medium    | low          | low          |
        """
        if gap_size >= settings.gap_critical_threshold:
            if importance == "must_have":
                return "critical"
            elif importance == "good_to_have":
                return "high"
            else:
                return "medium"
        elif gap_size >= settings.gap_high_threshold:
            if importance == "must_have":
                return "high"
            elif importance == "good_to_have":
                return "medium"
            else:
                return "low"
        else:  # gap == 1
            if importance == "must_have":
                return "medium"
            else:
                return "low"
    
    def _estimate_time_to_close(self, gap_size: int, skill_id: str) -> int:
        """
        Estimate hours needed to close a skill gap.
        
        Factors:
        - Base hours per level
        - Skill complexity multiplier
        - Learning curve (later levels take longer)
        """
        base_hours = settings.hours_per_level
        
        # Learning curve: each level takes progressively longer
        # Level 1->2: 1x, 2->3: 1.2x, 3->4: 1.5x, 4->5: 2x
        level_multipliers = [1.0, 1.0, 1.2, 1.5, 2.0]
        
        total_hours = 0
        for i in range(gap_size):
            level_mult = level_multipliers[min(i, len(level_multipliers) - 1)]
            total_hours += base_hours * level_mult
        
        return int(total_hours)
    
    def _calculate_readiness(
        self, 
        gaps: List[Dict], 
        requirements: List[Dict]
    ) -> float:
        """
        Calculate overall readiness percentage for the role.
        
        Weighted by skill importance:
        - must_have: 1.5x weight
        - good_to_have: 1.0x weight
        - nice_to_have: 0.5x weight
        """
        if not requirements:
            return 100.0
        
        importance_weights = {
            "must_have": 1.5,
            "good_to_have": 1.0,
            "nice_to_have": 0.5,
        }
        
        total_weighted_score = 0.0
        total_weight = 0.0
        
        gap_map = {g["skillId"]: g for g in gaps}
        
        for req in requirements:
            weight = importance_weights.get(req["importance"], 1.0)
            total_weight += weight
            
            gap = gap_map.get(req["skillId"])
            if gap:
                # Score based on how much of requirement is met
                score = max(0, (req["requiredLevel"] - gap["gapSize"])) / req["requiredLevel"]
            else:
                # No gap = requirement fully met
                score = 1.0
            
            total_weighted_score += score * weight
        
        readiness = (total_weighted_score / total_weight) * 100 if total_weight > 0 else 0
        return round(readiness, 1)


# Singleton instance
gap_analyzer_service = GapAnalyzerService()
