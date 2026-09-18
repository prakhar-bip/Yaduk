import type {
  Blueprint,
  Feasibility,
  JourneyState,
  ProjectIdea,
  PrototypeData,
  ProductionCodebase,
  Stage,
  StudentProfile,
} from "./types";

export const SAMPLE_PROFILE: StudentProfile = {
  name: "Anya Sharma",
  fieldOfStudy: "Computer Science & Engineering",
  yearOfStudy: "3rd Year (Class of 2026)",
  skills: ["React", "Python", "PyTorch", "SQL", "FastAPI", "TypeScript", "Tailwind CSS"],
  languages: ["TypeScript", "Python", "JavaScript", "SQL"],
  frameworks: ["React", "FastAPI", "PyTorch", "Tailwind CSS"],
  aiKnowledge: "Intermediate - fine-tuning LLMs, embeddings & LangChain",
  previousProjects: "Automated Student Attendance via OpenCV; Multi-modal semantic document parser.",
  experienceLevel: "Intermediate",
  interests: ["Artificial Intelligence", "Full-Stack Development", "Fintech Systems"],
  domains: ["AI & ML", "Fintech", "Developer Tools", "Data Science"],
  careerGoal: "AI Systems Engineer / Full-Stack Product Architect",
  projectType: "Full-Stack Production System with ML Pipeline",
  hoursPerWeek: 20,
  weeks: 12,
  teamSize: "Individual / Pair",
  resources: ["GitHub", "HuggingFace", "PostgreSQL", "Docker", "Vercel"],
  complexity: "Production-grade Capstone",
  ownIdeas: "An intelligent platform that parses complex resumes, verifies technical GitHub repos, and evaluates architectural fit.",
  summary:
    "Anya demonstrates strong proficiency across modern full-stack development and applied machine learning. Her balance of React and Python enables rapid prototyping of AI-native SaaS solutions.",
  strengths: [
    "Proficient full-stack development with React & FastAPI",
    "Applied NLP & semantic retrieval experience",
    "High weekly commitment (20 hrs/week)",
  ],
  watchOuts: [
    "Avoid overcomplicating initial distributed deployment",
    "Focus on test coverage and schema consistency before adding multiple models",
  ],
};

export const SAMPLE_IDEAS: ProjectIdea[] = [
  {
    id: "idea-1",
    name: "AI-Powered Technical Skill & Resume Screener",
    tagline: "Autonomous candidate architecture evaluator with verifiable GitHub proof-of-work",
    problem:
      "Engineering recruiters and hiring leads drown in thousands of boilerplate resumes, leading to high bias, missed high-potential students, and hours lost to manual technical screening.",
    solution:
      "A multi-stage screening pipeline that extracts technical competencies, validates public code repositories using AST parsing, and generates benchmark scorecards with explainable AI rationales.",
    targetUsers: "Campus recruiters, tech leads, university placement cells",
    difficulty: "Medium-High",
    estimatedTime: "8-10 Weeks",
    requiredSkills: ["FastAPI", "React", "PostgreSQL", "PyTorch / Transformers", "Tailwind"],
    match: {
      skill: 96,
      interest: 98,
      feasibility: 92,
      career: 97,
      portfolio: 95,
      time: 90,
    },
    overall: 98,
    why: "Perfect convergence with your target role of AI Systems Engineer and your experience in FastAPI and React.",
    rarity: "epic",
  },
  {
    id: "idea-2",
    name: "Edge Sentinel: Real-Time Drone Telemetry & Defect Pipeline",
    tagline: "Ultra-low latency computer vision inference at the industrial edge",
    problem:
      "Industrial field inspections rely on human surveyors in hazardous environments or delayed cloud video uploads with extreme bandwidth costs.",
    solution:
      "A lightweight edge-computed vision pipeline that performs on-device defect segmentation, queues telemetry over MQTT, and streams alerts to a central dashboard.",
    targetUsers: "Renewable energy operators, structural engineers, pipeline inspectors",
    difficulty: "High",
    estimatedTime: "10-12 Weeks",
    requiredSkills: ["Python", "PyTorch", "WebSockets", "Docker", "React"],
    match: {
      skill: 88,
      interest: 92,
      feasibility: 85,
      career: 90,
      portfolio: 96,
      time: 84,
    },
    overall: 91,
    why: "High-impact systems project that will distinguish your portfolio for systems and AI hardware roles.",
    rarity: "rare",
  },
  {
    id: "idea-3",
    name: "FinPulse: Micro-Transaction Fraud Anomaly Streamer",
    tagline: "Graph neural network streaming engine for real-time fintech risk scoring",
    problem:
      "Sophisticated fraud rings exploit high-frequency payment gateways before batch reconciliation detects coordinated transactions.",
    solution:
      "High-throughput transactional graph analytics engine with sub-50ms inference latency and audit-ready explainability logs.",
    targetUsers: "Fintech startups, payment gateways, risk assessment officers",
    difficulty: "Medium-High",
    estimatedTime: "8 Weeks",
    requiredSkills: ["FastAPI", "PostgreSQL", "React", "Kafka/Redis", "Python"],
    match: {
      skill: 90,
      interest: 88,
      feasibility: 91,
      career: 93,
      portfolio: 92,
      time: 89,
    },
    overall: 90,
    why: "Directly addresses your interest in Fintech and showcases enterprise data pipeline engineering.",
    rarity: "rare",
  },
];

