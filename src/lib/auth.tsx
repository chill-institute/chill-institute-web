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
        const trimmed = url.trim();
        if (trimmed.length === 0) {
          return;
        }
        window.sessionStorage.setItem(AUTH_CALLBACK_STORAGE_KEY, trimmed);
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
