import { resolveHostedAPIBaseURL } from "./api-origin";

const trim = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function getPublicAPIBaseURL() {
  if (typeof window !== "undefined") {
    const resolved = resolveHostedAPIBaseURL(window.location.hostname, window.location.origin);
    if (resolved) {
      return resolved;
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
