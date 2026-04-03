import { Link, Outlet, useRouterState } from "@tanstack/react-router";

import { ResponsiveBox } from "@/components/layout";
import { ShellSettingsMenu } from "@/components/shell-settings-menu";

function AuthenticatedHeader({ isSettingsRoute }: { isSettingsRoute: boolean }) {
  return (
    <div className="sticky top-0 z-40 border-b border-stone-950/10 bg-stone-100/88 backdrop-blur-md dark:border-stone-100/10 dark:bg-stone-900/84">
      <ResponsiveBox>
        <div className="flex items-center justify-between gap-3 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <h3 className="block truncate py-[0.04em] font-serif text-xl leading-[1.04] tracking-tight sm:text-[1.35rem]">
              binge.institute
            </h3>
            <span className="rounded-full border border-stone-950/10 bg-stone-950/[0.05] px-2 py-0.5 text-[10px] font-medium tracking-[0.18em] text-stone-600 uppercase dark:border-stone-100/10 dark:bg-stone-100/[0.06] dark:text-stone-400">
              alpha
            </span>
          </Link>
          <div className="min-w-0 flex-1" />
          {!isSettingsRoute ? (
            <div className="flex shrink-0 justify-end">
              <ShellSettingsMenu />
            </div>
          ) : (
            <div className="size-7 shrink-0" aria-hidden="true" />
          )}
        </div>
      </ResponsiveBox>
    </div>
  );
}

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isHome = pathname === "/";
  const isSettingsRoute = pathname === "/settings";
  const showAuthShell =
    pathname.startsWith("/auth/") || pathname === "/sign-in" || pathname === "/sign-out";

  return (
    <div className="min-h-screen">
      {showAuthShell ? (
        <>
          <header className="flex flex-col items-center py-4 md:py-8 space-y-4">
            <div className="rounded-md overflow-hidden">
              <img src="/logo-xmas.png" width={96} height={96} alt="Logo" />
            </div>
            <Link to="/">
              <h3 className="text-center text-4xl tracking-tight">Welcome to binge.institute</h3>
            </Link>
          </header>
          <div className="relative overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 py-6 px-5 border-x-0 rounded-none">
            <div className="flex justify-center">
              <Outlet />
            </div>
          </div>
        </>
      ) : (
        <>
          <AuthenticatedHeader isSettingsRoute={isSettingsRoute} />
          {isHome ? (
            <main>
              <Outlet />
            </main>
          ) : (
            <>
              <div className="my-6">
                <ResponsiveBox>
                  <Outlet />
                </ResponsiveBox>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
