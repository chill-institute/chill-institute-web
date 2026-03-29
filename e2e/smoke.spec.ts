import { test, expect } from "./support/fixtures";

test.describe("smoke", () => {
  test("public sign-in route renders", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("button", { name: "authenticate at put.io" })).toBeVisible();
  });

  test("authenticated settings shell renders", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({
      GetUserSettings: {
        showMovies: true,
        showTvShows: true,
      },
      GetIndexers: {
        indexers: [
          { id: "yts", name: "YTS", enabled: true },
          { id: "rarbg", name: "RARBG", enabled: true },
        ],
      },
      GetUserProfile: {
        userId: "1",
        username: "putio-user",
        avatarUrl: "",
        email: "putio-user@example.com",
      },
      GetDownloadFolder: {
        folder: {
          id: "1",
          name: "your files",
          parentId: "0",
          isShared: false,
          isPrivate: false,
          isMp4Available: false,
          isHidden: false,
          icon: "folder",
        },
      },
    });

    await authenticatedPage.goto("/settings");

    const settingsPage = authenticatedPage.locator('[data-page="settings"]');
    await expect(settingsPage).toBeVisible();
    await expect(settingsPage.getByText("putio-user")).toBeVisible();
  });
});
