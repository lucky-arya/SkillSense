"""
SkillSense AI - Proficiency Predictor Service

Predicts skill proficiency levels from assessment responses using
weighted scoring with explainable components.
"""

from typing import List, Dict, Any
from collections import defaultdict
import numpy as np

from app.config import settings
from app.utils.scoring import (
    calculate_weighted_score,
    calibrate_self_assessment,
    normalize_time_factor,
)


class PredictorService:
    """Service for predicting skill proficiency from assessments"""
    
    def __init__(self):
        self.is_initialized = False
        self.skill_weights: Dict[str, float] = {}
    
    def initialize(self):
        """Initialize the predictor with any pre-trained models or data"""
        # In a full implementation, this would load trained models
        # For now, we use a rule-based scoring system that's explainable
        self.is_initialized = True
        
        # Default skill weights (can be loaded from database)
        self.skill_weights = {
            "default": 1.0,
        }
        
        print("  Predictor service initialized")
    
    def predict_proficiency(
        self, 
        user_id: str, 
        responses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Predict proficiency levels for skills based on assessment responses.
        
        Algorithm:
        1. Group responses by skill
        2. For each skill:
           - Calculate weighted score from correct answers
           - Apply difficulty weighting
           - Factor in response time
           - Calibrate self-assessment responses
        3. Map scores to proficiency levels (1-5)
        4. Calculate confidence based on response count
        
        Args:
            user_id: User identifier
            responses: List of assessment responses
            
        Returns:
            Dictionary with predictions and confidence
        """
        # Group responses by skill
        skill_responses: Dict[str, List[Dict]] = defaultdict(list)
        
        for response in responses:
            skill_id = response.get("skillId")
            if skill_id:
                skill_responses[skill_id].append(response)
        
        predictions = []
        total_confidence = 0.0
        
        for skill_id, skill_resp_list in skill_responses.items():
            prediction = self._predict_skill_proficiency(skill_id, skill_resp_list)
            predictions.append(prediction)
            total_confidence += prediction["confidence"]
        
        # Average confidence across all skills
        avg_confidence = total_confidence / len(predictions) if predictions else 0.0
        
        return {
            "predictions": predictions,
            "confidence": round(avg_confidence, 2),
        }
    
    def _predict_skill_proficiency(
        self, 
        skill_id: str, 
        responses: List[Dict]
    ) -> Dict[str, Any]:
        """
        Predict proficiency for a single skill.
        
        Uses a multi-factor scoring approach:
        - Correctness score (weighted by difficulty)
        - Time efficiency factor
        - Self-assessment calibration
        """
        if not responses:
            return {
                "skillId": skill_id,
                "skillName": "Unknown",
                "proficiencyLevel": 1,
                "confidence": 0.0,
            }
        
        # Separate response types
        objective_responses = []
        self_rating_responses = []
        
        for resp in responses:
            # Determine if it's a self-rating based on answer format
            answer = resp.get("answer", "")
            if isinstance(answer, str) and answer.isdigit() and 1 <= int(answer) <= 5:
                # Likely a self-rating
                self_rating_responses.append(resp)
            else:
                objective_responses.append(resp)
        
        # Calculate objective score
        objective_score = 0.0
        if objective_responses:
            correct_count = sum(1 for r in objective_responses if r.get("isCorrect", False))
            total_count = len(objective_responses)
            
            # Apply difficulty weighting
            weighted_correct = 0.0
            total_weight = 0.0
            
            for resp in objective_responses:
                weight = resp.get("difficultyWeight", 1.0)
                total_weight += weight
                if resp.get("isCorrect", False):
                    weighted_correct += weight
            
            if total_weight > 0:
                objective_score = weighted_correct / total_weight
            
            # Apply time factor (faster correct answers indicate higher proficiency)
            time_factor = self._calculate_time_factor(objective_responses)
            objective_score *= time_factor
        
        # Calculate self-assessment score
        self_rating_score = 0.0
        if self_rating_responses:
            ratings = [int(r.get("answer", 3)) for r in self_rating_responses]
            self_rating_score = np.mean(ratings) / 5.0  # Normalize to 0-1
            
            # Calibrate based on objective performance
            if objective_responses:
                self_rating_score = calibrate_self_assessment(
                    self_rating_score, 
                    objective_score
                )
        
        # Combine scores
        if objective_responses and self_rating_responses:
            # Weight objective higher than self-assessment
            combined_score = 0.7 * objective_score + 0.3 * self_rating_score
        elif objective_responses:
            combined_score = objective_score
        else:
            combined_score = self_rating_score
        
        # Map to proficiency level (1-5)
        proficiency_level = self._score_to_proficiency(combined_score)
        
        # Calculate confidence based on response count
        confidence = self._calculate_confidence(len(responses))
        
        return {
            "skillId": skill_id,
            "skillName": responses[0].get("skillName", skill_id),
            "proficiencyLevel": proficiency_level,
            "confidence": round(confidence, 2),
        }
    
    def _calculate_time_factor(self, responses: List[Dict]) -> float:
        """
        Calculate time efficiency factor.
        
        Faster correct answers suggest higher proficiency.
        """
        if not responses:
            return 1.0
        
        time_factors = []
        for resp in responses:
            time_spent = resp.get("timeSpent", 60)  # Default 60 seconds
            
            # Normalize: fast (< 30s) = boost, slow (> 120s) = penalty
            if time_spent < 30:
                factor = 1.1
            elif time_spent > 120:
                factor = 0.9
            else:
                factor = 1.0
            
            time_factors.append(factor)
        
        return np.mean(time_factors)
    
    def _score_to_proficiency(self, score: float) -> int:
        """
        Map a 0-1 score to proficiency level 1-5.
        
        Thresholds:
        - < 0.2: Novice (1)
        - 0.2-0.4: Beginner (2)
        - 0.4-0.6: Intermediate (3)
        - 0.6-0.8: Advanced (4)
        - > 0.8: Expert (5)
        """
        if score < 0.2:
            return 1
        elif score < 0.4:
            return 2
        elif score < 0.6:
            return 3
        elif score < 0.8:
            return 4
        else:
            return 5
    
    def _calculate_confidence(self, response_count: int) -> float:
        """
        Calculate confidence in prediction based on data availability.
        
        More responses = higher confidence, with diminishing returns.
        """
        # Logistic curve: confidence increases with more responses
        # Asymptotes to ~0.95 with many responses
        min_confidence = 0.5
        max_confidence = 0.95
        steepness = 0.5
        midpoint = 5  # 5 responses for 50% of max confidence
        
        confidence = min_confidence + (max_confidence - min_confidence) / (
            1 + np.exp(-steepness * (response_count - midpoint))
        )
        
        return confidence


# Singleton instance
predictor_service = PredictorService()
