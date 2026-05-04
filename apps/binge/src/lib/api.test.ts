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

import { withCatalogDefaults } from "./api";
import { defaultUserSettings, normalizeBingeUserSettings } from "./types";

function unspecifiedCatalogSettings() {
  return create(UserSettingsSchema, {
    searchResultDisplayBehavior: SearchResultDisplayBehavior.FASTEST,
    searchResultTitleBehavior: SearchResultTitleBehavior.TEXT,
    sortBy: SortBy.SEEDERS,
    sortDirection: SortDirection.DESC,
    cardDisplayType: CardDisplayType.UNSPECIFIED,
    moviesSource: MoviesSource.UNSPECIFIED,
    tvShowsSource: TVShowsSource.TV_SHOWS_SOURCE_UNSPECIFIED,
    showMovies: false,
    showTvShows: false,
  });
}

describe("withCatalogDefaults", () => {
  it("fills UNSPECIFIED catalog fields with the binge defaults", () => {
    const out = withCatalogDefaults(unspecifiedCatalogSettings());

    expect(out.cardDisplayType).toBe(defaultUserSettings.cardDisplayType);
    expect(out.moviesSource).toBe(defaultUserSettings.moviesSource);
    expect(out.tvShowsSource).toBe(defaultUserSettings.tvShowsSource);
  });

  it("forces showMovies / showTvShows true regardless of incoming values", () => {
    // The legacy `showMovies` / `showTvShows` flags don't make sense in
    // binge — the catalog is the whole product. Keep them pinned so old
    // backend state can't accidentally hide the lists.
    const out = withCatalogDefaults(unspecifiedCatalogSettings());

    expect(out.showMovies).toBe(true);
    expect(out.showTvShows).toBe(true);
  });

  it("preserves explicit catalog values when set", () => {
    const explicit = create(UserSettingsSchema, {
      cardDisplayType: CardDisplayType.COMPACT,
      moviesSource: MoviesSource.YTS,
      tvShowsSource: TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX,
    });

    const out = withCatalogDefaults(explicit);

    expect(out.cardDisplayType).toBe(CardDisplayType.COMPACT);
    expect(out.moviesSource).toBe(MoviesSource.YTS);
    expect(out.tvShowsSource).toBe(TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX);
  });

  it("does not touch the search-related fields — those run earlier in the shared pipeline", () => {
    const explicit = create(UserSettingsSchema, {
      searchResultDisplayBehavior: SearchResultDisplayBehavior.ALL,
      searchResultTitleBehavior: SearchResultTitleBehavior.LINK,
      sortBy: SortBy.SIZE,
      sortDirection: SortDirection.ASC,
    });

    const out = withCatalogDefaults(explicit);

    expect(out.searchResultDisplayBehavior).toBe(SearchResultDisplayBehavior.ALL);
    expect(out.searchResultTitleBehavior).toBe(SearchResultTitleBehavior.LINK);
    expect(out.sortBy).toBe(SortBy.SIZE);
    expect(out.sortDirection).toBe(SortDirection.ASC);
  });
});

describe("normalizeBingeUserSettings", () => {
  it("forces showMovies / showTvShows true even when explicitly false", () => {
    const explicit = create(UserSettingsSchema, {
      showMovies: false,
      showTvShows: false,
    });

    const out = normalizeBingeUserSettings(explicit);

    expect(out.showMovies).toBe(true);
    expect(out.showTvShows).toBe(true);
  });

  it("does not touch other proto fields", () => {
    const explicit = create(UserSettingsSchema, {
      moviesSource: MoviesSource.YTS,
      sortBy: SortBy.SIZE,
      filterNastyResults: false,
    });

    const out = normalizeBingeUserSettings(explicit);

    expect(out.moviesSource).toBe(MoviesSource.YTS);
    expect(out.sortBy).toBe(SortBy.SIZE);
    expect(out.filterNastyResults).toBe(false);
  });
});
