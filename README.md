# orbital relay.

**puzzle ain't puzzling. something's wrong. ahh, the schema isn't proper here.**

orbital relay is a simple pixel-art (not at the moment) game built as an additional extension for browsers based on chromium. the goal is so simple; rotate cables, connect them to each other, and get the ship to the work back again.

## how to play? so easy. (still in dev)

- just click an lmb (left-mouse button); the grid with cable rotates clockwise.
- click an rmb (right-mouse button); the grid happens to rotate counter-clockwise.
- instead of moving your mouse around the table, you may move your target grid via arrow keys.
- there you go! have fun, turn on the light!

the board grows as you occure to complete more problems. begins with 4x4 grid and the maximum possible is 7x7.

## Run locally

if you wanna play it locally, so be it. there are no specific dependencies or a runtime required to run it.

```bash
npm test
npm run check
npm run build
npm run dev
```

open the localhost given by the static server.

## Install in Chrome

1. Run `npm run build:extension`.
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Choose **Load unpacked**.
5. Select the generated `dist/extension` folder.

- run `npm run build:extension`
- open `

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
