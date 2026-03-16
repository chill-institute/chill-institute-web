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
vp check
vp run test
vp run knip
vp build
vp run e2e
```

## Development Notes

- This is a client-rendered SPA.
- The browser talks directly to the hosted API.
- `localhost` and `*.web-8vr.pages.dev` use `https://api.binge.institute`.
- `chill.institute` uses `https://api.chill.institute`.
- `VITE_PUBLIC_API_BASE_URL` is only needed as an explicit local override.

## Pull Requests

- Keep changes focused and explicit.
- Add or update tests when behavior changes.
- Prefer small follow-up PRs over mixing unrelated cleanup into feature work.
