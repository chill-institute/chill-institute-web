import { test, expect } from "./support/fixtures";
import { userSettings } from "./support/seeds";

test.describe("crash report fallback", () => {
  test("local crash fallback lets the user copy a report", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showMovies: false }),
    });

    await authenticatedPage.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            (window as Window & { __copiedReport?: string }).__copiedReport = value;
          },
        },
      });
    });

    await authenticatedPage.goto("/debug/crash");

    await expect(
      authenticatedPage.getByRole("heading", { name: "Something went wrong." }),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("Nothing is sent anywhere unless you choose to copy the report."),
    ).toBeVisible();

    await authenticatedPage.getByLabel("What were you doing?").fill("I opened the home page.");
    await authenticatedPage.getByRole("button", { name: "copy report" }).click();

    const copiedReport = await authenticatedPage.evaluate(
      () => (window as Window & { __copiedReport?: string }).__copiedReport ?? "",
    );

    expect(copiedReport).toContain('"routePath": "/debug/crash"');
    expect(copiedReport).toContain(
      '"message": "Intentional debug crash for the local error fallback."',
    );
    expect(copiedReport).toContain('"notes": "I opened the home page."');
  });

  test("local crash fallback prefills a GitHub bug report", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc({
      GetUserSettings: userSettings({ showMovies: false }),
    });

    await authenticatedPage.goto("/debug/crash");

    const issueLink = authenticatedPage.getByRole("link", { name: "create GitHub issue" });
    await expect(issueLink).toBeVisible();

    const href = await issueLink.getAttribute("href");
    expect(href).toBeTruthy();

    const url = new URL(href!);
    expect(url.origin + url.pathname).toBe(
      "https://github.com/chill-institute/chill-institute-web/issues/new",
    );
    expect(url.searchParams.get("template")).toBe("bug_report.md");
    expect(url.searchParams.get("title")).toContain("[bug] Crash on /debug/crash");
    expect(url.searchParams.get("body")).toContain("## Crash report");
    expect(url.searchParams.get("body")).toContain(
      "Intentional debug crash for the local error fallback.",
    );
  });
});
