# Handoff — client-portal roadmap and workflow

Written 12 November 2026 to carry this work into a new chat. Paste it into the new chat,
or point the new chat at this file in the repository.

Repository: [Kintukka2/mobile-SS-ClientPortals](https://github.com/Kintukka2/mobile-SS-ClientPortals) · default branch `main`

---

## 1. The goal

Reverse-engineer everything built for ONYX into **one core structure and workflow that
gets repeated for every client portal**, so that:

- there is a high-level roadmap of what needs doing and the steps to get there
- there is detailed documentation behind each step
- the same outputs come out every time, in the same shape and with the same file names
- each client's core documents (brand, portal content, intake) are specific to that brand
- the workflow can drive automations, not just be read by people

## 2. Background: what this repository is

Branded onboarding, training and support portals for clients, built beside SimStudio
simulations. One shared engine plus one config per client. **ONYX Gym & Fitness** is the
first client and the worked example of everything. It was built over five working days
(17–25 September 2026) across PRs #1–#25.

- `template/portal/portal-engine.html`: the shared engine (behaviour and layout)
- `clients/<slug>/brand/<slug>-brand.json`: the client's brand truth
- `clients/<slug>/portal/<slug>-portal.json`: the client's content
- `tools/build-tokens.js` and `tools/build-portal.js`: generate everything else
- Two build targets: a single HTML file (for email and phones) and a hosted, installable
  folder at `clients/<slug>/site/`
- ONYX is live via the Cloudflare Pages project `onyx-learning-hub`, which deploys `main`
  from `clients/onyx/site`.

## 3. What this chat did

One pull request, **[#26](https://github.com/Kintukka2/mobile-SS-ClientPortals/pull/26),
merged into `main` on 24 October 2026** (three commits: `61ac4ac`, `496d817`, `81cebaf`).

### The roadmap and documentation

| File | What it is |
| --- | --- |
| `docs/ROADMAP.md` | **The master document.** Ten phases (P0–P9) with a gate at the end of each, the standard outputs per client, the critical path, 16 ONYX decisions kept as defaults, a day-by-day reconstruction of how ONYX was built, a time budget for the next client, how to automate it, and where the engine still assumes ONYX |
| `docs/playbook/00-intake.md` | New: intake and kickoff, and every ask sent on day one |
| `docs/playbook/04-reports-and-data.md` | New: from one real export to a working data converter |
| `docs/playbook/05-content-standards.md` | New: voice, audiences, paths, item types (sizes taken from ONYX's real content), Support, processes, posts |
| `docs/playbook/06-simulations-and-media.md` | New: the SimStudio kit, export settings, known export bugs, image formats, size budget |
| `docs/playbook/07-qa-release-handover.md` | New: QA, the 17 pitfalls ONYX hit, release, the handover pack, running it |
| `docs/playbook/01`, `02`, `README.md` | Updated to start from the scaffold instead of "copy the ONYX config" |
| `clients/onyx/onyx-intake.md` | ONYX's intake, reconstructed from the repo as the worked example |

### The ten phases

| | Phase | Done when |
| --- | --- | --- |
| P0 | Intake and kickoff | Scaffold exists, intake answered, asks sent |
| P1 | Brand portfolio | No placeholders left, brand sheet sent, SimStudio kit exported |
| P2 | Portal structure | Client block filled, build current |
| P3 | Content authoring | No `TODO` left in the config |
| P4 | Simulations and media | Nothing on the placeholder, every file present |
| P5 | Reports and data | A converter ready, a sample, the Insights example generated |
| P6 | Hosting and install | Icons present, hosted build current, live checks passed |
| P7 | QA and walkthrough | Smoke test passes, phone walkthrough done |
| P8 | Handover and sign-off | No demo content, brand confirmed, no open asks |
| P9 | Run and iterate | No process past its review date, builds current |

Four markers, each with an owner: `TODO` is ours to write (gone by P3); `"demo": true` is
written by us and awaits the client's confirmation (gone by P8); `_help` is a template
instruction (gone by P1); `PLACEHOLDER` is a scaffold stand-in (gone by P1).

### The workflow as data, and the tools

| File | What it does |
| --- | --- |
| `workflow/client-portal.workflow.json` | The roadmap as data: phases, steps (tagged manual, assisted or command), outputs as path patterns, gate checks |
| `tools/new-client.js` | Scaffolds a client: intake, brand file, stand-in logo and mark, portal config, content README, then a first build |
| `tools/check-client.js` | Reports a client against every gate. `--json` for automations, `--run` to include the smoke test, `--all` to list the manual checks |
| `tools/smoke-portal.js` | Opens the built portal as every audience; fails on script errors, empty pages, bounces and sideways scroll at phone width |
| `tools/make-icons.js` | Renders the four app icons from the client's mark |
| `template/portal.template.json`, `template/brand.template.json`, `template/intake.template.md`, `template/portal/content-README.template.md` | What every new client is scaffolded from |

```bash
node tools/new-client.js acme --name "ACME" --trading "ACME Health & Fitness" --website https://acme.com.au
node tools/check-client.js acme          # where it stands, and what is next
node tools/build-tokens.js acme          # after a brand change
node tools/build-portal.js acme          # the single file
node tools/build-portal.js acme --site   # the hosted build
node tools/smoke-portal.js acme          # needs Playwright (preinstalled in cloud sessions)
```

### Bugs fixed along the way

These would have broken the next client. ONYX's built files are byte-identical after the
fixes.

- `build-tokens.js` hard-coded ONYX's colour names, so any other client's brand file
  crashed it. It now works from roles.
- `build-portal.js --site` always set the theme colour to black. It now reads the `bg` role.
- The single-file build would have read real video files into the page as text. Only
  `.html` is inlined now.
- The brand template made the selected menu item invisible. Tint and deep colours now
  have their own entries, and `check-client.js` fails a brand file that repeats it.

### How it was verified

- ONYX rebuilt with no change to any built file.
- Smoke test: 168 ONYX page views with no failures; a deliberately broken build fails it.
- Scaffolded test clients (one with an awkward name and no website) built and passed the
  smoke test; none were committed.
- Every relative link in the docs resolves.

## 4. Where ONYX stands today

From `node tools/check-client.js onyx` on 12 November 2026:

| Phase | State | What is outstanding |
| --- | --- | --- |
| P0 Intake | done | — |
| P1 Brand | 12 of 13 | SimStudio kit export (`clients/onyx/brand/onyx.simbrand.json`) not in the repo |
| P2 Structure | done | — |
| P3 Content | done | — |
| P4 Simulations | 1 of 3 | 7 simulations still on the placeholder; 5 videos have no file |
| P5 Data | done | — |
| P6 Hosting | done | — |
| P7 QA | needs `--run` | Smoke test passes when run |
| P8 Handover | 0 of 3 | 62 demo flags; brand still "captured-from-public-site"; 5 open asks with the client |
| P9 Run | done | — |

ONYX is a showcase, so the P8 items are expected. Most of P4 and P8 depends on ONYX
supplying material: logo files, guideline, photos, system access, real procedures.

## 5. What's next

In rough priority order:

1. **Fix the owner's Brand link on the live ONYX site.** The owner's Brand tile and the
   `lnk-brand-sheet` item point at `../brand/onyx-brand-sheet.html`, but the hosted build
   ships no `brand/` folder, so the link leads to a missing page. The fix: have
   `tools/build-portal.js --site` copy the brand sheet into the site and rewrite the link
   for the site build only. Then remove its row from the table at the end of
   `docs/ROADMAP.md`.
2. **Onboard the next client** with `tools/new-client.js` and follow `docs/ROADMAP.md`
   from P0. That is the real test of the workflow; tighten the docs and templates
   wherever it rubs.
3. **Clear the engine's remaining ONYX assumptions** as each one starts to matter. The
   table at the end of `docs/ROADMAP.md` lists them:
   - "placeholders for ONYX" text in the contact cards
   - RECOVER examples in the Write a post form
   - Reports charts fixed to four named keys
   - fixed logo and mark proportions
   - an assumed `employee` audience
   - font file naming for families with a space
4. **Close ONYX's outstanding items** once ONYX supplies material:
   - export the SimStudio kit
   - replace the 7 placeholder simulations and add the 5 videos
   - clear the demo flags
   - close the 5 open asks
5. **Write more data converters.** Only `leads` (the GymMaster task report) has code.
   Members, bookings and takings are listed as planned in config.
6. **Optional: add CI.** `docs/ROADMAP.md` has a starting GitHub Actions snippet that
   builds, smoke-tests and checks every client on each pull request. It is not in the
   repository yet.

## 6. Conventions to keep

- Every file carries the client slug. Never hand-edit built files (`*-tokens.css`,
  `*-portal.html`, `site/`); edit the JSON and rebuild.
- Rebuild **both** targets after a content change and commit the outputs. The hosted
  site deploys the committed `clients/<slug>/site/`.
- The tools have no npm dependencies; Node 18 or later. Only the smoke test and the icon
  renderer need Playwright.
- Commit messages: a plain-English subject line, then a body that explains why. The docs
  are written in Australian English, in the same direct voice as the existing playbooks.
- Work happens on a `claude/…` branch and goes up as a draft pull request.

## 7. A prompt to start the new chat

> I'm continuing work on the client-portal repository (Kintukka2/mobile-SS-ClientPortals).
> Read `HANDOFF.md` and `docs/ROADMAP.md` first. The goal is a repeatable workflow for
> building branded client portals, reverse-engineered from ONYX. Start with item 1 in
> "What's next": fix the owner's Brand link on the hosted ONYX site.
