type ErrorReport = {
  app: "binge.institute/web";
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

export function buildErrorReport(
  error: unknown,
  { componentStack, notes, occurredAt, release, routePath, userAgent }: BuildErrorReportOptions,
): ErrorReport {
  const normalizedNotes = notes?.trim();
  const normalizedComponentStack = componentStack?.trim();

  return {
    app: "binge.institute/web",
    componentStack: normalizedComponentStack || undefined,
    error: normalizeError(error),
    notes: normalizedNotes || undefined,
    occurredAt,
    release,
    routePath: normalizeRoutePath(routePath),
    userAgent,
  };
}

export function formatErrorReport(report: ErrorReport) {
  return JSON.stringify(report, null, 2);
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}

export function buildGitHubIssueURL(report: ErrorReport) {
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
