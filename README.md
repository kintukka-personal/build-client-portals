# Client learning portals

Branded onboarding, training and support portals for clients, built to sit beside
SimStudio simulations. One engine, one config per client. Swap the config and you
have a new client.

**Start at [`docs/ROADMAP.md`](docs/ROADMAP.md)** — the ten phases every client goes
through, with the gate at the end of each, the standard outputs, and how ONYX was built.

```bash
node tools/new-client.js acme --name "ACME" --website https://acme.com.au   # scaffold a client
node tools/check-client.js acme                                             # where it stands, and what is next
```

## Layout

```
clients/<slug>/<slug>-intake.md   the kickoff answers and the asks sent
clients/<slug>/brand/    the client's brand portfolio: <slug>-brand.json, <slug>-tokens.css, <slug>-brand-sheet.html, <slug>-brand.md, assets/
clients/<slug>/portal/   the client's portal: <slug>-portal.json (content), <slug>-portal.html (built), content/ (simulations, video)
clients/<slug>/site/     the hosted, installable build
template/                what a new client is scaffolded from: brand, portal and intake templates
template/portal/         the portal engine, the simulation placeholder, embedded fonts
workflow/                the workflow as data: phases, outputs, gate checks
tools/new-client.js      scaffolds a client from the templates and builds it
tools/check-client.js    reports a client against the workflow's gates; --json for automations
tools/build-tokens.js    generates <slug>-tokens.css from <slug>-brand.json and prints the contrast report
tools/build-portal.js    merges the engine, the tokens, the logo and the content into <slug>-portal.html; --site for the hosted build
tools/make-icons.js      renders the app icons from the client's mark
tools/make-insights-demo.js  runs the engine's own converter over the sample to write the Insights worked example
tools/smoke-portal.js    walks the built portal as every audience and fails on errors, empty pages and sideways scroll
docs/ROADMAP.md          the route, phase by phase
docs/playbook/           how to do each phase, one numbered document per stage
```

## Clients

| Client | Brand | Portal |
| --- | --- | --- |
| ONYX Gym & Fitness | [`clients/onyx/brand/`](clients/onyx/brand/) · [onyx-brand.md](clients/onyx/brand/onyx-brand.md) · open `onyx-brand-sheet.html` | [`clients/onyx/portal/`](clients/onyx/portal/) · open `onyx-portal.html` · [intake](clients/onyx/onyx-intake.md) |

## Playbooks

| | Stage | Phase |
| --- | --- | --- |
| [00](docs/playbook/00-intake.md) | Intake and kickoff | P0 |
| [01](docs/playbook/01-brand-portfolio.md) | Capture a client's brand | P1 |
| [02](docs/playbook/02-portal-build.md) | Build a client's portal: structure and every config block | P2 |
| [03](docs/playbook/03-hosting-and-install.md) | Hosting, and making it installable | P6 |
| [04](docs/playbook/04-reports-and-data.md) | Reports and data: from one real export to a converter | P5 |
| [05](docs/playbook/05-content-standards.md) | Content standards: what goes in each block | P3 |
| [06](docs/playbook/06-simulations-and-media.md) | Simulations and media | P4 |
| [07](docs/playbook/07-qa-release-handover.md) | QA, release, handover and running it | P7–P9 |

The numbers are the order the documents were written; [the roadmap](docs/ROADMAP.md) is the order the work is done.

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
each behind a per-device access key, learning paths, an owner Reports page with stat tiles and charts from figures in the config, a tile-grid
Home and a process library that links each documented process to the training it drives, with progress, simulations in a frame that record
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
