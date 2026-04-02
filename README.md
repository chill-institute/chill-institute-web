# chill-institute-web

![chill.institute web](https://chill.institute/banner.png)

Vite+ workspace for the web surfaces of [chill.institute](https://chill.institute) and [binge.institute](https://binge.institute).

## Apps

- `apps/chill/` powers `https://chill.institute` with search and catalog flows
- `apps/binge/` powers `https://binge.institute` with the catalog-focused experience

Both apps live in this repo, ship independently to Cloudflare Pages, and talk to the same hosted API at `https://api.chill.institute`.

## Quickstart

Install dependencies:

```bash
vp install
```

Check the workspace is ready:

```bash
vp run ready
```

Run an app locally:

```bash
vp run dev:chill
vp run dev:binge
```

Validate the full workspace:

```bash
vp run verify
vp run e2e
```

The repo follows the current Vite+ monorepo pattern:

- workspace packages are declared under `apps/*`, `packages/*`, and `tools/*`
- shared dependency versions live in the workspace catalog in `pnpm-workspace.yaml`
- prefer `vp` commands over calling `pnpm`, `vite`, or `playwright` directly

## Docs

- [About](./docs/ABOUT.md)
- [Guides](./docs/GUIDES.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Contributing](./CONTRIBUTING.md)

## License

Licensed under the [MIT License](./LICENSE).
