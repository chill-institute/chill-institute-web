import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { TVShowsSource } from "@chill-institute/contracts/chill/v4/api_pb";

import { test, expect } from "./support/fixtures";
import {
  movie,
  moviesResponse,
  searchResponse,
  searchResult,
  tvShow,
  tvShowDetail,
  tvShowDetailResponse,
  tvShowDownload,
  tvShowEpisode,
  tvShowSeason,
  tvShowSeasonDownloadsResponse,
  tvShowSeasonResponse,
  tvShowsResponseForSource,
  userSettings,
} from "./support/seeds";

const SHOTS = join(process.cwd(), "../../tmp/visual-review/binge");

const movies = [
  movie({
    id: "m1",
    title: "Dune: Part Two",
    titlePretty: "Dune: Part Two",
    year: 2024,
    posterUrl: "/test/baggio.jpg",
    rating: 8.5,
    overview:
      "Paul Atreides unites with the Fremen to wage war against House Harkonnen, balancing love against the fate of the universe.",
    link: "magnet:?xt=urn:btih:dune2",
  }),
  movie({
    id: "m2",
    title: "Poor Things",
    titlePretty: "Poor Things",
    year: 2023,
    posterUrl: "/test/baggio.jpg",
    rating: 8.0,
    link: "magnet:?xt=urn:btih:poor",
  }),
  movie({
    id: "m3",
    title: "Oppenheimer",
    titlePretty: "Oppenheimer",
    year: 2023,
    posterUrl: "/test/baggio.jpg",
    rating: 8.4,
    link: "magnet:?xt=urn:btih:opp",
  }),
];

const shows = [
  tvShow({
    imdbId: "tt1",
    title: "The Bear",
    year: 2022,
    posterUrl: "/test/baggio.jpg",
    rating: 8.7,
    source: TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX,
    networks: ["FX"],
  }),
  tvShow({
    imdbId: "tt2",
    title: "Severance",
    year: 2022,
    posterUrl: "/test/baggio.jpg",
    rating: 8.7,
    source: TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX,
    networks: ["Apple TV+"],
  }),
];

const homeMethods = (overrides?: Record<string, unknown>) => ({
  GetUserSettings: userSettings({
    showMovies: true,
    showTvShows: true,
    tvShowsSource: TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX,
  }),
  GetMovies: moviesResponse(movies),
  GetTVShows: tvShowsResponseForSource(TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX, shows),
  ...overrides,
});

const movieResults = [
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
];

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await mkdir(SHOTS, { recursive: true });
});

test.describe("visual review · binge", () => {
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

  test("sign-in page · session-expired error", async ({ page }) => {
    await page.goto("/sign-in?error=SessionExpired");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByText("your session expired")).toBeVisible();
    await page.screenshot({ path: join(SHOTS, "03-sign-in-session-expired.png"), fullPage: true });
  });

  test("home (movies tab)", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(homeMethods());
    await authenticatedPage.goto("/");

    await authenticatedPage.emulateMedia({ reducedMotion: "reduce" });
    await expect(authenticatedPage.getByRole("link", { name: /binge\.institute/i })).toBeVisible();
    await expect(authenticatedPage.getByText("Dune: Part Two")).toBeVisible();
    await expect(authenticatedPage.getByText("Poor Things")).toBeVisible();
    await expect(authenticatedPage.getByText("Oppenheimer")).toBeVisible();
    await authenticatedPage.screenshot({
      path: join(SHOTS, "10-home-movies.png"),
      fullPage: true,
    });
  });

  test("home (tv tab)", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(homeMethods());
    await authenticatedPage.goto("/");

    await authenticatedPage.emulateMedia({ reducedMotion: "reduce" });
    await authenticatedPage.getByRole("tab", { name: "tv shows" }).click();
    await expect(authenticatedPage.getByText("The Bear")).toBeVisible();
    await expect(authenticatedPage.getByText("Severance")).toBeVisible();
    await authenticatedPage.screenshot({ path: join(SHOTS, "11-home-tv.png"), fullPage: true });
  });

  test("movie detail modal", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({
      ...homeMethods(),
      Search: searchResponse("Dune Part Two 2024", movieResults),
    });
    await authenticatedPage.goto("/");

    await authenticatedPage.emulateMedia({ reducedMotion: "reduce" });
    await authenticatedPage.locator("article").first().click();
    await expect(authenticatedPage.getByText("send to put.io").first()).toBeVisible();
    await authenticatedPage.screenshot({
      path: join(SHOTS, "20-movie-modal.png"),
      fullPage: true,
    });
  });

  test("tv detail modal", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(homeMethods());
    const seasons = [
      tvShowSeason({ seasonNumber: 1, name: "Season 1", episodeCount: 8 }),
      tvShowSeason({ seasonNumber: 2, name: "Season 2", episodeCount: 10 }),
    ];
    const episodes = [
      tvShowEpisode({ seasonNumber: 1, episodeNumber: 1, name: "System" }),
      tvShowEpisode({ seasonNumber: 1, episodeNumber: 2, name: "Hands" }),
      tvShowEpisode({ seasonNumber: 1, episodeNumber: 3, name: "Brigade" }),
    ];

    await authenticatedPage.route("**/chill.v4.UserService/GetTVShowDetail", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          tvShowDetailResponse(
            tvShowDetail({ imdbId: "tt1", title: "The Bear", networks: ["FX"] }),
            seasons,
          ),
        ),
      });
    });
    await authenticatedPage.route("**/chill.v4.UserService/GetTVShowSeason", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(tvShowSeasonResponse("tt1", 1, seasons[0], episodes)),
      });
    });
    await authenticatedPage.route(
      "**/chill.v4.UserService/GetTVShowSeasonDownloads",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            tvShowSeasonDownloadsResponse(
              tvShowDownload({
                title: "The.Bear.S01.2160p.WEB-DL.x265-GRP",
                seasonNumber: 1,
                episodeNumber: undefined,
              }),
              episodes.map((ep) => ({
                episodeNumber: ep.episodeNumber,
                searchQuery: `The Bear S01E${String(ep.episodeNumber).padStart(2, "0")}`,
                download: tvShowDownload({
                  title: `The.Bear.S01E${String(ep.episodeNumber).padStart(2, "0")}.1080p-GRP`,
                  seasonNumber: 1,
                  episodeNumber: ep.episodeNumber,
                }),
              })),
            ),
          ),
        });
      },
    );

    await authenticatedPage.goto("/");

    await authenticatedPage.emulateMedia({ reducedMotion: "reduce" });
    await authenticatedPage.getByRole("tab", { name: "tv shows" }).click();
    await authenticatedPage.locator("article").filter({ hasText: "The Bear" }).first().click();
    await expect(authenticatedPage.getByText("send season to put.io")).toBeVisible();
    await authenticatedPage.screenshot({ path: join(SHOTS, "21-tv-modal.png"), fullPage: true });
  });
});
