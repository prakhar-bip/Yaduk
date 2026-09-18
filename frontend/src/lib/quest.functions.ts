import { createServerFn } from "@tanstack/react-start";
import { generateJson, generateText } from "./ai-gateway.server";
import type {
  ApiEndpointContract,
  Blueprint,
  Feasibility,
  ProductionBatch,
  ProductionManifest,
  ProjectIdea,
  PrototypeData,
  PrototypeFile,
  QuestScroll,
  StudentProfile,
} from "./types";

const SYSTEM =
  "You are Yaduk, an expert final-year project advisor and systems architect by Yaduka for engineering students. " +
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
    return await generateJson<Blueprint>({
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
"roadmap":[{"phase":"01","title":"e.g. Planning & requirements","weeks":"wk 1","tasks":["3-5 concrete tasks"]}],
"challenges":[{"challenge":"","solution":""}]}
Roadmap must cover planning, requirements, setup, core/backend, frontend, database, AI integration if relevant, testing, deployment.`,
    });
  });

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

As Yaduk (AI project architect & design advisor by Yaduka), analyze the domain, problem statement, target audience, and technology of this engineering project.
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

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "tsx":
    case "ts":
      return "typescript";
    case "jsx":
    case "js":
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
    default:
      return "text";
  }
}

export function parseDelimitedCodeFiles(text: string): PrototypeFile[] {
  const files: PrototypeFile[] = [];

  // Match: === FILE: <path> === ... === END FILE ===
  const equalsFileRegex =
    /===\s*FILE:\s*([^\r\n=]+)\s*===\r?\n([\s\S]*?)(?:===\s*END FILE\s*===|(?====\s*FILE:)|$)/gi;
  let eqMatch: RegExpExecArray | null;

  while ((eqMatch = equalsFileRegex.exec(text)) !== null) {
    const rawPath = eqMatch[1].trim();
    let rawCode = eqMatch[2].trim();
    // If the model wrapped code in ```lang ... ``` inside === FILE ===, strip the outer fences
    const fenceStripMatch = rawCode.match(/^```(?:\w+)?\r?\n([\s\S]*?)\r?\n```$/);
    if (fenceStripMatch) {
      rawCode = fenceStripMatch[1];
    }
    const language = getLanguageFromPath(rawPath);
    files.push({
      path: rawPath,
      language,
      description: `Production file for ${rawPath}`,
      code: rawCode,
    });
  }

  // If no === FILE === was found, try ### FILE: or Markdown format
  if (files.length === 0) {
    const mdFileRegex =
      /(?:###?\s*FILE:?|\*\*File:?\*\*|File:?)\s*`?([^\r\n`]+)`?\r?\n```(\w*)\r?\n([\s\S]*?)```/gi;
    let mdMatch: RegExpExecArray | null;
    while ((mdMatch = mdFileRegex.exec(text)) !== null) {
      const rawPath = mdMatch[1].trim();
      const language = mdMatch[2].trim() || getLanguageFromPath(rawPath);
      const code = mdMatch[3].trimEnd();
      files.push({
        path: rawPath,
        language,
        description: `Production file for ${rawPath}`,
        code,
      });
    }
  }

  // Fallback: If still empty, capture standard code blocks
  if (files.length === 0) {
    const codeBlockRegex = /```(\w+)\r?\n([\s\S]*?)```/g;
    let blockMatch: RegExpExecArray | null;
    let idx = 1;
    while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
      const language = blockMatch[1].trim();
      const code = blockMatch[2].trimEnd();
      let path = `src/module_${idx}.${
        language === "python" ? "py" : language === "typescript" ? "ts" : language === "sql" ? "sql" : "txt"
      }`;
      files.push({
        path,
        language,
        description: `Generated ${language} module`,
        code,
      });
      idx++;
    }
  }

  return files;
}

export const parseMarkdownCodeFiles = parseDelimitedCodeFiles;

type PrototypeUiSpec = Omit<PrototypeData, "codeFiles">;

