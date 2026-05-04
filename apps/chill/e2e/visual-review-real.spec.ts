import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { test, expect, type Browser } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const SHOTS = resolve(here, "../../../tmp/visual-review/chill-real");
const BASE_URL = process.env.BASE_URL ?? "https://staging.chill.institute";
const TOKEN = process.env.CHILL_TOKEN ?? "";

test.skip(
  !TOKEN || process.env.REAL_DATA !== "1",
  "set REAL_DATA=1 and CHILL_TOKEN=<token> to drive real backend",
);

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await mkdir(SHOTS, { recursive: true });
});

async function authedPage(browser: Browser) {
  const context = await browser.newContext({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: BASE_URL,
          localStorage: [{ name: "chill.auth_token", value: TOKEN }],
        },
      ],
    },
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  return { context, page };
}

/**
 * Headless Chromium's fullPage screenshot stitches viewport-sized strips and
 * occasionally drops image layers between strips on tall pages. Resizing the
 * viewport to the full document height makes the capture one paint.
 */
async function tallShot(page: import("@playwright/test").Page, path: string) {
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width: 1280, height: Math.min(totalHeight, 8192) });
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete), null, {
    timeout: 30_000,
  });
  await page.screenshot({ path });
}

test.describe("real-backend · chill", () => {
  test("home (welcome shell)", async ({ browser }) => {
    const { context, page } = await authedPage(browser);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await expect(page.getByText("Welcome to the Institute")).toBeVisible();
    await expect(page.getByText("What can we hook you up with?")).toBeVisible();
    await tallShot(page, join(SHOTS, "10-home.png"));
    await context.close();
  });

  test("search results (real torrents)", async ({ browser }) => {
    const { context, page } = await authedPage(browser);
    await page.goto(`${BASE_URL}/search?q=Sinners+2025`, { waitUntil: "networkidle" });
    await expect(page.getByText("Very well. Here are the results")).toBeVisible({
      timeout: 20_000,
    });
    // Wait for at least one row to render or the empty state
    await page.waitForTimeout(3_000);
    // Viewport-sized snapshot — real search can return 100+ torrents and we
    // mainly want above-the-fold legibility.
    await page.screenshot({ path: join(SHOTS, "20-search-results.png"), fullPage: false });
    await tallShot(page, join(SHOTS, "21-search-results-full.png"));
    await context.close();
  });
});
