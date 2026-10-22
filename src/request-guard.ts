interface RateLimiter {
  limit(input: { key: string }): Promise<{ success: boolean }>;
}

const MAX_BYTES = 24_576;
const fail = (message: string, status: number, retry = false) =>
  Response.json(
    { error: message },
    {
      status,
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        ...(retry ? { "retry-after": "60" } : {}),
      },
    },
  );

// Throttle before obtaining a body reader. Reject unavailable quota checks
// rather than forwarding unmetered requests to the MCP handler.
export async function limitAndBufferRequest(
  request: Request,
  limiter: RateLimiter | undefined,
  key: string,
): Promise<Request | Response> {
  if (!limiter) return fail("Rate limiter is not configured.", 503);
  try {
    const { success } = await limiter.limit({ key });
    if (!success)
      return fail(
        "Rate limit reached. Retry in a minute or use the local package.",
        429,
        true,
      );
  } catch {
    return fail("Rate limiting is temporarily unavailable.", 503);
  }
  if (request.method !== "POST") return request;
  const type = request.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();
  if (type !== "application/json") return fail("Use application/json.", 415);
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    if (!/^\d+$/.test(declared)) return fail("Invalid content length.", 400);
    if (Number(declared) > MAX_BYTES) return fail("Request too large.", 413);
  }
  const reader = request.body?.getReader();
  if (!reader) return fail("Request body required.", 400);
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) {
        await reader.cancel();
        return fail("Request too large.", 413);
      }
      chunks.push(value);
    }
  } catch {
    return fail("Unable to read request.", 400);
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body,
  });
}
