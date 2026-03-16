# Web

`web` is the `chill.institute` React SPA plus a small Cloudflare Pages Functions layer for legacy non-SPA route forwarding.

## Stack

- React SPA with TanStack Router and TanStack Query
- Vite-based workflow through `vp`
- Cloudflare Pages Functions for hosted legacy forwarding

## Commands

- `vp install`
- `vp dev`
- `vp check`
- `vp run test`
- `vp run knip`
- `vp build`
- `vp run e2e`

## Conventions

- Keep repo entrypoints in `package.json`; they should call `vp` underneath.
- Keep browser-side API resolution centralized in [src/lib/env.ts](./src/lib/env.ts).
- Keep hosted legacy route forwarding resolution centralized in [functions/\_lib/api-origin.js](./functions/_lib/api-origin.js).
- Keep Vite and hook/config changes minimal and intentional.

## Read More

- SPA and Pages Functions split: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- hosted deployment and redirect behavior: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- day-to-day workflow: [CONTRIBUTING.md](./CONTRIBUTING.md)
