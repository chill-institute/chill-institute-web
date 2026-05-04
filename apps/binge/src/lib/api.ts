import { useMemo } from "react";

import {
  createApi,
  getPutioStartURL as getPutioStartURLForBaseUrl,
  type ChillApi,
} from "@chill-institute/api";
import { CardDisplayType } from "@chill-institute/contracts/chill/v4/api_pb";

import { useAuth } from "./auth";
import { getPublicAPIBaseURL } from "./env";
import { defaultUserSettings, normalizeBingeUserSettings, type UserSettings } from "./types";

/*
 * Thin wrapper around the shared `@chill-institute/api` client. The
 * `normalizeSettings` hook plugs binge-specific defaults — catalog
 * fields (cardDisplayType / moviesSource / tvShowsSource) and the
 * legacy show* visibility flags — into the shared client's settings
 * pipeline.
 */
function withCatalogDefaults(settings: UserSettings): UserSettings {
  return normalizeBingeUserSettings({
    ...settings,
    cardDisplayType:
      settings.cardDisplayType === CardDisplayType.UNSPECIFIED
        ? defaultUserSettings.cardDisplayType
        : settings.cardDisplayType,
    moviesSource:
      settings.moviesSource === 0 ? defaultUserSettings.moviesSource : settings.moviesSource,
    tvShowsSource:
      settings.tvShowsSource === 0 ? defaultUserSettings.tvShowsSource : settings.tvShowsSource,
  });
}

function buildApi(authToken: string): ChillApi {
  return createApi({
    authToken,
    baseUrl: getPublicAPIBaseURL(),
    normalizeSettings: withCatalogDefaults,
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
