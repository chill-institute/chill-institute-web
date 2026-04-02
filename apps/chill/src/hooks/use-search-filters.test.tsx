import { create } from "@bufbuild/protobuf";
import {
  CodecFilter,
  OtherFilter,
  ResolutionFilter,
  SortBy,
  SortDirection,
  UserSettingsSchema,
} from "@chill-institute/contracts/chill/v4/api_pb";
import { describe, expect, it } from "vite-plus/test";
import { renderToString } from "react-dom/server";

import { useSearchFilters } from "./use-search-filters";

function SearchFiltersHarness({ settings }: { settings: Parameters<typeof useSearchFilters>[0] }) {
  const { filters } = useSearchFilters(settings);

  return <pre>{JSON.stringify(filters)}</pre>;
}

describe("useSearchFilters", () => {
  it("initializes from saved settings available on first render", () => {
    const settings = create(UserSettingsSchema, {
      codecFilters: [CodecFilter.X265],
      disabledIndexerIds: [],
      filterNastyResults: true,
      filterResultsWithNoSeeders: false,
      otherFilters: [OtherFilter.HDR],
      rememberQuickFilters: true,
      resolutionFilters: [ResolutionFilter.RESOLUTION_FILTER_2160P],
      searchResultDisplayBehavior: 2,
      searchResultTitleBehavior: 2,
      showMovies: false,
      showTvShows: true,
      sortBy: SortBy.TITLE,
      sortDirection: SortDirection.ASC,
      cardDisplayType: 1,
      moviesSource: 1,
      tvShowsSource: 1,
    });

    const html = renderToString(<SearchFiltersHarness settings={settings} />);
    const serialized = html.replace("<pre>", "").replace("</pre>", "").replaceAll("&quot;", '"');

    expect(serialized).toBe(
      JSON.stringify({
        resolution: [ResolutionFilter.RESOLUTION_FILTER_2160P],
        codec: [CodecFilter.X265],
        other: [OtherFilter.HDR],
        sortBy: SortBy.TITLE,
        sortDirection: SortDirection.ASC,
      }),
    );
  });
});
