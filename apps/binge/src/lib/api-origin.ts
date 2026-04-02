const PRODUCTION_APP_HOSTS = new Set(["binge.institute", "www.binge.institute"]);
const PRODUCTION_API_BASE_URL = "https://api.chill.institute";

const STAGING_APP_HOSTS = new Set(["staging.binge.institute"]);
const STAGING_API_BASE_URL = "https://staging-api.chill.institute";
const PREVIEW_HOST = "binge-institute.pages.dev";
const PREVIEW_HOST_SUFFIX = ".binge-institute.pages.dev";

export function resolveHostedAPIBaseURL(hostname: string, currentOrigin?: string) {
  const host = hostname.trim().toLowerCase();

  if (STAGING_APP_HOSTS.has(host)) {
    return STAGING_API_BASE_URL;
  }

  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === PREVIEW_HOST ||
    host.endsWith(PREVIEW_HOST_SUFFIX) ||
    PRODUCTION_APP_HOSTS.has(host)
  ) {
    return PRODUCTION_API_BASE_URL;
  }

  if (host === "api.chill.institute" && currentOrigin) {
    return currentOrigin;
  }

  return null;
}
