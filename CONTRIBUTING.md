# Contributing

Thanks for contributing to `chill-institute-web`.

## Setup

Install [Vite+](https://viteplus.dev/guide/) and then install repo dependencies:

```bash
vp install
```

Start the app locally:

```bash
vp dev
```

## Validation

Run the full repo checks before opening or updating a pull request:

```bash
vp run verify
vp run e2e
```

## Git Hooks

`vp install` runs the repo's `prepare` script, which configures Vite+ hooks from `.vite-hooks/`.

The repo also ships matching `.githooks/` shims so older local clones that still have `core.hooksPath=.githooks` keep enforcing the same checks.

If your local Git config points somewhere else and hooks are not firing, re-install them with:

```bash
git config --unset core.hooksPath
vp config --hooks-dir .vite-hooks
```

## Development Notes

- This is a client-rendered SPA.
- The browser talks directly to the hosted API.
- `localhost` and `*.web-8vr.pages.dev` use `https://api.chill.institute`.
- `chill.institute` uses `https://api.chill.institute`.
- `VITE_PUBLIC_API_BASE_URL` is only needed as an explicit local override.

## Pull Requests

- Keep changes focused and explicit.
- Add or update tests when behavior changes.
- Prefer small follow-up PRs over mixing unrelated cleanup into feature work.
