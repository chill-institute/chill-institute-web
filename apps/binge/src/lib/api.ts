import { useMemo } from "react";
import { Code, ConnectError, createClient, type Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import {
  UserService,
  type UserProfile,
  type UserSettings,
} from "@chill-institute/contracts/chill/v4/api_pb";

import { useAuth } from "./auth";
import { SESSION_EXPIRED_ERROR } from "./auth-errors";
import { getPublicAPIBaseURL } from "./env";
import { withTimeoutSignal } from "./request-timeout";
import {
  SearchResultDisplayBehavior,
  SearchResultTitleBehavior,
  SortBy,
  SortDirection,
  CardDisplayType,
  defaultUserSettings,
  normalizeBingeUserSettings,
  type AddTransferResponse,
  type GetDownloadFolderResponse,
  type GetFolderResponse,
  type GetMoviesResponse,
  type GetTVShowDetailResponse,
  type GetTVShowSeasonDownloadsResponse,
  type GetTVShowSeasonResponse,
  type GetTVShowsResponse,
  type SearchResponse,
  type UserIndexer,
} from "./types";

function newRequestID(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const requestIDInterceptor: Interceptor = (next) => async (request) => {
  request.header.set("X-Request-Id", newRequestID());
  return next(request);
};

const transport = createConnectTransport({
  baseUrl: `${getPublicAPIBaseURL()}/v4`,
  interceptors: [requestIDInterceptor],
});

const userClient = createClient(UserService, transport);
const REQUEST_TIMEOUT_MS = 8000;
const SEARCH_TIMEOUT_MS = 10000;

function authHeader(authToken?: string): HeadersInit | undefined {
  if (!authToken) {
    return undefined;
  }
  return { Authorization: `Bearer ${authToken}` };
}

function redirectToSignInOnAuthFailure(error: unknown) {
  const isAuthFailure = (() => {
    if (error instanceof ConnectError) {
      if (error.code === Code.Unauthenticated || error.code === Code.PermissionDenied) {
        return true;
      }
      const message = `${error.rawMessage} ${error.message}`.toLowerCase();
      return (
        message.includes("invalid auth token") ||
        message.includes("missing api key or auth token") ||
        message.includes("missing credentials") ||
        message.includes("unauthorized") ||
        message.includes("401")
      );
    }
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("invalid auth token") ||
        message.includes("missing api key or auth token") ||
        message.includes("missing credentials") ||
        message.includes("unauthorized") ||
        message.includes("401")
      );
    }
    return false;
  })();

  if (!isAuthFailure) {
    return;
  }
  if (typeof window === "undefined") {
    return;
  }
  if (window.location.pathname === "/sign-in" || window.location.pathname === "/sign-out") {
    return;
  }
  window.localStorage.removeItem("chill.auth_token");
  window.sessionStorage.removeItem("chill.auth_callback");
  window.location.replace(`/sign-out?error=${encodeURIComponent(SESSION_EXPIRED_ERROR)}`);
}

async function runWithTimeout<T>(
  signal: AbortSignal | undefined,
  timeoutMs: number,
  timeoutMessage: string,
  request: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const timed = withTimeoutSignal(signal, timeoutMs);
  try {
    return await request(timed.signal);
  } catch (error) {
    if (timed.didTimeout()) {
      throw new ConnectError(timeoutMessage, Code.DeadlineExceeded);
    }
    throw error;
  } finally {
    timed.cleanup();
  }
}

async function runAPIRequest<T>(request: () => Promise<T>): Promise<T> {
  return request();
}

