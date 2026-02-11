"""
SkillSense AI - Services Package
"""

from app.services.predictor import predictor_service
from app.services.gap_analyzer import gap_analyzer_service
from app.services.recommender import recommender_service

__all__ = ["predictor_service", "gap_analyzer_service", "recommender_service"]
