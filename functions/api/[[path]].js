const STAGING_APP_HOSTS = new Set(["binge.institute", "www.binge.institute"]);
const PRODUCTION_APP_HOSTS = new Set(["chill.institute", "www.chill.institute"]);
const PREVIEW_HOST = "web-8vr.pages.dev";
const STAGING_PREVIEW_HOST_SUFFIX = ".web-8vr.pages.dev";

function resolveHostedAPIBaseURL(hostname) {
  const host = hostname.trim().toLowerCase();

  if (
    host === PREVIEW_HOST ||
    host.endsWith(STAGING_PREVIEW_HOST_SUFFIX) ||
    STAGING_APP_HOSTS.has(host)
  ) {
    return "https://api.binge.institute";
  }

  if (PRODUCTION_APP_HOSTS.has(host)) {
    return "https://api.chill.institute";
  }

  return "https://api.binge.institute";
}

export function onRequest({ request }) {
  const url = new URL(request.url);
  const apiOrigin = resolveHostedAPIBaseURL(url.hostname);
  const forwardedPath = url.pathname.replace(/^\/api(?=\/|$)/, "") || "/";
  const target = new URL(`${forwardedPath}${url.search}`, apiOrigin);

  return Response.redirect(target.toString(), 307);
}
