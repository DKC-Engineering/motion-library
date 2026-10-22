// Inventory text-file metadata only. Repository code and prompt text are not loaded.
function matchPath(pattern, path) {
  if (
    typeof pattern !== "string" ||
    pattern.startsWith("/") ||
    pattern.split("/").some((part) => !part || part === "." || part === "..") ||
    !/\.(?:md|json)$/.test(pattern)
  )
    throw new Error(
      "Inventory paths must be relative Markdown or JSON patterns.",
    );
  const expression = pattern
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[^/]*");
  return new RegExp(`^${expression}$`).test(path);
}

export function inventoryCandidates(source, revision, tree) {
  if (
    !/^[\w.-]+\/[\w.-]+$/.test(source.repository) ||
    !/^[a-f0-9]{40}$/.test(revision)
  )
    throw new Error("Inventory requires a repository and pinned commit SHA.");
  if (tree.truncated || !Array.isArray(tree.tree))
    throw new Error("Repository tree is incomplete; review it manually.");
  if (!Array.isArray(source.paths) || !source.paths.length)
    throw new Error("Inventory requires explicit source paths.");
  const files = tree.tree.filter(
    (file) =>
      file.type === "blob" &&
      ["100644", "100755"].includes(file.mode) &&
      source.paths.some((pattern) => matchPath(pattern, file.path)) &&
      !(source.excludePaths ?? []).some((pattern) =>
        matchPath(pattern, file.path),
      ),
  );
  if (!files.length) throw new Error("No allowlisted source files found.");
  return files.map((file) => ({
    source: source.id,
    sourceRevision: revision,
    sourcePath: file.path,
    sourceEntryId: file.path,
    sourceBlobSha: file.sha,
    sourceUrl: `https://github.com/${source.repository}/blob/${revision}/${file.path}`,
    title: file.path,
    originalPost: "",
    contentHash: null,
    rights: source.rights,
    licenseEvidence: (source.licenseEvidence ?? []).map(
      (path) =>
        `https://github.com/${source.repository}/blob/${revision}/${path}`,
    ),
    flags: ["content-not-reviewed", "dependencies-not-reviewed"],
    disposition:
      source.rights === "third-party-excluded"
        ? "quarantine"
        : "content-review-required",
    note: "File inventory only. Prompt content, normalized deduplication, entry-level rights and requirements need review before approval.",
  }));
}
