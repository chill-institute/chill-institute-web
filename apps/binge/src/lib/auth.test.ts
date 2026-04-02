import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { normalizeCallbackPath, readAuthTokenFromLocation, storePendingCallbackURL } from "./auth";

function createSessionStorage() {
  const storage = new Map<string, string>();

  return {
    getItem(key: string) {
      return storage.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    },
    removeItem(key: string) {
      storage.delete(key);
    },
  };
}

function withWindowLocation(url: string) {
  vi.stubGlobal("window", {
    location: new URL(url),
    sessionStorage: createSessionStorage(),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("normalizeCallbackPath", () => {
  it("keeps same-origin callback paths", () => {
    withWindowLocation("https://binge.institute/sign-in");

    expect(normalizeCallbackPath("/settings#top")).toBe("/settings#top");
  });

  it("rejects external origins", () => {
    withWindowLocation("https://binge.institute/sign-in");

    expect(normalizeCallbackPath("https://example.com/search")).toBeNull();
  });

  it("rejects auth routes", () => {
    withWindowLocation("https://binge.institute/sign-in");

    expect(normalizeCallbackPath("/sign-in")).toBeNull();
    expect(normalizeCallbackPath("/sign-out")).toBeNull();
    expect(normalizeCallbackPath("/auth/success")).toBeNull();
  });
});

describe("storePendingCallbackURL", () => {
  it("stores normalized same-origin callbacks", () => {
    withWindowLocation("https://binge.institute/settings");

    storePendingCallbackURL("/settings#top");

    expect(window.sessionStorage.getItem("chill.auth_callback")).toBe("/settings#top");
  });

  it("does not store rejected callback paths", () => {
    withWindowLocation("https://binge.institute/settings");

    storePendingCallbackURL("/sign-in");

    expect(window.sessionStorage.getItem("chill.auth_callback")).toBeNull();
  });

  it("clears stale callback values when the next callback is rejected", () => {
    withWindowLocation("https://binge.institute/settings");
    window.sessionStorage.setItem("chill.auth_callback", "/settings");

    storePendingCallbackURL("/sign-in");

    expect(window.sessionStorage.getItem("chill.auth_callback")).toBeNull();
  });
});

describe("readAuthTokenFromLocation", () => {
  it("prefers the auth token from the fragment", () => {
    expect(
      readAuthTokenFromLocation({
        hash: "#auth_token=fragment-token",
        search: "?auth_token=query-token",
      }),
    ).toBe("fragment-token");
  });

  it("falls back to the auth token from the query string", () => {
    expect(
      readAuthTokenFromLocation({
        hash: "",
        search: "?auth_token=query-token",
      }),
    ).toBe("query-token");
  });

  it("returns an empty string when no auth token is present", () => {
    expect(
      readAuthTokenFromLocation({
        hash: "#foo=bar",
        search: "?baz=qux",
      }),
    ).toBe("");
  });
});
