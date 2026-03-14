# Web

`web` is the `chill.institute` React SPA.

## Workflow

- Use `vp` for toolchain commands.
- Keep repo entrypoints in `package.json`; they should call `vp` underneath.
- Keep toolchain configuration centered on [`.node-version`](./.node-version) and the `vp` workflow.

## Runtime API Resolution

- Hosted `binge.institute` and `*.web-8vr.pages.dev` talk to `https://api.binge.institute`.
- Hosted `chill.institute` talks to `https://api.chill.institute`.
- `localhost` defaults to staging unless `VITE_PUBLIC_API_BASE_URL` is explicitly set.
- Keep this logic centralized in [`src/lib/env.ts`](./src/lib/env.ts).

## Verification

- Run `vp install` for a fresh clone or when dependencies change.
- `vp check` is the baseline repo verification command.
- Before finishing meaningful changes, run `vp run test`, `vp run knip`, `vp build`, and `vp run e2e`.
- If you only touch a narrow area, run the smallest relevant subset while working, then finish with the main checks before commit.

## Tooling Notes

- Keep Vite+ hook/config changes minimal and intentional.
- When Vite+ behaves differently in CI, verify with direct local commands first and then make the smallest repo change that matches the tool's real behavior.

## Docs

- Keep [README.md](./README.md) concise.
- Put details in [docs/](./docs/).
