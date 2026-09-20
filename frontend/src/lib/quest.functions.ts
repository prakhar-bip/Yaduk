import { createServerFn } from "@tanstack/react-start";
import { generateJson, generateText } from "./ai-gateway.server";
import type {
  ApiRouteSpec,
  BackendContractDoc,
  BackendServiceSpec,
  Blueprint,
  DatabaseTableSpec,
  DependencyItem,
  Feasibility,
  GeneratedCodeFile,
  ProjectCodebase,
  ProjectIdea,
  ProjectSetupSpec,
  QuestScroll,
  StudentProfile,
  UserWorkflowStep,
} from "./types";

const SYSTEM =
  "You are Yaduk, an expert final-year project advisor and systems architect for engineering students. " +
  "You are pragmatic, specific and encouraging. You never invent unrealistic scope. " +
  "Everything you write must be concrete: real technologies, real user groups, real numbers.";

function safeJoin(arr: any, fallback = "n/a"): string {
  if (Array.isArray(arr)) {
    return arr.filter(Boolean).join(", ") || fallback;
  }
  if (typeof arr === "string" && arr.trim().length > 0) {
    return arr.trim();
  }
  return fallback;
}

function profileBlock(p: any) {
  if (!p) return "STUDENT PROFILE: Standard Engineering Student";
  return `STUDENT PROFILE
Name: ${p.name || "Student Developer"}
Field: ${p.fieldOfStudy || "Computer Science & Engineering"} | Year: ${p.yearOfStudy || "Final Year"} | Experience: ${p.experienceLevel || "Intermediate"}
Skills: ${safeJoin(p.skills, "Full Stack, TypeScript, Python")}
Languages: ${safeJoin(p.languages, "TypeScript, Python, JavaScript, SQL")}
Frameworks/tools: ${safeJoin(p.frameworks, "React, FastAPI, PostgreSQL, Tailwind CSS")}
AI/ML knowledge: ${p.aiKnowledge || "Proficient"}
Previous projects: ${p.previousProjects || "Full-stack software project"}
Interests: ${safeJoin(p.interests, "Software Architecture, AI Systems")}
Preferred domains: ${safeJoin(p.domains, "Full-stack web, AI / ML")}
Career goal: ${p.careerGoal || p.ambition || "Full-Stack Software Engineer"}
Preferred project type: ${p.projectType || "Full-stack web application"}
Time budget: ${p.hoursPerWeek || p.weeklyHours || 15} hrs/week for ${p.weeks || 12} weeks
Team: ${p.teamSize || "1 (Solo Project)"} | Resources: ${safeJoin(p.resources, "Laptop only, Cloud resources")}
Preferred complexity: ${p.complexity || "Production-grade"}
Their own project ideas / extra notes: ${p.ownIdeas || "none"}`;
}

export const buildProfile = createServerFn({ method: "POST" })
  .inputValidator((data: { raw: StudentProfile }) => data)
  .handler(async ({ data }) => {
    const p = data.raw;
    const result = await generateJson<{
      summary: string;
      strengths: string[];
      watchOuts: string[];
    }>({
      system: SYSTEM,
      prompt: `${profileBlock(p)}

Write a structured read of this student. JSON shape:
{"summary": "3 sentence portrait covering capability, interests, constraints and goal",
 "strengths": ["4 short concrete strengths"],
 "watchOuts": ["3 short honest constraints or risks"]}`,
    });
    return { ...p, ...result } satisfies StudentProfile;
  });

export const generateIdeas = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: StudentProfile; feedback?: string[]; exclude?: string[] }) => data)
  .handler(async ({ data }) => {
    const { profile, feedback = [], exclude = [] } = data;
    const ideas = await generateJson<{ ideas: ProjectIdea[] }>({
      system: SYSTEM,
      prompt: `${profileBlock(profile)}

${feedback.length ? `STUDENT FEEDBACK SO FAR (most recent last):\n- ${feedback.join("\n- ")}\n` : ""}
${exclude.length ? `Do not repeat these project names: ${exclude.join(", ")}\n` : ""}
Generate 4 distinct, practical final-year project ideas tailored to this student, and score each one.
If the student wrote their own project ideas or notes above, build at least one idea directly on them.
Scores are 0-100. "overall" is your weighted suitability score.
Set "rarity" by overall: >=90 legendary, >=80 epic, >=68 rare, else common.

JSON shape:
{"ideas":[{"id":"kebab-case-id","name":"Product-style name","tagline":"max 8 words",
"problem":"1-2 sentences","solution":"2 sentences","targetUsers":"who exactly",
"difficulty":"Beginner|Intermediate|Advanced","estimatedTime":"e.g. 7-9 weeks",
"requiredSkills":["4-6 skills"],
"match":{"skill":0,"interest":0,"feasibility":0,"career":0,"portfolio":0,"time":0},
"overall":0,"why":"2 sentences explaining why this fits THIS student specifically",
"rarity":"common"}]}`,
    });
    return ideas.ideas.slice(0, 4);
  });

export const refineIdeas = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      profile: StudentProfile;
      idea: ProjectIdea;
      action: string;
      note?: string;
      feedback: string[];
    }) => data,
  )
  .handler(async ({ data }) => {
    const { profile, idea, action, note, feedback } = data;
    const result = await generateJson<{ ideas: ProjectIdea[] }>({
      system: SYSTEM,
      prompt: `${profileBlock(profile)}

The student is looking at this idea:
${JSON.stringify(idea)}

Their request: "${action}"${note ? ` — extra note: "${note}"` : ""}
Earlier feedback: ${feedback.join(" | ") || "none"}

Produce 3 new or reworked ideas that answer that request, scored the same way.
JSON shape: {"ideas":[{"id":"","name":"","tagline":"","problem":"","solution":"","targetUsers":"","difficulty":"","estimatedTime":"","requiredSkills":[],"match":{"skill":0,"interest":0,"feasibility":0,"career":0,"portfolio":0,"time":0},"overall":0,"why":"","rarity":"common"}]}`,
    });
    return result.ideas.slice(0, 3);
  });

export const analyzeFeasibility = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: StudentProfile; idea: ProjectIdea }) => data)
  .handler(async ({ data }) => {
    return await generateJson<Feasibility>({
      system: SYSTEM,
      prompt: `${profileBlock(data.profile)}

SELECTED PROJECT:
${JSON.stringify(data.idea)}

Judge honestly whether this student can realistically finish this project in their time budget with their resources.
JSON shape:
{"achievable":true,"verdict":"one punchy line","reasoning":"3-4 sentences comparing current skills vs required skills, complexity, time and resources",
"skillGaps":["skills they must learn"],"timeVerdict":"one line","resourceVerdict":"one line",
"simplified":{"name":"","summary":"2 sentences describing a trimmed version that definitely fits"},
"learningRoadmap":[{"skill":"","how":"specific resource or exercise","weeks":1}],
"alternative":{"name":"","summary":"2 sentences on a similar but more achievable project"}}`,
    });
  });

export const generateBlueprint = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      profile: StudentProfile;
      idea: ProjectIdea;
      feasibility: Feasibility | null;
      feedback: string[];
      direction?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const res = await generateJson<Blueprint>({
      system: SYSTEM,
      prompt: `${profileBlock(data.profile)}

FINAL PROJECT: ${JSON.stringify(data.idea)}
FEASIBILITY: ${JSON.stringify(data.feasibility)}
STUDENT FEEDBACK: ${data.feedback.join(" | ") || "none"}
CHOSEN DIRECTION: ${data.direction || "build the project as selected"}

Produce a complete, practical project blueprint. The tech stack must lean on skills the student already has,
with at most two genuinely new technologies. The roadmap must fit ${data.profile.hoursPerWeek} hrs/week over ${data.profile.weeks} weeks.
JSON shape:
{"title":"",
"overview":{"summary":"","problemStatement":"","proposedSolution":"","objectives":["4-5"],"targetUsers":"","expectedImpact":""},
"mvpFeatures":[{"name":"","detail":""}],
"advancedFeatures":[{"name":"","detail":""}],
"futureImprovements":["4"],
"stack":[{"name":"","category":"Frontend|Backend|Database|AI|DevOps|Tooling","why":"","howUsed":"","isNew":false}],
"architecture":{"layers":[{"name":"","parts":["..."]}],"dataFlow":"2-3 sentences describing the request/data path"},
"userWorkflow":[{"step":1,"screen":"Landing & Showcase","route":"/","userAction":"Explore platform capabilities and CTA","keyComponents":["Hero","Feature Matrix","Auth CTA"]},{"step":2,"screen":"Authentication & Onboarding","route":"/auth","userAction":"Sign up / login and obtain access credentials","keyComponents":["AuthForm","OAuth2 Handler","API Key View"]},{"step":3,"screen":"Main Telemetry Dashboard","route":"/dashboard","userAction":"View key system metrics and health status","keyComponents":["KPI Cards","Telemetry Graph","Quick Actions"]},{"step":4,"screen":"Core Domain Workflow / Registry","route":"/workspace","userAction":"Execute core project feature and manage records","keyComponents":["Input Form","Data Table with Status Pills","Filters"]},{"step":5,"screen":"Audit, Reviews & Compliance","route":"/audit","userAction":"Inspect history, review records, and export reports","keyComponents":["Audit Trail","Integrity Verifier","Export"]}],
"roadmap":[{"phase":"01","title":"e.g. Planning & requirements","weeks":"wk 1","tasks":["3-5 concrete tasks"]}],
"challenges":[{"challenge":"","solution":""}]}
Roadmap must cover planning, requirements, setup, core/backend, frontend, database, AI integration if relevant, testing, deployment.
User workflow must cover the real end-to-end user navigation journey from landing to reviews.`,
    });
    if (!res.userWorkflow || res.userWorkflow.length === 0) {
      res.userWorkflow = getDefaultUserWorkflow(res.title);
    }
    return res;
  });

export function getDefaultUserWorkflow(title?: string): UserWorkflowStep[] {
  return [
    {
      step: 1,
      screen: "Landing & Public Showcase",
      route: "/",
      userAction: "Discover platform capabilities, live architecture demo, and initiate onboarding.",
      keyComponents: ["Hero Showcase", "Feature Matrix", "API Specs Link", "Auth CTA"],
    },
    {
      step: 2,
      screen: "Authentication & Client Onboarding",
      route: "/auth",
      userAction: "Register user/client profile, manage credentials, and issue authentication tokens.",
      keyComponents: ["Client Auth Form", "OAuth2 / Session Handler", "Credentials Vault"],
    },
    {
      step: 3,
      screen: "Primary Telemetry Dashboard",
      route: "/dashboard",
      userAction: "Monitor system health, live KPI metrics, throughput, and system alerts.",
      keyComponents: ["Live KPI Metric Cards", "Throughput Chart", "Activity Feed"],
    },
    {
      step: 4,
      screen: "Core Domain Engine / Registry",
      route: "/workspace",
      userAction: "Execute the primary application workflow, create/process entities, and view live results.",
      keyComponents: ["Action Input Form", "Data Records Table", "Status Badges & Filters"],
    },
    {
      step: 5,
      screen: "Audit, Reviews & System Inspection",
      route: "/audit",
      userAction: "Inspect event history, review state transitions, verify integrity, and export data.",
      keyComponents: ["Tamper-Evident Event Stream", "Integrity Verifier", "Export CSV/JSON"],
    },
  ];
}

export function generateBlueprintScrollFallback(blueprint: Blueprint): QuestScroll {
  const bp = blueprint;
  const title = bp.title || "Engineering Capstone Project";
  const overview = bp.overview || {
    summary: "Production-grade full-stack architecture with modular components.",
    problemStatement: "Bridging the gap between conceptual requirements and practical execution.",
    proposedSolution: "An end-to-end engineered software solution.",
    objectives: ["Establish core workflow", "Implement data persistence", "Deploy verifiable MVP"],
    targetUsers: "Evaluators and end users",
    expectedImpact: "High operational efficiency and transparent technical design",
  };

  const stackNames = Array.isArray(bp.stack) && bp.stack.length > 0
    ? bp.stack.map((s) => s?.name).filter(Boolean)
    : ["TypeScript", "React", "Node.js / Python", "PostgreSQL", "Tailwind CSS"];

  const firstChallenge = Array.isArray(bp.challenges) && bp.challenges[0]
    ? `${bp.challenges[0].challenge}: ${bp.challenges[0].solution}`
    : "Scope creep: Deliver core MVP features first before adding complex secondary capabilities.";

  const mvpList = Array.isArray(bp.mvpFeatures) && bp.mvpFeatures.length > 0
    ? bp.mvpFeatures.map((f) => f?.name).filter(Boolean)
    : ["Authentication & User Profiles", "Core Domain Engine", "Analytics Dashboard"];

  return {
    tldr: overview.summary || `${title}: A targeted solution addressing ${overview.problemStatement || "critical domain needs"}.`,
    pitch: `We are building ${title} to solve ${overview.problemStatement || "key bottlenecks"}. Utilizing a robust stack of ${stackNames.slice(0, 3).join(", ") || "modern tools"}, our MVP delivers ${mvpList.slice(0, 2).join(" and ") || "high-value functionality"}. The architecture ensures rapid development, seamless supervisor evaluation, and reliable execution for ${overview.targetUsers || "evaluators"}.`,
    keyMoves: [
      {
        move: "Modular Component & Service Layer",
        why: bp.architecture?.dataFlow || "Decouples data ingest, business logic, and UI for reliable grading and unit testing.",
      },
      {
        move: `MVP Focus: ${mvpList[0] || "Core Workflow"}`,
        why: "Establishes verifiable value in the initial milestone before tackling complex edge integrations.",
      },
    ],
    loadout: stackNames.slice(0, 7),
    nextThreeMoves: [
      "Initialize Git repository, environment variables, and core package dependencies.",
      `Implement data schemas and REST/GraphQL contracts for ${mvpList[0] || "the core domain"}.`,
      "Build the interactive frontend views and connect end-to-end API integration workflows.",
    ],
    bossRisks: [
      firstChallenge,
      "Third-party API / latency bottlenecks: Implement circuit breakers, local caching, and reliable fallback states.",
      "Evaluation live-demo panic: Rehearse with automated test fixtures and pre-seeded demonstration data.",
    ],
  };
}

export function applyBlueprintChangeFallback(
  blueprint: Blueprint,
  request: string,
): { blueprint: Blueprint; changeSummary: string } {
  const reqLower = request.toLowerCase();
  const updated: Blueprint = JSON.parse(JSON.stringify(blueprint));

  let summary = `Updated plan to incorporate: "${request}"`;

  // 1. Update solution description
  if (updated.overview) {
    const existing = updated.overview.proposedSolution || "";
    updated.overview.proposedSolution = existing
      ? `${existing} (Updated: ${request})`
      : request;
  }

  // 2. Add or update MVP features
  if (!Array.isArray(updated.mvpFeatures)) {
    updated.mvpFeatures = [];
  }
  const featureName = request.length > 36 ? request.slice(0, 33) + "..." : request;
  updated.mvpFeatures.push({
    name: featureName,
    detail: `Integrated per student request: "${request}"`,
  });

  // 3. Handle stack updates if tech mentioned
  if (/cut|remove|drop|exclude/.test(reqLower)) {
    summary = `Refined blueprint scope: simplified features per "${request}"`;
  } else if (/swap|replace|use\s+|add\s+|switch/.test(reqLower)) {
    summary = `Updated technology stack and feature requirements per "${request}"`;
    if (!Array.isArray(updated.stack)) updated.stack = [];
    const match = request.match(/(?:use|swap for|add|with|switch to)\s+([a-zA-Z0-9.+]+)/i);
    const newTool = match?.[1]?.trim();
    if (newTool && newTool.length > 1 && !updated.stack.some((s) => s.name.toLowerCase() === newTool.toLowerCase())) {
      updated.stack.push({
        name: newTool,
        category: "Tooling",
        why: `Requested update by student`,
        howUsed: `Integrated into core architecture`,
        isNew: true,
      });
    }
  }

  return { blueprint: updated, changeSummary: summary };
}

export const updateBlueprint = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { profile: StudentProfile; blueprint: Blueprint; request: string }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const res = await generateJson<{ blueprint: Blueprint; changeSummary: string }>({
        system: SYSTEM,
        prompt: `${profileBlock(data.profile)}

CURRENT BLUEPRINT:
${JSON.stringify(data.blueprint)}

The student asked for this change: "${data.request}"

Apply the change and return the FULL updated blueprint, keeping every field and staying consistent with the
student's skills, constraints and goal. Keep untouched parts identical.
JSON shape: {"blueprint": <same schema as the current blueprint>, "changeSummary":"one sentence on what changed"}`,
      });

      if (res?.blueprint && res?.changeSummary) {
        return res;
      }
    } catch (err) {
      console.warn("AI updateBlueprint encountered error, applying smart blueprint modifier fallback:", err);
    }

    return applyBlueprintChangeFallback(data.blueprint, data.request);
  });