export const SAMPLE_FEASIBILITY: Feasibility = {
  achievable: true,
  verdict: "High Feasibility · Highly Recommended Capstone",
  reasoning:
    "The scope aligns directly with your existing 20-hour weekly capacity and proficiency in Python and React. The core ML component can leverage modern open-source transformers while maintaining a snappy, containerized backend.",
  skillGaps: ["Advanced AST code analysis", "Batch WebSocket streaming"],
  timeVerdict: "8-10 weeks is sufficient for a 3-tier production MVP.",
  resourceVerdict: "Zero proprietary API requirements; runs cleanly on local GPU/CPU with open-weights.",
  simplified: {
    name: "Phase 1 Core MVP",
    summary: "Deliver resume parsing + repo scoring with REST API before adding real-time graph visualization.",
  },
  learningRoadmap: [
    { skill: "Python AST parsing", how: "Review standard library ast module docs", weeks: 1 },
    { skill: "FastAPI Async WebSockets", how: "Build streaming task worker with Redis", weeks: 2 },
  ],
  alternative: {
    name: "FinPulse Transaction Engine",
    summary: "Simpler dataset handling if recruiter data scraping proves restrictive.",
  },
};

export const SAMPLE_BLUEPRINT: Blueprint = {
  title: "AI-Powered Technical Skill & Resume Screener",
  overview: {
    summary:
      "An automated, verifiable candidate technical screening pipeline combining natural language resume extraction with deterministic code analysis of public repositories.",
    problemStatement:
      "Campus recruiters spend hundreds of hours manually filtering resumes with high error rates and no objective code verification.",
    proposedSolution:
      "Build a streamlined web workspace with FastAPI and React that scores applicant submissions, validates repo commit depth, and produces explainable scorecards.",
    objectives: [
      "Sub-2 second resume skill extraction",
      "Automatic GitHub API repo verification",
      "Explainable candidate match scorecard",
      "Exportable JSON & PDF audit reports",
    ],
    targetUsers: "Campus recruiters, tech leads, university placement cells",
    expectedImpact: "Reduces screening cycle by 75% while boosting interview signal quality.",
  },
  mvpFeatures: [
    { name: "Candidate Submission Portal", detail: "Drag-and-drop resume upload with immediate file validation." },
    { name: "Parser & Entity Extractor", detail: "FastAPI service extracting skills, years of experience, and degrees." },
    { name: "Match Score Matrix", detail: "Interactive scoring breakdown comparing applicant to job requirements." },
    { name: "Audit Trail & Export", detail: "Downloadable screening dossier with rationale notes." },
  ],
  advancedFeatures: [
    { name: "GitHub AST Code Inspector", detail: "Calculates code cyclomatic complexity and language ratios." },
    { name: "Automated Mock Interview Prompter", detail: "Generates customized technical viva questions based on student resume." },
  ],
  futureImprovements: [
    "Multi-lingual resume analysis",
    "Self-hosted Llama-3 8B integration for air-gapped college placements",
  ],
  stack: [
    { name: "React 19", category: "Frontend", why: "Rapid UI state management and rich component ecosystem", howUsed: "Workspace UI", isNew: false },
    { name: "FastAPI", category: "Backend", why: "High performance asynchronous Python REST API", howUsed: "API server & ML worker", isNew: false },
    { name: "PostgreSQL", category: "Database", why: "ACID transactions with JSONB support", howUsed: "Candidate & telemetry store", isNew: false },
    { name: "Docker Compose", category: "DevOps", why: "Reproducible local and production deployment", howUsed: "Container orchestration", isNew: false },
  ],
  architecture: {
    layers: [
      { name: "Presentation", parts: ["React 19", "Tailwind CSS", "Vite"] },
      { name: "API Gateway", parts: ["FastAPI", "Uvicorn", "Pydantic"] },
      { name: "Core Engine", parts: ["NLP Parser", "GitHub AST Evaluator"] },
      { name: "Persistence", parts: ["PostgreSQL", "SQLAlchemy 2.0"] },
    ],
    dataFlow: "User Upload → FastAPI Gateway → Worker Pool → PostgreSQL → React Live Telemetry Canvas",
  },
  roadmap: [
    { phase: "Phase 1", title: "Foundation & Database", weeks: "Weeks 1-3", tasks: ["Set up PostgreSQL schemas", "Build FastAPI auth & candidate endpoints", "Implement React base shell"] },
    { phase: "Phase 2", title: "Parsing Engine", weeks: "Weeks 4-6", tasks: ["Resume PDF parser service", "Candidate match scoring formula", "Interactive candidate list"] },
    { phase: "Phase 3", title: "Refinement & Export", weeks: "Weeks 7-9", tasks: ["GitHub repo inspector", "Exportable audit dossier", "Docker deployment"] },
  ],
  challenges: [
    { challenge: "Unstructured resume PDF variance", solution: "Use robust fallback regex and schema normalization" },
    { challenge: "GitHub API rate limits", solution: "Implement Redis caching for repository metadata" },
  ],
};