function withSettingsDefaults(settings: UserSettings): UserSettings {
  return normalizeBingeUserSettings({
    ...settings,
    searchResultDisplayBehavior:
      settings.searchResultDisplayBehavior === SearchResultDisplayBehavior.UNSPECIFIED
        ? defaultUserSettings.searchResultDisplayBehavior
        : settings.searchResultDisplayBehavior,
    searchResultTitleBehavior:
      settings.searchResultTitleBehavior === SearchResultTitleBehavior.UNSPECIFIED
        ? defaultUserSettings.searchResultTitleBehavior
        : settings.searchResultTitleBehavior,
    sortBy: settings.sortBy === SortBy.UNSPECIFIED ? defaultUserSettings.sortBy : settings.sortBy,
    sortDirection:
      settings.sortDirection === SortDirection.UNSPECIFIED
        ? defaultUserSettings.sortDirection
        : settings.sortDirection,
    cardDisplayType:
      settings.cardDisplayType === CardDisplayType.UNSPECIFIED
        ? defaultUserSettings.cardDisplayType
        : settings.cardDisplayType,
    moviesSource:
      settings.moviesSource === 0 ? defaultUserSettings.moviesSource : settings.moviesSource,
    tvShowsSource:
      settings.tvShowsSource === 0 ? defaultUserSettings.tvShowsSource : settings.tvShowsSource,
  });
}

export function getPutioStartURL(successURL?: string) {
  const url = new URL(`${getPublicAPIBaseURL()}/auth/putio/start`);
  const trimmed = successURL?.trim() ?? "";
  if (trimmed.length > 0) {
    url.searchParams.set("success_url", trimmed);
  }
  return url.toString();
}

