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
3. **Fill items.** Each item has a type: `simulation`, `hotspot`, `video`, `guide`,
   `checklist`, `article` or `link`, and each type carries its own icon in the interface.
   Guides carry `steps`, checklists carry `checks`, articles carry `body`, links carry
   `href`, simulations, hotspots and videos carry `src`. Mark anything the client has not confirmed
   `"demo": true`; the portal shows a Demo chip until it is cleared.
4. **Areas and groups.** `areas` are the Learn filter chips; three is usually right
   (Getting Started, Guides, Checklists), and the selected area's `blurb` prints under the
   page title. `groups` are the subheadings inside them, rendered in config order, each
   with its own `blurb`. Every item names a `group`, and its `area` must match that
   group's; the build refuses a mismatch. One group per area is fine, as Getting Started
   and Checklists have, and a busy area earns several, as Guides does with Opening and
   closing, Helping members, RECOVER, Safety and incidents and the rest. Name a group after
   the job, not the content type: a simulation belongs beside the guide it teaches.
5. **Simulations.** Until an export exists, point `src` at the placeholder with a title and
   step count. When it lands, point at the file and set `demo` to false.
6. **Interactive photos.** A SimStudio export can be one still with markers on it rather
   than a click-through. Those are `"type": "hotspot"`, with `hotspots` for the marker
   count and `ratio` for the capture's pixel size — the frame takes that shape at every
   width, so a portrait photo is not letterboxed into a 16/9 box. A marker never advances
   a step and never scores, so an export made only of markers never reports a completion:
   the portal listens for one anyway and gives the item a Mark as read button. Check the
   client's export in the frame at phone width before you ship it; see
   `clients/<slug>/portal/content/README.md` for two bar-allowance bugs worth knowing
   about.
7. **Build.** `node tools/build-portal.js <slug>`. The build refuses a path that names an
   unknown item, an item with an unknown audience, area or group, a group in an unknown
   area, an item whose area contradicts its group, and warns on a missing file. Every
   local simulation is inlined into the page and handed to its frame as `srcdoc`, so the
   portal is one file that works with nothing beside it — which is what a phone's file
   viewer gives you. `--no-embed` keeps them as separate files for a hosted build.
8. **Walk it** on a phone: the landing pick, name prompt, a simulation to completion, a guide ticked through,
   a wrong key then the right one, an export from Me. Check the desktop rail.
9. **Hand it over** as a link or a folder. Keys go to the client separately.

## Reports

An optional `reports` block turns on a Reports page: `audiences` says who sees it, `tiles`
is the KPI row (label, value, optional sub, signed delta with its label, `upIsGood`, a
twelve-point `trend`), then `members` (a twelve-month line), and any number of horizontal
bar charts (`title`, `unit`, optional `max`, `rows` of label and value). Every chart carries
a hover tooltip and a table view. Give the audience a `homeLink` to put a button to it on
their Home, and list `reports` in `nav` with `audiences` so it replaces Learn in their tab
bar. Figures are whatever the config says; mark the block `demo` until they are real.

An optional `import` block on `reports` puts an **Import data** button beside the page
title. It opens a panel that says what an import would take (`takes`), what it would do
with the files (`does`), and a `status` line — and nothing else: no file picker is wired
up. It is there so an owner being shown the page understands where their own numbers go
and can say which exports they have, and so the conversation about building the mapping
starts from something concrete. `cta` and `to` send them somewhere to have it; `demo: true`
puts a Soon chip on the button. Pair it with a guide in the owner's path so the detail
lives somewhere you can point at, the way `gd-owner-reports` does for ONYX.

## Home tiles

An audience with a `homeTiles` array gets a tile grid on Home instead of the standard
path list, and its path moves to its own page at `#/path`. Each tile carries an
`eyebrow`, a `blurb`, a `to` (a view id, `upnext`, or an external href with
`external: true`), an optional `span: 2`, and a `kind` that decides the figure the engine
draws: `stat` pulls a named tile out of the reports block, `upnext` resolves the next
unfinished item in the path, `progress` shows path completion, `processes` shows the
library's status split, `count` shows how many items the audience can see, and `mark`
sets the client's own mark beside the text. Use it where the audience navigates rather
than works through a sequence.

## Process library

An optional `processes` block turns on a library at `#/processes`, gated by `audiences`.
Each process carries a name, an `area`, an owner, a `status` (documented, draft or gap),
a review date and cycle, a summary, and `drives`: the ids of the guides, checklists and
simulations that process produces. That last field is the point of the whole thing. It
makes the link between a procedure and its training explicit, so changing a process shows
you exactly what has to change with it, and a process driving nothing is visibly a process
nobody is being trained on.

The library also takes drafts. "Document a process" captures a new one into the device's
own storage, where it joins the list marked as a draft so nobody mistakes it for signed-off
procedure, and exports as JSON for whoever maintains the portal. That keeps capture close
to the person who knows the process without pretending a static file can be a shared
database.

## Roles

Client-side keys keep the portal off a random phone and hide areas from casual browsing on a
shared device. They are not security.
Content that must be genuinely restricted, and a manager's view of the team, need a hosted
backend; that is the next phase and is not in this build.

## Progress

Per device, in the browser's storage under the key in the config. Simulations mark
themselves complete through the completion message every SimStudio export posts and
through the SCORM 1.2 and 2004 shims the portal exposes to the frame. Guides, checklists,
articles, links and placeholder videos are self-marked. The progress card export from Me
is the record a manager reads.
