import { ConnectError, Code } from "@connectrpc/connect";
import { describe, expect, it } from "vite-plus/test";

import { isIgnorableAbortError } from "./errors";

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
