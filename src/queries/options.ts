import { queryOptions } from "@tanstack/react-query";

import { createApi } from "@/lib/api";
import type { TopMoviesSource, UserSettings, UserIndexer } from "@/lib/types";

const FIVE_MINUTES = 5 * 60 * 1000;

const SETTINGS_STORAGE_KEY = "chill.settings";
const INDEXERS_STORAGE_KEY = "chill.indexers";

export function readCachedSettings(): UserSettings | undefined {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw, (_, v) =>
      typeof v === "string" && /^\d+n$/.test(v) ? BigInt(v.slice(0, -1)) : v,
    ) as UserSettings;
  } catch {
    return undefined;
  }
}

export function writeCachedSettings(settings: UserSettings) {
  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings, (_, v) => (typeof v === "bigint" ? `${v}n` : v)),
    );
  } catch {
    // localStorage full or unavailable
  }
}

export function readCachedIndexers(): UserIndexer[] | undefined {
  try {
    const raw = localStorage.getItem(INDEXERS_STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as UserIndexer[];
  } catch {
    return undefined;
  }
}

export function writeCachedIndexers(indexers: UserIndexer[]) {
  try {
    localStorage.setItem(INDEXERS_STORAGE_KEY, JSON.stringify(indexers));
  } catch {
    // localStorage full or unavailable
  }
}

export function settingsQueryOptions(token: string) {
  const api = createApi(token);
  return queryOptions({
    queryKey: ["user-settings"],
    queryFn: async ({ signal }) => {
      const settings = await api.getUserSettings(signal);
      writeCachedSettings(settings);
      return settings;
    },
    placeholderData: readCachedSettings(),
  });
}

export function indexersQueryOptions(token: string) {
  const api = createApi(token);
  return queryOptions({
    queryKey: ["indexers"],
    queryFn: async ({ signal }) => {
      const indexers = await api.getIndexers(signal);
      writeCachedIndexers(indexers);
      return indexers;
    },
    staleTime: FIVE_MINUTES,
    placeholderData: readCachedIndexers(),
  });
}

export function topMoviesQueryOptions(token: string, source: TopMoviesSource | undefined) {
  const api = createApi(token);
  return queryOptions({
    queryKey: ["top-movies", source],
    queryFn: ({ signal }) => api.getTopMovies(signal),
    staleTime: FIVE_MINUTES,
  });
}
