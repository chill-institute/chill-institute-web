# About the Institute

`chill.institute` is a clean search engine for put.io users who want to find stuff fast, compare results, and send downloads to put.io without a bunch of ceremony.

## What it does

- search across enabled trackers
- compare results quickly
- send downloads to put.io
- browse top-movie feeds and RSS shortcuts

## Privacy

- the app stores your auth token in the browser so it can talk to the API on your behalf
- the web app does not send telemetry, and crash reports stay local unless you explicitly copy them or open a prefilled GitHub issue
- some operational diagnostics exist on the server side to keep the service healthy

## Contact

For everything, please reach out via [chill-institute@proton.me](mailto:chill-institute@proton.me)

X (Twitter) or Reddit DMs are also fine but I barely check them.

## Frequently Asked Questions

### How can I help, contribute, or donate?

Spread the word. 🤠

For web client itself, please read the [contributing guide](../CONTRIBUTING.md).

If you want to support the broader ecosystem, consider supporting the open-source tools you rely on most. 😉

### Can I have access to the API?

Sure! Just reach out and say what you have in mind.

### Which browsers and devices are supported?

The app is built and tested for modern evergreen browsers on desktop and mobile.

If something breaks on your setup, sending your browser version and device details makes debugging much easier.

### Are you affiliated with put.io?

No, but I have been building the Institute for a long time so I am usually in touch with them.

That said, please do not bother put.io support when the Institute is down. They did not break it. I probably did. 😅

### Why do I need an active put.io account?

The Institute is designed to complement put.io, not act like a general-purpose torrent aggregator.

If you want a fully self-managed setup, running your own search stack is probably a better fit.

### I have a transfer that is slow, stuck, or failing

The Institute helps you find content and send it to put.io, but it does not control transfer health on the put.io side.

If only a few transfers are failing, try a different indexer or release before reporting it.

If transfers are consistently failing across the board, that is worth reporting.

### How are settings stored?

App settings are primarily stored through put.io's config support, with a small amount of local browser caching for UI preferences.

### Are you the moderator of [/r/chillInstitute](https://www.reddit.com/r/chillInstitute/)?

I am now! 😁

It started as a community effort, and I was added as a moderator later on.

## Open-Source Friends

The Institute leans on a handful of excellent open-source projects:

- [Jackett](https://github.com/Jackett/Jackett)
- [React](https://github.com/facebook/react)
- [TanStack](https://github.com/TanStack)
- [shadcn/ui](https://github.com/shadcn-ui/ui)
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss)
- [Lucide](https://github.com/lucide-icons/lucide)
- [Connect RPC](https://github.com/connectrpc/connect-es)
- [VoidZero](https://github.com/voidzeroinc)