async function getUserProfile(authToken: string, signal?: AbortSignal): Promise<UserProfile> {
  try {
    return await runAPIRequest(() =>
      runWithTimeout(signal, REQUEST_TIMEOUT_MS, "Profile request timed out", (timed) =>
        userClient.getUserProfile({}, { headers: authHeader(authToken), signal: timed }),
      ),
    );
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getMovies(authToken: string, signal?: AbortSignal): Promise<GetMoviesResponse> {
  try {
    return await runAPIRequest(() =>
      runWithTimeout(signal, REQUEST_TIMEOUT_MS, "Movies request timed out", (timed) =>
        userClient.getMovies({}, { headers: authHeader(authToken), signal: timed }),
      ),
    );
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getTVShows(authToken: string, signal?: AbortSignal): Promise<GetTVShowsResponse> {
  try {
    return await runAPIRequest(() =>
      runWithTimeout(signal, REQUEST_TIMEOUT_MS, "TV shows request timed out", (timed) =>
        userClient.getTVShows({}, { headers: authHeader(authToken), signal: timed }),
      ),
    );
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getTVShowDetail(
  authToken: string,
  imdbId: string,
  signal?: AbortSignal,
): Promise<GetTVShowDetailResponse> {
  try {
    return await runAPIRequest(() =>
      runWithTimeout(signal, REQUEST_TIMEOUT_MS, "TV show detail request timed out", (timed) =>
        userClient.getTVShowDetail({ imdbId }, { headers: authHeader(authToken), signal: timed }),
      ),
    );
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getTVShowSeason(
  authToken: string,
  imdbId: string,
  seasonNumber: number,
  signal?: AbortSignal,
): Promise<GetTVShowSeasonResponse> {
  try {
    return await runAPIRequest(() =>
      runWithTimeout(signal, REQUEST_TIMEOUT_MS, "TV show season request timed out", (timed) =>
        userClient.getTVShowSeason(
          { imdbId, seasonNumber },
          { headers: authHeader(authToken), signal: timed },
        ),
      ),
    );
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getTVShowSeasonDownloads(
  authToken: string,
  imdbId: string,
  seasonNumber: number,
  signal?: AbortSignal,
): Promise<GetTVShowSeasonDownloadsResponse> {
  try {
    return await runAPIRequest(() =>
      runWithTimeout(
        signal,
        REQUEST_TIMEOUT_MS,
        "TV show season downloads request timed out",
        (timed) =>
          userClient.getTVShowSeasonDownloads(
            { imdbId, seasonNumber },
            { headers: authHeader(authToken), signal: timed },
          ),
      ),
    );
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function search(
  authToken: string,
  query: string,
  indexerId?: string,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  try {
    return await runAPIRequest(() =>
      runWithTimeout(signal, SEARCH_TIMEOUT_MS, "Search timed out", (timed) =>
        userClient.search(
          {
            query,
            indexerId: indexerId || undefined,
          },
          { headers: authHeader(authToken), signal: timed },
        ),
      ),
    );
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getIndexers(authToken: string, signal?: AbortSignal): Promise<UserIndexer[]> {
  try {
    const response = await runAPIRequest(() =>
      runWithTimeout(signal, REQUEST_TIMEOUT_MS, "Indexers request timed out", (timed) =>
        userClient.getIndexers({}, { headers: authHeader(authToken), signal: timed }),
      ),
    );
    return response.indexers;
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getUserSettings(authToken: string, signal?: AbortSignal): Promise<UserSettings> {
  try {
    const response = await runAPIRequest(() =>
      runWithTimeout(signal, REQUEST_TIMEOUT_MS, "Settings request timed out", (timed) =>
        userClient.getUserSettings({}, { headers: authHeader(authToken), signal: timed }),
      ),
    );
    return withSettingsDefaults(response);
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function saveUserSettings(authToken: string, settings: UserSettings): Promise<UserSettings> {
  try {
    const normalizedSettings = withSettingsDefaults(settings);
    const response = await runAPIRequest(() =>
      userClient.saveUserSettings(
        { settings: normalizedSettings },
        { headers: authHeader(authToken) },
      ),
    );
    return withSettingsDefaults(response);
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function addTransfer(authToken: string, url: string): Promise<AddTransferResponse> {
  try {
    return await runAPIRequest(() =>
      userClient.addTransfer({ url }, { headers: authHeader(authToken) }),
    );
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getDownloadFolder(
  authToken: string,
  signal?: AbortSignal,
): Promise<GetDownloadFolderResponse> {
  try {
    return await runAPIRequest(() =>
      runWithTimeout(signal, REQUEST_TIMEOUT_MS, "Download folder request timed out", (timed) =>
        userClient.getDownloadFolder({}, { headers: authHeader(authToken), signal: timed }),
      ),
    );
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getFolder(
  authToken: string,
  id: bigint,
  signal?: AbortSignal,
): Promise<GetFolderResponse> {
  try {
    return await runAPIRequest(() =>
      runWithTimeout(signal, REQUEST_TIMEOUT_MS, "Folder request timed out", (timed) =>
        userClient.getFolder({ id }, { headers: authHeader(authToken), signal: timed }),
      ),
    );
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

export function createApi(authToken: string) {
  return {
    getUserProfile: (signal?: AbortSignal) => getUserProfile(authToken, signal),
    getMovies: (signal?: AbortSignal) => getMovies(authToken, signal),
    getTVShows: (signal?: AbortSignal) => getTVShows(authToken, signal),
    getTVShowDetail: (imdbId: string, signal?: AbortSignal) =>
      getTVShowDetail(authToken, imdbId, signal),
    getTVShowSeason: (imdbId: string, seasonNumber: number, signal?: AbortSignal) =>
      getTVShowSeason(authToken, imdbId, seasonNumber, signal),
    getTVShowSeasonDownloads: (imdbId: string, seasonNumber: number, signal?: AbortSignal) =>
      getTVShowSeasonDownloads(authToken, imdbId, seasonNumber, signal),
    search: (query: string, indexerId?: string, signal?: AbortSignal) =>
      search(authToken, query, indexerId, signal),
    getIndexers: (signal?: AbortSignal) => getIndexers(authToken, signal),
    getUserSettings: (signal?: AbortSignal) => getUserSettings(authToken, signal),
    saveUserSettings: (settings: UserSettings) => saveUserSettings(authToken, settings),
    addTransfer: (url: string) => addTransfer(authToken, url),
    getDownloadFolder: (signal?: AbortSignal) => getDownloadFolder(authToken, signal),
    getFolder: (id: bigint, signal?: AbortSignal) => getFolder(authToken, id, signal),
  };
}

export function useApi() {
  const { authToken } = useAuth();
  return useMemo(() => createApi(authToken ?? ""), [authToken]);
}
