import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

const AUTH_TOKEN_STORAGE_KEY = "chill.auth_token";
const AUTH_CALLBACK_STORAGE_KEY = "chill.auth_callback";

type AuthContextValue = {
  authToken: string | null;
  isAuthenticated: boolean;
  setAuthToken: (token: string) => void;
  setPendingCallbackURL: (url: string) => void;
  consumePendingCallbackURL: () => string | null;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function readStoredToken() {
  const raw = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const token = raw?.trim() ?? "";
  return token.length > 0 ? token : null;
}

export function storePendingCallbackURL(url: string) {
  const normalized = normalizeCallbackPath(url);
  if (!normalized) {
    window.sessionStorage.removeItem(AUTH_CALLBACK_STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(AUTH_CALLBACK_STORAGE_KEY, normalized);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthTokenState] = useState<string | null>(() => readStoredToken());

  const value = useMemo<AuthContextValue>(() => {
    return {
      authToken,
      isAuthenticated: authToken !== null,
      setAuthToken: (token: string) => {
        const trimmed = token.trim();
        if (trimmed.length === 0) {
          return;
        }
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, trimmed);
        setAuthTokenState(trimmed);
      },
      setPendingCallbackURL: (url: string) => {
        storePendingCallbackURL(url);
      },
      consumePendingCallbackURL: () => {
        const value = window.sessionStorage.getItem(AUTH_CALLBACK_STORAGE_KEY)?.trim() ?? "";
        window.sessionStorage.removeItem(AUTH_CALLBACK_STORAGE_KEY);
        return value.length > 0 ? value : null;
      },
      signOut: () => {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        window.sessionStorage.removeItem(AUTH_CALLBACK_STORAGE_KEY);
        setAuthTokenState(null);
      },
    };
  }, [authToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function normalizeCallbackPath(raw: null | string): null | string {
  const trimmed = raw?.trim() ?? "";
  if (trimmed.length === 0) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      return null;
    }
    if (
      parsed.pathname === "/sign-in" ||
      parsed.pathname === "/sign-out" ||
      parsed.pathname.startsWith("/auth/")
    ) {
      return null;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function readCurrentCallbackPath(): null | string {
  if (typeof window === "undefined") {
    return null;
  }

  return normalizeCallbackPath(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
}

export function readAuthTokenFromLocation(location: Pick<Location, "hash" | "search">): string {
  const fragment = new URLSearchParams(location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(location.search);
  return (fragment.get("auth_token") ?? query.get("auth_token") ?? "").trim();
}

export function consumeCallbackToken(): string | null {
  const token = readAuthTokenFromLocation(window.location);
  if (!token) {
    return null;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  window.history.replaceState(null, "", "/auth/success");

  const pending = window.sessionStorage.getItem(AUTH_CALLBACK_STORAGE_KEY)?.trim() ?? "";
  window.sessionStorage.removeItem(AUTH_CALLBACK_STORAGE_KEY);
  const callbackPath = normalizeCallbackPath(pending || null);

  return callbackPath ?? "/";
}
