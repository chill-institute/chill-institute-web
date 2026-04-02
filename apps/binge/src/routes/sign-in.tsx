import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import { AuthPage } from "@/components/auth-page";
import { getPutioStartURL } from "@/lib/api";
import { ACCESS_DENIED_ERROR, SESSION_EXPIRED_ERROR, UNKNOWN_AUTH_ERROR } from "@/lib/auth-errors";
import { normalizeCallbackPath, useAuth } from "@/lib/auth";
import { publicLinks } from "@/lib/public-links";

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === "string" ? search.error : undefined,
    callbackUrl: typeof search.callbackUrl === "string" ? search.callbackUrl : undefined,
  }),
  component: SignInPage,
});

function SignInPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [loading, setLoading] = useState<null | "help" | "sign-in">(null);
  const authSuccessURL = useMemo(
    () => new URL("/auth/success", window.location.origin).toString(),
    [],
  );

  const error = useMemo(() => {
    if (!search.error) {
      return null;
    }
    if (search.error === ACCESS_DENIED_ERROR) {
      return {
        actionLabel: "learn more",
        actionURL: publicLinks.about,
        message: (
          <p>
            The Institute is an exclusive extension for put.io users and it requires an active
            put.io membership in to work.
            <br />
          </p>
        ),
        type: ACCESS_DENIED_ERROR,
      };
    }
    if (search.error === SESSION_EXPIRED_ERROR) {
      return {
        message: "Your session has expired, please sign in again.",
        type: SESSION_EXPIRED_ERROR,
      };
    }
    return {
      message: (
        <p>
          An error occurred while signing you in.
          <br />
          Please try clearing your cookies or signing in with a different browser.
        </p>
      ),
      type: UNKNOWN_AUTH_ERROR,
    };
  }, [search.error]);
  const visibleError = loading === "sign-in" ? null : error;

  useEffect(() => {
    if (!auth.isAuthenticated) {
      return;
    }
    const callback = search.callbackUrl?.trim();
    const normalized = callback ? normalizeCallbackPath(callback) : null;
    if (normalized) {
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (current !== normalized) {
        window.location.replace(normalized);
        return;
      }
    }
    void navigate({ to: "/", replace: true });
  }, [auth.isAuthenticated, navigate, search.callbackUrl]);

  if (auth.isAuthenticated) {
    return <p>Redirecting...</p>;
  }

  return (
    <AuthPage centered>
      {visibleError ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center text-center">{visibleError?.message}</div>
          <div className="flex flex-row space-x-4">
            <AuthButton
              busy={loading === "help"}
              onClick={() => {
                setLoading("help");
                window.location.href = visibleError?.actionURL ?? "/about";
              }}
            >
              {visibleError?.actionLabel ?? "get help"}
            </AuthButton>
            <AuthButton
              busy={loading === "sign-in"}
              onClick={() => {
                setLoading("sign-in");
                const callback = search.callbackUrl?.trim();
                if (callback) {
                  const normalized = normalizeCallbackPath(callback);
                  if (normalized) {
                    auth.setPendingCallbackURL(normalized);
                  }
                }
                window.location.href = getPutioStartURL(authSuccessURL);
              }}
            >
              {visibleError?.type === SESSION_EXPIRED_ERROR ? "sign in again" : "try again"}
            </AuthButton>
          </div>
        </div>
      ) : (
        <AuthButton
          busy={loading === "sign-in"}
          onClick={() => {
            setLoading("sign-in");
            const callback = search.callbackUrl?.trim();
            if (callback) {
              const normalized = normalizeCallbackPath(callback);
              if (normalized) {
                auth.setPendingCallbackURL(normalized);
              }
            }
            window.location.href = getPutioStartURL(authSuccessURL);
          }}
        >
          authenticate at put.io
        </AuthButton>
      )}
    </AuthPage>
  );
}

function AuthButton({
  busy = false,
  children,
  onClick,
}: {
  busy?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`btn ${busy ? "cursor-wait" : ""}`} onClick={onClick}>
      <span className="flex flex-row space-x-1 items-center justify-center text-sm">
        {busy ? <Loader className="animate-spin text-xs" /> : null}
        <span className="leading-none">{children}</span>
      </span>
    </button>
  );
}
