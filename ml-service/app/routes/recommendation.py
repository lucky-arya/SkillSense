"""
SkillSense AI - Recommendation Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.services.recommender import recommender_service

router = APIRouter()


class GapInfo(BaseModel):
    skillId: str
    skillName: str
    gapSize: int
    priority: str


class RecommendationRequest(BaseModel):
    userId: str
    gaps: List[GapInfo]


class LearningRecommendation(BaseModel):
    skillId: str
    skillName: str
    resourceType: str
    title: str
    description: str
    url: str
    provider: str
    estimatedDuration: int
    priority: int


class RecommendationResponse(BaseModel):
    recommendations: List[LearningRecommendation]


@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Generate personalized learning recommendations based on skill gaps.
    
    Combines:
    - Content-based filtering for relevant resources
    - Rule-based prioritization for gap severity
    - Time-optimal path planning
    """
    try:
        recommendations = recommender_service.generate_recommendations(
            user_id=request.userId,
            gaps=[g.model_dump() for g in request.gaps]
        )
        
        return RecommendationResponse(
            recommendations=[LearningRecommendation(**r) for r in recommendations]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Recommendation generation failed: {str(e)}"
        )
