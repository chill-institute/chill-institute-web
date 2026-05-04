import { create } from "@bufbuild/protobuf";
import { describe, expect, it } from "vite-plus/test";
import {
  CardDisplayType,
  MoviesSource,
  SearchResultDisplayBehavior,
  SearchResultTitleBehavior,
  SortBy,
  SortDirection,
  TVShowsSource,
  UserSettingsSchema,
} from "@chill-institute/contracts/chill/v4/api_pb";

import { SEARCH_SETTINGS_FALLBACKS, withSearchSettingsDefaults } from "./settings-defaults";

function unspecifiedSettings() {
  return create(UserSettingsSchema, {
    searchResultDisplayBehavior: SearchResultDisplayBehavior.UNSPECIFIED,
    searchResultTitleBehavior: SearchResultTitleBehavior.UNSPECIFIED,
    sortBy: SortBy.UNSPECIFIED,
    sortDirection: SortDirection.UNSPECIFIED,
  });
}

describe("withSearchSettingsDefaults", () => {
  it("fills UNSPECIFIED search enums with the fallback set", () => {
    const out = withSearchSettingsDefaults(unspecifiedSettings());

    expect(out.searchResultDisplayBehavior).toBe(
      SEARCH_SETTINGS_FALLBACKS.searchResultDisplayBehavior,
    );
    expect(out.searchResultTitleBehavior).toBe(SEARCH_SETTINGS_FALLBACKS.searchResultTitleBehavior);
    expect(out.sortBy).toBe(SEARCH_SETTINGS_FALLBACKS.sortBy);
    expect(out.sortDirection).toBe(SEARCH_SETTINGS_FALLBACKS.sortDirection);
  });

  it("preserves explicit search enum values", () => {
    const explicit = create(UserSettingsSchema, {
      searchResultDisplayBehavior: SearchResultDisplayBehavior.ALL,
      searchResultTitleBehavior: SearchResultTitleBehavior.LINK,
      sortBy: SortBy.SIZE,
      sortDirection: SortDirection.ASC,
    });

    const out = withSearchSettingsDefaults(explicit);

    expect(out.searchResultDisplayBehavior).toBe(SearchResultDisplayBehavior.ALL);
    expect(out.searchResultTitleBehavior).toBe(SearchResultTitleBehavior.LINK);
    expect(out.sortBy).toBe(SortBy.SIZE);
    expect(out.sortDirection).toBe(SortDirection.ASC);
  });

  it("does not touch catalog fields — those belong to binge's normalizer hook", () => {
    const withCatalogJunk = create(UserSettingsSchema, {
      searchResultDisplayBehavior: SearchResultDisplayBehavior.UNSPECIFIED,
      searchResultTitleBehavior: SearchResultTitleBehavior.UNSPECIFIED,
      sortBy: SortBy.UNSPECIFIED,
      sortDirection: SortDirection.UNSPECIFIED,
      cardDisplayType: CardDisplayType.UNSPECIFIED,
      moviesSource: MoviesSource.UNSPECIFIED,
      tvShowsSource: TVShowsSource.TV_SHOWS_SOURCE_UNSPECIFIED,
    });

    const out = withSearchSettingsDefaults(withCatalogJunk);

    expect(out.cardDisplayType).toBe(CardDisplayType.UNSPECIFIED);
    expect(out.moviesSource).toBe(MoviesSource.UNSPECIFIED);
    expect(out.tvShowsSource).toBe(TVShowsSource.TV_SHOWS_SOURCE_UNSPECIFIED);
  });

  it("does not mutate the input proto", () => {
    const input = unspecifiedSettings();
    const before = input.sortBy;

    withSearchSettingsDefaults(input);

    expect(input.sortBy).toBe(before);
    expect(input.sortBy).toBe(SortBy.UNSPECIFIED);
  });
});
