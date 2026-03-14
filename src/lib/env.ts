const trim = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const STAGING_APP_HOSTS = new Set(["binge.institute", "www.binge.institute"]);
const PRODUCTION_APP_HOSTS = new Set(["chill.institute", "www.chill.institute"]);
const STAGING_API_BASE_URL = "https://api.binge.institute";
const PRODUCTION_API_BASE_URL = "https://api.chill.institute";
const PREVIEW_HOST = "web-8vr.pages.dev";
const STAGING_PREVIEW_HOST_SUFFIX = ".web-8vr.pages.dev";

export function getPublicAPIBaseURL() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();

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

    if (host === "api.binge.institute" || host === "api.chill.institute") {
      return window.location.origin;
    }

    const value = trim(import.meta.env.VITE_PUBLIC_API_BASE_URL);
    if (value) {
      return value;
    }

    return window.location.origin;
  }

  const value = trim(import.meta.env.VITE_PUBLIC_API_BASE_URL);
  if (value) {
    return value;
  }

  return "http://localhost:8080";
}
