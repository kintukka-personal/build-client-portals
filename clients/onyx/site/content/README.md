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

## Interactive photos

A SimStudio export can be one still — a real photo with markers on it — rather than a
click-through. Those go in as `"type": "hotspot"` and live in the same folder:

```json
{
  "id": "hot-lockers", "type": "hotspot", "hotspots": 3,
  "src": "content/sims/onyx-sim-lockers.html",
  "ratio": "818 / 1220"
}
```

`ratio` is the capture's own pixel size. The frame takes that shape at every width, so a
portrait photo is not letterboxed into a 16/9 box. Leave it off and the frame behaves as
it always has. `hotspots` is the marker count and shows in the item's metadata.

A marker is content, not a target: it never advances a step and never scores, so an export
made only of markers never reaches its closing screen and never reports a completion. The
portal still listens for one, and gives the item a **Mark as read** button that does the
work. Nothing else in the frame changes.

### Two fixes applied by hand to onyx-sim-lockers.html

Both are in one commented `<style>` block before `</head>`. **They are lost on re-export**
— re-apply them, or fix them at source in SimStudio, which is the better answer:

1. Below 720px the export caps the capture at `min(52vh, 100dvh - 300px)`, reserving room
   for the title and foot bars. With **Bars: never** those bars are not there, so inside a
   345px frame the capture was squashed to 215px tall and stretched out of shape. The rule
   wants `:not(.bare)` on it.
2. A callout docks under the capture below 760px; a marker's card does not, so it opened
   beside its marker at `min(70vw, 280px)` and ran off the right of the frame. The patch
   docks it the same way a callout docks.

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

## One file, or a folder

By default the build **inlines every local simulation** into `onyx-portal.html` and the
engine hands each one to its frame as `srcdoc`. So the portal is a single file you can
email, AirDrop or drop in a chat, and the simulations come with it. A file opened on its
own cannot reach a sibling `content/` folder, which is what a phone's file viewer gives
you — before this, every simulation frame came up black.

Each file is inlined once however many items point at it. The placeholder's `?title=` and
`?steps=` have no URL to ride on, so they ride on the frame's `name` instead.

```
node tools/build-portal.js onyx              # one file, simulations inlined
node tools/build-portal.js onyx --no-embed   # simulations stay separate files
```

Use `--no-embed` for a hosted build, where a 1 MB page that loads every simulation up
front is worse than a small page that fetches one when it is opened.

Completion arrives by message either way. The SCORM shim needs the portal and the export
to share an origin: a `srcdoc` frame does share it, so the inlined build gets both paths
even from a file; separate files on a file share get the message path only, and both on a
web host.
