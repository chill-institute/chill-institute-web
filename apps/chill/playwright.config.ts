import { defineConfig } from "@playwright/test";

// Playwright/webServer child processes force color in this environment.
// Drop NO_COLOR here so Node does not warn about the conflicting pair.
delete process.env.NO_COLOR;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : "list",
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: process.env.CI
      ? "vp preview --host 0.0.0.0 --port 3000"
      : "vp build && vp preview --host 0.0.0.0 --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: process.env.PW_REUSE_SERVER === "1",
  },
});
