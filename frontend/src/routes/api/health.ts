import { createFileRoute } from "@tanstack/react-router";

function getBackendCandidates(): string[] {
  const candidates: string[] = [];
  if (process.env["BACKEND_URL"]) {
    candidates.push(process.env["BACKEND_URL"].replace(/\/+$/, ""));
  }
  candidates.push("http://127.0.0.1:8000");
  return Array.from(new Set(candidates));
}

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const candidates = getBackendCandidates();
        let backendData: any = null;
        let backendError: string | null = null;
        let activeBackendUrl: string | null = null;

        for (const url of candidates) {
          try {
            const res = await fetch(`${url}/api/health`, {
              signal: AbortSignal.timeout(5000),
            });
            if (res.ok) {
              backendData = await res.json();
              activeBackendUrl = url;
              break;
            } else {
              backendError = `HTTP ${res.status}: ${await res.text()}`;
            }
          } catch (err: any) {
            backendError = err?.message || String(err);
          }
        }

        const isHealthy = Boolean(backendData && backendData.database?.connected);

        return new Response(
          JSON.stringify(
            {
              status: isHealthy ? "healthy" : "degraded",
              frontend: {
                status: "online",
                platform: "AWS Amplify Hosting (Edge CDN)",
                timestamp: new Date().toISOString(),
              },
              backend: backendData || {
                connected: false,
                error: backendError,
                attempted_urls: candidates,
              },
              active_backend_url: activeBackendUrl,
            },
            null,
            2
          ),
          {
            status: isHealthy ? 200 : 503,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
          }
        );
      },
    },
  },
});
