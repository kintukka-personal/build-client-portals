# Playbook 06 — Simulations and media

Every simulation, interactive photo and video starts on a placeholder and ends as a real
file wearing the client's brand kit, checked inside the portal's frame at phone width.
The per-client file layout is in `clients/<slug>/portal/content/README.md`; ONYX's
lockers photo, `clients/onyx/portal/content/sims/onyx-sim-lockers.html`, is the worked
example — the only real export so far, and the one that taught everything below.

## What you produce

```
clients/<slug>/brand/<slug>.simbrand.json                 the SimStudio kit, exported in Phase 1
clients/<slug>/portal/content/sims/<slug>-sim-<item-id>.html          each export
clients/<slug>/portal/content/sims/src/<slug>-sim-<item-id>.simproj.json   the project it came from
clients/<slug>/portal/content/video/<slug>-<item-id>.mp4   and an optional .jpg poster
clients/<slug>/portal/content/README.md                   the hand-fix table, kept current
```

## Before the first recording

1. **The kit.** In SimStudio, *Settings → Brand kits*, enter the six decisions from
   `simstudio` in the brand file — highlight, box, player accent, callout paper, callout
   ink, wrong attempt — plus screen dim, roundness and border weight, and the typeface.
   Save it under the client's name and *Export* it to `<slug>.simbrand.json` beside the
   brand file. Every simulation for the client wears it, and the portal's callouts match.
2. **The list.** The first simulations are the system tasks a new starter does most,
   from section 6 of the intake — check-in, a booking, a sale. Each is already an item on
   the placeholder; the item's `title` and `steps` are the brief.

## Steps, per simulation

1. **Record one task in one system.** Six to twelve steps. If it needs more, it is two
   simulations.
2. **Set the bars.** *Settings → Simulation setup → How the learner works through it → The
   bars around the simulation* → **Hidden while embedded in a page**. The portal owns the
   chrome; the export gets its bars back when it goes full screen.
3. **Export** to `content/sims/<slug>-sim-<item-id>.html`, and save the project to
   `content/sims/src/`. The project is the only way to re-export, and every hand fix is
   lost on re-export, so keep both.
4. **Check the size.** A photograph captured in the export belongs in JPEG at about
   quality 92, never PNG. ONYX's lockers photo was a 494 KB PNG — 46% of the whole portal
   — and became a 115 KB JPEG at the same 818×1220 pixels, with the keypad digits that
   the guide points at indistinguishable at 4×. The export went from 769 KB to 280 KB and
   the portal from 1,057 KB to 568 KB. A screenshot of an interface can stay PNG.
5. **Point the item at it.** Set `src`, clear `demo`, and rebuild:

   ```bash
   node tools/build-portal.js <slug>
   ```

6. **Check it in the frame at phone width** — 390px — not on its own. Every bug below was
   invisible in the export and obvious in the frame.

## Interactive photos

One still with markers on it is `"type": "hotspot"`:

```json
{ "id": "hot-lockers", "type": "hotspot", "hotspots": 3, "ratio": "818 / 1220",
  "src": "content/sims/onyx-sim-lockers.html", "demo": false, … }
```

`ratio` is the capture's own pixel size, so the frame takes that shape at every width and
a portrait photo is not letterboxed into 16/9. A marker never advances a step and never
scores, so an export made only of markers never reports a completion; the item carries a
**Mark as read** button that does the work.

## Known SimStudio export bugs

Both were found on ONYX's lockers export, both are fixed by hand in a commented `<style>`
block before `</head>`, and **both are lost on re-export**. Re-apply them, record them in
the content README's hand-fix table, and raise them with SimStudio — fixing them at
source is the real answer.

1. **The capture is squashed below 720px.** The export caps it at
   `min(52vh, 100dvh - 300px)`, reserving room for title and foot bars that *Hidden while
   embedded* has removed. Inside a 345px frame the capture came out 215px tall and out of
   shape. The rule wants `:not(.bare)`.
2. **A marker's card runs off the frame below 760px.** A callout docks under the capture
   at that width; a marker's card does not, so it opened beside its marker at
   `min(70vw, 280px)` and cut half of every line off. The patch docks it the way a callout
   docks.

## Completion

Every SimStudio export posts `simulation:complete` on its closing screen and writes to
the SCORM 1.2 and 2004 shims the portal exposes to the frame; either marks the item
complete with its score. In the single file, simulations are inlined and handed to the
frame as `srcdoc`, which shares the portal's origin, so both paths work even from a file.

Until an export lands, the placeholder stands in. It is built from
`template/portal/sim-placeholder.html`, takes `?title=` and `?steps=`, walks that many
steps and posts the real completion payload, so the wiring is demonstrable on day one.

## Video

MP4 with H.264, one to four minutes, one subject. `src` points at
`content/video/<slug>-<item-id>.mp4`, `poster` at a JPEG of the same name. Videos are
never inlined: the single file plays them only when the `content/` folder travels with
it, so a portal with real video is delivered as the hosted build. A video with no `src`
shows a placeholder the person marks as watched, and `check-client.js` counts it as
outstanding.

## The size budget

Keep the single file under 1 MB. At 1,057 KB ONYX's was truncated by a preview pane and
came up as chrome with nothing in it. The build prints the size and the inlined total on
every run; the hosted build fetches each simulation only when it is opened, so it has no
such ceiling.
