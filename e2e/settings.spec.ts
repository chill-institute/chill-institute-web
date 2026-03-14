import { test, expect } from "./fixtures";
import {
  downloadFolderResponse,
  folderResponse,
  indexer,
  indexersResponse,
  topMovie,
  topMoviesResponse,
  userSettings,
  userFile,
} from "./seeds";

const profileResponse = {
  userId: "1",
  username: "putio-user",
  avatarUrl: "",
  email: "putio-user@example.com",
};

type RequestSettingsPayload = Record<string, unknown> & {
  showTopMovies?: boolean;
  downloadFolderId?: string | number;
  disabledIndexerIds?: string[];
  searchResultDisplayBehavior?: number;
  filterNastyResults?: boolean;
  filterResultsWithNoSeeders?: boolean;
  rememberQuickFilters?: boolean;
};

const baseSettingsMethods = (overrides?: Record<string, unknown>) => ({
  GetUserSettings: userSettings({ showTopMovies: true }),
  GetIndexers: indexersResponse([
    indexer({ id: "yts", name: "YTS" }),
    indexer({ id: "rarbg", name: "RARBG" }),
  ]),
  GetUserProfile: profileResponse,
  GetDownloadFolder: downloadFolderResponse(userFile({ id: 1n, name: "your files" })),
  ...overrides,
});

test.describe("settings and rss", () => {
  test("rss popover includes auth_token in generated feed url", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showTopMovies: true }),
      GetTopMovies: topMoviesResponse([
        topMovie({
          id: "m1",
          title: "Inception",
          titlePretty: "Inception",
          link: "magnet:?xt=urn:btih:inception",
        }),
      ]),
    });

    await authenticatedPage.goto("/");
    await authenticatedPage.getByRole("button", { name: "Open RSS feed link" }).click();

    await expect(
      authenticatedPage.locator('input[readonly][value*="/rss/top-movies/"]'),
    ).toHaveValue("https://api.binge.institute/rss/top-movies/imdb/moviemeter?auth_token=test-token");
  });

  test("settings edits persist via SaveUserSettings", async ({ authenticatedPage, mockRpc }) => {
    let settingsState = userSettings({ showTopMovies: true });
    let savedShowTopMovies: boolean | undefined;
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
        savedShowTopMovies = body.settings.showTopMovies ?? false;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.goto("/settings");

    const topMoviesSection = authenticatedPage
      .locator("div")
      .filter({
        has: authenticatedPage.getByRole("heading", { name: "Top movies" }),
      })
      .first();
    const showTopMoviesSwitch = topMoviesSection.getByRole("switch").first();
    await expect(showTopMoviesSwitch).toHaveAttribute("aria-checked", "true");

    await showTopMoviesSwitch.click();

    await expect.poll(() => saveCalls).toBeGreaterThan(0);
    await expect.poll(() => savedShowTopMovies).toBe(false);
    await expect(showTopMoviesSwitch).toHaveAttribute("aria-checked", "false");
  });

  test("folder picker loads via GetFolder and saves selected folder id", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let settingsState = userSettings({ showTopMovies: true, downloadFolderId: 1n });
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

  test("shows username from profile", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(baseSettingsMethods());
    await authenticatedPage.goto("/settings");

    // SettingsPanel appears twice (route + collapsed shell menu).
    // .first() is the hidden collapsed one; .last() is the visible route one.
    await expect(authenticatedPage.getByText("putio-user").last()).toBeVisible({ timeout: 5000 });
  });

  test("sign-out link navigates to sign-out page", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(baseSettingsMethods());
    await authenticatedPage.goto("/settings");

    await expect(authenticatedPage.getByRole("heading", { name: "Signed in as" })).toBeVisible();

    const signOutLink = authenticatedPage.getByRole("link", { name: "sign out" });
    await expect(signOutLink).toBeVisible();
    await signOutLink.click();

    await authenticatedPage.waitForURL("**/sign-in**");
    expect(authenticatedPage.url()).toContain("/sign-in");
  });

  test("toggling indexer checkbox saves disabled indexer ids", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let settingsState = userSettings({ showTopMovies: true });
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

    // Wait for trackers section to load and click the YTS label.
    // Use .last() — first instance is hidden in collapsed shell menu.
    const ytsLabel = authenticatedPage.locator("label").filter({ hasText: "YTS" }).last();
    await expect(ytsLabel).toBeVisible({ timeout: 5000 });
    await ytsLabel.click();

    await expect.poll(() => saveCalls).toBeGreaterThan(0);
    await expect.poll(() => savedDisabledIds).toContain("yts");
  });

  test("search settings toggles persist", async ({ authenticatedPage, mockRpc }) => {
    let settingsState = userSettings({
      showTopMovies: true,
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

    // Find switches by their adjacent label text.
    // Use .last() — first instance is hidden in collapsed shell menu.
    const nastyRow = authenticatedPage
      .locator(".flex.items-center.justify-between")
      .filter({ hasText: "Try to filter out nasty stuff" })
      .last();
    const nastySwitch = nastyRow.getByRole("switch");
    await expect(nastySwitch).toHaveAttribute("aria-checked", "true", { timeout: 5000 });

    // Toggle it off
    await nastySwitch.click();
    await expect.poll(() => saveCalls).toBeGreaterThan(0);
    // Proto JSON omits false booleans (the proto3 default), so check it's not true
    await expect.poll(() => savedFilterNasty).not.toBe(true);

    // "Hide results with no seeders" should be off
    const noSeedersRow = authenticatedPage
      .locator(".flex.items-center.justify-between")
      .filter({ hasText: "Hide results with no seeders" })
      .last();
    const noSeedersSwitch = noSeedersRow.getByRole("switch");
    await expect(noSeedersSwitch).toHaveAttribute("aria-checked", "false");

    // Toggle it on
    const prevCalls = saveCalls;
    await noSeedersSwitch.click();
    await expect.poll(() => saveCalls).toBeGreaterThan(prevCalls);
    await expect.poll(() => savedFilterNoSeeders).toBe(true);
  });

  test("theme select changes document theme", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc(baseSettingsMethods());
    await authenticatedPage.goto("/settings");

    // Wait for settings to load (.last() — first instance is hidden in collapsed shell menu)
    await expect(authenticatedPage.getByText("putio-user").last()).toBeVisible({ timeout: 5000 });

    // NativeSelect renders a real <select>. Use evaluate to change its value
    // because headless Chromium + appearance-none can cause visibility issues.
    const firstSelect = authenticatedPage.locator("select").first();
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
