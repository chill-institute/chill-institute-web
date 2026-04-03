import { create, toJson, type MessageInitShape } from "@bufbuild/protobuf";
import {
  type UserIndexer,
  type SearchResult,
  type Movie,
  type TVShow,
  type TVShowDetail,
  type TVShowDownload,
  type TVShowEpisode,
  type TVShowSeason,
  type UserFile,
  GetDownloadFolderResponseSchema,
  GetFolderResponseSchema,
  GetMoviesResponseSchema,
  GetTVShowDetailResponseSchema,
  GetTVShowSeasonDownloadsResponseSchema,
  GetTVShowSeasonResponseSchema,
  GetTVShowsResponseSchema,
  MovieSchema,
  SearchResponseSchema,
  SearchResultSchema,
  SearchResultDisplayBehavior,
  SearchResultTitleBehavior,
  SortBy,
  SortDirection,
  CardDisplayType,
  MoviesSource,
  TVShowsSource,
  TVShowStatus,
  TVShowDetailSchema,
  TVShowDownloadSchema,
  TVShowEpisodeSchema,
  TVShowSchema,
  TVShowSeasonSchema,
  UserFileSchema,
  UserGetIndexersResponseSchema,
  UserIndexerSchema,
  UserSettingsSchema,
} from "@chill-institute/contracts/chill/v4/api_pb";

type ConfigInit = MessageInitShape<typeof UserSettingsSchema>;
type IndexerInit = MessageInitShape<typeof UserIndexerSchema>;
type ResultInit = MessageInitShape<typeof SearchResultSchema>;
type MovieInit = MessageInitShape<typeof MovieSchema>;
type TVShowInit = MessageInitShape<typeof TVShowSchema>;
type TVShowDetailInit = MessageInitShape<typeof TVShowDetailSchema>;
type TVShowSeasonInit = MessageInitShape<typeof TVShowSeasonSchema>;
type TVShowEpisodeInit = MessageInitShape<typeof TVShowEpisodeSchema>;
type TVShowDownloadInit = MessageInitShape<typeof TVShowDownloadSchema>;
type UserFileInit = MessageInitShape<typeof UserFileSchema>;

function moviesSourcePath(source: MoviesSource): string {
  switch (source) {
    case MoviesSource.IMDB_TOP_250:
      return "imdb/top-250";
    case MoviesSource.YTS:
      return "yts";
    case MoviesSource.ROTTEN_TOMATOES:
      return "rotten-tomatoes";
    case MoviesSource.TRAKT:
      return "trakt";
    case MoviesSource.UNSPECIFIED:
    case MoviesSource.IMDB_MOVIEMETER:
    default:
      return "imdb/moviemeter";
  }
}

function moviesRSSFeedURL(source: MoviesSource, authToken = "test-token"): string {
  return `https://api.chill.institute/rss/movies/${moviesSourcePath(source)}?auth_token=${encodeURIComponent(authToken)}`;
}

export function userSettings(init?: ConfigInit) {
  return toJson(
    UserSettingsSchema,
    create(UserSettingsSchema, {
      searchResultDisplayBehavior: SearchResultDisplayBehavior.FASTEST,
      searchResultTitleBehavior: SearchResultTitleBehavior.TEXT,
      sortBy: SortBy.SEEDERS,
      sortDirection: SortDirection.DESC,
      cardDisplayType: CardDisplayType.EXPANDED,
      moviesSource: MoviesSource.IMDB_MOVIEMETER,
      filterNastyResults: true,
      ...init,
    }),
  );
}

export function indexer(init?: IndexerInit) {
  return create(UserIndexerSchema, {
    id: "yts",
    name: "YTS",
    enabled: true,
    ...init,
  });
}

export function indexersResponse(indexers: UserIndexer[]) {
  return toJson(UserGetIndexersResponseSchema, create(UserGetIndexersResponseSchema, { indexers }));
}

export function searchResult(init?: ResultInit) {
  return create(SearchResultSchema, {
    id: "result-1",
    title: "Ubuntu 24.04 LTS x264",
    indexer: "yts",
    link: "magnet:?xt=urn:btih:abc123",
    seeders: 42n,
    peers: 10n,
    size: 1073741824n,
    source: "YTS",
    uploadedAt: "2025-01-15T12:00:00Z",
    ...init,
  });
}

export function searchResponse(query: string, results: SearchResult[]) {
  return toJson(SearchResponseSchema, create(SearchResponseSchema, { query, results }));
}

export function movie(init?: MovieInit) {
  return create(MovieSchema, {
    id: "movie-1",
    title: "Inception",
    year: 2010,
    rating: 8.8,
    posterUrl: "/test/baggio.jpg",
    externalUrl: "https://imdb.com/title/tt1375666",
    link: "magnet:?xt=urn:btih:movie123",
    seeders: 500n,
    source: MoviesSource.IMDB_MOVIEMETER,
    ...init,
  });
}

