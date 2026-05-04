import { test, expect } from "./support/fixtures";
import type { Page } from "@playwright/test";
import {
  movie,
  moviesResponse,
  moviesResponseForSource,
  searchResponse,
  searchResult,
  tvShowsResponse,
  userSettings,
} from "./support/seeds";
import { CardDisplayType, MoviesSource } from "@chill-institute/contracts/chill/v4/api_pb";

const movies = [
  movie({
    id: "m1",
    title: "Inception",
    titlePretty: "Inception",
    year: 2010,
    rating: 8.8,
    genres: ["Science Fiction", "Action"],
    link: "magnet:?xt=urn:btih:inception",
    posterUrl: "/test/baggio.jpg",
  }),
  movie({
    id: "m2",
    title: "Interstellar",
    titlePretty: "Interstellar",
    year: 2014,
    rating: 8.7,
    link: "magnet:?xt=urn:btih:interstellar",
    posterUrl: "/test/baggio.jpg",
  }),
];

const ytsMovies = [
  movie({
    id: "y1",
    title: "The Raid",
    titlePretty: "The Raid",
    year: 2011,
    rating: 7.6,
    link: "magnet:?xt=urn:btih:raid",
    posterUrl: "/test/baggio.jpg",
    source: MoviesSource.YTS,
  }),
];

const inceptionSearchResults = [
  searchResult({
    id: "sr1",
    title: "Inception.2010.1080p.BluRay.x264",
    indexer: "YTS",
    link: "magnet:?xt=urn:btih:inception1080",
    seeders: 200n,
    peers: 240n,
    size: 2147483648n,
    source: "yts",
    uploadedAt: "2026-04-01T00:00:00Z",
  }),
  searchResult({
    id: "sr2",
    title: "Inception.2010.2160p.WEB-DL.x265",
    indexer: "RARBG",
    link: "magnet:?xt=urn:btih:inception2160",
    seeders: 80n,
    peers: 120n,
    size: 8589934592n,
    source: "rarbg",
    uploadedAt: "2026-03-20T00:00:00Z",
  }),
  searchResult({
    id: "sr3",
    title: "Inception.2010.720p.BluRay.x265",
    indexer: "EZTV",
    link: "magnet:?xt=urn:btih:inception720",
    seeders: 120n,
    peers: 170n,
    size: 1610612736n,
    source: "eztv",
    uploadedAt: "2026-04-09T00:00:00Z",
  }),
];

const homeMethods = (overrides?: Record<string, unknown>) => ({
  GetUserSettings: userSettings({ showMovies: true, showTvShows: true }),
  GetMovies: moviesResponse(movies),
  GetTVShows: tvShowsResponse([]),
  ...overrides,
});

async function openFirstMovieModal(page: Page) {
  // PosterCard exposes the article itself as role="button" — there's no
  // longer a nested <button>. Click the article directly.
  const firstArticle = page.locator("article").first();
  await expect(firstArticle).toBeVisible();
  await firstArticle.click();
}

