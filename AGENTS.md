# web Agent Notes

Keep this file short and repo-specific. General workspace rules live in [chill-institute/runbook/AGENTS.md](https://github.com/chill-institute/runbook/blob/main/AGENTS.md).

## Purpose

`web` is the `chill.institute` React SPA.

## Tooling

- Use `vp` for toolchain commands.
- Keep repo entrypoints in `package.json`; they should call `vp` underneath.
- Node is pinned via [`.node-version`](./.node-version).
- Do not reintroduce `.tool-versions` here unless Pages support changes and we explicitly decide to.

## Validation

Run these before finishing meaningful changes:

- `vp install`
- `vp check`
- `vp run test`
- `vp run knip`
- `vp build`
- `vp run e2e`

If you only touch a narrow area, run the smallest relevant subset too, but do not skip the main checks before commit.

## Runtime API Resolution

- Hosted `binge.institute` and `*.web-8vr.pages.dev` talk to `https://api.binge.institute`.
- Hosted `chill.institute` talks to `https://api.chill.institute`.
- `localhost` defaults to staging unless `VITE_PUBLIC_API_BASE_URL` is explicitly set.
- Keep this logic in [`src/lib/env.ts`](./src/lib/env.ts), not scattered across components.

## Vite+

- `vp check` is the preferred repo-level verification command.
- Keep Vite+ hook/config changes minimal and intentional.
- If Vite+ behaves differently in CI, verify with direct local commands before “fixing” the repo around the tool.

## Docs

- Keep [README.md](./README.md) concise.
- Put details in [docs/](./docs/).
