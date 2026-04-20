import { test as base, type Page, type Route } from "@playwright/test";

const AUTH_STORAGE_STATE = {
  cookies: [],
  origins: [
    {
      origin: "http://localhost:58400",
      localStorage: [{ name: "chill.auth_token", value: "test-token" }],
    },
  ],
};

type MockRpcMethods = Record<string, unknown>;

type MockRpc = (methods: MockRpcMethods) => Promise<void>;

const SERVICE_PATTERN = /chill\.v4\.UserService\//;

function methodFromUrl(url: string): string | undefined {
  const match = url.match(/chill\.v4\.UserService\/(\w+)/);
  return match?.[1];
}

async function createMockRpc(page: Page): Promise<MockRpc> {
  return async (methods: MockRpcMethods) => {
    await page.route(SERVICE_PATTERN, async (route: Route) => {
      const method = methodFromUrl(route.request().url());
      if (method && method in methods) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(methods[method]),
        });
        return;
      }
      // Return empty proto JSON for any unmocked method to avoid
      // hitting the real server and triggering auth redirects.
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    });
  };
}

export const test = base.extend<{
  authenticatedPage: Page;
  mockRpc: MockRpc;
}>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: AUTH_STORAGE_STATE,
    });
    const page = await context.newPage();
    await page.route("**/healthz", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "ok" }),
      });
    });
    await use(page);
    await context.close();
  },
  mockRpc: async ({ authenticatedPage }, use) => {
    const mock = await createMockRpc(authenticatedPage);
    await use(mock);
  },
});

export { expect } from "@playwright/test";
