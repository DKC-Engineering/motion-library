import test from "node:test";
import assert from "node:assert/strict";
import { limitAndBufferRequest } from "../dist/src/request-guard.js";
const allowed = { limit: async () => ({ success: true }) };
const request = (body = "{}", headers = {}) =>
  new Request("https://example.com/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });

test("quota rejection and quota failures never read the body", async () => {
  for (const [limiter, status] of [
    [{ limit: async () => ({ success: false }) }, 429],
    [
      {
        limit: async () => {
          throw new Error("binding failure");
        },
      },
      503,
    ],
    [undefined, 503],
  ]) {
    const req = request();
    req.body.getReader = () => {
      throw new Error("must not read the rejected body");
    };
    const response = await limitAndBufferRequest(req, limiter, "client");
    assert.equal(response.status, status);
    if (status === 429) assert.equal(response.headers.get("retry-after"), "60");
  }
});

test("JSON type and declared and streamed byte limits apply before MCP handling", async () => {
  for (const [req, status] of [
    [request("{}", { "content-type": "application/jsonp" }), 415],
    [request("{}", { "content-length": "24577" }), 413],
    [request("{}", { "content-length": "invalid" }), 400],
    [request("é".repeat(13_000)), 413],
  ])
    assert.equal(
      (await limitAndBufferRequest(req, allowed, "client")).status,
      status,
    );
  let canceled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(25_000));
    },
    cancel() {
      canceled = true;
    },
  });
  const req = new Request("https://example.com/mcp", {
    method: "POST",
    body: stream,
    duplex: "half",
    headers: { "content-type": "application/json" },
  });
  assert.equal(
    (await limitAndBufferRequest(req, allowed, "client")).status,
    413,
  );
  assert.equal(canceled, true);
});

test("valid JSON bytes, request headers, methods and quota key are preserved", async () => {
  let seen;
  const req = request('{"brief":"café"}', {
    "content-type": "application/json; charset=utf-8",
    "mcp-protocol-version": "2025-06-18",
  });
  const result = await limitAndBufferRequest(
    req,
    {
      limit: async (input) => {
        seen = input.key;
        return { success: true };
      },
    },
    "trusted-ip",
  );
  assert.ok(result instanceof Request);
  assert.deepEqual(await result.json(), { brief: "café" });
  assert.equal(result.headers.get("mcp-protocol-version"), "2025-06-18");
  assert.equal(seen, "trusted-ip");
  const options = new Request("https://example.com/mcp", { method: "OPTIONS" });
  assert.equal(
    await limitAndBufferRequest(options, allowed, "client"),
    options,
  );
});
