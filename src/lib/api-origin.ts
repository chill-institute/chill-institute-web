const STAGING_APP_HOSTS = new Set(["binge.institute", "www.binge.institute"]);
const PRODUCTION_APP_HOSTS = new Set(["chill.institute", "www.chill.institute"]);
const STAGING_API_BASE_URL = "https://api.binge.institute";
const PRODUCTION_API_BASE_URL = "https://api.chill.institute";
const PREVIEW_HOST = "web-8vr.pages.dev";
const STAGING_PREVIEW_HOST_SUFFIX = ".web-8vr.pages.dev";

export function resolveHostedAPIBaseURL(hostname: string, currentOrigin?: string) {
  const host = hostname.trim().toLowerCase();

  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === PREVIEW_HOST ||
    host.endsWith(STAGING_PREVIEW_HOST_SUFFIX) ||
    STAGING_APP_HOSTS.has(host)
  ) {
    return STAGING_API_BASE_URL;
  }

  if (PRODUCTION_APP_HOSTS.has(host)) {
    return PRODUCTION_API_BASE_URL;
  }

  if ((host === "api.binge.institute" || host === "api.chill.institute") && currentOrigin) {
    return currentOrigin;
  }

  return null;
}
