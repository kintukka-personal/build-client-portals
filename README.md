# Client learning portals

Branded onboarding, training and support portals for clients, built to sit beside
SimStudio simulations. One engine, one config per client. Swap the config and you
have a new client.

## Layout

```
clients/<slug>/brand/    the client's brand portfolio: brand.json, tokens.css, brand-sheet.html, BRAND.md, assets/
clients/<slug>/          (next) portal config and content for that client
template/                blank brand.template.json; (next) the portal engine
tools/build-tokens.js    generates tokens.css from brand.json and prints the contrast report
docs/playbook/           how to onboard a client, one numbered document per stage
```

## Clients

| Client | Brand | Portal |
| --- | --- | --- |
| ONYX Gym & Fitness | [`clients/onyx/brand/`](clients/onyx/brand/) · [BRAND.md](clients/onyx/brand/BRAND.md) · open `brand-sheet.html` | next |

## Working with a brand

```bash
node tools/build-tokens.js onyx     # regenerate tokens.css and refresh the sheet; prints contrast ratios
```

Edit `brand.json`, run the build, open `brand-sheet.html`. Nothing else is hand-edited.
The playbook for capturing a new client is [`docs/playbook/01-brand-portfolio.md`](docs/playbook/01-brand-portfolio.md).

## Rendering the sheet for review

Headless Chromium clamps windows to 500px wide, so phone checks use Playwright's device
emulation:

```bash
node -e "
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 900 }, isMobile: true });
await p.goto('file://' + process.cwd() + '/clients/onyx/brand/brand-sheet.html'); await p.screenshot({ path: 'sheet-390.png', fullPage: true }); await b.close(); })();"
```
