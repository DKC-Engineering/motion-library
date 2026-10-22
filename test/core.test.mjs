import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  catalog,
  searchMotion,
  getMotion,
  prepareMotion,
  snapshot,
} from "../dist/src/core.js";
const benchmark = JSON.parse(
  await readFile(new URL("search-benchmark.json", import.meta.url), "utf8"),
);
test("all callable recipes have rights, requirements, and unique IDs", () => {
  assert.ok(catalog.recipes.length >= 50);
  assert.equal(
    new Set(catalog.recipes.map((r) => r.id)).size,
    catalog.recipes.length,
  );
  for (const r of catalog.recipes) {
    assert.equal(r.rights.status, "cleared");
    assert.ok(r.rights.license);
    assert.ok(r.requirements.dependencies.length);
    assert.ok(r.requirements.assets.length);
    assert.ok(r.steps.length);
    assert.ok(r.provenance.revision);
  }
});
test("registry endpoint and reference previews use the configured deployment", async () => {
  const deployment = JSON.parse(
    await readFile(
      new URL("../catalog/deployment.json", import.meta.url),
      "utf8",
    ),
  );
  const manifest = JSON.parse(
    await readFile(new URL("../server.json", import.meta.url), "utf8"),
  );
  assert.equal(manifest.remotes[0].url, deployment.endpoint);
  for (const recipe of catalog.recipes.filter(
    (r) => r.preview.kind === "dkc-reference",
  ))
    assert.equal(
      new URL(recipe.preview.url).origin,
      new URL(deployment.endpoint).origin,
    );
});
test("thirty-query benchmark meets 80 percent top-three relevance", () => {
  const misses = benchmark.filter(
    ([query, expected]) =>
      !searchMotion({ query, limit: 3 }).results.some((r) =>
        expected.includes(r.id),
      ),
  );
  console.log(
    `Search benchmark: ${benchmark.length - misses.length}/${benchmark.length}; misses: ${misses.map((r) => r[0]).join(", ") || "none"}`,
  );
  assert.ok((benchmark.length - misses.length) / benchmark.length >= 0.8);
});
test("exact IDs, empty browsing, filters, no results, and source references", () => {
  assert.equal(
    searchMotion({ query: "particle-assembly" }).results[0].id,
    "particle-assembly",
  );
  assert.equal(searchMotion().results.length, 5);
  assert.ok(
    searchMotion({ category: "ui", stack: "css" }).results.every(
      (r) => r.category === "ui" && r.stack === "css",
    ),
  );
  assert.equal(searchMotion({ query: "zzzxxyyqq" }).total, 0);
  assert.ok(
    !searchMotion({ query: "awesome" }).results.some(
      (r) => r.availability === "source-only",
    ),
  );
  assert.ok(
    searchMotion({ query: "awesome", includeReferences: true }).results.some(
      (r) => r.availability === "source-only",
    ),
  );
  assert.equal(getMotion("reference-guanmo").availability, "source-only");
  assert.throws(
    () => prepareMotion({ id: "reference-guanmo", brief: "Build this" }),
    (e) => e.code === "SOURCE_ONLY",
  );
});
test("invalid IDs and unsupported or malformed customization fail clearly", () => {
  assert.throws(
    () => getMotion("../private"),
    (e) => e.code === "INVALID_ID",
  );
  assert.throws(
    () => getMotion("absent"),
    (e) => e.code === "NOT_FOUND",
  );
  assert.throws(
    () => searchMotion({ limit: 11 }),
    (e) => e.code === "INVALID_LIMIT",
  );
  assert.throws(
    () => searchMotion({ query: "a".repeat(301) }),
    (e) => e.code === "INVALID_QUERY",
  );
  assert.throws(
    () => prepareMotion({ id: "magnetic-button", brief: " " }),
    (e) => e.code === "INVALID_BRIEF",
  );
  for (const [customization, code] of [
    [{ speed: 2 }, "UNSUPPORTED_CUSTOMIZATION"],
    [{ accent: "red" }, "INVALID_ACCENT"],
    [{ duration: NaN }, "INVALID_DURATION"],
    [{ aspectRatio: "4:3" }, "INVALID_ASPECT_RATIO"],
  ])
    assert.throws(
      () =>
        prepareMotion({
          id: "magnetic-button",
          brief: "A product button",
          customization,
        }),
      (e) => e.code === code,
    );
});
test("preparation is deterministic, preserves the brief, credit, and overrides", () => {
  const input = {
    id: "feature-launch",
    brief: "A scheduling product",
    customization: { duration: 20, accent: "#123456", aspectRatio: "9:16" },
  };
  const a = prepareMotion(input),
    b = prepareMotion(input);
  assert.deepEqual(a, b);
  assert.ok(a.prompt.includes(input.brief));
  assert.ok(a.prompt.includes("20s"));
  assert.ok(a.prompt.includes("CC-BY-4.0"));
  assert.equal(a.snapshot, snapshot);
  for (const r of catalog.recipes)
    assert.ok(
      prepareMotion({
        id: r.id,
        brief: "Build a reference with neutral illustrative content.",
      }).prompt.length /
        3 <
        3000,
      `${r.id} prompt budget`,
    );
  assert.ok(
    JSON.stringify(searchMotion({ query: "motion" })).length / 3 < 1500,
    "search response budget",
  );
});
test("twelve reproduced entries include current implementation evidence", async () => {
  const reproduced = catalog.recipes.filter(
    (r) => r.verification.status === "reproduced",
  );
  assert.equal(reproduced.length, 12);
  const hash = createHash("sha256");
  for (const file of ["runtime.js", "style.css", "index.html"])
    hash.update(await readFile(new URL(`../demos/${file}`, import.meta.url)));
  const expected = `sha256:${hash.digest("hex")}`;
  for (const r of reproduced) {
    assert.equal(r.verification.implementationHash, expected);
    assert.equal(r.verification.recipeVersion, r.version);
    assert.ok(r.verification.model);
    assert.ok(r.preview.url);
  }
});