export const generatePrototype = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { profile: StudentProfile; blueprint: Blueprint; theme?: string }) => data,
  )
  .handler(async ({ data }) => {
    const themeKey = data.theme || "neo-brutalism";

    const uiPrompt = `${profileBlock(data.profile)}

FINALIZED BLUEPRINT:
${JSON.stringify(data.blueprint)}

SELECTED DESIGN SYSTEM & VISUAL THEME: "${themeKey.toUpperCase()}"
Important: Style the screen titles, subtitles, field labels, action copy, and visual elements specifically to embody the "${themeKey}" aesthetic.
- If neo-brutalism: Bold, high-contrast, energetic, punchy labels.
- If modern-minimal: Clean, concise, elegant, polished SaaS tone.
- If cyberpunk: High-tech, futuristic telemetry, glowing status alerts.
- If glassmorphism: Fluid, ethereal, layered, modern visual hierarchy.
- If warm-editorial: Thoughtful, literary, warm, craft-driven tone.
- If enterprise-navy: Professional, data-dense, mission-critical metrics.

Generate an interactive software prototype UI specification and user workflow simulation for this project blueprint.
Focus on creating intuitive screens, realistic interactive metrics, action forms, and setup commands.

JSON shape:
{
  "title": "${data.blueprint.title || "Project Prototype"}",
  "tagline": "A punchy one-sentence motto or hook for this software prototype",
  "architectureSummary": "2-3 sentences explaining how this prototype implements the core architecture and what students can test immediately.",
  "screens": [
    {
      "id": "dashboard",
      "title": "Primary Screen / Dashboard Name",
      "subtitle": "Clear description of the primary user workflow",
      "iconName": "layout",
      "metrics": [
        {"label": "Key Metric 1", "value": "1,280", "change": "+14%"},
        {"label": "Key Metric 2", "value": "98.4%", "change": "+2.1%"}
      ],
      "inputForm": {
        "title": "Interactive Action Form",
        "description": "Short explanation of what happens when the student submits data here",
        "fields": [
          {"name": "input_name", "label": "Field 1 Label", "placeholder": "Example input...", "type": "text"},
          {"name": "category", "label": "Field 2 (Category/Model)", "placeholder": "Select an option", "type": "select", "options": ["Option A", "Option B", "Option C"]}
        ],
        "submitLabel": "Execute / Analyze",
        "successMessage": "Simulation complete: Successfully processed with response code 200 OK."
      },
      "sampleItems": [
        {"title": "Sample Record 1", "category": "Production", "status": "Active", "detail": "Processed in 42ms via API pipeline"},
        {"title": "Sample Record 2", "category": "Staging", "status": "Completed", "detail": "Data synchronized with local storage"}
      ],
      "actions": [
        {"id": "run_test", "label": "Trigger Mock Data Flow", "description": "Simulates request moving through the API", "mockResponse": "Data payload validated: Handshake successful with database."},
        {"id": "inspect_cache", "label": "Inspect State Cache", "description": "Checks local model cache memory", "mockResponse": "Cache status: 2 warm instances ready for inference."}
      ]
    },
    {
      "id": "analytics",
      "title": "Analytics & Pipeline View",
      "subtitle": "Real-time inspection of system data flow and outputs",
      "iconName": "activity",
      "metrics": [
        {"label": "Latency", "value": "38ms", "change": "-6ms"},
        {"label": "Throughput", "value": "450 req/s", "change": "+12%"}
      ],
      "sampleItems": [
        {"title": "Pipeline Batch #104", "category": "Inference", "status": "Passed", "detail": "Zero validation errors detected"},
        {"title": "Model Weights Sync", "category": "Storage", "status": "Ready", "detail": "Latest checkpoint loaded into memory"}
      ],
      "actions": [
        {"id": "benchmark", "label": "Run Stress Simulation", "description": "Tests system against simulated bursts", "mockResponse": "P99 Latency: 48ms across 1,000 simulated packets."}
      ]
    },
    {
      "id": "settings",
      "title": "Configuration & Environment",
      "subtitle": "Inspect environment variables, API secrets and backend links",
      "iconName": "settings",
      "sampleItems": [
        {"title": "Database Connection", "category": "Postgres/SQLite", "status": "Connected", "detail": "Connection pool size: 10"},
        {"title": "Authentication Provider", "category": "JWT Bearer", "status": "Configured", "detail": "Token expiry: 3600 seconds"}
      ],
      "actions": [
        {"id": "verify_env", "label": "Verify Environment Setup", "description": "Checks local dependencies", "mockResponse": "All environment variables parsed and validated successfully."}
      ]
    }
  ],
  "runInstructions": [
    "Clone or extract the downloaded starter package into your local workspace.",
    "Set up backend: cd backend && python -m venv venv && pip install -r requirements.txt",
    "Start API server: uvicorn main:app --reload --port 8000",
    "Set up frontend: cd frontend && npm install && npm run dev",
    "Open http://localhost:5173 to test your interactive prototype live!"
  ]
}

Return strictly valid JSON. Do not generate code files in this output.`;

    const codePrompt = `${profileBlock(data.profile)}

FINALIZED BLUEPRINT:
${JSON.stringify(data.blueprint)}

SELECTED DESIGN SYSTEM & VISUAL THEME: "${themeKey.toUpperCase()}"
The frontend/src/App.tsx starter component MUST strictly embody the "${themeKey}" aesthetic using relevant Tailwind CSS styling (e.g., matching border styles, color palette, surface hierarchy, and button styles).

Generate a complete, high-quality, production-grade multi-file starter codebase for this engineering project.
Write full, realistic, runnable implementations with complete logic, imports, models, and comments.

Format each file cleanly using this exact Markdown code fence structure:

### FILE: frontend/src/App.tsx
\`\`\`typescript
// Full React Component implementation styled with the "${themeKey}" aesthetic using Tailwind CSS and mock state
\`\`\`

### FILE: backend/main.py
\`\`\`python
# Full FastAPI server implementation matching the blueprint endpoints and logic
\`\`\`

### FILE: backend/schemas.py
\`\`\`python
# Complete Pydantic schemas for request validation and response models
\`\`\`

### FILE: database/schema.sql
\`\`\`sql
-- SQL schema with DDL table definitions, foreign keys, and indexes
\`\`\`

### FILE: README.md
\`\`\`markdown
# Project Setup & Architecture Guide
\`\`\`

Provide complete, realistic code for all 5 files. Do not use placeholders or empty stubs.`;

    // Concurrently fetch UI Layout (JSON) and Multi-File Codebase (Markdown) with independent token limits
    const [uiSpec, codeMarkdown] = await Promise.all([
      generateJson<PrototypeUiSpec>({
        system: SYSTEM,
        prompt: uiPrompt,
      }),
      generateText({
        system:
          "You are an expert full-stack software engineer and code architect. " +
          "You write pristine, production-grade starter codebases for student engineering projects.",
        prompt: codePrompt,
        temperature: 0.3,
        maxTokens: 8192,
      }),
    ]);

    let parsedFiles = parseMarkdownCodeFiles(codeMarkdown);

    // Safeguard: Ensure at least the core starter files exist if the model used an unexpected format
    if (parsedFiles.length === 0) {
      parsedFiles = [
        {
          path: "frontend/src/App.tsx",
          language: "typescript",
          description: "Main React application component",
          code: `import React, { useState } from "react";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-slate-950 text-white p-8">\n      <h1 className="text-3xl font-bold">${uiSpec.title || "Project Prototype"}</h1>\n      <p className="text-slate-400 mt-2">${uiSpec.tagline || "Interactive Software Prototype"}</p>\n    </div>\n  );\n}`,
        },
        {
          path: "backend/main.py",
          language: "python",
          description: "FastAPI server starter",
          code: `from fastapi import FastAPI\n\napp = FastAPI(title="${uiSpec.title || "Project API"}")\n\n@app.get("/")\ndef read_root():\n    return {"message": "Server running", "status": "active"}\n`,
        },
        {
          path: "README.md",
          language: "markdown",
          description: "Quick start instructions",
          code: `# ${uiSpec.title || "Project"}\n\n${uiSpec.architectureSummary || "Starter codebase."}\n`,
        },
      ];
    }

    const prototypeResult: PrototypeData = {
      title: uiSpec.title || data.blueprint.title || "Project Prototype",
      tagline: uiSpec.tagline || "Interactive Software Prototype & Starter Codebase",
      architectureSummary:
        uiSpec.architectureSummary ||
        data.blueprint.overview?.problemStatement ||
        "Interactive software prototype.",
      theme: themeKey,
      screens: uiSpec.screens || [],
      codeFiles: parsedFiles,
      runInstructions:
        uiSpec.runInstructions && uiSpec.runInstructions.length > 0
          ? uiSpec.runInstructions
          : [
              "Clone or extract the downloaded starter package into your local workspace.",
              "Set up backend: cd backend && python -m venv venv && pip install -r requirements.txt",
              "Start API server: uvicorn main:app --reload --port 8000",
              "Set up frontend: cd frontend && npm install && npm run dev",
              "Open http://localhost:5173 to test your interactive prototype live!",
            ],
    };

    return prototypeResult;
  });

