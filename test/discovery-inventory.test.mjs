import test from "node:test";
import assert from "node:assert/strict";
import { inventoryCandidates } from "../scripts/discovery-inventory.mjs";

const revision = "a".repeat(40);
const source = {
  id: "example",
  repository: "creator/library",
  paths: ["styles/*/STYLE.md"],
  excludePaths: ["styles/_template/STYLE.md"],
  rights: "review-required",
  licenseEvidence: ["LICENSE"],
};
const file = (path, mode = "100644") => ({
  path,
  mode,
  type: "blob",
  sha: "b".repeat(40),
});

test("Markdown inventory pins metadata and keeps prompts, templates, media and symlinks out", () => {
  const candidates = inventoryCandidates(source, revision, {
    tree: [
      file("styles/swiss/STYLE.md"),
      file("styles/_template/STYLE.md"),
      file("styles/swiss/demo/STYLE.md"),
      file("styles/alias/STYLE.md", "120000"),
      file("styles/swiss/movie.mp4"),
      file("tools/script.mjs"),
    ],
  });
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].sourcePath, "styles/swiss/STYLE.md");
  assert.ok(candidates[0].sourceUrl.includes(`/blob/${revision}/`));
  assert.equal(candidates[0].contentHash, null);
  assert.equal(candidates[0].disposition, "content-review-required");
  assert.ok(candidates[0].flags.includes("dependencies-not-reviewed"));
  assert.equal("prompt" in candidates[0], false);
});

test("incomplete trees, missing files, unsafe paths and unpinned revisions fail visibly", () => {
  const tree = { tree: [file("styles/swiss/STYLE.md")] };
  assert.throws(() =>
    inventoryCandidates(source, revision, { ...tree, truncated: true }),
  );
  assert.throws(() => inventoryCandidates(source, revision, { tree: [] }));
  assert.throws(() =>
    inventoryCandidates(
      { ...source, paths: ["../private.md"] },
      revision,
      tree,
    ),
  );
  assert.throws(() =>
    inventoryCandidates({ ...source, paths: ["tools/*.mjs"] }, revision, tree),
  );
  assert.throws(() => inventoryCandidates(source, "main", tree));
});
