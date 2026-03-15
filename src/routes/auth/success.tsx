import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ErrorAlert } from "@/components/ui/error-alert";
import { UNKNOWN_AUTH_ERROR } from "@/lib/auth-errors";
import { normalizeCallbackPath, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth/success")({
  component: AuthSuccessPage,
});

function AuthSuccessPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const token = (fragment.get("auth_token") ?? query.get("auth_token") ?? "").trim();
    if (token) {
      auth.setAuthToken(token);
      window.history.replaceState(null, "", "/auth/success");
      const callbackURL = normalizeCallbackPath(auth.consumePendingCallbackURL());
      if (callbackURL) {
        window.location.replace(callbackURL);
      } else {
        void navigate({ to: "/" });
      }
      return;
    }
    setError("Missing auth token in callback.");
  }, [auth, navigate]);

  return (
    <>
      {error ? (
        <div className="flex flex-col gap-2">
          <ErrorAlert>{error}</ErrorAlert>
          <button
            type="button"
            className="btn w-fit"
            onClick={() =>
              void navigate({
                to: "/sign-in",
                search: { error: UNKNOWN_AUTH_ERROR, callbackUrl: undefined },
              })
            }
          >
            back to sign in
          </button>
        </div>
      ) : (
        <p>Signing you in...</p>
      )}
    </>
  );
}
