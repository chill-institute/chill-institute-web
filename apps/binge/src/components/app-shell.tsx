import { Link, Outlet, useRouterState } from "@tanstack/react-router";

import { ResponsiveBox } from "@/components/layout";
import { ShellSettingsMenu } from "@/components/shell-settings-menu";
import { StickyHeader } from "@chill-institute/ui/components/sticky-header";

function BingeBrand() {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2">
      <h3 className="text-fg-1 truncate text-lg leading-none">binge.institute</h3>
      <span className="border-fg-1/10 bg-fg-1/[0.05] text-fg-3 rounded-full border px-2 py-0.5 text-[0.625rem] font-medium tracking-[0.18em] uppercase">
        alpha
      </span>
    </Link>
  );
}

/*
 * The home route renders its own StickyHeader because it needs the
 * movies/tv tabs slot — there's no clean way to inject children into the
 * AppShell-managed header from inside a route. AppShell owns the header
 * for every other authenticated route.
 */
export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isHome = pathname === "/";
  const isSettingsRoute = pathname === "/settings";
  const showAuthShell =
    pathname.startsWith("/auth/") || pathname === "/sign-in" || pathname === "/sign-out";

  return (
    <div className="flex min-h-dvh flex-col">
      {showAuthShell ? (
        // Auth routes own their full-page layout via <AuthPage>; the shell
        // just hands the viewport over so the page can centre its card.
        <Outlet />
      ) : isHome ? (
        // Home renders its own StickyHeader (with tabs); it lives inside <main>.
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      ) : (
        <>
          <StickyHeader
            brand={<BingeBrand />}
            right={isSettingsRoute ? null : <ShellSettingsMenu />}
          />
          <div className="my-6 flex-1">
            <ResponsiveBox>
              <Outlet />
            </ResponsiveBox>
          </div>
        </>
      )}
    </div>
  );
}
