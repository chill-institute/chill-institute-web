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
  type AddTransferResponse,
  type GetDownloadFolderResponse,
  type GetFolderResponse,
  type SearchResponse,
  type SearchResult,
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
};

export type {
  AddTransferResponse,
  GetDownloadFolderResponse,
  GetFolderResponse,
  SearchResponse,
  SearchResult,
  UserSettings,
  UserIndexer,
};

type UserSettingsDefaults = Omit<UserSettings, "$typeName">;

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

/*
 * `cardDisplayType`, `moviesSource`, `tvShowsSource`, `showMovies`, and
 * `showTvShows` are required by the UserSettings proto contract but
 * unused by chill — chill is the search experience, binge owns the
 * catalog. They're seeded here so SaveUserSettings round-trips the
 * shared proto without dropping fields a binge user might have set.
 */
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
