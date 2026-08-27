# Orbital Relay

**The grid went dark. Route the power back.**

Orbital Relay is a tiny pixel-art puzzle game built as both a normal static website and a Manifest V3 Chrome extension. Rotate cable modules, reconnect solar power to the station core, and clear increasingly difficult sectors before the repair budget runs out.

## Play

- Click or press <kbd>Enter</kbd>/<kbd>Space</kbd> to rotate a relay clockwise.
- Shift-click or right-click to rotate counter-clockwise.
- Use the arrow keys to move focus around the grid.
- Power every active module and the station core to clear the sector.

Boards grow from 4×4 to 7×7. Every board is generated from a valid solved network, then scrambled and checked before play.

## Run locally

The project has no runtime or development dependencies.

```bash
npm test
npm run check
npm run build
npm run dev
```

Open the local address printed by the static server.

## Install in Chrome

1. Run `npm run build:extension`.
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Choose **Load unpacked**.
5. Select the generated `dist/extension` folder.

The toolbar icon opens the game at any time. When a top-level HTTP or HTTPS navigation fails because the connection, DNS, proxy, or destination is unavailable, the extension opens Orbital Relay in that tab. Security failures, canceled navigations, blocked requests, and subframe errors are deliberately ignored.

> Chrome does not allow extensions to modify arbitrary internal `chrome://` pages, so Orbital Relay does not alter `chrome://dino` itself.

## Publish on GitHub

The repository is prepared for `https://github.com/messadev/orbital-relay` but does not create or push that remote automatically.

```bash
git remote add origin https://github.com/messadev/orbital-relay.git
git push -u origin main
```

After the push, enable **Settings → Pages → Source: GitHub Actions**. The Pages workflow publishes the web game on every push to `main`. Pushing a tag such as `v1.0.0` creates a GitHub release with `orbital-relay-extension.zip`; every CI run also keeps a downloadable extension artifact.

## Screenshot checklist

- Desktop mission view with a partially powered board
- Mobile layout at approximately 390×844
- Completed sector with **CORE ONLINE**
- Offline redirect card showing a safe hostname
- End-of-run panel

## Privacy and license

Orbital Relay uses no analytics, advertising, accounts, or remote runtime assets. High score and sound preference remain on the device. See [PRIVACY.md](PRIVACY.md) for details.

Released under the [MIT License](LICENSE).
