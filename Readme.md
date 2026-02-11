# SkillSense AI 🧠

> **AI-Powered Career Intelligence Platform** — Diagnose skill gaps, ace interviews, and land your dream role.

[![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react)]()
[![Stack](https://img.shields.io/badge/Express-4-000000?logo=express)]()
[![Stack](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)]()
[![Stack](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)]()
[![AI](https://img.shields.io/badge/Groq-AI-F55036?logo=data:image/svg+xml;base64,)]()
[![Stack](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)]()

---

## ✨ What Makes SkillSense Different

| | SkillSense AI | Typical Resume Tools |
|--|---|---|
| **Architecture** | 3 microservices (Express + FastAPI + React) | Monolithic app |
| **AI** | Groq LLaMA 3.3 70B + LLaMA 3.1 8B + custom ML engine | Single API calls |
| **Resume Analysis** | ATS scoring + roast mode + keyword extraction | Basic review |
| **Mock Interviews** | Voice-enabled AI interviews with TTS/STT | Text-only or none |
| **Career Roadmap** | Personalized phased timeline with projects & resources | Generic advice |
| **Skill Analysis** | ML-powered gap detection across 17 categories, 5+ roles | Self-reported |
| **Deployment** | Docker Compose → one command | Manual setup |
| **Testing** | 34 automated tests (Jest + pytest) | None |

---

## 🎯 Core Features

### 📊 Skill Assessment & Gap Analysis
- Adaptive questionnaire engine with real-time scoring
- ML-powered gap detection (weighted scoring + calibration)
- Visual radar charts and progress tracking
- Persisted results in MongoDB with history and trends

### 📄 AI Resume Analyzer
- **Rank Mode**: ATS compatibility score (0-100), strength/weakness breakdown, missing keyword detection
- **Roast Mode 🔥**: Brutally honest AI roasts with meme verdicts and improvement tips
- Drag-and-drop PDF/TXT upload with pdf-parse text extraction

### 🎤 AI Mock Interview
- Voice-enabled interviews using Web Speech API (STT) + SpeechSynthesis (TTS)
- Dynamic question generation based on role, difficulty, and focus area
- Real-time chat UI with typing indicators
- Comprehensive evaluation: Technical, Communication, Soft Skills scores + question-by-question feedback

### 🗺️ AI Career Roadmap
- Personalized phased learning timeline (Beginner → Expert)
- Each phase includes: skills to learn, projects to build, resources, milestones
- Interactive expandable timeline visualization
- Adapts to current skills and experience level

### 🤖 AI Career Coach (Chat)
- Persistent conversation with Groq-powered LLaMA AI
- Markdown-rendered responses with typing animation
- Quick action buttons for common career queries
- Context-aware career guidance

### 🎯 AI-Powered Personalized Assessment *(NEW)*
- Collects target role, experience level, current skills, and focus areas
- AI generates 10 tailored questions (MCQ + scenario-based + self-rating)
- Adaptive difficulty calibrated to experience level
- Powered by LLaMA 3.3 70B via Groq

### 📈 Dashboard & Recommendations
- Skill progress dashboard with Recharts visualizations
- ML-curated learning resource recommendations across 17 skill categories
- Target role mapping for 5+ career paths

---

## 🏗️ Architecture

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   React 18 + TW   │────▶│  Express + TS     │────▶│  FastAPI (Python) │
│   Vite + Framer   │◀────│  Groq AI SDK      │◀────│  ML Engine        │
│   Radix UI        │     │  Multer + PDF     │     │  5 Roles / 17 Cat │
└───────────────────┘     └────────┬──────────┘     └───────────────────┘
     Port 5173                     │ Port 5000           Port 8000
                          ┌────────▼──────────┐
                          │    MongoDB 7      │
                          │   (Mongoose ODM)  │
                          └───────────────────┘
```

### Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Radix UI, Recharts, React Markdown |
| **Backend** | Node.js, Express 4, TypeScript, Mongoose, Zod validation, JWT auth, Multer, pdf-parse |
| **AI Engine** | Groq (`groq-sdk`) — LLaMA 3.3 70B Versatile (analysis/roadmaps) + LLaMA 3.1 8B Instant (chat/quick), JSON mode, tiered model routing |
| **ML Service** | Python 3, FastAPI, scikit-learn, weighted scoring + collaborative filtering |
| **Database** | MongoDB 7 with Mongoose ODM |
| **DevOps** | Docker, docker-compose, nginx reverse proxy, npm workspaces |
| **Testing** | Jest 30 (21 tests), pytest (13 tests) |

---

## 📁 Project Structure

```
skillsense/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx            # Dark-themed animated landing
│   │   │   ├── Dashboard.tsx          # Skill progress dashboard
│   │   │   ├── Assessment.tsx         # Adaptive skill assessment
│   │   │   ├── GapAnalysis.tsx        # ML gap visualization
│   │   │   ├── Recommendations.tsx    # Curated learning paths
│   │   │   ├── ResumeAnalyzer.tsx     # AI resume rank + roast
│   │   │   ├── MockInterview.tsx      # Voice-enabled AI interview
│   │   │   ├── CareerRoadmap.tsx      # AI career timeline
│   │   │   └── AIChat.tsx             # AI career coach chat
│   │   ├── components/layout/         # Sidebar, Navbar, Layout
│   │   ├── services/api/              # Typed API clients
│   │   └── context/                   # Auth context
│   └── Dockerfile
├── server/                    # Express API + AI
│   ├── src/
│   │   ├── routes/                    # REST routes (auth, skills, ai, etc.)
│   │   ├── controllers/               # Request handlers
│   │   ├── services/
│   │   │   ├── ai.service.ts          # Groq AI wrapper (9 methods, tiered models)
│   │   │   └── gapAnalysis.service.ts # ML bridge + MongoDB persistence
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT authentication
│   │   │   └── upload.ts              # Multer file upload
│   │   ├── models/                    # Mongoose schemas
│   │   └── __tests__/                 # Jest test suites
│   └── Dockerfile
├── ml-service/                # Python ML microservice
│   ├── app/services/
│   │   ├── gap_analyzer.py            # Weighted skill gap scoring
│   │   └── recommender.py             # Learning resource recommender
│   ├── tests/                         # pytest test suites
│   └── Dockerfile
├── shared/                    # Shared TypeScript types
├── docker-compose.yml         # One-command deployment
└── .env.example               # Environment template
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Groq API Key ([get one free](https://console.groq.com/keys))

### Installation

```bash
# 1. Clone
git clone https://github.com/lucky-arya/SkillSense.git
cd SkillSense

# 2. Configure environment
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT_SECRET, GROQ_API_KEY

# 3. Install all dependencies (npm workspaces)
npm install

# 4. Install Python dependencies
cd ml-service && pip install -r requirements.txt && cd ..

# 5. Start all 3 services
npm run dev
```

### Environment Variables

```env
# Required
MONGODB_URI=mongodb://localhost:27017/skillsense
JWT_SECRET=your-secret-key
GROQ_API_KEY=your-groq-api-key            # Powers all AI features (LLaMA 3.3 70B + 3.1 8B)

# Optional
PORT=5000
ML_SERVICE_URL=http://localhost:8000
VITE_API_URL=http://localhost:5000/api/v1
```

### Running Individual Services

```bash
npm run dev:client    # Frontend → http://localhost:5173
npm run dev:server    # Backend  → http://localhost:5000
cd ml-service && uvicorn app.main:app --reload --port 8000  # ML → :8000
```

---

## 🐳 Docker Deployment (One Command)

```bash
# Set your Groq API key
export GROQ_API_KEY=your-key-here

# Launch everything
docker compose up --build

# Access:
#   App      → http://localhost
#   API      → http://localhost:5000
#   ML       → http://localhost:8000
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Current user |

### AI Features (🔒 Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/resume/analyze` | ATS score + analysis (PDF upload) |
| POST | `/api/v1/ai/resume/roast` | Resume roast mode 🔥 (PDF upload) |
| POST | `/api/v1/ai/resume/extract-skills` | Extract skills from resume |
| POST | `/api/v1/ai/interview/start` | Generate interview questions |
| POST | `/api/v1/ai/interview/evaluate-answer` | Evaluate single answer |
| POST | `/api/v1/ai/interview/evaluate` | Full interview evaluation |
| POST | `/api/v1/ai/roadmap/generate` | Generate career roadmap |
| POST | `/api/v1/ai/chat` | AI career coach chat |
| POST | `/api/v1/ai/assessment/generate` | AI personalized assessment generation |

### Skills & Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/skills` | List all skills |
| POST | `/api/v1/gap-analysis/analyze` | Run ML gap analysis |
| GET | `/api/v1/gap-analysis/latest` | Latest analysis result |
| GET | `/api/v1/recommendations` | ML learning recommendations |

---

## 🧪 Testing

```bash
# Backend tests (Jest — 21 tests)
cd server && npm test

# ML service tests (pytest — 13 tests)
cd ml-service && python -m pytest tests/ -v

# All tests pass ✅
```

---

## 🔬 ML Approach

| Component | Method | Why |
|-----------|--------|-----|
| Skill Proficiency | Weighted scoring + calibration | Interpretable scores |
| Gap Analysis | Vector distance in skill space | Visual representation |
| Recommendations | Collaborative filtering + rules | Data + domain knowledge |
| Priority Ranking | Multi-criteria decision analysis | Transparent ranking |

The ML service covers **5 target roles** (Frontend, Backend, Full Stack, Data Scientist, ML Engineer) across **17 skill categories** with individually tuned resource recommendations.

---

## 📄 License

MIT License — Built for Hackathon 🏆