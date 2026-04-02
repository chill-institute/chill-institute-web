import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getPublicAPIBaseURL } from "@/lib/env";

const HEALTHCHECK_TIMEOUT_MS = 2500;
const OUTAGE_POLL_INTERVAL_MS = 5000;

type BackendHealthContextValue = {
  isBackendUnavailable: boolean;
  retry: () => Promise<void>;
};

const BackendHealthContext = createContext<BackendHealthContextValue | null>(null);

async function checkBackendHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), HEALTHCHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`${getPublicAPIBaseURL()}/healthz`, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function BackendHealthProvider({ children }: { children: ReactNode }) {
  const [isBackendUnavailable, setIsBackendUnavailable] = useState(false);

  async function retry() {
    const isHealthy = await checkBackendHealth();
    setIsBackendUnavailable(!isHealthy);
  }

  useEffect(() => {
    void retry();
  }, []);

  useEffect(() => {
    if (!isBackendUnavailable) {
      return;
    }

    const interval = window.setInterval(() => {
      void retry();
    }, OUTAGE_POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isBackendUnavailable]);

  const value = useMemo(
    () => ({
      isBackendUnavailable,
      retry,
    }),
    [isBackendUnavailable],
  );

  return <BackendHealthContext.Provider value={value}>{children}</BackendHealthContext.Provider>;
}

export function useBackendUnavailable() {
  const context = useContext(BackendHealthContext);
  if (!context) {
    throw new Error("useBackendUnavailable must be used within BackendHealthProvider");
  }
  return context;
}
