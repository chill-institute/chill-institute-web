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
  TopMoviesDisplayType,
  TopMoviesSource,
  defaultUserSettings,
  type AddTransferResponse,
  type GetDownloadFolderResponse,
  type GetFolderResponse,
  type SearchResponse,
  type UserGetTopMoviesResponse,
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
const SEARCH_TIMEOUT_MS = 5000;

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

function withSettingsDefaults(settings: UserSettings): UserSettings {
  return {
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
    topMoviesDisplayType:
      settings.topMoviesDisplayType === TopMoviesDisplayType.UNSPECIFIED
        ? defaultUserSettings.topMoviesDisplayType
        : settings.topMoviesDisplayType,
    topMoviesSource:
      settings.topMoviesSource === TopMoviesSource.UNSPECIFIED
        ? defaultUserSettings.topMoviesSource
        : settings.topMoviesSource,
  };
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
    return await userClient.getUserProfile({}, { headers: authHeader(authToken), signal });
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getTopMovies(
  authToken: string,
  signal?: AbortSignal,
): Promise<UserGetTopMoviesResponse> {
  try {
    return await userClient.getTopMovies({}, { headers: authHeader(authToken), signal });
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
  const timed = withTimeoutSignal(signal, SEARCH_TIMEOUT_MS);
  try {
    return await userClient.search(
      {
        query,
        indexerId: indexerId || undefined,
      },
      { headers: authHeader(authToken), signal: timed.signal },
    );
  } catch (error) {
    if (timed.didTimeout()) {
      throw new ConnectError("Search timed out", Code.DeadlineExceeded);
    }
    redirectToSignInOnAuthFailure(error);
    throw error;
  } finally {
    timed.cleanup();
  }
}

async function getIndexers(authToken: string, signal?: AbortSignal): Promise<UserIndexer[]> {
  try {
    const response = await userClient.getIndexers({}, { headers: authHeader(authToken), signal });
    return response.indexers;
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function getUserSettings(authToken: string, signal?: AbortSignal): Promise<UserSettings> {
  try {
    const response = await userClient.getUserSettings(
      {},
      { headers: authHeader(authToken), signal },
    );
    return withSettingsDefaults(response);
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function saveUserSettings(authToken: string, settings: UserSettings): Promise<UserSettings> {
  try {
    const response = await userClient.saveUserSettings(
      { settings },
      { headers: authHeader(authToken) },
    );
    return withSettingsDefaults(response);
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

async function addTransfer(authToken: string, url: string): Promise<AddTransferResponse> {
  try {
    return await userClient.addTransfer({ url }, { headers: authHeader(authToken) });
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
    return await userClient.getDownloadFolder({}, { headers: authHeader(authToken), signal });
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
    return await userClient.getFolder({ id }, { headers: authHeader(authToken), signal });
  } catch (error) {
    redirectToSignInOnAuthFailure(error);
    throw error;
  }
}

export function createApi(authToken: string) {
  return {
    getUserProfile: (signal?: AbortSignal) => getUserProfile(authToken, signal),
    getTopMovies: (signal?: AbortSignal) => getTopMovies(authToken, signal),
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
