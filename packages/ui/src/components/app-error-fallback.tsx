import {
  ClipboardCheck,
  ClipboardX,
  Copy,
  ExternalLink,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StatusPanel } from "./status-panel";
import { buildErrorReport, buildGitHubIssueURL, formatErrorReport } from "../lib/error-report";

type AppErrorFallbackProps = {
  /** Identifier baked into the JSON crash report — e.g. "binge.institute/web". */
  app: string;
  error: unknown;
  componentStack?: string;
  /** Build release identifier — defaults to `import.meta.env.VITE_PUBLIC_RELEASE`. */
  release?: string;
};

function getClientReportContext(release?: string) {
  const routePath = typeof window === "undefined" ? "/" : window.location.pathname;
  const userAgent = typeof navigator === "undefined" ? "unknown" : navigator.userAgent;

  return {
    occurredAt: new Date().toISOString(),
    release: release ?? "dev",
    routePath,
    userAgent,
  };
}

/*
 * Crash fallback shared between binge and chill. The boundary mounts
 * this once an error escapes React; it shows the message, lets the
 * user copy a JSON report, and offers a one-click GitHub issue link.
 *
 * `app` lets each surface tag the report so a dropped crash report
 * still says which app produced it. The release / userAgent / route
 * context is derived at render time from `window`.
 */
function AppErrorFallback({ app, error, componentStack, release }: AppErrorFallbackProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => setCopyState("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const report = useMemo(
    () =>
      buildErrorReport(error, {
        app,
        ...getClientReportContext(release),
        componentStack,
        notes,
      }),
    [app, componentStack, error, notes, release],
  );

  const reportText = useMemo(() => formatErrorReport(report), [report]);
  const issueURL = useMemo(() => buildGitHubIssueURL(report), [report]);

  const copyLabel =
    copyState === "copied" ? "copied" : copyState === "error" ? "copy failed" : "copy report";

  const copyIcon =
    copyState === "copied" ? <ClipboardCheck /> : copyState === "error" ? <ClipboardX /> : <Copy />;

  return (
    <StatusPanel>
      <div className="flex items-start gap-3">
        <div className="rounded-full border border-red-500/40 bg-red-100 p-2 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <TriangleAlert />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl leading-7">Something went wrong.</h1>
          <p className="text-fg-2 text-sm">
            The app hit a crash. Nothing is sent anywhere unless you choose to copy the report.
          </p>
        </div>
      </div>

      <div className="border-border-strong/15 bg-surface-2 dark:border-border-strong/70 dark:bg-surface-2/50 rounded border p-3 text-sm">
        <div>
          <strong>Message:</strong> {report.error.message}
        </div>
        <div>
          <strong>Route:</strong> {report.routePath}
        </div>
        <div>
          <strong>Release:</strong> {report.release}
        </div>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">What were you doing?</span>
        <textarea
          className="input min-h-24 px-3 py-2"
          placeholder="Optional notes to include in the copied report."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
        >
          <RefreshCw />
          reload page
        </button>
        <button
          type="button"
          className="btn"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(reportText);
              setCopyState("copied");
            } catch {
              setCopyState("error");
            }
          }}
        >
          {copyIcon}
          {copyLabel}
        </button>
        <a href={issueURL} target="_blank" rel="noreferrer" className="btn">
          <ExternalLink />
          create GitHub issue
        </a>
      </div>

      <details className="border-border-strong/15 bg-surface-2 dark:border-border-strong/70 dark:bg-surface-2/50 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-medium select-none">Preview copied report</summary>
        <pre className="mt-3 overflow-x-auto text-xs leading-5 break-words whitespace-pre-wrap">
          {reportText}
        </pre>
      </details>
    </StatusPanel>
  );
}

export { AppErrorFallback };
