import type { ReactNode } from "react";

import { cn } from "@chill-institute/ui/cn";

/*
 * The Institute auth card. Shared shape with binge's AuthPage — kangaroo
 * brand head + Family-serif title + optional italic subtitle, plus a body
 * slot for each route's content.
 *
 * Kept duplicated between apps per the workspace's "intentional duplication
 * until a real shared boundary is worth it" rule. If chill's auth pages
 * grow distinct chrome the divergence stays local; until then this file
 * mirrors apps/binge/src/components/auth-page.tsx.
 */
export function AuthPage({
  title,
  description,
  hideBrand = false,
  className,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  hideBrand?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const showHead = !hideBrand || title || description;
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 md:px-8">
      <div
        className={cn(
          "border-border-strong bg-surface shadow-[1px_1px_0_var(--color-border-strong)] w-full max-w-[480px] overflow-hidden rounded-xl border",
          className,
        )}
      >
        {showHead ? (
          <div className="border-border-strong flex items-center gap-3.5 border-b px-7 py-6">
            {hideBrand ? null : (
              <img
                src="/logo.png"
                width={44}
                height={44}
                alt=""
                className="border-border-strong rounded-md border"
              />
            )}
            <div className="min-w-0 flex-1">
              {title ? <h1 className="m-0 truncate text-[1.625rem]">{title}</h1> : null}
              {description ? (
                <p className="text-fg-3 mt-1 font-serif text-sm italic">{description}</p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-4 px-7 pt-6 pb-7">{children}</div>
      </div>
    </div>
  );
}
