# Playbook 05 — Content standards

How portal content is written, so every client's portal reads like the same product in a
different voice. [Playbook 02](02-portal-build.md) says what each config block does; this
says what goes in it. ONYX's config is the worked example of every rule here.

## The two markers

- **`TODO`** at the start of a value means we have not written it. The scaffold is full of
  them; the Phase 3 gate fails while one is left. A showcase never carries one.
- **`"demo": true`** means we wrote it and the client has not confirmed it. That is most
  of a first build, and it is fine: `client.demoNote` prints one notice on Learn whenever
  anything in view is demo, and the item page carries its own chip. The client clears
  them in Phase 8.

Write a TODO-free draft first, all of it demo, then correct it with the client. Never
leave a TODO standing in for content you expect the client to supply — write the
plausible version, mark it demo, and ask.

## Voice

The client's, from `voice` in their brand file: the tone words, the rules, and above all
the vocabulary. Their word for their customers goes everywhere — door labels, tips, FAQ,
posts. ONYX says *members*, *coaches* and *community*, never *customers*, *trainers* or
*users*.

Across every client:

- Speak to one person: *you*. Benefit first, detail second.
- Sentence case for titles and headings. Capitals only where the brand puts them.
- One idea per step, one paragraph per idea.
- No exclamation marks in instructions.
- Write a fact once, in the item that owns it. When it changes, search the config for
  every other place it was repeated. ONYX's "RECOVER is walk-in" was wrong and had spread
  to five places.

## The audiences

| Audience | Key | Sees | Home | Learn | Tabs |
| --- | --- | --- | --- | --- | --- |
| Customer (`member`) | none, first door | only its own items | tiles | flat, renamed (*Helpful tips*) | Home, Tips, News, Support (+ Look around) |
| Employee | `employee` | its own | Up next and two cards | modules | Home, Learn, Support, Me |
| Manager | `manager` | its own and the employee's | Up next and the path | modules | Home, Learn, Support, Me |
| Owner | `owner` | its own and the employee's | tiles | modules | Home, Reports, Blog, Processes, Support |

The customer door carries no key because a customer is not being kept out of anything.
The three staff doors share one `doorGroup` label that explains the padlock: *Working here
— you'll need a key*. Five tabs at most — a sixth wraps a two-word label.

## Paths

- One path per staff audience. The first is the new starter's first week.
- **Ten to eighteen items**, in the order a new starter meets them: the welcome video,
  the first-week checklist, the walk-through of the space, then the shift they will work
  first, then the system simulations, each straight after the guide it belongs to.
- Reference material — the deep clean, the evacuation checklist — lives in Learn without
  joining the path. The path is the route through; Learn is everything.
- A path blurb never hard-codes a count. It goes stale the first time an item moves.

## Areas and groups

- Four areas: **Getting Started**, **Guides**, **Checklists**, and the customer's own
  (**Helpful tips**). Each prints its blurb under the page title.
- Groups are the subheadings inside an area, and with `learnModules` they are the modules.
  Name a group after the job — *Opening and closing*, *Helping members*, *Safety and
  incidents* — never after the content type. A simulation sits in the group of the guide
  it teaches.
- One group per area is fine. A busy area earns several.

## Items

| Type | Carries | Write it as | Size |
| --- | --- | --- | --- |
| `guide` | `steps` | One action per step, the reason in the same sentence when it is not obvious | 5–12 steps, 1–6 minutes |
| `checklist` | `checks` | A state that is true when done — *Alarm disarmed and entry lights on* — not an instruction | 5–12 checks |
| `article` | `body` | Paragraphs; the first one is the point | 5–8 paragraphs |
| `simulation` | `src`, `steps` | A SimStudio click-through of one task in one system | 6–12 steps |
| `hotspot` | `src`, `hotspots`, `ratio` | One real photo with markers | 3 markers |
| `video` | `src`, optional `poster` | Short, one subject | 2–4 minutes |
| `link` | `href` | Out to something the client owns | — |

The sizes are ONYX's own ranges across 57 items. Every item has an `id`: staff items
take their type as prefix (`gd-`, `chk-`, `art-`, `sim-`, `hot-`, `vid-`, `lnk-`), then
`mgr-` or `owner-` for those audiences (`gd-mgr-roster`, `art-owner-scorecard`), and
customer items are `m-` and the topic (`m-lockers`). Each also has a `title` in sentence
case that names the task, a `blurb` of one sentence that says what you will be able to
do, and `minutes`.
Pair them: a guide explains why, its checklist is the tick list for the shift — *Run it
every opening shift. The guide explains why; this is the tick list.*

Split by question, not by subject. ONYX's one sauna guide became three — the panel, the
light colour, connecting a phone — because they are three different questions and nobody
scrolls seven steps for the one they came for.

## Support

In this order, because this is how people look for help:

1. **The questions.** The real ones the desk gets asked, each answered in two to four
   sentences. Staff and customers get separate lists — ONYX has six and eight.
2. **Direct assistance.** One card per person to go to (ONYX has four), each leading with the problems it
   covers — so a person recognises theirs — then the name, role and how to reach them.
   The first card is the one answer to *who do I ask on shift*.
3. **Something wrong in this portal?** — how a correction reaches whoever maintains it.

Customers get `support.audience.member`: their own questions, then one contact block for
the business, not the staff escalation ladder.

Placeholder contacts use the reserved ranges, never a real-looking guess: `example.com`
addresses, and Australia's fictitious `(02) 5550 01xx` numbers, marked demo. `phone` is
what `tel:` dials; `phoneLabel` is what a person reads.

## Process library

- Every process has an `area`, an `owner` (a role, not a name), a `status`, a `reviewed`
  date and a `reviewCycle`, a one-line `summary`, and `drives`: the ids of the items it
  produces. That last field is the point. Changing a process shows exactly what training
  has to change with it, and a process driving nothing is visibly a process nobody is
  trained on. The Phase 3 gate checks every id in `drives` exists.
- Include drafts and gaps. ONYX ships 22 documented, 4 drafts and 3 gaps, because a library
  that claims everything is documented is not telling the truth about any business. A
  gap's summary says why it matters; its page asks for it to be documented.

## Posts

- `title` says what changed. `lead` is the one line that says why it matters to the
  reader — it is the first paragraph, and the one that has to be written well. `body` is a
  paragraph per idea. `tag` comes from the config's `tags`, so the blog does not collect
  six spellings of one thing.
- Five posts in a first build, newest first, about a week apart — ONYX's run from 7 August
  to 18 September.

## Reports copy

Every tile names what it counts (*Visits per member per week*, not *Visits*), every delta
names what it is against (*vs August*), and the page states its period in `asOf`. The demo
`note` says plainly that the client's own system is the source of truth.

## Before calling it done

- `node tools/check-client.js <slug>`: no TODO, every process drives items that exist.
- Read the whole portal once as each audience, in the client's voice, against the
  vocabulary lists.
- Search the config for every fact you changed today.
