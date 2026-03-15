import { queryOptions } from "@tanstack/react-query";

import { createApi } from "@/lib/api";
import type { UserSettings, UserIndexer } from "@/lib/types";

const FIVE_MINUTES = 5 * 60 * 1000;

const SETTINGS_STORAGE_KEY = "chill.settings";
const INDEXERS_STORAGE_KEY = "chill.indexers";

function warnCacheFailure(message: string, error: unknown) {
  console.warn(`[chill] ${message}`, error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isValidCachedSettings(value: unknown): value is UserSettings {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNumberArray(value.codecFilters) &&
    isStringArray(value.disabledIndexerIds) &&
    isBoolean(value.filterNastyResults) &&
    isBoolean(value.filterResultsWithNoSeeders) &&
    isNumberArray(value.otherFilters) &&
    isBoolean(value.rememberQuickFilters) &&
    isNumberArray(value.resolutionFilters) &&
    typeof value.searchResultDisplayBehavior === "number" &&
    typeof value.searchResultTitleBehavior === "number" &&
    isBoolean(value.showPrettyNamesForTopMovies) &&
    isBoolean(value.showTopMovies) &&
    typeof value.sortBy === "number" &&
    typeof value.sortDirection === "number" &&
    typeof value.topMoviesDisplayType === "number" &&
    typeof value.topMoviesSource === "number"
  );
}

function isValidCachedIndexer(value: unknown): value is UserIndexer {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.enabled === "boolean"
  );
}

function isValidCachedIndexers(value: unknown): value is UserIndexer[] {
  return Array.isArray(value) && value.every(isValidCachedIndexer);
}

export function readCachedSettings(): UserSettings | undefined {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw, (_, v) =>
      typeof v === "string" && /^\d+n$/.test(v) ? BigInt(v.slice(0, -1)) : v,
    );
    if (!isValidCachedSettings(parsed)) {
      console.warn("[chill] Ignoring cached settings with an unexpected shape");
      return undefined;
    }
    return parsed;
  } catch (error) {
    warnCacheFailure("Failed to read cached settings", error);
    return undefined;
  }
}

export function writeCachedSettings(settings: UserSettings) {
  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings, (_, v) => (typeof v === "bigint" ? `${v}n` : v)),
    );
  } catch (error) {
    warnCacheFailure("Failed to write cached settings", error);
  }
}

export function readCachedIndexers(): UserIndexer[] | undefined {
  try {
    const raw = localStorage.getItem(INDEXERS_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!isValidCachedIndexers(parsed)) {
      console.warn("[chill] Ignoring cached indexers with an unexpected shape");
      return undefined;
    }
    return parsed;
  } catch (error) {
    warnCacheFailure("Failed to read cached indexers", error);
    return undefined;
  }
}

export function writeCachedIndexers(indexers: UserIndexer[]) {
  try {
    localStorage.setItem(INDEXERS_STORAGE_KEY, JSON.stringify(indexers));
  } catch (error) {
    warnCacheFailure("Failed to write cached indexers", error);
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

export function topMoviesQueryOptions(token: string) {
  const api = createApi(token);
  return queryOptions({
    queryKey: ["top-movies"],
    queryFn: ({ signal }) => api.getTopMovies(signal),
    staleTime: FIVE_MINUTES,
  });
}