export const summarizeBlueprint = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: StudentProfile; blueprint: Blueprint }) => data)
  .handler(async ({ data }) => {
    try {
      const scroll = await generateJson<QuestScroll>({
        system: SYSTEM,
        prompt: `${profileBlock(data.profile)}

CURRENT BLUEPRINT:
${JSON.stringify(data.blueprint)}

Summarise this plan so the student can explain it out loud in under a minute, and so they know what to do next.
Be specific to THIS plan — no generic advice.
JSON shape:
{"tldr":"1 punchy sentence describing the project",
 "pitch":"3 sentences the student could say to a supervisor",
 "keyMoves":[{"move":"short name of a decisive build decision","why":"1 sentence"}],
 "loadout":["5-7 tech stack items as short strings"],
 "nextThreeMoves":["3 concrete things to do first, in order"],
 "bossRisks":["3 short risks with a hint at how to dodge each"]}`,
      });

      if (scroll?.tldr && scroll?.pitch) {
        return {
          tldr: scroll.tldr,
          pitch: scroll.pitch,
          keyMoves: Array.isArray(scroll.keyMoves) ? scroll.keyMoves : [],
          loadout: Array.isArray(scroll.loadout) ? scroll.loadout : [],
          nextThreeMoves: Array.isArray(scroll.nextThreeMoves) ? scroll.nextThreeMoves : [],
          bossRisks: Array.isArray(scroll.bossRisks) ? scroll.bossRisks : [],
        };
      }
    } catch (err) {
      console.warn("AI summarizeBlueprint encountered error, utilizing plan scroll fallback:", err);
    }

    return generateBlueprintScrollFallback(data.blueprint);
  });

export type AiThemeSuggestion = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  badge: string;
  palette: string[];
  themeRationale: string;
};

export function generateProjectThemedSuggestions(
  blueprint: Blueprint,
  profile?: StudentProfile | null,
): AiThemeSuggestion[] {
  const text = `${blueprint.title || ""} ${blueprint.overview?.problemStatement || ""} ${blueprint.overview?.proposedSolution || ""} ${blueprint.overview?.targetUsers || ""} ${blueprint.stack?.map((s) => s.name).join(" ") || ""}`.toLowerCase();
  const title = blueprint.title || "Your Project";
  const targetUsers = blueprint.overview?.targetUsers || "evaluators and end-users";

  // 1. Health / Medical / Bio
  if (/health|patient|doctor|hospital|medical|disease|cancer|scan|clinical|cardio|ct\b|mri|drug|biomedical|ecg|mental|clinic|organ|blood/.test(text)) {
    return [
      {
        id: "clinical-precision",
        name: "Clinical Precision & Bio-Slate",
        tagline: "Sterile arctic canvas, diagnostic cobalt & high-fidelity alerts",
        description: "Zero visual fatigue layout with ice-blue neutral surfaces, crisp borders, and clinical-grade alert telemetry.",
        bestFor: "Medical evaluators, hospital review boards, diagnostic demos",
        badge: "CLINICAL GRADE",
        palette: ["#0F172A", "#0284C7", "#F0F9FF", "#EF4444"],
        themeRationale: `Tailored specifically for ${title}: provides high readability for ${targetUsers} with clinical clarity.`,
      },
      {
        id: "caregiver-mint",
        name: "Compassionate Care & Soothing Mint",
        tagline: "Soft sage paper, calming terracotta & approachable wellness",
        description: "Gentle organic curves, friendly card elevations, and warm accessible typography designed to reduce user anxiety.",
        bestFor: "Patient-facing mobile portals, wellness trackers, recovery journals",
        badge: "PATIENT CENTRIC",
        palette: ["#F8FAF8", "#059669", "#EA580C", "#334155"],
        themeRationale: `Designed for ${title}'s user experience: makes sensitive healthcare interactions feel welcoming and reassuring.`,
      },
      {
        id: "spectral-dark-hud",
        name: "Spectral Diagnostic Dark Mode",
        tagline: "Obsidian void, luminous cyan telemetry & scan heatmaps",
        description: "Ultra-dark radiology-grade canvas with bioluminescent indicators and high-contrast anomaly bounding boxes.",
        bestFor: "AI inference visualizations, CT/MRI scan viewers, computer vision capstones",
        badge: "AI VISION & IMAGING",
        palette: ["#050811", "#06B6D4", "#F43F5E", "#1E293B"],
        themeRationale: `Optimized for ${title}'s AI models and diagnostic pipeline, accentuating inference findings against deep contrast.`,
      },
    ];
  }

  // 2. Agriculture / CleanTech / Environmental / IoT
  if (/crop|farm|agri|plant|soil|irrigation|weather|greenhouse|harvest|solar|eco|water|satellite|pest|leaf|fertilizer|livestock/.test(text)) {
    return [
      {
        id: "terra-botanical",
        name: "Terra Verdant & Botanical Tech",
        tagline: "Deep forest pine, golden harvest accents & organic borders",
        description: "Blends earthy chlorophyll greens with warm soil tones and clean agricultural sensor metrics.",
        bestFor: "Agronomists, agricultural engineering fairs, farm monitoring dashboards",
        badge: "AGRO-TECH VERIFIED",
        palette: ["#14532D", "#F59E0B", "#F0FDF4", "#78350F"],
        themeRationale: `Directly reflects ${title}'s agricultural domain, making sensor data and crop insights feel natural to ${targetUsers}.`,
      },
      {
        id: "rugged-field-telemetry",
        name: "Field Telemetry & Sunlight Rugged",
        tagline: "Matte industrial charcoal, safety amber & extreme outdoor contrast",
        description: "High-contrast daylight-optimized telemetry designed for rugged outdoor field tablets and drone monitors.",
        bestFor: "Outdoor deployment, drone survey stations, solar & soil IoT sensors",
        badge: "FIELD READY",
        palette: ["#18181B", "#EAB308", "#22C55E", "#FAFAFA"],
        themeRationale: `Engineered for real-world field conditions where ${targetUsers} need instant glanceability under bright sun.`,
      },
      {
        id: "eco-clean-glass",
        name: "Eco-Modern Clean Glass",
        tagline: "Translucent leaf-green frosted glass & ambient sustainability glow",
        description: "Modern sustainability aesthetic with subtle glassmorphic elevation, sage gradients, and ecological KPI cards.",
        bestFor: "CleanTech capstones, smart city climate tracking, environmental showcases",
        badge: "CLEANTECH POLISH",
        palette: ["#064E3B", "#10B981", "#ECFDF5", "#047857"],
        themeRationale: `Gives ${title} a sleek venture-backed CleanTech posture to impress hackathon judges and evaluators.`,
      },
    ];
  }

  // 3. Finance / Web3 / Crypto / E-Commerce / Billing
  if (/finance|fintech|bank|pay|crypto|token|wallet|ledger|fraud|stock|trade|money|invoice|market|solidity|nft|contract|decentralized|loan|credit/.test(text)) {
    return [
      {
        id: "vault-platinum",
        name: "Vault Platinum & High-Trust Slate",
        tagline: "Midnight navy, platinum micro-borders & glowing emerald ledger",
        description: "Institutional financial security aesthetic with precision decimal typography and audit-ready indicators.",
        bestFor: "Banking supervisors, fintech incubators, security compliance audits",
        badge: "INSTITUTIONAL TRUST",
        palette: ["#0A1128", "#10B981", "#E2E8F0", "#1C2541"],
        themeRationale: `Instills immediate trust and compliance readiness for ${title}, proving data integrity to ${targetUsers}.`,
      },
      {
        id: "terminal-high-freq",
        name: "Terminal High-Density Dark",
        tagline: "Obsidian void, tick amber, electric cyan & monospaced feeds",
        description: "Ultra-dense algorithmic trading layout with live telemetry tickers, gas monitors, and monospace transaction logs.",
        bestFor: "Crypto protocols, fraud detection pipelines, real-time transaction monitors",
        badge: "ALGO TRADING SPEED",
        palette: ["#0D1117", "#00F0FF", "#F59E0B", "#161B22"],
        themeRationale: `Built for ${title}'s real-time transaction throughput and rapid state changes.`,
      },
      {
        id: "neo-bank-coral",
        name: "Neo-Bank Vivid Gradient",
        tagline: "Crisp white canvas, electric violet & punchy coral curves",
        description: "Modern consumer banking poise inspired by Stripe and Revolut, featuring smooth cards and vibrant action buttons.",
        bestFor: "Consumer fintech, P2P payments, personal budgeting apps",
        badge: "CONSUMER FINTECH",
        palette: ["#FFFFFF", "#6366F1", "#F43F5E", "#0F172A"],
        themeRationale: `Transforms ${title} into a delightful, modern product that feels ready for production release.`,
      },
    ];
  }

  // 4. Cybersecurity / Cloud / DevOps / Networks
  if (/security|cyber|packet|firewall|auth|intrusion|threat|vulnerability|network|cloud|kubernetes|docker|server|linux|protocol|phishing|malware/.test(text)) {
    return [
      {
        id: "zero-trust-stealth",
        name: "Zero-Trust Stealth Terminal",
        tagline: "Matte carbon, matrix phosphor green & tactical breach crimson",
        description: "SOC operations console with high-density event streams, intrusion severity badges, and monospace logs.",
        bestFor: "Cybersecurity defenses, packet inspection tools, automated vulnerability scanners",
        badge: "SOC OPERATIONS",
        palette: ["#0B0E14", "#22C55E", "#EF4444", "#1F2430"],
        themeRationale: `Matches the visual standards of enterprise SOC analysts and security evaluators assessing ${title}.`,
      },
      {
        id: "cloud-orchestrator",
        name: "Cloud Orchestrator Bento",
        tagline: "Dark titanium zinc, sapphire pipeline glows & cluster topology",
        description: "Modular bento-grid layout showcasing microservice latency, container health, and CI/CD status cards.",
        bestFor: "DevOps tools, cloud infrastructure monitors, distributed systems",
        badge: "INFRASTRUCTURE POLISH",
        palette: ["#09090B", "#3B82F6", "#A855F7", "#27272A"],
        themeRationale: `Highlights ${title}'s architectural complexity and multi-service topology with clean enterprise elegance.`,
      },
      {
        id: "tactical-recon",
        name: "Tactical Infrared Monolith",
        tagline: "Stealth obsidian, monochrome steel & hazard amber telemetry",
        description: "Minimalist defense telemetry featuring monospaced IP tables, anomaly alerts, and threat vectors.",
        bestFor: "Network defense showcases, endpoint security prototypes, threat intel",
        badge: "THREAT INTEL",
        palette: ["#121212", "#F97316", "#38BDF8", "#2A2A2A"],
        themeRationale: `Puts incident detection and system vulnerabilities front-and-center for ${title}.`,
      },
    ];
  }

  // 5. Education / Student / Campus / Quiz / EdTech
  if (/student|learn|study|course|quiz|exam|college|school|tutor|education|campus|teacher|book|class|notes|classroom|hackathon/.test(text)) {
    return [
      {
        id: "campus-playful-bento",
        name: "Campus Bento & Playful Mint",
        tagline: "Warm ivory, playful pastel violet & rewarding XP badges",
        description: "High-engagement student dashboard with bouncy rounded cards, gamified streaks, and vivid milestone celebration.",
        bestFor: "EdTech platforms, quiz bots, student study groups, college hackathons",
        badge: "HIGH ENGAGEMENT",
        palette: ["#FEFCE8", "#8B5CF6", "#10B981", "#1E1B4B"],
        themeRationale: `Keeps ${targetUsers} energized while interacting with ${title}'s learning modules.`,
      },
      {
        id: "academic-codex",
        name: "Focus Academic & Ivory Codex",
        tagline: "Scholarly cream paper, rich burgundy & distraction-free serif",
        description: "Refined editorial layout emphasizing research papers, structured notes, and deep scholarly focus.",
        bestFor: "Academic literature reviews, thesis portals, university faculty presentations",
        badge: "SCHOLARLY POISE",
        palette: ["#FAF8F5", "#991B1B", "#166534", "#292524"],
        themeRationale: `Gives ${title} university-grade gravitas and academic elegance for faculty review committees.`,
      },
      {
        id: "cyber-tutor-hud",
        name: "Cyber-Tutor Gamified Dark Mode",
        tagline: "Midnight navy, electric cyan & radiant level-up gradients",
        description: "Immersive dark mode designed for late-night coding sessions and competitive student leaderboards.",
        bestFor: "Coding bootcamps, competitive programming platforms, STEM tutors",
        badge: "GAMIFIED CODING",
        palette: ["#0F172A", "#38BDF8", "#F43F5E", "#1E293B"],
        themeRationale: `Transforms ${title} into a captivating daily challenge that drives student retention.`,
      },
    ];
  }

  // 6. AI / ML / Data Science / Computer Vision / NLP
  if (/ai\b|ml\b|vision|dataset|nlp|neural|deep learning|tensor|predict|recommend|gpt|llm|classification|detection|speech|whisper|yolo|face/.test(text)) {
    return [
      {
        id: "neural-aurora",
        name: "Neural Aurora & Deep Indigo",
        tagline: "Cosmic indigo void, radiant purple gradients & tensor vectors",
        description: "Multi-dimensional AI aesthetic with glowing latent vector cards, token stream metrics, and fluid halos.",
        bestFor: "LLM tooling, generative AI capstones, computer vision models",
        badge: "NEURAL CORE",
        palette: ["#0B0F19", "#818CF8", "#C084FC", "#1E293B"],
        themeRationale: `Visually communicates the underlying machine intelligence and latent representations of ${title}.`,
      },
      {
        id: "cognitive-minimal-bento",
        name: "Cognitive Precision Bento",
        tagline: "Ice-white canvas, royal cobalt telemetry & confidence meters",
        description: "Clean, explainable AI dashboard with precision ROC curves, model loss telemetry, and modular cards.",
        bestFor: "AI safety demos, production ML ops, academic defense presentations",
        badge: "EXPLAINABLE AI",
        palette: ["#F8FAFC", "#2563EB", "#059669", "#0F172A"],
        themeRationale: `Proves model accuracy and verifiable inferences for ${title} to demanding project supervisors.`,
      },
      {
        id: "ai-hacker-brutalism",
        name: "Hacker AI High-Contrast Brutalism",
        tagline: "Bold black borders, electric yellow badges & raw developer energy",
        description: "Punchy, unapologetic neo-brutalist interface that screams hackathon winner and rapid AI innovation.",
        bestFor: "High-energy hackathon pitches, prototype demos, developer conferences",
        badge: "HACKATHON WINNER",
        palette: ["#FEF08A", "#000000", "#38BDF8", "#FFFFFF"],
        themeRationale: `Ensures ${title} stands out instantly on screen during high-velocity 3-minute project evaluations.`,
      },
    ];
  }

  // 7. General Engineering / Full-Stack Default Tailored to Project Title
  return [
    {
      id: "project-modern-bento",
      name: `${title} Modern SaaS Bento`,
      tagline: "Polished neutral slate, royal indigo & structured bento cards",
      description: "Clean contemporary engineering layout with micro-borders, rounded-2xl cards, and responsive metrics.",
      bestFor: "Comprehensive final year engineering capstones, full-stack web demos",
      badge: "ENGINEERING STANDARD",
      palette: ["#0F172A", "#3B82F6", "#F8FAFC", "#E2E8F0"],
      themeRationale: `Formulated specifically for ${title}: balances technical data density with polished visual ergonomics.`,
    },
    {
      id: "project-bold-brutalist",
      name: `${title} Bold Impact Brutalism`,
      tagline: "Chunky 3px outlines, vivid drop shadows & energetic typography",
      description: "Eye-catching high contrast interface with crisp component boundaries and vibrant call-to-actions.",
      bestFor: "Student project competitions, live audience demos, capstone fairs",
      badge: "MAXIMUM VISIBILITY",
      palette: ["#FEF08A", "#BBF7D0", "#DDD6FE", "#000000"],
      themeRationale: `Guarantees ${title}'s key workflows and architecture pop off the screen during review.`,
    },
    {
      id: "project-deep-cyber",
      name: `${title} Obsidian Telemetry HUD`,
      tagline: "Pitch black background, radiant cyan badges & monospace telemetry",
      description: "High-tech telemetry console featuring monospaced status logs, glowing data cards, and rapid state feedback.",
      bestFor: "Real-time systems, IoT integrations, backend and API architecture demos",
      badge: "REAL-TIME TELEMETRY",
      palette: ["#05050A", "#00F0FF", "#FF007F", "#1A1A2E"],
      themeRationale: `Highlights ${title}'s real-time features and architectural depth with futuristic precision.`,
    },
  ];
}

