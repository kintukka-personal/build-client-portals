# Playbook 04 — Reports and data

The owner's Reports page starts as demo figures that show the shape. This is how it comes
to read the client's own numbers: one real export at a time, each with a converter written
against the columns that system actually produces. The config reference for the `reports`,
`import` and `insights` blocks is in [Playbook 02](02-portal-build.md#reports); this is the
workflow that fills them. ONYX's GymMaster task report is the worked example:
`clients/onyx/workbench/`.

## What you produce

```
clients/<slug>/workbench/demo-data.json          the sample: real structure, synthetic prose
clients/<slug>/workbench/tools/make-demo-data.*  how the sample was made, kept as a record
clients/<slug>/portal/<slug>-portal.json         reports.import (converters, vocabulary) and reports.insights.demo
```

The source exports themselves are **never** committed. They sit on a path you supply.

## Steps

1. **Get one real month.** Ask in Phase 0 for one month of each export the owner already
   pulls, with direct identifiers (IDs, names, staff) replaced by sequential tokens before
   the file is sent. One real file beats any amount of sample: the converter is written
   against the columns the system writes, and a made-up file gets those wrong.
2. **Profile it in the workbench.** Open `clients/onyx/workbench/onyx-data-workbench.html`
   and drop the file in; it is read in the page and nothing is uploaded. Read the Profile
   stage cell by cell, not by header: fill rate, the real type of each value, distinct
   counts, and whether a column is a vocabulary to pivot on or prose to interpret. Note
   every fault with its rows — ONYX had two dates stored as text, which no filter or date
   calculation picks up and nothing warns about.
3. **Read the free text before trusting the scrub.** ONYX's identifiers had been replaced,
   but real first names, surnames and a health reference survived in the note columns.
   Free text is where a column-level scrub fails. Treat every note column as identifying
   until you have read it.
4. **Map the roles.** Give each column a role: person, event date, channel, source, staff,
   outcome, history, notes. The workbench guesses from the header and the column's shape;
   correct it once and write the header fragments down — they become the converter's
   `match` lists.
5. **Agree the definitions that move the headline, with the owner.** For ONYX the decision
   was what counts as a conversion: the export's own Active Memberships flag said 27; only
   memberships the team sold said 20. The defaults, both from ONYX:
   - **Count the way the client's system counts,** so the report reconciles with what
     they already see, and **report the composition underneath** (20 sold, 7 through an
     employer scheme, 2 win-backs cutting across both). Arguing the denominator costs more
     than it returns when the finding survives either way — ONYX's tour gap was 54 points
     on the flag and 52 on the stricter count.
   - **Show every rate.** Groups under eight rows are drawn with a hatched bar and a
     `low` chip. Printing "3 of 6" while withholding "50%" is precious when the reader can
     do the division; the caution belongs on the chart.
6. **Write the vocabulary.** Rules of `name`, `kind` (`pos`, `neg`, `neu`) and a
   comma-separated `words` list, where a leading minus excludes. Use the words the
   client's staff actually type, which you only learn from step 2. Keep the rules that
   miss on screen beside the ones that hit; the misses are where the next rule comes from.
7. **Write the sample.** `demo-data.json` keeps the real structured columns — dates,
   types, sources, staff tokens, ages, products — so every demo figure is a real figure.
   The free-text columns are regenerated: derive each row's tags from the real note, then
   write fresh prose that carries the same tags, so the tag distribution stays true while
   nobody is identifiable. Keep the generator beside it (ONYX's is
   `workbench/tools/make-demo-data.py`) as the record of how the sample was made.
8. **Declare the converter in config.** In `reports.import.converters`: `id`, `kind`,
   `title`, `source`, `blurb`, `status: "ready"`, and `expect` — each role with its
   `label`, its `match` fragments, and `required: true` for the ones the maths cannot run
   without, so a wrong file is rejected by name rather than half-read. Add `gives`,
   `corporate` and `patterns` as Playbook 02 describes.
9. **Generate the worked example.**

   ```bash
   node tools/make-insights-demo.js <slug>
   ```

   It lifts the converter out of the engine between its `@converter` markers, runs it
   over the sample and writes `reports.insights.demo`. Never hand-write that block: the
   example has to be the same arithmetic a real import goes through. Re-run it whenever
   the converter or the sample changes.
10. **List everything else as planned.** Every other export the owner mentioned gets a
    converter entry with `status: "planned"`. The panel lists them all, so the owner sees
    which of their files are read and which are still to build — which is half the point
    of the button.
11. **Check the first real import against a number they know.** Import a month the owner
    has already reported on and compare one figure — members, joins, takings — before
    anyone trusts the rest.

## When the export is a new kind

The maths lives in the engine, keyed by `kind`; ONYX's `leads` is the only one written.
A new kind is one converter function between the `@converter` markers in
`template/portal/portal-engine.html`, returning the same result shape `leads` does
(`kind`, `rows`, `typed`, `period`, `base`, `tiles`, `groups`, `tags`, `coverage`,
`split`, `quality`, `findings`), plus a config entry. Then steps 8 to 11. Budget one to two days for a new kind and half a day for a
client whose export is one we already read.

## The promises the importer makes

Keep every change on the right side of these; the panel states them before a file is
chosen.

- **CSV always works; a spreadsheet needs the network once.** CSV is parsed in the
  engine. An `.xlsx` fetches a parser the first time one is picked, the only outbound
  request the portal ever makes. Offline, it says so and points at Save As CSV.
- **Only totals are stored.** Rows are read, counted and dropped. What reaches
  `localStorage` is the aggregate and the file's name — no member ID, no note snippet,
  ever.
- **The two kinds of number never share a block.** Imported figures appear under *From
  your data* with the file, period and row count; demo figures stay badged below them.
