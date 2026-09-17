# Client learning portals

Branded onboarding, training and support portals for clients, built to sit beside
SimStudio simulations. One engine, one config per client. Swap the config and you
have a new client.

## Layout

```
clients/<slug>/brand/    the client's brand portfolio: <slug>-brand.json, <slug>-tokens.css, <slug>-brand-sheet.html, <slug>-brand.md, assets/
clients/<slug>/          (next) portal config and content for that client
template/                blank brand.template.json; (next) the portal engine
tools/build-tokens.js    generates <slug>-tokens.css from <slug>-brand.json and prints the contrast report
docs/playbook/           how to onboard a client, one numbered document per stage
```

## Clients

| Client | Brand | Portal |
| --- | --- | --- |
| ONYX Gym & Fitness | [`clients/onyx/brand/`](clients/onyx/brand/) · [onyx-brand.md](clients/onyx/brand/onyx-brand.md) · open `onyx-brand-sheet.html` | next |

## Working with a brand

```bash
node tools/build-tokens.js onyx     # regenerate onyx-tokens.css and refresh the sheet; prints contrast ratios
```

Edit `onyx-brand.json`, run the build, open `onyx-brand-sheet.html`. Nothing else is hand-edited.
Every file in a client folder carries the client slug, so files from different clients never collide.
The playbook for capturing a new client is [`docs/playbook/01-brand-portfolio.md`](docs/playbook/01-brand-portfolio.md).

## Rendering the sheet for review

Headless Chromium clamps windows to 500px wide, so phone checks use Playwright's device
emulation:

```bash
node -e "
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 900 }, isMobile: true });
await p.goto('file://' + process.cwd() + '/clients/onyx/brand/onyx-brand-sheet.html'); await p.screenshot({ path: 'onyx-sheet-390.png', fullPage: true }); await b.close(); })();"
```
