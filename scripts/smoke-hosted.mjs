import { chromium } from "@playwright/test";

const webBaseURL = new URL(process.env.CHILL_WEB_BASE_URL ?? "https://chill.institute");
const apiBaseURL = new URL(process.env.CHILL_API_BASE_URL ?? "https://api.chill.institute");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function expectVisible(locator, message) {
  try {
    await locator.waitFor({ state: "visible", timeout: 10_000 });
  } catch (error) {
    throw new Error(`${message}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function expectVisibleAfterCloudflare(page, locator, message) {
  const deadline = Date.now() + 45_000;

  while (Date.now() < deadline) {
    try {
      await locator.waitFor({ state: "visible", timeout: 3_000 });
      return;
    } catch {
      const challengeHeading = page.getByRole("heading", { name: /just a moment/i });
      const challengeSuccess = page.getByText(/verification successful/i);

      if ((await challengeHeading.count()) > 0 || (await challengeSuccess.count()) > 0) {
        console.log("[smoke:hosted] waiting for Cloudflare verification to finish");
      }

      await page.waitForTimeout(2_000);
    }
  }

  await expectVisible(locator, message);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ baseURL: webBaseURL.toString() });

  console.log(`[smoke:hosted] checking ${webBaseURL}`);
  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
  await expectVisibleAfterCloudflare(
    page,
    page.getByRole("button", { name: "authenticate at put.io" }),
    "sign-in button did not render",
  );

  await page.goto("/settings", { waitUntil: "domcontentloaded" });
  await page.waitForURL("**/sign-in**", { timeout: 30_000 });

  console.log(`[smoke:hosted] checking auth redirect start at ${apiBaseURL}`);
  const response = await fetch(new URL("/auth/putio/start", apiBaseURL), {
    method: "GET",
    redirect: "manual",
  });

  assert(
    [301, 302, 303, 307, 308].includes(response.status),
    `expected auth start redirect, got ${response.status}`,
  );
  assert(response.headers.get("location"), "auth start response missing location header");

  console.log("[smoke:hosted] ok");
} finally {
  await browser.close();
}
