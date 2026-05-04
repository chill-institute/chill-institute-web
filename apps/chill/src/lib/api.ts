import { useMemo } from "react";

import {
  createApi,
  getPutioStartURL as getPutioStartURLForBaseUrl,
  type ChillApi,
} from "@chill-institute/api";

import { useAuth } from "./auth";
import { getPublicAPIBaseURL } from "./env";

/*
 * Thin wrapper around the shared `@chill-institute/api` client. All
 * the request/timeout/redirect-on-auth-failure plumbing lives in the
 * package; this file only injects chill's resolved API base URL and
 * the bearer token from the local AuthProvider.
 */
function buildApi(authToken: string): ChillApi {
  return createApi({
    authToken,
    baseUrl: getPublicAPIBaseURL(),
  });
}

export { buildApi as createApi };

export function useApi(): ChillApi {
  const { authToken } = useAuth();
  return useMemo(() => buildApi(authToken ?? ""), [authToken]);
}

export function getPutioStartURL(successURL?: string): string {
  return getPutioStartURLForBaseUrl(getPublicAPIBaseURL(), successURL);
}

export type { ChillApi };
