import type { ReactNode } from "react";

import { cn } from "../lib/cn";

/*
 * The Institute auth card. One bordered surface with a header that
 * carries the kangaroo mark + Family-serif title, and a body slot that
 * each route fills with its own content (sign-in CTA, loader, CLI
 * token, etc).
 *
 * The shell is intentionally not a Dialog / Modal — these are full-page
 * routes (`/sign-in`, `/sign-out`, `/auth/*`), so the AppShell already
 * skips its own header on these paths and lets this card own the page.
 *
 * `logoSrc` defaults to `/logo.png`, which both apps ship under their
 * `public/` directory; pass an explicit path if a route needs a
 * different brand mark.
 */
type AuthPageProps = {
  title?: ReactNode;
  description?: ReactNode;
  hideBrand?: boolean;
  logoSrc?: string;
  className?: string;
  children: ReactNode;
};

function AuthPage({
  title,
  description,
  hideBrand = false,
  logoSrc = "/logo.png",
  className,
  children,
}: AuthPageProps) {
  const showHead = !hideBrand || title || description;
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 md:px-8">
      <div
        data-slot="auth-page"
        className={cn(
          "border-border-strong bg-surface shadow-[1px_1px_0_var(--color-border-strong)] w-full max-w-[480px] overflow-hidden rounded-xl border",
          className,
        )}
      >
        {showHead ? (
          <div className="border-border-strong flex items-center gap-3.5 border-b px-7 py-6">
            {hideBrand ? null : (
              <img
                src={logoSrc}
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

export { AuthPage };