export const suggestThemes = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: StudentProfile; blueprint: Blueprint }) => data)
  .handler(async ({ data }) => {
    try {
      const res = await generateJson<{ suggestions: AiThemeSuggestion[] }>({
        system: SYSTEM,
        prompt: `${profileBlock(data.profile)}

PROJECT BLUEPRINT:
Title: ${data.blueprint.title}
Problem: ${data.blueprint.overview.problemStatement}
Solution: ${data.blueprint.overview.proposedSolution}
Target Users: ${data.blueprint.overview.targetUsers}
Tech Stack: ${data.blueprint.stack.map((s) => s.name).join(", ")}

As Yaduk (AI project architect & design advisor), analyze the domain, problem statement, target audience, and technology of this engineering project.
Devise 3 distinct, creative, and highly tailored UI design theme suggestions that would make this specific project stand out in college evaluations, hackathons, or supervisor presentations.
Every suggestion MUST be deeply customized to "${data.blueprint.title}" and its specific problem domain. Do not produce generic themes.

Ensure the palettes are 4 complementary hex color codes.

JSON shape:
{
  "suggestions": [
    {
      "id": "kebab-case-id",
      "name": "Evocative Theme Name",
      "tagline": "Punchy 6-8 word aesthetic summary",
      "description": "1-2 sentences explaining the visual layout, typography, borders, and mood",
      "bestFor": "Who or what demo context this theme shines in",
      "badge": "CURATED FOR THIS PROJECT",
      "palette": ["#hex1", "#hex2", "#hex3", "#hex4"],
      "themeRationale": "1-2 sentences explaining why this theme fits THIS project's problem domain and users specifically."
    }
  ]
}

Return strictly valid JSON with 3 creative suggestions.`,
      });

      if (res?.suggestions && res.suggestions.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn("AI gateway error in suggestThemes, using smart domain heuristic fallback:", err);
    }

    return { suggestions: generateProjectThemedSuggestions(data.blueprint, data.profile) };
  });

export function generateBackendContractFallback(
  blueprint: Blueprint,
  profile?: StudentProfile | null
): BackendContractDoc {
  const title = blueprint.title || "Production Software Platform";
  const backendTech =
    blueprint.stack.find(
      (s) =>
        s.category.toLowerCase().includes("backend") ||
        s.name.toLowerCase().includes("fastapi") ||
        s.name.toLowerCase().includes("express")
    )?.name || "FastAPI (Python 3.11)";

  const dbTech =
    blueprint.stack.find(
      (s) =>
        s.category.toLowerCase().includes("database") ||
        s.name.toLowerCase().includes("postgres") ||
        s.name.toLowerCase().includes("sql")
    )?.name || "PostgreSQL 16";

  const isPython =
    backendTech.toLowerCase().includes("python") ||
    backendTech.toLowerCase().includes("fastapi") ||
    backendTech.toLowerCase().includes("django");

  const workflow =
    blueprint.userWorkflow && blueprint.userWorkflow.length > 0
      ? blueprint.userWorkflow
      : getDefaultUserWorkflow(title);

  const screenMappings = workflow.map((step) => {
    let endpoints: string[] = [];
    let entities: string[] = [];
    if (step.route === "/" || step.step === 1) {
      endpoints = ["GET /api/v1/public/showcase", "GET /api/v1/health"];
      entities = ["telemetry_snapshots"];
    } else if (step.route === "/auth" || step.step === 2) {
      endpoints = [
        "POST /api/v1/auth/register",
        "POST /api/v1/auth/token",
        "GET /api/v1/auth/me",
      ];
      entities = ["users", "user_sessions"];
    } else if (step.route === "/dashboard" || step.step === 3) {
      endpoints = [
        "GET /api/v1/telemetry/metrics",
        "GET /api/v1/telemetry/throughput",
      ];
      entities = ["telemetry_snapshots", "domain_records"];
    } else if (step.route === "/workspace" || step.step === 4) {
      endpoints = [
        "GET /api/v1/records",
        "POST /api/v1/records",
        "GET /api/v1/records/{id}",
      ];
      entities = ["domain_records", "audit_logs"];
    } else {
      endpoints = [
        "GET /api/v1/audit/stream",
        "POST /api/v1/audit/verify",
        "GET /api/v1/audit/export",
      ];
      entities = ["audit_logs"];
    }
    return {
      screen: step.screen,
      route: step.route,
      apiEndpoints: endpoints,
      dbEntities: entities,
    };
  });

  const apiRoutes: ApiRouteSpec[] = [
    {
      method: "GET",
      route: "/api/v1/health",
      screenName: "System Health & Monitor",
      summary:
        "Evaluates backend health, database connection pool, and node memory status.",
      authRequired: false,
      responsePayload:
        '{\n  "status": "healthy",\n  "timestamp": "2026-09-19T22:00:00Z",\n  "database": "connected",\n  "version": "1.0.0"\n}',
      statusCodes: [
        { code: 200, description: "System operational" },
        { code: 503, description: "Database unavailable" },
      ],
    },
    {
      method: "POST",
      route: "/api/v1/auth/register",
      screenName: "Authentication & Onboarding (/auth)",
      summary:
        "Creates a new user account with hashed password credentials and assigns default student/client role.",
      authRequired: false,
      requestPayload:
        '{\n  "email": "student@university.edu",\n  "password": "SecurePassword123!",\n  "full_name": "Prakhar Sharma",\n  "role": "engineer"\n}',
      responsePayload:
        '{\n  "id": "usr_9981a",\n  "email": "student@university.edu",\n  "full_name": "Prakhar Sharma",\n  "role": "engineer",\n  "created_at": "2026-09-19T22:00:00Z"\n}',
      statusCodes: [
        { code: 201, description: "Account created successfully" },
        { code: 409, description: "Email already registered" },
        { code: 422, description: "Validation error" },
      ],
    },
    {
      method: "POST",
      route: "/api/v1/auth/token",
      screenName: "Authentication & Onboarding (/auth)",
      summary:
        "OAuth2 compatible password grant; verifies password hash and returns JWT Bearer access token.",
      authRequired: false,
      requestPayload:
        '{\n  "username": "student@university.edu",\n  "password": "SecurePassword123!"\n}',
      responsePayload:
        '{\n  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "token_type": "bearer",\n  "expires_in": 3600,\n  "user_id": "usr_9981a"\n}',
      statusCodes: [
        { code: 200, description: "Authentication successful" },
        { code: 401, description: "Invalid credentials" },
      ],
    },
    {
      method: "GET",
      route: "/api/v1/auth/me",
      screenName: "Authentication & Onboarding (/auth)",
      summary:
        "Resolves JWT bearer token from Authorization header and returns authenticated user identity.",
      authRequired: true,
      responsePayload:
        '{\n  "id": "usr_9981a",\n  "email": "student@university.edu",\n  "full_name": "Prakhar Sharma",\n  "role": "engineer",\n  "is_active": true\n}',
      statusCodes: [
        { code: 200, description: "Authorized user profile" },
        { code: 401, description: "Token missing or expired" },
      ],
    },
    {
      method: "GET",
      route: "/api/v1/telemetry/metrics",
      screenName: "Main Telemetry Dashboard (/dashboard)",
      summary:
        "Aggregates live KPI telemetry, system throughput, and operational status metrics.",
      authRequired: true,
      responsePayload:
        '{\n  "total_records": 1284,\n  "system_throughput_rps": 42.8,\n  "integrity_score_pct": 99.4,\n  "status_summary": "All systems operational",\n  "recent_activity_count": 18\n}',
      statusCodes: [
        { code: 200, description: "Telemetry metrics calculated" },
        { code: 401, description: "Unauthorized" },
      ],
    },
    {
      method: "GET",
      route: "/api/v1/records",
      screenName: "Core Domain Workflow / Registry (/workspace)",
      summary:
        "Fetches paginated records for the core project feature with keyword search and category filtering.",
      authRequired: true,
      responsePayload:
        '{\n  "items": [\n    {\n      "id": "rec_01",\n      "title": "Primary Entity Record",\n      "category": "High Priority",\n      "status": "Processed",\n      "created_at": "2026-09-19T21:40:00Z"\n    }\n  ],\n  "total": 42,\n  "page": 1,\n  "limit": 20\n}',
      statusCodes: [
        { code: 200, description: "List of records" },
        { code: 401, description: "Unauthorized" },
      ],
    },
    {
      method: "POST",
      route: "/api/v1/records",
      screenName: "Core Domain Workflow / Registry (/workspace)",
      summary:
        "Executes primary project feature: validates payload, applies business logic rules, and records audit trace.",
      authRequired: true,
      requestPayload:
        '{\n  "title": "New System Transaction",\n  "category": "Analysis",\n  "payload": {\n    "input_data": "sample payload",\n    "parameters": {"depth": 3}\n  }\n}',
      responsePayload:
        '{\n  "id": "rec_02",\n  "title": "New System Transaction",\n  "status": "Completed",\n  "result": {\n    "computed_score": 94.2,\n    "verified": true\n  },\n  "created_at": "2026-09-19T22:05:00Z"\n}',
      statusCodes: [
        { code: 201, description: "Record processed and stored" },
        { code: 400, description: "Invalid payload input" },
        { code: 401, description: "Unauthorized" },
      ],
    },
    {
      method: "GET",
      route: "/api/v1/audit/stream",
      screenName: "Audit, Reviews & Compliance (/audit)",
      summary:
        "Retrieves the immutable audit trail of state changes and cryptographic signatures for inspection.",
      authRequired: true,
      responsePayload:
        '{\n  "audit_events": [\n    {\n      "id": "aud_101",\n      "action_type": "RECORD_PROCESSED",\n      "entity_id": "rec_02",\n      "signature_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",\n      "created_at": "2026-09-19T22:05:01Z"\n    }\n  ]\n}',
      statusCodes: [
        { code: 200, description: "Audit trail stream" },
        { code: 401, description: "Unauthorized" },
      ],
    },
    {
      method: "POST",
      route: "/api/v1/audit/verify",
      screenName: "Audit, Reviews & Compliance (/audit)",
      summary:
        "Verifies the cryptographic signature hash of a recorded action to guarantee zero tampering.",
      authRequired: true,
      requestPayload:
        '{\n  "event_id": "aud_101",\n  "expected_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"\n}',
      responsePayload:
        '{\n  "verified": true,\n  "tamper_detected": false,\n  "algorithm": "SHA-256",\n  "timestamp": "2026-09-19T22:05:01Z"\n}',
      statusCodes: [
        { code: 200, description: "Signature verification outcome" },
        { code: 404, description: "Event ID not found" },
      ],
    },
  ];

  const rawSqlDdl = `-- ============================================================================
-- PRODUCTION RELATIONAL DATABASE SCHEMA: ${title.toUpperCase()}
-- Generated by Yaduk Architecture Engine (${dbTech})
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'engineer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. USER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_jti VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_jti ON user_sessions(token_jti);

-- 3. DOMAIN WORKSPACE RECORDS TABLE
CREATE TABLE IF NOT EXISTS domain_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domain_records_user_id ON domain_records(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_records_status ON domain_records(status);
CREATE INDEX IF NOT EXISTS idx_domain_records_payload ON domain_records USING GIN(payload);

-- 4. TELEMETRY SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS telemetry_snapshots (
    id BIGSERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(12, 4) NOT NULL,
    change_pct NUMERIC(6, 2) DEFAULT 0.0,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_name_time ON telemetry_snapshots(metric_name, recorded_at DESC);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES domain_records(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    signature_hash VARCHAR(64) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_record_id ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
`;

  const tables: DatabaseTableSpec[] = [
    {
      tableName: "users",
      description:
        "Stores client & developer user credentials, role allocations, and security flags.",
      columns: [
        {
          name: "id",
          type: "UUID",
          isPrimary: true,
          description: "Unique identifier (gen_random_uuid)",
        },
        {
          name: "email",
          type: "VARCHAR(255)",
          nullable: false,
          description: "Unique client email address",
        },
        {
          name: "hashed_password",
          type: "VARCHAR(255)",
          nullable: false,
          description: "Bcrypt/Argon2 password digest",
        },
        {
          name: "full_name",
          type: "VARCHAR(150)",
          nullable: false,
          description: "Full student/client name",
        },
        {
          name: "role",
          type: "VARCHAR(50)",
          nullable: false,
          description: "Role-based access role ('engineer', 'admin')",
        },
        {
          name: "is_active",
          type: "BOOLEAN",
          nullable: false,
          description: "Account status toggle",
        },
        {
          name: "created_at",
          type: "TIMESTAMPTZ",
          nullable: false,
          description: "Timestamp of record creation",
        },
      ],
      indexes: ["idx_users_email (UNIQUE)"],
    },
    {
      tableName: "user_sessions",
      description:
        "Maintains active JWT token identification (JTI) for token revocation and single-sign-on validation.",
      columns: [
        {
          name: "id",
          type: "UUID",
          isPrimary: true,
          description: "Session identifier",
        },
        {
          name: "user_id",
          type: "UUID",
          isForeign: true,
          references: "users(id)",
          nullable: false,
          description: "Foreign key reference to user",
        },
        {
          name: "token_jti",
          type: "VARCHAR(255)",
          nullable: false,
          description: "Unique JWT identifier",
        },
        {
          name: "expires_at",
          type: "TIMESTAMPTZ",
          nullable: false,
          description: "Token expiry timestamp",
        },
        {
          name: "created_at",
          type: "TIMESTAMPTZ",
          nullable: false,
          description: "Login timestamp",
        },
      ],
      indexes: ["idx_sessions_user_id", "idx_sessions_jti"],
    },
    {
      tableName: "domain_records",
      description:
        "Core project transaction entity holding input form payloads and computed domain results.",
      columns: [
        {
          name: "id",
          type: "UUID",
          isPrimary: true,
          description: "Record identifier",
        },
        {
          name: "user_id",
          type: "UUID",
          isForeign: true,
          references: "users(id)",
          nullable: false,
          description: "Author / owner user",
        },
        {
          name: "title",
          type: "VARCHAR(255)",
          nullable: false,
          description: "Record or item name",
        },
        {
          name: "category",
          type: "VARCHAR(100)",
          nullable: false,
          description: "Grouping or classification tag",
        },
        {
          name: "status",
          type: "VARCHAR(50)",
          nullable: false,
          description: "Workflow state ('Pending', 'Processed', 'Failed')",
        },
        {
          name: "payload",
          type: "JSONB",
          nullable: false,
          description: "Dynamic JSON input attributes",
        },
        {
          name: "result",
          type: "JSONB",
          nullable: false,
          description: "Processed domain results & analytics",
        },
        {
          name: "created_at",
          type: "TIMESTAMPTZ",
          nullable: false,
          description: "Creation timestamp",
        },
      ],
      indexes: [
        "idx_domain_records_user_id",
        "idx_domain_records_status",
        "idx_domain_records_payload (GIN)",
      ],
    },
    {
      tableName: "telemetry_snapshots",
      description:
        "High-frequency metric capture for dashboard telemetry, KPI cards, and throughput graphs.",
      columns: [
        {
          name: "id",
          type: "BIGSERIAL",
          isPrimary: true,
          description: "Sequential autoincrement ID",
        },
        {
          name: "metric_name",
          type: "VARCHAR(100)",
          nullable: false,
          description: "e.g. throughput_rps, active_jobs",
        },
        {
          name: "metric_value",
          type: "NUMERIC(12,4)",
          nullable: false,
          description: "Calculated numeric value",
        },
        {
          name: "change_pct",
          type: "NUMERIC(6,2)",
          nullable: true,
          description: "Percentage shift over baseline",
        },
        {
          name: "recorded_at",
          type: "TIMESTAMPTZ",
          nullable: false,
          description: "Telemetry timestamp",
        },
      ],
      indexes: ["idx_telemetry_name_time"],
    },
    {
      tableName: "audit_logs",
      description:
        "Append-only cryptographic event log providing proof-of-work and state change auditability.",
      columns: [
        {
          name: "id",
          type: "UUID",
          isPrimary: true,
          description: "Log event identifier",
        },
        {
          name: "record_id",
          type: "UUID",
          isForeign: true,
          references: "domain_records(id)",
          nullable: true,
          description: "Target entity ID",
        },
        {
          name: "user_id",
          type: "UUID",
          isForeign: true,
          references: "users(id)",
          nullable: true,
          description: "Actor user ID",
        },
        {
          name: "action_type",
          type: "VARCHAR(100)",
          nullable: false,
          description:
            "Action event ('RECORD_CREATED', 'AUDIT_VERIFIED')",
        },
        {
          name: "signature_hash",
          type: "VARCHAR(64)",
          nullable: false,
          description: "SHA-256 cryptographic signature",
        },
        {
          name: "metadata",
          type: "JSONB",
          nullable: false,
          description: "Additional contextual telemetry",
        },
        {
          name: "created_at",
          type: "TIMESTAMPTZ",
          nullable: false,
          description: "Timestamp of event",
        },
      ],
      indexes: ["idx_audit_record_id", "idx_audit_created_at"],
    },
  ];

  const services: BackendServiceSpec[] = [
    {
      name: "Auth & Identity Service",
      purpose:
        "Manages password cryptography, JWT issuance, session validation, and user role authorization.",
      responsibilities: [
        "Hashes raw passwords using bcrypt with salt rounds = 12",
        "Signs and validates JWT access tokens using HS256 / RS256",
        "Injects authenticated user payload into route dependencies",
      ],
      associatedRoutes: [
        "/api/v1/auth/register",
        "/api/v1/auth/token",
        "/api/v1/auth/me",
      ],
    },
    {
      name: "Telemetry & Metrics Aggregator",
      purpose:
        "Polls and calculates real-time system performance, query throughput, and KPI metrics.",
      responsibilities: [
        "Aggregates total record counts and health status flags",
        "Calculates throughput trends for live dashboard charts",
        "Dispatches health check status for load balancers",
      ],
      associatedRoutes: [
        "/api/v1/health",
        "/api/v1/telemetry/metrics",
        "/api/v1/public/showcase",
      ],
    },
    {
      name: "Core Domain Workflow Engine",
      purpose:
        "Executes business logic, transactional validations, and writes processed results to the database.",
      responsibilities: [
        "Validates input request payloads against strict Pydantic / Zod schemas",
        "Executes transactional database writes with ACID guarantees",
        "Emits post-execution events to the audit service",
      ],
      associatedRoutes: ["/api/v1/records", "/api/v1/records/{id}"],
    },
    {
      name: "Audit & Cryptographic Security Service",
      purpose:
        "Maintains tamper-evident append-only log and computes cryptographic SHA-256 signatures.",
      responsibilities: [
        "Computes deterministic SHA-256 hash digests of domain transactions",
        "Provides integrity verification endpoint to prove data has not been altered",
        "Streams audit event history in JSON and CSV formats for external evaluation",
      ],
      associatedRoutes: [
        "/api/v1/audit/stream",
        "/api/v1/audit/verify",
        "/api/v1/audit/export",
      ],
    },
  ];

  const environmentVariables = [
    {
      key: "DATABASE_URL",
      example: "postgresql://postgres:postgres@localhost:5432/yaduk_db",
      purpose: "Relational database connection string with credentials",
    },
    {
      key: "SECRET_KEY",
      example: "prod_sec_99a81b2c4d5e6f7a8b9c0d1e2f3a4b5c",
      purpose:
        "Cryptographic secret used for signing JWT tokens and session cookies",
    },
    {
      key: "API_V1_PREFIX",
      example: "/api/v1",
      purpose: "Base routing prefix for all REST API endpoints",
    },
    {
      key: "ENVIRONMENT",
      example: "development",
      purpose: "Runtime mode ('development', 'staging', 'production')",
    },
    {
      key: "ACCESS_TOKEN_EXPIRE_MINUTES",
      example: "60",
      purpose: "Lifespan of issued JWT Bearer tokens before refresh required",
    },
    {
      key: "CORS_ORIGINS",
      example: "http://localhost:3000,http://localhost:5173",
      purpose: "Allowed frontend origin URLs for browser cross-origin requests",
    },
  ];

  const markdownSpec = `# Backend Architecture & System Contract
**Project:** ${title}  
**Backend Framework:** ${backendTech}  
**Database Engine:** ${dbTech}  
**Architecture Pattern:** Modular REST API with Service-Repository Pattern  

---

## 1. Application Screen-to-API Mapping
${screenMappings
  .map(
    (s) =>
      `- **${s.screen}** (\`${s.route}\`)\n  - Endpoints: ${s.apiEndpoints.map((e) => `\`${e}\``).join(", ")}\n  - Database Entities: ${s.dbEntities.map((e) => `\`${e}\``).join(", ")}`
  )
  .join("\n\n")}

---

## 2. REST API Route Specifications
${apiRoutes
  .map(
    (r) => `### \`${r.method}\` ${r.route}
* **Screen:** ${r.screenName}
* **Summary:** ${r.summary}
* **Authentication:** ${r.authRequired ? "🔒 Required (Bearer JWT)" : "🌐 Public"}
${r.requestPayload ? `* **Request Payload:**\n\`\`\`json\n${r.requestPayload}\n\`\`\`` : ""}
* **Response Payload:**
\`\`\`json
${r.responsePayload}
\`\`\`
`
  )
  .join("\n")}

