# Playbook 00 — Intake and kickoff

Everything a client supplies sits on the critical path of a later phase: master logos
for the brand sheet, SOPs for the content, system access for the simulations, an export
for the reports, DNS for the site. So all of it is asked for on day one, before any of it
is needed. ONYX had no intake, and a month later five of its asks are still open — that
is the cost this playbook exists to avoid. The roadmap is [`docs/ROADMAP.md`](../ROADMAP.md).

## What you produce

```
clients/<slug>/<slug>-intake.md       the answers; the Phase 0 gate fails while any TODO is left
clients/<slug>/brand/…                the scaffold, from tools/new-client.js
clients/<slug>/portal/…
```

`clients/onyx/onyx-intake.md` is the worked example, reconstructed from the repository.

## Steps

1. **Choose the slug.** Short, lowercase, letters, digits and hyphens. It goes into every
   file name and into the subdomain, and changing it later means renaming every file and
   moving every installed copy, so choose once. The client's own short name is usually
   right: `onyx`, not `onyx-gym-fitness`.
2. **Scaffold.**

   ```bash
   node tools/new-client.js <slug> --name "<Short name>" --trading "<Trading name>" --website https://…
   ```

   It refuses a slug that exists, writes the intake, the brand file, stand-in logo and
   mark, the portal config and the content README, and builds. Open
   `clients/<slug>/portal/<slug>-portal.html`: a grey-box portal in the client's name, with
   every door and every module working.
3. **Send the asks the same day.** Section 10 of the intake is the list. Send it as one
   message with a date to chase:
   - master logo files (SVG or AI) and any brand guideline
   - the photo library, and the rights to use staff portraits
   - SOPs, onboarding notes, checklists, and the questions the desk gets asked
   - the names of the systems a new starter touches, and access or screen recordings
   - one real month of each export the owner pulls, direct identifiers tokenised first
   - the legal entity name for the footer
   - who owns the domain's DNS, and whether anything receives mail on it
4. **Run the kickoff against the intake.** Forty-five minutes, sections 1 to 9 in order.
   The answers that change the build most:
   - **Their word for their customers.** Members, patients, guests, clients. It becomes
     the first door's label, `vocabulary.always`, and every piece of copy.
   - **Which doors.** The default is all four: the customer door with no key, then
     employee, manager and owner behind keys. Drop one rather than leave it empty.
   - **Which modules.** Reports, import, process library, blog, floorplan, customer area.
     Each is a block in the config; off means the block is removed and its tab goes.
   - **Single file, hosted, or both.** Both is the default. The single file is for email
     and a USB stick; the hosted build is the one that installs.
   - **Dates.** When the brand sheet goes to them, when the showcase is, when staff start
     using it.
5. **Record the open asks** in `meta.confirmWithClient` in the brand file. The brand sheet
   prints them and the handover pack repeats them, so there is one list, not three.
6. **Check it.** `node tools/check-client.js <slug>` shows Phase 0 complete once every
   intake line is answered. Where a question does not apply, write `n/a` and why — the
   gate counts a TODO, not a blank, and a reason is worth more than a blank later.

## What the answers decide

| Answer | Decides | Phase |
| --- | --- | --- |
| Logo files and guideline exist | Half a day of capture instead of a full one | P1 |
| SOPs exist | Content is correcting theirs, not writing ours | P3 |
| Their systems and the top tasks a new starter does | The first simulations | P4 |
| The exports they pull | Which converters are `ready` and which `planned` | P5 |
| Who owns DNS | A one-click custom domain, or a CNAME request and a wait | P6 |
| Who signs off | Who the brand sheet and the handover pack go to | P1, P8 |

## Time

Two hours of ours: the scaffold, the asks message, the kickoff, and writing it up.
