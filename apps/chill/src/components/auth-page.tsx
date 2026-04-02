import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function AuthPage({
  title,
  description,
  children,
  centered = false,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  centered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full max-w-3xl flex-col gap-5",
        centered ? "items-center text-center" : "",
        className,
      )}
    >
      {title || description ? (
        <div className={cn("space-y-2", centered ? "items-center text-center" : "")}>
          {title ? (
            <h1 className="text-xl font-medium tracking-tight md:text-2xl">{title}</h1>
          ) : null}
          {description ? (
            <div className="max-w-3xl text-sm leading-7 text-stone-700 dark:text-stone-300 md:text-base">
              {description}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