test.describe("movies", () => {
  test("always renders movies in expanded view and hides display controls", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showMovies: true,
          cardDisplayType: CardDisplayType.COMPACT,
        }),
      }),
    );

    await authenticatedPage.goto("/");

    const articles = authenticatedPage.locator("article");
    await expect(articles).toHaveCount(2);
    await expect(authenticatedPage.locator("article img")).toHaveCount(2);
    await expect(articles.nth(0)).toContainText("Inception");
    await expect(articles.nth(1)).toContainText("Interstellar");
    await expect(authenticatedPage.getByRole("button", { name: "Expanded view" })).toHaveCount(0);
    await expect(authenticatedPage.getByRole("button", { name: "Compact view" })).toHaveCount(0);
    await expect(authenticatedPage.getByRole("button", { name: "Open RSS feed link" })).toHaveCount(
      0,
    );
  });

  test("always shows home tabs even for legacy movie-only settings", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({ showMovies: true, showTvShows: false }),
      }),
    );

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.getByRole("tab", { name: "movies" })).toBeVisible();
    await expect(authenticatedPage.getByRole("tab", { name: "tv shows" })).toBeVisible();
    await expect(authenticatedPage.getByText("Inception")).toBeVisible();
  });

  test("legacy hidden-home settings are ignored", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({ showMovies: false, showTvShows: false }),
      }),
    );

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.getByRole("tab", { name: "movies" })).toBeVisible();
    await expect(authenticatedPage.locator("article")).toHaveCount(2);
  });

  test("empty state", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetMovies: moviesResponse([]),
      }),
    );

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.getByText("Couldn't fetch any movies")).toBeVisible({
      timeout: 5000,
    });
  });

  test("redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/sign-in**");
    expect(page.url()).toContain("/sign-in");
  });

  test("clicking a movie card opens the detail modal and shows torrent results", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc(
      homeMethods({
        Search: searchResponse("Inception 2010", inceptionSearchResults),
      }),
    );

    await authenticatedPage.goto("/");
    await openFirstMovieModal(authenticatedPage);

    await expect(authenticatedPage.getByText("Inception.2010.1080p.BluRay.x264")).toBeVisible();
    await expect(authenticatedPage.getByText("Science Fiction")).toBeVisible();
    await expect(authenticatedPage.getByText("Action")).toBeVisible();
    await expect(authenticatedPage.getByLabel("Resolution")).toBeVisible();
    await expect(authenticatedPage.getByLabel("Codec")).toBeVisible();
    await expect(authenticatedPage.getByLabel("Sort")).toBeVisible();
    await expect(
      authenticatedPage.getByRole("button", { name: /send to put\.io/i }).last(),
    ).toBeVisible();
  });

  test("movie modal filters results and updates result order when sort changes", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc(
      homeMethods({
        Search: searchResponse("Inception 2010", inceptionSearchResults),
      }),
    );

    await authenticatedPage.goto("/");
    await openFirstMovieModal(authenticatedPage);

    const resolutionSelect = authenticatedPage.getByLabel("Resolution");
    const codecSelect = authenticatedPage.getByLabel("Codec");
    const sortSelect = authenticatedPage.getByLabel("Sort");
    const resultsList = authenticatedPage.getByRole("list", { name: "Torrent results list" });
    const resultItems = resultsList.getByRole("listitem");

    await expect(resultItems).toHaveCount(3);
    await expect(resultItems.first()).toContainText("Inception.2010.1080p.BluRay.x264");

    await resolutionSelect.selectOption("2160p");
    await expect(resultItems).toHaveCount(1);
    await expect(resultItems.first()).toContainText("Inception.2010.2160p.WEB-DL.x265");

    await resolutionSelect.selectOption("all");
    await codecSelect.selectOption("x265");
    await expect(resultItems).toHaveCount(2);
    await expect(resultsList).not.toContainText("Inception.2010.1080p.BluRay.x264");

    await codecSelect.selectOption("all");
    await sortSelect.selectOption("age");
    await expect(resultItems).toHaveCount(3);
    await expect(resultItems.first()).toContainText("Inception.2010.720p.BluRay.x265");

    await sortSelect.selectOption("size");
    await expect(resultItems.first()).toContainText("Inception.2010.2160p.WEB-DL.x265");
  });

  test("changing source does not re-show stale movies while waiting for the new source", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let currentSource = MoviesSource.IMDB_MOVIEMETER;

    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showMovies: true,
          moviesSource: MoviesSource.IMDB_MOVIEMETER,
        }),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/GetMovies", async (route) => {
      const response =
        currentSource === MoviesSource.YTS
          ? moviesResponseForSource(MoviesSource.YTS, ytsMovies)
          : moviesResponseForSource(MoviesSource.IMDB_MOVIEMETER, movies);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: { moviesSource?: string | number };
      };

      const nextSource = String(body.settings?.moviesSource ?? "");
      if (nextSource.includes("YTS") || nextSource === String(MoviesSource.YTS)) {
        currentSource = MoviesSource.YTS;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          userSettings({
            showMovies: true,
            moviesSource: currentSource,
          }),
        ),
      });
    });

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.getByText("Inception")).toBeVisible();

    await authenticatedPage.getByRole("button", { name: "YTS" }).click();

    await expect(authenticatedPage.getByText("Inception")).toBeHidden({ timeout: 400 });
    await expect(authenticatedPage.getByText("The Raid")).toBeVisible({ timeout: 2000 });
  });

  test("changing source only refetches movies once after save", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let currentSource = MoviesSource.IMDB_MOVIEMETER;
    let moviesRequests = 0;

    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showMovies: true,
          moviesSource: MoviesSource.IMDB_MOVIEMETER,
        }),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/GetMovies", async (route) => {
      moviesRequests += 1;

      const response =
        currentSource === MoviesSource.YTS
          ? moviesResponseForSource(MoviesSource.YTS, ytsMovies)
          : moviesResponseForSource(MoviesSource.IMDB_MOVIEMETER, movies);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: { moviesSource?: string | number };
      };

      const nextSource = String(body.settings?.moviesSource ?? "");
      if (nextSource.includes("YTS") || nextSource === String(MoviesSource.YTS)) {
        currentSource = MoviesSource.YTS;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          userSettings({
            showMovies: true,
            moviesSource: currentSource,
          }),
        ),
      });
    });

    await authenticatedPage.goto("/");
    await expect(authenticatedPage.getByText("Inception")).toBeVisible();
    await expect.poll(() => moviesRequests).toBe(1);

    await authenticatedPage.getByRole("button", { name: "YTS" }).click();

    await expect(authenticatedPage.getByText("The Raid")).toBeVisible({ timeout: 2000 });
    await expect.poll(() => moviesRequests).toBe(2);
  });

  test("waits for real settings before fetching movies from cached settings", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc(homeMethods());

    await authenticatedPage.addInitScript(
      (cachedSettings) => {
        window.localStorage.setItem("chill.settings", cachedSettings);
      },
      JSON.stringify({
        codecFilters: [],
        disabledIndexerIds: [],
        filterNastyResults: true,
        filterResultsWithNoSeeders: false,
        otherFilters: [],
        rememberQuickFilters: false,
        resolutionFilters: [],
        searchResultDisplayBehavior: 1,
        searchResultTitleBehavior: 2,
        showMovies: true,
        showTvShows: true,
        sortBy: 2,
        sortDirection: 2,
        cardDisplayType: 1,
        moviesSource: MoviesSource.IMDB_MOVIEMETER,
        tvShowsSource: 1,
      }),
    );

    let allowSettingsResponses = false;
    const releaseSettingsResponses: Array<() => void> = [];
    let moviesRequests = 0;

    await authenticatedPage.route("**/chill.v4.UserService/GetUserSettings", async (route) => {
      if (!allowSettingsResponses) {
        await new Promise<void>((resolve) => {
          releaseSettingsResponses.push(resolve);
        });
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          userSettings({
            showMovies: true,
            moviesSource: MoviesSource.IMDB_MOVIEMETER,
          }),
        ),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/GetMovies", async (route) => {
      moviesRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(moviesResponse(movies)),
      });
    });

    await authenticatedPage.goto("/");

    await expect.poll(() => moviesRequests, { timeout: 300 }).toBe(0);

    allowSettingsResponses = true;
    for (const releaseSettingsResponse of releaseSettingsResponses) {
      releaseSettingsResponse();
    }

    await expect(authenticatedPage.getByText("Inception")).toBeVisible({ timeout: 2000 });
    await expect.poll(() => moviesRequests).toBe(1);
  });

  test("error state shows error message", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({ showMovies: true }),
      }),
    );

    // Override GetMovies to return an error
    await authenticatedPage.route("**/chill.v4.UserService/GetMovies", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          code: "internal",
          message: "indexer is down",
        }),
      });
    });

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.getByText("indexer is down")).toBeVisible({ timeout: 5000 });
  });
});
