import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import { AuthPage } from "@/components/auth-page";
import { ErrorAlert } from "@/components/ui/error-alert";
import { UNKNOWN_AUTH_ERROR } from "@/lib/auth-errors";
import { normalizeCallbackPath, readAuthTokenFromLocation, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth/success")({
  component: AuthSuccessPage,
});

function AuthSuccessPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const consumed = useRef(false);

  useEffect(() => {
    if (consumed.current) return;
    const token = readAuthTokenFromLocation(window.location);
    if (token) {
      consumed.current = true;
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
    <AuthPage centered title={error ? "Could not finish sign-in" : "Signing you in"}>
      {error ? (
        <div className="flex flex-col items-center gap-3">
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
        <div className="flex flex-row items-center justify-center space-x-1.5 text-sm text-stone-700 dark:text-stone-300">
          <Loader className="animate-spin" />
          <span className="leading-none">Finalizing your session...</span>
        </div>
      )}
    </AuthPage>
  );
}
