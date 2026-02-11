"""
SkillSense AI - Scoring Utilities

Helper functions for score calculation and calibration.
"""

import numpy as np
from typing import List


def calculate_weighted_score(
    scores: List[float], 
    weights: List[float]
) -> float:
    """
    Calculate weighted average score.
    
    Args:
        scores: List of individual scores (0-1)
        weights: List of weights for each score
        
    Returns:
        Weighted average score (0-1)
    """
    if not scores or not weights:
        return 0.0
    
    if len(scores) != len(weights):
        raise ValueError("Scores and weights must have the same length")
    
    total_weight = sum(weights)
    if total_weight == 0:
        return 0.0
    
    weighted_sum = sum(s * w for s, w in zip(scores, weights))
    return weighted_sum / total_weight


def calibrate_self_assessment(
    self_rating: float, 
    objective_score: float,
    calibration_factor: float = 0.3
) -> float:
    """
    Calibrate self-assessment score based on objective performance.
    
    Self-assessments tend to be biased (often overconfident).
    This function adjusts the self-rating towards objective truth.
    
    Args:
        self_rating: Self-reported rating (0-1)
        objective_score: Objective test score (0-1)
        calibration_factor: How much to adjust (0-1)
        
    Returns:
        Calibrated self-rating (0-1)
    """
    # Calculate adjustment
    difference = objective_score - self_rating
    adjustment = difference * calibration_factor
    
    # Apply adjustment
    calibrated = self_rating + adjustment
    
    # Clamp to valid range
    return max(0.0, min(1.0, calibrated))


def normalize_time_factor(
    time_spent: int,
    expected_time: int = 60,
    min_factor: float = 0.8,
    max_factor: float = 1.2
) -> float:
    """
    Normalize time spent into a scoring factor.
    
    Faster responses (for correct answers) indicate higher proficiency.
    
    Args:
        time_spent: Actual time spent in seconds
        expected_time: Expected time for the question
        min_factor: Minimum factor (for slow responses)
        max_factor: Maximum factor (for fast responses)
        
    Returns:
        Time factor to multiply with score
    """
    if time_spent <= 0:
        return 1.0
    
    ratio = expected_time / time_spent
    
    # Clamp the ratio
    factor = min(max_factor, max(min_factor, ratio))
    
    return factor


def calculate_confidence_interval(
    scores: List[float],
    confidence_level: float = 0.95
) -> tuple:
    """
    Calculate confidence interval for a set of scores.
    
    Uses t-distribution for small samples.
    
    Args:
        scores: List of scores
        confidence_level: Confidence level (default 95%)
        
    Returns:
        Tuple of (lower_bound, upper_bound, mean)
    """
    if len(scores) < 2:
        mean = scores[0] if scores else 0
        return (mean, mean, mean)
    
    arr = np.array(scores)
    mean = np.mean(arr)
    std = np.std(arr, ddof=1)
    n = len(arr)
    
    # Standard error
    se = std / np.sqrt(n)
    
    # Use approximate z-value for 95% confidence
    # (in production, use scipy.stats.t.ppf for exact t-value)
    z = 1.96 if confidence_level == 0.95 else 1.645
    
    margin = z * se
    
    return (mean - margin, mean + margin, mean)


def skill_similarity(
    skill1_embedding: List[float],
    skill2_embedding: List[float]
) -> float:
    """
    Calculate similarity between two skill embeddings.
    
    Uses cosine similarity.
    
    Args:
        skill1_embedding: Embedding vector for skill 1
        skill2_embedding: Embedding vector for skill 2
        
    Returns:
        Similarity score (0-1)
    """
    if not skill1_embedding or not skill2_embedding:
        return 0.0
    
    if len(skill1_embedding) != len(skill2_embedding):
        return 0.0
    
    v1 = np.array(skill1_embedding)
    v2 = np.array(skill2_embedding)
    
    dot_product = np.dot(v1, v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    similarity = dot_product / (norm1 * norm2)
    
    # Ensure result is in valid range
    return max(0.0, min(1.0, similarity))
