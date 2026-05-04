import { LogIn, RefreshCw } from "lucide-react";

import { ErrorAlert } from "@chill-institute/ui/components/ui/error-alert";
import { getPutioStartURL } from "@/lib/api";
import { readCurrentCallbackPath, storePendingCallbackURL } from "@/lib/auth";
import { localizeError, type LocalizedErrorRecoveryAction } from "@/lib/errors";

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

function renderAction(action: LocalizedErrorRecoveryAction) {
  switch (action.kind) {
    case "retry":
      return (
        <button
          key={action.kind}
          type="button"
          className="btn btn-secondary h-8 text-xs"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="size-3.5" />
          {action.label}
        </button>
      );
    case "sign-in-again":
      return (
        <button key={action.kind} type="button" className="btn h-8 text-xs" onClick={retrySignIn}>
          <LogIn className="size-3.5" />
          {action.label}
        </button>
      );
  }

  const exhaustive: never = action;
  throw new Error(`Unhandled recovery action: ${JSON.stringify(exhaustive)}`);
}

export function UserErrorAlert({ error, className }: UserErrorAlertProps) {
  const localized = localizeError(error);
  const suggestion = localized.recoverySuggestion;

  if (!suggestion?.description && !suggestion?.actions?.length) {
    return <ErrorAlert className={className}>{localized.message}</ErrorAlert>;
  }

  return (
    <ErrorAlert className={className}>
      <div className="space-y-3">
        <div className="space-y-1">
          <div>{localized.message}</div>
          {suggestion.description ? (
            <div className="text-xs text-red-700/80 dark:text-red-300/80">
              {suggestion.description}
            </div>
          ) : null}
        </div>

        {suggestion.actions?.length ? (
          <div className="flex flex-wrap gap-2">{suggestion.actions.map(renderAction)}</div>
        ) : null}
      </div>
    </ErrorAlert>
  );
}
