# Deployment

Deployment model for `chill-institute-web`.

## Hosting Shape

Production shape:

- static assets on Cloudflare Pages
- Pages Functions for legacy non-SPA forwarding
- API on `https://api.chill.institute`

Build output:

- static bundle in `dist/`

## Hostname Plan

- web: `https://chill.institute`
- API: `https://api.chill.institute`

Hosted environments resolve the API like this:

- `localhost` and `*.web-8vr.pages.dev` -> `https://api.chill.institute`
- `chill.institute` -> `https://api.chill.institute`

## Legacy Route Forwarding

Cloudflare Pages Functions handle hosted non-SPA forwarding:

- `/api/*` strips `/api` and redirects to the API host
- `/rss/*` preserves the full `/rss/...` path and redirects to the API host

Cloudflare redirect rules on `chill.institute` should forward:

- `/api/*` -> `https://api.chill.institute/*`
- `/rss/*` -> `https://api.chill.institute/rss/*`
- `/download/*` -> `https://api.chill.institute/download/*`

Keep `/auth/success` on the web host.

## Verification

After a hosted web change, verify:

- `https://chill.institute/`
- one real app load in the SPA
- one real auth redirect start URL
- one `/api/*` redirect path
- one `/rss/*` redirect path

Keep browser-side API resolution centralized in [src/lib/env.ts](../src/lib/env.ts) and hosted forwarding resolution centralized in [functions/_lib/api-origin.js](../functions/_lib/api-origin.js).
