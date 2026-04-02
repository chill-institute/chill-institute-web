import { ExternalLink, RefreshCw, ServerCrash } from "lucide-react";

import { StatusPanel } from "@/components/status-panel";

type BackendUnavailableScreenProps = {
  onRetry?: () => Promise<unknown> | void;
};

export function BackendUnavailableScreen({ onRetry }: BackendUnavailableScreenProps) {
  return (
    <StatusPanel>
      <div className="flex items-start gap-3">
        <div className="rounded-full border border-red-500/40 bg-red-100 p-2 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <ServerCrash />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl leading-tight">The Institute is having a moment...</h1>
          <p className="text-sm text-stone-700 dark:text-stone-300">
            We could not reach the API cleanly. This is usually a brief deploy blip or a temporary
            outage, not a sign-out.
          </p>
        </div>
      </div>

      <div className="rounded border border-stone-950/15 bg-stone-50 p-3 text-sm dark:border-stone-700/70 dark:bg-stone-950/50">
        <div>Try again in a moment.</div>
        <div className="text-stone-600 dark:text-stone-400">
          If this keeps happening, a page reload usually confirms whether the backend is back.
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            void onRetry?.();
            window.location.reload();
          }}
        >
          <RefreshCw />
          reload page
        </button>
        <a href="https://status.chill.institute/" target="_blank" rel="noreferrer" className="btn">
          <ExternalLink />
          view status page
        </a>
      </div>
    </StatusPanel>
  );
}
