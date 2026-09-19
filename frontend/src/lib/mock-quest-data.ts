import type {
  BackendContractDoc,
  Blueprint,
  Feasibility,
  JourneyState,
  ProjectIdea,
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

export const SAMPLE_BACKEND_CONTRACT: BackendContractDoc = {
  title: "SkillForge Backend Architecture and Contract",
  framework: "FastAPI (Python 3.11)",
  databaseEngine: "PostgreSQL 16",
  architecturePattern: "Layered Modular Monolith (Routers -> Services -> Repositories -> PostgreSQL)",
  screenMappings: [
    {
      screen: "Recruitment Dashboard",
      route: "/dashboard",
      apiEndpoints: ["GET /api/v1/candidates/stats", "GET /api/v1/candidates/recent"],
      dbEntities: ["candidates", "screening_runs"],
    },
    {
      screen: "Candidate Screener and Parser",
      route: "/screener",
      apiEndpoints: ["POST /api/v1/candidates/screen", "GET /api/v1/candidates/{id}"],
      dbEntities: ["candidates", "candidate_skills", "code_metrics"],
    },
  ],
  apiRoutes: [
    {
      method: "GET",
      route: "/api/v1/health",
      screenName: "System",
      summary: "Service healthcheck and database connection status",
      authRequired: false,
      responsePayload: '{"status": "healthy", "database": "connected", "version": "1.0.0"}',
      statusCodes: [{ code: 200, description: "System healthy" }],
    },
    {
      method: "POST",
      route: "/api/v1/candidates/screen",
      screenName: "Candidate Screener",
      summary: "Submit a candidate profile and resume/repo URL for AI screening",
      authRequired: true,
      requestPayload: '{"fullName": "Rahul Verma", "githubUrl": "https://github.com/rahul/project", "targetRole": "Full Stack Engineer"}',
      responsePayload: '{"candidateId": "cnd_9821", "status": "queued", "estimatedSeconds": 4}',
      statusCodes: [
        { code: 202, description: "Screening task queued" },
        { code: 400, description: "Invalid payload or URL" },
      ],
    },
    {
      method: "GET",
      route: "/api/v1/candidates/{id}",
      screenName: "Candidate Screener",
      summary: "Retrieve parsed candidate details, skill matches, and code quality score",
      authRequired: true,
      responsePayload: '{"candidateId": "cnd_9821", "score": 94, "verified": true, "skills": ["React", "FastAPI"]}',
      statusCodes: [
        { code: 200, description: "Candidate details retrieved" },
        { code: 404, description: "Candidate not found" },
      ],
    },
  ],
  databaseSchema: {
    overview: "PostgreSQL relational schema with foreign key integrity and performance indexes for candidate records.",
    tables: [
      {
        tableName: "candidates",
        description: "Core applicant profiles with match percentages and review status",
        columns: [
          { name: "id", type: "UUID", isPrimary: true, description: "Unique candidate identifier" },
          { name: "full_name", type: "VARCHAR(255)", nullable: false },
          { name: "github_url", type: "TEXT", nullable: true },
          { name: "match_score", type: "NUMERIC(5,2)", nullable: false },
          { name: "created_at", type: "TIMESTAMPTZ", nullable: false },
        ],
        indexes: ["CREATE INDEX idx_candidates_score ON candidates(match_score DESC)"],
      },
      {
        tableName: "screening_runs",
        description: "Audit trail and execution results for automated evaluation runs",
        columns: [
          { name: "id", type: "UUID", isPrimary: true },
          { name: "candidate_id", type: "UUID", isForeign: true, references: "candidates(id)" },
          { name: "status", type: "VARCHAR(50)", nullable: false },
          { name: "result_payload", type: "JSONB", nullable: false },
          { name: "completed_at", type: "TIMESTAMPTZ" },
        ],
        indexes: ["CREATE INDEX idx_screening_candidate ON screening_runs(candidate_id)"],
      },
    ],
    rawSqlDdl: `-- SkillForge PostgreSQL 16 Relational Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    github_url TEXT,
    match_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS screening_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    result_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_screening_candidate ON screening_runs(candidate_id);`,
  },
  services: [
    {
      name: "CandidateIngestionService",
      purpose: "Validates incoming applicant profiles and enqueues evaluation jobs",
      responsibilities: ["Validate GitHub URL format", "Deduplicate candidate entries", "Persist initial candidate record"],
      associatedRoutes: ["POST /api/v1/candidates/screen"],
    },
    {
      name: "RepoAnalysisEngine",
      purpose: "Inspects public repositories for code architecture and testing signals",
      responsibilities: ["Fetch repository tree", "Analyze commit frequency", "Calculate code quality index"],
      associatedRoutes: ["GET /api/v1/candidates/{id}"],
    },
  ],
  securitySpec: {
    authStrategy: "Bearer JWT Authentication with HTTP-only refresh cookies",
    tokenExpiry: "Access token: 15 minutes, Refresh token: 7 days",
    passwordHashing: "Argon2id with per-user cryptographic salt",
    rbacDescription: "Role-Based Access Control distinguishing Recruiter from Admin roles.",
  },
  environmentVariables: [
    { key: "DATABASE_URL", example: "postgresql://postgres:password@localhost:5432/skillforge_db", purpose: "PostgreSQL connection pool URI" },
    { key: "JWT_SECRET_KEY", example: "super_secret_production_key_change_me", purpose: "Cryptographic secret for signing access tokens" },
    { key: "ENVIRONMENT", example: "development", purpose: "App environment mode (development/production)" },
    { key: "PORT", example: "8000", purpose: "FastAPI server bind port" },
  ],
  markdownSpec: "# SkillForge: Backend Architecture Specification\n\nComprehensive backend design doc for SkillForge.",
};

/**
 * Returns a hydrated state payload ensuring that when navigating to ANY stage,
 * all requisite objects exist so the stage renders immediately on single click.
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
  const backendContract = currentState.backendContract || SAMPLE_BACKEND_CONTRACT;

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
      return { stage: "theme", profile, blueprint, selectedTheme: currentState.selectedTheme || "modern-minimal" };
    case "contract":
      return { stage: "contract", profile, blueprint, selectedTheme: currentState.selectedTheme || "modern-minimal", backendContract };
    case "mentor":
      return { stage: "mentor", profile, blueprint };
    default:
      return { stage: targetStage };
  }
}
