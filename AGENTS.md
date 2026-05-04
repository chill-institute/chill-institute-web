# Web

`web` is a Vite+ workspace repo that hosts the Cloudflare Pages frontends for `chill.institute` and `binge.institute`.

## Structure

- `apps/chill/` is the `chill.institute` app — the **search experience** (search shell + results table). No catalog browsing here.
- `apps/binge/` is the `binge.institute` app — the **catalog/browse experience** (movies + tv shows grids, source pickers, detail modals).
- `packages/ui/` is `@chill-institute/ui` — design tokens (`@theme` semantic surface/fg/border colors, heading element styles), `lucide`-iconed shared components (StickyHeader, Tabs, SortRow, PosterCard, IconButton, InstituteFooter, AuthPage, StatusPanel, AppErrorBoundary/Fallback, BackendUnavailableScreen, CopyButton), and the canonical `.btn` / `.input` / `.kbd` styles.
- `packages/api/` is `@chill-institute/api` — the chill backend connect-rpc client. Exposes `createApi({ authToken, baseUrl, normalizeSettings? })`, `getPutioStartURL`, the auth-error constants, `withTimeoutSignal`, and the auth-failure / settings-defaults helpers. Catalog methods (getMovies/getTVShows/getTVShowDetail/getTVShowSeason/getTVShowSeasonDownloads) live here too — chill simply doesn't call them.
- the repo root owns shared workspace config, scripts, hooks, and CI entrypoints

## Stack

- React SPAs with TanStack Router and TanStack Query
- Vite+ workspace tooling through `vp`
- app-local Playwright suites in each app directory

## Commands

- `vp install`
- `vp run ready`
- `vp run dev:chill`
- `vp run dev:binge`
- `vp run verify`
- `vp run verify:chill`
- `vp run verify:binge`
- `vp run smoke`
- `vp run smoke:chill`
- `vp run smoke:binge`
- `vp run e2e`
- `vp run e2e:chill`
- `vp run e2e:binge`
- `vp run knip`

## Conventions

- Keep repo entrypoints in the root [package.json](./package.json); they should call `vp` underneath.
- Prefer `vp` over direct `pnpm`, `vite`, `vitest`, or `playwright` invocations.
- Keep shared dependency versions in the workspace catalog in [pnpm-workspace.yaml](./pnpm-workspace.yaml)
- Keep browser-side API resolution app-local in `apps/*/src/lib/env.ts` (each app resolves its own staging/production hostnames; the shared client takes the resolved `baseUrl` as input).
- Keep shadcn config app-local in `apps/*/components.json`
- Anything genuinely shared between the two apps belongs in `packages/ui/` (UI primitives, design system, shared shells) or `packages/api/` (backend client, auth helpers). Use `apps/*/src/components/` only for app-specific surfaces.
- Prefer intentional duplication between `apps/chill/` and `apps/binge/` for components that _might_ diverge (different layouts, different reslist shapes, app-specific RPC integrations); promote to `packages/*` once the shared shape is stable.
- Keep Vite and hook/config changes minimal and intentional.
- Keep `.vite-hooks/` as the canonical hook path; `.githooks/` exists only as a compatibility shim for stale local Git config.
- CI fans shared workspace changes such as `packages/*`, `tools/*`, and root build config out to both apps, but it skips app deploy jobs for docs-only or workflow-only edits.

## Read More

- workspace architecture and app boundaries: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- hosted deployment and Pages project layout: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- day-to-day workflow: [CONTRIBUTING.md](./CONTRIBUTING.md)
