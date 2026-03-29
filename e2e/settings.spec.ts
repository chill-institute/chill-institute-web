import { test, expect } from "./support/fixtures";
import { MoviesSource } from "@chill-institute/contracts/chill/v4/api_pb";
import {
  downloadFolderResponse,
  folderResponse,
  indexer,
  indexersResponse,
  movie,
  moviesResponseForSource,
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
  showMovies?: boolean;
  showTvShows?: boolean;
  downloadFolderId?: string | number;
  disabledIndexerIds?: string[];
  searchResultDisplayBehavior?: number;
  filterNastyResults?: boolean;
  filterResultsWithNoSeeders?: boolean;
  rememberQuickFilters?: boolean;
};

const baseSettingsMethods = (overrides?: Record<string, unknown>) => ({
  GetUserSettings: userSettings({ showMovies: true }),
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
      GetUserSettings: userSettings({
        showMovies: true,
        moviesSource: MoviesSource.TRAKT,
      }),
      GetMovies: moviesResponseForSource(MoviesSource.TRAKT, [
        movie({
          id: "m1",
          title: "Inception",
          titlePretty: "Inception",
          link: "magnet:?xt=urn:btih:inception",
          source: MoviesSource.TRAKT,
        }),
      ]),
    });

    await authenticatedPage.goto("/");
    await authenticatedPage.getByRole("button", { name: "Open RSS feed link" }).click();

    await expect(authenticatedPage.getByRole("dialog").getByRole("textbox")).toHaveValue(
      "https://api.chill.institute/rss/movies/trakt?auth_token=test-token",
    );
  });

  test("settings edits persist via SaveUserSettings", async ({ authenticatedPage, mockRpc }) => {
    let settingsState = userSettings({ showMovies: true });
    let savedShowMovies: boolean | undefined;
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
        savedShowMovies = body.settings.showMovies ?? false;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.goto("/settings");

    const showMoviesSwitch = authenticatedPage.getByRole("switch", {
      name: "Show movies in the home page",
    });
    await expect(showMoviesSwitch).toHaveAttribute("aria-checked", "true");

    await showMoviesSwitch.click();

    await expect.poll(() => saveCalls).toBeGreaterThan(0);
    await expect.poll(() => savedShowMovies).toBe(false);
    await expect(showMoviesSwitch).toHaveAttribute("aria-checked", "false");
  });

  test("tv shows visibility persists via SaveUserSettings", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let settingsState = userSettings({ showMovies: true, showTvShows: true });
    let savedShowTvShows: boolean | undefined;
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
        savedShowTvShows = body.settings.showTvShows ?? false;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsState),
      });
    });

    await authenticatedPage.goto("/settings");

    const showTVShowsSwitch = authenticatedPage.getByRole("switch", {
      name: "Show TV shows in the home page",
    });
    await expect(showTVShowsSwitch).toHaveAttribute("aria-checked", "true");

    await showTVShowsSwitch.click();

    await expect.poll(() => saveCalls).toBeGreaterThan(0);
    await expect.poll(() => savedShowTvShows).toBe(false);
    await expect(showTVShowsSwitch).toHaveAttribute("aria-checked", "false");
  });

  test("folder picker loads via GetFolder and saves selected folder id", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    let settingsState = userSettings({ showMovies: true, downloadFolderId: 1n });
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
    let settingsState = userSettings({ showMovies: true, downloadFolderId: 1n });
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
    const visibleFolderName = authenticatedPage.getByText("your files").last();
    await expect(visibleFolderName).toBeVisible();

    await authenticatedPage.getByRole("button", { name: "change" }).click();
    await authenticatedPage.getByRole("button", { name: "Movies" }).click();
    await authenticatedPage.getByRole("button", { name: "download here" }).click();

    await expect(visibleFolderName).toBeHidden({ timeout: 400 });
    await expect(authenticatedPage.getByText("Movies").last()).toBeVisible({ timeout: 2000 });
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
      authenticatedPage
        .getByRole("alert")
        .filter({ hasText: "Service temporarily unavailable. Please try again shortly." })
        .last(),
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

    const alert = authenticatedPage
      .getByRole("alert")
      .filter({ hasText: "Could not connect to put.io. Please try again." })
      .last();

    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert.getByRole("button", { name: "retry" })).toBeVisible();
    await expect(alert.getByRole("button", { name: "sign in again" })).toBeVisible();
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
    let settingsState = userSettings({ showMovies: true });
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
      showMovies: true,
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
