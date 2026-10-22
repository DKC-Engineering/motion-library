import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
import deployment from "../catalog/deployment.json" with { type: "json" };
import { snapshot } from "../dist/src/core.js";
const endpoint = process.argv[2] || "http://127.0.0.1:8787/mcp";
const smoke = process.argv.includes("--smoke");
const base = new URL(endpoint);
const client = new Client({ name: "cave-motion-http-check", version: "1.0.0" });
const transport = new StreamableHTTPClientTransport(base);
const checkedAt = new Date().toISOString();
try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert.equal(tools.tools.length, 3);
  const search = await client.callTool({
    name: "search_motion",
    arguments: { query: "a shape that becomes a toggle" },
  });
  assert.ok(!search.isError);
  assert.equal(JSON.parse(search.content[0].text).snapshot, snapshot);
  const id = JSON.parse(search.content[0].text).results[0].id;
  const recipe = await client.callTool({
    name: "get_motion",
    arguments: { id },
  });
  assert.ok(!recipe.isError);
  const prepared = await client.callTool({
    name: "prepare_motion",
    arguments: { id, brief: "A product interface with a switch" },
  });
  assert.ok(
    JSON.parse(prepared.content[0].text).prompt.includes("product interface"),
  );
  assert.equal((await client.listPrompts()).prompts[0].name, "use-motion");
  assert.ok(
    (
      await client.getPrompt({
        name: "use-motion",
        arguments: { id, brief: "A product switch" },
      })
    ).messages[0].content.text.includes("product switch"),
  );
  assert.ok(
    (await client.readResource({ uri: `motion://recipes/${id}` })).contents
      .length,
  );
  const latency = [];
  for (let i = 0; i < 60; i++) {
    const start = performance.now();
    const response = await client.callTool({
      name: "search_motion",
      arguments: { query: `magnetic button ${i}` },
    });
    assert.ok(!response.isError);
    latency.push(performance.now() - start);
  }
  latency.sort((a, b) => a - b);
  const p95 = latency[Math.ceil(latency.length * 0.95) - 1];
  assert.ok(p95 < 500, `Warm p95 ${p95}ms exceeds 500ms`);
  const badOrigin = await fetch(endpoint, {
    method: "POST",
    headers: {
      origin: "https://untrusted.example",
      "content-type": "application/json",
    },
    body: "{}",
  });
  assert.equal(badOrigin.status, 403);
  const large = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "x".repeat(25_000),
  });
  assert.equal(large.status, 413);
  const malformed = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: "{broken",
  });
  assert.equal(malformed.status, 400);
  const get = await fetch(endpoint, {
    headers: { accept: "application/json, text/event-stream" },
  });
  assert.equal(get.status, 405);
  let limited = false;
  for (let batch = 0; !smoke && batch < 12 && !limited; batch++) {
    const responses = await Promise.all(
      Array.from({ length: 20 }, () =>
        fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}",
        }),
      ),
    );
    for (const response of responses) {
      if (response.status === 429) {
        limited = true;
        assert.equal(response.headers.get("retry-after"), "60");
      }
    }
  }
  if (!smoke)
    assert.ok(
      limited,
      "No 429 observed in the bounded burst. Check the binding and Cloudflare's approximate, per-location limits.",
    );
  const health = await (await fetch(new URL("/health", base))).json();
  assert.equal(
    health.snapshot,
    snapshot,
    "Deployed catalog must match the local snapshot.",
  );
  const report = {
    checkedAt,
    endpoint,
    snapshot: health.snapshot,
    transport: "Streamable HTTP",
    runtime:
      base.hostname === "127.0.0.1" ? "local Cloudflare workerd" : "deployed",
    protocol: "passed",
    warmSearchSamples: 60,
    p95Milliseconds: Number(p95.toFixed(2)),
    requestLimits: "passed",
    rateLimitBurst: smoke ? "not run (smoke mode)" : "429 observed",
    nativeEditorClients: "not tested by this protocol script",
  };
  await mkdir(new URL("../evidence/", import.meta.url), { recursive: true });
  const reportName =
    base.hostname === "127.0.0.1"
      ? "http-local-report.json"
      : [
            new URL(deployment.endpoint).hostname,
            new URL(deployment.customDomain).hostname,
          ].includes(base.hostname)
        ? "http-production-report.json"
        : "http-staging-report.json";
  await writeFile(
    new URL(`../evidence/${reportName}`, import.meta.url),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await client.close();
}
