# Web

`web` is the `chill.institute` React SPA hosted on Cloudflare Pages.

## Stack

- React SPA with TanStack Router and TanStack Query
- Vite-based workflow through `vp`

## Commands

- `vp install`
- `vp dev`
- `vp run verify`
- `vp run smoke:hosted`
- `vp check`
- `vp run test`
- `vp run knip`
- `vp build`
- `vp run e2e`

## Conventions

- Keep repo entrypoints in `package.json`; they should call `vp` underneath.
- Keep browser-side API resolution centralized in [src/lib/env.ts](./src/lib/env.ts).
- Keep Vite and hook/config changes minimal and intentional.
- Keep `.vite-hooks/` as the canonical hook path; `.githooks/` exists only as a compatibility shim for stale local Git config.

## Read More

- SPA architecture and API integration: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- hosted deployment and redirect behavior: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- day-to-day workflow: [CONTRIBUTING.md](./CONTRIBUTING.md)
