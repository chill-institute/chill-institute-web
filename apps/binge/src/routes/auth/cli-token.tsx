import { useState } from "react";
import { createFileRoute, Navigate, useRouterState } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";

import { AuthPage } from "@chill-institute/ui/components/auth-page";
import { CopyButton } from "@chill-institute/ui/components/copy-button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth/cli-token")({
  component: CliTokenPage,
});

function CliTokenPage() {
  const auth = useAuth();
  const callbackURL = useRouterState({ select: (state) => state.location.href });
  const [revealed, setRevealed] = useState(false);

  if (!auth.isAuthenticated || !auth.authToken) {
    return (
      <Navigate to="/sign-in" search={{ error: undefined, callbackUrl: callbackURL }} replace />
    );
  }

  return (
    <AuthPage
      title="CLI token"
      description="Use this token when you need to authenticate a CLI session on another machine or for an agent that cannot use the localhost callback flow."
    >
      <div className="flex items-center gap-3 rounded border border-amber-500/40 bg-amber-50/80 px-4 py-3 text-sm leading-7 text-amber-950 dark:border-amber-400/25 dark:bg-amber-950/20 dark:text-amber-100 md:text-base">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <p className="leading-7">
          Treat this token like a password. Anyone with it can act as your account until you sign
          out or replace the token.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="cli-token"
          className="text-sm font-medium text-stone-900 dark:text-stone-50 md:text-base"
        >
          Access token
        </label>
        <div className="flex items-center gap-2">
          <input
            id="cli-token"
            readOnly
            type={revealed ? "text" : "password"}
            value={auth.authToken}
            className="input h-11 flex-1 px-3 font-mono text-sm text-stone-950 dark:text-stone-50 md:text-base"
            aria-label="CLI auth token"
          />
          <button
            type="button"
            className="btn btn-secondary h-11 shrink-0 px-3 text-sm md:text-base"
            onClick={() => setRevealed((current) => !current)}
          >
            <span className="flex items-center gap-2">
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{revealed ? "hide" : "show"}</span>
            </span>
          </button>
          <CopyButton value={auth.authToken} className="h-11 shrink-0 px-3 text-sm md:text-base" />
        </div>
      </div>
    </AuthPage>
  );
}
