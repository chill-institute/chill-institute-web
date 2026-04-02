import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ErrorAlertProps = {
  children: ReactNode;
  className?: string;
};

export function ErrorAlert({ children, className }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded border px-3 py-2 text-sm",
        "border-red-400/50 bg-red-100/50 text-red-800",
        "dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
