import { Code, ConnectError } from "@connectrpc/connect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { isAuthFailure, redirectToSignInOnAuthFailure } from "./auth-failure";

describe("isAuthFailure", () => {
  it("returns true for ConnectError with Unauthenticated code", () => {
    expect(isAuthFailure(new ConnectError("nope", Code.Unauthenticated))).toBe(true);
  });

  it("returns true for ConnectError with PermissionDenied code", () => {
    expect(isAuthFailure(new ConnectError("nope", Code.PermissionDenied))).toBe(true);
  });

  it("returns true for ConnectError carrying a legacy auth message", () => {
    expect(isAuthFailure(new ConnectError("invalid auth token", Code.Internal))).toBe(true);
    expect(isAuthFailure(new ConnectError("Missing API key or auth token", Code.Internal))).toBe(
      true,
    );
    expect(isAuthFailure(new ConnectError("Unauthorized", Code.Internal))).toBe(true);
    expect(isAuthFailure(new ConnectError("HTTP 401", Code.Internal))).toBe(true);
  });

  it("returns true for plain Error carrying a legacy auth message", () => {
    expect(isAuthFailure(new Error("missing credentials"))).toBe(true);
    expect(isAuthFailure(new Error("INVALID AUTH TOKEN"))).toBe(true);
  });

  it("returns false for non-auth ConnectError codes without legacy markers", () => {
    expect(isAuthFailure(new ConnectError("boom", Code.Internal))).toBe(false);
    expect(isAuthFailure(new ConnectError("timeout", Code.DeadlineExceeded))).toBe(false);
  });

  it("returns false for plain Error without legacy markers", () => {
    expect(isAuthFailure(new Error("network failed"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isAuthFailure(undefined)).toBe(false);
    expect(isAuthFailure(null)).toBe(false);
    expect(isAuthFailure("just a string")).toBe(false);
    expect(isAuthFailure({ code: 401 })).toBe(false);
  });
});

describe("redirectToSignInOnAuthFailure", () => {
  const localStorage = new Map<string, string>();
  const sessionStorage = new Map<string, string>();
  let replaceSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    localStorage.set("chill.auth_token", "stale-token");
    sessionStorage.clear();
    sessionStorage.set("chill.auth_callback", "/results?q=dune");
    replaceSpy = vi.fn();
    vi.stubGlobal("window", {
      location: { pathname: "/results", replace: replaceSpy },
      localStorage: {
        getItem: (k: string) => localStorage.get(k) ?? null,
        setItem: (k: string, v: string) => localStorage.set(k, v),
        removeItem: (k: string) => localStorage.delete(k),
      },
      sessionStorage: {
        getItem: (k: string) => sessionStorage.get(k) ?? null,
        setItem: (k: string, v: string) => sessionStorage.set(k, v),
        removeItem: (k: string) => sessionStorage.delete(k),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clears stored auth state and redirects on auth failure", () => {
    redirectToSignInOnAuthFailure(new ConnectError("expired", Code.Unauthenticated));

    expect(localStorage.has("chill.auth_token")).toBe(false);
    expect(sessionStorage.has("chill.auth_callback")).toBe(false);
    expect(replaceSpy).toHaveBeenCalledWith("/sign-out?error=SessionExpired");
  });

  it("is a no-op when the error is not an auth failure", () => {
    redirectToSignInOnAuthFailure(new ConnectError("boom", Code.Internal));

    expect(localStorage.has("chill.auth_token")).toBe(true);
    expect(sessionStorage.has("chill.auth_callback")).toBe(true);
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it("does not loop back when already on /sign-in or /sign-out", () => {
    vi.stubGlobal("window", {
      location: { pathname: "/sign-in", replace: replaceSpy },
      localStorage: {
        getItem: (k: string) => localStorage.get(k) ?? null,
        setItem: (k: string, v: string) => localStorage.set(k, v),
        removeItem: (k: string) => localStorage.delete(k),
      },
      sessionStorage: {
        getItem: (k: string) => sessionStorage.get(k) ?? null,
        setItem: (k: string, v: string) => sessionStorage.set(k, v),
        removeItem: (k: string) => sessionStorage.delete(k),
      },
    });

    redirectToSignInOnAuthFailure(new ConnectError("expired", Code.Unauthenticated));

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(localStorage.has("chill.auth_token")).toBe(true);
  });

  it("returns silently when window is undefined", () => {
    vi.stubGlobal("window", undefined);

    expect(() =>
      redirectToSignInOnAuthFailure(new ConnectError("expired", Code.Unauthenticated)),
    ).not.toThrow();
  });
});
