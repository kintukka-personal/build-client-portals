# Playbook 07 — QA, release, handover and running it

The last three phases: prove it works (P7), hand it over (P8), keep it true (P9). The
roadmap is [`docs/ROADMAP.md`](../ROADMAP.md).

## QA (P7)

### 1. The automatic pass

```bash
node tools/build-portal.js <slug>
node tools/smoke-portal.js <slug>                 # every audience, every page
node tools/smoke-portal.js <slug> --shots <dir>   # and a screenshot of each at 390px and 1280px
node tools/check-client.js <slug> --run           # the gates, smoke test included
```

The smoke test enters each audience with every key unlocked and visits its tabs, its
path, every item it can see, every process, every post and Insights. It fails on a script
error, a page that renders empty, a page that bounces to Home or the welcome screen, and
any horizontal scroll at phone width. Fix every failure; there is no acceptable number.

### 2. The walkthrough, on a real phone

1. Open it cold: the welcome screen, the doors, the label over the staff doors.
2. Pick the customer door: no key, Home tiles, a tip, a post, Support.
3. Pick a staff door with a **wrong key**, then the right one.
4. The name prompt on the first Home.
5. A simulation from start to its closing screen; the item shows complete.
6. A guide ticked through; a checklist ticked through.
7. Star an item; find it at the top of Learn.
8. A contact row: tap copies, the second button dials.
9. Export the progress card from Me.
10. As owner: Reports, Import data, Insights, the process library, a gap's *Document this
    process*, Write a post with a date in the future.
11. Then the same on a desktop: the rail, the menu, a wide Reports page.

### 3. The file-alone test

Copy `<slug>-portal.html` into an empty folder and open it. Every simulation must load,
because that is what a phone's file viewer and an email attachment give you.

### 4. The pitfalls list

Every one of these happened on ONYX and was caught by eye. Run the list against any
change to the engine.

| Pitfall | What it did on ONYX | The rule |
| --- | --- | --- |
| An element id equal to an SVG symbol id | `#mark` returned the brand mark's symbol, so no *Mark complete* button had ever worked | No element id may match a symbol id (`logo`, `mark`, `i-*`, `t-*`) |
| Two hoisted functions with one name | The KPI row drew home tiles from KPI data: six empty boxes | No function or top-level binding is declared twice |
| A class name already used by the layout | The carousel took `.rail` and un-hid the desktop sidebar on phones | Search the stylesheet before naming a class |
| A new view with no nav icon | Two tabs rendered `<use href="#undefined">` and came up blank | Every nav id has an icon |
| A crowded tab bar | At five tabs LOOK AROUND wrapped and made the member's bar 79px against everyone else's 62px | Five tabs at most; the tracking tightens at five |
| A class with a `display` rule | It outranked `[hidden]` and showed a dead Install button | Keep the `[hidden]` reset |
| Grid children | Bolded words in the iOS steps became their own grid cells | Wrap inline runs in one element |
| Strokes in a scaled SVG | A 1-unit focus ring drew ten pixels wide | `vector-effect: non-scaling-stroke` on every stroke in the plan |
| A guessed negative margin | 4px of horizontal scroll on every phone | Gutters are a variable both sides read |
| A dialog focusing its first control | A long panel opened scrolled to Close at the bottom | The dialog takes focus itself |
| An attribute fill on an SVG | `fill="none"` beat the CSS and the favourite star never filled | Fills in CSS, not attributes |
| A generic rule on `.field` | Every form laid out label, input and hint on one line | Scope layout rules to their component |
| A button inside a link | The star could not be a real control | Wrap the card (`.cw`) and put the button beside the link |
| A click inside a link | Starring followed the card's link | `preventDefault` on controls inside cards |
| A fact written twice | "Walk-in" was wrong in five places | Write it once; search when it changes |
| A muted caveat under the content | Nobody read the floorplan disclaimer | A caveat goes above what it qualifies |
| A tint role pointing at the solid colour | The active nav's label vanished into its own fill | `check-client.js` fails it (G1.7) |

## Release

Every change that reaches the client:

1. Rebuild both targets — `build-portal.js <slug>` and `build-portal.js <slug> --site` —
   because the service worker's cache is named after a hash of `index.html`, and that is
   what makes the update reach an installed phone.
2. Bump `meta.version` in the brand file when the brand changes, and add a changelog line
   to `<slug>-brand.md`.
3. Push. Cloudflare Pages deploys `main`, and posts a preview for every pull request on its
   own origin — the easy way to test a clean first run.
4. Rollback is one click on any earlier deployment. Know where it is on the morning of a
   showcase.

## Handover (P8)

### The pack

One message, every time, in this order:

1. **The link**, and the single file attached if they want one for email.
2. **What is live and what is demo**: the counts from `check-client.js` — items, demo
   flags, simulations still on the placeholder — and what demo means: plausible, ours,
   theirs to correct.
3. **The open asks**: `meta.confirmWithClient`, verbatim.
4. **How corrections reach us**: the portal's *Something wrong in this portal?* route, and
   exported process drafts and posts.
5. **The caveat**, below.

Send **the keys separately** from the link.

### The caveat, said out loud

Everything in the portal lives on the device that did it: progress, favourites, drafts,
posts, imported report totals. **An installed iPhone app has its own storage, separate
from Safari's** — browse in Safari, install, open the icon, and it is empty. An owner who
imports an export on a laptop will not see it on their phone. On one device it reads as a
reasonable limitation; the moment there is an icon on a home screen, people expect their
things to follow them. Say it before they find it. The answer is accounts and somewhere to
keep them, which is a product decision, not a build flag.

And the keys are a curtain, not security. If the client asks who can see this, the answer
is authentication in front of the site (Cloudflare Access) — never on a showcase with a
customer area, which is meant to have no password.

### Sign-off

The P8 gate passes when there is no demo content left, `meta.status` is
`confirmed-by-client`, and `meta.confirmWithClient` is empty. A client may accept some
demo content as their own in writing; clear its flag when they do.

## Running it (P9)

- **Take in exports.** A process draft from a client device carrying `resolves` replaces
  the gap it answers rather than landing beside it. A post becomes a permanent entry in
  `news.posts`.
- **Review on the cycle.** Every process has `reviewed` and `reviewCycle`; `check-client.js`
  fails G9.1 for each one past due. Run it monthly for every client.
- **Keep the builds current.** G9.2 fails whenever the config has changed since the last
  build — the most common reason a correction "did not go live".
