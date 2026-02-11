"""
SkillSense AI - Learning Recommender Service

Generates personalized learning recommendations based on skill gaps.
Uses content-based filtering with rule-based prioritization.
"""

from typing import List, Dict, Any


# Learning resource catalog covering all skills in the SkillSense platform
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
        {
            "title": "React Patterns & Best Practices",
            "type": "book",
            "provider": "Packt",
            "url": "https://packtpub.com/react-patterns",
            "duration": 25,
            "level": "advanced",
        },
    ],
    "typescript": [
        {
            "title": "Understanding TypeScript",
            "type": "course",
            "provider": "Udemy",
            "url": "https://udemy.com/understanding-typescript",
            "duration": 30,
            "level": "beginner",
        },
        {
            "title": "TypeScript Handbook",
            "type": "documentation",
            "provider": "Microsoft",
            "url": "https://typescriptlang.org/docs/handbook",
            "duration": 10,
            "level": "intermediate",
        },
        {
            "title": "Effective TypeScript",
            "type": "book",
            "provider": "O'Reilly",
            "url": "https://effectivetypescript.com",
            "duration": 20,
            "level": "advanced",
        },
    ],
    "node.js": [
        {
            "title": "The Complete Node.js Developer Course",
            "type": "course",
            "provider": "Udemy",
            "url": "https://udemy.com/the-complete-nodejs-developer-course",
            "duration": 35,
            "level": "beginner",
        },
        {
            "title": "Node.js Design Patterns",
            "type": "book",
            "provider": "Packt",
            "url": "https://packtpub.com/nodejs-design-patterns",
            "duration": 30,
            "level": "advanced",
        },
        {
            "title": "Build a REST API with Node & Express",
            "type": "project",
            "provider": "Traversy Media",
            "url": "https://youtube.com/traversymedia-node-api",
            "duration": 8,
            "level": "intermediate",
        },
    ],
    "nodejs": [  # alias
        {
            "title": "The Complete Node.js Developer Course",
            "type": "course",
            "provider": "Udemy",
            "url": "https://udemy.com/the-complete-nodejs-developer-course",
            "duration": 35,
            "level": "beginner",
        },
        {
            "title": "Node.js Design Patterns",
            "type": "book",
            "provider": "Packt",
            "url": "https://packtpub.com/nodejs-design-patterns",
            "duration": 30,
            "level": "advanced",
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
        {
            "title": "Python Data Science Handbook",
            "type": "book",
            "provider": "O'Reilly",
            "url": "https://jakevdp.github.io/PythonDataScienceHandbook",
            "duration": 35,
            "level": "advanced",
        },
    ],
    "sql": [
        {
            "title": "The Complete SQL Bootcamp",
            "type": "course",
            "provider": "Udemy",
            "url": "https://udemy.com/the-complete-sql-bootcamp",
            "duration": 20,
            "level": "beginner",
        },
        {
            "title": "SQL Practice Problems",
            "type": "tutorial",
            "provider": "LeetCode",
            "url": "https://leetcode.com/study-plan/sql",
            "duration": 15,
            "level": "intermediate",
        },
        {
            "title": "High Performance MySQL",
            "type": "book",
            "provider": "O'Reilly",
            "url": "https://oreilly.com/high-performance-mysql",
            "duration": 30,
            "level": "advanced",
        },
    ],
    "git": [
        {
            "title": "Git Complete: The Definitive Guide",
            "type": "course",
            "provider": "Udemy",
            "url": "https://udemy.com/git-complete",
            "duration": 10,
            "level": "beginner",
        },
        {
            "title": "Pro Git Book",
            "type": "book",
            "provider": "Git SCM",
            "url": "https://git-scm.com/book",
            "duration": 15,
            "level": "intermediate",
        },
    ],
    "restapis": [
        {
            "title": "REST API Design, Development & Management",
            "type": "course",
            "provider": "Udemy",
            "url": "https://udemy.com/rest-api",
            "duration": 15,
            "level": "beginner",
        },
        {
            "title": "Build a RESTful API from Scratch",
            "type": "project",
            "provider": "FreeCodeCamp",
            "url": "https://freecodecamp.org/rest-api-project",
            "duration": 12,
            "level": "intermediate",
        },
    ],
    "datastructures": [
        {
            "title": "Data Structures & Algorithms - Complete Course",
            "type": "course",
            "provider": "Udemy",
            "url": "https://udemy.com/data-structures-algorithms",
            "duration": 45,
            "level": "beginner",
        },
        {
            "title": "NeetCode 150 - DSA Problem Set",
            "type": "tutorial",
            "provider": "NeetCode",
            "url": "https://neetcode.io/practice",
            "duration": 60,
            "level": "intermediate",
        },
        {
            "title": "Introduction to Algorithms (CLRS)",
            "type": "book",
            "provider": "MIT Press",
            "url": "https://mitpress.mit.edu/algorithms",
            "duration": 80,
            "level": "advanced",
        },
    ],
    "algorithms": [
        {
            "title": "Algorithms Specialization",
            "type": "course",
            "provider": "Coursera (Stanford)",
            "url": "https://coursera.org/specializations/algorithms",
            "duration": 60,
            "level": "intermediate",
        },
        {
            "title": "LeetCode Problem Practice",
            "type": "tutorial",
            "provider": "LeetCode",
            "url": "https://leetcode.com/problemset",
            "duration": 50,
            "level": "intermediate",
        },
        {
            "title": "Algorithm Design Manual",
            "type": "book",
            "provider": "Springer",
            "url": "https://algorist.com",
            "duration": 40,
            "level": "advanced",
        },
    ],
    "systemdesign": [
        {
            "title": "System Design Fundamentals",
            "type": "course",
            "provider": "Educative",
            "url": "https://educative.io/courses/grokking-system-design",
            "duration": 30,
            "level": "intermediate",
        },
        {
            "title": "System Design Primer",
            "type": "tutorial",
            "provider": "GitHub",
            "url": "https://github.com/donnemartin/system-design-primer",
            "duration": 40,
            "level": "intermediate",
        },
        {
            "title": "Designing Data-Intensive Applications",
            "type": "book",
            "provider": "O'Reilly",
            "url": "https://dataintensive.net",
            "duration": 50,
            "level": "advanced",
        },
    ],
    "machinelearning": [
        {
            "title": "Machine Learning Specialization",
            "type": "course",
            "provider": "Coursera (Stanford)",
            "url": "https://coursera.org/specializations/machine-learning",
            "duration": 80,
            "level": "beginner",
        },
        {
            "title": "Hands-On Machine Learning with Scikit-Learn",
            "type": "book",
            "provider": "O'Reilly",
            "url": "https://oreilly.com/hands-on-ml",
            "duration": 50,
            "level": "intermediate",
        },
        {
            "title": "Kaggle Competitions",
            "type": "project",
            "provider": "Kaggle",
            "url": "https://kaggle.com/competitions",
            "duration": 40,
            "level": "advanced",
        },
    ],
    "cloudcomputing": [
        {
            "title": "AWS Cloud Practitioner Essentials",
            "type": "course",
            "provider": "AWS",
            "url": "https://explore.skillbuilder.aws/learn/course/cloud-practitioner",
            "duration": 20,
            "level": "beginner",
        },
        {
            "title": "Cloud Architecture Patterns",
            "type": "book",
            "provider": "O'Reilly",
            "url": "https://oreilly.com/cloud-architecture",
            "duration": 25,
            "level": "intermediate",
        },
    ],
    "communication": [
        {
            "title": "Effective Communication for Tech Professionals",
            "type": "course",
            "provider": "LinkedIn Learning",
            "url": "https://linkedin.com/learning/communication",
            "duration": 8,
            "level": "beginner",
        },
        {
            "title": "Technical Writing for Engineers",
            "type": "tutorial",
            "provider": "Google",
            "url": "https://developers.google.com/tech-writing",
            "duration": 6,
            "level": "intermediate",
        },
    ],
    "problemsolving": [
        {
            "title": "Think Like a Programmer",
            "type": "book",
            "provider": "No Starch Press",
            "url": "https://nostarch.com/thinklikeaprogrammer",
            "duration": 20,
            "level": "beginner",
        },
        {
            "title": "Competitive Programming Practice",
            "type": "tutorial",
            "provider": "Codeforces",
            "url": "https://codeforces.com/problemset",
            "duration": 40,
            "level": "intermediate",
        },
    ],
    "teamwork": [
        {
            "title": "Teamwork & Collaboration in Tech",
            "type": "course",
            "provider": "LinkedIn Learning",
            "url": "https://linkedin.com/learning/teamwork",
            "duration": 6,
            "level": "beginner",
        },
    ],
    "timemanagement": [
        {
            "title": "Time Management for Developers",
            "type": "course",
            "provider": "Pluralsight",
            "url": "https://pluralsight.com/time-management",
            "duration": 5,
            "level": "beginner",
        },
    ],
    "agilemethodology": [
        {
            "title": "Agile with Atlassian Jira",
            "type": "course",
            "provider": "Coursera",
            "url": "https://coursera.org/learn/agile-atlassian-jira",
            "duration": 12,
            "level": "beginner",
        },
        {
            "title": "Scrum Guide",
            "type": "documentation",
            "provider": "Scrum.org",
            "url": "https://scrumguides.org",
            "duration": 3,
            "level": "beginner",
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
        """Get learning resources for a skill, using flexible matching"""
        # Normalize: lowercase, strip spaces/dots/hyphens
        normalized = skill_name.lower().replace(" ", "").replace(".", "").replace("-", "")
        
        # Exact match on normalized key
        if normalized in LEARNING_RESOURCES:
            return LEARNING_RESOURCES[normalized]
        
        # Check partial/substring matches both directions
        for key in LEARNING_RESOURCES:
            if key == "default":
                continue
            if key in normalized or normalized in key:
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
