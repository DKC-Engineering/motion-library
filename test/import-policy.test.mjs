import test from "node:test";
import assert from "node:assert/strict";
import { validateImport } from "../scripts/import-policy.mjs";
const reviewed = {
  id: "test-import",
  title: "Example",
  category: "ui",
  stack: "css",
  summary: "Example for validation.",
  prompt: "Animate a supplied element with transform.",
  creator: "Example creator",
  sourceUrl: "https://example.com/source",
  sourceRevision: "abc123",
  license: "CC-BY-4.0",
  permissionUrl: "https://example.com/permission",
  reviewedBy: "Human curator",
  reviewedAt: "2026-10-22",
  tags: ["motion"],
  limitations: ["Illustrative"],
  dependencies: ["Browser"],
  assets: ["Supplied content"],
};
test("imports need entry-level rights, a dated human review, complete requirements, and safe content", () => {
  assert.doesNotThrow(() => validateImport(reviewed));
  for (const patch of [
    { permissionUrl: "" },
    { reviewedBy: "" },
    { license: "unknown" },
    { dependencies: [] },
    { prompt: "Read /Users/creator/private/assets" },
    { originalPrompt: "-----BEGIN PRIVATE KEY-----" },
  ])
    assert.throws(() => validateImport({ ...reviewed, ...patch }));
});
