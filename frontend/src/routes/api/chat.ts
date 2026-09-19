import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

type Body = { messages?: unknown; context?: unknown };

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
          const { messages, context } = (await request.json()) as Body;
          if (!Array.isArray(messages)) {
            logTerminalActivity(
              "Yaduk Chat Mentor Agent (Nvidia NIM: nemotron-3-ultra-550b-a55b)",
              false,
              "BadRequest: Messages are required",
              "Reason: Request body missing messages array",
            );
            return new Response("Messages are required", { status: 400 });
          }

          const openrouterKey = process.env["OPENROUTER_API_KEY"] || "";
          const groqKey = process.env["GROQ_API_KEY"] || process.env["NVIDIA_API_KEY"] || "";

          const useOpenRouter = Boolean(openrouterKey);
          const baseURL = useOpenRouter
            ? (process.env["OPENROUTER_BASE_URL"] || "https://openrouter.ai/api/v1")
            : (process.env["GROQ_BASE_URL"] || "https://api.groq.com/openai/v1");

          const apiKey = useOpenRouter ? openrouterKey : groqKey;
          const modelName = useOpenRouter
            ? (process.env["OPENROUTER_MODEL"] || "nvidia/nemotron-3-ultra-550b-a55b:free")
            : (process.env["GROQ_MODEL"] || "openai/gpt-oss-120b");

          const providerName = useOpenRouter ? "openrouter" : "groq";

          const provider = createOpenAICompatible({
            name: providerName,
            baseURL,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              ...(useOpenRouter ? { "HTTP-Referer": "https://yaduk.ai", "X-Title": "Yaduk AI" } : {}),
            },
          });

          const result = streamText({
            model: provider(modelName),
            system: `You are Yaduk, the AI Project Mentor and Architect, dedicated to guiding engineering students through architecting and building top-tier final-year and flagship capstone projects.
You know their profile and their current project blueprint (JSON below). Answer questions about implementation,
stack choices, scope, alternatives and complexity. Be concrete and brief (max ~150 words unless asked for depth).
Use plain, friendly language.
This is a discussion space: answer doubts, talk through problems, and give guidance.

CONTEXT:
${JSON.stringify(context ?? {}).slice(0, 12000)}`,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          logTerminalActivity(
            `Yaduk Chat Mentor Agent (${providerName.toUpperCase()}: ${modelName})`,
            true,
            null,
            null,
          );

          return result.toUIMessageStreamResponse({ originalMessages: messages as UIMessage[] });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const modelName =
            process.env["OPENROUTER_MODEL"] ||
            process.env["GROQ_MODEL"] ||
            "default";
          logTerminalActivity(
            `Yaduk Chat Mentor Agent (Error: ${modelName})`,
            false,
            errMsg,
            `Reason: ${errMsg}`,
          );
          throw err;
        }
      },
    },
  },
});
