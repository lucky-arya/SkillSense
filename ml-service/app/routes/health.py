"""
SkillSense AI - Health Check Routes
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Service health check endpoint"""
    return {
        "status": "healthy",
        "service": "SkillSense ML Service",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }


@router.get("/health/ready")
async def readiness_check():
    """Readiness probe for orchestration"""
    # Check if models are loaded
    from app.services.predictor import predictor_service
    
    is_ready = predictor_service.is_initialized
    
    return {
        "ready": is_ready,
        "models_loaded": is_ready,
        "timestamp": datetime.utcnow().isoformat(),
    }
