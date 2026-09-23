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

## Members

A client-facing audience alongside the staff ones. It carries no key — a member is not
being kept out of anything — and it is first in `audiences`, so it is the first door on
the landing page.

**Who sees whose content** is now declared rather than inferred. Each audience carries
`sees`, a list of the audiences whose items it can open; leaving it off keeps the old
rule (an employee sees employee content, everyone above sees their own and the
employee's). Members carry `"sees": ["member"]`, so no staff item reaches them — not in
Learn, not from a typed hash, which the item view now refuses the same way Reports and
the process library do.

`learnTitle` and `learnIntro` rename the Learn page per audience; for members it is
**Helpful tips**. Give them an `area` and `groups` of their own so the filter chips are
theirs, and a tab bar of five at most — a two-word uppercase label wraps at six.

### The floorplan

A `floorplans` block turns on **Look around**. It holds one `sites` entry per gym, so a
second location is data rather than code:

```json
"floorplans": {
  "title": "Look around", "intro": "…", "placeholder": "…",
  "sites": [{ "id": "alexandria", "label": "Alexandria", "viewBox": "0 0 100 134",
              "zones": [...], "equipment": [...] }]
}
```

The heading reads **Look around ONYX (Alexandria)** — the client's name and the site's
label, composed by the engine. With two or more sites a switcher appears above the search
box and the choice rides in `?site=`; with one, there is nothing to switch and it stays
hidden. A single legacy `floorplan` block still works and is treated as one site.

A zone is a plain rectangle in the viewBox's own units: `id`, `label`, `x`, `y`, `w`, `h`,
`blurb`. Keep them from overlapping, and keep labels short — they sit centred, and move to
the top of the zone once pins are on it.

Equipment carries `name`, `zone`, `tags`, an optional `note`, and `x`/`y` — the point on
the plan where that machine actually stands. A search matches a name, a tag or a zone
label; every zone holding a match lights up while the rest step back, and **a pin drops on
each machine that matched**. Hovering or tapping a pin gives its name, area, tags and note,
and highlights its row in the list below. Pins only ever draw for what was asked for:
fifty-one at once is a plan nobody can read. Tapping a zone picks it instead and pins
everything in it.

The tags double as chips under the search box — one row that scrolls sideways, so the body
parts are browsable without anyone guessing the words.

Two things to get right when drawing: give every stroke inside the plan
`vector-effect: non-scaling-stroke`, because the plan draws several viewBox units to the
pixel and a stroke-width of 1 comes out ten pixels wide; and lay pins out clear of the
label band, since a pin hangs *above* the point it marks.

### What's new

A `news` block gives a spotlight post and a swipeable carousel of the rest. Posts carry
`id`, `title`, `date`, `tag`, `lead` and `body`. The first post is the spotlight — order
the list, and the page follows.

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
