const licenses = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "CC0-1.0",
  "CC-BY-4.0",
]);
export function validateImport(entry) {
  for (const field of [
    "id",
    "title",
    "category",
    "stack",
    "summary",
    "prompt",
    "creator",
    "sourceUrl",
    "sourceRevision",
    "license",
    "permissionUrl",
    "reviewedBy",
    "reviewedAt",
  ])
    if (typeof entry[field] !== "string" || !entry[field].trim())
      throw new Error(`Import requires ${field}.`);
  if (!/^[a-z0-9-]{1,80}$/.test(entry.id))
    throw new Error("Invalid import ID.");
  if (
    !["ui", "film", "explainer", "3d"].includes(entry.category) ||
    !["css", "svg", "canvas", "threejs"].includes(entry.stack)
  )
    throw new Error("Unsupported category or stack.");
  if (!licenses.has(entry.license))
    throw new Error("This license needs a policy review before distribution.");
  if (
    !/^https:\/\//.test(entry.sourceUrl) ||
    !/^https:\/\//.test(entry.permissionUrl)
  )
    throw new Error(
      "Source and entry-level permission evidence require HTTPS URLs.",
    );
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.reviewedAt))
    throw new Error("Use a dated human review record.");
  if (
    !Array.isArray(entry.tags) ||
    !entry.tags.every((t) => typeof t === "string") ||
    !Array.isArray(entry.limitations) ||
    !entry.limitations.every((t) => typeof t === "string")
  )
    throw new Error("Tags and limitations must be string arrays.");
  if (entry.prompt.length > 3500 || entry.summary.length > 300)
    throw new Error(
      "Curated text exceeds its context budget. Keep long originals separate.",
    );
  const content = [entry.prompt, entry.originalPrompt ?? ""].join("\n");
  if (
    /sk-[a-zA-Z0-9_-]{16,}|gh[pousr]_[a-zA-Z0-9]{20,}|BEGIN [A-Z ]*PRIVATE KEY|\/(?:Users|home|asic)\//.test(
      content,
    )
  )
    throw new Error(
      "Quarantine credentials or private-environment instructions before import.",
    );
  if (
    !Array.isArray(entry.dependencies) ||
    !entry.dependencies.length ||
    !Array.isArray(entry.assets) ||
    !entry.assets.length
  )
    throw new Error("State the complete dependencies and asset requirements.");
}
