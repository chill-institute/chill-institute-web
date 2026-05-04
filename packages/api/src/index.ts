/*
 * @chill-institute/api — shared chill-backend RPC client.
 *
 * Both apps build their own `useApi()` hook on top of `createApi`,
 * supplying their app-local `baseUrl` (resolved via env.ts) and
 * `authToken` (from the app-local AuthProvider). Catalog methods
 * (getMovies, getTVShows, getTVShowDetail, getTVShowSeason,
 * getTVShowSeasonDownloads) live here too so binge can call them
 * directly; chill simply doesn't use them.
 */
export { createApi, getPutioStartURL, type ChillApi, type CreateApiOptions } from "./api";
export { ACCESS_DENIED_ERROR, SESSION_EXPIRED_ERROR, UNKNOWN_AUTH_ERROR } from "./auth-errors";
export { withTimeoutSignal } from "./request-timeout";
