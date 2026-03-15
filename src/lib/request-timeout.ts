export type TimeoutSignal = {
  cleanup: () => void;
  didTimeout: () => boolean;
  signal: AbortSignal;
};

export function withTimeoutSignal(
  parent: AbortSignal | undefined,
  timeoutMs: number,
): TimeoutSignal {
  const controller = new AbortController();
  let didTimeout = false;

  const abortFromParent = () => {
    controller.abort(parent?.reason);
  };

  if (parent?.aborted) {
    abortFromParent();
  } else if (parent) {
    parent.addEventListener("abort", abortFromParent, { once: true });
  }

  const timeout = globalThis.setTimeout(() => {
    didTimeout = true;
    controller.abort(new DOMException("Search timed out", "TimeoutError"));
  }, timeoutMs);

  return {
    signal: controller.signal,
    didTimeout: () => didTimeout,
    cleanup: () => {
      globalThis.clearTimeout(timeout);
      if (parent) {
        parent.removeEventListener("abort", abortFromParent);
      }
    },
  };
}
