import { createFileRoute } from "@tanstack/react-router";
import { generateJson } from "@/lib/ai-gateway.server";
import {
  generateBlueprintScrollFallback,
  applyBlueprintChangeFallback,
} from "@/lib/quest.functions";
import type { Blueprint, QuestScroll, StudentProfile } from "@/lib/types";

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

export const Route = createFileRoute("/api/blueprint")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            action: "summarize" | "update";
            profile: StudentProfile;
            blueprint: Blueprint;
            request?: string;
          };

          const { action, profile, blueprint, request: userRequest } = body;

          if (!blueprint) {
            return new Response(
              JSON.stringify({ error: "Blueprint is required" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          if (action === "summarize") {
            try {
              const scroll = await generateJson<QuestScroll>({
                system: SYSTEM,
                prompt: `${profileBlock(profile)}

CURRENT BLUEPRINT:
${JSON.stringify(blueprint)}

Summarise this plan so the student can explain it out loud in under a minute, and so they know what to do next.
Be specific to THIS plan — no generic advice.
JSON shape:
{"tldr":"1 punchy sentence describing the project",
 "pitch":"3 sentences the student could say to a supervisor",
 "keyMoves":[{"move":"short name of a decisive build decision","why":"1 sentence"}],
 "loadout":["5-7 tech stack items as short strings"],
 "nextThreeMoves":["3 concrete things to do first, in order"],
 "bossRisks":["3 short risks with a hint at how to dodge each"]}`,
                agentName: "Yaduk Blueprint Summarizer Agent",
              });

              if (scroll?.tldr && scroll?.pitch) {
                return new Response(
                  JSON.stringify({
                    scroll: {
                      tldr: scroll.tldr,
                      pitch: scroll.pitch,
                      keyMoves: Array.isArray(scroll.keyMoves) ? scroll.keyMoves : [],
                      loadout: Array.isArray(scroll.loadout) ? scroll.loadout : [],
                      nextThreeMoves: Array.isArray(scroll.nextThreeMoves) ? scroll.nextThreeMoves : [],
                      bossRisks: Array.isArray(scroll.bossRisks) ? scroll.bossRisks : [],
                    },
                  }),
                  { status: 200, headers: { "Content-Type": "application/json" } }
                );
              }
            } catch (aiErr) {
              console.warn("AI blueprint summarizer error, using fallback:", aiErr);
            }

            const fallbackScroll = generateBlueprintScrollFallback(blueprint);
            return new Response(
              JSON.stringify({ scroll: fallbackScroll }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            );
          }

          if (action === "update") {
            const reqText = userRequest || "Refine and enhance project plan";
            try {
              const res = await generateJson<{ blueprint: Blueprint; changeSummary: string }>({
                system: SYSTEM,
                prompt: `${profileBlock(profile)}

CURRENT BLUEPRINT:
${JSON.stringify(blueprint)}

The student asked for this change: "${reqText}"

Apply the change and return the FULL updated blueprint, keeping every field and staying consistent with the
student's skills, constraints and goal. Keep untouched parts identical.
JSON shape: {"blueprint": <same schema as the current blueprint>, "changeSummary":"one sentence on what changed"}`,
                agentName: "Yaduk Blueprint Modifier Agent",
              });

              if (res?.blueprint && res?.changeSummary) {
                return new Response(
                  JSON.stringify(res),
                  { status: 200, headers: { "Content-Type": "application/json" } }
                );
              }
            } catch (aiErr) {
              console.warn("AI blueprint update error, using fallback:", aiErr);
            }

            const fallbackUpdate = applyBlueprintChangeFallback(blueprint, reqText);
            return new Response(
              JSON.stringify(fallbackUpdate),
              { status: 200, headers: { "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({ error: `Unknown action: ${action}` }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        } catch (err: any) {
          console.error("Blueprint API general error:", err);
          return new Response(
            JSON.stringify({ error: err?.message || "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