---

## 3. Database Schema & Production DDL
\`\`\`sql
${rawSqlDdl}
\`\`\`

---

## 4. Backend Service Modules
${services
  .map(
    (srv) => `### ${srv.name}
* **Purpose:** ${srv.purpose}
* **Responsibilities:**
${srv.responsibilities.map((resp) => `  - ${resp}`).join("\n")}
* **Routes:** ${srv.associatedRoutes.map((rt) => `\`${rt}\``).join(", ")}
`
  )
  .join("\n")}

---

## 5. Environment Configuration (.env)
\`\`\`env
${environmentVariables.map((ev) => `${ev.key}=${ev.example}`).join("\n")}
\`\`\`
`;

  return {
    title,
    framework: backendTech,
    databaseEngine: dbTech,
    architecturePattern: isPython
      ? "FastAPI Modular Architecture (Routers, Pydantic Schemas, SQLAlchemy ORM, Service Layer)"
      : "Modular REST API Architecture (Express Controllers, Zod Schemas, Prisma ORM, Domain Services)",
    screenMappings,
    apiRoutes,
    databaseSchema: {
      overview: `Relational schema normalized to 3NF targeting ${dbTech}, featuring ACID compliance and foreign key cascade protection.`,
      tables,
      rawSqlDdl,
    },
    services,
    securitySpec: {
      authStrategy:
        "OAuth2 Password Grant with JWT Bearer tokens in Authorization header",
      tokenExpiry: "60 minutes with rolling refresh",
      passwordHashing: "Bcrypt (salt rounds = 12) / Argon2id",
      rbacDescription:
        "Role-based access control with standard 'engineer' and administrative roles.",
    },
    environmentVariables,
    markdownSpec,
  };
}

export const generateBackendContract = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      profile: StudentProfile;
      blueprint: Blueprint;
      theme?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const fallback = generateBackendContractFallback(data.blueprint, data.profile);

    try {
      const prompt = `${profileBlock(data.profile)}

FINALIZED BLUEPRINT:
${JSON.stringify(data.blueprint)}

SELECTED DESIGN SYSTEM THEME: "${data.theme || "Modern"}"

You are the Principal Backend Architect & Database Administrator.
Analyze the 5 User Workflow Screens (${data.blueprint.userWorkflow?.map((w) => `${w.screen} [${w.route}]`).join(", ") || "Landing, Auth, Dashboard, Workspace, Audit"}), MVP features, and selected stack.
Synthesize the complete, production-grade Backend Architecture & System Contract Document.
Requirements:
1. Mappings connecting each user workflow screen to specific backend API endpoints and database entities.
2. Complete REST API route specifications with HTTP methods, route paths, auth requirement, request JSON, response JSON, and status codes.
3. Complete SQL DDL with CREATE TABLE statements, UUID primary keys, foreign keys with ON DELETE CASCADE, constraints, and performance indexes.
4. Structured database tables metadata.
5. Domain service modules and business logic responsibilities.
6. Security and JWT specification.
7. Environment variables list.
8. Full formatted markdown specification document.

JSON Shape:
{
  "title": "${data.blueprint.title || "Production Platform"}",
  "framework": "${fallback.framework}",
  "databaseEngine": "${fallback.databaseEngine}",
  "architecturePattern": "${fallback.architecturePattern}",
  "screenMappings": [
    {
      "screen": "Screen Name",
      "route": "/route",
      "apiEndpoints": ["GET /api/v1/..."],
      "dbEntities": ["users"]
    }
  ],
  "apiRoutes": [
    {
      "method": "GET",
      "route": "/api/v1/...",
      "screenName": "Screen Name",
      "summary": "1-sentence summary",
      "authRequired": true,
      "requestPayload": "{\\"field\\": \\"string\\"}",
      "responsePayload": "{\\"status\\": \\"ok\\"}",
      "statusCodes": [{"code": 200, "description": "OK"}]
    }
  ],
  "databaseSchema": {
    "overview": "Summary of relational schema",
    "tables": [
      {
        "tableName": "users",
        "description": "Table summary",
        "columns": [
          {"name": "id", "type": "UUID", "isPrimary": true, "description": "Primary key"}
        ],
        "indexes": ["idx_..."]
      }
    ],
    "rawSqlDdl": "CREATE TABLE ...;"
  },
  "services": [
    {
      "name": "Service Name",
      "purpose": "Purpose",
      "responsibilities": ["Task 1", "Task 2"],
      "associatedRoutes": ["/api/v1/..."]
    }
  ],
  "securitySpec": {
    "authStrategy": "OAuth2 / JWT Bearer",
    "tokenExpiry": "60 minutes",
    "passwordHashing": "Bcrypt",
    "rbacDescription": "Role based access"
  },
  "environmentVariables": [
    {"key": "DATABASE_URL", "example": "postgresql://...", "purpose": "Connection string"}
  ],
  "markdownSpec": "# Full Markdown..."
}`;

      const res = await generateJson<BackendContractDoc>({
        system:
          "You are Yaduk, Principal Backend Architect and Database Designer. " +
          "You produce concrete, rigorous, production-grade technical contracts with real SQL DDL and JSON schemas.",
        prompt,
        agentName: "Yaduk Backend Contract Architect",
      });

      if (
        res?.apiRoutes &&
        res.apiRoutes.length > 0 &&
        res.databaseSchema?.rawSqlDdl &&
        res.screenMappings &&
        res.screenMappings.length > 0
      ) {
        return {
          ...fallback,
          ...res,
          title: res.title || fallback.title,
          framework: res.framework || fallback.framework,
          databaseEngine: res.databaseEngine || fallback.databaseEngine,
          markdownSpec: res.markdownSpec || fallback.markdownSpec,
        };
      }
    } catch (err) {
      console.warn("generateBackendContract API call error, falling back to local synthesizer:", err);
    }

    return fallback;
  });
function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "py":
      return "python";
    case "sql":
      return "sql";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "html":
      return "html";
    case "css":
      return "css";
    case "yaml":
    case "yml":
      return "yaml";
    case "go":
      return "go";
    case "java":
      return "java";
    case "rs":
      return "rust";
    case "sh":
    case "bash":
      return "bash";
    case "env":
      return "bash";
    default:
      return "text";
  }
}

function getLayerFromPath(path: string): "backend" | "frontend" | "database" | "root" {
  const p = path.toLowerCase();
  if (p.startsWith("backend/") || p.startsWith("server/") || p.startsWith("api/")) return "backend";
  if (p.startsWith("frontend/") || p.startsWith("client/") || p.startsWith("web/")) return "frontend";
  if (p.startsWith("database/") || p.startsWith("db/") || p.endsWith(".sql")) return "database";
  return "root";
}

