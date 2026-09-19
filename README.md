# Yaduk — AI-Powered Project Discovery & Architecture Blueprint Engine

> **Yaduk** *(noun, Sanskrit / Indic root)*: Focused strategic guidance and purposeful execution.  
> Yaduk serves as an intelligent architect and mentor for engineering students, transforming raw curiosity, technical skills, and constraints into verified, production-grade final-year and flagship capstone projects.

[![AWS Cloud Deployment](https://img.shields.io/badge/AWS%20Cloud-App%20Runner%20%7C%20Amplify%20%7C%20RDS-orange?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TanStack-61DAFB?style=for-the-badge&logo=react)](https://tanstack.com)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)

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
│ Backend Microservice │ AWS App Runner / Amazon ECS Fargate (Containerized FastAPI Service)      │
│ Database Persistence │ Amazon RDS (PostgreSQL) Multi-AZ Managed Relational Database             │
│ Artifact & Code Zip  │ Amazon S3 Secure Storage Bucket (Generated Architecture Packages)         │
│ AI & Agent Engine    │ Amazon Bedrock / OpenAI-Compatible AI Gateway Router                     │
│ Monitoring & Health  │ Amazon CloudWatch Metrics, Alarms, and Container Health Probes           │
└──────────────────────┴──────────────────────────────────────────────────────────────────────────┘
```

- **Live Web Frontend**: Automated deployment via **AWS Amplify Hosting** backed by **Amazon CloudFront** edge distribution for low-latency delivery.
- **High-Throughput Backend**: Containerized Python microservice orchestrated on **AWS App Runner** with built-in auto-scaling, SSL termination, and health check endpoints.
- **Relational Data**: Managed **Amazon RDS PostgreSQL** instance providing persistent storage for student profiles, feasibility reports, and generated blueprints.
- **Storage & Forge**: Blueprint downloads and codebase packages served directly from **Amazon S3**.

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

## 🏛️ About Yaduk
**Yaduk** is an independent, developer-first systems engineering platform dedicated to democratizing access to senior-level software architecture, feasibility validation, and interactive mentorship for engineering students and creators worldwide.
