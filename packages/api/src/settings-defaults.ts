import {
  SearchResultDisplayBehavior,
  SearchResultTitleBehavior,
  SortBy,
  SortDirection,
  type UserSettings,
} from "@chill-institute/contracts/chill/v4/api_pb";

/*
 * Fallback proto enum values applied when the chill backend returns a
 * stored UserSettings with UNSPECIFIED on a search-related enum. Catalog
 * fields (cardDisplayType / moviesSource / tvShowsSource) are passed
 * through untouched — chill ignores them and binge supplies its own
 * defaults via the `normalizeSettings` hook on createApi.
 */
export const SEARCH_SETTINGS_FALLBACKS = {
  searchResultDisplayBehavior: SearchResultDisplayBehavior.FASTEST,
  searchResultTitleBehavior: SearchResultTitleBehavior.TEXT,
  sortBy: SortBy.SEEDERS,
  sortDirection: SortDirection.DESC,
} as const;

export function withSearchSettingsDefaults(settings: UserSettings): UserSettings {
  return {
    ...settings,
    searchResultDisplayBehavior:
      settings.searchResultDisplayBehavior === SearchResultDisplayBehavior.UNSPECIFIED
        ? SEARCH_SETTINGS_FALLBACKS.searchResultDisplayBehavior
        : settings.searchResultDisplayBehavior,
    searchResultTitleBehavior:
      settings.searchResultTitleBehavior === SearchResultTitleBehavior.UNSPECIFIED
        ? SEARCH_SETTINGS_FALLBACKS.searchResultTitleBehavior
        : settings.searchResultTitleBehavior,
    sortBy:
      settings.sortBy === SortBy.UNSPECIFIED ? SEARCH_SETTINGS_FALLBACKS.sortBy : settings.sortBy,
    sortDirection:
      settings.sortDirection === SortDirection.UNSPECIFIED
        ? SEARCH_SETTINGS_FALLBACKS.sortDirection
        : settings.sortDirection,
  };
}
