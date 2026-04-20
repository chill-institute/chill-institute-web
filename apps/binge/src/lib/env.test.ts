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

const originalEnv = import.meta.env.VITE_PUBLIC_API_BASE_URL;

describe("getPublicAPIBaseURL", () => {
  afterEach(() => {
    vi.stubEnv("VITE_PUBLIC_API_BASE_URL", originalEnv);
  });

  it("uses production api for localhost", () => {
    withWindowLocation("http://localhost:58400/auth/success");

    expect(getPublicAPIBaseURL()).toBe("https://api.chill.institute");
  });

  it("prefers an explicit api override on localhost", () => {
    vi.stubEnv("VITE_PUBLIC_API_BASE_URL", "http://localhost:58780");
    withWindowLocation("http://localhost:58400/auth/success");

    expect(getPublicAPIBaseURL()).toBe("http://localhost:58780");
  });

  it("uses production api for pages preview deployments", () => {
    withWindowLocation("https://chore-preview-probe.binge-institute.pages.dev/");

    expect(getPublicAPIBaseURL()).toBe("https://api.chill.institute");
  });

  it("uses production api for the production app host", () => {
    withWindowLocation("https://binge.institute/");

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
    expect(resolveHostedAPIBaseURL("chore-preview-probe.binge-institute.pages.dev")).toBe(
      "https://api.chill.institute",
    );
    expect(resolveHostedAPIBaseURL("binge.institute")).toBe("https://api.chill.institute");
  });

  it("returns the current origin when already on the api host", () => {
    expect(resolveHostedAPIBaseURL("api.chill.institute", "https://api.chill.institute")).toBe(
      "https://api.chill.institute",
    );
  });

  it("keeps binge staging host mapping app-specific", () => {
    expect(resolveHostedAPIBaseURL("staging.binge.institute")).toBe(
      "https://staging-api.chill.institute",
    );
    expect(resolveHostedAPIBaseURL("staging.chill.institute")).toBeNull();
  });

  it("returns null for unknown hosts", () => {
    expect(resolveHostedAPIBaseURL("custom.example")).toBeNull();
  });
});
