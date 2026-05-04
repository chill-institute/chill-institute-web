import { expect, test, type Browser } from "@playwright/test";

const TOKEN = process.env.CHILL_TOKEN ?? "";
const BASE = process.env.AUTHED_BASE ?? "http://localhost:58410";

test.skip(!TOKEN, "set CHILL_TOKEN to run the real-backend smoke");

async function authedContext(browser: Browser) {
  return browser.newContext({
    storageState: {
      cookies: [],
      origins: [{ origin: BASE, localStorage: [{ name: "chill.auth_token", value: TOKEN }] }],
    },
  });
}

test.describe("binge · @chill-institute/api smoke", () => {
  test("home loads movies catalog through the shared client", async ({ browser }) => {
    const context = await authedContext(browser);
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 1100 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    await expect(page.getByRole("link", { name: /binge\.institute/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: "movies" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.locator("article").first()).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 30_000 })
      .toBeGreaterThan(5);
    await context.close();
  });

  test("tv tab loads through the shared client and renders shows", async ({ browser }) => {
    const context = await authedContext(browser);
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 1100 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    await page.getByRole("tab", { name: "tv shows" }).click();
    await expect(page.getByRole("tab", { name: "tv shows" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.locator("article").first()).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 30_000 })
      .toBeGreaterThan(5);
    await context.close();
  });

  test("movie modal pulls torrent results through the shared search RPC", async ({ browser }) => {
    const context = await authedContext(browser);
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 1100 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    await expect(page.locator("article").first()).toBeVisible({ timeout: 30_000 });
    await page.locator("article").first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    // Wait until the loading skeletons clear and either real rows or an
    // empty-results card is present — both prove the search RPC ran.
    await expect
      .poll(
        async () => {
          const rows = await dialog
            .locator('[role="list"][aria-label="Torrent results list"] [role="listitem"]')
            .count();
          const empty = await dialog
            .getByText(/no torrent results found|no results match these filters/i)
            .count();
          return rows + empty;
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThan(0);
    await context.close();
  });
});
