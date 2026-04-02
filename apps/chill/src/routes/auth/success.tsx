import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import { AuthPage } from "@/components/auth-page";
import { UNKNOWN_AUTH_ERROR } from "@/lib/auth-errors";
import { consumeCallbackToken } from "@/lib/auth";

export const Route = createFileRoute("/auth/success")({
  beforeLoad: () => {
    const redirectPath = consumeCallbackToken();
    if (redirectPath) {
      throw redirect({ to: redirectPath });
    }
    throw redirect({
      to: "/sign-in",
      search: { error: UNKNOWN_AUTH_ERROR, callbackUrl: undefined },
    });
  },
  component: AuthSuccessFallback,
});

function AuthSuccessFallback() {
  return (
    <AuthPage centered title="Signing you in">
      <div className="flex flex-row items-center justify-center space-x-1.5 text-sm text-stone-700 dark:text-stone-300">
        <Loader className="animate-spin" />
        <span className="leading-none">Finalizing your session...</span>
      </div>
    </AuthPage>
  );
}
