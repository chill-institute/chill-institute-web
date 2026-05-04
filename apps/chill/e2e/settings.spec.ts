import type { Page } from "@playwright/test";
import { test, expect } from "./support/fixtures";
import {
  downloadFolderResponse,
  folderResponse,
  indexer,
  indexersResponse,
  userSettings,
  userFile,
} from "./support/seeds";

const profileResponse = {
  userId: "1",
  username: "putio-user",
  avatarUrl: "",
  email: "putio-user@example.com",
};

type RequestSettingsPayload = Record<string, unknown> & {
  downloadFolderId?: string | number;
  disabledIndexerIds?: string[];
  searchResultDisplayBehavior?: number;
  filterNastyResults?: boolean;
  filterResultsWithNoSeeders?: boolean;
  rememberQuickFilters?: boolean;
};

const baseSettingsMethods = (overrides?: Record<string, unknown>) => ({
  GetUserSettings: userSettings(),
  GetIndexers: indexersResponse([
    indexer({ id: "yts", name: "YTS" }),
    indexer({ id: "rarbg", name: "RARBG" }),
  ]),
  GetUserProfile: profileResponse,
  GetDownloadFolder: downloadFolderResponse(userFile({ id: 1n, name: "your files" })),
  ...overrides,
});

function settingsPage(page: Page) {
  return page.locator('[data-page="settings"]');
}

