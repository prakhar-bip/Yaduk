export const MODEL_ID = "nvidia/nemotron-3-ultra-550b-a55b";

export function requireApiKey() {
  return "configured";
}

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

function getBackendCandidates(): string[] {
  const candidates: string[] = [];
  if (process.env["BACKEND_URL"]) {
    candidates.push(process.env["BACKEND_URL"].replace(/\/+$/, ""));
  }
  candidates.push("http://127.0.0.1:8000");
  return Array.from(new Set(candidates));
}

/**
 * Calls our FastAPI backend which is powered by zero-cost Nvidia NIM AI (nemotron-3-ultra-550b-a55b).
 * Completely severed from GCP / Vertex AI to prevent any cloud billing charges.
 */
export async function generateJson<T>(opts: {
  system: string;
  prompt: string;
  agentName?: string;
}): Promise<T> {
  const candidates = getBackendCandidates();
  let lastError: Error | null = null;

  for (const backendUrl of candidates) {
    try {
      const res = await fetch(`${backendUrl}/api/gateway/generate-json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: opts.system,
          prompt: opts.prompt,
          agent_name: opts.agentName || "Yaduk JSON Gateway Agent",
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        // If 404 or server error, try next candidate
        lastError = new Error(`AI Backend Error (${res.status}) at ${backendUrl}: ${err}`);
        continue;
      }

      logTerminalActivity(
        opts.agentName || "Frontend AI Gateway [generate-json]",
        true,
        null,
        null,
      );

      return (await res.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Try next candidate
    }
  }

  const errMsg = lastError?.message || "Failed to reach any backend candidate for generateJson";
  logTerminalActivity(
    opts.agentName || "Frontend AI Gateway [generate-json]",
    false,
    errMsg,
    `Reason: ${errMsg}`,
  );
  throw lastError || new Error(errMsg);
}

/**
 * Calls our FastAPI backend for raw code and markdown text generation using Vertex AI Gemini Pro.
 * Bypasses JSON serialization constraints for multi-file codebases and complex documents.
 * Automatically falls back to /generate-json if /generate-text is not present on the backend.
 */
export async function generateText(opts: {
  system?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  agentName?: string;
}): Promise<string> {
  const candidates = getBackendCandidates();
  let lastError: Error | null = null;

  // Step 1: Attempt native /api/gateway/generate-text on backend candidates
  for (const backendUrl of candidates) {
    try {
      const res = await fetch(`${backendUrl}/api/gateway/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: opts.system,
          prompt: opts.prompt,
          temperature: opts.temperature,
          max_tokens: opts.maxTokens,
          agent_name: opts.agentName || "Yaduk Code Architect Agent",
        }),
      });

      if (res.status === 404) {
        // Backend doesn't have /generate-text route; continue to next candidate or fallback
        lastError = new Error(`Route /api/gateway/generate-text not found (404) at ${backendUrl}`);
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        lastError = new Error(`AI Backend Error (${res.status}) at ${backendUrl}: ${err}`);
        continue;
      }

      logTerminalActivity(
        opts.agentName || "Frontend AI Gateway [generate-text]",
        true,
        null,
        null,
      );

      const data = await res.json();
      return data.text || "";
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // Step 2: Fallback to /api/gateway/generate-json with wrapped JSON format
  try {
    const wrappedPrompt = `${opts.prompt}\n\nIMPORTANT: Return strictly valid JSON in the format: {"generated_text": "<your entire full code or markdown here>"}`;
    const jsonRes = await generateJson<{
      generated_text?: string;
      text?: string;
      code?: string;
    }>({
      system: opts.system || "You are an expert full-stack engineer and code architect.",
      prompt: wrappedPrompt,
      agentName: opts.agentName || "Yaduk Code Architect Agent (JSON Fallback)",
    });

    const fallbackText = jsonRes.generated_text || jsonRes.text || jsonRes.code;
    if (fallbackText) {
      return fallbackText;
    }
    return typeof jsonRes === "string" ? jsonRes : JSON.stringify(jsonRes, null, 2);
  } catch (fallbackErr) {
    const errMsg =
      fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
    logTerminalActivity(
      opts.agentName || "Frontend AI Gateway [generate-text:fallback]",
      false,
      errMsg,
      `Reason: ${errMsg}`,
    );
    throw lastError || fallbackErr;
  }
}

