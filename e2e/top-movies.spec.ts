import { test, expect } from "./support/fixtures";
import {
  topMovie,
  topMoviesResponse,
  topMoviesResponseForSource,
  userSettings,
} from "./support/seeds";
import { TopMoviesDisplayType, TopMoviesSource } from "@chill-institute/contracts/chill/v4/api_pb";

const movies = [
  topMovie({
    id: "m1",
    title: "Inception",
    titlePretty: "Inception",
    year: 2010,
    rating: 8.8,
    link: "magnet:?xt=urn:btih:inception",
    posterUrl: "/test/baggio.jpg",
  }),
  topMovie({
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
  topMovie({
    id: "y1",
    title: "The Raid",
    titlePretty: "The Raid",
    year: 2011,
    rating: 7.6,
    link: "magnet:?xt=urn:btih:raid",
    posterUrl: "/test/baggio.jpg",
    source: TopMoviesSource.YTS,
  }),
];

const homeMethods = (overrides?: Record<string, unknown>) => ({
  GetUserSettings: userSettings({ showTopMovies: true }),
  GetTopMovies: topMoviesResponse(movies),
  ...overrides,
});

test.describe("top movies", () => {
  test("shows movies in compact view", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showTopMovies: true,
          topMoviesDisplayType: TopMoviesDisplayType.COMPACT,
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

  test("shows movies in expanded view", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showTopMovies: true,
          topMoviesDisplayType: TopMoviesDisplayType.EXPANDED,
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
        GetUserSettings: userSettings({ showTopMovies: false }),
      }),
    );

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.locator("article")).toHaveCount(0);
  });

  test("empty state", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetTopMovies: topMoviesResponse([]),
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

    const searchLink = firstArticle.locator('a[href*="/search"]');
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
          showTopMovies: true,
          topMoviesDisplayType: TopMoviesDisplayType.COMPACT,
        }),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: Record<string, unknown>;
      };
      if (body.settings) {
        savedDisplayType = body.settings.topMoviesDisplayType;
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

    // Click the unpressed toggle to switch to expanded
    const unpressedToggle = authenticatedPage.locator('button[aria-pressed="false"]');
    await unpressedToggle.first().click();

    // Proto JSON serializes enums as strings
    await expect.poll(() => savedDisplayType).toBe("TOP_MOVIES_DISPLAY_TYPE_EXPANDED");
  });

  test("changing source does not re-show stale movies while waiting for the new source", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let currentSource = TopMoviesSource.IMDB_MOVIEMETER;

    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showTopMovies: true,
          topMoviesSource: TopMoviesSource.IMDB_MOVIEMETER,
        }),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/GetTopMovies", async (route) => {
      const response =
        currentSource === TopMoviesSource.YTS
          ? topMoviesResponseForSource(TopMoviesSource.YTS, ytsMovies)
          : topMoviesResponseForSource(TopMoviesSource.IMDB_MOVIEMETER, movies);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: { topMoviesSource?: string | number };
      };

      const nextSource = String(body.settings?.topMoviesSource ?? "");
      if (nextSource.includes("YTS") || nextSource === String(TopMoviesSource.YTS)) {
        currentSource = TopMoviesSource.YTS;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          userSettings({
            showTopMovies: true,
            topMoviesSource: currentSource,
          }),
        ),
      });
    });

    await authenticatedPage.goto("/");

    await expect(authenticatedPage.getByText("Inception")).toBeVisible();

    await authenticatedPage.getByRole("combobox").click();
    await authenticatedPage.getByRole("option", { name: "Trending movies from YTS" }).click();

    await expect(authenticatedPage.getByText("Inception")).toBeHidden({ timeout: 400 });
    await expect(authenticatedPage.getByText("The Raid")).toBeVisible({ timeout: 2000 });
  });

  test("rss button stays visible but disabled while a new source is loading", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let currentSource = TopMoviesSource.IMDB_MOVIEMETER;
    let releaseYtsResponse: (() => void) | undefined;
    let resolveYtsRequestSeen: (() => void) | undefined;
    const ytsRequestSeen = new Promise<void>((resolve) => {
      resolveYtsRequestSeen = resolve;
    });

    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showTopMovies: true,
          topMoviesSource: TopMoviesSource.IMDB_MOVIEMETER,
        }),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/GetTopMovies", async (route) => {
      if (currentSource === TopMoviesSource.YTS) {
        resolveYtsRequestSeen?.();
        await new Promise<void>((resolve) => {
          releaseYtsResponse = resolve;
        });
      }

      const response =
        currentSource === TopMoviesSource.YTS
          ? topMoviesResponseForSource(TopMoviesSource.YTS, ytsMovies)
          : topMoviesResponseForSource(TopMoviesSource.IMDB_MOVIEMETER, movies);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: { topMoviesSource?: string | number };
      };

      const nextSource = String(body.settings?.topMoviesSource ?? "");
      if (nextSource.includes("YTS") || nextSource === String(TopMoviesSource.YTS)) {
        currentSource = TopMoviesSource.YTS;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          userSettings({
            showTopMovies: true,
            topMoviesSource: currentSource,
          }),
        ),
      });
    });

    await authenticatedPage.goto("/");

    const rssButton = authenticatedPage.getByRole("button", { name: "Open RSS feed link" });
    await expect(rssButton).toBeVisible();
    await expect(rssButton).toBeEnabled();

    await authenticatedPage.getByRole("combobox").click();
    await authenticatedPage.getByRole("option", { name: "Trending movies from YTS" }).click();

    await ytsRequestSeen;
    await expect(rssButton).toBeVisible();
    await expect(rssButton).toBeDisabled();

    releaseYtsResponse?.();

    await expect(authenticatedPage.getByText("The Raid")).toBeVisible({ timeout: 2000 });
    await expect(rssButton).toBeEnabled();
  });

  test("changing source only refetches top movies once after save", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let currentSource = TopMoviesSource.IMDB_MOVIEMETER;
    let topMoviesRequests = 0;

    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showTopMovies: true,
          topMoviesSource: TopMoviesSource.IMDB_MOVIEMETER,
        }),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/GetTopMovies", async (route) => {
      topMoviesRequests += 1;

      const response =
        currentSource === TopMoviesSource.YTS
          ? topMoviesResponseForSource(TopMoviesSource.YTS, ytsMovies)
          : topMoviesResponseForSource(TopMoviesSource.IMDB_MOVIEMETER, movies);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: { topMoviesSource?: string | number };
      };

      const nextSource = String(body.settings?.topMoviesSource ?? "");
      if (nextSource.includes("YTS") || nextSource === String(TopMoviesSource.YTS)) {
        currentSource = TopMoviesSource.YTS;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          userSettings({
            showTopMovies: true,
            topMoviesSource: currentSource,
          }),
        ),
      });
    });

    await authenticatedPage.goto("/");
    await expect(authenticatedPage.getByText("Inception")).toBeVisible();
    await expect.poll(() => topMoviesRequests).toBe(1);

    await authenticatedPage.getByRole("combobox").click();
    await authenticatedPage.getByRole("option", { name: "Trending movies from YTS" }).click();

    await expect(authenticatedPage.getByText("The Raid")).toBeVisible({ timeout: 2000 });
    await expect.poll(() => topMoviesRequests).toBe(2);
  });

  test("waits for real settings before fetching top movies from cached settings", async ({
    authenticatedPage,
  }) => {
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
        showPrettyNamesForTopMovies: true,
        showTopMovies: true,
        sortBy: 2,
        sortDirection: 2,
        topMoviesDisplayType: 1,
        topMoviesSource: TopMoviesSource.IMDB_MOVIEMETER,
      }),
    );

    let releaseSettingsResponse: (() => void) | undefined;
    let topMoviesRequests = 0;

    await authenticatedPage.route("**/chill.v4.UserService/GetUserSettings", async (route) => {
      await new Promise<void>((resolve) => {
        releaseSettingsResponse = resolve;
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          userSettings({
            showTopMovies: true,
            topMoviesSource: TopMoviesSource.IMDB_MOVIEMETER,
          }),
        ),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/GetTopMovies", async (route) => {
      topMoviesRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(topMoviesResponse(movies)),
      });
    });

    await authenticatedPage.goto("/");

    await expect.poll(() => topMoviesRequests, { timeout: 300 }).toBe(0);

    releaseSettingsResponse?.();

    await expect(authenticatedPage.getByText("Inception")).toBeVisible({ timeout: 2000 });
    await expect.poll(() => topMoviesRequests).toBe(1);
  });

  test("enabling top movies hides the stale empty state while retrying", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let showTopMoviesEnabled = false;
    let releaseSaveSettingsResponse: (() => void) | undefined;
    let resolveSaveRequestSeen: (() => void) | undefined;
    const saveRequestSeen = new Promise<void>((resolve) => {
      resolveSaveRequestSeen = resolve;
    });
    let topMoviesRequests = 0;

    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({
          showTopMovies: false,
          topMoviesSource: TopMoviesSource.IMDB_MOVIEMETER,
        }),
      }),
    );

    await authenticatedPage.route("**/chill.v4.UserService/GetTopMovies", async (route) => {
      topMoviesRequests += 1;
      const response = showTopMoviesEnabled ? topMoviesResponse(movies) : topMoviesResponse([]);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: { showTopMovies?: boolean | string };
      };
      resolveSaveRequestSeen?.();

      await new Promise<void>((resolve) => {
        releaseSaveSettingsResponse = () => {
          showTopMoviesEnabled =
            body.settings?.showTopMovies === true || body.settings?.showTopMovies === "true";
          resolve();
        };
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          userSettings({
            showTopMovies: showTopMoviesEnabled,
            topMoviesSource: TopMoviesSource.IMDB_MOVIEMETER,
          }),
        ),
      });
    });

    await authenticatedPage.goto("/");

    await authenticatedPage.getByRole("button", { name: "Show settings" }).click();
    await authenticatedPage
      .getByRole("switch", { name: "Show top movies in the home page" })
      .click();

    await expect(authenticatedPage.getByText("Couldn't fetch any movies")).toBeHidden();
    await expect.poll(() => topMoviesRequests).toBe(1);
    await saveRequestSeen;

    releaseSaveSettingsResponse?.();

    await expect.poll(() => topMoviesRequests).toBe(2);
    await expect(authenticatedPage.getByText("Inception")).toBeVisible({ timeout: 2000 });
  });

  test("re-enabling top movies hides the stale error while retrying", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let settingsState = userSettings({
      showTopMovies: true,
      topMoviesSource: TopMoviesSource.IMDB_MOVIEMETER,
    });
    let topMoviesRequests = 0;
    let releaseRetryResponse: (() => void) | undefined;

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

    await authenticatedPage.route("**/chill.v4.UserService/GetTopMovies", async (route) => {
      topMoviesRequests += 1;

      if (topMoviesRequests < 5) {
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
        releaseRetryResponse = resolve;
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(topMoviesResponse(movies)),
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

    await expect(authenticatedPage.getByText("indexer is down")).toBeVisible({ timeout: 5000 });

    await authenticatedPage.getByRole("button", { name: "Show settings" }).click();
    const toggle = authenticatedPage.getByRole("switch", {
      name: "Show top movies in the home page",
    });

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    await expect.poll(() => topMoviesRequests).toBe(5);
    await expect(authenticatedPage.getByText("indexer is down")).toBeHidden();

    releaseRetryResponse?.();

    await expect(authenticatedPage.getByText("Inception")).toBeVisible({ timeout: 2000 });
  });

  test("error state shows error message", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(
      homeMethods({
        GetUserSettings: userSettings({ showTopMovies: true }),
      }),
    );

    // Override GetTopMovies to return an error
    await authenticatedPage.route("**/chill.v4.UserService/GetTopMovies", async (route) => {
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
