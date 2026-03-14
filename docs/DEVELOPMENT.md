# Development

Development and deployment notes for `chill-institute/web`.

## Runtime Model

- client-rendered React SPA
- no server functions
- no server-side proxy layer
- browser calls the hosted API directly
- shared RPC types come from [`@chill-institute/contracts`](https://www.npmjs.com/package/@chill-institute/contracts)

## Environment

- `VITE_PUBLIC_API_BASE_URL`: public base URL for the `chill.institute` API

If unset, the app falls back to `window.location.origin`.

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

- Build command: `vp build`
- Output directory: `dist`
- Required env var: `VITE_PUBLIC_API_BASE_URL`
