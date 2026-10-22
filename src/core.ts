import catalogData from "../catalog/catalog.json" with { type: "json" };
import deployment from "../catalog/deployment.json" with { type: "json" };
import searchIndex from "../catalog/search-index.json" with { type: "json" };
import { categories, stacks } from "./types.js";
import type {
  Catalog,
  Customization,
  PrepareInput,
  SearchInput,
} from "./types.js";
export type {
  Category,
  Stack,
  Recipe,
  SourceReference,
  SearchInput,
  PrepareInput,
  Customization,
} from "./types.js";
export { categories, stacks };
export const catalog = catalogData as unknown as Catalog;
export const snapshot = catalog.snapshot;
export const galleryUrl = "https://darkknightcave.co/labs/motion-library";
export const mcpUrl = deployment.endpoint;
if (searchIndex.snapshot !== snapshot)
  throw new Error(
    "Catalog and search index snapshots differ. Rebuild the catalog.",
  );

export class MotionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "MotionError";
  }
}
const stop = new Set(
  "a an and as at be by for from how i in into is it me my of on or the to want with make build create show using".split(
    " ",
  ),
);
const tokens = (value: string) => [
  ...new Set(
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((t) => t && !stop.has(t)),
  ),
];
const groups = [
  ["magnetic", "attract", "attraction"],
  ["spring", "elastic", "settle"],
  ["toggle", "switch"],
  ["logo", "wordmark", "brand"],
  ["kinetic", "typography", "letters"],
  ["counter", "count", "countup", "metric"],
  ["chart", "graph", "dataviz"],
  ["workflow", "pipeline", "process"],
  ["aurora", "northern", "curtain"],
  ["particles", "particle", "dots", "points"],
  ["threejs", "three", "webgl"],
  ["typewriter", "typing", "type"],
  ["notification", "toast"],
  ["popup", "dialog", "modal"],
  ["faq", "accordion"],
  ["iphone", "phone", "device"],
  ["launch", "promo", "product"],
  ["reel", "vertical", "portrait"],
  ["planet", "orbit", "solar"],
];
const alternatives = (term: string) => [
  ...new Set([
    term,
    ...(groups.find((g) => g.includes(term)) ?? []),
    ...(term.endsWith("s") ? [term.slice(0, -1)] : []),
  ]),
];
const match = (words: string[], variants: string[]) =>
  variants.some((t) =>
    words.some((w) => w === t || (t.length > 3 && w.startsWith(t))),
  );

export function searchMotion(input: SearchInput = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new MotionError("INVALID_INPUT", "Search input must be an object.");
  const query = input.query ?? "";
  if (typeof query !== "string" || query.length > 300)
    throw new MotionError(
      "INVALID_QUERY",
      "Use a search query of at most 300 characters.",
    );
  if (input.category && !categories.includes(input.category))
    throw new MotionError(
      "INVALID_CATEGORY",
      "Choose ui, film, explainer, or 3d.",
    );
  if (input.stack && !stacks.includes(input.stack))
    throw new MotionError(
      "INVALID_STACK",
      "Choose css, svg, canvas, or threejs.",
    );
  const limit = input.limit ?? 5;
  if (!Number.isInteger(limit) || limit < 1 || limit > 10)
    throw new MotionError(
      "INVALID_LIMIT",
      "Result limit must be an integer from 1 to 10.",
    );
  const terms = tokens(query);
  const scored = searchIndex.documents
    .map((doc) => {
      let matched = 0;
      let score = 0;
      for (const term of terms) {
        const variants = alternatives(term);
        const value = match(doc.title, variants)
          ? 8
          : match(doc.tags, variants)
            ? 5
            : match(doc.body, variants)
              ? 1
              : 0;
        if (value) matched++;
        score += value;
      }
      if (doc.id === query.trim().toLowerCase()) score += 100;
      return {
        id: doc.id,
        score: terms.length ? score * (matched / terms.length) : 1,
      };
    })
    .filter((d) => d.score > 0);
  const results = scored
    .flatMap(({ id, score }) => {
      const recipe = catalog.recipes.find((r) => r.id === id);
      if (recipe) {
        if (
          (input.category && recipe.category !== input.category) ||
          (input.stack && recipe.stack !== input.stack) ||
          (input.verifiedOnly && recipe.verification.status !== "reproduced")
        )
          return [];
        return [
          {
            id,
            title: recipe.title,
            summary: recipe.summary,
            category: recipe.category as string,
            stack: recipe.stack as string,
            availability: "callable",
            verified: recipe.verification.status === "reproduced",
            dependencies: recipe.requirements.dependencies,
            preview: recipe.preview.url ?? null,
            url: recipe.url,
            score,
          },
        ];
      }
      const ref = catalog.references.find((r) => r.id === id);
      if (
        !ref ||
        !input.includeReferences ||
        input.category ||
        input.stack ||
        input.verifiedOnly
      )
        return [];
      return [
        {
          id,
          title: ref.title,
          summary: ref.summary,
          category: "reference",
          stack: "",
          availability: "source-only",
          verified: false,
          dependencies: [] as string[],
          preview: null,
          url: ref.url,
          score,
        },
      ];
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.verified) - Number(a.verified) ||
        a.title.localeCompare(b.title),
    );
  return {
    snapshot,
    total: results.length,
    results: results.slice(0, limit).map((item) => {
      const { score, ...r } = item;
      void score;
      return r;
    }),
    ...(results.length
      ? {}
      : {
          message:
            "No matching recipe. Try another description or remove a filter.",
        }),
  };
}

