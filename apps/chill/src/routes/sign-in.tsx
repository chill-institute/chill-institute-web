import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExternalLink, Loader } from "lucide-react";

import { AuthPage } from "@chill-institute/ui/components/auth-page";
import { Button } from "@chill-institute/ui/components/ui/button";
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
        message:
          "the institute is an exclusive extension for put.io users — it needs an active put.io membership to work.",
        type: ACCESS_DENIED_ERROR,
      };
    }
    if (search.error === SESSION_EXPIRED_ERROR) {
      return {
        message: "your session expired. sign in again to keep going.",
        type: SESSION_EXPIRED_ERROR,
      };
    }
    return {
      message:
        "something went sideways while signing you in. try clearing cookies, or pop a different browser open.",
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

  function startSignIn() {
    setLoading("sign-in");
    const callback = search.callbackUrl?.trim();
    if (callback) {
      const normalized = normalizeCallbackPath(callback);
      if (normalized) {
        auth.setPendingCallbackURL(normalized);
      }
    }
    window.location.href = getPutioStartURL(authSuccessURL);
  }

  return (
    <AuthPage
      title="welcome to the institute"
      description="search smarter. send to put.io. and chill."
    >
      {visibleError ? (
        <p className="m-0 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          {visibleError.message}
        </p>
      ) : (
        <p className="m-0 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          chill is an independent companion app for put.io users. you bring the put.io account, i
          bring the search and the send button. that&apos;s the whole deal.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {visibleError?.actionURL ? (
          <Button
            disabled={loading === "help"}
            onClick={() => {
              setLoading("help");
              window.location.href = visibleError.actionURL ?? publicLinks.about;
            }}
          >
            {loading === "help" ? <Loader className="animate-spin" /> : null}
            {visibleError.actionLabel ?? "learn more"}
          </Button>
        ) : null}
        <Button variant="primary" size="lg" disabled={loading === "sign-in"} onClick={startSignIn}>
          {loading === "sign-in" ? <Loader className="animate-spin" /> : <ExternalLink />}
          <span>
            {visibleError?.type === SESSION_EXPIRED_ERROR
              ? "sign in again"
              : visibleError
                ? "try again"
                : "sign in with put.io"}
          </span>
        </Button>
      </div>

      <p className="m-0 font-mono text-[0.6875rem] leading-relaxed text-stone-600 dark:text-stone-300">
        not affiliated with put.io. by alberto chillardinho.{" "}
        <a
          href={publicLinks.about}
          className="underline decoration-stone-700 underline-offset-2 dark:decoration-stone-300"
        >
          about
        </a>{" "}
        ·{" "}
        <a
          href={publicLinks.guides}
          className="underline decoration-stone-700 underline-offset-2 dark:decoration-stone-300"
        >
          guides
        </a>{" "}
        ·{" "}
        <a
          href={publicLinks.github}
          className="underline decoration-stone-700 underline-offset-2 dark:decoration-stone-300"
        >
          github
        </a>
      </p>
    </AuthPage>
  );
}
