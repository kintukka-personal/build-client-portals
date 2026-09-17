# ONYX portal content

Where the real files go. Every path is relative to `clients/onyx/portal/`, and every
file carries the `onyx-` prefix.

## Simulations

SimStudio exports are single HTML files. Drop them here:

```
content/sims/onyx-sim-<item-id>.html        the export
content/sims/src/onyx-sim-<item-id>.simproj.json   the project it came from; keep it
```

Before exporting, set **Settings → Simulation setup → How the learner works through it →
The bars around the simulation** to *Hidden while embedded in a page*. The portal owns the
chrome; the export gets its bars back the moment it goes full screen.

Then point the item at it in `onyx-portal.json`:

```json
{ "id": "sim-checkin", "src": "content/sims/onyx-sim-checkin.html", "demo": false, ... }
```

Run `node tools/build-portal.js onyx` and the portal picks it up. The export posts
`simulation:complete` to the portal on its closing screen and writes to the SCORM shim
the portal exposes; both mark the item complete with the score.

Until an export lands, `onyx-sim-placeholder.html` sits in the frame. It is generated from
`template/portal/sim-placeholder.html` by the build and takes `?title=` and `?steps=`.

## Video

```
content/video/onyx-<item-id>.mp4
content/video/onyx-<item-id>.jpg             optional poster
```

Set `"src"` and optionally `"poster"` on the item. MP4 with H.264 plays everywhere,
including the SimStudio video export.

## What the build produces

`onyx-portal.html` is generated. Edit `onyx-portal.json` for content and
`template/portal/portal-engine.html` for behaviour, then rebuild. Never edit the output.

## Opening from a file share

Opened as a file, the portal loads its simulations from the sibling `content/` folder and
completion arrives by message. The SCORM shim needs the portal and the export to share an
origin, which a file share does not give them, so on a file share the message path does
the work and on a web host both paths do.
