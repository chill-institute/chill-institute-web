import { test, expect } from "./fixtures";
import { userSettings } from "./seeds";

test.describe("shell search form", () => {
  test("/ keyboard shortcut focuses search input", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showTopMovies: false }),
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
      GetUserSettings: userSettings({ showTopMovies: false }),
    });

    await authenticatedPage.goto("/");

    const searchInput = authenticatedPage.locator("#search-global");
    await searchInput.fill("test query");
    await authenticatedPage.getByRole("button", { name: "and chill" }).click();

    await authenticatedPage.waitForURL("**/search**");
    expect(authenticatedPage.url()).toContain("q=test+query");
  });

  test("empty search is not submitted", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showTopMovies: false }),
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
