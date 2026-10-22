import { cp, mkdir, rm } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const target = new URL("public/motion-library/", root);
// This directory contains generated feature assets only. Clearing it makes removals effective.
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(new URL("demos/", root), new URL("demos/", target), { recursive: true });
await cp(new URL("evidence/posters/", root), new URL("posters/", target), { recursive: true });
