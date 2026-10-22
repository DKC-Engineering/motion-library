import { createMcpHandler } from "agents/mcp/server";
import { createServer } from "./server.js";
import { snapshot, catalog } from "./core.js";
import { limitAndBufferRequest } from "./request-guard.js";

interface Env {
  MOTION_RATE_LIMITER: {
    limit: (input: { key: string }) => Promise<{ success: boolean }>;
  };
  ANALYTICS_ENGINE?: {
    writeDataPoint: (point: {
      blobs?: string[];
      doubles?: number[];
      indexes?: string[];
    }) => void;
  };
  PUBLIC_HOST: string;
  ENABLED?: string;
}
const json = (data: object, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const local = ["localhost", "127.0.0.1"].includes(url.hostname);
    const staging =
      env.PUBLIC_HOST === "cave-motion-staging" &&
      /^cave-motion-staging\.[a-z0-9-]+\.workers\.dev$/.test(url.hostname);
    if (url.hostname !== env.PUBLIC_HOST && !local && !staging)
      return json({ error: "Invalid host." }, 403);
    if (url.pathname === "/health")
      return json({
        status: env.ENABLED === "false" ? "disabled" : "ok",
        snapshot,
        recipes: catalog.recipes.length,
      });
    if (url.pathname !== "/mcp") return json({ error: "Not found." }, 404);
    if (env.ENABLED === "false")
      return json(
        {
          error:
            "Hosted service is temporarily unavailable. Use the local package.",
        },
        503,
      );
    if (!["POST", "OPTIONS", "GET", "DELETE"].includes(request.method))
      return json({ error: "Method not allowed." }, 405);
    const origin = request.headers.get("origin");
    if (
      origin &&
      ![
        "https://darkknightcave.co",
        "https://motion.darkknightcave.co",
        ...(local
          ? [
              "http://localhost:3000",
              "http://localhost:8787",
              "http://127.0.0.1:8787",
            ]
          : []),
      ].includes(origin)
    )
      return json({ error: "Origin not allowed." }, 403);
    const guarded = await limitAndBufferRequest(
      request,
      env.MOTION_RATE_LIMITER,
      request.headers.get("cf-connecting-ip") ?? (local ? "local" : "unknown"),
    );
    if (guarded instanceof Response) return guarded;
    request = guarded;
    const handler = createMcpHandler(
      () =>
        createServer((metric) => {
          // No prompts, search text, project briefs, client IDs, or IPs are recorded.
          env.ANALYTICS_ENGINE?.writeDataPoint({
            indexes: ["cave-motion"],
            blobs: [snapshot, metric.tool, metric.outcome],
            doubles: [metric.count],
          });
        }),
      {
        legacy: "stateless",
        allowedHostnames: [
          env.PUBLIC_HOST,
          ...(staging ? [url.hostname] : []),
          "localhost",
          "127.0.0.1",
        ],
        allowedOriginHostnames: [
          "darkknightcave.co",
          "motion.darkknightcave.co",
          ...(local ? ["localhost", "127.0.0.1"] : []),
        ],
        corsOptions: {
          origin: "https://darkknightcave.co",
          methods: "POST, GET, DELETE, OPTIONS",
          headers:
            "Content-Type, Accept, MCP-Protocol-Version, Mcp-Method, Mcp-Name",
        },
      },
    );
    return handler(request, env, ctx);
  },
};
export default worker;
