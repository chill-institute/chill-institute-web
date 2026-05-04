import { expect, test, type Browser } from "@playwright/test";

const TOKEN = process.env.CHILL_TOKEN ?? "";
const BASE = process.env.AUTHED_BASE ?? "http://localhost:58311";

test.skip(!TOKEN, "set CHILL_TOKEN to run the real-backend smoke");

async function authedContext(browser: Browser) {
  return browser.newContext({
    storageState: {
      cookies: [],
      origins: [{ origin: BASE, localStorage: [{ name: "chill.auth_token", value: TOKEN }] }],
    },
  });
}

test.describe("chill · @chill-institute/api smoke", () => {
  test("home renders the welcome shell after the shared client loads settings", async ({
    browser,
  }) => {
    const context = await authedContext(browser);
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /welcome to the institute/i })).toBeVisible();
    await expect(page.getByLabel(/what can we hook you up with/i)).toBeVisible();
    // The home is intentionally empty below the search shell — chill is
    // search-only now. No catalog grid, no movie/tv tabs.
    await expect(page.getByRole("tab", { name: "movies" })).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "tv shows" })).toHaveCount(0);
    await context.close();
  });

  test("search query runs through the shared search RPC and renders results", async ({
    browser,
  }) => {
    const context = await authedContext(browser);
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    const input = page.getByLabel(/what can we hook you up with/i);
    await input.fill("dune");
    await input.press("Enter");

    await page.waitForURL(/\/search/, { timeout: 10_000 });
    // Prove the search RPC actually returned by waiting for the table
    // to populate (or a stable empty-state). Skeletons clearing is the
    // signal the round-trip completed via the shared client.
    await expect
      .poll(
        async () => {
          const rows = await page.locator("table tbody tr").count();
          const skeletons = await page.locator('[data-state="loading"]').count();
          return rows > 0 ? "rows" : skeletons > 0 ? "loading" : "settled-empty";
        },
        { timeout: 30_000 },
      )
      .not.toBe("loading");
    await context.close();
  });

  test("settings opens and shows the post-refresh search-only panel", async ({ browser }) => {
    const context = await authedContext(browser);
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 1100 });
    await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });

    // Settings query goes through the shared client; presence of the
    // user identity row proves a successful round-trip.
    await expect(page.getByRole("heading", { name: /signed in as/i })).toBeVisible({
      timeout: 15_000,
    });
    // The "show movies / show tv shows in the home page" toggles must
    // be gone — chill is search-only after the catalog removal.
    await expect(page.getByRole("switch", { name: /show movies in the home page/i })).toHaveCount(
      0,
    );
    await expect(page.getByRole("switch", { name: /show tv shows in the home page/i })).toHaveCount(
      0,
    );
    await context.close();
  });
});
