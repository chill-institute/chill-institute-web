import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import { AuthPage } from "@/components/auth-page";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/sign-out")({
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: SignOutPage,
});

function SignOutPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();

  useEffect(() => {
    auth.signOut();
    void navigate({
      to: "/sign-in",
      search: {
        error: search.error,
        callbackUrl: undefined,
      },
      replace: true,
    });
  }, [auth, navigate, search.error]);

  return (
    <AuthPage centered title="Signing you out">
      <div className="flex flex-row items-center justify-center space-x-1.5 text-sm text-stone-700 dark:text-stone-300">
        <Loader className="animate-spin" />
        <span className="leading-none">Clearing your session...</span>
      </div>
    </AuthPage>
  );
}
