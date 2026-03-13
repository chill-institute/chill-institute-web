import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
  },
  webServer: {
    command: process.env.CI
      ? "pnpm exec vp preview --host 0.0.0.0 --port 3000"
      : "pnpm exec vp build && pnpm exec vp preview --host 0.0.0.0 --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
