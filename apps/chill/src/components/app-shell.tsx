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
    <div className="min-h-dvh">
      {showAuthShell ? (
        // Auth routes own their full-page card via <AuthPage>; the shell
        // just hands them the viewport so the page can centre itself.
        <Outlet />
      ) : (
        <>
          {isHome ? (
            <>
              <header className="px-4 pt-8 pb-6">
                <Link to="/">
                  <h1 className="m-0 text-center">Welcome to the Institute</h1>
                </Link>
              </header>
              <div className="border-border-strong bg-surface border-y px-4 py-6">
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
              <div className="border-border-strong bg-surface border-b px-4 py-3">
                <div className="mx-auto flex max-w-5xl flex-wrap items-start gap-3 sm:flex-nowrap sm:gap-6">
                  <Link
                    to="/"
                    className="text-fg-1 hidden shrink-0 font-serif text-[1.375rem] leading-9 tracking-[-0.01em] sm:block"
                  >
                    chill.institute
                  </Link>
                  <div className="w-full max-w-md flex-1">
                    <ShellSearchForm initialQuery={searchParamQ} />
                    <ShellSettingsMenu />
                  </div>
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
