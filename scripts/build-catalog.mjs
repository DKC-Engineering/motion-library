import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { validateImport } from "./import-policy.mjs";

const root = new URL("../", import.meta.url);
const read = async (path) =>
  JSON.parse(await readFile(new URL(path, root), "utf8"));
const authored = await read("catalog/authored.json");
const references = await read("catalog/references.json");
const approved = await read("catalog/approved-imports.json");
const deployment = await read("catalog/deployment.json");
const previewOrigin = new URL(deployment.endpoint).origin;
let evidence = {};
try {
  evidence = await read("catalog/evidence.json");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sourceRevision = `sha256:${hash(authored)}`;
const baseUrl = "https://darkknightcave.co/labs/motion-library";
const dependency = {
  css: ["A browser supporting modern CSS"],
  svg: ["A browser supporting SVG"],
  canvas: ["A browser supporting Canvas 2D"],
  threejs: ["three", "A browser supporting WebGL 2"],
};
const recipes = authored.map(
  ([id, title, category, stack, summary, tags, direction, limitation]) => ({
    id,
    version: "1.0.0",
    title,
    category,
    stack,
    summary,
    tags,
    availability: "callable",
    parameters: {
      accent: {
        type: "color",
        default: "#b8492e",
        description: "One six-digit hexadecimal accent color.",
      },
      duration: {
        type: "number",
        default: category === "ui" ? 2 : 12,
        min: 1,
        max: 60,
        description:
          "Sequence duration in seconds; retain interaction timings for UI.",
      },
      aspectRatio: {
        type: "enum",
        default: id === "vertical-story" ? "9:16" : "16:9",
        values: ["16:9", "9:16", "1:1"],
        description: "Output framing.",
      },
    },
    prompt: direction,
    steps: [
      "Confirm the supplied content, target environment, and required assets before implementing.",
      direction,
      category === "ui"
        ? "Implement idle, active, keyboard, touch, reduced-motion, and failure states as relevant."
        : "Expose seek(t) so frames can be inspected deterministically; add play, pause, replay, and a reduced-motion still.",
      "Inspect the opening, midpoint, and final state at desktop and mobile sizes; report any dependency or output limitation.",
    ],
    requirements: {
      dependencies: dependency[stack],
      assets:
        category === "3d"
          ? ["No external assets required for the procedural study."]
          : [
              "Supply final text, real data, and cleared product assets where requested.",
            ],
    },
    limitations: [
      limitation,
      "The prompt guides a coding agent; output quality depends on its implementation and review.",
    ],
    provenance: {
      creator: "DarkKnight Cave",
      url: baseUrl,
      revision: sourceRevision,
      kind: "original",
      note: "Original DKC recipe. No third-party prompt is reproduced.",
    },
    rights: {
      status: "cleared",
      license: "CC-BY-4.0",
      attribution:
        "Motion recipe by DarkKnight Cave — https://darkknightcave.co/labs/motion-library",
    },
    verification: evidence[id] ?? { status: "not-reproduced" },
    preview:
      evidence[id]?.status === "reproduced"
        ? {
            kind: "dkc-reference",
            url: `${previewOrigin}/motion-library/demos/index.html?id=${id}`,
            poster: `/motion-library/posters/${id}.png`,
            note: "DKC reference implementation; not an original creator video.",
          }
        : { kind: "none", note: "Prompt recipe; no reproduced preview yet." },
    url: `${baseUrl}/${id}`,
  }),
);
const originals = {};
for (const entry of approved) {
  validateImport(entry);
  const base = recipes[0];
  recipes.push({
    ...base,
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    category: entry.category,
    stack: entry.stack,
    tags: entry.tags,
    prompt: entry.prompt,
    steps: [
      base.steps[0],
      entry.prompt,
      entry.category === "ui"
        ? base.steps[2]
        : "Expose deterministic seek(t) and inspect opening, midpoint, final, mobile, and reduced-motion frames.",
      base.steps[3],
    ],
    requirements: { dependencies: entry.dependencies, assets: entry.assets },
    limitations: entry.limitations,
    provenance: {
      creator: entry.creator,
      url: entry.sourceUrl,
      revision: entry.sourceRevision,
      kind: "licensed-import",
      note: `Reviewed by ${entry.reviewedBy} on ${entry.reviewedAt}. Permission evidence: ${entry.permissionUrl}`,
    },
    rights: {
      status: "cleared",
      license: entry.license,
      attribution: `${entry.creator} — ${entry.sourceUrl} (${entry.license})`,
    },
    verification: evidence[entry.id] ?? { status: "not-reproduced" },
    preview: {
      kind: "none",
      note: "Licensed prompt; no reproduced preview yet.",
    },
    url: `${baseUrl}/${entry.id}`,
    ...(entry.originalPrompt
      ? { originalUri: `motion://originals/${entry.id}` }
      : {}),
  });
  if (entry.originalPrompt)
    originals[entry.id] = {
      text: entry.originalPrompt,
      license: entry.license,
      creator: entry.creator,
      source: entry.sourceUrl,
      permission: entry.permissionUrl,
    };
}
if (
  recipes.length < 50 ||
  new Set(recipes.map((r) => r.id)).size !== recipes.length
)
  throw new Error("Expected at least 50 distinct callable recipes.");
const snapshot = `2026-10-22.${hash({ recipes, references }).slice(0, 12)}`;
const catalog = {
  schemaVersion: 1,
  snapshot,
  updatedAt: "2026-10-22",
  recipes,
  references,
};
const tokenize = (text) => [
  ...new Set(
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter(Boolean),
  ),
];
const documents = [
  ...recipes,
  ...references.map((r) => ({
    ...r,
    category: "reference",
    stack: "",
    prompt: "",
  })),
].map((r) => ({
  id: r.id,
  title: tokenize(`${r.id} ${r.title}`),
  tags: tokenize(`${r.tags.join(" ")} ${r.category} ${r.stack}`),
  body: tokenize(`${r.summary} ${r.prompt}`),
}));
await writeFile(
  new URL("catalog/catalog.json", root),
  `${JSON.stringify(catalog, null, 2)}\n`,
);
await writeFile(
  new URL("catalog/search-index.json", root),
  `${JSON.stringify({ snapshot, documents })}\n`,
);
await writeFile(
  new URL("catalog/recipe-ids.json", root),
  `${JSON.stringify(recipes.map((r) => r.id))}\n`,
);
await writeFile(
  new URL("catalog/original-prompts.json", root),
  `${JSON.stringify(originals, null, 2)}\n`,
);
console.log(
  `Catalog ${snapshot}: ${recipes.length} recipes, ${recipes.filter((r) => r.verification.status === "reproduced").length} reproduced, ${references.length} source references.`,
);
