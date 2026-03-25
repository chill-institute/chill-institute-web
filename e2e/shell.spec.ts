import { test, expect } from "./support/fixtures";
import { indexer, indexersResponse, searchResponse, userSettings } from "./support/seeds";

test.describe("shell search form", () => {
  test("/ keyboard shortcut focuses search input", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showMovies: false }),
    });

    await authenticatedPage.goto("/");

    const searchInput = authenticatedPage.locator("#search-global");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).not.toBeFocused();

    // Press "/" to focus
    await authenticatedPage.keyboard.press("/");
    await expect(searchInput).toBeFocused();

    // Press Escape to blur
    await authenticatedPage.keyboard.press("Escape");
    await expect(searchInput).not.toBeFocused();
  });

  test("search form navigates to search page with query", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showMovies: false }),
    });

    await authenticatedPage.goto("/");

    const searchInput = authenticatedPage.locator("#search-global");
    await searchInput.fill("test query");
    await authenticatedPage.getByRole("button", { name: "and chill" }).click();

    await authenticatedPage.waitForURL("**/search**");
    expect(authenticatedPage.url()).toContain("q=test+query");
  });

  test("search submit does not animate the route shell or content", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showMovies: false }),
      GetIndexers: indexersResponse([indexer()]),
      Search: searchResponse("test query", []),
    });

    await authenticatedPage.goto("/");

    await authenticatedPage.locator("#search-global").fill("test query");
    await authenticatedPage.getByRole("button", { name: "and chill" }).click();
    await authenticatedPage.waitForURL("**/search**");

    const animationName = await authenticatedPage
      .locator('[data-page="search"]')
      .evaluate((element) => getComputedStyle(element).animationName);

    expect(animationName).toBe("none");
  });

  test("empty search is not submitted", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showMovies: false }),
    });

    await authenticatedPage.goto("/");

    const searchInput = authenticatedPage.locator("#search-global");
    await expect(searchInput).toBeVisible();

    // Try submitting empty form via Enter
    await searchInput.focus();
    await authenticatedPage.keyboard.press("Enter");

    // Should still be on the home page
    expect(authenticatedPage.url()).not.toContain("/search");
  });
});
