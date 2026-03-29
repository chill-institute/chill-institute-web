import { Navigate, createFileRoute, useRouterState } from "@tanstack/react-router";

import { SettingsPanel } from "@/components/settings-panel";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const auth = useAuth();
  const callbackURL = useRouterState({ select: (state) => state.location.href });

  if (!auth.isAuthenticated) {
    return (
      <Navigate to="/sign-in" search={{ error: undefined, callbackUrl: callbackURL }} replace />
    );
  }

  return (
    <section data-page="settings">
      <SettingsPanel />
    </section>
  );
}
