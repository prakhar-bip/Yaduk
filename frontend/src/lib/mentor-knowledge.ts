import type { Blueprint, StudentProfile } from "./types";

export type TopicType =
  | "getting_started"
  | "architecture"
  | "database"
  | "stack_tooling"
  | "mvp_features"
  | "challenges_viva"
  | "general";

export interface TopicMetadata {
  id: TopicType;
  label: string;
  icon: string;
  hint: string;
}

export const TOPIC_METADATA: Record<TopicType, TopicMetadata> = {
  getting_started: {
    id: "getting_started",
    label: "Getting Started",
    icon: "🚀",
    hint: "Roadmap, initial setup & first coding milestones",
  },
  architecture: {
    id: "architecture",
    label: "System Architecture",
    icon: "⚙️",
    hint: "System layers, end-to-end data flow & design",
  },
  database: {
    id: "database",
    label: "Database & Models",
    icon: "🗄️",
    hint: "Schema, tables, entities & data persistence",
  },
  stack_tooling: {
    id: "stack_tooling",
    label: "Tech Stack & Tools",
    icon: "📦",
    hint: "Frameworks, packages, APIs & libraries",
  },
  mvp_features: {
    id: "mvp_features",
    label: "MVP Features",
    icon: "✨",
    hint: "Core deliverables, scope & feature boundaries",
  },
  challenges_viva: {
    id: "challenges_viva",
    label: "Risks & Viva Defense",
    icon: "🛡️",
    hint: "Technical bottlenecks, edge cases & evaluator Q&A",
  },
  general: {
    id: "general",
    label: "General Guidance",
    icon: "💡",
    hint: "General questions & project advice",
  },
};

export interface BlueprintKnowledgeBase {
  summaryAnchor: string;
  chapters: Record<TopicType, string>;
}

function safeJoin(arr: any, fallback = "n/a"): string {
  if (Array.isArray(arr)) {
    return arr.filter(Boolean).join(", ") || fallback;
  }
  if (typeof arr === "string" && arr.trim().length > 0) {
    return arr.trim();
  }
  return fallback;
}

/**
 * Builds the Blueprint Knowledge Base ("The Book").
 * Indexes the blueprint into compact, topic-specific chapters (~100-200 tokens each).
 */
