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

### Importing a real export

An `import` block on `reports` puts an **Import data** button beside the page title and
makes it work. It holds `converters`: one entry per kind of export the client has. Each
gives an `id`, a `kind` (which converter in the engine runs it), a `title`, the `source`
it comes out of, a `blurb`, and a `status` of `ready` or `planned`. The panel lists them
all, which is half the point — an owner should leave it knowing which of their exports we
already read and which are still to be built. Only a `ready` one opens a file picker.

A ready converter also carries `expect`: the roles it needs, each with a `label` and a
list of lowercase `match` fragments tried against the file's headers, so the column can be
called whatever that system calls it. Mark the ones the maths cannot run without as
`required` — a file missing those is rejected by name rather than half-read. `multi: true`
takes every matching column instead of the first, which is how three separate note fields
become one body of text. `gives` lists what comes back, `corporate` names the membership
products that arrive through an employer rather than the funnel, and `patterns` holds the
strings a particular system writes into its own notes (ONYX's pasted tour script, and the
line GymMaster leaves when a prospect record becomes a member).

`vocabulary` turns the free text into something countable: each rule is a `name`, a `kind`
of `pos`, `neg` or `neu`, and a comma-separated `words` list, where a word starting with a
minus sign excludes. Tune it per client; the words ONYX staff actually type are not the
words the next gym will. The rules that miss are shown alongside the rules that hit.

The maths lives in the engine, not the config, keyed by `kind`. A new export is a config
entry plus one converter function.

**CSV always works; a spreadsheet needs the network once.** The portal is a single file
with nothing to fetch and that stays true: CSV is parsed in the engine. An `.xlsx` is a
zip and needs a real parser, so one is fetched the first time somebody picks one — the
only outbound request the portal ever makes, and only on demand. Opened offline, the
`.xlsx` path says so and points at Save As CSV. One check is lost that way: a date stored
as text is only visible in a typed file, because in a CSV every cell is text, and the
panel says so rather than quietly reporting one fault fewer.

**Only totals are stored.** The rows are read, counted and dropped; what lands in
`localStorage` is the aggregate result and the file's name, a few kilobytes with no
member-level anything in it. That is a promise the panel makes before the file is chosen,
so keep any change on the right side of it — never put a note snippet or an ID into the
result object.

### Insights

An `insights` block adds a second page behind an **Insights** button on Reports. Reports
is the dashboard; Insights is the reading of it: the findings the converter wrote from the
numbers, then the breakdowns behind them, then what the conversion flag is actually made
of. Rates on groups under eight rows are marked `low` with a hatched bar rather than
hidden — the caution belongs on the chart, not in a withheld number.

`demo` holds a worked example so the page is never an empty shell, badged so nobody reads
it as their own month. Do not hand-write it. `node tools/make-insights-demo.js <slug>`
lifts the converter out of the engine between its `@converter` markers, runs it over
`clients/<slug>/workbench/demo-data.json`, and writes the result into the config, so the
example is the same arithmetic a real import goes through and the two cannot drift.
Re-run it whenever the converter changes.

Once something is imported, Reports grows a **From your data** section above the demo
figures, with the file, the period and the row count on it, and Replace and Remove beside
them. The two kinds of number never share a block.

## Grouping the doors

The welcome screen lists every audience as a door. Give some of them a `doorGroup` and
a labelled hairline appears above the first one carrying it, and again whenever the value
changes — so the list reads as groups rather than a flat four.

Use it where the split is real. At ONYX the member door is the public way in and the
other three are staff behind a key, which is a true and permanent division; the padlock
icons say the same thing but only while the doors are locked, and they vanish the moment
somebody unlocks one. Make the label earn its place by explaining the group rather than
naming it twice: *Working here — you'll need a key* also tells a new starter what the
padlock means, which nothing else on the page did.

## Modules on Learn

A short library reads fine as one page of cards. A long one does not: thirty-six items is
a scroll nobody finishes, and the group headings end up doing the work of a contents page
without being one. Put `learnModules: true` on an audience and Learn becomes that contents
page — a card per group with its own progress — and the items sit one click in at
`#/learn?module=<group>`.

