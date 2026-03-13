import { create, toJson, type MessageInitShape } from "@bufbuild/protobuf";
import {
  type UserIndexer,
  type SearchResult,
  type TopMovie,
  type UserFile,
  GetDownloadFolderResponseSchema,
  GetFolderResponseSchema,
  UserSettingsSchema,
  UserGetIndexersResponseSchema,
  UserGetTopMoviesResponseSchema,
  UserIndexerSchema,
  SearchResultSchema,
  SearchResponseSchema,
  TopMovieSchema,
  UserFileSchema,
  SearchResultDisplayBehavior,
  SearchResultTitleBehavior,
  SortBy,
  SortDirection,
  TopMoviesDisplayType,
  TopMoviesSource,
} from "@chill-institute/contracts/chill/v4/api_pb";

type ConfigInit = MessageInitShape<typeof UserSettingsSchema>;
type IndexerInit = MessageInitShape<typeof UserIndexerSchema>;
type ResultInit = MessageInitShape<typeof SearchResultSchema>;
type TopMovieInit = MessageInitShape<typeof TopMovieSchema>;
type UserFileInit = MessageInitShape<typeof UserFileSchema>;

export function userSettings(init?: ConfigInit) {
  return toJson(
    UserSettingsSchema,
    create(UserSettingsSchema, {
      searchResultDisplayBehavior: SearchResultDisplayBehavior.FASTEST,
      searchResultTitleBehavior: SearchResultTitleBehavior.TEXT,
      sortBy: SortBy.SEEDERS,
      sortDirection: SortDirection.DESC,
      topMoviesDisplayType: TopMoviesDisplayType.COMPACT,
      topMoviesSource: TopMoviesSource.IMDB_MOVIEMETER,
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

export function topMovie(init?: TopMovieInit) {
  return create(TopMovieSchema, {
    id: "movie-1",
    title: "Inception",
    year: 2010,
    rating: 8.8,
    posterUrl: "/test/baggio.jpg",
    externalUrl: "https://imdb.com/title/tt1375666",
    link: "magnet:?xt=urn:btih:movie123",
    seeders: 500n,
    source: TopMoviesSource.IMDB_MOVIEMETER,
    ...init,
  });
}

export function topMoviesResponse(movies: TopMovie[]) {
  return toJson(
    UserGetTopMoviesResponseSchema,
    create(UserGetTopMoviesResponseSchema, {
      source: TopMoviesSource.IMDB_MOVIEMETER,
      movies,
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
