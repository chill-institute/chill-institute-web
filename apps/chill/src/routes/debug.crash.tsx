import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/debug/crash")({
  component: DebugCrashPage,
});

function DebugCrashPage() {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.location.hostname !== "localhost") {
    return <Navigate to="/" replace />;
  }

  throw new Error("Intentional debug crash for the local error fallback.");
}
