import { describe, expect, it } from "vite-plus/test";

import { buildErrorReport, buildGitHubIssueURL, formatErrorReport } from "./error-report";

describe("buildErrorReport", () => {
  it("normalizes error objects into a copyable report", () => {
    const error = new Error("kaboom");
    error.name = "ExplosionError";

    const report = buildErrorReport(error, {
      app: "binge.institute/web",
      componentStack: "\n    at AppShell",
      notes: "  I opened settings.  ",
      occurredAt: "2026-03-15T01:23:45.000Z",
      release: "test-release",
      routePath: "/settings",
      userAgent: "Unit Test Browser",
    });

    expect(report).toEqual({
      app: "binge.institute/web",
      componentStack: "at AppShell",
      error: {
        message: "kaboom",
        name: "ExplosionError",
        stack: error.stack,
      },
      notes: "I opened settings.",
      occurredAt: "2026-03-15T01:23:45.000Z",
      release: "test-release",
      routePath: "/settings",
      userAgent: "Unit Test Browser",
    });
  });

  it("falls back gracefully for non-Error values", () => {
    const report = buildErrorReport("oops", {
      app: "chill.institute/web",
      occurredAt: "2026-03-15T01:23:45.000Z",
      release: "test-release",
      routePath: "search",
      userAgent: "Unit Test Browser",
    });

    expect(report).toEqual({
      app: "chill.institute/web",
      componentStack: undefined,
      error: {
        message: "oops",
        name: "Error",
        stack: undefined,
      },
      notes: undefined,
      occurredAt: "2026-03-15T01:23:45.000Z",
      release: "test-release",
      routePath: "/",
      userAgent: "Unit Test Browser",
    });
  });
});

describe("formatErrorReport", () => {
  it("renders stable pretty JSON", () => {
    const output = formatErrorReport(
      buildErrorReport(new Error("kaboom"), {
        app: "binge.institute/web",
        occurredAt: "2026-03-15T01:23:45.000Z",
        release: "test-release",
        routePath: "/",
        userAgent: "Unit Test Browser",
      }),
    );

    expect(output).toContain('"app": "binge.institute/web"');
    expect(output).toContain('"routePath": "/"');
    expect(output).toContain('"release": "test-release"');
  });
});

describe("buildGitHubIssueURL", () => {
  it("prefills the bug template with the report details", () => {
    const report = buildErrorReport(new Error("kaboom"), {
      app: "binge.institute/web",
      notes: "Open home page\nOpen settings",
      occurredAt: "2026-03-15T01:23:45.000Z",
      release: "test-release",
      routePath: "/settings",
      userAgent: "Unit Test Browser",
    });

    const url = new URL(buildGitHubIssueURL(report));

    expect(url.origin + url.pathname).toBe(
      "https://github.com/chill-institute/chill-web/issues/new",
    );
    expect(url.searchParams.get("template")).toBe("bug_report.md");
    expect(url.searchParams.get("title")).toContain("[bug] Crash on /settings");
    expect(url.searchParams.get("body")).toContain("## Crash report");
    expect(url.searchParams.get("body")).toContain("1. Open home page");
    expect(url.searchParams.get("body")).toContain('"release": "test-release"');
  });
});
