import { LogIn, RefreshCw } from "lucide-react";

import { ErrorAlert } from "@/components/ui/error-alert";
import { getPutioStartURL } from "@/lib/api";
import { readCurrentCallbackPath, storePendingCallbackURL } from "@/lib/auth";
import { isPutioProviderUnavailableError, toErrorMessage } from "@/lib/errors";

type UserErrorAlertProps = {
  error: unknown;
  className?: string;
};

function retrySignIn() {
  const callbackPath = readCurrentCallbackPath();
  if (callbackPath) {
    storePendingCallbackURL(callbackPath);
  }

  const successURL = new URL("/auth/success", window.location.origin).toString();
  window.location.href = getPutioStartURL(successURL);
}

export function UserErrorAlert({ error, className }: UserErrorAlertProps) {
  if (!isPutioProviderUnavailableError(error)) {
    return <ErrorAlert className={className}>{toErrorMessage(error)}</ErrorAlert>;
  }

  return (
    <ErrorAlert className={className}>
      <div className="space-y-3">
        <div className="space-y-1">
          <div>Could not connect to put.io. Please try again.</div>
          <div className="text-xs text-red-700/80 dark:text-red-300/80">
            If this keeps happening, sign in again to refresh your put.io session.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-secondary h-8 text-xs"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="text-xs" />
            retry
          </button>
          <button type="button" className="btn h-8 text-xs" onClick={retrySignIn}>
            <LogIn className="text-xs" />
            sign in again
          </button>
        </div>
      </div>
    </ErrorAlert>
  );
}