export function parseDelimitedCodeFiles(text: string): GeneratedCodeFile[] {
  const files: GeneratedCodeFile[] = [];

  // Match: === FILE: <path> === ... === END FILE ===
  const equalsFileRegex =
    /===\s*FILE:\s*([^\r\n=]+)\s*===\r?\n([\s\S]*?)(?:===\s*END FILE\s*===|(?====\s*FILE:)|$)/gi;
  let eqMatch: RegExpExecArray | null;

  while ((eqMatch = equalsFileRegex.exec(text)) !== null) {
    const rawPath = (eqMatch[1] ?? "").trim();
    let rawCode = (eqMatch[2] ?? "").trim();
    if (!rawPath) continue;

    const fenceStripMatch = rawCode.match(/^```(?:\w+)?\r?\n([\s\S]*?)\r?\n```$/);
    if (fenceStripMatch && fenceStripMatch[1] !== undefined) {
      rawCode = fenceStripMatch[1];
    }
    const language = getLanguageFromPath(rawPath);
    const layer = getLayerFromPath(rawPath);
    files.push({
      path: rawPath,
      language,
      description: `Production module for ${rawPath}`,
      code: rawCode,
      layer,
    });
  }

  // Fallback: Markdown format (### FILE: path ... ```code```)
  if (files.length === 0) {
    const mdFileRegex =
      /(?:###?\s*FILE:?|\*\*File:?\*\*|File:?)\s*`?([^\r\n`]+)`?\r?\n```(\w*)\r?\n([\s\S]*?)```/gi;
    let mdMatch: RegExpExecArray | null;
    while ((mdMatch = mdFileRegex.exec(text)) !== null) {
      const rawPath = (mdMatch[1] ?? "").trim();
      if (!rawPath) continue;
      const language = (mdMatch[2] ?? "").trim() || getLanguageFromPath(rawPath);
      const code = (mdMatch[3] ?? "").trimEnd();
      const layer = getLayerFromPath(rawPath);
      files.push({
        path: rawPath,
        language,
        description: `Production module for ${rawPath}`,
        code,
        layer,
      });
    }
  }

  return files;
}

// ============================================================
// CODE GENERATION HELPERS — Contract-Aware Code Synthesis
// ============================================================

/** Map SQL column types from the contract DDL to SQLAlchemy column types */
function sqlTypeToSqlAlchemy(sqlType: string): string {
  const t = sqlType.toUpperCase().trim();
  if (t === 'UUID') return 'UUID(as_uuid=True)';
  if (t.startsWith('VARCHAR') || t.startsWith('CHARACTER VARYING')) {
    const match = t.match(/\((\d+)\)/);
    return match ? `String(${match[1]})` : 'String(255)';
  }
  if (t === 'TEXT') return 'Text';
  if (t === 'INTEGER' || t === 'INT' || t === 'INT4') return 'Integer';
  if (t === 'BIGINT' || t === 'INT8') return 'BigInteger';
  if (t === 'SMALLINT' || t === 'INT2') return 'SmallInteger';
  if (t === 'SERIAL') return 'Integer';
  if (t === 'BIGSERIAL') return 'BigInteger';
  if (t === 'BOOLEAN' || t === 'BOOL') return 'Boolean';
  if (t.startsWith('NUMERIC') || t.startsWith('DECIMAL')) {
    const match = t.match(/\((\d+),\s*(\d+)\)/);
    return match ? `Numeric(${match[1]}, ${match[2]})` : 'Numeric';
  }
  if (t === 'FLOAT' || t === 'REAL' || t === 'DOUBLE PRECISION' || t === 'FLOAT8') return 'Float';
  if (t === 'DATE') return 'Date';
  if (t.startsWith('TIMESTAMP')) return 'DateTime(timezone=True)';
  if (t === 'JSONB' || t === 'JSON') return 'JSON';
  if (t === 'BYTEA') return 'LargeBinary';
  return 'String(255)';
}

/** Convert a SQL table name to a PascalCase Python class name */
function tableToPascal(tableName: string): string {
  return tableName
    .split(/[_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/** Convert a snake_case name to camelCase for TypeScript */
function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/** Convert a snake_case name to PascalCase for TypeScript */
function snakeToPascal(s: string): string {
  const camel = snakeToCamel(s);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/** Generate SQLAlchemy model code from contract database tables */
function generateModelsFromContract(tables: DatabaseTableSpec[], title: string): string {
  const imports = new Set<string>(['Column', 'String', 'Integer']);
  
  // Scan all columns to collect needed imports
  for (const table of tables) {
    for (const col of table.columns) {
      const saType = sqlTypeToSqlAlchemy(col.type);
      if (saType.includes('Text')) imports.add('Text');
      if (saType.includes('Boolean')) imports.add('Boolean');
      if (saType.includes('Float')) imports.add('Float');
      if (saType.includes('Numeric')) imports.add('Numeric');
      if (saType.includes('DateTime')) imports.add('DateTime');
      if (saType.includes('Date') && !saType.includes('DateTime')) imports.add('Date');
      if (saType.includes('JSON')) imports.add('JSON');
      if (saType.includes('BigInteger')) imports.add('BigInteger');
      if (saType.includes('SmallInteger')) imports.add('SmallInteger');
      if (saType.includes('LargeBinary')) imports.add('LargeBinary');
      if (saType.includes('UUID')) imports.add('UUID');
      if (col.isForeign) imports.add('ForeignKey');
    }
  }
  
  const importList = Array.from(imports).sort().join(', ');
  
  let code = `"""${title} — SQLAlchemy ORM Models.

Auto-generated from the verified Backend Contract database schema.
"""
from sqlalchemy import ${importList}
from sqlalchemy.sql import func
from backend.app.database import Base\n\n`;
  
  for (const table of tables) {
    const className = tableToPascal(table.tableName);
    code += `\nclass ${className}(Base):\n`;
    code += `    """${table.description || table.tableName}"""\n`;
    code += `    __tablename__ = "${table.tableName}"\n\n`;
    
    for (const col of table.columns) {
      const saType = sqlTypeToSqlAlchemy(col.type);
      const parts: string[] = [saType];
      
      if (col.isPrimary) parts.push('primary_key=True');
      if (col.isForeign && col.references) parts.push(`ForeignKey("${col.references}")`);
      if (!col.nullable && !col.isPrimary) parts.push('nullable=False');
      if (col.nullable) parts.push('nullable=True');
      if (col.isPrimary && (saType.includes('Integer') || saType.includes('BigInteger'))) parts.push('autoincrement=True');
      if (col.name === 'created_at' || col.name === 'updated_at') parts.push('server_default=func.now()');
      if (col.isPrimary && saType.includes('UUID')) parts.push('server_default=func.uuid_generate_v4()');
      
      const colDef = parts.join(', ');
      code += `    ${col.name} = Column(${colDef})`;
      if (col.description) code += `  # ${col.description}`;
      code += '\n';
    }
    
    if (table.indexes && table.indexes.length > 0) {
      code += '\n';
      for (const idx of table.indexes) {
        code += `    # Index: ${idx}\n`;
      }
    }
    code += '\n';
  }
  
  return code;
}

/** Generate Pydantic schemas from contract API routes and database tables */
function generateSchemasFromContract(tables: DatabaseTableSpec[], routes: ApiRouteSpec[], title: string): string {
  let code = `"""${title} — Pydantic v2 Request/Response Schemas.

Auto-generated from the verified Backend Contract API routes and database schema.
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Any
from datetime import datetime\n\n`;
  
  code += `class HealthResponse(BaseModel):\n`;
  code += `    status: str = "healthy"\n`;
  code += `    app: str = "${title}"\n`;
  code += `    timestamp: datetime = Field(default_factory=datetime.utcnow)\n\n`;
  
  code += `class TokenResponse(BaseModel):\n`;
  code += `    access_token: str\n`;
  code += `    token_type: str = "bearer"\n\n`;
  
  // Generate Create and Response schemas for each table
  for (const table of tables) {
    const pascal = tableToPascal(table.tableName);
    const nonAutoColumns = table.columns.filter(c => !c.isPrimary && c.name !== 'created_at' && c.name !== 'updated_at');
    const allColumns = table.columns;
    
    // Create schema
    code += `class ${pascal}Create(BaseModel):\n`;
    code += `    """Create schema for ${table.description || table.tableName}"""\n`;
    for (const col of nonAutoColumns) {
      const pyType = sqlTypeToPydantic(col.type);
      if (col.nullable) {
        code += `    ${col.name}: Optional[${pyType}] = None\n`;
      } else {
        code += `    ${col.name}: ${pyType}\n`;
      }
    }
    code += '\n';
    
    // Response schema
    code += `class ${pascal}Response(BaseModel):\n`;
    code += `    """Response schema for ${table.description || table.tableName}"""\n`;
    for (const col of allColumns) {
      const pyType = sqlTypeToPydantic(col.type);
      if (col.nullable || col.name === 'created_at' || col.name === 'updated_at') {
        code += `    ${col.name}: Optional[${pyType}] = None\n`;
      } else {
        code += `    ${col.name}: ${pyType}\n`;
      }
    }
    code += `\n    model_config = ConfigDict(from_attributes=True)\n\n`;
  }
  
  return code;
}

/** Map SQL types to Pydantic/Python types */
function sqlTypeToPydantic(sqlType: string): string {
  const t = sqlType.toUpperCase().trim();
  if (t === 'UUID') return 'str';
  if (t.startsWith('VARCHAR') || t.startsWith('CHARACTER VARYING') || t === 'TEXT') return 'str';
  if (t === 'INTEGER' || t === 'INT' || t === 'SERIAL' || t === 'INT4' || t === 'SMALLINT' || t === 'INT2') return 'int';
  if (t === 'BIGINT' || t === 'INT8' || t === 'BIGSERIAL') return 'int';
  if (t === 'BOOLEAN' || t === 'BOOL') return 'bool';
  if (t.startsWith('NUMERIC') || t.startsWith('DECIMAL') || t === 'FLOAT' || t === 'REAL' || t === 'DOUBLE PRECISION') return 'float';
  if (t === 'DATE') return 'str';
  if (t.startsWith('TIMESTAMP')) return 'datetime';
  if (t === 'JSONB' || t === 'JSON') return 'Any';
  return 'str';
}

/** Generate a FastAPI router for a specific screen's API endpoints */
function generateRouterForScreen(
  screenMapping: { screen: string; route: string; apiEndpoints: string[]; dbEntities: string[] },
  routes: ApiRouteSpec[],
  tables: DatabaseTableSpec[],
): string {
  const screenRoutes = routes.filter(r => r.screenName === screenMapping.screen || screenMapping.apiEndpoints.some(ep => r.route.includes(ep.replace(/^\/api\/v1/, ''))));
  if (screenRoutes.length === 0) return '';
  
  const slug = screenMapping.screen.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const modelImports = screenMapping.dbEntities.map(e => tableToPascal(e)).join(', ');
  const schemaImports = screenMapping.dbEntities.flatMap(e => {
    const p = tableToPascal(e);
    return [`${p}Create`, `${p}Response`];
  }).join(', ');
  
  let code = `"""${screenMapping.screen} — API Router.

Handles: ${screenRoutes.map(r => `${r.method} ${r.route}`).join(', ')}
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models import ${modelImports || 'Base'}
from backend.app.schemas import ${schemaImports || 'HealthResponse'}\n\n`;
  
  code += `router = APIRouter(tags=["${screenMapping.screen}"])\n\n`;
  
  for (const route of screenRoutes) {
    const cleanRoute = route.route.replace(/^\/api\/v1/, '') || '/';
    const fnName = cleanRoute.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'root';
    const method = route.method.toLowerCase();
    const primaryEntity = screenMapping.dbEntities[0];
    const modelName = primaryEntity ? tableToPascal(primaryEntity) : null;
    
    code += `@router.${method}("${cleanRoute}")\n`;
    code += `async def ${fnName}(`;
    
    // Add parameters based on route pattern
    const hasPathParam = cleanRoute.includes('{');
    const paramMatch = cleanRoute.match(/\{(\w+)\}/);
    const params: string[] = [];
    if (hasPathParam && paramMatch) params.push(`${paramMatch[1]}: str`);
    if ((method === 'post' || method === 'put' || method === 'patch') && modelName) {
      params.push(`data: ${modelName}Create`);
    }
    params.push('db: AsyncSession = Depends(get_db)');
    code += params.join(', ');
    code += `):\n`;
    code += `    """${route.summary}"""\n`;
    
    // Generate real implementation based on method
    if (method === 'get' && !hasPathParam && modelName) {
      code += `    result = await db.execute(select(${modelName}))\n`;
      code += `    items = result.scalars().all()\n`;
      code += `    return [{"id": str(item.id), **{c.name: getattr(item, c.name) for c in ${modelName}.__table__.columns}} for item in items]\n`;
    } else if (method === 'get' && hasPathParam && modelName) {
      const param = paramMatch ? paramMatch[1] : 'id';
      code += `    result = await db.execute(select(${modelName}).where(${modelName}.id == ${param}))\n`;
      code += `    item = result.scalar_one_or_none()\n`;
      code += `    if not item:\n`;
      code += `        raise HTTPException(status_code=404, detail="${modelName} not found")\n`;
      code += `    return item\n`;
    } else if (method === 'post' && modelName) {
      code += `    new_item = ${modelName}(**data.model_dump())\n`;
      code += `    db.add(new_item)\n`;
      code += `    await db.commit()\n`;
      code += `    await db.refresh(new_item)\n`;
      code += `    return new_item\n`;
    } else if (method === 'put' && hasPathParam && modelName) {
      const param = paramMatch ? paramMatch[1] : 'id';
      code += `    result = await db.execute(select(${modelName}).where(${modelName}.id == ${param}))\n`;
      code += `    item = result.scalar_one_or_none()\n`;
      code += `    if not item:\n`;
      code += `        raise HTTPException(status_code=404, detail="${modelName} not found")\n`;
      code += `    for key, value in data.model_dump(exclude_unset=True).items():\n`;
      code += `        setattr(item, key, value)\n`;
      code += `    await db.commit()\n`;
      code += `    await db.refresh(item)\n`;
      code += `    return item\n`;
    } else if (method === 'delete' && hasPathParam && modelName) {
      const param = paramMatch ? paramMatch[1] : 'id';
      code += `    result = await db.execute(select(${modelName}).where(${modelName}.id == ${param}))\n`;
      code += `    item = result.scalar_one_or_none()\n`;
      code += `    if not item:\n`;
      code += `        raise HTTPException(status_code=404, detail="${modelName} not found")\n`;
      code += `    await db.delete(item)\n`;
      code += `    await db.commit()\n`;
      code += `    return {"status": "deleted", "id": ${param}}\n`;
    } else {
      code += `    return ${route.responsePayload || `{"status": "ok", "message": "${route.summary}"}`}\n`;
    }
    code += '\n';
  }
  
  return code;
}

/** Resolve theme palette from selectedTheme ID string by matching against known presets */
function resolveThemePalette(selectedTheme: string): { primary: string; secondary: string; accent: string; dark: string } {
  const KNOWN_PALETTES: Record<string, string[]> = {
    'clinical-precision': ['#0F172A', '#0284C7', '#F0F9FF', '#EF4444'],
    'caregiver-mint': ['#F8FAF8', '#059669', '#EA580C', '#334155'],
    'spectral-dark-hud': ['#050811', '#06B6D4', '#F43F5E', '#1E293B'],
    'terra-botanical': ['#14532D', '#F59E0B', '#F0FDF4', '#78350F'],
    'neo-brutalism': ['#1A1A2E', '#E94560', '#0F3460', '#16213E'],
    'modern-minimal': ['#0F172A', '#3B82F6', '#F8FAFC', '#10B981'],
    'cyber-neon': ['#0A0A0A', '#00FF41', '#FF00FF', '#1A1A2E'],
    'glass-aurora': ['#0C0C1D', '#7C3AED', '#06B6D4', '#1E1E3F'],
  };
  
  const palette = KNOWN_PALETTES[selectedTheme];
  if (palette && palette.length >= 4) {
    return { dark: palette[0]!, primary: palette[1]!, secondary: palette[2]!, accent: palette[3]! };
  }
  return { dark: '#0F172A', primary: '#3B82F6', secondary: '#F8FAFC', accent: '#10B981' };
}

/** Generate a React page component for a specific screen */
function generatePageComponentForScreen(
  screenMapping: { screen: string; route: string; apiEndpoints: string[]; dbEntities: string[] },
  routes: ApiRouteSpec[],
  theme: { primary: string; secondary: string; accent: string; dark: string },
  title: string,
): string {
  const screenRoutes = routes.filter(r => r.screenName === screenMapping.screen || screenMapping.apiEndpoints.some(ep => r.route.includes(ep.replace(/^\/api\/v1/, ''))));
  const componentName = snakeToPascal(screenMapping.screen.replace(/[^a-zA-Z0-9]+/g, '_'));
  const primaryEntity = screenMapping.dbEntities[0] || 'item';
  const entityPascal = snakeToPascal(primaryEntity);
  
  const getRoutes = screenRoutes.filter(r => r.method === 'GET');
  const postRoutes = screenRoutes.filter(r => r.method === 'POST');
  const hasForm = postRoutes.length > 0;
  const hasList = getRoutes.some(r => !r.route.includes('{'));
  
  // Parse fields from POST requestPayload if available
  let formFields: string[] = [];
  if (postRoutes[0]?.requestPayload) {
    try {
      const payload = JSON.parse(postRoutes[0].requestPayload);
      formFields = Object.keys(payload);
    } catch {
      formFields = ['name', 'description'];
    }
  }
  if (formFields.length === 0) formFields = ['name', 'description'];
  
  let code = `import React, { useState, useEffect } from 'react';\n`;
  code += `import { ApiService } from '../api/client';\n\n`;
  
  code += `export default function ${componentName}() {\n`;
  code += `  const [items, setItems] = useState<any[]>([]);\n`;
  code += `  const [loading, setLoading] = useState(true);\n`;
  code += `  const [error, setError] = useState<string | null>(null);\n`;
  code += `  const [showForm, setShowForm] = useState(false);\n`;
  
  // Form state
  if (hasForm) {
    for (const field of formFields) {
      code += `  const [${snakeToCamel(field)}, set${snakeToPascal(field)}] = useState('');\n`;
    }
    code += `  const [submitting, setSubmitting] = useState(false);\n`;
  }
  
  // Fetch data
  if (hasList) {
    const listRoute = getRoutes.find(r => !r.route.includes('{'));
    const listFn = listRoute ? listRoute.route.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') : 'getItems';
    code += `\n  useEffect(() => {\n`;
    code += `    async function fetchData() {\n`;
    code += `      try {\n`;
    code += `        setLoading(true);\n`;
    code += `        const data = await ApiService.${listFn}_0();\n`;
    code += `        setItems(Array.isArray(data) ? data : []);\n`;
    code += `      } catch (err: any) {\n`;
    code += `        setError(err.message || 'Failed to load data');\n`;
    code += `      } finally {\n`;
    code += `        setLoading(false);\n`;
    code += `      }\n`;
    code += `    }\n`;
    code += `    fetchData();\n`;
    code += `  }, []);\n`;
  }
  
  // Form submit handler
  if (hasForm) {
    const postRoute = postRoutes[0]!;
    const postFn = postRoute.route.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'createItem';
    code += `\n  const handleSubmit = async (e: React.FormEvent) => {\n`;
    code += `    e.preventDefault();\n`;
    code += `    setSubmitting(true);\n`;
    code += `    try {\n`;
    code += `      const payload = { ${formFields.map(f => snakeToCamel(f)).join(', ')} };\n`;
    code += `      await ApiService.${postFn}_0(payload);\n`;
    code += `      setShowForm(false);\n`;
    const resetLines = formFields.map(f => `      set${snakeToPascal(f)}('');`);
    code += resetLines.join('\n') + '\n';
    code += `      // Refresh data\n`;
    code += `      window.location.reload();\n`;
    code += `    } catch (err: any) {\n`;
    code += `      setError(err.message || 'Failed to submit');\n`;
    code += `    } finally {\n`;
    code += `      setSubmitting(false);\n`;
    code += `    }\n`;
    code += `  };\n`;
  }
  
  // Render
  code += `\n  return (\n`;
  code += `    <div className="space-y-6">\n`;
  
  // Header
  code += `      <div className="flex items-center justify-between">\n`;
  code += `        <div>\n`;
  code += `          <h1 className="text-2xl font-bold" style={{ color: '${theme.secondary}' }}>${screenMapping.screen}</h1>\n`;
  code += `          <p className="text-sm opacity-70 mt-1">Manage ${primaryEntity} records</p>\n`;
  code += `        </div>\n`;
  if (hasForm) {
    code += `        <button\n`;
    code += `          onClick={() => setShowForm(!showForm)}\n`;
    code += `          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors"\n`;
    code += `          style={{ backgroundColor: '${theme.primary}' }}\n`;
    code += `        >\n`;
    code += `          {showForm ? 'Cancel' : '+ New ${entityPascal}'}\n`;
    code += `        </button>\n`;
  }
  code += `      </div>\n\n`;
  
  // Error state
  code += `      {error && (\n`;
  code += `        <div className="p-4 rounded-lg border" style={{ borderColor: '${theme.accent}', backgroundColor: '${theme.accent}15' }}>\n`;
  code += `          <p className="text-sm" style={{ color: '${theme.accent}' }}>{error}</p>\n`;
  code += `        </div>\n`;
  code += `      )}\n\n`;
  
  // Form
  if (hasForm) {
    code += `      {showForm && (\n`;
    code += `        <form onSubmit={handleSubmit} className="p-6 rounded-xl border space-y-4" style={{ borderColor: '${theme.primary}30', backgroundColor: '${theme.dark}' }}>\n`;
    code += `          <h3 className="text-lg font-semibold" style={{ color: '${theme.secondary}' }}>Create New ${entityPascal}</h3>\n`;
    for (const field of formFields) {
      const camel = snakeToCamel(field);
      const label = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      code += `          <div>\n`;
      code += `            <label className="block text-sm font-medium mb-1 opacity-80">${label}</label>\n`;
      code += `            <input\n`;
      code += `              type="text"\n`;
      code += `              value={${camel}}\n`;
      code += `              onChange={(e) => set${snakeToPascal(field)}(e.target.value)}\n`;
      code += `              className="w-full px-3 py-2 rounded-lg border bg-transparent"\n`;
      code += `              style={{ borderColor: '${theme.primary}40' }}\n`;
      code += `              placeholder="Enter ${label.toLowerCase()}"\n`;
      code += `              required\n`;
      code += `            />\n`;
      code += `          </div>\n`;
    }
    code += `          <button\n`;
    code += `            type="submit"\n`;
    code += `            disabled={submitting}\n`;
    code += `            className="px-6 py-2 rounded-lg text-white font-semibold disabled:opacity-50"\n`;
    code += `            style={{ backgroundColor: '${theme.primary}' }}\n`;
    code += `          >\n`;
    code += `            {submitting ? 'Creating...' : 'Create ${entityPascal}'}\n`;
    code += `          </button>\n`;
    code += `        </form>\n`;
    code += `      )}\n\n`;
  }
  
  // Loading state
  code += `      {loading ? (\n`;
  code += `        <div className="flex items-center justify-center py-16">\n`;
  code += `          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '${theme.primary}' }} />\n`;
  code += `        </div>\n`;
  code += `      ) : items.length === 0 ? (\n`;
  code += `        <div className="text-center py-16 opacity-60">\n`;
  code += `          <p className="text-lg">No ${primaryEntity} found</p>\n`;
  code += `          <p className="text-sm mt-1">Create your first ${primaryEntity} to get started.</p>\n`;
  code += `        </div>\n`;
  code += `      ) : (\n`;
  code += `        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '${theme.primary}20' }}>\n`;
  code += `          <table className="w-full text-sm">\n`;
  code += `            <thead>\n`;
  code += `              <tr style={{ backgroundColor: '${theme.primary}10' }}>\n`;
  // Table headers from entity columns
  const entityTable = ([] as DatabaseTableSpec[]).concat(/* placeholder */)[0];
  code += `                {items[0] && Object.keys(items[0]).slice(0, 6).map(key => (\n`;
  code += `                  <th key={key} className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-xs opacity-70">\n`;
  code += `                    {key.replace(/_/g, ' ')}\n`;
  code += `                  </th>\n`;
  code += `                ))}\n`;
  code += `              </tr>\n`;
  code += `            </thead>\n`;
  code += `            <tbody>\n`;
  code += `              {items.map((item, idx) => (\n`;
  code += `                <tr key={item.id || idx} className="border-t transition-colors hover:opacity-80" style={{ borderColor: '${theme.primary}10' }}>\n`;
  code += `                  {Object.values(item).slice(0, 6).map((val: any, i) => (\n`;
  code += `                    <td key={i} className="px-4 py-3">{typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}</td>\n`;
  code += `                  ))}\n`;
  code += `                </tr>\n`;
  code += `              ))}\n`;
  code += `            </tbody>\n`;
  code += `          </table>\n`;
  code += `        </div>\n`;
  code += `      )}\n`;
  code += `    </div>\n`;
  code += `  );\n`;
  code += `}\n`;
  
  return code;
}

function stripCodeFences(code: string): string {
  let cleaned = code.trim();
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    if (lines[0].trim().startsWith("```")) {
      lines.shift();
    }
    if (lines.length > 0 && lines[lines.length - 1].trim() === "```") {
      lines.pop();
    }
    cleaned = lines.join("\n").trim();
  }
  return cleaned;
}

/** Call the backend per-file codegen endpoint with direct AI Gateway fallback */
async function callCodegenEndpoint(requestBody: Record<string, unknown>): Promise<string> {
  const filePath = (requestBody['file_path'] as string) || 'code.txt';
  const filePurpose = (requestBody['file_purpose'] as string) || '';
  const projectTitle = (requestBody['project_title'] as string) || 'Capstone Project';
  const blueprintSummary = (requestBody['blueprint_summary'] as string) || '';
  const dbSchemaDdl = (requestBody['db_schema_ddl'] as string) || '';
  const apiRoutes = (requestBody['api_routes'] as any[]) || [];
  const theme = requestBody['theme'] as Record<string, string> | undefined;
  const approvedDeps = (requestBody['approved_dependencies'] as any[]) || [];
  const screenContext = requestBody['screen_context'] as any;
  const mvpFeatures = (requestBody['mvp_features'] as any[]) || [];

  const candidates = [
    process.env['BACKEND_URL']?.replace(/\/+$/, ''),
    'http://yaduk-api-env.eba-dkrzgicw.us-east-1.elasticbeanstalk.com',
    'http://127.0.0.1:8000',
  ].filter(Boolean) as string[];
  
  // 1. First try native backend /api/codegen/generate-file endpoint if present
  for (const url of candidates) {
    try {
      const res = await fetch(`${url}/api/codegen/generate-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.code && data.code.trim().length > 30) {
        return stripCodeFences(data.code);
      }
    } catch {
      continue;
    }
  }

  // 2. Direct AI Gateway Text Generation (/api/gateway/generate-text on live EB backend)
  try {
    const promptSections: string[] = [
      `You are generating ONE complete source code file: \`${filePath}\``,
      `Project: "${projectTitle}"`,
      `Purpose of this file: ${filePurpose}`,
    ];

    if (blueprintSummary) {
      promptSections.push(`\n=== PROJECT OVERVIEW ===\n${blueprintSummary.slice(0, 1000)}`);
    }

    if (screenContext) {
      promptSections.push(`\n=== SCREEN CONTEXT ===\nScreen: ${screenContext.screen || 'N/A'}\nRoute: ${screenContext.route || '/'}`);
    }

    if (mvpFeatures && mvpFeatures.length > 0) {
      promptSections.push(`\n=== CORE FEATURES ===\n${mvpFeatures.map((f: any) => `- ${f.name || f}: ${f.detail || ''}`).join('\n')}`);
    }

    if (dbSchemaDdl) {
      promptSections.push(`\n=== DATABASE SCHEMA (SQL DDL) ===\n${dbSchemaDdl.slice(0, 2000)}`);
    }

    if (apiRoutes && apiRoutes.length > 0) {
      promptSections.push(`\n=== RELEVANT API ROUTES ===\n${apiRoutes.slice(0, 6).map((r: any) => `  ${r.method} ${r.route}: ${r.summary || ''}`).join('\n')}`);
    }

    if (theme) {
      promptSections.push(`\n=== UI DESIGN THEME ===\nPrimary: ${theme.primary}, Secondary: ${theme.secondary}, Accent: ${theme.accent}, Dark: ${theme.dark}`);
    }

    if (approvedDeps && approvedDeps.length > 0) {
      promptSections.push(`\n=== APPROVED DEPENDENCIES ===\n${approvedDeps.slice(0, 10).map((d: any) => `- ${d.name}: ${d.purpose}`).join('\n')}`);
    }

    promptSections.push(`
=== CRITICAL INSTRUCTIONS ===
1. Generate ONLY the code for \`${filePath}\` — no other files, no markdown wrappers, no commentary.
2. Write COMPLETE, PRODUCTION-READY code with real logic (NO stubs, NO placeholders, NO TODOs).
3. Do NOT wrap output in markdown code blocks (\`\`\` or \`\`\`language).
4. Return raw source code directly.`);

    const system = "You are a Principal Software Engineer. Output strictly raw, complete, runnable source code without markdown fences or conversational text.";

    const generated = await generateText({
      system,
      prompt: promptSections.join('\n'),
      temperature: 0.15,
      maxTokens: 1800,
      agentName: `Yaduk CodeGen [${filePath}]`,
    });

    if (generated && generated.trim().length > 40) {
      return stripCodeFences(generated);
    }
  } catch (gatewayErr) {
    console.warn(`Gateway text generation failed for ${filePath}:`, gatewayErr);
  }

  throw new Error(`All code generation methods failed for ${filePath}`);
}

export function generateProjectSetupFallback(
  blueprint: Blueprint,
  _profile?: StudentProfile | null,
  contract?: BackendContractDoc | null
): ProjectSetupSpec {
  const title = blueprint.title || "Production Software Platform";
  const stack = blueprint.stack || [];

  // 1. Detect Backend Language & Framework dynamically
  const isPython = stack.some(
    (s) =>
      s.name.toLowerCase().includes("python") ||
      s.name.toLowerCase().includes("fastapi") ||
      s.name.toLowerCase().includes("django") ||
      s.name.toLowerCase().includes("flask")
  );
  const isNode = stack.some(
    (s) =>
      s.name.toLowerCase().includes("node") ||
      s.name.toLowerCase().includes("express") ||
      s.name.toLowerCase().includes("nest")
  );
  const isGo = stack.some(
    (s) =>
      s.name.toLowerCase().includes("go") ||
      s.name.toLowerCase().includes("gin") ||
      s.name.toLowerCase().includes("fiber")
  );

  let backendLanguage = "Python 3.11";
  let backendFramework = "FastAPI";
  let backendManifestName = "requirements.txt";
  let backendDeps: DependencyItem[] = [];

  if (isGo) {
    backendLanguage = "Go 1.22";
    backendFramework = "Gin Web Framework";
    backendManifestName = "go.mod";
    backendDeps = [
      { name: "github.com/gin-gonic/gin", version: "v1.10.0", purpose: "High-performance HTTP routing and REST engine", category: "core" },
      { name: "github.com/golang-jwt/jwt/v5", version: "v5.2.1", purpose: "JWT bearer authentication and claim validation", category: "auth" },
      { name: "gorm.io/gorm", version: "v1.25.10", purpose: "Object Relational Mapping & schema query engine", category: "database" },
      { name: "gorm.io/driver/postgres", version: "v1.5.7", purpose: "PostgreSQL database driver for GORM", category: "database" },
      { name: "github.com/joho/godotenv", version: "v1.5.1", purpose: "Local environment variable loading", category: "utility" },
    ];
  } else if (isNode) {
    backendLanguage = "Node.js (TypeScript)";
    backendFramework = "Express";
    backendManifestName = "package.json";
    backendDeps = [
      { name: "express", version: "^4.19.2", purpose: "REST API server and middleware framework", category: "core" },
      { name: "cors", version: "^2.8.5", purpose: "Cross-Origin Resource Sharing handling for frontend requests", category: "core" },
      { name: "dotenv", version: "^16.4.5", purpose: "Loads environment variables from .env", category: "utility" },
      { name: "jsonwebtoken", version: "^9.0.2", purpose: "Secure JWT access and refresh token generator", category: "auth" },
      { name: "bcryptjs", version: "^2.4.3", purpose: "Salted cryptographic password hashing", category: "auth" },
      { name: "pg", version: "^8.12.0", purpose: "PostgreSQL client and connection pooling", category: "database" },
      { name: "zod", version: "^3.23.8", purpose: "Type-safe runtime request body validation schemas", category: "core" },
      { name: "tsx", version: "^4.16.2", purpose: "Fast TypeScript execution and hot reloading in dev", isDev: true, category: "testing" },
      { name: "typescript", version: "^5.5.3", purpose: "Static typing compiler", isDev: true, category: "testing" },
    ];
  } else {
    // Default Python FastAPI
    backendLanguage = "Python 3.11";
    backendFramework = "FastAPI";
    backendManifestName = "requirements.txt";
    backendDeps = [
      { name: "fastapi", version: ">=0.111.0", purpose: "High-performance asynchronous REST API framework", category: "core" },
      { name: "uvicorn[standard]", version: ">=0.30.0", purpose: "Lightning-fast ASGI production web server", category: "core" },
      { name: "pydantic", version: ">=2.7.0", purpose: "Pydantic v2 data validation and response schemas", category: "core" },
      { name: "pydantic-settings", version: ">=2.3.0", purpose: "Application settings management from environment variables", category: "core" },
      { name: "sqlalchemy", version: ">=2.0.30", purpose: "SQLAlchemy 2.0 async ORM and query builder", category: "database" },
      { name: "asyncpg", version: ">=0.29.0", purpose: "Fast asynchronous PostgreSQL database driver", category: "database" },
      { name: "python-jose[cryptography]", version: ">=3.3.0", purpose: "JWT cryptographic signing and verification", category: "auth" },
      { name: "passlib[bcrypt]", version: ">=1.7.4", purpose: "Argon2 / Bcrypt secure password hashing", category: "auth" },
      { name: "python-dotenv", version: ">=1.0.1", purpose: "Automatic .env environment variable parsing", category: "utility" },
      { name: "httpx", version: ">=0.27.0", purpose: "Async HTTP client for external integrations", category: "utility" },
      { name: "pytest", version: ">=8.2.0", purpose: "Test runner for unit and integration testing", isDev: true, category: "testing" },
    ];
  }

  // 2. Detect Frontend Language & Framework dynamically
  const isVue = stack.some((s) => s.name.toLowerCase().includes("vue"));
  const isNext = stack.some((s) => s.name.toLowerCase().includes("next"));

  let frontendFramework = "React 19 (Vite + TypeScript)";
  const frontendManifestName = "package.json";
  let frontendDeps: DependencyItem[] = [];

  if (isVue) {
    frontendFramework = "Vue 3 (Vite + TypeScript)";
    frontendDeps = [
      { name: "vue", version: "^3.4.30", purpose: "Reactive UI framework with Composition API", category: "core" },
      { name: "vue-router", version: "^4.3.3", purpose: "Single-Page Application client routing", category: "core" },
      { name: "pinia", version: "^2.1.7", purpose: "Intuitive, type-safe global state management store", category: "core" },
      { name: "axios", version: "^1.7.2", purpose: "Promise-based HTTP client for API endpoints", category: "utility" },
      { name: "lucide-vue-next", version: "^0.395.0", purpose: "Clean modern SVG icon set", category: "utility" },
      { name: "tailwindcss", version: "^3.4.4", purpose: "Utility-first CSS styling framework", category: "core" },
      { name: "@vitejs/plugin-vue", version: "^5.0.5", purpose: "Vite Vue Single File Component plugin", isDev: true, category: "core" },
      { name: "vite", version: "^5.3.1", purpose: "Next-generation frontend dev server & bundler", isDev: true, category: "core" },
      { name: "typescript", version: "^5.5.2", purpose: "TypeScript compiler & type checking", isDev: true, category: "testing" },
    ];
  } else {
    // Default React 19 / TypeScript
    frontendFramework = isNext ? "Next.js 14 (App Router)" : "React 19 (Vite + TypeScript)";
    frontendDeps = [
      { name: "react", version: "^19.0.0", purpose: "Modern declarative user interface library", category: "core" },
      { name: "react-dom", version: "^19.0.0", purpose: "React DOM rendering engine", category: "core" },
      { name: "axios", version: "^1.7.2", purpose: "Configured API client with error interceptors", category: "utility" },
      { name: "lucide-react", version: "^0.475.0", purpose: "Modern icon family for UI status and navigation", category: "utility" },
      { name: "clsx", version: "^2.1.1", purpose: "Utility for conditionally constructing className strings", category: "utility" },
      { name: "tailwind-merge", version: "^2.3.0", purpose: "Conflict-free Tailwind class merge utility", category: "utility" },
      { name: "@tanstack/react-router", version: "^1.35.0", purpose: "Type-safe client routing and deep-linking", category: "core" },
      { name: "@vitejs/plugin-react", version: "^4.3.1", purpose: "Fast React HMR plugin for Vite", isDev: true, category: "core" },
      { name: "vite", version: "^5.3.1", purpose: "Sub-second HMR frontend bundler", isDev: true, category: "core" },
      { name: "typescript", version: "^5.5.2", purpose: "Strict type safety checking across all components", isDev: true, category: "testing" },
      { name: "@types/react", version: "^19.0.0", purpose: "React TypeScript type declarations", isDev: true, category: "testing" },
      { name: "@types/react-dom", version: "^19.0.0", purpose: "React DOM TypeScript type declarations", isDev: true, category: "testing" },
      { name: "@tailwindcss/vite", version: "^4.0.0", purpose: "Tailwind CSS Vite compiler integration", isDev: true, category: "core" },
    ];
  }

  // 3. Dev Scripts
  const devScripts = [
    {
      command: "setup",
      script: isPython ? "pip install -r backend/requirements.txt && cd frontend && npm install" : "npm run install:all",
      purpose: "One-step dependency installation for backend and frontend",
    },
    {
      command: "dev:backend",
      script: isPython ? "uvicorn backend.app.main:app --reload --port 8000" : isGo ? "go run backend/main.go" : "npm run dev --prefix backend",
      purpose: "Starts backend API server in hot-reload development mode",
    },
    {
      command: "dev:frontend",
      script: "cd frontend && npm run dev",
      purpose: "Starts Vite client web server on localhost:5173",
    },
    {
      command: "db:init",
      script: isPython ? "python -m backend.app.db_init" : "npm run db:migrate",
      purpose: "Executes SQL DDL schema creation and initial seeds",
    },
    {
      command: "docker:up",
      script: "docker-compose up --build",
      purpose: "Spins up complete multi-container environment (Database + Backend + Frontend)",
    },
  ];

  // 4. Environment Variables
  const envVars = contract?.environmentVariables?.length
    ? contract.environmentVariables.map((e) => ({ key: e.key, example: e.example, purpose: e.purpose }))
    : [
        { key: "DATABASE_URL", example: "postgresql://postgres:postgres@localhost:5432/app_db", purpose: "Database connection URI with credentials" },
        { key: "JWT_SECRET_KEY", example: "dev_secret_key_change_in_production_894372", purpose: "Cryptographic secret for signing authentication tokens" },
        { key: "ENVIRONMENT", example: "development", purpose: "Application environment mode (development/production)" },
        { key: "VITE_API_BASE_URL", example: "http://localhost:8000", purpose: "Backend API endpoint consumed by the frontend client" },
        { key: "PORT", example: "8000", purpose: "Backend application port" },
      ];

  // 5. File Tree Preview
  const fileTreePreview = [
    { path: `backend/${backendManifestName}`, purpose: "Locked backend package dependencies", layer: "backend" as const },
    { path: "backend/app/main.py", purpose: "Primary application server entry point & CORS configuration", layer: "backend" as const },
    { path: "backend/app/config.py", purpose: "Pydantic settings and environment loader", layer: "backend" as const },
    { path: "backend/app/database.py", purpose: "Database connection engine and session dependency", layer: "backend" as const },
    { path: "backend/app/models.py", purpose: "SQL relational models matching DDL schema contract", layer: "backend" as const },
    { path: "backend/app/schemas.py", purpose: "Data validation models matching REST API contracts", layer: "backend" as const },
    { path: "backend/app/routers/api.py", purpose: "Feature endpoints and business logic controllers", layer: "backend" as const },
    { path: "database/schema.sql", purpose: "PostgreSQL relational table DDL, constraints, and indexes", layer: "database" as const },
    { path: "database/seed.sql", purpose: "Initial mock records for testing features instantly", layer: "database" as const },
    { path: `frontend/${frontendManifestName}`, purpose: "Locked frontend dependencies, scripts, and build tooling", layer: "frontend" as const },
    { path: "frontend/vite.config.ts", purpose: "Vite bundler configuration with Tailwind CSS plugin", layer: "frontend" as const },
    { path: "frontend/src/api/client.ts", purpose: "Type-safe Axios client mirroring backend routes", layer: "frontend" as const },
    { path: "frontend/src/App.tsx", purpose: "Master application layout, theme wrapper, and navigation", layer: "frontend" as const },
    { path: "frontend/src/views/DashboardView.tsx", purpose: "Primary interactive dashboard view", layer: "frontend" as const },
    { path: ".env.example", purpose: "Complete template for all required runtime environment variables", layer: "root" as const },
    { path: "docker-compose.yml", purpose: "Multi-container orchestration for PostgreSQL, backend, and frontend", layer: "root" as const },
    { path: "README.md", purpose: "Quickstart runbook with copy-paste setup commands and architecture overview", layer: "root" as const },
  ];

  // 6. Run Instructions
  const runInstructions = [
    { step: 1, title: "Initialize Database", command: "docker-compose up -d db", note: "Spins up PostgreSQL container and mounts schema.sql" },
    { step: 2, title: "Configure Environment", command: "cp .env.example .env", note: "Populates local connection strings and JWT secrets" },
    { step: 3, title: "Install Dependencies", command: isPython ? "pip install -r backend/requirements.txt && cd frontend && npm install" : "npm run setup", note: "Installs approved backend and frontend libraries" },
    { step: 4, title: "Start Backend Server", command: isPython ? "uvicorn backend.app.main:app --reload --port 8000" : "npm run dev:backend", note: "Launches API server with Swagger docs at http://localhost:8000/docs" },
    { step: 5, title: "Launch Frontend UI", command: "cd frontend && npm run dev", note: "Opens interactive UI with HMR at http://localhost:5173" },
  ];

  return {
    title: `${title} Setup & Dependency Contract`,
    backendLanguage,
    backendFramework,
    backendManifestName,
    frontendFramework,
    frontendManifestName,
    backendDependencies: backendDeps,
    frontendDependencies: frontendDeps,
    devScripts,
    environmentVariables: envVars,
    fileTreePreview,
    runInstructions,
  };
}

export const generateProjectSetup = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { blueprint: Blueprint; profile?: StudentProfile | null | undefined; contract?: BackendContractDoc | null | undefined }) => data
  )
  .handler(async ({ data }) => {
    const fallback = generateProjectSetupFallback(data.blueprint, data.profile, data.contract);

    try {
      const prompt = `${data.profile ? profileBlock(data.profile) : ""}

PROJECT BLUEPRINT:
Title: ${data.blueprint.title}
Problem: ${data.blueprint.overview.problemStatement}
Solution: ${data.blueprint.overview.proposedSolution}
Tech Stack: ${data.blueprint.stack.map((s) => `${s.name} (${s.category})`).join(", ")}

BACKEND CONTRACT SPECIFICATION:
Framework: ${data.contract?.framework || "FastAPI"}
Database: ${data.contract?.databaseEngine || "PostgreSQL 16"}
APIs: ${data.contract?.apiRoutes?.map((r) => `${r.method} ${r.route} (${r.summary})`).slice(0, 8).join(", ") || "REST"}

As Yaduk Infrastructure Architect, design the complete project dependency and environment setup specification tailored dynamically to this project.
Return strictly valid JSON with exact packages, version constraints, setup commands, and directory tree.

JSON shape:
{
  "title": "${fallback.title}",
  "backendLanguage": "${fallback.backendLanguage}",
  "backendFramework": "${fallback.backendFramework}",
  "backendManifestName": "${fallback.backendManifestName}",
  "frontendFramework": "${fallback.frontendFramework}",
  "frontendManifestName": "${fallback.frontendManifestName}",
  "backendDependencies": [
    {"name": "package-name", "version": ">=1.0.0", "purpose": "Clear 1-sentence technical purpose", "isDev": false, "category": "core"}
  ],
  "frontendDependencies": [
    {"name": "package-name", "version": "^1.0.0", "purpose": "Clear 1-sentence technical purpose", "isDev": false, "category": "core"}
  ],
  "devScripts": [
    {"command": "setup", "script": "install command", "purpose": "What this executes"}
  ],
  "environmentVariables": [
    {"key": "DATABASE_URL", "example": "postgresql://...", "purpose": "Purpose"}
  ],
  "fileTreePreview": [
    {"path": "backend/app/main.py", "purpose": "Entry point", "layer": "backend"}
  ],
  "runInstructions": [
    {"step": 1, "title": "Step title", "command": "shell command", "note": "Helpful note"}
  ]
}`;

      const res = await generateJson<ProjectSetupSpec>({
        system:
          "You are Yaduk, Principal Infrastructure Architect. " +
          "You formulate clean, production-grade dependency manifests and setup runbooks for engineering projects.",
        prompt,
        agentName: "Yaduk Project Setup Architect",
      });

      if (
        res?.backendDependencies &&
        res.backendDependencies.length > 0 &&
        res.frontendDependencies &&
        res.frontendDependencies.length > 0
      ) {
        return {
          ...fallback,
          ...res,
          title: res.title || fallback.title,
          backendLanguage: res.backendLanguage || fallback.backendLanguage,
          backendFramework: res.backendFramework || fallback.backendFramework,
          backendManifestName: res.backendManifestName || fallback.backendManifestName,
          frontendFramework: res.frontendFramework || fallback.frontendFramework,
          frontendManifestName: res.frontendManifestName || fallback.frontendManifestName,
        };
      }
    } catch (err) {
      console.warn("generateProjectSetup API call error, falling back to local synthesizer:", err);
    }

    return fallback;
  });

export function generateBackendEngineFallback(
  blueprint: Blueprint,
  contract: BackendContractDoc,
  setupSpec: ProjectSetupSpec
): GeneratedCodeFile[] {
  const title = blueprint.title || "Production Software Platform";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const tables = contract.databaseSchema?.tables || [];
  const routes = contract.apiRoutes || [];
  const screens = contract.screenMappings || [];

  // Build requirements.txt from approved dependencies
  const requirementsTxt = setupSpec.backendDependencies
    .map((dep) => `${dep.name}${dep.version.startsWith(">=") || dep.version.startsWith("==") ? dep.version : `==${dep.version.replace(/^\^/, "")}`}`)
    .join("\n");

  // Generate REAL models from contract DDL tables
  const modelsCode = tables.length > 0
    ? generateModelsFromContract(tables, title)
    : `"""${title} — SQLAlchemy ORM Models."""\nfrom sqlalchemy import Column, String, Integer, DateTime, Text\nfrom sqlalchemy.sql import func\nfrom backend.app.database import Base\n\nclass BaseEntity(Base):\n    __tablename__ = "base_entities"\n    id = Column(Integer, primary_key=True, autoincrement=True)\n    name = Column(String(255), nullable=False)\n    description = Column(Text, nullable=True)\n    created_at = Column(DateTime(timezone=True), server_default=func.now())\n`;

  // Generate REAL schemas from contract routes
  const schemasCode = tables.length > 0
    ? generateSchemasFromContract(tables, routes, title)
    : `"""${title} — Pydantic v2 Schemas."""\nfrom pydantic import BaseModel, ConfigDict, Field\nfrom typing import Optional, List\nfrom datetime import datetime\n\nclass HealthResponse(BaseModel):\n    status: str = "healthy"\n    app: str = "${title}"\n\nclass TokenResponse(BaseModel):\n    access_token: str\n    token_type: str = "bearer"\n`;

  // Generate per-screen routers with REAL CRUD logic
  const routerFiles: GeneratedCodeFile[] = [];
  if (screens.length > 0) {
    for (const screen of screens) {
      const routerCode = generateRouterForScreen(screen, routes, tables);
      if (routerCode) {
        const screenSlug = screen.screen.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        routerFiles.push({
          path: `backend/app/routers/${screenSlug}.py`,
          language: "python",
          description: `${screen.screen} — API router with CRUD operations`,
          code: routerCode,
          layer: "backend",
        });
      }
    }
  }

  // If no screen-specific routers generated, create a combined router from all routes
  if (routerFiles.length === 0) {
    const allRouterCode = `"""${title} — Combined API Router."""\nfrom fastapi import APIRouter, Depends, HTTPException, status\nfrom typing import List, Any\nfrom backend.app.schemas import HealthResponse\n\nrouter = APIRouter(tags=["API Operations"])\n\n@router.get("/health", response_model=HealthResponse)\nasync def health_check():\n    return HealthResponse()\n\n${routes.map((r, i) => {
      const fnName = r.route.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      return `@router.${r.method.toLowerCase()}("${r.route.replace(/^(\/api\/v1)?/, "") || "/"}", tags=["${r.screenName}"])\nasync def ${fnName}_${i}():\n    """${r.summary}"""\n    return ${r.responsePayload || `{"status": "ok", "message": "${r.summary}"}`}\n`;
    }).join("\n")}\n`;
    routerFiles.push({
      path: "backend/app/routers/api.py",
      language: "python",
      description: "Combined API router with all endpoints",
      code: allRouterCode,
      layer: "backend",
    });
  }

  // Generate main.py that imports all routers
  const routerImports = routerFiles.map(f => {
    const name = f.path.split('/').pop()?.replace('.py', '') || 'api';
    return `from backend.app.routers.${name} import router as ${name}_router`;
  }).join('\n');
  const routerMounts = routerFiles.map(f => {
    const name = f.path.split('/').pop()?.replace('.py', '') || 'api';
    return `app.include_router(${name}_router, prefix="/api/v1")`;
  }).join('\n');

  const files: GeneratedCodeFile[] = [
    {
      path: `backend/${setupSpec.backendManifestName}`,
      language: setupSpec.backendManifestName === "package.json" ? "json" : "text",
      description: `Locked backend dependencies as approved by student in Setup Inspector`,
      code: setupSpec.backendManifestName === "package.json"
        ? JSON.stringify({ name: `${slug}-backend`, version: "1.0.0", dependencies: Object.fromEntries(setupSpec.backendDependencies.filter(d => !d.isDev).map(d => [d.name, d.version])), devDependencies: Object.fromEntries(setupSpec.backendDependencies.filter(d => d.isDev).map(d => [d.name, d.version])) }, null, 2)
        : requirementsTxt,
      layer: "backend",
    },
    {
      path: "backend/app/__init__.py",
      language: "python",
      description: "Package initialization marker",
      code: `"""${title} Backend Application Package."""\n__version__ = "1.0.0"\n`,
      layer: "backend",
    },
    {
      path: "backend/app/config.py",
      language: "python",
      description: "Application configuration & environment variables loader",
      code: `import os\nfrom pydantic_settings import BaseSettings, SettingsConfigDict\n\nclass Settings(BaseSettings):\n    APP_NAME: str = "${title}"\n    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")\n    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/${slug}_db")\n    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev_secret_key_replace_in_production")\n    JWT_ALGORITHM: str = "HS256"\n    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60\n\n    model_config = SettingsConfigDict(env_file=".env", extra="ignore")\n\nsettings = Settings()\n`,
      layer: "backend",
    },
    {
      path: "backend/app/database.py",
      language: "python",
      description: "Async database engine, session factory, and Base declarative model",
      code: `from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession\nfrom sqlalchemy.orm import DeclarativeBase\nfrom backend.app.config import settings\n\nengine = create_async_engine(settings.DATABASE_URL, echo=settings.ENVIRONMENT == "development")\nAsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)\n\nclass Base(DeclarativeBase):\n    pass\n\nasync def get_db():\n    async with AsyncSessionLocal() as session:\n        try:\n            yield session\n        finally:\n            await session.close()\n`,
      layer: "backend",
    },
    {
      path: "backend/app/models.py",
      language: "python",
      description: "SQLAlchemy ORM models generated from contract database schema",
      code: modelsCode,
      layer: "backend",
    },
    {
      path: "backend/app/schemas.py",
      language: "python",
      description: "Pydantic v2 schemas generated from contract API routes",
      code: schemasCode,
      layer: "backend",
    },
    ...routerFiles,
    {
      path: "backend/app/main.py",
      language: "python",
      description: "FastAPI server entry point with CORS and all routers mounted",
      code: `from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\nfrom backend.app.config import settings\nfrom backend.app.schemas import HealthResponse\n${routerImports}\n\napp = FastAPI(\n    title=settings.APP_NAME,\n    version="1.0.0",\n    description="Production API for ${title}"\n)\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["*"],\n    allow_credentials=True,\n    allow_methods=["*"],\n    allow_headers=["*"],\n)\n\n${routerMounts}\n\n@app.get("/health", response_model=HealthResponse, tags=["System"])\nasync def root_health():\n    return HealthResponse()\n`,
      layer: "backend",
    },
    {
      path: "backend/Dockerfile",
      language: "dockerfile",
      description: "Docker build specification for backend server container",
      code: `FROM python:3.11-slim\nWORKDIR /app\nCOPY backend/requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY backend/ ./backend/\nEXPOSE 8000\nCMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]\n`,
      layer: "backend",
    },
    {
      path: "database/schema.sql",
      language: "sql",
      description: "PostgreSQL DDL schema from the Backend Contract",
      code: contract.databaseSchema.rawSqlDdl,
      layer: "database",
    },
    {
      path: "database/seed.sql",
      language: "sql",
      description: "Initial seed records for development and testing",
      code: `-- Seed Data for ${title}\n${tables.map(t => `-- Seed for ${t.tableName}\nINSERT INTO ${t.tableName} (${t.columns.filter(c => !c.isPrimary && c.name !== 'created_at' && c.name !== 'updated_at').map(c => c.name).join(', ')}) VALUES\n(${t.columns.filter(c => !c.isPrimary && c.name !== 'created_at' && c.name !== 'updated_at').map(c => sqlTypeToPydantic(c.type) === 'str' ? "'sample_value'" : sqlTypeToPydantic(c.type) === 'int' ? '1' : sqlTypeToPydantic(c.type) === 'bool' ? 'true' : sqlTypeToPydantic(c.type) === 'float' ? '0.0' : "'{}'").join(', ')})\nON CONFLICT DO NOTHING;\n`).join('\n')}`,
      layer: "database",
    },
    {
      path: ".env.example",
      language: "bash",
      description: "Environment configuration template",
      code: setupSpec.environmentVariables.map((v) => `# ${v.purpose}\n${v.key}=${v.example}`).join("\n\n"),
      layer: "root",
    },
    {
      path: "docker-compose.yml",
      language: "yaml",
      description: "Multi-container Docker orchestration",
      code: `version: '3.8'\n\nservices:\n  db:\n    image: postgres:16-alpine\n    container_name: ${slug}_db\n    environment:\n      POSTGRES_DB: ${slug}_db\n      POSTGRES_USER: postgres\n      POSTGRES_PASSWORD: postgres\n    ports:\n      - "5432:5432"\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro\n      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql:ro\n\n  backend:\n    build: \n      context: .\n      dockerfile: backend/Dockerfile\n    container_name: ${slug}_backend\n    command: uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload\n    ports:\n      - "8000:8000"\n    environment:\n      DATABASE_URL: postgresql+asyncpg://postgres:postgres@db:5432/${slug}_db\n    depends_on:\n      - db\n\nvolumes:\n  pgdata:\n`,
      layer: "root",
    },
  ];

  return files;
}

export const generateBackendEngine = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      blueprint: Blueprint;
      contract: BackendContractDoc;
      setupSpec: ProjectSetupSpec;
    }) => data
  )
  .handler(async ({ data }) => {
    const fallback = generateBackendEngineFallback(data.blueprint, data.contract, data.setupSpec);
    const title = data.blueprint.title || "Production Software Platform";
    const tables = data.contract.databaseSchema?.tables || [];
    const routes = data.contract.apiRoutes || [];
    const screens = data.contract.screenMappings || [];

    // Try chunked per-file generation using the codegen endpoint
    try {
      const generatedFiles: GeneratedCodeFile[] = [...fallback]; // Start from enriched fallback
      const existingFiles: Record<string, string> = {};
      
      // Build approved deps list
      const approvedDeps = data.setupSpec.backendDependencies
        .map((d) => ({ name: d.name, purpose: d.purpose }))
        .slice(0, 15);

      // Define which files to enhance via AI (the ones that benefit most)
      const filesToEnhance = [
        { path: 'backend/app/models.py', purpose: 'SQLAlchemy ORM models for all database tables with relationships, indexes, and computed properties' },
        { path: 'backend/app/schemas.py', purpose: 'Pydantic v2 request/response schemas with validation, field constraints, and examples' },
      ];
      
      // Add per-screen routers (prioritize top 2 primary domain screens for rapid response)
      for (const screen of screens.slice(0, 2)) {
        const screenSlug = screen.screen.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        filesToEnhance.push({
          path: `backend/app/routers/${screenSlug}.py`,
          purpose: `Complete CRUD API router for ${screen.screen} screen with DB queries, auth, validation, and error handling`,
        });
      }
      
      filesToEnhance.push({ 
        path: 'backend/app/main.py', 
        purpose: 'FastAPI application entry point importing all routers with CORS, middleware, and health checks' 
      });

      // Generate each file via the codegen endpoint
      for (const fileSpec of filesToEnhance) {
        try {
          const screenContext = screens.find(s => fileSpec.path.includes(s.screen.toLowerCase().replace(/[^a-z0-9]+/g, '_')));
          const fileRoutes = screenContext 
            ? routes.filter(r => r.screenName === screenContext.screen)
            : routes;
          
          const code = await callCodegenEndpoint({
            file_path: fileSpec.path,
            file_purpose: fileSpec.purpose,
            project_title: title,
            blueprint_summary: data.blueprint.overview?.proposedSolution || '',
            db_schema_ddl: data.contract.databaseSchema.rawSqlDdl,
            api_routes: fileRoutes.map(r => ({
              method: r.method,
              route: r.route,
              summary: r.summary,
              authRequired: r.authRequired,
              requestPayload: r.requestPayload,
              responsePayload: r.responsePayload,
            })),
            approved_dependencies: approvedDeps,
            existing_files: existingFiles,
            screen_context: screenContext || undefined,
            mvp_features: data.blueprint.features?.slice(0, 4).map(f => ({
              name: typeof f === 'object' ? (f as any).name || (f as any).title || String(f) : String(f),
              detail: typeof f === 'object' ? (f as any).description || (f as any).detail || '' : '',
            })),
          });

          if (code && code.length > 50) {
            // Replace the fallback version with AI-generated version
            const idx = generatedFiles.findIndex(f => f.path === fileSpec.path);
            const newFile: GeneratedCodeFile = {
              path: fileSpec.path,
              language: 'python',
              description: fileSpec.purpose,
              code,
              layer: 'backend',
            };
            if (idx >= 0) {
              generatedFiles[idx] = newFile;
            } else {
              generatedFiles.push(newFile);
            }
            existingFiles[fileSpec.path] = code;
          }
        } catch (fileErr) {
          console.warn(`Chunked codegen failed for ${fileSpec.path}, keeping fallback:`, fileErr);
          // Keep the enriched fallback version
        }
      }

      return generatedFiles;
    } catch (err) {
      console.warn("Chunked backend codegen failed entirely, returning enriched fallback:", err);
    }

    // If chunked generation fails, try the legacy single-shot approach
    try {
      const approvedPackagesList = data.setupSpec.backendDependencies
        .map((d) => `- ${d.name} (${d.version}): ${d.purpose}`)
        .join("\n");

      const prompt = `You are a Principal Backend Engineer generating complete backend code for: "${title}".\n\n=== APPROVED DEPENDENCIES ===\n${approvedPackagesList}\n\n=== DATABASE SCHEMA ===\n${data.contract.databaseSchema.rawSqlDdl}\n\n=== API ENDPOINTS ===\n${JSON.stringify(routes, null, 2)}\n\nGenerate complete, production-grade backend source code files.\nFormat: === FILE: path === ... === END FILE ===\n\nRequired: models.py, schemas.py, routers, main.py, config.py, database.py\nWrite COMPLETE code — no stubs, no TODOs.`;

      const codeText = await generateText({
        system: "You are a Senior Backend Systems Engineer. Output complete, runnable code files.",
        prompt,
        temperature: 0.2,
        maxTokens: 2500,
        agentName: "Yaduk Engine 1 (Backend Architect)",
      });

      const parsed = parseDelimitedCodeFiles(codeText);
      if (parsed.length >= 2) {
        const fileMap = new Map<string, GeneratedCodeFile>();
        fallback.forEach((f) => fileMap.set(f.path, f));
        parsed.forEach((f) => fileMap.set(f.path, f));
        return Array.from(fileMap.values());
      }
    } catch (err) {
      console.warn("Legacy single-shot backend engine also failed:", err);
    }

    return fallback;
  });

