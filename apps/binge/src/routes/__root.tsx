import {
  createRootRouteWithContext,
  Navigate,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import type { RouterContext } from "@/router";
import { AppErrorBoundary } from "@chill-institute/ui/components/app-error-boundary";
import { AppErrorFallback } from "@chill-institute/ui/components/app-error-fallback";
import { AppShell } from "@/components/app-shell";
import { BackendUnavailableScreen } from "@chill-institute/ui/components/backend-unavailable-screen";
import { AuthProvider } from "@/lib/auth";
import { BackendHealthProvider, useBackendUnavailable } from "@/hooks/use-backend-unavailable";
import { Toaster } from "@chill-institute/ui/components/ui/toaster";
import { TooltipProvider } from "@chill-institute/ui/components/ui/tooltip";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
  errorComponent: RootError,
  notFoundComponent: RootNotFound,
});

function Root() {
  return (
    <AppErrorBoundary app="binge.institute/web" release={import.meta.env.VITE_PUBLIC_RELEASE}>
      <AuthProvider>
        <TooltipProvider>
          <BackendHealthProvider>
            <RootContent />
          </BackendHealthProvider>
        </TooltipProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

function RootContent() {
  const { isBackendUnavailable, retry } = useBackendUnavailable();

  if (isBackendUnavailable) {
    return <BackendUnavailableScreen onRetry={retry} />;
  }

  return (
    <>
      <AppShell />
      <Toaster />
    </>
  );
}

function RootError({ error }: ErrorComponentProps) {
  return (
    <AppErrorFallback
      app="binge.institute/web"
      release={import.meta.env.VITE_PUBLIC_RELEASE}
      error={error}
    />
  );
}

function RootNotFound() {
  return <Navigate to="/" replace />;
}
