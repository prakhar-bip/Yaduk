# Yaduk — AI-Powered Project Discovery & Architecture Blueprint Engine

> **Yaduk** *(noun, Sanskrit / Indic root)*: Focused strategic guidance and purposeful execution.  
> Yaduk serves as an intelligent architect and mentor for engineering students, transforming raw curiosity, technical skills, and constraints into verified, production-grade final-year and flagship capstone projects.

[![AWS Cloud Deployment](https://img.shields.io/badge/AWS%20Cloud-Bedrock%20%7C%20S3%20%7C%20CloudWatch%20%7C%20RDS%20%7C%20App%20Runner%20%7C%20Amplify-orange?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com)
[![Infrastructure as Code](https://img.shields.io/badge/IaC-CloudFormation%20SAM-232F3E?style=for-the-badge&logo=amazon-aws)](template.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TanStack-61DAFB?style=for-the-badge&logo=react)](https://tanstack.com)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Tests](https://img.shields.io/badge/Tests-Pytest%20%7C%20httpx-4B8BBE?style=for-the-badge&logo=pytest)](backend/tests/)

---

## 🚀 Cloud Production Architecture (AWS Live Deployment)

Yaduk is engineered as a cloud-native platform deployed directly on **Amazon Web Services (AWS)** to provide a persistent, highly-available live application:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AWS PRODUCTION ARCHITECTURE                                     │
├──────────────────────┬──────────────────────────────────────────────────────────────────────────┤
│ COMPONENT            │ AWS SERVICE & SPECIFICATION                                              │
├──────────────────────┼──────────────────────────────────────────────────────────────────────────┤
│ Frontend Web App     │ AWS Amplify Hosting + Amazon CloudFront Global CDN (Edge SSR)            │
│ Backend Microservice │ AWS App Runner (Containerized FastAPI with Auto-Scaling & SSL)           │
│ Database Persistence │ Amazon RDS (PostgreSQL) Managed Relational Database                      │
│ AI & Agent Engine    │ Amazon Bedrock (Claude 3.5) + Groq + NVIDIA NIM Multi-Tier Fallback     │
│ Artifact Storage     │ Amazon S3 (Blueprint JSON & Codebase ZIP with Presigned URLs)           │
│ Observability        │ Amazon CloudWatch Custom Metrics, Dashboards & Alarms                    │
│ Infrastructure Code  │ AWS CloudFormation / SAM (template.yaml) — Full IaC                     │
│ Rate Limiting        │ slowapi (in-memory) with configurable per-endpoint throttling            │
│ DB Migrations        │ Alembic (versioned schema migrations for PostgreSQL)                     │
└──────────────────────┴──────────────────────────────────────────────────────────────────────────┘
```

### AWS Services Deep Integration

| AWS Service | How Yaduk Uses It | Code Reference |
|:---|:---|:---|
| **Amazon Bedrock** | Primary AI inference via Converse API (Claude 3.5 Sonnet). Task-aware routing with deep/fast modes. | `backend/app/services/ai_service.py` |
| **Amazon S3** | Stores generated blueprints as JSON and codebase packages as ZIP. Presigned URLs for secure time-limited downloads. | `backend/app/services/s3_service.py` |
| **Amazon CloudWatch** | Publishes custom metrics per AI invocation: latency, count, error rate by model tier. Pre-built monitoring dashboard. | `backend/app/services/cloudwatch_service.py` |
| **Amazon RDS** | Managed PostgreSQL for students, projects, blueprints, and mentor conversations. Alembic-managed migrations. | `backend/alembic/` |
| **AWS App Runner** | Auto-scaling containerized deployment with health checks. | `apprunner.yaml`, `backend/Dockerfile` |
| **AWS Amplify** | Automated CI/CD frontend deployment with CloudFront CDN. | `amplify.yml` |
| **AWS CloudFormation** | Complete infrastructure-as-code: VPC, RDS, S3, IAM, CloudWatch Dashboard, Alarms. | `template.yaml` |

---

## 🌟 11-Step Project Intelligence Workflow

1. **Student Discovery**: Interactive questionnaire capturing engineering branch, programming languages, frameworks, domain interests, time budget, and career goals.
2. **Dynamic Student Profile**: Generates an actionable, multi-faceted profile highlighting technical strengths, gaps, and feasibility boundaries.
3. **Personalized Idea Generation**: Produces 3–4 tailored project ideas with concrete problem statements, innovation angles, target users, and difficulty tiers.
4. **Multi-Dimensional Compatibility Scoring**: Real-time evaluation across Skill Match, Interest Alignment, Feasibility, Career Value, and Time Constraints.
5. **Interactive Idea Refinement**: Students can provide natural feedback (*"make it more scalable"*, *"add IoT layer"*, *"switch to Go"*) to dynamically regenerate ideas.
6. **Feasibility Reality Check**: Analyzes student timeline and knowledge gaps, offering an honest verdict, identified risks, and tailored learning paths.
7. **Direction Lock-in**: Selects the winning project direction for deep system architecture generation.
8. **Senior AI Systems Architect**: Context-aware AI architect designs a comprehensive production blueprint.
9. **Comprehensive 8-Phase Engineering Blueprint**:
   - Executive Problem Statement & Core Objectives
   - Minimum Viable Product (MVP) vs Future Scope
   - Complete Justified Tech Stack Breakdown
   - System Architecture, Data Flow & Component Schema
   - 8-Phase Step-by-Step Implementation Roadmap
   - Edge Cases, Technical Pitfalls & Mitigation Strategies
10. **Interactive Yaduk AI Mentor**: Context-injected real-time chat mentor answering doubts, viva exam prep, and implementation hurdles.
11. **Codebase Manifestation & GitHub Repo Forge**: Interactive prototype sandbox with theme switching, code preview, and 1-click export to GitHub via the Yaduk Repo Forge.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, TanStack Start & TanStack Router, Tailwind CSS, Lucide Icons |
| **Backend API** | Python 3.12+, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn, slowapi |
| **Database** | PostgreSQL (Amazon RDS), Alembic Migrations |
| **AI Layer** | Multi-Agent Orchestration Engine: AWS Bedrock → Groq → NVIDIA NIM |
| **AWS Cloud** | Bedrock, S3, CloudWatch, RDS, App Runner, Amplify, CloudFormation |
| **Observability** | CloudWatch Custom Metrics & Dashboard, Activity Logging |
| **Testing** | Pytest, httpx, TestClient |

---

## 🏁 Quick Start Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 20+ and npm / bun
- Git
- PostgreSQL (local or Amazon RDS)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows (or source venv/bin/activate on macOS/Linux)

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials (AWS, database, etc.)

# Run database migrations
alembic upgrade head

# Run development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite / TanStack development server
npm run dev
```
Open your browser at `http://localhost:3000` (or `http://localhost:5173`).

### 4. Running Tests
```bash
cd backend
pytest tests/ -v --tb=short
```

---

## ☁️ Infrastructure as Code

Deploy the complete Yaduk infrastructure stack with a single CloudFormation command:

```bash
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name yaduk-production \
  --parameter-overrides \
    DBMasterUsername=yaduk_admin \
    DBMasterPassword=YourSecurePassword123 \
    S3BucketName=yaduk-artifacts \
  --capabilities CAPABILITY_NAMED_IAM
```

The [`template.yaml`](template.yaml) provisions:
- VPC with subnets and security groups
- Amazon RDS PostgreSQL instance
- Amazon S3 artifact bucket with lifecycle policies
- IAM execution role (Bedrock + S3 + CloudWatch permissions)
- CloudWatch dashboard with AI agent metrics
- CloudWatch alarm for high error rates

---

## 📊 Observability & Monitoring

Yaduk publishes custom CloudWatch metrics for every AI agent invocation:

| Metric | Description |
|:---|:---|
| `InvocationLatencyMs` | End-to-end AI response time per model tier |
| `InvocationCount` | Total invocations by agent, tier, and task type |
| `ErrorCount` | Failed invocations (cascaded through all tiers) |
| `ProfileCreated` | Student profile creation events |
| `BlueprintGenerated` | Blueprint generation completions |

Access the pre-built dashboard: **CloudWatch → Dashboards → Yaduk-AI-Agent-Metrics**

---

## 🏛️ About Yaduk
**Yaduk** is an independent, developer-first systems engineering platform dedicated to democratizing access to senior-level software architecture, feasibility validation, and interactive mentorship for engineering students and creators worldwide.