export function generateFrontendEngineFallback(
  blueprint: Blueprint,
  selectedTheme: string,
  contract: BackendContractDoc,
  setupSpec: ProjectSetupSpec
): GeneratedCodeFile[] {
  const title = blueprint.title || "Production Software Platform";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const screens = contract.screenMappings || [];
  const routes = contract.apiRoutes || [];
  const theme = resolveThemePalette(selectedTheme);

  const packageJsonContent = JSON.stringify(
    {
      name: `${slug}-frontend`,
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
      },
      dependencies: Object.fromEntries(
        setupSpec.frontendDependencies.filter((d) => !d.isDev).map((d) => [d.name, d.version])
      ),
      devDependencies: Object.fromEntries(
        setupSpec.frontendDependencies.filter((d) => d.isDev).map((d) => [d.name, d.version])
      ),
    },
    null,
    2
  );

  // Generate page components for each screen
  const pageFiles: GeneratedCodeFile[] = screens.map(screen => {
    const componentName = snakeToPascal(screen.screen.replace(/[^a-zA-Z0-9]+/g, '_'));
    const code = generatePageComponentForScreen(screen, routes, theme, title);
    return {
      path: `frontend/src/pages/${componentName}.tsx`,
      language: "typescript",
      description: `${screen.screen} page with data fetching, forms, and ${selectedTheme} theme styling`,
      code,
      layer: "frontend" as const,
    };
  });

  // Generate API client with typed functions
  const apiClientCode = `import axios from 'axios';\n\nexport const apiClient = axios.create({\n  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',\n  headers: { 'Content-Type': 'application/json' },\n});\n\napiClient.interceptors.request.use((config) => {\n  const token = localStorage.getItem('auth_token');\n  if (token) config.headers.Authorization = \`Bearer \${token}\`;\n  return config;\n});\n\napiClient.interceptors.response.use(\n  (response) => response,\n  (error) => {\n    console.error('API Error:', error.response?.data || error.message);\n    return Promise.reject(error);\n  }\n);\n\nexport const ApiService = {\n  getHealth: () => apiClient.get('/api/v1/health').then(r => r.data),\n${routes.map((r, i) => {
    const fnName = r.route.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const method = r.method.toLowerCase();
    return `  ${fnName}_${i}: (data?: any) => apiClient.${method}('${r.route}'${method !== 'get' ? ', data' : ''}).then(r => r.data),`;
  }).join("\n")}\n};\n`;

  // Generate App with router matching screens
  const pageImports = screens.map(s => {
    const name = snakeToPascal(s.screen.replace(/[^a-zA-Z0-9]+/g, '_'));
    return `import ${name} from './pages/${name}';`;
  }).join('\n');

  const navItems = screens.map(s => `'${s.screen.toLowerCase()}'`).join(', ');
  const pageRendering = screens.map(s => {
    const name = snakeToPascal(s.screen.replace(/[^a-zA-Z0-9]+/g, '_'));
    return `        {activeTab === '${s.screen.toLowerCase()}' && <${name} />}`;
  }).join('\n');

  const appCode = `import React, { useState } from 'react';\n${pageImports}\n\nexport default function App() {\n  const [activeTab, setActiveTab] = useState('${screens[0]?.screen.toLowerCase() || 'dashboard'}');\n\n  return (\n    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '${theme.dark}', color: '${theme.secondary}' }}>\n      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '${theme.primary}20', backgroundColor: '${theme.dark}' }}>\n        <div className="flex items-center gap-3">\n          <div className="size-9 rounded-xl flex items-center justify-center font-bold text-white shadow-lg" style={{ backgroundColor: '${theme.primary}' }}>\n            {"${title}".charAt(0)}\n          </div>\n          <div>\n            <h1 className="font-bold text-base leading-tight" style={{ color: '${theme.secondary}' }}>${title}</h1>\n            <p className="text-xs opacity-60">Theme: ${selectedTheme}</p>\n          </div>\n        </div>\n        <nav className="flex items-center gap-1 p-1 rounded-xl text-xs font-semibold" style={{ backgroundColor: '${theme.primary}15' }}>\n          {[${navItems}].map(tab => (\n            <button\n              key={tab}\n              onClick={() => setActiveTab(tab)}\n              className={\`px-3 py-1.5 rounded-lg capitalize transition-colors \${activeTab === tab ? 'text-white' : 'opacity-60 hover:opacity-100'}\`}\n              style={activeTab === tab ? { backgroundColor: '${theme.primary}' } : {}}\n            >\n              {tab}\n            </button>\n          ))}\n        </nav>\n      </header>\n      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">\n${pageRendering}\n      </main>\n    </div>\n  );\n}\n`;

  const files: GeneratedCodeFile[] = [
    {
      path: "frontend/package.json",
      language: "json",
      description: "Locked frontend dependencies as approved in Setup Inspector",
      code: packageJsonContent,
      layer: "frontend",
    },
    {
      path: "frontend/vite.config.ts",
      language: "typescript",
      description: "Vite bundler configuration with React and proxy",
      code: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    port: 5173,\n    proxy: {\n      '/api': {\n        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',\n        changeOrigin: true,\n      }\n    }\n  }\n});\n`,
      layer: "frontend",
    },
    {
      path: "frontend/index.html",
      language: "html",
      description: "HTML5 entry document",
      code: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${title}</title>\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">\n  </head>\n  <body style="background-color: ${theme.dark}; color: ${theme.secondary}" class="antialiased">\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n`,
      layer: "frontend",
    },
    {
      path: "frontend/src/index.css",
      language: "css",
      description: `Tailwind CSS styles with ${selectedTheme} theme colors`,
      code: `@import "tailwindcss";\n\n:root {\n  --color-primary: ${theme.primary};\n  --color-secondary: ${theme.secondary};\n  --color-accent: ${theme.accent};\n  --color-dark: ${theme.dark};\n}\n\n@layer base {\n  body {\n    font-family: 'Inter', system-ui, -apple-system, sans-serif;\n    background-color: var(--color-dark);\n    color: var(--color-secondary);\n  }\n  h1, h2, h3, h4, h5, h6 {\n    font-family: 'Space Grotesk', system-ui, sans-serif;\n  }\n}\n`,
      layer: "frontend",
    },
    {
      path: "frontend/src/api/client.ts",
      language: "typescript",
      description: "Typed API client with auth interceptors",
      code: apiClientCode,
      layer: "frontend",
    },
    ...pageFiles,
    {
      path: "frontend/src/App.tsx",
      language: "typescript",
      description: `Application shell with ${screens.length} page navigation and ${selectedTheme} theme`,
      code: appCode,
      layer: "frontend",
    },
    {
      path: "frontend/src/main.tsx",
      language: "typescript",
      description: "React 19 application bootstrapping entry point",
      code: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n`,
      layer: "frontend",
    },
    {
      path: "frontend/tsconfig.json",
      language: "json",
      description: "TypeScript compiler configuration",
      code: JSON.stringify({ compilerOptions: { target: "ES2020", useDefineForClassFields: true, lib: ["ES2020", "DOM", "DOM.Iterable"], module: "ESNext", skipLibCheck: true, moduleResolution: "bundler", allowImportingTsExtensions: true, resolveJsonModule: true, isolatedModules: true, noEmit: true, jsx: "react-jsx", strict: true }, include: ["src"] }, null, 2),
      layer: "frontend",
    },
    {
      path: "README.md",
      language: "markdown",
      description: "Production runbook and architecture guide",
      code: `# ${title}\n\nFull-stack application synthesized by Yaduk AI with the **${selectedTheme}** design theme.\n\n## Architecture\n- **Backend**: ${setupSpec.backendFramework} (${setupSpec.backendLanguage})\n- **Frontend**: ${setupSpec.frontendFramework} with ${screens.length} pages\n- **Database**: ${contract.databaseEngine}\n- **Theme**: ${selectedTheme}\n\n## Pages\n${screens.map(s => `- **${s.screen}** (${s.route}): ${s.apiEndpoints.join(', ')}`).join('\n')}\n\n## Quickstart\n${setupSpec.runInstructions.map(i => `### ${i.step}. ${i.title}\n\`\`\`bash\n${i.command}\n\`\`\`\n*${i.note}*`).join('\n\n')}\n`,
      layer: "root",
    },
  ];

  return files;
}

export const generateFrontendEngine = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      blueprint: Blueprint;
      selectedTheme?: string | undefined;
      contract: BackendContractDoc;
      setupSpec: ProjectSetupSpec;
    }) => data
  )
  .handler(async ({ data }) => {
    const theme = data.selectedTheme || "modern-minimal";
    const fallback = generateFrontendEngineFallback(data.blueprint, theme, data.contract, data.setupSpec);
    const title = data.blueprint.title || "Production Software Platform";
    const screens = data.contract.screenMappings || [];
    const routes = data.contract.apiRoutes || [];
    const themeColors = resolveThemePalette(theme);

    // Try chunked per-file generation
    try {
      const generatedFiles: GeneratedCodeFile[] = [...fallback];
      const existingFiles: Record<string, string> = {};
      const approvedDeps = data.setupSpec.frontendDependencies
        .map((d) => ({ name: d.name, purpose: d.purpose }))
        .slice(0, 15);

      // Define which files to enhance via AI
      const filesToEnhance: { path: string; purpose: string; screenContext?: any }[] = [
        { path: 'frontend/src/api/client.ts', purpose: 'Typed API client with axios, auth interceptors, and functions for every endpoint' },
      ];

      // Add per-screen page components (top 2 primary screens for fast response)
      for (const screen of screens.slice(0, 2)) {
        const componentName = snakeToPascal(screen.screen.replace(/[^a-zA-Z0-9]+/g, '_'));
        filesToEnhance.push({
          path: `frontend/src/pages/${componentName}.tsx`,
          purpose: `Complete React page for ${screen.screen} with forms, data tables, loading states, error handling, and ${theme} theme styling`,
          screenContext: screen,
        });
      }

      filesToEnhance.push({
        path: 'frontend/src/App.tsx',
        purpose: `Application shell with tab navigation for ${screens.length} pages, ${theme} theme, and responsive layout`,
      });

      for (const fileSpec of filesToEnhance) {
        try {
          const screenContext = fileSpec.screenContext;
          const fileRoutes = screenContext
            ? routes.filter(r => r.screenName === screenContext.screen)
            : routes;

          const code = await callCodegenEndpoint({
            file_path: fileSpec.path,
            file_purpose: fileSpec.purpose,
            project_title: title,
            blueprint_summary: data.blueprint.overview?.proposedSolution || '',
            db_schema_ddl: data.contract.databaseSchema.rawSqlDdl,
            api_routes: fileRoutes.map(r => ({
              method: r.method,
              route: r.route,
              summary: r.summary,
              requestPayload: r.requestPayload,
              responsePayload: r.responsePayload,
            })),
            theme: {
              primary: themeColors.primary,
              secondary: themeColors.secondary,
              accent: themeColors.accent,
              dark: themeColors.dark,
              headingFont: 'Space Grotesk',
              bodyFont: 'Inter',
            },
            approved_dependencies: approvedDeps,
            existing_files: existingFiles,
            screen_context: screenContext || undefined,
            mvp_features: data.blueprint.features?.slice(0, 4).map(f => ({
              name: typeof f === 'object' ? (f as any).name || (f as any).title || String(f) : String(f),
              detail: typeof f === 'object' ? (f as any).description || (f as any).detail || '' : '',
            })),
          });

          if (code && code.length > 50) {
            const idx = generatedFiles.findIndex(f => f.path === fileSpec.path);
            const newFile: GeneratedCodeFile = {
              path: fileSpec.path,
              language: 'typescript',
              description: fileSpec.purpose,
              code,
              layer: 'frontend',
            };
            if (idx >= 0) {
              generatedFiles[idx] = newFile;
            } else {
              generatedFiles.push(newFile);
            }
            existingFiles[fileSpec.path] = code;
          }
        } catch (fileErr) {
          console.warn(`Chunked codegen failed for ${fileSpec.path}, keeping fallback:`, fileErr);
        }
      }

      return generatedFiles;
    } catch (err) {
      console.warn("Chunked frontend codegen failed, returning enriched fallback:", err);
    }

    // Legacy single-shot fallback
    try {
      const approvedPackagesList = data.setupSpec.frontendDependencies
        .map((d) => `- ${d.name} (${d.version}): ${d.purpose}`)
        .join("\n");

      const prompt = `You are a Principal Frontend UI Engineer generating complete frontend code for: "${title}".\n\n=== DEPENDENCIES ===\n${approvedPackagesList}\n\n=== DESIGN THEME: "${theme.toUpperCase()}" ===\nPrimary: ${themeColors.primary}, Secondary: ${themeColors.secondary}, Accent: ${themeColors.accent}, Dark: ${themeColors.dark}\n\n=== SCREENS ===\n${JSON.stringify(screens, null, 2)}\n\n=== API ROUTES ===\n${JSON.stringify(routes, null, 2)}\n\nGenerate complete, production-grade frontend source code.\nFormat: === FILE: path === ... === END FILE ===\nWrite COMPLETE code — no stubs, no TODOs.`;

      const codeText = await generateText({
        system: "You are an expert Frontend Architect. Output complete, runnable React TypeScript code.",
        prompt,
        temperature: 0.2,
        maxTokens: 2500,
        agentName: "Yaduk Engine 2 (Frontend Architect)",
      });

      const parsed = parseDelimitedCodeFiles(codeText);
      if (parsed.length >= 2) {
        const fileMap = new Map<string, GeneratedCodeFile>();
        fallback.forEach((f) => fileMap.set(f.path, f));
        parsed.forEach((f) => fileMap.set(f.path, f));
        return Array.from(fileMap.values());
      }
    } catch (err) {
      console.warn("Legacy single-shot frontend engine also failed:", err);
    }

    return fallback;
  });