Nothing else changes: the groups are already the modules. Searching skips them and goes
straight to matching items, because somebody typing a word wants the thing rather than the
shelf it is on; searching inside a module stays inside it. The area chips come off, since
each module card already carries its area.

Leave it off where the library is small. ONYX members have eleven tips across three
groups and read better flat, so employee, manager and owner have it on and member does not.

## Home cards

`homeCards` on an audience is a list of `{to, type, title}` and replaces the path listing
on their Home with a row of cards. Up next still appears — it comes off the same path — so
what goes is the full contents, not the sense of where you are up to.

Use it when the path is long enough that printing it on the Home page buries everything
else. The employee's eighteen-item first week did exactly that; two cards to Learn and
Support say the same thing in a screen's worth of space.

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

A gap is the one status that asks something of you, so its page says so and offers the
only thing that closes it: **Document this process**, which opens the form already filled
in from the gap — name, area, owner, why it matters — leaving the steps, which is the part
only a person can write. The draft it saves carries `resolves`, the id of the gap it
answers, so the gap stops reading as untouched, the counts move from gap to draft, and
whoever takes the export in knows which entry it replaces rather than adding a duplicate
beside it.

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

A site's `note` is its disclaimer, shown as a callout directly under the heading with
`noteTitle` as its bold lead-in. It sits above the plan on purpose: a drawn layout looks
authoritative whether or not it is one, so a caveat parked under the equipment list is a
caveat nobody reads before drawing conclusions. Say plainly that the zones are
placeholders and that the real thing is their layout, their equipment, their names.

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

### Favourites

Every item card carries a star, and so does the item page. Starring puts an item in a
**Favourites** group at the top of that audience's Learn page, most recent first. It costs
nothing to configure — it is on for every audience — and it earns its place wherever
someone comes back for the same thing over and over: the sauna speaker, the locker code,
the one form they can never remember.

Favourites live in the device's own storage beside progress, so they are a shortcut, not
an account. The list is filtered by what the audience can see, so a starred item stays
out of the way of anyone it was not meant for.

Note the markup: a card is wrapped in `.cw` so the star can sit over it, because a button
cannot live inside an `<a>` and the star has to be a real control for anyone on a keyboard
or a screen reader. If you restyle a card, keep the wrapper.

### A support page of their own

`support.audience.<id>` replaces the Support page for that audience: an `intro`, a `faq`,
and a `contact` block (`label`, `text`, `name`, `address`, `email`, `phone`, `phoneLabel`,
`demo`). Members get that instead of the staff page — the questions the desk actually
gets, and one way to reach the gym, rather than an escalation ladder aimed at whoever is
on shift. The contact rows are the same tap-to-copy rows the staff contact cards use, so
they behave the same in an in-app browser that swallows `mailto:` and `tel:`. Leave the
block out and the audience gets the staff page.

### What's new, and writing one

A `news` block gives a spotlight post and a swipeable carousel of the rest. Posts carry
`id`, `title`, `date`, `tag`, `lead` and `body`; the list is ordered by date, newest
first, and the newest is the spotlight. `audiences` says who reads it.

`authors` says who can write one. Those audiences get a **Write a post** button and a form
of four fields — title, tag, date, body — where a blank line starts a paragraph and the
first paragraph becomes the `lead`, because that is the line that had to be written well
anyway. `tags` fills the tag field's suggestions, so the blog does not end up with six
spellings of the same thing.

**A date in the future schedules it.** The author sees it in the list with a Scheduled
badge and the date; nobody else sees it, and a member who opens its link directly is sent
back. On the day it appears on its own. Posts written this way live on the device and
export as JSON, the same bargain the process library makes: capture next to the person
who knows, without pretending a static file is a shared database.

### Cards, chips and stars

Every card is the same height — two lines of type, two of title, two of blurb, all
clamped. Each group renders its own grid, so stretching rows only lines up one section;
the height is fixed instead. If you add to the type row, re-measure it.

Per-item `demo: true` no longer prints a chip on the card. Twenty Demo chips stop being
read; one banner above the list does not. Set `client.demoNote` and the Learn page prints
it once, whenever anything in view is demo. The chip still shows on an item's own page,
where it is the only one on screen.

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
