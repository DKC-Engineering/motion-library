export const categories = ["ui", "film", "explainer", "3d"] as const;
export const stacks = ["css", "svg", "canvas", "threejs"] as const;
export type Category = (typeof categories)[number];
export type Stack = (typeof stacks)[number];
export type Parameter = {
  type: "color" | "number" | "enum";
  default: string | number;
  description: string;
  min?: number;
  max?: number;
  values?: string[];
};
export type Recipe = {
  id: string;
  version: string;
  title: string;
  summary: string;
  category: Category;
  stack: Stack;
  tags: string[];
  availability: "callable";
  parameters: Record<string, Parameter>;
  prompt: string;
  steps: string[];
  requirements: { dependencies: string[]; assets: string[] };
  limitations: string[];
  provenance: {
    creator: string;
    url: string;
    revision: string;
    kind: string;
    note: string;
  };
  rights: { status: string; license: string; attribution: string };
  verification: {
    status: string;
    date?: string;
    model?: string;
    stack?: string;
    recipeVersion?: string;
    implementationHash?: string;
    evidence?: string;
    limitations?: string[];
  };
  preview: { kind: string; url?: string; poster?: string; note: string };
  url: string;
  originalUri?: string;
};
export type SourceReference = {
  id: string;
  title: string;
  summary: string;
  url: string;
  tags: string[];
  reason: string;
};
export type Catalog = {
  schemaVersion: number;
  snapshot: string;
  updatedAt: string;
  recipes: Recipe[];
  references: SourceReference[];
};
export type SearchInput = {
  query?: string;
  category?: Category;
  stack?: Stack;
  limit?: number;
  includeReferences?: boolean;
  verifiedOnly?: boolean;
};
export type Customization = {
  accent?: string;
  duration?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
};
export type PrepareInput = {
  id: string;
  brief: string;
  customization?: Customization;
};
