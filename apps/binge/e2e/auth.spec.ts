import { test, expect } from "./support/fixtures";

test.describe("sign-in page", () => {
  test("shows access denied error with learn more action", async ({ page }) => {
    await page.goto("/sign-in?error=AccessDenied");

    await expect(page.getByText("requires an active put.io membership")).toBeVisible();
    await expect(page.getByRole("button", { name: "learn more" })).toBeVisible();
    await expect(page.getByRole("button", { name: "try again" })).toBeVisible();
  });

  test("shows session expired error with sign in again action", async ({ page }) => {
    await page.goto("/sign-in?error=SessionExpired");

    await expect(page.getByText("Your session has expired")).toBeVisible();
    await expect(page.getByRole("button", { name: "sign in again" })).toBeVisible();
  });

  test("shows generic error for unknown error type", async ({ page }) => {
    await page.goto("/sign-in?error=SomethingWrong");

    await expect(page.getByText("An error occurred while signing you in")).toBeVisible();
    await expect(page.getByRole("button", { name: "try again" })).toBeVisible();
  });

  test("shows sign-in button when no error", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("button", { name: "authenticate at put.io" })).toBeVisible();
  });

  test("authenticated user is redirected away from sign-in", async ({
    authenticatedPage,
    mockRpc,
  }) => {
    await mockRpc({});
    await authenticatedPage.goto("/sign-in");

    await authenticatedPage.waitForURL("**/");
    expect(new URL(authenticatedPage.url()).pathname).toBe("/");
  });
});

test.describe("sign-out", () => {
  test("clears auth and redirects to sign-in", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({});
    await authenticatedPage.goto("/sign-out");

    await authenticatedPage.waitForURL("**/sign-in**");
    expect(authenticatedPage.url()).toContain("/sign-in");
  });

  test("passes error parameter through to sign-in", async ({ authenticatedPage, mockRpc }) => {
    await mockRpc({});
    await authenticatedPage.goto("/sign-out?error=SessionExpired");

    await authenticatedPage.waitForURL("**/sign-in**");
    expect(authenticatedPage.url()).toContain("error=SessionExpired");
  });
});
