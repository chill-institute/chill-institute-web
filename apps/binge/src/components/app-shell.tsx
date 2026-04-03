import { Link, Outlet, useRouterState } from "@tanstack/react-router";

import { ResponsiveBox } from "@/components/layout";
import { ShellSettingsMenu } from "@/components/shell-settings-menu";

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
          {isHome ? (
            <main>
              <Outlet />
            </main>
          ) : (
            <>
              <div className="w-full top-0 left-0">
                <div className="relative overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 pt-4 pb-2 border-0 border-b rounded-none">
                  <ResponsiveBox>
                    <div className="flex flex-row justify-between items-start gap-4">
                      <Link to="/">
                        <h3 style={{ fontSize: "2rem", letterSpacing: 0, lineHeight: "1.8rem" }}>
                          binge.institute
                        </h3>
                      </Link>
                      {!isSettingsRoute ? (
                        <div className="flex shrink-0 justify-end">
                          <ShellSettingsMenu />
                        </div>
                      ) : null}
                    </div>
                  </ResponsiveBox>
                </div>
              </div>
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
