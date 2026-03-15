# About the Institute

Hello and nice to meet you.

`chill.institute` is a clean search engine for put.io users who want to find stuff fast, compare results, and send downloads to put.io without a bunch of ceremony.

## What it does

- search across enabled trackers
- filter and sort results quickly
- send matches to put.io
- browse top-movie feeds and RSS shortcuts

## Privacy stance

- the app stores your auth token in the browser so it can talk to the API on your behalf
- the web app does not send automatic browser telemetry
- crash reports stay local unless you explicitly copy them or open a prefilled GitHub issue
- some operational diagnostics may exist on the server side to keep the service healthy

## Contact

If you run into issues, have feedback, or want to ask about something, reach out via:

- [x.com/chill_institute](https://x.com/chill_institute)
- [chill-institute@proton.me](mailto:chill-institute@proton.me)

## Frequently Asked Questions

### How can I help, contribute, or donate?

Spread the word.

If you want to contribute to the web client itself, please read the [contributing guide](../CONTRIBUTING.md).

If you want to support the broader ecosystem, consider supporting the open-source tools you rely on most.

### Can I access the code or API?

Yep.

The web client is developed in the open at [chill-institute/web](https://github.com/chill-institute/web), and contributions are welcome.

If you want to build on top of the API or integrate with the service, reach out and say what you have in mind.

### Which browsers and devices are supported?

The app is built and tested for modern evergreen browsers on desktop and mobile. If you are using a reasonably current version of Safari, Chrome, or Firefox, you should generally be in good shape.

If something breaks on your setup, sending your browser version and device details makes debugging much easier.

### Are you affiliated with put.io?

No, but I have been building the Institute since 2018 and it has become one of the most popular apps in the ecosystem, so I am usually in touch with them.

That said, please do not bother put.io support when the Institute is down. They did not break it. I probably did. 😅

### Why do I need an active put.io account?

The Institute is designed to complement put.io, not replace it or act like a general-purpose torrent aggregator. If you want a fully self-managed setup, running your own search stack is probably a better fit.

### I have a transfer that is slow, stuck, or failing

The Institute helps you find content and send it to put.io, but it does not control transfer health on the put.io side.

If only a few transfers are failing, try a different indexer or release before reporting it. If transfers are consistently failing across the board, that is worth reporting.

### If there is no browser telemetry, how are settings stored?

App settings are primarily stored through put.io's config support, with a small amount of local browser caching for UI preferences.

### Are you the moderator of [/r/chillInstitute](https://www.reddit.com/r/chillInstitute/)?

I am now! 🤠

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
