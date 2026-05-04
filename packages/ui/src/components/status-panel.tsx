import type { ReactNode } from "react";

import { cn } from "../lib/cn";

/*
 * Full-page status surface — the bordered card that fills the viewport
 * for crash fallbacks, backend-down screens, and other "the app is in a
 * recoverable error state" pages. One token-aware shell so each screen
 * keeps the same rhythm.
 */
type StatusPanelProps = {
  children: ReactNode;
  className?: string;
};

function StatusPanel({ children, className }: StatusPanelProps) {
  return (
    <main className="min-h-dvh px-4 py-8 md:py-12">
      <div
        data-slot="status-panel"
        className={cn(
          "border-border-strong/15 bg-surface-2/95 dark:border-border-strong/70 dark:bg-surface-2/70 mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-xl border p-6 shadow-sm",
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}

export { StatusPanel };