export const SAMPLE_PROTOTYPE: PrototypeData = {
  title: "SkillForge: AI Candidate Screener",
  tagline: "Autonomous applicant screening & repository verification engine",
  architectureSummary: "FastAPI REST backend with PostgreSQL JSONB candidate storage and React 19 interactive workspace.",
  theme: "modern-minimal",
  screens: [
    {
      id: "dashboard",
      title: "Recruitment Dashboard",
      subtitle: "Overview of candidate pipeline, screening throughput, and match distribution",
      metrics: [
        { label: "Total Candidates", value: "248", change: "+18%" },
        { label: "Average Match", value: "84.2%", change: "+4.1%" },
        { label: "Verification Rate", value: "96.4%", change: "Target Met" },
      ],
      inputForm: {
        title: "Screen New Candidate",
        description: "Submit a candidate profile to initiate instant automated evaluation",
        fields: [
          { name: "candidateName", label: "Candidate Name", placeholder: "e.g. Rahul Verma", type: "text" },
          { name: "githubUrl", label: "GitHub Profile / Repo URL", placeholder: "https://github.com/rahul/project", type: "text" },
          { name: "targetRole", label: "Target Role", placeholder: "Full Stack Engineer", type: "text" },
        ],
        submitLabel: "Run Screening Pipeline",
        successMessage: "Candidate submitted! Pipeline parsed skills and calculated 94% match score.",
      },
      sampleItems: [
        { title: "Priya Nair", category: "Frontend Specialist", status: "Verified (96%)", detail: "5 public repositories, strong React & TypeScript signals." },
        { title: "Arjun Mehta", category: "ML Engineer", status: "Verified (91%)", detail: "Published PyTorch models, active open source contributor." },
        { title: "Siddharth Rao", category: "Backend Dev", status: "Pending (82%)", detail: "FastAPI & Docker architecture demonstrated." },
      ],
      actions: [
        { id: "batch-score", label: "Trigger Batch Re-score", description: "Re-run AI evaluation on all pending submissions", mockResponse: "Processed 14 candidates in 1.4s" },
        { id: "export-csv", label: "Export Shortlist CSV", description: "Download verified candidates with contact information", mockResponse: "Shortlist generated (42 candidates)" },
      ],
    },
    {
      id: "screener",
      title: "Candidate Deep Inspector",
      subtitle: "Detailed skill matrix and deterministic repository validation",
      metrics: [
        { label: "Code Quality Index", value: "92/100" },
        { label: "Commit Consistency", value: "89%" },
        { label: "Complexity Score", value: "A+" },
      ],
      sampleItems: [
        { title: "Codebase Structure", category: "Architecture", status: "Clean", detail: "Modular separation of concerns with clear domain interfaces." },
        { title: "Test Coverage", category: "Testing", status: "88% Pass", detail: "Unit and integration tests configured with PyTest." },
        { title: "Documentation", category: "Docs", status: "Exemplary", detail: "Comprehensive README, architectural diagrams, and OpenAPI specs." },
      ],
      actions: [
        { id: "run-linter", label: "Execute AST Linter", description: "Verify cyclomatic complexity of candidate repo", mockResponse: "Complexity index: 1.24 (Optimal)" },
      ],
    },
    {
      id: "analytics",
      title: "Placement Analytics & Telemetry",
      subtitle: "University placement statistics and skills demand breakdown",
      metrics: [
        { label: "Placement Rate", value: "78.4%" },
        { label: "Top Skill Demand", value: "Python + React" },
        { label: "Avg Offer Multiple", value: "2.3x" },
      ],
      sampleItems: [
        { title: "AI/ML Role Growth", category: "Market Signal", status: "+34% YoY", detail: "Surge in campus recruitment for applied AI engineers." },
        { title: "Full-Stack Stability", category: "Market Signal", status: "High Demand", detail: "Continuous demand for TypeScript & modern REST architectures." },
      ],
    },
  ],
  codeFiles: [
    {
      path: "src/App.tsx",
      language: "typescript",
      description: "Root React application shell with live telemetry and candidate screen routing",
      code: `import React, { useState } from "react";
import { CandidateDashboard } from "./components/CandidateDashboard";
import { DeepInspector } from "./components/DeepInspector";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "inspector">("dashboard");
  const [candidateCount, setCandidateCount] = useState(248);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-blue-600 text-white font-bold grid place-items-center">S</div>
          <div>
            <h1 className="font-bold text-sm">SkillForge Screener</h1>
            <p className="text-xs text-slate-500">Autonomous Candidate Architecture Evaluator</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={\`px-3 py-1.5 rounded-lg text-xs font-semibold \${activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}\`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("inspector")}
            className={\`px-3 py-1.5 rounded-lg text-xs font-semibold \${activeTab === "inspector" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}\`}
          >
            Deep Inspector
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === "dashboard" ? <CandidateDashboard count={candidateCount} /> : <DeepInspector />}
      </main>
    </div>
  );
}`,
    },
    {
      path: "api/main.py",
      language: "python",
      description: "FastAPI server with asynchronous candidate evaluation endpoints",
      code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="SkillForge Candidate Screener API", version="1.0.0")

class CandidateSubmission(BaseModel):
    name: str
    github_url: str
    target_role: str
    skills: Optional[List[str]] = []

class EvaluationResult(BaseModel):
    candidate_id: str
    match_score: float
    verified: bool
    rationale: str

@app.get("/health")
def health():
    return {"status": "healthy", "service": "skillforge-api"}

@app.post("/api/candidates/screen", response_model=EvaluationResult)
async def screen_candidate(candidate: CandidateSubmission):
    # Deterministic scoring algorithm
    score = 94.2
    return EvaluationResult(
        candidate_id="cand_101",
        match_score=score,
        verified=True,
        rationale=f"Verified {candidate.github_url} with strong architecture alignment for {candidate.target_role}."
    )
`,
    },
    {
      path: "database/schema.sql",
      language: "sql",
      description: "PostgreSQL relational schema with JSONB metadata support",
      code: `-- SkillForge PostgreSQL Schema Contract
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    github_url TEXT,
    target_role VARCHAR(100) NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    match_score NUMERIC(5,2) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS screening_logs (
    id BIGSERIAL PRIMARY KEY,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    telemetry JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_candidates_score ON candidates(match_score DESC);
`,
    },
  ],
  runInstructions: [
    "Clone or extract the repository archive to your local workspace",
    "Install frontend dependencies: npm install && npm run dev",
    "Start FastAPI backend: cd api && pip install -r requirements.txt && uvicorn main:app --reload",
    "Open http://localhost:5173 to access the live candidate screener workspace",
  ],
  productionCodebase: undefined, // Will be linked below
};

export const SAMPLE_PRODUCTION_CODEBASE: ProductionCodebase = {
  manifest: {
    title: "SkillForge Candidate Screener Production Suite",
    description: "High-throughput asynchronous evaluation platform featuring PostgreSQL JSONB schema, FastAPI backend with async background workers, modular React/TypeScript client, and Docker orchestration.",
    databaseContract: `-- ============================================================================
-- SkillForge PostgreSQL 16 Relational Schema & Performance Indices
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core candidate entities with JSONB skills telemetry
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    github_url TEXT NOT NULL,
    target_role VARCHAR(100) NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    match_score NUMERIC(5,2) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Architectural evaluations generated per candidate
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    architecture_score NUMERIC(5,2) NOT NULL,
    code_quality_score NUMERIC(5,2) NOT NULL,
    testing_score NUMERIC(5,2) NOT NULL,
    summary TEXT NOT NULL,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log stream
CREATE TABLE IF NOT EXISTS screening_logs (
    id BIGSERIAL PRIMARY KEY,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    telemetry JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_evaluations_candidate ON evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON screening_logs(created_at DESC);
`,
    apiContract: [
      {
        method: "GET",
        path: "/api/v1/health",
        summary: "System healthcheck and database connectivity test",
        responseBody: '{"status":"healthy","database":"connected","version":"1.0.0"}',
      },
      {
        method: "GET",
        path: "/api/v1/candidates",
        summary: "Retrieve paginated candidate ranking list",
        responseBody: '[{"id":"uuid","name":"Jane Doe","match_score":94.2,"target_role":"Full Stack Engineer"}]',
      },
      {
        method: "POST",
        path: "/api/v1/candidates/screen",
        summary: "Trigger automated AST & architecture screening for a candidate",
        requestBody: '{"name":"string","github_url":"string","target_role":"string","skills":["string"]}',
        responseBody: '{"candidate_id":"uuid","match_score":94.2,"verified":true,"summary":"Optimal clean architecture"}',
      },
      {
        method: "GET",
        path: "/api/v1/evaluations/:id",
        summary: "Fetch deep architecture evaluation dossier for a specific candidate",
        responseBody: '{"id":"uuid","architecture_score":96.0,"code_quality_score":92.5,"strengths":["SOLID principles"]}',
      },
    ],
    envContract: [
      "DATABASE_URL=postgresql://skillforge:secret@localhost:5432/skillforge_prod",
      "API_V1_PREFIX=/api/v1",
      "ENVIRONMENT=production",
      "SECRET_KEY=yaduk_production_dev_secret_key_change_in_prod",
      "VITE_API_BASE_URL=http://localhost:8000",
      "ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000",
    ],
    extraFrontendPackages: ["lucide-react", "clsx", "tailwind-merge"],
    extraBackendPackages: ["uvicorn", "pydantic", "sqlalchemy", "asyncpg"],
    batches: [
      {
        id: "layer_1_database",
        layerName: "Layer 1: Database & Configuration",
        description: "PostgreSQL relational schemas, mock seeds and environment configuration",
        targetFiles: [
          { path: "database/schema.sql", language: "sql", purpose: "DDL table definitions, foreign keys, and indexes" },
          { path: "database/seed.sql", language: "sql", purpose: "Initial mock candidate test fixtures" },
          { path: ".env.example", language: "bash", purpose: "Complete environment variables contract" },
        ],
      },
      {
        id: "layer_2_backend",
        layerName: "Layer 2: Backend Core & APIs",
        description: "FastAPI application server, Pydantic schemas, and database session handling",
        targetFiles: [
          { path: "backend/app/main.py", language: "python", purpose: "FastAPI server with CORS and REST routers" },
          { path: "backend/app/schemas.py", language: "python", purpose: "Pydantic v2 validation models" },
          { path: "backend/app/database.py", language: "python", purpose: "Async SQLAlchemy engine and session pool" },
          { path: "backend/requirements.txt", language: "text", purpose: "Python dependencies with pinned versions" },
        ],
      },
      {
        id: "layer_3_frontend_scaffolding",
        layerName: "Layer 3: Frontend Scaffolding & API Client",
        description: "TypeScript data contracts, API client wrapper, and dependencies",
        targetFiles: [
          { path: "frontend/src/types/candidate.ts", language: "typescript", purpose: "TypeScript models mirroring database schema" },
          { path: "frontend/src/lib/apiClient.ts", language: "typescript", purpose: "Type-safe fetch client with error handling" },
          { path: "frontend/package.json", language: "json", purpose: "NPM package.json with scripts and dependencies" },
        ],
      },
      {
        id: "layer_4_ui_views",
        layerName: "Layer 4: Interactive Views & Dashboard",
        description: "Production React views connecting UI components to live candidate APIs",
        targetFiles: [
          { path: "frontend/src/components/CandidateDashboard.tsx", language: "typescript", purpose: "Live candidate screening table and metrics" },
          { path: "frontend/src/App.tsx", language: "typescript", purpose: "Main React shell with tabs and telemetry feed" },
        ],
      },
      {
        id: "layer_5_deployment",
        layerName: "Layer 5: DevOps & Containerization",
        description: "Docker multi-container orchestration and deployment guide",
        targetFiles: [
          { path: "docker-compose.yml", language: "yaml", purpose: "Multi-container PostgreSQL + FastAPI orchestrator" },
          { path: "README.md", language: "markdown", purpose: "Production runbook, setup guide and API reference" },
        ],
      },
    ],
  },
  files: [
    {
      path: "database/schema.sql",
      language: "sql",
      description: "PostgreSQL DDL with foreign keys, constraints and performance indexes",
      code: `-- ============================================================================
-- SkillForge PostgreSQL 16 Relational Schema Contract
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    github_url TEXT NOT NULL,
    target_role VARCHAR(100) NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    match_score NUMERIC(5,2) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    architecture_score NUMERIC(5,2) NOT NULL,
    code_quality_score NUMERIC(5,2) NOT NULL,
    testing_score NUMERIC(5,2) NOT NULL,
    summary TEXT NOT NULL,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS screening_logs (
    id BIGSERIAL PRIMARY KEY,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    telemetry JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_evaluations_candidate ON evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON screening_logs(created_at DESC);
`,
    },
    {
      path: "database/seed.sql",
      language: "sql",
      description: "Realistic test records for candidate screening and evaluations",
      code: `-- Initial Seed Data for SkillForge Development
INSERT INTO candidates (id, name, email, github_url, target_role, skills, match_score, is_verified) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Aarav Patel', 'aarav@domain.com', 'https://github.com/aaravpatel/ecommerce-microservices', 'Senior Backend Engineer', '["Go", "gRPC", "PostgreSQL", "Kafka", "Docker"]'::jsonb, 94.8, true),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Priya Sharma', 'priya@domain.com', 'https://github.com/priyasharma/react-design-system', 'Frontend Architect', '["React", "TypeScript", "Tailwind CSS", "Storybook", "Vite"]'::jsonb, 91.5, true),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Rohan Verma', 'rohan@domain.com', 'https://github.com/rohanverma/rag-llm-pipeline', 'AI/ML Engineer', '["Python", "FastAPI", "LangChain", "PyTorch", "ChromaDB"]'::jsonb, 88.0, false)
ON CONFLICT (email) DO NOTHING;

INSERT INTO evaluations (candidate_id, architecture_score, code_quality_score, testing_score, summary, strengths, weaknesses) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 96.0, 94.0, 95.0, 'Superb modular separation with domain-driven design, gRPC contracts, and clean hexagonal architecture.', '["Clean interfaces", "High test coverage (92%)", "Idiomatic concurrency"]'::jsonb, '["Missing rate-limiting middleware"]'::jsonb);
`,
    },
    {
      path: ".env.example",
      language: "bash",
      description: "Development environment configuration template",
      code: `# SkillForge Environment Configuration
DATABASE_URL=postgresql://skillforge:secret@localhost:5432/skillforge_prod
API_V1_PREFIX=/api/v1
ENVIRONMENT=development
SECRET_KEY=yaduk_dev_key_supersecret_change_in_production
VITE_API_BASE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
`,
    },
    {
      path: "backend/app/main.py",
      language: "python",
      description: "Production FastAPI application entry point with CORS, routers, and healthcheck",
      code: `import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from app.schemas import CandidateCreate, CandidateResponse, ScreenRequest, EvaluationResponse
from app.database import get_db_session

app = FastAPI(
    title="SkillForge Candidate Screener API",
    description="Asynchronous candidate screening and repository evaluation engine",
    version="1.0.0",
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "skillforge-screener-api",
        "database": "connected",
        "version": "1.0.0"
    }

@app.get("/api/v1/candidates", response_model=List[CandidateResponse])
async def list_candidates(limit: int = 20, offset: int = 0):
    # Retrieve sorted candidates by match score
    mock_candidates = [
        CandidateResponse(
            id="a1b2c3d4-0001-4000-8000-000000000001",
            name="Aarav Patel",
            email="aarav@domain.com",
            github_url="https://github.com/aaravpatel/ecommerce-microservices",
            target_role="Senior Backend Engineer",
            skills=["Go", "gRPC", "PostgreSQL", "Kafka"],
            match_score=94.8,
            is_verified=True,
        ),
        CandidateResponse(
            id="a1b2c3d4-0002-4000-8000-000000000002",
            name="Priya Sharma",
            email="priya@domain.com",
            github_url="https://github.com/priyasharma/react-design-system",
            target_role="Frontend Architect",
            skills=["React", "TypeScript", "Tailwind CSS"],
            match_score=91.5,
            is_verified=True,
        ),
    ]
    return mock_candidates

@app.post("/api/v1/candidates/screen", response_model=EvaluationResponse)
async def screen_candidate(req: ScreenRequest):
    # Execute repository parsing and AST analysis
    match_score = 92.4
    return EvaluationResponse(
        candidate_id="cand_generated_id",
        architecture_score=94.0,
        code_quality_score=91.0,
        testing_score=92.0,
        match_score=match_score,
        verified=True,
        summary=f"Automated evaluation completed for {req.github_url}. Strong architectural alignment with {req.target_role}.",
        strengths=["SOLID principles adhered", "Clear dependency injection", "Async endpoint handlers"],
        weaknesses=["Could benefit from Redis query caching"],
    )
`,
    },
    {
      path: "backend/app/schemas.py",
      language: "python",
      description: "Pydantic v2 data transfer models for strict API validation",
      code: `from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime

class CandidateCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: str
    github_url: str
    target_role: str
    skills: List[str] = []

class CandidateResponse(BaseModel):
    id: str
    name: str
    email: str
    github_url: str
    target_role: str
    skills: List[str]
    match_score: float
    is_verified: bool

class ScreenRequest(BaseModel):
    github_url: str
    target_role: str
    expected_skills: Optional[List[str]] = []

class EvaluationResponse(BaseModel):
    candidate_id: str
    architecture_score: float
    code_quality_score: float
    testing_score: float
    match_score: float
    verified: bool
    summary: str
    strengths: List[str]
    weaknesses: List[str]
`,
    },
    {
      path: "backend/app/database.py",
      language: "python",
      description: "Asynchronous SQLAlchemy engine with connection pooling and session management",
      code: `import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://skillforge:secret@localhost:5432/skillforge_prod"
)

# Convert standard postgresql:// to postgresql+asyncpg:// if needed
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db_session():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
`,
    },
    {
      path: "backend/requirements.txt",
      language: "text",
      description: "Pinned Python production dependencies",
      code: `fastapi==0.111.0
uvicorn[standard]==0.30.1
pydantic==2.8.2
sqlalchemy==2.0.31
asyncpg==0.29.0
python-dotenv==1.0.1
httpx==0.27.0
`,
    },
    {
      path: "frontend/src/types/candidate.ts",
      language: "typescript",
      description: "TypeScript interfaces mirroring backend schema and API models",
      code: `export interface Candidate {
  id: string;
  name: string;
  email: string;
  githubUrl: string;
  targetRole: string;
  skills: string[];
  matchScore: number;
  isVerified: boolean;
  createdAt?: string;
}

export interface Evaluation {
  id: string;
  candidateId: string;
  architectureScore: number;
  codeQualityScore: number;
  testingScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  status: "pending" | "processing" | "completed";
}

export interface ScreenPayload {
  githubUrl: string;
  targetRole: string;
  expectedSkills: string[];
}
`,
    },
    {
      path: "frontend/src/lib/apiClient.ts",
      language: "typescript",
      description: "Type-safe API client wrapper with baseURL and standard error handling",
      code: `import type { Candidate, Evaluation, ScreenPayload } from "../types/candidate";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export async function fetchCandidates(): Promise<Candidate[]> {
  const res = await fetch(\`\${API_BASE}/candidates\`);
  if (!res.ok) throw new Error(\`Failed to fetch candidates: \${res.statusText}\`);
  return res.json();
}

export async function submitScreening(payload: ScreenPayload): Promise<Evaluation> {
  const res = await fetch(\`\${API_BASE}/candidates/screen\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(\`Screening evaluation failed: \${res.statusText}\`);
  return res.json();
}

export async function checkApiHealth(): Promise<{ status: string; database: string }> {
  const res = await fetch(\`\${API_BASE}/health\`);
  if (!res.ok) throw new Error("API service unreachable");
  return res.json();
}
`,
    },
    {
      path: "frontend/src/components/CandidateDashboard.tsx",
      language: "typescript",
      description: "Interactive candidate ranking dashboard with filtering and live metrics",
      code: `import React, { useState } from "react";
import type { Candidate } from "../types/candidate";

interface Props {
  candidates?: Candidate[];
  onScreenNew?: () => void;
}

export function CandidateDashboard({ candidates = [], onScreenNew }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = candidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.targetRole.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || c.targetRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Evaluated Candidates</h2>
          <p className="text-sm text-slate-500">Autonomous AST code quality & architecture scoring</p>
        </div>
        <button
          onClick={onScreenNew}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
        >
          + Screen Candidate
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-xs text-slate-500">Total Analyzed</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{candidates.length || 248}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-xs text-slate-500">Average Match Index</span>
          <p className="mt-1 text-2xl font-bold text-emerald-600">92.4%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-xs text-slate-500">Verification Rate</span>
          <p className="mt-1 text-2xl font-bold text-blue-600">96.8%</p>
        </div>
      </div>
    </div>
  );
}
`,
    },
    {
      path: "frontend/package.json",
      language: "json",
      description: "Frontend NPM dependencies, scripts, and build configuration",
      code: `{
  "name": "skillforge-screener-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.475.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}
`,
    },
    {
      path: "docker-compose.yml",
      language: "yaml",
      description: "Multi-container local stack orchestrating PostgreSQL, FastAPI, and Vite",
      code: `version: "3.8"

services:
  db:
    image: postgres:16-alpine
    container_name: skillforge-db
    environment:
      POSTGRES_DB: skillforge_prod
      POSTGRES_USER: skillforge
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U skillforge -d skillforge_prod"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: skillforge-backend
    environment:
      DATABASE_URL: postgresql+asyncpg://skillforge:secret@db:5432/skillforge_prod
      API_V1_PREFIX: /api/v1
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
`,
    },
    {
      path: "README.md",
      language: "markdown",
      description: "Production documentation with quickstart, test commands, and architectural summary",
      code: `# SkillForge Candidate Screener — Production Suite

Autonomous candidate intelligence and architectural screening engine. Built with FastAPI, PostgreSQL, and React.

## 🚀 Quickstart

### 1. Launch with Docker Compose (Recommended)
\`\`\`bash
docker compose up --build -d
\`\`\`
- API Server: http://localhost:8000/docs
- Healthcheck: http://localhost:8000/api/v1/health

### 2. Manual Development Setup
\`\`\`bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
\`\`\`

## 🛡️ Architecture & Verification
- **Database**: PostgreSQL with UUID keys, JSONB metrics, and B-Tree indexes.
- **Backend**: Async FastAPI with Pydantic v2 validation contracts.
- **Frontend**: Typed React client with responsive tailwind interfaces.
`,
    },
  ],
  completedBatchIds: [
    "layer_1_database",
    "layer_2_backend",
    "layer_3_frontend_scaffolding",
    "layer_4_ui_views",
    "layer_5_deployment",
  ],
};

// Bind production codebase to sample prototype
SAMPLE_PROTOTYPE.productionCodebase = SAMPLE_PRODUCTION_CODEBASE;


/**
 * Returns a hydrated state payload ensuring that when navigating to ANY stage,
 * all requisite objects (profile, ideas, blueprint, prototype) exist so the stage
 * renders immediately on single click.
 */
export function getHydratedStateForStage(
  targetStage: Stage,
  currentState: JourneyState,
): Partial<JourneyState> {
  const profile = currentState.profile || SAMPLE_PROFILE;
  const ideas = currentState.ideas && currentState.ideas.length > 0 ? currentState.ideas : SAMPLE_IDEAS;
  const selectedIdeaId = currentState.selectedIdeaId || ideas[0]?.id || "idea-1";
  const feasibility = currentState.feasibility || SAMPLE_FEASIBILITY;
  const blueprint = currentState.blueprint || SAMPLE_BLUEPRINT;
  const prototype = currentState.prototype || SAMPLE_PROTOTYPE;

  switch (targetStage) {
    case "intro":
      return { stage: "intro" };
    case "discovery":
      return { stage: "discovery", profile };
    case "profile":
      return { stage: "profile", profile };
    case "ideas":
      return { stage: "ideas", profile, ideas, selectedIdeaId };
    case "feasibility":
      return { stage: "feasibility", profile, ideas, selectedIdeaId, feasibility };
    case "blueprint":
      return { stage: "blueprint", profile, ideas, selectedIdeaId, feasibility, blueprint };
    case "theme":
      return { stage: "theme", profile, blueprint };
    case "prototype":
      return { stage: "prototype", profile, blueprint, prototype };
    case "mentor":
      return { stage: "mentor", profile, blueprint };
    default:
      return { stage: targetStage };
  }
}
