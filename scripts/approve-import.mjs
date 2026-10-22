import { readFile, writeFile } from "node:fs/promises";
import { validateImport } from "./import-policy.mjs";
const file = process.argv[2];
if (!file)
  throw new Error(
    "Usage: node scripts/approve-import.mjs /path/to/human-reviewed-entry.json",
  );
const entry = JSON.parse(await readFile(file, "utf8"));
validateImport(entry);
const target = new URL("../catalog/approved-imports.json", import.meta.url);
const approved = JSON.parse(await readFile(target, "utf8"));
const originals = JSON.parse(
  await readFile(new URL("../catalog/authored.json", import.meta.url), "utf8"),
);
if (
  approved.some((e) => e.id === entry.id) ||
  originals.some((row) => row[0] === entry.id)
)
  throw new Error("That ID is already in the catalog.");
approved.push(entry);
await writeFile(target, `${JSON.stringify(approved, null, 2)}\n`);
console.log(
  `Added reviewed import ${entry.id}. Inspect the diff and rebuild before a human publishes it.`,
);
