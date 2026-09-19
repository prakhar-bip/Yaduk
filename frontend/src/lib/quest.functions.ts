import { createServerFn } from "@tanstack/react-start";
import { generateJson, generateText } from "./ai-gateway.server";
import type {
  ApiRouteSpec,
  BackendContractDoc,
  BackendServiceSpec,
  Blueprint,
  DatabaseTableSpec,
  Feasibility,
  ProjectIdea,
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



