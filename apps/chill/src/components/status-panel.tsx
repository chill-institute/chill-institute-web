import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type StatusPanelProps = {
  children: ReactNode;
  className?: string;
};

export function StatusPanel({ children, className }: StatusPanelProps) {
  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div
        className={cn(
          "mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-xl border border-stone-950/15 bg-stone-50/95 p-6 shadow-sm",
          "dark:border-stone-700/70 dark:bg-stone-950/70",
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}
