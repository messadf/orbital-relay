# orbital relay.

**puzzle ain't puzzling. something's wrong. ahh, the schema isn't proper here.**

orbital relay is a simple pixel-art (not at the moment) game built as an additional extension for browsers based on chromium. the goal is so simple; rotate cables, connect them to each other, and get the ship to the work back again.

## how to play? so easy. (still in dev)

- just click an lmb (left-mouse button); the grid with cable rotates clockwise.
- click an rmb (right-mouse button); the grid happens to rotate counter-clockwise.
- instead of moving your mouse around the table, you may move your target grid via arrow keys.
- there you go! have fun, turn on the light!

the board grows as you occure to complete more problems. begins with 4x4 grid and the maximum possible is 7x7.

## run it locally

if you wanna play it locally, so be it. there are no specific dependencies or a runtime required to run it.

```bash
npm test
npm run check
npm run build
npm run dev
```

open the localhost given by the static server.

## run it on chrome

- run `npm run build:extension`
- open `chrome://extensions`
- turn on **developer mode**
- click **load unpacked**
- select `dist/extension/ directory within the project

when an http or https navigation fails due to a poor internet connection, DNS, proxy, or any other network reason, the orbital relay opens automatically within the tab with no redirection. you can go back to chrome dino via `chrome://dino`, by the way. security failures, canceled navigations, blocked requests, and subframe errors are systematically ignored.

> Chrome does not allow extensions to modify arbitrary internal `chrome://` pages, so Orbital Relay does not alter `chrome://dino` itself.
> it appears that google chrome does not allow extensions access `chrome://` internal url, so orbital relay does not alter `chrome://dino`.

## push it on gh

the repo is prepared for `https://github.com/messadf/orbital-relay` but does not create or push the remote automatically.

```bash
git remote add origin https://github.com/messadf/orbital-relay.git
git push -u origin main
```

after the `git push -u origin main`, turn on **settings -> pages ->> source: github actions**, so the github pages may deploy 'main' branch of the project. every contribution within the code that has been applied to 'main' branch will automatically trigger the CI. pushing a tag such as `v1.0.0` creates a gh release with `orbital-relay-extension.zip`; every CI process also creates and keeps a downloadable extension file. 

<details>
  <summary>screenshot checklist</summary>

  
</details>

## privacy and license

orbital relay does not contain and gather no telemetry data, analytics, commercial ads, mandatory accounts, or remote runtime assets. the project is fully open-sourced. the sound effects and preferences remain on the device. see [PRIVACY.MD](PRIVACY.md) for further details.

released under the [MIT License](LICENSE).
