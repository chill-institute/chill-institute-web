/*
 * Domain-level auth error codes the chill backend returns inside
 * `?error=<code>` redirect URLs. Both apps consume these to render
 * a matching message on the sign-in page after a failed callback.
 */
export const ACCESS_DENIED_ERROR = "AccessDenied";
export const SESSION_EXPIRED_ERROR = "SessionExpired";
export const UNKNOWN_AUTH_ERROR = "UnknownError";
