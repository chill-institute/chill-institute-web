# Deployment

Deployment model for `chill-institute-web`

## Hosting Shape

Production shape:

- static assets on Cloudflare Pages
- API on `https://api.chill.institute`

Build output:

- static bundle in `dist/`

## Hostname Plan

- web: `https://chill.institute`
- API: `https://api.chill.institute`

Hosted environments resolve the API like this:

- `localhost` and `*.web-8vr.pages.dev` -> `https://api.chill.institute`
- `chill.institute` -> `https://api.chill.institute`

## Public Endpoints

Authenticated app traffic should call `https://api.chill.institute` directly.

Public RSS and download URLs should also use `https://api.chill.institute` directly.

Keep `/auth/success` on the web host.

## Verification

After a hosted web change, verify:

- `https://chill.institute/`
- one real app load in the SPA
- one real auth redirect start URL

Keep browser-side API resolution centralized in [src/lib/env.ts](../src/lib/env.ts).