test.describe("settings", () => {
  test("folder picker loads via GetFolder and saves selected folder id", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let settingsState = userSettings({ downloadFolderId: 1n });
    let selectedFolderID = "1";
    let savedDownloadFolderID = "";
    const folderRequests: string[] = [];

    const root = userFile({ id: 1n, name: "your files" });
    const movies = userFile({ id: 10n, name: "Movies" });
    const anime = userFile({ id: 11n, name: "Anime" });
    const folderByID = new Map<string, ReturnType<typeof userFile>>([
      ["1", root],
      ["10", movies],
      ["11", anime],
    ]);
    const folderResponseByID = new Map<string, unknown>([
      ["1", folderResponse(root, [movies])],
      ["10", folderResponse(movies, [anime])],
      ["11", folderResponse(anime, [])],
    ]);

    await mockRpc(baseSettingsMethods({ GetUserSettings: settingsState }));

    await authenticatedPage.route("**/chill.v4.UserService/GetUserSettings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/GetDownloadFolder", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(downloadFolderResponse(folderByID.get(selectedFolderID) ?? root)),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/GetFolder", async (route) => {
      const body = route.request().postDataJSON() as { id?: string | number };
      const folderID = String(body.id ?? "");
      folderRequests.push(folderID);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(folderResponseByID.get(folderID) ?? folderResponse(root, [])),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: RequestSettingsPayload;
      };
      if (body.settings?.downloadFolderId !== undefined) {
        savedDownloadFolderID = String(body.settings.downloadFolderId);
        selectedFolderID = savedDownloadFolderID;
      }
      if (body.settings) {
        settingsState = body.settings as typeof settingsState;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.goto("/settings");
    await authenticatedPage.getByRole("button", { name: "change" }).click();
    await authenticatedPage.getByRole("button", { name: "Movies" }).click();
    await authenticatedPage.getByRole("button", { name: "download here" }).click();

    expect(folderRequests).toContain("1");
    expect(folderRequests).toContain("10");
    await expect.poll(() => savedDownloadFolderID).toBe("10");
  });

  test("changing download folder does not keep showing the stale saved folder name", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let settingsState = userSettings({ downloadFolderId: 1n });
    let selectedFolderID = "1";

    const root = userFile({ id: 1n, name: "your files" });
    const movies = userFile({ id: 10n, name: "Movies" });
    const folderByID = new Map<string, ReturnType<typeof userFile>>([
      ["1", root],
      ["10", movies],
    ]);
    const folderResponseByID = new Map<string, unknown>([
      ["1", folderResponse(root, [movies])],
      ["10", folderResponse(movies, [])],
    ]);

    await mockRpc(baseSettingsMethods({ GetUserSettings: settingsState }));

    await authenticatedPage.route("**/chill.v4.UserService/GetUserSettings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/GetDownloadFolder", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(downloadFolderResponse(folderByID.get(selectedFolderID) ?? root)),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/GetFolder", async (route) => {
      const body = route.request().postDataJSON() as { id?: string | number };
      const folderID = String(body.id ?? "");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(folderResponseByID.get(folderID) ?? folderResponse(root, [])),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      const body = route.request().postDataJSON() as {
        settings?: RequestSettingsPayload;
      };
      if (body.settings?.downloadFolderId !== undefined) {
        settingsState = body.settings as typeof settingsState;
        selectedFolderID = String(body.settings.downloadFolderId);
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.goto("/settings");
    const visibleFolderName = settingsPage(authenticatedPage).getByText("your files");
    await expect(visibleFolderName).toBeVisible();

    await authenticatedPage.getByRole("button", { name: "change" }).click();
    await authenticatedPage.getByRole("button", { name: "Movies" }).click();
    await authenticatedPage.getByRole("button", { name: "download here" }).click();

    await expect(visibleFolderName).toBeHidden({ timeout: 400 });
    await expect(settingsPage(authenticatedPage).getByText("Movies")).toBeVisible({
      timeout: 2000,
    });
  });

  test("download folder picker reopens at the saved folder after closing without saving", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    const root = userFile({ id: 1n, name: "your files" });
    const movies = userFile({ id: 10n, name: "Movies" });
    const anime = userFile({ id: 11n, name: "Anime" });
    const folderResponseByID = new Map<string, unknown>([
      ["1", folderResponse(root, [movies])],
      ["10", folderResponse(movies, [anime])],
      ["11", folderResponse(anime, [])],
    ]);

    await mockRpc(baseSettingsMethods());

    await authenticatedPage.route("**/chill.v4.UserService/GetFolder", async (route) => {
      const body = route.request().postDataJSON() as { id?: string | number };
      const folderID = String(body.id ?? "");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(folderResponseByID.get(folderID) ?? folderResponse(root, [])),
      });
    });

    await authenticatedPage.goto("/settings");

    await authenticatedPage.getByRole("button", { name: "change" }).click();
    await expect(authenticatedPage.getByTitle("your files")).toBeVisible();
    await authenticatedPage.getByRole("button", { name: "Movies" }).click();
    await expect(authenticatedPage.getByText("Anime")).toBeVisible();

    await authenticatedPage.getByLabel("Close").click();
    await authenticatedPage.getByRole("button", { name: "change" }).click();

    await expect(authenticatedPage.getByTitle("your files")).toBeVisible();
    await expect(authenticatedPage.getByRole("button", { name: "Movies" })).toBeVisible();
  });

  test("download folder errors show a real error message", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc(baseSettingsMethods());

    await authenticatedPage.route("**/chill.v4.UserService/GetDownloadFolder", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await authenticatedPage.goto("/settings");

    await expect(
      settingsPage(authenticatedPage)
        .getByRole("alert")
        .filter({ hasText: "Service temporarily unavailable. Please try again shortly." }),
    ).toBeVisible({ timeout: 5000 });
  });

  test("put.io provider errors show retry and sign-in actions", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc(baseSettingsMethods());

    await authenticatedPage.route("**/chill.v4.UserService/GetDownloadFolder", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          code: "unavailable",
          message: "putio provider unavailable",
        }),
      });
    });

    await authenticatedPage.goto("/settings");

    const alert = settingsPage(authenticatedPage)
      .getByRole("alert")
      .filter({ hasText: "Could not connect to put.io. Please try again." });

    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert.getByRole("button", { name: "retry" })).toBeVisible();
    await expect(alert.getByRole("button", { name: "sign in again" })).toBeVisible();
  });

  test("shows username from profile", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(baseSettingsMethods());
    await authenticatedPage.goto("/settings");

    await expect(settingsPage(authenticatedPage).getByText("putio-user")).toBeVisible({
      timeout: 5000,
    });
  });

  test("sign-out link navigates to sign-out page", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(baseSettingsMethods());
    await authenticatedPage.goto("/settings");

    await expect(
      settingsPage(authenticatedPage).getByRole("heading", { name: "Signed in as" }),
    ).toBeVisible();

    const signOutLink = settingsPage(authenticatedPage).getByRole("link", { name: "sign out" });
    await expect(signOutLink).toBeVisible();
    await signOutLink.click();

    await authenticatedPage.waitForURL("**/sign-in**");
    expect(authenticatedPage.url()).toContain("/sign-in");
  });

  test("toggling indexer checkbox saves disabled indexer ids", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let settingsState = userSettings();
    let savedDisabledIds: string[] = [];
    let saveCalls = 0;

    await mockRpc(baseSettingsMethods({ GetUserSettings: settingsState }));

    await authenticatedPage.route("**/chill.v4.UserService/GetUserSettings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      saveCalls += 1;
      const body = route.request().postDataJSON() as {
        settings?: RequestSettingsPayload;
      };
      if (body.settings) {
        settingsState = body.settings as typeof settingsState;
        savedDisabledIds = body.settings.disabledIndexerIds ?? [];
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.goto("/settings");

    const ytsLabel = settingsPage(authenticatedPage).locator("label").filter({ hasText: "YTS" });
    await expect(ytsLabel).toBeVisible({ timeout: 5000 });
    await ytsLabel.click();

    await expect.poll(() => saveCalls).toBeGreaterThan(0);
    await expect.poll(() => savedDisabledIds).toContain("yts");
  });

  test("search settings toggles persist", async ({ authenticatedPage, mockRpc }) => {
    let settingsState = userSettings({
      filterNastyResults: true,
      filterResultsWithNoSeeders: false,
    });
    let savedFilterNasty: boolean | undefined;
    let savedFilterNoSeeders: boolean | undefined;
    let saveCalls = 0;

    await mockRpc(baseSettingsMethods({ GetUserSettings: settingsState }));

    await authenticatedPage.route("**/chill.v4.UserService/GetUserSettings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.route("**/chill.v4.UserService/SaveUserSettings", async (route) => {
      saveCalls += 1;
      const body = route.request().postDataJSON() as {
        settings?: RequestSettingsPayload;
      };
      if (body.settings) {
        settingsState = body.settings as typeof settingsState;
        savedFilterNasty = body.settings.filterNastyResults;
        savedFilterNoSeeders = body.settings.filterResultsWithNoSeeders;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.goto("/settings");

    const nastyRow = settingsPage(authenticatedPage)
      .locator(".flex.items-center.justify-between")
      .filter({ hasText: "Try to filter out nasty stuff" });
    const nastySwitch = nastyRow.getByRole("switch");
    await expect(nastySwitch).toHaveAttribute("aria-checked", "true", { timeout: 5000 });

    await nastySwitch.click();
    await expect.poll(() => saveCalls).toBeGreaterThan(0);
    await expect.poll(() => savedFilterNasty).not.toBe(true);

    const noSeedersRow = settingsPage(authenticatedPage)
      .locator(".flex.items-center.justify-between")
      .filter({ hasText: "Hide results with no seeders" });
    const noSeedersSwitch = noSeedersRow.getByRole("switch");
    await expect(noSeedersSwitch).toHaveAttribute("aria-checked", "false");

    const prevCalls = saveCalls;
    await noSeedersSwitch.click();
    await expect.poll(() => saveCalls).toBeGreaterThan(prevCalls);
    await expect.poll(() => savedFilterNoSeeders).toBe(true);
  });

  test("theme select changes document theme", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(baseSettingsMethods());
    await authenticatedPage.goto("/settings");

    await expect(settingsPage(authenticatedPage).getByText("putio-user")).toBeVisible({
      timeout: 5000,
    });

    const firstSelect = settingsPage(authenticatedPage).locator("select").first();
    await firstSelect.evaluate((el: HTMLSelectElement) => {
      el.value = "dark";
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(authenticatedPage.locator("html")).toHaveClass(/dark/);

    await firstSelect.evaluate((el: HTMLSelectElement) => {
      el.value = "light";
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(authenticatedPage.locator("html")).not.toHaveClass(/dark/);
  });

  test("redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("**/sign-in**");
    expect(page.url()).toContain("/sign-in");
  });
});
