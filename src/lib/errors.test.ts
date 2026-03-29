import { ConnectError, Code } from "@connectrpc/connect";
import { describe, expect, it } from "vite-plus/test";

import {
  isBackendUnavailableError,
  isIgnorableAbortError,
  isPutioProviderUnavailableError,
  shouldRetryQueryError,
  toErrorMessage,
} from "./errors";

describe("isIgnorableAbortError", () => {
  it("treats connect cancellation as ignorable", () => {
    expect(isIgnorableAbortError(new ConnectError("canceled", Code.Canceled))).toBe(true);
  });

  it("treats DOM abort errors as ignorable", () => {
    expect(isIgnorableAbortError(new DOMException("aborted", "AbortError"))).toBe(true);
  });

  it("does not hide normal errors", () => {
    expect(isIgnorableAbortError(new Error("provider unavailable"))).toBe(false);
  });
});

describe("isPutioProviderUnavailableError", () => {
  it("detects put.io provider outages from connect errors", () => {
    expect(
      isPutioProviderUnavailableError(new ConnectError("putio provider unavailable", Code.Unknown)),
    ).toBe(true);
  });

  it("ignores unrelated provider errors", () => {
    expect(isPutioProviderUnavailableError(new Error("provider invalid payload"))).toBe(false);
  });
});

describe("isBackendUnavailableError", () => {
  it("treats connect unavailable as backend downtime", () => {
    expect(isBackendUnavailableError(new ConnectError("unavailable", Code.Unavailable))).toBe(true);
  });

  it("treats network fetch failures as backend downtime", () => {
    expect(isBackendUnavailableError(new Error("Failed to fetch"))).toBe(true);
  });

  it("treats put.io provider outages as recoverable downtime", () => {
    expect(isBackendUnavailableError(new Error("putio provider unavailable"))).toBe(true);
  });

  it("does not classify normal provider payload errors as downtime", () => {
    expect(isBackendUnavailableError(new Error("provider invalid payload"))).toBe(false);
  });
});

describe("toErrorMessage", () => {
  it("prefers the put.io-specific recovery message", () => {
    expect(toErrorMessage(new Error("putio provider unavailable"))).toBe(
      "Could not connect to put.io. Please try again or sign in again.",
    );
  });
});

describe("shouldRetryQueryError", () => {
  it("allows a single retry before outage mode is active", () => {
    expect(shouldRetryQueryError(0, new ConnectError("unavailable", Code.Unavailable))).toBe(true);
    expect(shouldRetryQueryError(1, new ConnectError("unavailable", Code.Unavailable))).toBe(false);
  });

  it("does not retry after the single allowed attempt", () => {
    expect(shouldRetryQueryError(2, new ConnectError("unavailable", Code.Unavailable))).toBe(false);
  });

  it("does not retry non-transient errors", () => {
    expect(shouldRetryQueryError(0, new Error("provider invalid payload"))).toBe(false);
  });
});
