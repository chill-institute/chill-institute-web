import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { test, expect } from "./support/fixtures";
import {
  indexer,
  indexersResponse,
  searchResponse,
  searchResult,
  userSettings,
} from "./support/seeds";

const SHOTS = join(process.cwd(), "../../tmp/visual-review/chill");

const duneResults = [
  searchResult({
    id: "r1",
    title: "Dune.Part.Two.2024.2160p.UHD.BluRay.x265.HDR.DV.TrueHD.Atmos-FLUX",
    indexer: "1337x",
    seeders: 892n,
    size: 24_000_000_000n,
    source: "1337x",
    uploadedAt: "2026-04-20T00:00:00Z",
    link: "magnet:?xt=urn:btih:flux",
  }),
  searchResult({
    id: "r2",
    title: "Dune.Part.Two.2024.1080p.BluRay.x265-RARBG",
    indexer: "1337x",
    seeders: 612n,
    size: 4_400_000_000n,
    source: "1337x",
    uploadedAt: "2026-04-15T00:00:00Z",
    link: "magnet:?xt=urn:btih:rarbg",
  }),
  searchResult({
    id: "r3",
    title: "Dune.Part.Two.2024.720p.WEBRip.x264.AAC-GalaxyRG",
    indexer: "rarbg",
    seeders: 128n,
    size: 1_500_000_000n,
    source: "rarbg",
    uploadedAt: "2026-04-10T00:00:00Z",
    link: "magnet:?xt=urn:btih:galaxy",
  }),
  searchResult({
    id: "r4",
    title: "Dune.Part.Two.2024.HDR.2160p.WEBRip.x265-EVO",
    indexer: "rarbg",
    seeders: 94n,
    size: 9_800_000_000n,
    source: "rarbg",
    uploadedAt: "2026-04-08T00:00:00Z",
    link: "magnet:?xt=urn:btih:evo",
  }),
];

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await mkdir(SHOTS, { recursive: true });
});

test.describe("visual review · chill", () => {
  test("sign-in page", async ({ page }) => {
    await page.goto("/sign-in");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByRole("button", { name: "sign in with put.io" })).toBeVisible();
    await page.screenshot({ path: join(SHOTS, "01-sign-in.png"), fullPage: true });
  });

  test("sign-in page · access-denied error", async ({ page }) => {
    await page.goto("/sign-in?error=AccessDenied");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByText("needs an active put.io membership")).toBeVisible();
    await page.screenshot({ path: join(SHOTS, "02-sign-in-access-denied.png"), fullPage: true });
  });

  test("home (welcome shell)", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showMovies: false, showTvShows: false }),
    });
    await authenticatedPage.goto("/");

    await authenticatedPage.emulateMedia({ reducedMotion: "reduce" });
    await expect(authenticatedPage.getByText("Welcome to the Institute")).toBeVisible();
    await expect(authenticatedPage.getByText("What can we hook you up with?")).toBeVisible();
    await authenticatedPage.screenshot({
      path: join(SHOTS, "10-home.png"),
      fullPage: true,
    });
  });

  test("search results", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showMovies: false, showTvShows: false }),
      GetIndexers: indexersResponse([indexer({ id: "yts", name: "YTS", enabled: true })]),
      Search: searchResponse("Dune Part Two 2024", duneResults),
    });
    await authenticatedPage.goto("/search?q=Dune+Part+Two+2024");

    await authenticatedPage.emulateMedia({ reducedMotion: "reduce" });
    await expect(authenticatedPage.getByText("Very well. Here are the results")).toBeVisible();
    await expect(
      authenticatedPage.getByText("Dune.Part.Two.2024.2160p.UHD.BluRay").first(),
    ).toBeVisible();
    await authenticatedPage.screenshot({
      path: join(SHOTS, "20-search-results.png"),
      fullPage: true,
    });
  });

  test("search results · settings expanded", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showMovies: false, showTvShows: false }),
      GetIndexers: indexersResponse([indexer({ id: "yts", name: "YTS", enabled: true })]),
      Search: searchResponse("Dune Part Two 2024", duneResults),
    });
    await authenticatedPage.goto("/search?q=Dune+Part+Two+2024");

    await authenticatedPage.emulateMedia({ reducedMotion: "reduce" });
    await expect(authenticatedPage.getByText("Very well. Here are the results")).toBeVisible();
    await authenticatedPage.getByRole("button", { name: /show settings/i }).click();
    await expect(authenticatedPage.getByText("Search settings")).toBeVisible();
    await authenticatedPage.screenshot({
      path: join(SHOTS, "30-search-settings.png"),
      fullPage: true,
    });
  });
});
