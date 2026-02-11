# SkillSense AI

> Personalized Skill Gap Self-Diagnosis Tool for Students

[![Theme](https://img.shields.io/badge/Theme-Skill%20Intelligence-blue)]()
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Python%20ML-green)]()

## 🎯 Problem Statement

Students often struggle to identify the gap between their current skills and the requirements of their target career. SkillSense AI provides an intelligent, personalized diagnosis that:

1. **Assesses** current skill proficiency through adaptive questioning
2. **Analyzes** skill gaps against target roles using ML
3. **Recommends** personalized learning paths with priority ranking

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React + TW    │────▶│  Node/Express   │────▶│  Python ML      │
│   Frontend      │◀────│  Backend API    │◀────│  Service        │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │    MongoDB      │
                        │   (Mongoose)    │
                        └─────────────────┘
```

## 📁 Project Structure

```
skillsense/
├── client/                 # React + Tailwind frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client services
│   │   ├── context/        # React context providers
│   │   └── utils/          # Helper functions
│   └── public/
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── routes/         # Express route definitions
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic layer
│   │   ├── models/         # Mongoose schemas
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Helper utilities
│   └── config/
├── ml-service/             # Python ML microservice
│   ├── app/
│   │   ├── models/         # ML model definitions
│   │   ├── services/       # Prediction services
│   │   ├── routes/         # FastAPI routes
│   │   └── utils/          # Data processing utilities
│   ├── data/               # Training data & skill taxonomy
│   └── notebooks/          # Jupyter notebooks for exploration
└── shared/                 # Shared types & constants
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd SkillSense

# 2. Copy environment file and configure
cp .env.example .env
# Edit .env with your MongoDB URI and other settings

# 3. Install all dependencies (from root)
npm install

# 4. Install Python dependencies
cd ml-service
pip install -r requirements.txt
cd ..

# 5. Start all services in development mode
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/skillsense

# Server
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Client
VITE_API_URL=http://localhost:5000/api
```

### Running Services Individually

```bash
# Frontend only (http://localhost:5173)
npm run dev:client

# Backend only (http://localhost:5000)
npm run dev:server

# ML Service only (http://localhost:8000)
cd ml-service
uvicorn app.main:app --reload --port 8000
```

### Database Seeding

```bash
# Seed the database with sample skills, roles, and assessments
npm run seed
```

## 🔬 ML Approach

The skill gap analysis uses **explainable ML** over black-box models:

| Component | Method | Why |
|-----------|--------|-----|
| Skill Proficiency | Weighted scoring + calibration | Interpretable scores |
| Gap Analysis | Vector distance in skill space | Visual representation |
| Recommendations | Collaborative filtering + rules | Combines data + domain knowledge |
| Priority Ranking | Multi-criteria decision analysis | Transparent ranking factors |

## 📊 Key Features

- [x] Adaptive skill assessment questionnaire
- [x] Real-time skill gap visualization
- [x] Target role skill requirement mapping
- [x] Personalized learning path generation
- [x] Progress tracking dashboard
- [x] JWT authentication
- [x] Responsive UI with Tailwind CSS

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | Get all skills |
| GET | `/api/skills/:id` | Get skill by ID |
| GET | `/api/skills/category/:category` | Get skills by category |

### Assessments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assessments` | Get available assessments |
| POST | `/api/assessments/:id/start` | Start an assessment |
| POST | `/api/assessments/:id/submit` | Submit assessment answers |
| GET | `/api/assessments/results` | Get past results |

### Gap Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gap-analysis/analyze` | Analyze skill gaps |
| GET | `/api/gap-analysis/latest` | Get latest analysis |
| GET | `/api/gap-analysis/history` | Get analysis history |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | Get learning recommendations |
| GET | `/api/recommendations/skill/:id/resources` | Get resources for skill |

## 🚢 Deployment

### Docker Compose (Recommended)

```bash
# Start all services (MongoDB, backend, ML service, frontend)
docker compose up --build

# Access the app at http://localhost
# API at http://localhost:5000
# ML service at http://localhost:8000
```

### Frontend (Vercel)
```bash
cd client
npm run build
vercel deploy
```

### Backend (Render/Railway)
```bash
# Push to GitHub, connect to Render/Railway
# Set environment variables in dashboard
```

### ML Service (Render/Railway)
```bash
# Deploy as Python web service
# Entry point: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 🛠️ Development

### Tech Stack
- **Frontend:** React 18, Tailwind CSS, Recharts, React Router
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **ML Service:** Python, FastAPI, scikit-learn
- **Auth:** JWT with bcrypt password hashing

### Code Quality
```bash
# Lint frontend
cd client && npm run lint

# Lint backend
cd server && npm run lint
```

### Testing
```bash
# Backend unit tests (Jest)
cd server && npm test

# ML service tests (pytest)
cd ml-service && python -m pytest tests/ -v
```

## 📄 License

MIT License - Built for SkillSense AIMIT License - Built for Hackathon