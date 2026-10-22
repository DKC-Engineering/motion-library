import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const root = new URL("../", import.meta.url);
const demos = [
  "magnetic-button",
  "morphing-toggle",
  "staggered-menu",
  "kinetic-wordmark",
  "feature-launch",
  "metric-count-up",
  "process-flow",
  "bar-race",
  "orbiting-system",
  "isometric-cube",
  "aurora-curtain",
  "particle-assembly",
];
const runtime = await readFile(new URL("demos/runtime.js", root));
const style = await readFile(new URL("demos/style.css", root));
const html = await readFile(new URL("demos/index.html", root));
const implementationHash = createHash("sha256")
  .update(runtime)
  .update(style)
  .update(html)
  .digest("hex");
const server = createServer((req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  const files = {
    "/index.html": [html, "text/html"],
    "/runtime.js": [runtime, "text/javascript"],
    "/style.css": [style, "text/css"],
  };
  const file = files[path];
  res.writeHead(file ? 200 : 404, {
    "content-type": file?.[1] ?? "text/plain",
  });
  res.end(file?.[0] ?? "Not found");
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  const browserArg = process.argv.indexOf("--browser-executable");
  browser = await chromium.launch({
    headless: true,
    ...(browserArg >= 0
      ? { executablePath: process.argv[browserArg + 1] }
      : {}),
  });
  const page = await browser.newPage({
    viewport: { width: 960, height: 640 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await mkdir(new URL("evidence/posters/", root), { recursive: true });
  const evidence = {};
  for (const id of demos) {
    errors.length = 0;
    await page.goto(`${origin}/index.html?id=${id}`);
    await page.waitForFunction(() => window.motionDemo?.ready);
    assert.equal(await page.evaluate(() => window.motionDemo.id), id);
    assert.equal(
      await page
        .getByRole("button", { name: "Play reference", exact: true })
        .count(),
      1,
    );
    for (const value of [0, 4, 8, 12])
      assert.equal(
        await page.evaluate((value) => window.seek(value), value),
        value,
      );
    const first = await page.evaluate(() => {
      window.seek(4);
      return document.getElementById("stage").toDataURL();
    });
    const second = await page.evaluate(() => {
      window.seek(4);
      return document.getElementById("stage").toDataURL();
    });
    assert.equal(first, second, `${id} must seek deterministically`);
    if (id === "morphing-toggle") {
      const checkbox = page.getByRole("checkbox", {
        name: "Enable notifications",
      });
      await checkbox.focus();
      await page.keyboard.press("Space");
      assert.equal(await checkbox.isChecked(), true);
    }
    if (id === "staggered-menu") {
      const button = page.getByRole("button", { name: "Explore recipes" });
      await button.click();
      assert.equal(await button.getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Escape");
      assert.equal(await button.getAttribute("aria-expanded"), "false");
    }
    if (id === "magnetic-button") {
      await page.getByRole("button", { name: "Try the pull" }).focus();
      assert.equal(
        await page.evaluate(() => document.activeElement.className),
        "magnet",
      );
    }
    await page.evaluate(() => {
      window.pause();
      window.seek(6);
    });
    if (id === "staggered-menu")
      await page.getByRole("button", { name: "Explore recipes" }).click();
    await page
      .locator("#frame")
      .screenshot({
        path: new URL(`evidence/posters/${id}.png`, root).pathname,
      });
    await page.setViewportSize({ width: 390, height: 400 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
      `${id} mobile overflow`,
    );
    await page.setViewportSize({ width: 960, height: 640 });
    assert.deepEqual(errors, [], `${id} browser errors`);
    evidence[id] = {
      status: "reproduced",
      date: new Date().toISOString().slice(0, 10),
      model: "Codex; model identifier not exposed in the build environment",
      stack:
        id === "magnetic-button" ||
        id === "morphing-toggle" ||
        id === "staggered-menu"
          ? "HTML/CSS"
          : "Canvas 2D",
      recipeVersion: "1.0.0",
      implementationHash: `sha256:${implementationHash}`,
      evidence: `evidence/posters/${id}.png`,
      limitations: [
        "Reference implemented during this Codex session; not an independent model benchmark.",
        "Demo copy and numeric values are illustrative.",
        "Browser checks cover Chromium desktop, mobile viewport, deterministic seek, and reduced motion.",
      ],
    };
    console.log(`Verified ${id}`);
  }
  await writeFile(
    new URL("catalog/evidence.json", root),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
