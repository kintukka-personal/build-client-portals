# Playbook 01 — Capture a client's brand

The brand portfolio is the first thing built for every client and the source of truth
everything else reads from. One folder, one JSON file, one generated stylesheet, one
visual sheet the client signs off. ONYX is the worked example: `clients/onyx/brand/`.

## What you produce

```
clients/<slug>/brand/
  <slug>-brand.json          the truth; edit this and nothing else
  <slug>-tokens.css          generated; never hand-edited
  <slug>-brand-sheet.html    the visual portfolio for sign-off
  <slug>-brand.md            the written portfolio
  assets/
    <slug>-logo.svg          lockup (client master file, or a stand-in until it arrives)
    <slug>-mark.svg          mark alone
    reference/<slug>-*       cropped captures and a contact sheet of the sources

Every file carries the client slug, so files from different clients never collide when
they sit side by side in a download folder, an email or a build.
```

## Steps

1. **Collect sources.** The client's website on a phone and on a desktop, their socials,
   any PDF or deck they have, signage photos. Sixteen phone screenshots covering home,
   pricing, services, team and contact is the working minimum. Ask up front for master
   logo files and any brand guideline; do not wait for them to start.
2. **Sample, do not eyeball.** Pull the dominant colour of each region with a pixel
   histogram, not a colour picker on one pixel. A real brand colour comes back as one
   dominant value across a flat region. Record hex and RGB.
3. **Identify the typeface** from letterform shapes and confirm against Google Fonts or
   the site's CSS when it is reachable. Record the weights actually in use.
4. **Fill `<slug>-brand.json`** starting from `template/brand.template.json`. Every section has a
   `_help` note. Keep the client's own words for positioning and promise.
5. **Derive the portal tones.** Surface, raised surface, ink, muted, hairline, pressed
   states, error. Mark every derived colour as derived in its usage note.
6. **Run the contrast check.** `node tools/build-tokens.js <slug>` prints every pair. Any
   site pattern that fails AA gets a portal variant and a sentence in `<slug>-brand.md` saying so.
   Shapes and colours stay as the site has them; only the ink changes.
7. **Draw the logo stand-ins** as SVG from a zoomed capture with a 10% grid over it.
   Geometry first, then stroke weight. Write the replacement note in the file comment.
8. **Build the sheet.** Copy `clients/onyx/brand/onyx-brand-sheet.html` to `<slug>-brand-sheet.html`, replace the content,
   keep the `/* @tokens */` markers, run the build again so the tokens are injected.
9. **Render and check** at 390px and 1280px with Playwright. Headless Chromium alone
   clamps windows to 500px wide, so use device emulation for phone widths.
10. **Write `<slug>-brand.md`** from the sheet. Snapshot, voice, logo, colour with the contrast
    table, type, shape, components, imagery, portal translation, SimStudio kit, provenance.
11. **Send the sheet** to the client. Their corrections go into `<slug>-brand.json`, the build
    runs, the version bumps, the changelog gets a line.

## The SimStudio kit

Six decisions and three shape values, straight out of `<slug>-brand.json → simstudio`. Enter them
in *Settings → Brand kits*, save the kit under the client's name, *Export* it and keep the
`.simbrand.json` beside `<slug>-brand.json`. Every simulation for the client wears the kit, and the
portal's callout styling matches it.

## Time

A full capture from a public site, including the sheet, is a working day. With master
files and a guideline in hand it is half of one.
