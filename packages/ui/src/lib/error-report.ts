/*
 * Crash report shape shared between binge and chill. The `app` field
 * is supplied by the caller so the same helpers serve both surfaces;
 * the GitHub issue URL is fixed at chill-institute/chill-web because
 * both apps live in this repo.
 */
type ErrorReport = {
  app: string;
  componentStack?: string;
  error: {
    message: string;
    name: string;
    stack?: string;
  };
  notes?: string;
  occurredAt: string;
  release: string;
  routePath: string;
  userAgent: string;
};

type BuildErrorReportOptions = {
  app: string;
  componentStack?: string;
  notes?: string;
  occurredAt: string;
  release: string;
  routePath: string;
  userAgent: string;
};

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack || undefined,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      name: "Error",
      stack: undefined,
    };
  }

  return {
    message: "Unknown error",
    name: "Error",
    stack: undefined,
  };
}

function normalizeRoutePath(routePath: string) {
  if (!routePath.startsWith("/")) {
    return "/";
  }
  return routePath;
}

function buildErrorReport(
  error: unknown,
  {
    app,
    componentStack,
    notes,
    occurredAt,
    release,
    routePath,
    userAgent,
  }: BuildErrorReportOptions,
): ErrorReport {
  const normalizedNotes = notes?.trim();
  const normalizedComponentStack = componentStack?.trim();

  return {
    app,
    componentStack: normalizedComponentStack || undefined,
    error: normalizeError(error),
    notes: normalizedNotes || undefined,
    occurredAt,
    release,
    routePath: normalizeRoutePath(routePath),
    userAgent,
  };
}

function formatErrorReport(report: ErrorReport) {
  return JSON.stringify(report, null, 2);
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}

function buildGitHubIssueURL(report: ErrorReport) {
  const title = truncate(`[bug] Crash on ${report.routePath}: ${report.error.message}`, 200);
  const stepsToReproduce = report.notes
    ? report.notes
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  const body = [
    "## Summary",
    "",
    `The app crashed on \`${report.routePath}\`.`,
    "",
    "## Steps to Reproduce",
    "",
    stepsToReproduce.length > 0
      ? stepsToReproduce.map((line, index) => `${index + 1}. ${line}`).join("\n")
      : "1. Open the app.\n2. Trigger the problem.\n3. Observe the crash fallback.",
    "",
    "## Expected",
    "",
    "The page should keep working without crashing.",
    "",
    "## Actual",
    "",
    "The app showed the crash fallback.",
    "",
    "## Environment",
    "",
    `- App: ${report.app}`,
    `- URL: ${report.routePath}`,
    `- Browser: ${report.userAgent}`,
    `- Commit / release: ${report.release}`,
    "",
    "## Crash report",
    "",
    "```json",
    formatErrorReport(report),
    "```",
  ].join("\n");

  const url = new URL("https://github.com/chill-institute/chill-web/issues/new");
  url.searchParams.set("template", "bug_report.md");
  url.searchParams.set("title", title);
  url.searchParams.set("body", body);
  return url.toString();
}

export { buildErrorReport, buildGitHubIssueURL, formatErrorReport };
export type { ErrorReport };
