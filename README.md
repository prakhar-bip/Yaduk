# Yaduk (by Yaduka) — AI-Powered Project Discovery & Architecture Blueprint Engine

> **Yaduk** *(noun, Sanskrit / Indic root)*: Focused strategic guidance and purposeful execution.  
> Under the **Yaduka** ecosystem, Yaduk serves as the intelligent architect and mentor for engineering students, transforming raw curiosity, skills, and constraints into verified, production-grade final-year and hackathon capstone projects.

[![AWS Hackathon Track](https://img.shields.io/badge/AWS%20Hackathon-Track%202%3A%20SHIP%20IT%20%2B%20Track%201%3A%20BUILD%20IT-orange?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TanStack-61DAFB?style=for-the-badge&logo=react)](https://tanstack.com)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)

---

## 🚀 Hackathon Track Alignment: Dual-Track Architecture

Yaduk was engineered to compete directly in the **AWS Hackathon**, adopting the dual-track matrix:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   TWO MAIN TRACKS TO BUILD                                      │
├──────────────────────┬────────────────────────────────────┬─────────────────────────────────────┤
│ WHAT YOU NEED        │ BUILD IT (Open Source, Local)      │ SHIP IT (Deployed, With a URL)      │
│                      │ "No AWS account, no card, no bill" │ "Free tier: up to $200 in credits" │
├──────────────────────┼────────────────────────────────────┼─────────────────────────────────────┤
│ Agents and AI        │ Local AI Inference, Strands SDK    │ SageMaker AI Orchestration Router   │
│ Containers & K8s     │ Finch, Docker Container Engine     │ AWS App Runner, ECS Fargate         │
│ Web & Hosting        │ Local TanStack / Vite Server       │ AWS Amplify Hosting, CloudFront CDN │
│ Data & Search        │ OpenSearch, Local PostgreSQL       │ Amazon RDS PostgreSQL, Amazon S3    │
│ Auth and Policy      │ Cedar Policy Language              │ Amazon Cognito / JWT Auth           │
│ The Plumbing         │ Local Bridge Networking            │ CloudWatch, Route 53, EventBridge   │
└──────────────────────┴────────────────────────────────────┴─────────────────────────────────────┘
```

### 1. Primary Track: **SHIP IT (Deployed, with a URL)**
- **Web Frontend**: Automated CI/CD deployment on **AWS Amplify Hosting** with global edge acceleration via **Amazon CloudFront**.
- **Backend API**: Containerized microservice running on **AWS App Runner** / **AWS ECS Fargate** with auto-scaling and health probes.
- **Relational Data**: Production persistence with **Amazon RDS (PostgreSQL)**.
- **Artifact Storage**: Blueprint exports and packaged starter codebases stored in **Amazon S3**.
- **User Authentication**: Secure token authentication with **Amazon Cognito** / JWT token sessions.

### 2. Dual-Mode Track: **BUILD IT (Open Source, On Your Machine)**
- Runs 100% locally with zero cloud subscription fees or credit card requirements.
- Uses **Finch** (AWS's open-source container engine) and Docker for lightweight local containerization.
- Fine-grained project authorization rules specified with **Cedar** policies.
- Fast vector similarity and keyword search for 100+ project ideas using **OpenSearch**.

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
| **Backend API** | Python 3.12+, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn |
| **Database** | PostgreSQL (Amazon RDS / Supabase Cloud compatible) |
| **AI Layer** | Multi-Agent Orchestration Engine with Zero-Cost High-Throughput Inference |
| **Cloud & DevOps** | AWS Amplify Hosting, AWS App Runner, Docker, Finch, GitHub Actions |

---

## 🏁 Quick Start Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 20+ and npm / bun
- Git

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows (or source venv/bin/activate on macOS/Linux)

# Install dependencies
pip install -r requirements.txt

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

---

## 🏛️ Ecosystem: Yaduka
**Yaduk** is crafted under the **Yaduka** banner for the 2026 hackathon season, democratizing access to senior-level software architecture and project planning for students worldwide.