export function buildBlueprintKnowledgeBase(
  blueprint?: Blueprint | null,
  profile?: StudentProfile | null,
): BlueprintKnowledgeBase {
  const bp = blueprint || ({} as Partial<Blueprint>);
  const prof = profile || ({} as Partial<StudentProfile>);

  const title = bp.title || "Engineering Capstone Project";
  const solution = bp.overview?.proposedSolution || bp.overview?.summary || "Production software system";
  const problem = bp.overview?.problemStatement || "Core technical bottleneck";
  const field = prof.fieldOfStudy || "Computer Science & Engineering";
  const skills = safeJoin(prof.skills, "TypeScript, Python, Full-Stack");
  const hours = prof.hoursPerWeek || 15;
  const weeks = prof.weeks || 12;

  // 1. Permanent Project Anchor (~40-50 tokens)
  const summaryAnchor = [
    `• PROJECT: ${title}`,
    `• CORE OBJECTIVE: Solves "${problem}" via ${solution}`,
    `• STUDENT: ${field} (Skills: ${skills} | Budget: ${hours}h/wk, ${weeks} wks)`,
  ].join("\n");

  // 2. Chapter: Getting Started & Roadmap (~120 tokens)
  const roadmapPhases = Array.isArray(bp.roadmap) && bp.roadmap.length > 0
    ? bp.roadmap.slice(0, 3).map((r) => `  - Phase ${r.phase} (${r.weeks || "Wks 1-3"}): ${r.title} [Tasks: ${safeJoin(r.tasks?.slice(0, 3), "Core setup")}]`).join("\n")
    : "  - Phase 01: Setup repository, config & dependencies\n  - Phase 02: Core data schema & CRUD endpoints\n  - Phase 03: UI integration & workflows";

  const chapterGettingStarted = [
    `[ROADMAP & IMMEDIATE NEXT STEPS]`,
    `Current Phase Focus:`,
    roadmapPhases,
    `Advice: Prioritize getting a walking skeleton running (frontend hitting one live backend endpoint) before adding complex logic.`,
  ].join("\n");

  // 3. Chapter: Architecture & Data Flow (~120 tokens)
  const layers = Array.isArray(bp.architecture?.layers) && bp.architecture.layers.length > 0
    ? bp.architecture.layers.map((l) => `  - ${l.name}: ${safeJoin(l.parts, "Core modules")}`).join("\n")
    : "  - Client: Single Page App (React)\n  - Server: REST/WebSocket API Service\n  - Persistence: Relational Database";

  const dataFlow = bp.architecture?.dataFlow || "Client initiates HTTP/WebSocket request -> API Gateway validates & delegates to service layer -> Database persists state and returns JSON response.";

  const chapterArchitecture = [
    `[SYSTEM ARCHITECTURE & DATA FLOW]`,
    `System Layers:`,
    layers,
    `Data Flow Path: ${dataFlow}`,
  ].join("\n");

  // 4. Chapter: Database & Schema (~100 tokens)
  const dbStack = Array.isArray(bp.stack)
    ? bp.stack.filter((s) => /database|persistence|storage|sql|cache|mongo/i.test(s.category || "") || /postgres|sql|mongo|redis|prisma|sqlite/i.test(s.name || ""))
    : [];
  const dbTools = dbStack.length > 0 ? dbStack.map((s) => `${s.name} (${s.howUsed || s.why || "Persistence"})`).join(", ") : "PostgreSQL / Relational Store";
  const mvpEntities = Array.isArray(bp.mvpFeatures) && bp.mvpFeatures.length > 0
    ? bp.mvpFeatures.slice(0, 3).map((f) => f.name).join(", ")
    : "Users, Core Entities, Activity Logs";

  const chapterDatabase = [
    `[DATABASE & DATA PERSISTENCE]`,
    `Database Engine: ${dbTools}`,
    `Core Entities to Model: ${mvpEntities}`,
    `Guidelines: Use normalized tables, clear foreign-key constraints, and timestamped audit fields (created_at, updated_at).`,
  ].join("\n");

  // 5. Chapter: Stack & Tooling (~120 tokens)
  const stackItems = Array.isArray(bp.stack) && bp.stack.length > 0
    ? bp.stack.map((s) => `  - ${s.name} (${s.category || "Tool"}): ${s.howUsed || s.why || "Integrated component"}`).join("\n")
    : "  - React & TypeScript (Frontend)\n  - FastAPI / Python (Backend)\n  - PostgreSQL (Database)\n  - Tailwind CSS (Styling)";

  const chapterStack = [
    `[ENGINEERING TECH STACK]`,
    stackItems,
    `Guidelines: Keep dependencies minimal. Prefer standard, mature libraries over experimental packages.`,
  ].join("\n");

  // 6. Chapter: MVP Features (~100 tokens)
  const mvpList = Array.isArray(bp.mvpFeatures) && bp.mvpFeatures.length > 0
    ? bp.mvpFeatures.map((f, i) => `  ${i + 1}. ${f.name}: ${f.detail}`).join("\n")
    : "  1. Core Authentication & Profile\n  2. Primary Domain Workflow Engine\n  3. Results Dashboard";

  const chapterMvp = [
    `[MVP FEATURE SPECIFICATIONS]`,
    mvpList,
    `Scope Rule: Do not add secondary features until all core MVP items above are completed and tested.`,
  ].join("\n");

  // 7. Chapter: Challenges & Viva Defense (~120 tokens)
  const challengesList = Array.isArray(bp.challenges) && bp.challenges.length > 0
    ? bp.challenges.map((c) => `  - Risk: ${c.challenge}\n    Defense: ${c.solution}`).join("\n")
    : "  - Risk: Scope creep & time deficit\n    Defense: Ship core MVP first, treat optional features as phase 2 stretch goals.\n  - Risk: Live evaluation demo failure\n    Defense: Use deterministic seed data and automated test scripts.";

  const chapterChallenges = [
    `[RISKS, BOTTLENECKS & VIVA DEFENSE]`,
    challengesList,
    `Viva Tip: Clearly articulate trade-offs made (e.g. why this database, how latency is managed, what failure modes exist).`,
  ].join("\n");

  // 8. Chapter: General Guidance (~80 tokens)
  const chapterGeneral = [
    `[GENERAL PROJECT GUIDANCE]`,
    `Summary: ${bp.overview?.summary || solution}`,
    `Objectives: ${safeJoin(bp.overview?.objectives?.slice(0, 3), "Establish core working prototype")}`,
    `Target Evaluators/Users: ${bp.overview?.targetUsers || "Evaluators and end users"}`,
  ].join("\n");

  return {
    summaryAnchor,
    chapters: {
      getting_started: chapterGettingStarted,
      architecture: chapterArchitecture,
      database: chapterDatabase,
      stack_tooling: chapterStack,
      mvp_features: chapterMvp,
      challenges_viva: chapterChallenges,
      general: chapterGeneral,
    },
  };
}

