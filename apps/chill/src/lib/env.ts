import { resolveHostedAPIBaseURL } from "./api-origin";

const trim = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function getPublicAPIBaseURL() {
  const value = trim(import.meta.env.VITE_PUBLIC_API_BASE_URL);
  if (value) {
    return value;
  }

  if (typeof window !== "undefined") {
    const resolved = resolveHostedAPIBaseURL(window.location.hostname, window.location.origin);
    if (resolved) {
      return resolved;
    }

    return window.location.origin;
  }

  return "http://localhost:58780";
}
