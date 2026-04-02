import { test, expect } from "./support/fixtures";
import { movie, moviesResponse, moviesResponseForSource, userSettings } from "./support/seeds";
import { CardDisplayType, MoviesSource } from "@chill-institute/contracts/chill/v4/api_pb";

const movies = [
  movie({
    id: "m1",
    title: "Inception",
    titlePretty: "Inception",
    year: 2010,
    rating: 8.8,
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

const homeMethods = (overrides?: Record<string, unknown>) => ({
  GetUserSettings: userSettings({ showMovies: true, showTvShows: false }),
  GetMovies: moviesResponse(movies),
  ...overrides,
});

test.describe("movies", () => {
  test("shows movies in compact view", async ({ authenticatedPage, mockRpc }) => {
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
    await expect(articles.nth(0)).toContainText("Inception");
    await expect(articles.nth(0)).toContainText("2010");
    await expect(articles.nth(0)).toContainText("8.8");
    await expect(articles.nth(1)).toContainText("Interstellar");
    await expect(articles.nth(1)).toContainText("2014");
    await expect(articles.nth(1)).toContainText("8.7");
  });

  test("does not show home tabs when only movies are enabled", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc(homeMethods());

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.getByRole("button", { name: "movies" })).toHaveCount(0);
    await expect(authenticatedPage.getByRole("button", { name: "tv shows" })).toHaveCount(0);
    await expect(authenticatedPage.getByText("Inception")).toBeVisible();
  });

  test("shows movies in expanded view", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showMovies: true,
          cardDisplayType: CardDisplayType.EXPANDED,
        }),
      }),
    );

    await authenticatedPage.goto("/");

    const articles = authenticatedPage.locator("article");
    await expect(articles).toHaveCount(2);
    await expect(articles.nth(0)).toContainText("Inception");
    await expect(articles.nth(1)).toContainText("Interstellar");
  });

  test("hidden when disabled", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({ showMovies: false, showTvShows: false }),
      }),
    );

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.locator("article")).toHaveCount(0);
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

  test("add transfer sends magnet to put.io", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        AddTransfer: { status: "OK" },
      }),
    );

    await authenticatedPage.goto("/");

    const firstArticle = authenticatedPage.locator("article").first();
    await expect(firstArticle).toBeVisible();

    const sendButton = firstArticle.getByRole("button", {
      name: "send to put.io",
    });
    await sendButton.click();

    await expect(firstArticle.getByText("sent!")).toBeVisible();
  });

  test("search in the institute navigates to search page", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc(homeMethods());

    await authenticatedPage.goto("/");

    const firstArticle = authenticatedPage.locator("article").first();
    await expect(firstArticle).toBeVisible();

    const searchLink = firstArticle.getByRole("link", {
      name: "Search Inception 2010 in the institute",
    });
    await searchLink.click();

    await authenticatedPage.waitForURL("**/search**");
    expect(authenticatedPage.url()).toContain("/search");
    expect(authenticatedPage.url()).toContain("q=Inception");
  });

  test("display type toggle saves new display type", async ({ authenticatedPage, mockRpc }) => {
    let savedDisplayType: unknown;

    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showMovies: true,
          cardDisplayType: CardDisplayType.COMPACT,
        }),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: Record<string, unknown>;
      };
      if (body.settings) {
        savedDisplayType = body.settings.cardDisplayType;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    });

    await authenticatedPage.goto("/");

    const articles = authenticatedPage.locator("article");
    await expect(articles).toHaveCount(2);

    await authenticatedPage.getByRole("button", { name: "Expanded view" }).click();

    // Proto JSON serializes enums as strings
    await expect.poll(() => savedDisplayType).toBe("CARD_DISPLAY_TYPE_EXPANDED");
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

  test("rss button stays visible but disabled while a new source is loading", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let currentSource = MoviesSource.IMDB_MOVIEMETER;
    let releaseYtsResponse: (() => void) | undefined;
    let resolveYtsRequestSeen: (() => void) | undefined;
    const ytsRequestSeen = new Promise<void>((resolve) => {
      resolveYtsRequestSeen = resolve;
    });

    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showMovies: true,
          moviesSource: MoviesSource.IMDB_MOVIEMETER,
        }),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/GetMovies", async (route) => {
      if (currentSource === MoviesSource.YTS) {
        resolveYtsRequestSeen?.();
        await new Promise<void>((resolve) => {
          releaseYtsResponse = resolve;
        });
      }

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

    const rssButton = authenticatedPage.getByRole("button", { name: "Open RSS feed link" });
    await expect(rssButton).toBeVisible();
    await expect(rssButton).toBeEnabled();

    await authenticatedPage.getByRole("button", { name: "YTS" }).click();

    await ytsRequestSeen;
    await expect(rssButton).toBeVisible();
    await expect(rssButton).toBeDisabled();

    releaseYtsResponse?.();

    await expect(authenticatedPage.getByText("The Raid")).toBeVisible({ timeout: 2000 });
    await expect(rssButton).toBeEnabled();
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

  test("enabling movies hides the stale empty state while retrying", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let showMoviesEnabled = false;
    let releaseSaveSettingsResponse: (() => void) | undefined;
    let resolveSaveRequestSeen: (() => void) | undefined;
    const saveRequestSeen = new Promise<void>((resolve) => {
      resolveSaveRequestSeen = resolve;
    });
    let moviesRequests = 0;

    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showMovies: false,
          showTvShows: false,
          moviesSource: MoviesSource.IMDB_MOVIEMETER,
        }),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/GetMovies", async (route) => {
      moviesRequests += 1;
      const response = showMoviesEnabled ? moviesResponse(movies) : moviesResponse([]);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: { showMovies?: boolean | string };
      };
      resolveSaveRequestSeen?.();

      await new Promise<void>((resolve) => {
        releaseSaveSettingsResponse = () => {
          showMoviesEnabled =
            body.settings?.showMovies === true || body.settings?.showMovies === "true";
          resolve();
        };
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          userSettings({
            showMovies: showMoviesEnabled,
            showTvShows: false,
            moviesSource: MoviesSource.IMDB_MOVIEMETER,
          }),
        ),
      });
    });

    await authenticatedPage.goto("/");

    await authenticatedPage.getByRole("button", { name: "Show settings" }).click();
    await authenticatedPage.getByRole("switch", { name: "Show movies in the home page" }).click();

    await expect(authenticatedPage.getByText("Couldn't fetch any movies")).toBeHidden();
    await expect.poll(() => moviesRequests).toBe(1);
    await saveRequestSeen;

    releaseSaveSettingsResponse?.();

    await expect.poll(() => moviesRequests).toBe(2);
    await expect(authenticatedPage.getByText("Inception")).toBeVisible({ timeout: 2000 });
  });

  test("re-enabling movies hides the stale error while retrying", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let settingsState = userSettings({
      showMovies: true,
      moviesSource: MoviesSource.IMDB_MOVIEMETER,
    });
    let moviesRequests = 0;
    const releaseRetryResponses: Array<() => void> = [];

    await mockRpc(
      homeMethods({
        GetUserSettings: settingsState,
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/GetUserSettings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/GetMovies", async (route) => {
      moviesRequests += 1;

      if (moviesRequests === 1) {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            code: "internal",
            message: "indexer is down",
          }),
        });
        return;
      }

      await new Promise<void>((resolve) => {
        releaseRetryResponses.push(resolve);
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(moviesResponse(movies)),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: ReturnType<typeof userSettings>;
      };

      if (body.settings) {
        settingsState = body.settings as typeof settingsState;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.goto("/");

    await authenticatedPage.getByRole("button", { name: "Show settings" }).click();
    const toggle = authenticatedPage.getByRole("switch", {
      name: "Show movies in the home page",
    });

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    await expect.poll(() => (moviesRequests >= 2 ? 1 : 0)).toBe(1);
    await expect.poll(() => (releaseRetryResponses.length > 0 ? 1 : 0)).toBe(1);
    await expect(authenticatedPage.getByText("indexer is down")).toBeHidden();

    for (const releaseRetryResponse of releaseRetryResponses) {
      releaseRetryResponse();
    }
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
