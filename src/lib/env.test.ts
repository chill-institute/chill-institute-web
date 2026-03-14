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
  it("uses staging api for localhost", () => {
    withWindowLocation("http://localhost:3000/auth/success");

    expect(getPublicAPIBaseURL()).toBe("https://api.binge.institute");
  });

  it("uses staging api for pages preview deployments", () => {
    withWindowLocation("https://chore-preview-probe.web-8vr.pages.dev/");

    expect(getPublicAPIBaseURL()).toBe("https://api.binge.institute");
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
  it("resolves staging app hosts to the staging api", () => {
    expect(resolveHostedAPIBaseURL("binge.institute")).toBe("https://api.binge.institute");
    expect(resolveHostedAPIBaseURL("chore-preview-probe.web-8vr.pages.dev")).toBe(
      "https://api.binge.institute",
    );
  });

  it("resolves the production app host to the production api", () => {
    expect(resolveHostedAPIBaseURL("chill.institute")).toBe("https://api.chill.institute");
  });

  it("returns the current origin when already on the api host", () => {
    expect(resolveHostedAPIBaseURL("api.binge.institute", "https://api.binge.institute")).toBe(
      "https://api.binge.institute",
    );
  });

  it("returns null for unknown hosts", () => {
    expect(resolveHostedAPIBaseURL("custom.example")).toBeNull();
  });
});
