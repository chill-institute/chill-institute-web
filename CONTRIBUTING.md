# Contributing

Thanks for contributing to `chill-institute-web`

## Setup

Install [Vite+](https://viteplus.dev/guide/) and then install repo dependencies:

```bash
vp install
```

Check the workspace is ready:

```bash
vp run ready
```

Start the apps locally from the workspace root:

```bash
vp run dev:chill
vp run dev:binge
```

## Validation

Run the full repo checks before opening or updating a pull request:

```bash
vp run verify
vp run smoke
vp run e2e
```

If you only changed one app, use the targeted root commands:

```bash
vp run verify:chill
vp run verify:binge
vp run smoke:chill
vp run smoke:binge
vp run e2e:chill
vp run e2e:binge
```

CI and deploy behavior is documented in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## Git Hooks

`vp install` runs the repo's `prepare` script, which configures Vite+ hooks from `.vite-hooks/`

The repo also ships matching `.githooks/` shims so older local clones that still have `core.hooksPath=.githooks` keep enforcing the same checks.

If your local Git config points somewhere else and hooks are not firing, re-install them with:

```bash
git config --unset core.hooksPath
vp config --hooks-dir .vite-hooks
```

## Development Notes

- This repo contains two client-rendered SPAs under `apps/chill/` and `apps/binge/`.
- The root owns shared workspace config such as `package.json`, `pnpm-workspace.yaml`, `vite.config.ts`, hooks, and CI workflows.
- Each app owns its own runtime entrypoints and config including `src/`, `public/`, `e2e/`, `vite.config.ts`, `tsconfig.json`, and `components.json`.
- Shared package versions live in the workspace catalog in `pnpm-workspace.yaml`.
- Prefer `vp` commands over calling `pnpm`, `vite`, or `playwright` directly.
- Both apps talk directly to the hosted API.
- `apps/chill/` serves `chill.institute`, `www.chill.institute`, `staging.chill.institute`, and `*.chill-institute.pages.dev`.
- `apps/binge/` serves `binge.institute`, `www.binge.institute`, `staging.binge.institute`, and `*.binge-institute.pages.dev`.
- Localhost in either app resolves to `https://api.chill.institute` unless `VITE_PUBLIC_API_BASE_URL` overrides it.
- `VITE_PUBLIC_API_BASE_URL` is only needed as an explicit local override.
- When generating or updating shadcn components, work from the target app directory so the app-local `components.json` is used.
- Playwright keeps traces, screenshots, and videos on failure. Check `apps/*/playwright-report/` and `apps/*/test-results/` after a failing run.
- GitHub-owned Cloudflare deploys require `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to be configured for the repo or inherited from the org.
- Once the GitHub deploy workflow is in use, disable direct Cloudflare Pages Git integration so production deploys remain fully gated by `Main`.

## Pull Requests

- Keep changes focused and explicit.
- Add or update tests when behavior changes.
- Prefer small follow-up PRs over mixing unrelated cleanup into feature work.
