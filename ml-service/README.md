# SkillSense ML Service

Python-based Machine Learning microservice for intelligent skill gap analysis.

## Features

- **Proficiency Prediction**: Estimates skill proficiency from assessment responses
- **Gap Analysis**: Intelligent skill gap calculation with priority scoring
- **Recommendations**: Personalized learning path generation
- **Explainable AI**: Interpretable models for transparent scoring

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python -m uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/predict/proficiency` | POST | Predict skill proficiency |
| `/api/v1/analyze/gaps` | POST | Analyze skill gaps |
| `/api/v1/recommend` | POST | Get learning recommendations |

## Architecture

```
ml-service/
├── app/
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Configuration management
│   ├── models/              # ML model definitions
│   │   ├── proficiency.py   # Proficiency prediction model
│   │   └── recommender.py   # Recommendation engine
│   ├── services/            # Business logic services
│   │   ├── gap_analyzer.py  # Gap analysis service
│   │   └── predictor.py     # Prediction orchestration
│   ├── routes/              # API route handlers
│   │   ├── health.py
│   │   ├── prediction.py
│   │   └── recommendation.py
│   └── utils/               # Utility functions
│       └── scoring.py       # Scoring algorithms
├── data/                    # Skill taxonomy & training data
│   └── skill_weights.json
├── saved_models/            # Persisted model artifacts
└── tests/                   # Unit tests
```

## ML Approach

### 1. Proficiency Prediction

Uses a weighted scoring model based on:
- Question difficulty weight
- Response correctness
- Time spent (normalized)
- Self-assessment calibration

### 2. Gap Analysis

Calculates gaps using:
- Euclidean distance in skill space
- Importance-weighted prioritization
- Learning curve estimation

### 3. Recommendations

Combines:
- Content-based filtering (skill similarity)
- Rule-based prioritization (gap severity)
- Time-optimal path planning
