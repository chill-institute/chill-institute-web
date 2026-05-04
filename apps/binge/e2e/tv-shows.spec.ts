import { TVShowsSource } from "@chill-institute/contracts/chill/v4/api_pb";

import { expect, test } from "./support/fixtures";
import {
  movie,
  moviesResponse,
  tvShow,
  tvShowDetail,
  tvShowDetailResponse,
  tvShowDownload,
  tvShowEpisode,
  tvShowSeason,
  tvShowSeasonDownloadsResponse,
  tvShowSeasonResponse,
  tvShowsResponse,
  tvShowsResponseForSource,
  userSettings,
} from "./support/seeds";

const movies = [
  movie({
    id: "movie-1",
    title: "Inception",
    titlePretty: "Inception",
    year: 2010,
    posterUrl: "/test/baggio.jpg",
    link: "magnet:?xt=urn:btih:movie-1",
  }),
];

const netflixShows = [
  tvShow({
    imdbId: "tt31260386",
    title: "Beauty in Black",
    year: 2024,
    source: TVShowsSource.TV_SHOWS_SOURCE_NETFLIX,
    networks: ["Netflix"],
  }),
];

const hboShows = [
  tvShow({
    imdbId: "tt31938062",
    title: "The Pitt",
    year: 2025,
    source: TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX,
    networks: ["HBO Max"],
  }),
];

const defaultShow = hboShows[0];
const defaultSeasons = [
  tvShowSeason({ seasonNumber: 1, name: "Season 1", episodeCount: 15 }),
  tvShowSeason({ seasonNumber: 2, name: "Season 2", episodeCount: 10, airDate: "2026-01-12" }),
];
const defaultEpisodes = [
  tvShowEpisode({ seasonNumber: 1, episodeNumber: 1, name: "7:00 A.M." }),
  tvShowEpisode({ seasonNumber: 1, episodeNumber: 2, name: "8:00 A.M.", airDate: "2025-01-16" }),
];

const homeMethods = (overrides?: Record<string, unknown>) => ({
  GetUserSettings: userSettings({
    showMovies: true,
    showTvShows: true,
    tvShowsSource: TVShowsSource.TV_SHOWS_SOURCE_NETFLIX,
  }),
  GetMovies: moviesResponse(movies),
  GetTVShows: tvShowsResponse(netflixShows),
  ...overrides,
});

test.describe("tv shows home", () => {
  test("always shows home tabs even for legacy tv-only settings", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showMovies: false,
          showTvShows: true,
          tvShowsSource: TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX,
        }),
        GetTVShows: tvShowsResponseForSource(TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX, hboShows),
      }),
    );

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.getByRole("tab", { name: "movies" })).toBeVisible();
    await expect(authenticatedPage.getByRole("tab", { name: "tv shows" })).toBeVisible();
    await expect(authenticatedPage.getByText("Inception")).toBeVisible();
  });

  test("switching tabs swaps content", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetTVShows: tvShowsResponse(hboShows),
      }),
    );

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.getByText("Inception")).toBeVisible();

    await authenticatedPage.getByRole("tab", { name: "tv shows" }).click();

    await expect(authenticatedPage.getByText("The Pitt")).toBeVisible();
    await expect(authenticatedPage.getByText("Inception")).toBeHidden();
  });

  test("tv source select saves the new source and refreshes the list", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let currentSource = TVShowsSource.TV_SHOWS_SOURCE_NETFLIX;

    await mockRpc(homeMethods());

    await authenticatedPage.route("**/chill.v4.UserService/GetTVShows", async (route) => {
      const response =
        currentSource === TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX
          ? tvShowsResponseForSource(TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX, hboShows)
          : tvShowsResponseForSource(TVShowsSource.TV_SHOWS_SOURCE_NETFLIX, netflixShows);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: { tvShowsSource?: string | number };
      };

      const nextSource = String(body.settings?.tvShowsSource ?? "");
      if (
        nextSource.includes("HBO") ||
        nextSource === String(TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX)
      ) {
        currentSource = TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          userSettings({
            showMovies: true,
            showTvShows: true,
            tvShowsSource: currentSource,
          }),
        ),
      });
    });

    await authenticatedPage.goto("/");
    await authenticatedPage.getByRole("tab", { name: "tv shows" }).click();

    await expect(authenticatedPage.getByText("Beauty in Black")).toBeVisible();

    await authenticatedPage.getByRole("button", { name: "HBO Max" }).click();

    await expect(authenticatedPage.getByText("Beauty in Black")).toBeHidden({ timeout: 500 });
    await expect(authenticatedPage.getByText("The Pitt")).toBeVisible({ timeout: 2000 });
  });

  test("opening a tv card shows live detail data", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetTVShows: tvShowsResponse(hboShows),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/GetTVShowDetail", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          tvShowDetailResponse(
            tvShowDetail({
              imdbId: defaultShow.imdbId,
              title: defaultShow.title,
              networks: defaultShow.networks,
            }),
            defaultSeasons,
          ),
        ),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/GetTVShowSeason", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          tvShowSeasonResponse(defaultShow.imdbId, 1, defaultSeasons[0], defaultEpisodes),
        ),
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
                title: "The.Pitt.S01.2160p.WEB-DL.x265-GROUP",
                seasonNumber: 1,
                episodeNumber: undefined,
              }),
              defaultEpisodes.map((episode) => ({
                episodeNumber: episode.episodeNumber,
                searchQuery: `The Pitt S01E${String(episode.episodeNumber).padStart(2, "0")}`,
                download: tvShowDownload({
                  title: `The.Pitt.S01E${String(episode.episodeNumber).padStart(2, "0")}.1080p.WEBRip.x265-GROUP`,
                  seasonNumber: 1,
                  episodeNumber: episode.episodeNumber,
                }),
              })),
            ),
          ),
        });
      },
    );

    await authenticatedPage.goto("/");
    await authenticatedPage.getByRole("tab", { name: "tv shows" }).click();

    await authenticatedPage.locator("article").filter({ hasText: "The Pitt" }).first().click();

    const modal = authenticatedPage.getByRole("dialog", { name: "The Pitt" });

    await expect(modal.getByText("The Pitt", { exact: true })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Season 1", exact: true })).toBeVisible();
    await expect(modal.getByText("7:00 A.M.")).toBeVisible();
    await expect(modal.getByRole("button", { name: /send season to put.io/i })).toBeVisible();
  });
});
