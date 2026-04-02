# Deployment

Deployment model for `chill-institute-web`

## Hosting Shape

Production shape:

- static assets on Cloudflare Pages
- API on `https://api.chill.institute`

Build output:

- `apps/chill/dist/`
- `apps/binge/dist/`

## Hostname Plan

- chill app: `https://chill.institute`
- binge app: `https://binge.institute`
- API: `https://api.chill.institute`

Hosted environments resolve the API like this:

- `apps/chill`: `localhost`, `chill.institute`, `www.chill.institute`, `staging.chill.institute`, and `*.chill-institute.pages.dev` -> `https://api.chill.institute` or `https://staging-api.chill.institute` for staging
- `apps/binge`: `localhost`, `binge.institute`, `www.binge.institute`, `staging.binge.institute`, and `*.binge-institute.pages.dev` -> `https://api.chill.institute` or `https://staging-api.chill.institute` for staging

## Public Endpoints

Authenticated app traffic should call `https://api.chill.institute` directly.

Public RSS and download URLs should also use `https://api.chill.institute` directly.

Keep `/auth/success` on the app host.

## Verification

After a hosted web change, verify:

- `https://chill.institute/`
- `https://binge.institute/`
- one real app load in each SPA
- one real auth redirect start URL

GitHub Actions shape:

- pull requests run `Verify`
- `Verify` runs workspace verification, both app e2e suites, and same-repo preview deploys for both Pages projects
- pushes to `main` run `Main`
- `Main` runs `verify` and `e2e`, then deploys both production apps through Wrangler
- `Deploy` remains available as a manual production deploy fallback

GitHub-owned deploy configuration:

- Cloudflare Pages project: `chill-institute`
- Cloudflare Pages default domain: `chill-institute.pages.dev`
- Cloudflare Pages project: `binge-institute`
- Cloudflare Pages default domain: `binge-institute.pages.dev`
- required GitHub secret: `CLOUDFLARE_API_TOKEN`
- required GitHub variable: `CLOUDFLARE_ACCOUNT_ID`

Operator follow-up after enabling these workflows:

- disable direct Cloudflare Pages Git integration for this repo so GitHub Actions is the only production deploy path

Keep browser-side API resolution app-local in `apps/*/src/lib/env.ts`
