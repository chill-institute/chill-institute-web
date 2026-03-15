import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { normalizeCallbackPath } from "./auth";

function withWindowLocation(url: string) {
  vi.stubGlobal("window", {
    location: new URL(url),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("normalizeCallbackPath", () => {
  it("keeps same-origin callback paths", () => {
    withWindowLocation("https://chill.institute/sign-in");

    expect(normalizeCallbackPath("/search?q=matrix#top")).toBe("/search?q=matrix#top");
  });

  it("rejects external origins", () => {
    withWindowLocation("https://chill.institute/sign-in");

    expect(normalizeCallbackPath("https://example.com/search")).toBeNull();
  });

  it("rejects auth routes", () => {
    withWindowLocation("https://chill.institute/sign-in");

    expect(normalizeCallbackPath("/sign-in")).toBeNull();
    expect(normalizeCallbackPath("/sign-out")).toBeNull();
    expect(normalizeCallbackPath("/auth/success")).toBeNull();
  });
});
