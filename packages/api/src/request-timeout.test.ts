import { describe, expect, it, vi } from "vite-plus/test";

import { withTimeoutSignal } from "./request-timeout";

describe("withTimeoutSignal", () => {
  it("aborts when the timeout elapses", () => {
    vi.useFakeTimers();

    const timed = withTimeoutSignal(undefined, 5000);

    expect(timed.signal.aborted).toBe(false);

    vi.advanceTimersByTime(5000);

    expect(timed.signal.aborted).toBe(true);
    expect(timed.didTimeout()).toBe(true);

    timed.cleanup();
    vi.useRealTimers();
  });

  it("follows the parent signal without marking a timeout", () => {
    vi.useFakeTimers();

    const parent = new AbortController();
    const timed = withTimeoutSignal(parent.signal, 5000);

    parent.abort("stale");

    expect(timed.signal.aborted).toBe(true);
    expect(timed.didTimeout()).toBe(false);

    timed.cleanup();
    vi.useRealTimers();
  });
});
