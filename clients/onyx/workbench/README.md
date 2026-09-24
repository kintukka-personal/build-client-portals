# ONYX Data Workbench

A proof of concept for the reports side of the ONYX hub: take a raw GymMaster
export and turn it into a report the manager can act on, without anyone
reshaping the spreadsheet by hand first.

Published as a standalone page. Open `onyx-data-workbench.html` directly in a
browser — it needs no build step and no server.

## What it does

Five stages, each one working rather than illustrated:

1. **Source** — drop an `.xlsx` or `.csv` in, or load the embedded ONYX sample.
   Parsing happens in the page via SheetJS. Nothing is uploaded.
2. **Profile** — every column read cell by cell: fill rate, the real type of
   each value, distinct count, and whether the column is a vocabulary you can
   pivot on or prose you have to interpret. Type faults are flagged with the
   offending row numbers.
3. **Map** — each column is given a role (person, event date, channel, source,
   staff, outcome). Roles are guessed from the header and the column's shape,
   and corrected once. This stage also carries the conversion definition, which
   is the decision that moves the headline number most.
4. **Free text** — an editable keyword vocabulary that tags rows from their
   notes. A keyword prefixed with `-` excludes. Coverage and the unmatched rows
   are both shown, because the rules that miss matter as much as the rules that
   hit.
5. **Insights** — conversion by channel, source and staff, tag lift against the
   baseline, and written findings generated from the computed numbers.

Rates on groups below 8 rows are withheld rather than printed, so the report
never manufactures precision it does not have.

## What the August 2026 sample showed

- A tour converts at **61.9%**. A walk-in that does not become a booked tour
  converts at **7.7%**, which is no better than someone who just paid for a
  casual visit (**10.7%**). It is not the visit that converts, it is the tour.
- `Active Memberships = 1` is not a conversion count. It is a snapshot of who
  was a member when the file was exported. Seven arrived on Fitness Passport
  through an employer, two were win-backs with a prior membership that had
  ended, and one row is a cancellation inside the reporting month scored as a
  lead that did not convert.
- Every tour that converted carries nothing in the cleared note but
  *Autocompleted from prospect becoming a member*. The qualification answers
  for the people who actually joined are not in the export.
- The tour script is pasted into the note and left unanswered on most tours.
- Two of the ninety dates are stored as text, which no filter or date
  calculation will pick up and nothing warns you about.

## Data and privacy

The embedded sample keeps ONYX's **real structured columns** — dates, task
types, sources, staff, ages, membership products — so every figure in the demo
is a real figure. Direct identifiers were already replaced with sequential
tokens (`ID-00001`, `NAME-0001`, `STAFF-001`) before the file reached us.

The three free-text columns are **entirely synthetic**. Real first names,
surnames and a health reference survived the column-level scrub in the source
file, which is exactly the point the profiler makes about free text. Rather
than redact them, `tools/make-demo-data.py` derives each row's tags from the
real note and writes fresh prose carrying the same tags, so the tag
distribution stays true while no member is identifiable.

The source `.xlsx` files are deliberately not in this repository. The generator
expects them at a path you supply; it is kept here to document how the sample
was produced, not to be re-run from a clean checkout.
