"""
SkillSense AI - Prediction Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime

from app.services.predictor import predictor_service
from app.services.gap_analyzer import gap_analyzer_service

router = APIRouter()


# Request/Response Models
class AssessmentResponse(BaseModel):
    questionId: str
    skillId: str
    answer: Union[str, List[str]]
    timeSpent: int


class ProficiencyPredictionRequest(BaseModel):
    userId: str
    assessmentResponses: List[AssessmentResponse]


class SkillPrediction(BaseModel):
    skillId: str
    skillName: str
    proficiencyLevel: int
    confidence: float


class ProficiencyPredictionResponse(BaseModel):
    predictions: List[SkillPrediction]
    confidence: float


class SkillAssessment(BaseModel):
    skillId: str
    skillName: str
    proficiencyLevel: int
    confidence: float
    assessedAt: datetime
    source: str


class SkillProfile(BaseModel):
    userId: str
    skills: List[SkillAssessment]
    overallScore: float
    lastUpdated: datetime


class GapAnalysisRequest(BaseModel):
    userId: str
    skillProfile: SkillProfile
    targetRoleId: str


class SkillGap(BaseModel):
    skillId: str
    skillName: str
    currentLevel: int
    requiredLevel: int
    gapSize: int
    priority: str
    importance: str
    estimatedTimeToClose: int


class GapAnalysisResponse(BaseModel):
    gaps: List[SkillGap]
    overallReadiness: float
    strengthAreas: List[str]
    improvementAreas: List[str]


@router.post("/predict/proficiency", response_model=ProficiencyPredictionResponse)
async def predict_proficiency(request: ProficiencyPredictionRequest):
    """
    Predict skill proficiency levels from assessment responses.
    
    Uses weighted scoring model considering:
    - Answer correctness
    - Question difficulty
    - Response time
    - Self-assessment calibration
    """
    try:
        predictions = predictor_service.predict_proficiency(
            user_id=request.userId,
            responses=[r.model_dump() for r in request.assessmentResponses]
        )
        
        return ProficiencyPredictionResponse(
            predictions=[SkillPrediction(**p) for p in predictions["predictions"]],
            confidence=predictions["confidence"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/analyze/gaps", response_model=GapAnalysisResponse)
async def analyze_gaps(request: GapAnalysisRequest):
    """
    Analyze skill gaps between user's profile and target role requirements.
    
    Returns:
    - Prioritized list of skill gaps
    - Overall readiness percentage
    - Strength and improvement areas
    """
    try:
        analysis = gap_analyzer_service.analyze_gaps(
            user_id=request.userId,
            skill_profile=request.skillProfile.model_dump(),
            target_role_id=request.targetRoleId
        )
        
        return GapAnalysisResponse(**analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gap analysis failed: {str(e)}")
