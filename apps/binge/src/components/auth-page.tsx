import type { ReactNode } from "react";

import { cn } from "@chill-institute/ui/cn";

/*
 * The Institute auth card. One bordered surface with a header that carries
 * the kangaroo mark + Family-serif title, and a body slot that each route
 * fills with its own content (sign-in CTA, loader, CLI token, etc).
 *
 * The shell is intentionally not a Dialog / Modal — these are full-page
 * routes (`/sign-in`, `/sign-out`, `/auth/*`), so the AppShell already
 * skips its own header on these paths and lets this card own the page.
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
          "w-full max-w-[480px] overflow-hidden rounded-xl border border-stone-950 bg-stone-100 shadow-[1px_1px_0_var(--color-stone-950)] dark:border-stone-700 dark:bg-stone-900 dark:shadow-[1px_1px_0_var(--color-stone-700)]",
          className,
        )}
      >
        {showHead ? (
          <div className="flex items-center gap-3.5 border-b border-stone-950 px-7 py-6 dark:border-stone-700">
            {hideBrand ? null : (
              <img
                src="/logo.png"
                width={44}
                height={44}
                alt=""
                className="rounded-md border border-stone-950 dark:border-stone-700"
              />
            )}
            <div className="min-w-0 flex-1">
              {title ? (
                <h1 className="m-0 truncate font-serif text-[1.625rem] leading-tight font-normal tracking-tight text-stone-950 dark:text-stone-100">
                  {title}
                </h1>
              ) : null}
              {description ? (
                <p className="mt-1 font-serif text-sm italic text-stone-700 dark:text-stone-300">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-4 px-7 pt-6 pb-7">{children}</div>
      </div>
    </div>
  );
}
