import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { getPublicAPIBaseURL } from "./env";
import { resolveHostedAPIBaseURL } from "./api-origin";

function withWindowLocation(url: string) {
  vi.stubGlobal("window", {
    location: new URL(url),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getPublicAPIBaseURL", () => {
  it("uses production api for localhost", () => {
    withWindowLocation("http://localhost:3000/auth/success");

    expect(getPublicAPIBaseURL()).toBe("https://api.chill.institute");
  });

  it("uses production api for pages preview deployments", () => {
    withWindowLocation("https://chore-preview-probe.chill-institute.pages.dev/");

    expect(getPublicAPIBaseURL()).toBe("https://api.chill.institute");
  });

  it("uses production api for the production app host", () => {
    withWindowLocation("https://chill.institute/");

    expect(getPublicAPIBaseURL()).toBe("https://api.chill.institute");
  });

  it("falls back to the current origin for unknown hosts", () => {
    withWindowLocation("https://custom.example/");

    expect(getPublicAPIBaseURL()).toBe("https://custom.example");
  });
});

describe("resolveHostedAPIBaseURL", () => {
  it("resolves localhost, previews, and app hosts to the production api", () => {
    expect(resolveHostedAPIBaseURL("localhost")).toBe("https://api.chill.institute");
    expect(resolveHostedAPIBaseURL("chore-preview-probe.chill-institute.pages.dev")).toBe(
      "https://api.chill.institute",
    );
    expect(resolveHostedAPIBaseURL("chill.institute")).toBe("https://api.chill.institute");
  });

  it("returns the current origin when already on the api host", () => {
    expect(resolveHostedAPIBaseURL("api.chill.institute", "https://api.chill.institute")).toBe(
      "https://api.chill.institute",
    );
  });

  it("keeps chill staging host mapping app-specific", () => {
    expect(resolveHostedAPIBaseURL("staging.chill.institute")).toBe(
      "https://staging-api.chill.institute",
    );
    expect(resolveHostedAPIBaseURL("staging.binge.institute")).toBeNull();
  });

  it("returns null for unknown hosts", () => {
    expect(resolveHostedAPIBaseURL("custom.example")).toBeNull();
  });
});