export const generateProductionManifest = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: StudentProfile; blueprint: Blueprint }) => data)
  .handler(async ({ data }) => {
    const prompt = `${profileBlock(data.profile)}

FINALIZED BLUEPRINT:
${JSON.stringify(data.blueprint)}

Act as a Principal Software Architect. Design the complete Shared Architectural Contract and Topological Batch Generation Schedule for this production application.
Establish the single source of truth for the entire full-stack system: Database DDL, REST API endpoints, environment variables, extra packages required for this specific project, and 5 ordered generation batches.

JSON shape:
{
  "title": "${data.blueprint.title || "Production Application"}",
  "description": "2-sentence executive summary of the production software architecture.",
  "databaseContract": "CREATE TABLE ... (Complete PostgreSQL DDL with CREATE TABLE statements, primary keys, foreign keys, constraints, and indexes for all core entities)",
  "apiContract": [
    {
      "method": "GET",
      "path": "/api/v1/health",
      "summary": "Healthcheck endpoint returning system uptime and database status",
      "responseBody": "{\\"status\\":\\"ok\\",\\"database\\":\\"connected\\"}"
    },
    {
      "method": "GET",
      "path": "/api/v1/items",
      "summary": "Fetch list of primary entity items",
      "responseBody": "[{\\"id\\":\\"1\\",\\"name\\":\\"Sample\\"}]"
    },
    {
      "method": "POST",
      "path": "/api/v1/items",
      "summary": "Create or trigger processing for an item",
      "requestBody": "{\\"title\\":\\"string\\",\\"payload\\":\\"string\\"}",
      "responseBody": "{\\"id\\":\\"string\\",\\"status\\":\\"processed\\"}"
    }
  ],
  "envContract": [
    "DATABASE_URL=postgresql://user:password@localhost:5432/app_db",
    "SECRET_KEY=dev_secret_key_change_in_production",
    "API_V1_PREFIX=/api/v1",
    "ENVIRONMENT=development",
    "VITE_API_BASE_URL=http://localhost:8000"
  ],
  "extraFrontendPackages": ["chart.js", "react-chartjs-2"],
  "extraBackendPackages": ["beautifulsoup4"],
  "batches": [
    {
      "id": "layer_1_database",
      "layerName": "Layer 1: Database & Configuration",
      "description": "Database schema definitions, mock seeds and environment configuration",
      "targetFiles": [
        {"path": "database/schema.sql", "language": "sql", "purpose": "DDL table definitions, foreign keys, and indexes"},
        {"path": "database/seed.sql", "language": "sql", "purpose": "Initial test data records matching schema constraints"},
        {"path": ".env.example", "language": "bash", "purpose": "Complete environment variables template"}
      ]
    },
    {
      "id": "layer_2_backend",
      "layerName": "Layer 2: Backend Core & APIs",
      "description": "FastAPI application server, Pydantic v2 validation schemas, and database session handling",
      "targetFiles": [
        {"path": "backend/app/__init__.py", "language": "python", "purpose": "Python package marker"},
        {"path": "backend/app/schemas.py", "language": "python", "purpose": "Pydantic v2 schemas strictly matching API contract request and response models"},
        {"path": "backend/app/main.py", "language": "python", "purpose": "FastAPI primary server implementing CORS and API contract endpoints"},
        {"path": "backend/requirements.txt", "language": "text", "purpose": "Python package dependencies with pinned versions"}
      ]
    },
    {
      "id": "layer_3_frontend_scaffolding",
      "layerName": "Layer 3: Frontend Scaffolding, API Client & Types",
      "description": "Vite React TypeScript setup, package configuration, and type-safe API client",
      "targetFiles": [
        {"path": "frontend/package.json", "language": "json", "purpose": "NPM package.json with scripts, core React/Vite dependencies, and extra domain packages"},
        {"path": "frontend/vite.config.ts", "language": "typescript", "purpose": "Vite bundler configuration with @vitejs/plugin-react"},
        {"path": "frontend/index.html", "language": "html", "purpose": "HTML entry point mounting src/App.tsx"},
        {"path": "frontend/tsconfig.json", "language": "json", "purpose": "TypeScript compiler options"},
        {"path": "frontend/src/types/api.ts", "language": "typescript", "purpose": "TypeScript models mirroring Pydantic models with 100% type safety"},
        {"path": "frontend/src/lib/apiClient.ts", "language": "typescript", "purpose": "Type-safe Axios client functions with error handling and base URL handling"}
      ]
    },
    {
      "id": "layer_4_ui_views",
      "layerName": "Layer 4: Interactive Views & State",
      "description": "Production React components connecting UI forms to the API client",
      "targetFiles": [
        {"path": "frontend/src/App.tsx", "language": "typescript", "purpose": "Main React application root with layout, navigation, and theme wrapper"},
        {"path": "frontend/src/components/DashboardView.tsx", "language": "typescript", "purpose": "Interactive dashboard component rendering data feeds, forms, and live metrics"}
      ]
    },
    {
      "id": "layer_5_deployment",
      "layerName": "Layer 5: DevOps & Deployment Manifests",
      "description": "Docker containerization, Compose orchestration, and comprehensive setup documentation",
      "targetFiles": [
        {"path": "backend/Dockerfile", "language": "dockerfile", "purpose": "Production multi-stage build container using pip install -r requirements.txt for FastAPI"},
        {"path": "docker-compose.yml", "language": "yaml", "purpose": "Orchestrates PostgreSQL with schema.sql mounted to /docker-entrypoint-initdb.d/, backend API container, and volumes"},
        {"path": "README.md", "language": "markdown", "purpose": "Production runbook with installation, curl tests, and architecture guide"}
      ]
    }
  ]
}

Ensure the database schema has clean SQL syntax and the API contracts cover the core user stories. Return strictly valid JSON.`;

    return await generateJson<ProductionManifest>({
      system: SYSTEM,
      prompt,
      agentName: "Yaduk Production Manifest Agent",
    });
  });

