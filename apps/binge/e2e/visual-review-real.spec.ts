import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { test, expect, type Browser } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const SHOTS = resolve(here, "../../../tmp/visual-review/binge-real");
const BASE_URL = process.env.BASE_URL ?? "https://staging.binge.institute";
const TOKEN = process.env.CHILL_TOKEN ?? "";

test.skip(
  !TOKEN || process.env.REAL_DATA !== "1",
  "set REAL_DATA=1 and CHILL_TOKEN=<token> to drive real backend",
);

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await mkdir(SHOTS, { recursive: true });
});

async function authedContext(browser: Browser) {
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

test.describe("real-backend · binge", () => {
  test("home (movies)", async ({ browser }) => {
    const { context, page } = await authedContext(browser);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: /binge\.institute/i })).toBeVisible();
    // Wait for a poster card to render — proves real data flowed.
    await expect(page.locator("article").first()).toBeVisible({ timeout: 20_000 });
    await tallShot(page, join(SHOTS, "10-home-movies.png"));
    await context.close();
  });

  test("home (tv shows)", async ({ browser }) => {
    const { context, page } = await authedContext(browser);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: "tv shows" }).click();
    await expect(page.locator("article").first()).toBeVisible({ timeout: 20_000 });
    // Wait for the catalog to settle — count keeps growing while React hydrates
    // and the API streams shows in. Once it's stable for a frame we're done.
    let lastCount = 0;
    for (let i = 0; i < 20; i++) {
      const count = await page.locator("article").count();
      if (count === lastCount && count > 0) break;
      lastCount = count;
      await page.waitForTimeout(200);
    }
    await tallShot(page, join(SHOTS, "11-home-tv.png"));
    await context.close();
  });

  test("movie detail modal", async ({ browser }) => {
    const { context, page } = await authedContext(browser);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    const firstCard = page.locator("article").first();
    await expect(firstCard).toBeVisible({ timeout: 20_000 });
    await firstCard.click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(2_000);
    await tallShot(page, join(SHOTS, "20-movie-modal.png"));
    await context.close();
  });

  test("tv detail modal", async ({ browser }) => {
    const { context, page } = await authedContext(browser);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: "tv shows" }).click();
    const firstCard = page.locator("article").first();
    await expect(firstCard).toBeVisible({ timeout: 20_000 });
    await firstCard.click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(2_000);
    await tallShot(page, join(SHOTS, "21-tv-modal.png"));
    await context.close();
  });
});