/**
 * Topic Shift Detector ("Looking Back at the Book").
 * Detects whether a student prompt is asking about a new chapter or continuing the current topic.
 */
export function detectTopic(message: string, currentTopic: TopicType = "getting_started"): TopicType {
  const m = (message || "").toLowerCase();

  // Database detection
  if (
    /\b(database|schema|tables?|models?|sql|postgres|mongodb?|sqlite|prisma|sqlalchemy|migrations?|crud|queries|foreign key|entities|relations?|persistence)\b/.test(m)
  ) {
    return "database";
  }

  // Architecture & data flow detection
  if (
    /\b(architect|architecture|data ?flow|system design|layers?|components?|diagram|viva presentation|request cycle|gateway|services? layer)\b/.test(m)
  ) {
    return "architecture";
  }

  // Getting started & roadmap detection
  if (
    /\b(start|begin|first (step|thing|move|milestone)|where to start|roadmap|timeline|phase|tasks?|sprint|order|setup|init|repository)\b/.test(m)
  ) {
    return "getting_started";
  }

  // Tech stack & tooling detection
  if (
    /\b(stack|librar(y|ies)|frameworks?|tooling|install|npm|pip|fastapi|react|tailwind|packages?|versions?|dependencies|why (use|choose))\b/.test(m)
  ) {
    return "stack_tooling";
  }

  // Feature scope detection
  if (
    /\b(features?|mvp|scope|functionality|user stories|capabilities|cut|drop|add feature)\b/.test(m)
  ) {
    return "mvp_features";
  }

  // Risks, challenges & viva defense detection
  if (
    /\b(hardest|challenge|risks?|blockers?|pitfalls?|bottlenecks?|viva|evaluat(or|ion)|grading|defend|questions? they ask|failure)\b/.test(m)
  ) {
    return "challenges_viva";
  }

  // If message has no specific pivot, stay in current working memory topic
  return currentTopic || "getting_started";
}

/**
 * Formats the ultra-compact, topic-specific system prompt (~250-350 tokens).
 */
export function getTopicPrompt(
  blueprint: Blueprint | null | undefined,
  profile: StudentProfile | null | undefined,
  activeTopic: TopicType,
): string {
  const kb = buildBlueprintKnowledgeBase(blueprint, profile);
  const chapter = kb.chapters[activeTopic] || kb.chapters.general;
  const meta = TOPIC_METADATA[activeTopic] || TOPIC_METADATA.general;

  return `You are Yaduk, an expert AI Project Mentor and Systems Architect.
Guide the student with concrete, pragmatic, and directly actionable advice.
Keep answers concise (max ~120-150 words unless the student explicitly asks for code or deep elaboration).

KNOWLEDGE BASE:
${kb.summaryAnchor}

ACTIVE TOPIC FOCUS: ${meta.icon} ${meta.label}
${chapter}

CONVERSATION DIRECTIVE:
You are actively discussing "${meta.label}". Answer the student's question specifically within this context.
If they ask for code, give minimal, clean, production-ready snippets.`;
}
