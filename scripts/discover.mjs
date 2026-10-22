import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { inventoryCandidates } from "./discovery-inventory.mjs";
const root = new URL("../", import.meta.url);
const sources = JSON.parse(
  await readFile(new URL("catalog/sources.json", root), "utf8"),
);
const review = new URL("review/", root);
await mkdir(review, { recursive: true });
let cache = {};
try {
  cache = JSON.parse(
    await readFile(new URL("http-cache.json", review), "utf8"),
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
let state = { sources: {} };
try {
  state = JSON.parse(await readFile(new URL("state.json", review), "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const results = [],
  failures = [],
  sourceStatus = [];
const seenPosts = new Set(),
  seenHashes = new Set();
const hash = (text) => createHash("sha256").update(text).digest("hex");
async function github(path) {
  const url = `https://api.github.com/${path}`;
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": "cave-motion-discovery/0.1.0",
    ...(cache[url]?.etag ? { "if-none-match": cache[url].etag } : {}),
    ...(process.env.GH_TOKEN
      ? { authorization: `Bearer ${process.env.GH_TOKEN}` }
      : {}),
  };
  const response = await fetch(url, {
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
  if (response.status === 304) return cache[url].data;
  if (!response.ok)
    throw new Error(`GitHub returned ${response.status} for ${path}`);
  const text = await response.text();
  if (Buffer.byteLength(text) > 8_000_000)
    throw new Error("Source exceeds the 8MB review limit.");
  const data = JSON.parse(text);
  cache[url] = { etag: response.headers.get("etag"), data };
  return data;
}
function entries(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    for (const key of ["videos", "cases", "entries", "items", "prompts"])
      if (Array.isArray(value[key])) return value[key];
  }
  return [];
}
for (const source of sources) {
  try {
    if (!/^[\w.-]+\/[\w.-]+$/.test(source.repository))
      throw new Error("Invalid source repository.");
    const commit = await github(`repos/${source.repository}/commits/HEAD`);
    const revision = commit.sha;
    const configurationHash = hash(JSON.stringify(source));
    if (
      state.sources[source.id]?.revision === revision &&
      state.sources[source.id]?.configurationHash === configurationHash
    ) {
      sourceStatus.push({ source: source.id, revision, status: "unchanged" });
      continue;
    }
    if (source.adapter === "file-inventory") {
      const tree = await github(
        `repos/${source.repository}/git/trees/${revision}?recursive=1`,
      );
      results.push(...inventoryCandidates(source, revision, tree));
    } else {
      if (source.adapter && source.adapter !== "structured-json")
        throw new Error("Unknown discovery adapter.");
      for (const path of source.paths) {
        const item = await github(
          `repos/${source.repository}/contents/${path}?ref=${revision}`,
        );
        const files = Array.isArray(item)
          ? item
              .filter((f) => f.type === "file" && f.path.endsWith(".json"))
              .map((f) => f.path)
          : [path];
        for (const file of files) {
          if (!file.endsWith(".json")) {
            results.push({
              source: source.id,
              sourceRevision: revision,
              sourcePath: file,
              disposition: "manual-adapter-needed",
              note: "Executable configuration is never evaluated.",
            });
            continue;
          }
          const blob = Array.isArray(item)
            ? await github(
                `repos/${source.repository}/contents/${file}?ref=${revision}`,
              )
            : item;
          if (blob.encoding !== "base64" || !blob.content) {
            results.push({
              source: source.id,
              sourcePath: file,
              disposition: "manual-adapter-needed",
            });
            continue;
          }
          for (const entry of entries(
            JSON.parse(Buffer.from(blob.content, "base64").toString("utf8")),
          )) {
            const prompt = String(
              entry.prompt ?? entry.prompt_text ?? entry.text ?? "",
            );
            const originalPost = String(
              entry.post_url ??
                entry.source_url ??
                entry.tweet_url ??
                entry.url ??
                "",
            );
            const normalized = prompt.replace(/\s+/g, " ").trim().toLowerCase();
            const contentHash = normalized ? hash(normalized) : null;
            const flags = [];
            if (!prompt.trim()) flags.push("missing-prompt");
            if (entry.prompt_partial || entry.partial)
              flags.push("partial-prompt");
            if (
              /(?:sk-[a-zA-Z0-9_-]{16,}|gh[pousr]_[a-zA-Z0-9]{20,}|AKIA[A-Z0-9]{16}|BEGIN [A-Z ]*PRIVATE KEY)/.test(
                prompt,
              )
            )
              flags.push("possible-secret");
            if (
              /\/(?:Users|home|asic)\/|api.?key|private.?folder|\.env\b/i.test(
                prompt,
              )
            )
              flags.push("environment-dependency");
            if (
              (originalPost && seenPosts.has(originalPost)) ||
              (contentHash && seenHashes.has(contentHash))
            )
              flags.push("duplicate");
            if (originalPost) seenPosts.add(originalPost);
            if (contentHash) seenHashes.add(contentHash);
            results.push({
              source: source.id,
              sourceRevision: revision,
              sourcePath: file,
              sourceEntryId: String(entry.slug ?? entry.id ?? ""),
              title: flags.includes("possible-secret")
                ? "[quarantined]"
                : String(
                    entry.title ?? entry.slug ?? "Untitled source entry",
                  ).slice(0, 160),
              originalPost: /^https:\/\//.test(originalPost)
                ? originalPost
                : "",
              contentHash,
              rights: source.rights,
              flags,
              disposition:
                flags.length || source.rights === "third-party-excluded"
                  ? "quarantine"
                  : "rights-review-required",
            });
          }
        }
      }
    }
    state.sources[source.id] = {
      revision,
      configurationHash,
      candidates: results.filter((entry) => entry.source === source.id),
    };
    sourceStatus.push({ source: source.id, revision, status: "changed" });
  } catch (error) {
    failures.push({ source: source.id, error: error.message });
  }
}
const queued = Object.values(state.sources).flatMap(
  (source) => source.candidates,
);
const report = {
  generatedAt: new Date().toISOString(),
  note: "Discovery metadata only. No entry is approved for publication. Raw prompts, credentials, and fetched media are excluded from this report.",
  sources: sourceStatus,
  candidates: queued,
  failures,
};
await writeFile(new URL("http-cache.json", review), JSON.stringify(cache));
await writeFile(new URL("state.json", review), JSON.stringify(state));
await writeFile(
  new URL("report.json", review),
  `${JSON.stringify(report, null, 2)}\n`,
);
await writeFile(
  new URL("report.md", review),
  `# Motion source review\n\n${queued.length} queued candidates; ${failures.length} source failures. All require human review.\n\n${sources.map((s) => `- [${s.repository}](https://github.com/${s.repository})`).join("\n")}\n\nSee report.json for source revisions, duplicate flags, dependencies, and rights status. Raw prompts and the local HTTP cache must not be uploaded as publication artifacts.\n`,
);
console.log(
  `Discovery: ${queued.length} queued candidates; ${sourceStatus.filter((source) => source.status === "unchanged").length} unchanged sources; ${failures.length} source failures. Review report: ${new URL("report.json", review).pathname}`,
);
if (failures.length) process.exitCode = 1;
