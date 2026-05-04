import { Code, ConnectError, createClient, type Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import {
  UserService,
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
  type UserProfile,
  type UserSettings,
} from "@chill-institute/contracts/chill/v4/api_pb";

import { redirectToSignInOnAuthFailure } from "./auth-failure";
import { withTimeoutSignal } from "./request-timeout";
import { withSearchSettingsDefaults } from "./settings-defaults";

const REQUEST_TIMEOUT_MS = 8000;
const SEARCH_TIMEOUT_MS = 10000;

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

function authHeader(authToken?: string): HeadersInit | undefined {
  if (!authToken) {
    return undefined;
  }
  return { Authorization: `Bearer ${authToken}` };
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

export type ChillApi = ReturnType<typeof createApi>;

export type CreateApiOptions = {
  /** Bearer token from the user's chill session — empty string is fine for unauthed calls. */
  authToken: string;
  /** Origin without trailing slash (e.g. https://api.chill.institute or http://localhost:58780). */
  baseUrl: string;
  /**
   * Optional hook for callers that want to apply app-specific normalisation on
   * top of the shared search-fallbacks (e.g. binge supplies catalog defaults).
   */
  normalizeSettings?: (settings: UserSettings) => UserSettings;
};

export function createApi({ authToken, baseUrl, normalizeSettings }: CreateApiOptions) {
  const transport = createConnectTransport({
    baseUrl: `${baseUrl}/v4`,
    interceptors: [requestIDInterceptor],
  });
  const userClient = createClient(UserService, transport);

  function applySettingsDefaults(settings: UserSettings): UserSettings {
    const withSearch = withSearchSettingsDefaults(settings);
    return normalizeSettings ? normalizeSettings(withSearch) : withSearch;
  }

  async function getUserProfile(signal?: AbortSignal): Promise<UserProfile> {
    try {
      return await runWithTimeout(
        signal,
        REQUEST_TIMEOUT_MS,
        "Profile request timed out",
        (timed) => userClient.getUserProfile({}, { headers: authHeader(authToken), signal: timed }),
      );
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function search(
    query: string,
    indexerId?: string,
    signal?: AbortSignal,
  ): Promise<SearchResponse> {
    try {
      return await runWithTimeout(signal, SEARCH_TIMEOUT_MS, "Search timed out", (timed) =>
        userClient.search(
          { query, indexerId: indexerId || undefined },
          { headers: authHeader(authToken), signal: timed },
        ),
      );
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function getIndexers(signal?: AbortSignal): Promise<UserIndexer[]> {
    try {
      const response = await runWithTimeout(
        signal,
        REQUEST_TIMEOUT_MS,
        "Indexers request timed out",
        (timed) => userClient.getIndexers({}, { headers: authHeader(authToken), signal: timed }),
      );
      return response.indexers;
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function getUserSettings(signal?: AbortSignal): Promise<UserSettings> {
    try {
      const response = await runWithTimeout(
        signal,
        REQUEST_TIMEOUT_MS,
        "Settings request timed out",
        (timed) =>
          userClient.getUserSettings({}, { headers: authHeader(authToken), signal: timed }),
      );
      return applySettingsDefaults(response);
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function saveUserSettings(settings: UserSettings): Promise<UserSettings> {
    try {
      const response = await userClient.saveUserSettings(
        { settings },
        { headers: authHeader(authToken) },
      );
      return applySettingsDefaults(response);
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function addTransfer(url: string): Promise<AddTransferResponse> {
    try {
      return await userClient.addTransfer({ url }, { headers: authHeader(authToken) });
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function getDownloadFolder(signal?: AbortSignal): Promise<GetDownloadFolderResponse> {
    try {
      return await runWithTimeout(
        signal,
        REQUEST_TIMEOUT_MS,
        "Download folder request timed out",
        (timed) =>
          userClient.getDownloadFolder({}, { headers: authHeader(authToken), signal: timed }),
      );
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function getFolder(id: bigint, signal?: AbortSignal): Promise<GetFolderResponse> {
    try {
      return await runWithTimeout(signal, REQUEST_TIMEOUT_MS, "Folder request timed out", (timed) =>
        userClient.getFolder({ id }, { headers: authHeader(authToken), signal: timed }),
      );
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function getMovies(signal?: AbortSignal): Promise<GetMoviesResponse> {
    try {
      return await runWithTimeout(signal, REQUEST_TIMEOUT_MS, "Movies request timed out", (timed) =>
        userClient.getMovies({}, { headers: authHeader(authToken), signal: timed }),
      );
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function getTVShows(signal?: AbortSignal): Promise<GetTVShowsResponse> {
    try {
      return await runWithTimeout(
        signal,
        REQUEST_TIMEOUT_MS,
        "TV shows request timed out",
        (timed) => userClient.getTVShows({}, { headers: authHeader(authToken), signal: timed }),
      );
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function getTVShowDetail(
    imdbId: string,
    signal?: AbortSignal,
  ): Promise<GetTVShowDetailResponse> {
    try {
      return await runWithTimeout(
        signal,
        REQUEST_TIMEOUT_MS,
        "TV show detail request timed out",
        (timed) =>
          userClient.getTVShowDetail({ imdbId }, { headers: authHeader(authToken), signal: timed }),
      );
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function getTVShowSeason(
    imdbId: string,
    seasonNumber: number,
    signal?: AbortSignal,
  ): Promise<GetTVShowSeasonResponse> {
    try {
      return await runWithTimeout(
        signal,
        REQUEST_TIMEOUT_MS,
        "TV show season request timed out",
        (timed) =>
          userClient.getTVShowSeason(
            { imdbId, seasonNumber },
            { headers: authHeader(authToken), signal: timed },
          ),
      );
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  async function getTVShowSeasonDownloads(
    imdbId: string,
    seasonNumber: number,
    signal?: AbortSignal,
  ): Promise<GetTVShowSeasonDownloadsResponse> {
    try {
      return await runWithTimeout(
        signal,
        REQUEST_TIMEOUT_MS,
        "TV show season downloads request timed out",
        (timed) =>
          userClient.getTVShowSeasonDownloads(
            { imdbId, seasonNumber },
            { headers: authHeader(authToken), signal: timed },
          ),
      );
    } catch (error) {
      redirectToSignInOnAuthFailure(error);
      throw error;
    }
  }

  return {
    getUserProfile,
    search,
    getIndexers,
    getUserSettings,
    saveUserSettings,
    addTransfer,
    getDownloadFolder,
    getFolder,
    getMovies,
    getTVShows,
    getTVShowDetail,
    getTVShowSeason,
    getTVShowSeasonDownloads,
  };
}

/*
 * Builds the put.io OAuth start URL the sign-in page redirects to.
 * Lives next to the API client because it shares the same `baseUrl`
 * concept and is consumed by the same auth flow.
 */
export function getPutioStartURL(baseUrl: string, successURL?: string): string {
  const url = new URL(`${baseUrl}/auth/putio/start`);
  const trimmed = successURL?.trim() ?? "";
  if (trimmed.length > 0) {
    url.searchParams.set("success_url", trimmed);
  }
  return url.toString();
}
