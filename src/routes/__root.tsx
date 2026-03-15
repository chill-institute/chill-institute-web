import { createRootRouteWithContext, type ErrorComponentProps } from "@tanstack/react-router";

import type { RouterContext } from "@/router";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { AppErrorFallback } from "@/components/app-error-fallback";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
  errorComponent: RootError,
});

function Root() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <AppShell />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

function RootError({ error }: ErrorComponentProps) {
  return <AppErrorFallback error={error} />;
}
