"""
SkillSense AI - Learning Recommender Service

Generates personalized learning recommendations based on skill gaps.
Uses content-based filtering with rule-based prioritization.
"""

from typing import List, Dict, Any


# Learning resource catalog - in production, this would be in a database
LEARNING_RESOURCES = {
    "javascript": [
        {
            "title": "JavaScript: The Complete Guide",
            "type": "course",
            "provider": "Udemy",
            "url": "https://udemy.com/javascript-complete",
            "duration": 40,
            "level": "beginner",
        },
        {
            "title": "JavaScript 30",
            "type": "tutorial",
            "provider": "Wes Bos",
            "url": "https://javascript30.com",
            "duration": 15,
            "level": "intermediate",
        },
        {
            "title": "You Don't Know JS",
            "type": "book",
            "provider": "O'Reilly",
            "url": "https://github.com/getify/You-Dont-Know-JS",
            "duration": 30,
            "level": "advanced",
        },
    ],
    "react": [
        {
            "title": "React - The Complete Guide",
            "type": "course",
            "provider": "Udemy",
            "url": "https://udemy.com/react-complete",
            "duration": 50,
            "level": "beginner",
        },
        {
            "title": "Build a React App",
            "type": "project",
            "provider": "FreeCodeCamp",
            "url": "https://freecodecamp.org/react",
            "duration": 20,
            "level": "intermediate",
        },
    ],
    "python": [
        {
            "title": "Python for Everybody",
            "type": "course",
            "provider": "Coursera",
            "url": "https://coursera.org/python",
            "duration": 30,
            "level": "beginner",
        },
        {
            "title": "Automate the Boring Stuff with Python",
            "type": "book",
            "provider": "No Starch Press",
            "url": "https://automatetheboringstuff.com",
            "duration": 25,
            "level": "intermediate",
        },
    ],
    "default": [
        {
            "title": "Skill Development Path",
            "type": "course",
            "provider": "SkillSense Learning",
            "url": "#",
            "duration": 20,
            "level": "intermediate",
        },
    ],
}


class RecommenderService:
    """Service for generating personalized learning recommendations"""
    
    def generate_recommendations(
        self,
        user_id: str,
        gaps: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generate learning recommendations based on skill gaps.
        
        Algorithm:
        1. Sort gaps by priority (critical -> high -> medium -> low)
        2. For each gap, find relevant learning resources
        3. Score resources based on:
           - Gap size (larger gap = prefer comprehensive resources)
           - Current level (match resource difficulty)
           - Resource type variety
        4. Return prioritized list of recommendations
        
        Args:
            user_id: User identifier
            gaps: List of skill gaps with priority
            
        Returns:
            Prioritized list of learning recommendations
        """
        if not gaps:
            return []
        
        # Sort gaps by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        sorted_gaps = sorted(gaps, key=lambda g: priority_order.get(g["priority"], 4))
        
        recommendations = []
        seen_resources = set()
        
        for i, gap in enumerate(sorted_gaps):
            skill_name = gap["skillName"].lower().replace(" ", "")
            gap_size = gap["gapSize"]
            
            # Get resources for this skill
            resources = self._get_resources_for_skill(skill_name)
            
            for resource in resources:
                resource_key = f"{resource['title']}_{resource['provider']}"
                
                if resource_key in seen_resources:
                    continue
                
                # Score the resource
                score = self._score_resource(resource, gap_size)
                
                if score > 0.3:  # Threshold for relevance
                    recommendations.append({
                        "skillId": gap["skillId"],
                        "skillName": gap["skillName"],
                        "resourceType": resource["type"],
                        "title": resource["title"],
                        "description": f"Close your {gap['skillName']} gap with this {resource['type']}",
                        "url": resource["url"],
                        "provider": resource["provider"],
                        "estimatedDuration": resource["duration"],
                        "priority": i + 1,
                        "score": score,
                    })
                    seen_resources.add(resource_key)
        
        # Sort by priority and score
        recommendations.sort(key=lambda r: (r["priority"], -r["score"]))
        
        # Remove score from output (internal use only)
        for rec in recommendations:
            del rec["score"]
        
        # Limit to top recommendations
        return recommendations[:10]
    
    def _get_resources_for_skill(self, skill_name: str) -> List[Dict]:
        """Get learning resources for a skill"""
        # Check exact match first
        if skill_name in LEARNING_RESOURCES:
            return LEARNING_RESOURCES[skill_name]
        
        # Check partial matches
        for key in LEARNING_RESOURCES:
            if key in skill_name or skill_name in key:
                return LEARNING_RESOURCES[key]
        
        # Fall back to default
        return LEARNING_RESOURCES["default"]
    
    def _score_resource(self, resource: Dict, gap_size: int) -> float:
        """
        Score a resource based on gap characteristics.
        
        Factors:
        - Gap size match: larger gaps prefer comprehensive courses
        - Content freshness (would use real data in production)
        - Resource type variety bonus
        """
        score = 0.5  # Base score
        
        # Gap size -> resource type mapping
        if gap_size >= 3:
            # Large gap: prefer comprehensive courses
            if resource["type"] == "course":
                score += 0.3
            elif resource["type"] == "book":
                score += 0.2
        elif gap_size == 2:
            # Medium gap: tutorials and projects
            if resource["type"] in ["tutorial", "project"]:
                score += 0.3
            elif resource["type"] == "course":
                score += 0.1
        else:
            # Small gap: quick tutorials and docs
            if resource["type"] in ["tutorial", "documentation"]:
                score += 0.3
            elif resource["type"] == "video":
                score += 0.2
        
        # Level matching bonus
        level_scores = {"beginner": 1, "intermediate": 2, "advanced": 3}
        resource_level = level_scores.get(resource.get("level", "intermediate"), 2)
        
        # Prefer resources that match current level + 1
        if resource_level <= gap_size:
            score += 0.1
        
        return min(1.0, score)


# Singleton instance
recommender_service = RecommenderService()
