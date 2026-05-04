import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import { AuthPage } from "@chill-institute/ui/components/auth-page";
import { UNKNOWN_AUTH_ERROR } from "@chill-institute/api/auth-errors";
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
    <AuthPage title="signing you in">
      <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
        <Loader className="animate-spin" />
        <span>finalizing your session…</span>
      </div>
    </AuthPage>
  );
}
