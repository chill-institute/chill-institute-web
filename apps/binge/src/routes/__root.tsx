import {
  createRootRouteWithContext,
  Navigate,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import type { RouterContext } from "@/router";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { AppErrorFallback } from "@/components/app-error-fallback";
import { AppShell } from "@/components/app-shell";
import { BackendUnavailableScreen } from "@/components/backend-unavailable-screen";
import { AuthProvider } from "@/lib/auth";
import { BackendHealthProvider, useBackendUnavailable } from "@/hooks/use-backend-unavailable";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
  errorComponent: RootError,
  notFoundComponent: RootNotFound,
});

function Root() {
  return (
    <AppErrorBoundary>
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
  return <AppErrorFallback error={error} />;
}

function RootNotFound() {
  return <Navigate to="/" replace />;
}
