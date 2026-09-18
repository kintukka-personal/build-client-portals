# Client learning portals

Branded onboarding, training and support portals for clients, built to sit beside
SimStudio simulations. One engine, one config per client. Swap the config and you
have a new client.

## Layout

```
clients/<slug>/brand/    the client's brand portfolio: <slug>-brand.json, <slug>-tokens.css, <slug>-brand-sheet.html, <slug>-brand.md, assets/
clients/<slug>/portal/   the client's portal: <slug>-portal.json (content), <slug>-portal.html (built), content/ (simulations, video)
template/portal/         the portal engine, the simulation placeholder, embedded fonts; template/brand.template.json
tools/build-tokens.js    generates <slug>-tokens.css from <slug>-brand.json and prints the contrast report
tools/build-portal.js    merges the engine, the tokens, the logo and the content into <slug>-portal.html
docs/playbook/           how to onboard a client, one numbered document per stage
```

## Clients

| Client | Brand | Portal |
| --- | --- | --- |
| ONYX Gym & Fitness | [`clients/onyx/brand/`](clients/onyx/brand/) · [onyx-brand.md](clients/onyx/brand/onyx-brand.md) · open `onyx-brand-sheet.html` | [`clients/onyx/portal/`](clients/onyx/portal/) · open `onyx-portal.html` |

## Working with a brand

```bash
node tools/build-tokens.js onyx     # regenerate onyx-tokens.css and refresh the sheet; prints contrast ratios
```

Edit `onyx-brand.json`, run the build, open `onyx-brand-sheet.html`. Nothing else is hand-edited.
Every file in a client folder carries the client slug, so files from different clients never collide.
The playbook for capturing a new client is [`docs/playbook/01-brand-portfolio.md`](docs/playbook/01-brand-portfolio.md).

## Working with a portal

```bash
node tools/build-portal.js onyx     # engine + tokens + logo + onyx-portal.json → onyx-portal.html
```

Content lives in `clients/onyx/portal/onyx-portal.json`. Behaviour and layout live in
`template/portal/portal-engine.html` and are shared by every client. The built file is
standalone: open it from disk, drop it on a share, host it, or wrap it as an app. Simulations
and videos sit beside it in `content/`; see `clients/onyx/portal/content/README.md`.

What the portal does today: a landing page that asks who you are here as, three audiences
each behind a per-device access key, learning paths with progress, simulations in a frame that record
completion from the SimStudio completion message and a SCORM shim, guides and checklists
with tickable steps, videos, articles, links, search, support contacts and FAQ, and a
progress card export from the Me page. Progress is stored per device.

## Rendering the sheet for review

Headless Chromium clamps windows to 500px wide, so phone checks use Playwright's device
emulation:

```bash
node -e "
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 900 }, isMobile: true });
await p.goto('file://' + process.cwd() + '/clients/onyx/brand/onyx-brand-sheet.html'); await p.screenshot({ path: 'onyx-sheet-390.png', fullPage: true }); await b.close(); })();"
```
