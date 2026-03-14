# Development

Development and deployment notes for `chill-institute/web`.

## Runtime Model

- client-rendered React SPA
- no server functions
- no server-side proxy layer
- browser calls the hosted API directly
- shared RPC types come from [`@chill-institute/contracts`](https://www.npmjs.com/package/@chill-institute/contracts)

## Environment

- hosted environments resolve the API at runtime from the current hostname
- `localhost` and `*.web-8vr.pages.dev` use `https://api.binge.institute`
- `binge.institute` uses `https://api.binge.institute`
- `chill.institute` uses `https://api.chill.institute`
- `VITE_PUBLIC_API_BASE_URL` remains available as an explicit local override

For local development, the override is optional because `localhost` already defaults to staging.

## Local Development

```bash
vp install
pnpm dev
```

## Verification

```bash
pnpm check
pnpm build
pnpm e2e
```

## Cloudflare Pages

- Build command: `pnpm build`
- Output directory: `dist`
- No API build variable is required for hosted deploys.
