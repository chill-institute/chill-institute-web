# `chill-institute/web`

![React](https://img.shields.io/badge/React-19-black?logo=react)
![Vite+](https://img.shields.io/badge/Vite%2B-toolchain-black)
![SPA](https://img.shields.io/badge/runtime-SPA-black)

Official web client for `chill.institute`.

Start here:

```bash
vp install
pnpm dev
```

Key docs:

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

This repo uses Vite+ as its frontend toolchain and talks to the hosted API directly from the browser.

Hosted environments resolve the API from the current hostname at runtime. `VITE_PUBLIC_API_BASE_URL` is only needed as an explicit local override.
