# Playbook 02 — Build a client's portal

The portal is one engine and one config per client. The brand portfolio must exist first
(Playbook 01), because the portal is built from its tokens and logo.

## What you produce

```
clients/<slug>/portal/
  <slug>-portal.json                 content: client facts, audiences and keys, paths, items, support
  <slug>-portal.html                 built; never hand-edited
  content/sims/<slug>-sim-*.html     SimStudio exports, bars set to hidden while embedded
  content/sims/src/*.simproj.json    the projects those exports came from
  content/video/<slug>-*.mp4         videos
  content/README.md                  where files go and how items point at them
```

## Steps

1. **Copy the ONYX config** to `<slug>-portal.json` and replace the client block, the
   audiences and their keys, and the footer.
2. **Write the first path.** Ten to fifteen items for the first audience, in the order a
   new starter meets them. Videos first, the opening shift, then the systems simulations.
3. **Fill items.** Each item has a type: `simulation`, `video`, `guide`, `checklist`,
   `article` or `link`. Guides carry `steps`, checklists carry `checks`, articles carry
   `body`, links carry `href`, simulations and videos carry `src`. Mark anything the client
   has not confirmed `"demo": true`; the portal shows a Demo chip until it is cleared.
4. **Simulations.** Until an export exists, point `src` at the placeholder with a title and
   step count. When it lands, point at the file and set `demo` to false.
5. **Build.** `node tools/build-portal.js <slug>`. The build refuses a path that names an
   unknown item, an item with an unknown audience or area, and warns on a missing file.
6. **Walk it** on a phone: name prompt, a simulation to completion, a guide ticked through,
   a wrong key then the right one, an export from Me. Check the desktop rail.
7. **Hand it over** as a link or a folder. Keys go to the client separately.

## Roles

Client-side keys hide areas from casual browsing on a shared device. They are not security.
Content that must be genuinely restricted, and a manager's view of the team, need a hosted
backend; that is the next phase and is not in this build.

## Progress

Per device, in the browser's storage under the key in the config. Simulations mark
themselves complete through the completion message every SimStudio export posts and
through the SCORM 1.2 and 2004 shims the portal exposes to the frame. Guides, checklists,
articles, links and placeholder videos are self-marked. The progress card export from Me
is the record a manager reads.
