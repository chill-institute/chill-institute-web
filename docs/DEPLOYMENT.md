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

Repo helpers:

- hosted smoke: `vp run smoke:hosted`

GitHub Actions shape:

- pull requests run `Verify`
- `Verify` runs `verify` and `e2e`
- same-repo pull requests also publish a Cloudflare Pages preview deploy after checks pass
- pushes to `main` run `Main`
- `Main` runs `verify` and `e2e`, then deploys production through Wrangler and runs hosted smoke against `https://chill.institute`
- `Deploy Web` remains available as a manual production deploy fallback

GitHub-owned deploy configuration:

- Cloudflare Pages project: `web`
- Cloudflare Pages default domain: `web-8vr.pages.dev`
- required GitHub secret: `CLOUDFLARE_API_TOKEN`
- required GitHub variable: `CLOUDFLARE_ACCOUNT_ID`

Operator follow-up after enabling these workflows:

- disable direct Cloudflare Pages Git integration for this repo so GitHub Actions is the only production deploy path

Hosted smoke defaults to `https://chill.institute` and `https://api.chill.institute`. Override with `CHILL_WEB_BASE_URL` or `CHILL_API_BASE_URL` when checking a preview deployment.

Keep browser-side API resolution centralized in [src/lib/env.ts](../src/lib/env.ts).
