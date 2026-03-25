import {
  CodecFilter,
  OtherFilter,
  ResolutionFilter,
  SearchResultDisplayBehavior,
  SearchResultTitleBehavior,
  SortBy,
  SortDirection,
  CardDisplayType,
  MoviesSource,
  TVShowsSource,
  TVShowStatus,
  type AddTransferResponse,
  type GetDownloadFolderResponse,
  type GetFolderResponse,
  type GetMoviesResponse,
  type Movie,
  type SearchResponse,
  type SearchResult,
  type TVShow,
  type UserSettings,
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
  CardDisplayType,
  MoviesSource,
  TVShowsSource,
  TVShowStatus,
};

export type {
  AddTransferResponse,
  GetDownloadFolderResponse,
  GetFolderResponse,
  GetMoviesResponse,
  Movie,
  SearchResponse,
  SearchResult,
  TVShow,
  UserSettings,
  UserIndexer,
};

type UserSettingsDefaults = Omit<UserSettings, "$typeName">;

export const moviesSources = [
  MoviesSource.IMDB_MOVIEMETER,
  MoviesSource.YTS,
  MoviesSource.ROTTEN_TOMATOES,
  MoviesSource.TRAKT,
  MoviesSource.IMDB_TOP_250,
] as const;

export const moviesSourceLabels: Record<MoviesSource, string> = {
  [MoviesSource.UNSPECIFIED]: "IMDb Moviemeter",
  [MoviesSource.IMDB_MOVIEMETER]: "IMDb Moviemeter",
  [MoviesSource.IMDB_TOP_250]: "IMDb Top 250",
  [MoviesSource.YTS]: "YTS",
  [MoviesSource.ROTTEN_TOMATOES]: "Rotten Tomatoes",
  [MoviesSource.TRAKT]: "Trakt",
};

export function getMoviesSourceLabel(source: MoviesSource): string {
  return moviesSourceLabels[source];
}

export const tvShowsSources = [
  TVShowsSource.TV_SHOWS_SOURCE_NETFLIX,
  TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX,
  TVShowsSource.TV_SHOWS_SOURCE_APPLE_TV_PLUS,
  TVShowsSource.TV_SHOWS_SOURCE_PRIME_VIDEO,
  TVShowsSource.TV_SHOWS_SOURCE_DISNEY_PLUS,
] as const;

export function getTVShowsSourceLabel(source: TVShowsSource): string {
  switch (source) {
    case TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX:
      return "HBO Max";
    case TVShowsSource.TV_SHOWS_SOURCE_APPLE_TV_PLUS:
      return "Apple TV+";
    case TVShowsSource.TV_SHOWS_SOURCE_PRIME_VIDEO:
      return "Prime Video";
    case TVShowsSource.TV_SHOWS_SOURCE_DISNEY_PLUS:
      return "Disney+";
    case TVShowsSource.TV_SHOWS_SOURCE_UNSPECIFIED:
    case TVShowsSource.TV_SHOWS_SOURCE_NETFLIX:
    default:
      return "Netflix";
  }
}

export function getTVShowStatusLabel(status: TVShowStatus): string {
  switch (status) {
    case TVShowStatus.TV_SHOW_STATUS_RETURNING:
      return "Returning";
    case TVShowStatus.TV_SHOW_STATUS_ENDED:
      return "Ended";
    case TVShowStatus.TV_SHOW_STATUS_CANCELED:
      return "Canceled";
    case TVShowStatus.TV_SHOW_STATUS_IN_PRODUCTION:
      return "In production";
    case TVShowStatus.TV_SHOW_STATUS_PLANNED:
      return "Planned";
    case TVShowStatus.TV_SHOW_STATUS_UNSPECIFIED:
    default:
      return "Unknown";
  }
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
  showMovies: true,
  showTvShows: true,
  sortBy: SortBy.SEEDERS,
  sortDirection: SortDirection.DESC,
  cardDisplayType: CardDisplayType.COMPACT,
  moviesSource: MoviesSource.IMDB_MOVIEMETER,
  tvShowsSource: TVShowsSource.TV_SHOWS_SOURCE_NETFLIX,
};
