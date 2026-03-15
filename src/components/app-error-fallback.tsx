import {
  ClipboardCheck,
  ClipboardX,
  Copy,
  ExternalLink,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { buildErrorReport, buildGitHubIssueURL, formatErrorReport } from "@/lib/error-report";

type AppErrorFallbackProps = {
  error: unknown;
  componentStack?: string;
};

function getClientReportContext() {
  const routePath = typeof window === "undefined" ? "/" : window.location.pathname;
  const userAgent = typeof navigator === "undefined" ? "unknown" : navigator.userAgent;

  return {
    occurredAt: new Date().toISOString(),
    release: import.meta.env.VITE_PUBLIC_RELEASE ?? "dev",
    routePath,
    userAgent,
  };
}

export function AppErrorFallback({ error, componentStack }: AppErrorFallbackProps) {
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
        ...getClientReportContext(),
        componentStack,
        notes,
      }),
    [componentStack, error, notes],
  );

  const reportText = useMemo(() => formatErrorReport(report), [report]);
  const issueURL = useMemo(() => buildGitHubIssueURL(report), [report]);

  const copyLabel =
    copyState === "copied" ? "copied" : copyState === "error" ? "copy failed" : "copy report";

  const copyIcon =
    copyState === "copied" ? <ClipboardCheck /> : copyState === "error" ? <ClipboardX /> : <Copy />;

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded border border-stone-950 bg-stone-100 p-5 shadow-[2px_2px_0_rgba(12,10,9,1)] dark:border-stone-700 dark:bg-stone-900 dark:shadow-[2px_2px_0_rgba(68,64,60,1)]">
        <div className="flex items-start gap-3">
          <div className="rounded-full border border-red-500/40 bg-red-100 p-2 text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <TriangleAlert />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl leading-tight">Something went wrong.</h1>
            <p className="text-sm text-stone-700 dark:text-stone-300">
              The app hit a crash. Nothing is sent anywhere unless you choose to copy the report.
            </p>
          </div>
        </div>

        <div className="rounded border border-stone-950/15 bg-stone-50 p-3 text-sm dark:border-stone-700/70 dark:bg-stone-950/50">
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
            className="min-h-24 rounded border border-stone-950 bg-stone-100 px-3 py-2 outline-none hover:bg-stone-200 hover:transition-colors focus:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 dark:focus:bg-stone-800"
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

        <details className="rounded border border-stone-950/15 bg-stone-50 p-3 text-sm dark:border-stone-700/70 dark:bg-stone-950/50">
          <summary className="cursor-pointer select-none font-medium">
            Preview copied report
          </summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5">
            {reportText}
          </pre>
        </details>
      </div>
    </main>
  );
}
