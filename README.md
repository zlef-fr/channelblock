# ChannelBlock

**A real one-click "block channel" button for YouTube — free, open source, no account, no tracking.**

YouTube's *"not interested"* and *"don't recommend this channel"* are soft signals the
algorithm routinely overrides, so the same unwanted creators keep crawling back into your feed,
search and recommendations. ChannelBlock adds the hard block YouTube won't ship: hover any video,
click 🚫, and that channel's videos **and Shorts** disappear from every surface — permanently,
until you unblock it.

Live at **https://channelblock.zlef.fr** · MV3 · works in Chrome, Edge, Brave and any Chromium browser, plus a Firefox build.

Source: **https://github.com/zlef-fr/channelblock** (public, MIT) — read every line before you install it.

## What it does

- **Block button on every video** — shown on hover, on home, search, recommendations, sidebar and Shorts.
- **Block button on channel pages** — a floating Block / Unblock control.
- **Channel-page guard** — landing on a blocked channel shows a cover with an Unblock / Show-anyway choice.
- **Hides everywhere** — every video & Short from a blocked channel is removed across the site.
- **Manage your list** — a popup to search, unblock, paste a channel URL/@handle, and import/export the blocklist as JSON.
- **Bilingual** — English (default) and French, auto-detected and switchable.

## How it works

Modular content scripts (`extension/content/`) run at `document_start`:

1. **Identity** (`detect.js`) — extracts a channel's `@handle`, `/channel/UC…` id or legacy
   `/c|/user` name from a video card or a channel page, matched on stable endpoints rather than
   fragile localized labels.
2. **CSS layer** (`filter.js`) — a stylesheet built from your blocklist hides matching cards
   before first paint, so blocked channels never flash in.
3. **JS sweep** (`filter.js`) — catches cards without a channel link (e.g. the watch sidebar),
   display-name-only blocks and the Shorts shelf, and counts hidden videos for the opt-out stats.
4. **Injected UI** (`inject.js`) — the per-card 🚫 buttons, channel-page button, guard overlay and toast.
5. **Orchestration** (`main.js`) — storage + SPA-navigation hooks and a MutationObserver keep
   everything in sync as YouTube's Polymer app mutates the page.

Your blocklist lives in `chrome.storage.local` and never leaves the device.

## Privacy

No account, no identifiers, no IP logging, never your browsing. The only thing it can send is an
**anonymous, aggregate, opt-out** snapshot once per browsing session (version, which toggles are
on, and two counters: channels blocked / videos hidden). Turn off *"Share anonymous stats"* and
nothing is sent. Every number is public at [`/api/stats`](https://channelblock.zlef.fr/api/stats).
Full details: [channelblock.zlef.fr/privacy](https://channelblock.zlef.fr/privacy).

## Build

```bash
node store/gen-icons.js   # render the icons (needs Playwright)
node store/build.js       # package public/channelblock.zip + channelblock-firefox.xpi
```

The landing page is a tiny static server (`server.js`) that also aggregates the anonymous stats.

```bash
docker compose up -d --build
```

## License

MIT — see [LICENSE](LICENSE).
