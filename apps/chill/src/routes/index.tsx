import { Navigate, createFileRoute } from "@tanstack/react-router";

import { readCurrentCallbackPath, useAuth } from "@/lib/auth";

/*
 * Chill is a search experience — the "/" route is just the welcome
 * shell that AppShell renders for the home pathname. The page itself
 * is intentionally empty so the search bar at the top is the
 * landmark, and the user types `/` (or focuses the input) to begin.
 */
export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    const callbackURL = readCurrentCallbackPath();
    return (
      <Navigate
        to="/sign-in"
        search={{ error: undefined, callbackUrl: callbackURL ?? undefined }}
        replace
      />
    );
  }

  return null;
}