export const generateProductionBatch = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      batch: ProductionBatch;
      manifestContract: {
        databaseContract: string;
        apiContract: ApiEndpointContract[];
        envContract: string[];
      };
      blueprint: Blueprint;
      profile: StudentProfile;
    }) => data,
  )
  .handler(async ({ data }) => {
    const prompt = `You are a Senior Full-Stack Production Engineer.
You are generating ${data.batch.layerName} for this project: "${data.blueprint.title || "Production Application"}".

=== SHARED ARCHITECTURAL CONTRACT (IMMUTABLE SINGLE SOURCE OF TRUTH) ===
DATABASE DDL CONTRACT:
${data.manifestContract.databaseContract}

API ENDPOINTS CONTRACT:
${JSON.stringify(data.manifestContract.apiContract, null, 2)}

ENVIRONMENT VARIABLES:
${data.manifestContract.envContract.join("\n")}

=== BATCH TASK: ${data.batch.layerName} ===
Layer Description: ${data.batch.description}

You MUST generate the complete, pristine, production-grade source code for each of the following target files:
${data.batch.targetFiles
  .map((f) => `- Path: ${f.path} | Language: ${f.language} | Purpose: ${f.purpose}`)
  .join("\n")}

CRITICAL INSTRUCTIONS:
1. Every table name, column name, and data type MUST match the DATABASE DDL CONTRACT exactly.
2. Every endpoint path, HTTP method, and JSON property MUST match the API ENDPOINTS CONTRACT exactly.
3. Write complete, runnable, production-quality code. Do not use placeholders or "// TODO: add code later".
4. For backend Python:
   - Use Pydantic v2 syntax: model_config = ConfigDict(from_attributes=True) instead of obsolete orm_mode = True.
   - In requirements.txt, only list packages actually imported in the code. Do NOT add heavy packages like tensorflow or torch unless real model code is provided (use numpy/random for simulations). Use flexible version constraints (e.g. >=).
5. For frontend scaffolding:
   - Ensure frontend/package.json is valid JSON with scripts ("dev": "vite", "build": "tsc && vite build"), core dependencies (react, react-dom, axios, lucide-react), and any project-specific libraries.
6. For deployment manifests:
   - backend/Dockerfile MUST use pip install -r requirements.txt. DO NOT use Poetry unless pyproject.toml is generated.
   - docker-compose.yml MUST mount database files:
     - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
     - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql:ro
     so database tables and seed data are initialized automatically on first run.
7. Format each file cleanly using the standard delimiter structure:

=== FILE: path/to/file.ext ===
[Raw code here with no markdown fences]
=== END FILE ===

Begin outputting the batch files now:`;

    const codeText = await generateText({
      system:
        "You are an expert full-stack engineer and code compiler. " +
        "You output pristine, interconnected production code matching shared contracts with 100% precision.",
      prompt,
      temperature: 0.2,
      maxTokens: 8192,
      agentName: `Yaduk Batch Architect (${data.batch.layerName})`,
    });

    const parsedFiles = parseDelimitedCodeFiles(codeText);

    // If parser missed any file, ensure stubs exist
    if (parsedFiles.length === 0) {
      return data.batch.targetFiles.map((target) => ({
        path: target.path,
        language: target.language,
        description: target.purpose,
        code: `// ${target.path}\n// ${target.purpose}\n`,
      }));
    }

    return parsedFiles;
  });

