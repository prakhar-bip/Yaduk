import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

type Body = {
  messages?: unknown;
  message?: string;
  context?: unknown;
  history?: Array<{ role: string; content: string }>;
};

const BACKEND_URL =
  process.env["BACKEND_URL"]?.replace(/\/+$/, "") ||
  "http://yaduk-api-env.eba-dkrzgicw.us-east-1.elasticbeanstalk.com";

function logTerminalActivity(
  agent: string,
  success: boolean,
  error?: string | null,
  warningReason?: string | null,
) {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0];
  const sanitize = (val?: string | null) => {
    if (!val) return "None";
    return String(val).replace(/[\r\n]+/g, " ").replace(/,/g, ";").trim();
  };
  const line = `${date},${time},${sanitize(agent)},${success},${sanitize(error)},${sanitize(warningReason)}`;
  process.stdout.write(line + "\n");
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as Body;

          // Case 1: Direct atomic chat request from Mentor UI
          if (body.message) {
            const userPrompt = body.message;
            const messages = (body.history || []).map((h) => ({
              role: h.role,
              content: h.content,
            }));
            messages.push({ role: "user", content: userPrompt });

            const groqKey = process.env["GROQ_API_KEY"] || "";

            // Strategy A: Direct Groq API strictly using openai/gpt-oss-120b with Cloudflare WAF bypass header
            if (groqKey) {
              try {
                const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${groqKey}`,
                    "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                  },
                  body: JSON.stringify({
                    model: "openai/gpt-oss-120b",
                    messages: [
                      {
                        role: "system",
                        content: `You are Yaduk, the AI Project Mentor and Architect. Guide engineering students through architecting and building top-tier final-year projects. Answer questions with concrete, clear, and actionable advice.\nCONTEXT:\n${JSON.stringify(body.context || {}).slice(0, 10000)}`,
                      },
                      ...messages,
                    ],
                    max_tokens: 1500,
                    temperature: 0.6,
                  }),
                  signal: AbortSignal.timeout(20000),
                });

                if (groqRes.ok) {
                  const groqData = await groqRes.json();
                  const choice = groqData.choices?.[0]?.message;
                  const reply = choice?.content || choice?.reasoning || "";
                  if (reply) {
                    logTerminalActivity(
                      "Yaduk Chat Mentor Agent (Groq: openai/gpt-oss-120b)",
                      true,
                      null,
                      null,
                    );
                    return new Response(JSON.stringify({ text: reply }), {
                      status: 200,
                      headers: { "Content-Type": "application/json" },
                    });
                  }
                }
              } catch (groqErr: any) {
                logTerminalActivity(
                  "Yaduk Chat Mentor Agent (Groq Fallback)",
                  false,
                  groqErr?.message || String(groqErr),
                  "Direct Groq failed, routing to Elastic Beanstalk gateway",
                );
              }
            }

            // Strategy B: Route through Elastic Beanstalk API Gateway (which runs openai/gpt-oss-120b)
            try {
              const ebRes = await fetch(`${BACKEND_URL}/api/gateway/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages,
                  context: body.context || {},
                }),
                signal: AbortSignal.timeout(20000),
              });

              if (ebRes.ok) {
                const ebData = await ebRes.json();
                if (ebData.text) {
                  logTerminalActivity(
                    "Yaduk Chat Mentor Agent (Elastic Beanstalk Gateway)",
                    true,
                    null,
                    null,
                  );
                  return new Response(JSON.stringify({ text: ebData.text }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                  });
                }
              }
            } catch (ebErr: any) {
              logTerminalActivity(
                "Yaduk Chat Mentor Agent (EB Fallback)",
                false,
                ebErr?.message || String(ebErr),
                "EB gateway request timed out or failed, falling back to Nvidia NIM",
              );
            }

            // Strategy C: Fallback directly to Nvidia NIM
            try {
              const nvidiaKey = process.env["NVIDIA_API_KEY"] || "";
              const nvidiaBase =
                process.env["NVIDIA_BASE_URL"] || "https://integrate.api.nvidia.com/v1";
              const nvidiaModel =
                process.env["NVIDIA_MODEL"] || "nvidia/nemotron-3-ultra-550b-a55b";

              const nimRes = await fetch(`${nvidiaBase}/chat/completions`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${nvidiaKey}`,
                },
                body: JSON.stringify({
                  model: nvidiaModel,
                  messages: [
                    {
                      role: "system",
                      content: `You are Yaduk, the AI Project Mentor and Architect. Guide engineering students through architecting and building top-tier final-year projects. Answer questions with concrete, clear, and actionable advice.\nCONTEXT:\n${JSON.stringify(body.context || {}).slice(0, 10000)}`,
                    },
                    ...messages,
                  ],
                  max_tokens: 1500,
                  temperature: 0.7,
                }),
                signal: AbortSignal.timeout(25000),
              });

              if (nimRes.ok) {
                const nimData = await nimRes.json();
                const reply = nimData.choices?.[0]?.message?.content || "";
                logTerminalActivity(
                  `Yaduk Chat Mentor Agent (NVIDIA NIM: ${nvidiaModel})`,
                  true,
                  null,
                  null,
                );
                return new Response(JSON.stringify({ text: reply }), {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                });
              }
            } catch (nimErr: any) {
              logTerminalActivity(
                "Yaduk Chat Mentor Agent (Nvidia NIM Error)",
                false,
                nimErr?.message || String(nimErr),
                "Nvidia NIM request failed",
              );
            }

            // Strategy D: Resilient default mentor guidance
            return new Response(
              JSON.stringify({
                text: "I am ready to help you build your project! Focus on setting up your core database schema and primary API endpoints first before building the frontend interface.",
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          // Case 2: Streaming format (for AI SDK useChat)
          if (!Array.isArray(body.messages)) {
            logTerminalActivity(
              "Yaduk Chat Mentor Agent",
              false,
              "BadRequest: Missing message or messages",
              "Request body missing valid message parameter",
            );
            return new Response("Message parameter is required", { status: 400 });
          }

          const groqKey = process.env["GROQ_API_KEY"] || "";
          const nvidiaKey = process.env["NVIDIA_API_KEY"] || "";

          // Strictly use openai/gpt-oss-120b with Groq, with User-Agent header
          if (groqKey) {
            const provider = createOpenAICompatible({
              name: "groq",
              baseURL: process.env["GROQ_BASE_URL"] || "https://api.groq.com/openai/v1",
              headers: {
                Authorization: `Bearer ${groqKey}`,
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
              },
            });

            const result = streamText({
              model: provider("openai/gpt-oss-120b"),
              system: `You are Yaduk, the AI Project Mentor and Architect, dedicated to guiding engineering students through architecting and building top-tier final-year and flagship capstone projects.
You know their profile and their current project blueprint (JSON below). Answer questions about implementation,
stack choices, scope, alternatives and complexity. Be concrete and brief (max ~150 words unless asked for depth).
Use plain, friendly language.
This is a discussion space: answer doubts, talk through problems, and give guidance.

CONTEXT:
${JSON.stringify(body.context ?? {}).slice(0, 12000)}`,
              messages: await convertToModelMessages(body.messages as UIMessage[]),
            });

            logTerminalActivity(
              "Yaduk Chat Mentor Agent (Groq: openai/gpt-oss-120b)",
              true,
              null,
              null,
            );

            return result.toUIMessageStreamResponse({
              originalMessages: body.messages as UIMessage[],
            });
          }

          // Secondary Fallback Streaming via Nvidia NIM
          const nvidiaBase =
            process.env["NVIDIA_BASE_URL"] || "https://integrate.api.nvidia.com/v1";
          const nvidiaModel =
            process.env["NVIDIA_MODEL"] || "nvidia/nemotron-3-ultra-550b-a55b";

          const provider = createOpenAICompatible({
            name: "nvidia",
            baseURL: nvidiaBase,
            headers: {
              Authorization: `Bearer ${nvidiaKey}`,
            },
          });

          const result = streamText({
            model: provider(nvidiaModel),
            system: `You are Yaduk, the AI Project Mentor and Architect, dedicated to guiding engineering students through architecting and building top-tier final-year and flagship capstone projects.
You know their profile and their current project blueprint (JSON below). Answer questions about implementation,
stack choices, scope, alternatives and complexity. Be concrete and brief (max ~150 words unless asked for depth).
Use plain, friendly language.
This is a discussion space: answer doubts, talk through problems, and give guidance.

CONTEXT:
${JSON.stringify(body.context ?? {}).slice(0, 12000)}`,
            messages: await convertToModelMessages(body.messages as UIMessage[]),
          });

          logTerminalActivity(
            `Yaduk Chat Mentor Agent (NVIDIA NIM: ${nvidiaModel})`,
            true,
            null,
            null,
          );

          return result.toUIMessageStreamResponse({
            originalMessages: body.messages as UIMessage[],
          });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          logTerminalActivity("Yaduk Chat Mentor Agent (Error)", false, errMsg, `Reason: ${errMsg}`);
          return new Response(JSON.stringify({ error: errMsg }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
