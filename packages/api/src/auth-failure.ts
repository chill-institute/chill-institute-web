import { Code, ConnectError } from "@connectrpc/connect";

import { SESSION_EXPIRED_ERROR } from "./auth-errors";

const AUTH_TOKEN_STORAGE_KEY = "chill.auth_token";
const AUTH_CALLBACK_STORAGE_KEY = "chill.auth_callback";

/*
 * The chill backend signals "your session is no good" via a few different
 * shapes: ConnectError codes Unauthenticated / PermissionDenied, or
 * legacy string messages from older backends still in rotation. This
 * predicate gathers them all so the redirect helper can stay focused.
 *
 * Pure / synchronous so it's trivially unit-testable, and exported so
 * tests can pin the matrix down explicitly. Don't broaden the matchers
 * without a test — false positives bounce real users to /sign-out.
 */
export function isAuthFailure(error: unknown): boolean {
  if (error instanceof ConnectError) {
    if (error.code === Code.Unauthenticated || error.code === Code.PermissionDenied) {
      return true;
    }
    return matchesLegacyAuthMessage(`${error.rawMessage} ${error.message}`);
  }
  if (error instanceof Error) {
    return matchesLegacyAuthMessage(error.message);
  }
  return false;
}

function matchesLegacyAuthMessage(raw: string): boolean {
  const message = raw.toLowerCase();
  return (
    message.includes("invalid auth token") ||
    message.includes("missing api key or auth token") ||
    message.includes("missing credentials") ||
    message.includes("unauthorized") ||
    message.includes("401")
  );
}

/*
 * When the API client surfaces an auth failure, clear the stored
 * token + the pending callback path and bounce to /sign-out so the
 * sign-in page can re-prompt with the right error code.
 *
 * Both apps share the `chill.auth_*` storage keys and the
 * /sign-in / /sign-out routes, so the redirect lives next to the
 * shared client. Returns silently for non-auth errors and for SSR-ish
 * environments where `window` isn't defined.
 */
export function redirectToSignInOnAuthFailure(error: unknown): void {
  if (!isAuthFailure(error)) {
    return;
  }
  if (typeof window === "undefined") {
    return;
  }
  if (window.location.pathname === "/sign-in" || window.location.pathname === "/sign-out") {
    return;
  }
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_CALLBACK_STORAGE_KEY);
  window.location.replace(`/sign-out?error=${encodeURIComponent(SESSION_EXPIRED_ERROR)}`);
}
