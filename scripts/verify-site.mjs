import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import assert from "node:assert/strict";
import { catalog } from "../dist/src/core.js";
const siteArg = process.argv.indexOf("--site-out");
const siteOut =
  siteArg >= 0 ? process.argv[siteArg + 1] : process.env.MOTION_SITE_EXPORT;
if (!siteOut)
  throw new Error(
    "Pass --site-out /absolute/path/to/site/out to check a website export.",
  );
const out = resolve(siteOut);
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".ico": "image/x-icon",
};
const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (!extname(path)) path = path.replace(/\/$/, "") + ".html";
    const target = resolve(out, `.${path}`);
    if (!target.startsWith(resolve(out) + "/")) throw new Error("Invalid path");
    const body = await readFile(target);
    res.writeHead(200, {
      "content-type": mime[extname(path)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
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
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: "reduce",
  });
  await context.route(/^https:\/\//, (route) => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let posted = null;
  let posts = 0;
  await page.route("**/api/send-contact", async (route) => {
    posts++;
    posted = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"ok":true}',
    });
  });
  await page.goto(`${origin}/labs/motion-library`);
  await page
    .getByRole("heading", { name: "Find a motion. Build it your way." })
    .waitFor();
  assert.equal(await page.locator("article").count(), catalog.recipes.length);
  assert.equal(
    await page.locator("iframe").count(),
    0,
    "Previews must not load before interaction",
  );
  await mkdir(new URL("../evidence/", import.meta.url), { recursive: true });
  await page.screenshot({
    path: new URL("../evidence/gallery-desktop.png", import.meta.url).pathname,
    fullPage: false,
  });
  await page.getByLabel("With a reference build").check();
  assert.equal(await page.locator("article").count(), 12);
  await page.getByLabel("With a reference build").uncheck();
  await page.getByLabel("Describe the motion").fill("magnetic hover button");
  await page
    .getByRole("button", {
      name: "Play Magnetic button reference",
      exact: true,
    })
    .click();
  assert.equal(await page.locator("iframe").count(), 1);
  await page.getByRole("button", { name: "Close preview" }).click();
  assert.equal(await page.locator("iframe").count(), 0);
  await page
    .getByRole("link", { name: "Get the recipe", exact: true })
    .first()
    .click();
  await page
    .getByLabel("What are you building?")
    .fill("A small agency product button");
  await page.getByLabel("Sequence duration, seconds").fill("10");
  await page.getByRole("button", { name: "Prepare my prompt" }).click();
  assert.ok(
    (await page.getByLabel("Prepared motion prompt").textContent()).includes(
      "small agency product button",
    ),
  );
  assert.equal(posts, 0, "Prompt preparation must stay local");
  await page
    .getByLabel("What do you need to ship?")
    .fill("Help build this reference into our product");
  await page.locator("#project-email").fill("test@example.com");
  await page.getByLabel("Team size", { exact: true }).selectOption("2–10");
  await page.getByRole("button", { name: "Send my project brief" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Your brief is with us." })
    .waitFor();
  assert.equal(posted.motionRecipeId, "magnetic-button");
  assert.equal(posts, 1);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Recipe mobile overflow",
  );
  await page.screenshot({
    path: new URL("../evidence/recipe-mobile.png", import.meta.url).pathname,
    fullPage: false,
  });
  await page.goto(`${origin}/labs/motion-library`);
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Gallery mobile overflow",
  );
  await page.screenshot({
    path: new URL("../evidence/gallery-mobile.png", import.meta.url).pathname,
    fullPage: false,
  });
  await page.getByLabel("Describe the motion").fill("zzzyyqq");
  assert.equal(await page.locator("article").count(), 0);
  await page.getByRole("button", { name: "Reset filters" }).click();
  assert.equal(await page.locator("article").count(), catalog.recipes.length);
  await page.getByRole("button", { name: "Explainers", exact: true }).click();
  assert.equal(await page.locator("article").count(), 10);
  await page.goto(`${origin}/labs/motion-library/install`);
  await page
    .getByRole("heading", { name: "Bring the library into your editor." })
    .waitFor();
  await page.goto(`${origin}/labs/motion-library/hand-painted-character-film`);
  await page
    .getByRole("heading", { name: "Hand-painted character film", exact: true })
    .waitFor();
  const mit = page.getByRole("link", { name: "MIT", exact: true });
  assert.ok((await mit.getAttribute("href")).endsWith("/LICENSE"));
  assert.ok((await page.locator("main").innerText()).includes("John Heibel"));
  assert.ok(
    (await page.locator("main").innerText()).includes(
      "no reference reproduction yet",
    ),
  );
  assert.ok(
    !(await page.locator("main").innerText()).includes(
      "Credit DarkKnight Cave when sharing an adaptation",
    ),
  );
  assert.equal(errors.length, 0, errors.join("\n"));
  const report = {
    checkedAt: new Date().toISOString(),
    browser: "Chromium",
    desktop: "1440x1050",
    mobile: "390x844",
    passed: [
      `${catalog.recipes.length} static recipes`,
      "12 reproduced filter",
      "on-demand iframe loading",
      "search and category filters",
      "local prompt preparation",
      "mocked project brief attribution",
      "empty state recovery",
      "mobile overflow",
      "installation page",
      "imported recipe MIT license and attribution",
    ],
    emailDelivery: "mocked; no email sent",
    nativeEditorClients: "not tested",
  };
  await writeFile(
    new URL("../evidence/site-report.json", import.meta.url),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
