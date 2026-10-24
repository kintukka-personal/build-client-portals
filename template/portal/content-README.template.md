# {{name}} portal content

Where the real files go. Every path is relative to `clients/{{slug}}/portal/`, and every
file carries the `{{slug}}-` prefix. The full production rules — export settings, the
known SimStudio export bugs, image formats and the size budget — are in
[`docs/playbook/06-simulations-and-media.md`](../../../../docs/playbook/06-simulations-and-media.md).

## Simulations

SimStudio exports are single HTML files. Drop them here:

```
content/sims/{{slug}}-sim-<item-id>.html                the export
content/sims/src/{{slug}}-sim-<item-id>.simproj.json    the project it came from; keep it
```

Before exporting, set **Settings → Simulation setup → How the learner works through it →
The bars around the simulation** to *Hidden while embedded in a page*, and apply the
**{{name}}** brand kit. Then point the item at the file in `{{slug}}-portal.json` and set
`demo` to false:

```json
{ "id": "sim-core-task", "src": "content/sims/{{slug}}-sim-core-task.html", "demo": false, ... }
```

Until an export lands, `{{slug}}-sim-placeholder.html` sits in the frame. It is generated
from `template/portal/sim-placeholder.html` by the build and takes `?title=` and `?steps=`.

## Interactive photos

One still with markers on it is `"type": "hotspot"`, with `hotspots` for the marker count
and `ratio` for the capture's own pixel size (`"818 / 1220"`), so a portrait photo is not
letterboxed into a 16/9 frame.

## Hand fixes applied to exports

Record every hand edit to an export here, file by file, with the reason. **They are lost
on re-export.**

| File | Fix | Why | Fixed at source? |
| --- | --- | --- | --- |
| | | | |

## Video

```
content/video/{{slug}}-<item-id>.mp4
content/video/{{slug}}-<item-id>.jpg             optional poster
```

MP4 with H.264. Set `"src"` and optionally `"poster"` on the item.

## What the build produces

`{{slug}}-portal.html` is generated. Edit `{{slug}}-portal.json` for content and
`template/portal/portal-engine.html` for behaviour, then rebuild. Never edit the output.

```
node tools/build-portal.js {{slug}}              # one file, simulations inlined
node tools/build-portal.js {{slug}} --site       # the hosted, installable folder
```
