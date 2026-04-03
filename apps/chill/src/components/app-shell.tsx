import { Link, Outlet, useRouterState } from "@tanstack/react-router";

import { MobileBox, ResponsiveBox } from "@/components/layout";
import { ShellSearchForm } from "@/components/shell-search-form";
import { ShellSettingsMenu } from "@/components/shell-settings-menu";

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const searchParamQ = useRouterState({
    select: (state) => {
      const search = state.location.search as Record<string, unknown>;
      return typeof search.q === "string" ? search.q : "";
    },
  });
  const isHome = pathname === "/";
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
              <h3 className="text-center text-4xl tracking-tight">Welcome to the Institute</h3>
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
            <>
              <header className="flex flex-col items-center py-4 md:py-8 space-y-4">
                <Link to="/">
                  <h3 className="text-center text-4xl tracking-tight">Welcome to the Institute</h3>
                </Link>
              </header>
              <div className="relative overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 py-6 border-x-0 rounded-none">
                <MobileBox>
                  <ShellSearchForm
                    initialQuery={searchParamQ}
                    label="What can we hook you up with?"
                  />
                  <ShellSettingsMenu />
                </MobileBox>
              </div>
              <main>
                <Outlet />
              </main>
            </>
          ) : (
            <>
              <div className="w-full top-0 left-0">
                <div className="relative overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 pt-4 pb-2 border-0 border-b rounded-none">
                  <ResponsiveBox>
                    <div className="flex flex-row justify-center items-start lg:space-x-4">
                      <Link className="hidden lg:block" to="/">
                        <h3 className="font-serif text-3xl leading-8 tracking-tight">
                          chill.institute
                        </h3>
                      </Link>
                      <div className="flex-1 lg:max-w-lg">
                        <ShellSearchForm initialQuery={searchParamQ} />
                        <ShellSettingsMenu />
                      </div>
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
