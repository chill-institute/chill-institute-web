import { test, expect } from "./fixtures";
import { topMovie, topMoviesResponse, userSettings } from "./seeds";
import { TopMoviesDisplayType } from "@chill-institute/contracts/chill/v4/api_pb";

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
