import {
  CodecFilter,
  OtherFilter,
  ResolutionFilter,
  SearchResultDisplayBehavior,
  SearchResultTitleBehavior,
  SortBy,
  SortDirection,
  TopMoviesDisplayType,
  TopMoviesSource,
  type AddTransferResponse,
  type GetDownloadFolderResponse,
  type GetFolderResponse,
  type SearchResponse,
  type SearchResult,
  type TopMovie,
  type UserSettings,
  type UserGetTopMoviesResponse,
  type UserIndexer,
} from "@chill-institute/contracts/chill/v4/api_pb";

export {
  CodecFilter,
  OtherFilter,
  ResolutionFilter,
  SearchResultDisplayBehavior,
  SearchResultTitleBehavior,
  SortBy,
  SortDirection,
  TopMoviesDisplayType,
  TopMoviesSource,
};

export type {
  AddTransferResponse,
  GetDownloadFolderResponse,
  GetFolderResponse,
  SearchResponse,
  SearchResult,
  TopMovie,
  UserSettings,
  UserGetTopMoviesResponse,
  UserIndexer,
};

type UserSettingsDefaults = Omit<UserSettings, "$typeName">;

export const topMoviesSources = [
  TopMoviesSource.IMDB_MOVIEMETER,
  TopMoviesSource.IMDB_TOP_250,
  TopMoviesSource.YTS,
  TopMoviesSource.ROTTEN_TOMATOES,
  TopMoviesSource.TRAKT,
] as const;

export const topMoviesSourceLabels: Record<TopMoviesSource, string> = {
  [TopMoviesSource.UNSPECIFIED]: "Trending movies from IMDb",
  [TopMoviesSource.IMDB_MOVIEMETER]: "Trending movies from IMDb",
  [TopMoviesSource.IMDB_TOP_250]: "Top 250 movies from IMDb",
  [TopMoviesSource.YTS]: "Trending movies from YTS",
  [TopMoviesSource.ROTTEN_TOMATOES]: "Trending movies from Rotten Tomatoes",
  [TopMoviesSource.TRAKT]: "Trending movies from Trakt",
};

export function getTopMoviesSourceLabel(source: TopMoviesSource): string {
  return topMoviesSourceLabels[source];
}

export const resolutionFilters = [
  ResolutionFilter.RESOLUTION_FILTER_720P,
  ResolutionFilter.RESOLUTION_FILTER_1080P,
  ResolutionFilter.RESOLUTION_FILTER_2160P,
] as const;

export const resolutionFilterLabels: Record<(typeof resolutionFilters)[number], string> = {
  [ResolutionFilter.RESOLUTION_FILTER_720P]: "720p",
  [ResolutionFilter.RESOLUTION_FILTER_1080P]: "1080p",
  [ResolutionFilter.RESOLUTION_FILTER_2160P]: "2160p",
};

export const codecFilters = [CodecFilter.X264, CodecFilter.X265] as const;

export const codecFilterLabels: Record<(typeof codecFilters)[number], string> = {
  [CodecFilter.X264]: "x264",
  [CodecFilter.X265]: "x265",
};

export const otherFilters = [OtherFilter.HDR] as const;

export const otherFilterLabels: Record<(typeof otherFilters)[number], string> = {
  [OtherFilter.HDR]: "HDR",
};

export const searchResultDisplayBehaviors = [
  SearchResultDisplayBehavior.ALL,
  SearchResultDisplayBehavior.FASTEST,
] as const;

export const searchResultDisplayBehaviorLabels: Record<
  (typeof searchResultDisplayBehaviors)[number],
  string
> = {
  [SearchResultDisplayBehavior.ALL]: "Wait for all results",
  [SearchResultDisplayBehavior.FASTEST]: "Show fastest first",
};

export const searchResultTitleBehaviors = [
  SearchResultTitleBehavior.LINK,
  SearchResultTitleBehavior.TEXT,
] as const;

export const searchResultTitleBehaviorLabels: Record<
  (typeof searchResultTitleBehaviors)[number],
  string
> = {
  [SearchResultTitleBehavior.LINK]: "Link title to source",
  [SearchResultTitleBehavior.TEXT]: "Plain text title",
};

export const sortByValues = [
  SortBy.TITLE,
  SortBy.SEEDERS,
  SortBy.SIZE,
  SortBy.UPLOADED_AT,
  SortBy.SOURCE,
] as const;

export const sortByLabels: Record<(typeof sortByValues)[number], string> = {
  [SortBy.TITLE]: "Name",
  [SortBy.SEEDERS]: "Seeders",
  [SortBy.SIZE]: "Size",
  [SortBy.UPLOADED_AT]: "Age",
  [SortBy.SOURCE]: "Source",
};

export const defaultUserSettings: UserSettingsDefaults = {
  codecFilters: [],
  disabledIndexerIds: [],
  filterNastyResults: true,
  filterResultsWithNoSeeders: false,
  otherFilters: [],
  rememberQuickFilters: false,
  resolutionFilters: [],
  searchResultDisplayBehavior: SearchResultDisplayBehavior.FASTEST,
  searchResultTitleBehavior: SearchResultTitleBehavior.TEXT,
  showPrettyNamesForTopMovies: true,
  showTopMovies: false,
  sortBy: SortBy.SEEDERS,
  sortDirection: SortDirection.DESC,
  topMoviesDisplayType: TopMoviesDisplayType.COMPACT,
  topMoviesSource: TopMoviesSource.IMDB_MOVIEMETER,
};