export function moviesResponse(movies: Movie[]) {
  return moviesResponseForSource(MoviesSource.IMDB_MOVIEMETER, movies);
}

export function moviesResponseForSource(source: MoviesSource, movies: Movie[]) {
  return toJson(
    GetMoviesResponseSchema,
    create(GetMoviesResponseSchema, {
      source,
      rssFeedUrl: moviesRSSFeedURL(source),
      movies,
    }),
  );
}

export function tvShow(init?: TVShowInit) {
  return create(TVShowSchema, {
    imdbId: "tt31938062",
    title: "The Pitt",
    year: 2025,
    posterUrl: "/test/pitt-poster.jpg",
    rating: 8.7,
    externalUrl: "https://www.imdb.com/title/tt31938062/",
    seasonCount: 1,
    status: TVShowStatus.TV_SHOW_STATUS_RETURNING,
    source: TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX,
    networks: ["HBO Max"],
    ...init,
  });
}

export function tvShowsResponse(shows: TVShow[]) {
  return tvShowsResponseForSource(TVShowsSource.TV_SHOWS_SOURCE_NETFLIX, shows);
}

export function tvShowsResponseForSource(source: TVShowsSource, shows: TVShow[]) {
  return toJson(
    GetTVShowsResponseSchema,
    create(GetTVShowsResponseSchema, {
      source,
      shows,
    }),
  );
}

export function tvShowDetail(init?: TVShowDetailInit) {
  return create(TVShowDetailSchema, {
    imdbId: "tt31938062",
    title: "The Pitt",
    year: 2025,
    posterUrl: "/test/pitt-poster.jpg",
    backdropUrl: "/test/pitt-backdrop.jpg",
    rating: 8.7,
    overview: "A single-shift medical drama.",
    externalUrl: "https://www.imdb.com/title/tt31938062/",
    seasonCount: 1,
    status: TVShowStatus.TV_SHOW_STATUS_RETURNING,
    networks: ["HBO Max"],
    genres: ["Drama"],
    ...init,
  });
}

export function tvShowSeason(init?: TVShowSeasonInit) {
  return create(TVShowSeasonSchema, {
    seasonNumber: 1,
    name: "Season 1",
    episodeCount: 8,
    airDate: "2025-01-01",
    posterUrl: "/test/season-1.jpg",
    ...init,
  });
}

export function tvShowEpisode(init?: TVShowEpisodeInit) {
  return create(TVShowEpisodeSchema, {
    seasonNumber: 1,
    episodeNumber: 1,
    name: "Pilot",
    overview: "Episode overview",
    airDate: "2025-01-01",
    runtime: 57,
    stillUrl: "/test/episode-1.jpg",
    rating: 8.4,
    ...init,
  });
}

export function tvShowDownload(init?: TVShowDownloadInit) {
  return create(TVShowDownloadSchema, {
    title: "The.Pitt.S01E01.1080p.WEBRip.x265-GROUP",
    link: "magnet:?xt=urn:btih:tvshow123",
    size: 2147483648n,
    seeders: 120n,
    resolution: "1080p",
    codec: "x265",
    quality: "WEBRip",
    indexer: "knaben",
    seasonNumber: 1,
    ...init,
  });
}

export function tvShowDetailResponse(show: TVShowDetail, seasons: TVShowSeason[]) {
  return toJson(
    GetTVShowDetailResponseSchema,
    create(GetTVShowDetailResponseSchema, {
      show,
      seasons,
    }),
  );
}

export function tvShowSeasonResponse(
  imdbId: string,
  seasonNumber: number,
  season: TVShowSeason,
  episodes: TVShowEpisode[],
) {
  return toJson(
    GetTVShowSeasonResponseSchema,
    create(GetTVShowSeasonResponseSchema, {
      imdbId,
      seasonNumber,
      season,
      episodes,
    }),
  );
}

export function tvShowSeasonDownloadsResponse(
  seasonPack: TVShowDownload | undefined,
  episodes: Array<{
    episodeNumber: number;
    download?: TVShowDownload;
    searchQuery: string;
  }>,
) {
  return toJson(
    GetTVShowSeasonDownloadsResponseSchema,
    create(GetTVShowSeasonDownloadsResponseSchema, {
      seasonPack,
      episodes,
      seasonSearchQuery: "The Pitt S01",
    }),
  );
}

export function userFile(init?: UserFileInit) {
  return create(UserFileSchema, {
    id: 0n,
    name: "your files",
    fileType: "FOLDER",
    isShared: false,
    createdAt: "2025-01-15T12:00:00Z",
    ...init,
  });
}

export function downloadFolderResponse(folder?: UserFile) {
  return toJson(
    GetDownloadFolderResponseSchema,
    create(GetDownloadFolderResponseSchema, { folder }),
  );
}

export function folderResponse(parent: UserFile, files: UserFile[]) {
  return toJson(
    GetFolderResponseSchema,
    create(GetFolderResponseSchema, {
      parent,
      files,
    }),
  );
}
