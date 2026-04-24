# chill-web

![chill.institute web](https://chill.institute/banner.png)

Vite+ workspace repo for the Cloudflare Pages frontends of [chill.institute](https://chill.institute) and [binge.institute](https://binge.institute).

## Apps

- `apps/chill/` powers `https://chill.institute` with search and catalog flows
- `apps/binge/` powers `https://binge.institute` with the catalog-focused experience
- the repo root owns shared workspace config, hooks, CI entrypoints, and package catalog wiring

Both apps ship independently to Cloudflare Pages and talk to the same hosted API at `https://api.chill.institute`.

## Quickstart

Install dependencies and verify the workspace:

```bash
vp install
vp run ready
```

Run an app locally:

```bash
vp run dev:chill
vp run dev:binge
```

Validate the repo:

```bash
vp run verify
vp run verify:chill
vp run verify:binge
vp run e2e
```

## Docs

- [About](./docs/ABOUT.md)
- [Guides](./docs/GUIDES.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Contributing](./CONTRIBUTING.md)

## Contributing

Please read the [contributing guide](./CONTRIBUTING.md).

## License

Licensed under the [MIT License](./LICENSE).