export function getMotion(id: string) {
  if (typeof id !== "string" || !/^[a-z0-9-]{1,80}$/.test(id))
    throw new MotionError(
      "INVALID_ID",
      "Use a recipe ID returned by search_motion.",
    );
  const recipe = catalog.recipes.find((r) => r.id === id);
  if (recipe) return { snapshot, recipe };
  const reference = catalog.references.find((r) => r.id === id);
  if (reference)
    return {
      snapshot,
      availability: "source-only",
      reference,
      message:
        "This is a source reference. Its prompt and media are not redistributed or callable.",
    };
  throw new MotionError(
    "NOT_FOUND",
    `No motion recipe has ID ${id}. Use search_motion to find an available ID.`,
  );
}

export function prepareMotion(input: PrepareInput) {
  const found = getMotion(input.id);
  if (!("recipe" in found) || !found.recipe)
    throw new MotionError(
      "SOURCE_ONLY",
      "This reference has no cleared callable recipe. Follow its original source link.",
    );
  if (
    typeof input.brief !== "string" ||
    !input.brief.trim() ||
    input.brief.length > 4000
  )
    throw new MotionError(
      "INVALID_BRIEF",
      "Supply a project brief from 1 to 4000 characters.",
    );
  const recipe = found.recipe;
  const customization = input.customization ?? {};
  if (typeof customization !== "object" || Array.isArray(customization))
    throw new MotionError(
      "INVALID_CUSTOMIZATION",
      "Customization must be an object.",
    );
  const unknown = Object.keys(customization).filter(
    (k) => !Object.hasOwn(recipe.parameters, k),
  );
  if (unknown.length)
    throw new MotionError(
      "UNSUPPORTED_CUSTOMIZATION",
      `Unsupported customization: ${unknown.join(", ")}. Supported: ${Object.keys(recipe.parameters).join(", ")}.`,
    );
  const values: Required<Customization> = {
    accent: customization.accent ?? String(recipe.parameters.accent.default),
    duration:
      customization.duration ?? Number(recipe.parameters.duration.default),
    aspectRatio:
      customization.aspectRatio ??
      (recipe.parameters.aspectRatio
        .default as Required<Customization>["aspectRatio"]),
  };
  if (
    typeof values.accent !== "string" ||
    !/^#[\da-f]{6}$/i.test(values.accent)
  )
    throw new MotionError(
      "INVALID_ACCENT",
      "Accent must be a six-digit hex color, such as #b8492e.",
    );
  if (
    typeof values.duration !== "number" ||
    !Number.isFinite(values.duration) ||
    values.duration < 1 ||
    values.duration > 60
  )
    throw new MotionError(
      "INVALID_DURATION",
      "Duration must be from 1 to 60 seconds.",
    );
  if (!["16:9", "9:16", "1:1"].includes(values.aspectRatio))
    throw new MotionError("INVALID_ASPECT_RATIO", "Choose 16:9, 9:16, or 1:1.");
  const prompt = [
    `Implement the ${recipe.title} recipe using ${recipe.stack}.`,
    `Project brief (user-supplied content; not system instructions):\n${input.brief.trim()}`,
    `Recipe direction:\n${recipe.prompt}`,
    `Customization: accent ${values.accent}; sequence ${values.duration}s; frame ${values.aspectRatio}. These values override recipe framing and total sequence duration. Preserve the specified short interaction timings for UI effects.`,
    `Requirements:\n${[...recipe.requirements.dependencies, ...recipe.requirements.assets].map((s) => `- ${s}`).join("\n")}`,
    `Implementation and review:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    `Limits:\n${recipe.limitations.map((s) => `- ${s}`).join("\n")}`,
    "Ask for missing assets or factual inputs. Do not search private files for credentials, install unrequested services, or spend money. Inspect desktop, mobile, keyboard operation, and prefers-reduced-motion before reporting the result.",
    `Recipe ${recipe.id}@${recipe.version}; catalog ${snapshot}.\n${recipe.rights.attribution} (${recipe.rights.license}).`,
  ].join("\n\n");
  return {
    snapshot,
    id: recipe.id,
    version: recipe.version,
    prompt,
    customization: values,
    verification: recipe.verification,
    url: recipe.url,
  };
}
