"""
SkillSense AI - ML Service Configuration
"""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment"""
    
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_prefix="ML_",
        extra="ignore",
    )

    # Server
    environment: str = "development"
    port: int = 8000
    debug: bool = True
    
    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:5000"]
    
    # ML Model paths
    model_path: str = "saved_models"
    
    # Scoring thresholds
    confidence_threshold: float = 0.7
    gap_critical_threshold: int = 3
    gap_high_threshold: int = 2
    
    # Learning time estimates (hours per level)
    hours_per_level: int = 20


settings = Settings()
