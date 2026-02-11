"""
SkillSense AI - ML Service Entry Point

FastAPI application for skill gap analysis and recommendations
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, prediction, recommendation

# Create FastAPI application
app = FastAPI(
    title="SkillSense ML Service",
    description="Machine Learning microservice for skill gap analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(prediction.router, prefix="/api/v1", tags=["Prediction"])
app.include_router(recommendation.router, prefix="/api/v1", tags=["Recommendation"])


@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup"""
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║              SkillSense ML Service Starting               ║")
    print("╠═══════════════════════════════════════════════════════════╣")
    print(f"║  Environment: {settings.environment:<43}║")
    print(f"║  Port: {settings.port:<50}║")
    print("╚═══════════════════════════════════════════════════════════╝")
    
    # Pre-load models
    from app.services.predictor import predictor_service
    predictor_service.initialize()
    print("✓ ML models initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("ML Service shutting down...")
