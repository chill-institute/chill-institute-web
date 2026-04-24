# Deployment

Deployment model for `chill-web`

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

## GitHub Actions

Workflow shape:

- pull requests run `Verify`
- `Verify` detects whether `chill`, `binge`, or shared workspace surfaces changed and only runs the affected app jobs
- shared workspace changes such as `packages/*`, `tools/*`, and root build config fan out to both apps
- docs-only and workflow-only edits skip app verify, e2e, and preview deploy jobs
- pushes to `main` run `Main`
- `Main` runs the same selective checks, then deploys only the affected production app surfaces
- `Deploy` remains available as a manual production deploy fallback and accepts `all`, `chill`, or `binge`

Preview and production deploys are still app-specific:

- `apps/chill/dist/` deploys to the Cloudflare Pages project `chill-institute`
- `apps/binge/dist/` deploys to the Cloudflare Pages project `binge-institute`

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
