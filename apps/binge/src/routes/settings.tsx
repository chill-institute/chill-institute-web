import { Navigate, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";

import { SettingsModal } from "@/components/settings-modal";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const callbackURL = useRouterState({ select: (state) => state.location.href });

  if (!auth.isAuthenticated) {
    return (
      <Navigate to="/sign-in" search={{ error: undefined, callbackUrl: callbackURL }} replace />
    );
  }

  return (
    <SettingsModal
      open
      onOpenChange={(open) => {
        if (!open) {
          void navigate({ to: "/" });
        }
      }}
    />
  );
}
