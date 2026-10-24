# ONYX — intake

Phase 0 of the client-portal workflow ([`docs/ROADMAP.md`](../../docs/ROADMAP.md),
[`docs/playbook/00-intake.md`](../../docs/playbook/00-intake.md)).

**Reconstructed on 23 October 2026 from the repository.** ONYX had no intake at the time:
the capture started from the public site on 17 September 2026 and the questions were
answered as the build reached them. This is the worked example of the file every client
now gets on day one. Where the repository does not record an answer, the line says so
rather than guessing.

## 1. The client

| | |
| --- | --- |
| Short name, styled as they style it | ONYX — always capitals |
| Trading name | ONYX Gym & Fitness |
| Legal entity, for the footer | Not yet supplied — open ask |
| Slug (permanent: file names and subdomain) | `onyx` |
| Website | https://onyxgym.com.au |
| Sector | 24/7 gym: group fitness, personal training, contrast therapy |
| Locations, with status (open, opening, pre-registration) | Alexandria, 20 Bowden Street, Alexandria NSW — open, the flagship. Artarmon — pre-registration |
| Sub-brands that need their own lockup | RECOVER by ONYX — infrared sauna and ice bath, Together and Solo rooms |

## 2. People

| Role | Name | Contact |
| --- | --- | --- |
| Main contact, day to day | Not recorded in the repository | — |
| Signs off the brand and the portal | Not recorded; the public founders are Katie King and Joey | — |
| Supplies content (SOPs, FAQs, photos) | Not recorded; nothing received yet, so all content is demo | — |
| Owns the domain's DNS | Us: the showcase sits on a subdomain of our own Cloudflare zone | — |
| Maintains the portal after handover (us, or named) | Us | — |

## 3. Audiences and their words

| Audience | In? | Their name for it | Key |
| --- | --- | --- | --- |
| Customers (no key, first door) | Yes | Members | none |
| Employee | Yes | Employee | `employee` (demo) |
| Manager | Yes | Manager | `manager` (demo) |
| Owner | Yes | Owner | `owner` (demo) |

- Always: ONYX, RECOVER by ONYX, members, coaches, community, 24/7, group fitness classes, personal training
- Never: Onyx, Recover, customers, trainers, users, clients

## 4. Modules

| Module | On? | Notes |
| --- | --- | --- |
| Learning paths, Learn, Support, Me | on | Week 1 at the front desk (18 items), Running the floor (11), Owner's desk (10) |
| Reports (owner) | on | Demo figures, badged |
| Import data and Insights | on | GymMaster task report ready; members, bookings and takings planned |
| Process library (owner) | on | 29 processes: 22 documented, 4 drafts, 3 gaps |
| Blog / What's new | on | The owner writes; members read |
| Look around (floorplan) | on | One site, Alexandria: 10 zones, 51 pieces of kit, demo layout |
| Customer area | on | Members: Look around, Helpful tips, News, their own Support |

## 5. Content they already have

- Standard operating procedures: none received; every guide and checklist is demo written from the public site
- Onboarding notes or a first-week plan: none received
- Checklists (opening, closing, cleaning, safety): none received; fifteen demo checklists written
- Training videos: none received; five video items have no file
- The questions the front desk gets asked most: written as demo FAQ, staff and member
- Photos of the real space, and rights to staff portraits: one photo, the member lockers (locker 19), used as the first interactive photo; portrait rights an open ask

## 6. Systems

| System | What for | Who can give us access or a recording |
| --- | --- | --- |
| GymMaster | Members, bookings, classes, RECOVER rooms, prospect tasks, the member app | Not recorded |
| Point of sale or payments | Not recorded | — |
| Rostering | Not recorded | — |
| The customer app | GymMaster's member app: class and RECOVER bookings, waitlists | — |

- The system tasks that became the first simulations, all on the placeholder: check a member in, sell a membership, book a RECOVER room, Fitness Passport sign-up, a freeze and refund (manager), booking a class and a RECOVER room (member)

## 7. Data

- Exports the owner already pulls: GymMaster task report (prospect tours and casual visits); member, bookings and takings exports named but not yet received
- One real month: August 2026 task report, 90 rows, identifiers already tokenised before it reached us; the source files are deliberately not in the repository
- Definitions agreed: a conversion is the export's own Active Memberships flag (27), with its composition reported underneath (20 sold, 7 Fitness Passport, 2 win-backs); every rate shown, groups under eight rows marked low

## 8. Hosting

- Subdomain: `onyx.<our-domain>` for the showcase; ONYX's own host later
- Single file only, hosted and installable, or both: both
- MX records: not recorded; the hosting playbook now says to check them before moving a zone
- Real login: no — the member area is meant to have no password, so Cloudflare Access stays off for the showcase

## 9. Dates

| Milestone | Date |
| --- | --- |
| Kickoff | 17 September 2026, the first capture |
| Brand sheet to the client | Not recorded |
| Showcase | Not recorded |
| Launch to staff | Not set |

## 10. Asks sent

The same five open items as `meta.confirmWithClient` in `brand/onyx-brand.json`.

| Ask | Sent | Chased | Received |
| --- | --- | --- | --- |
| Master logo files for the lockup, the gem mark and RECOVER by ONYX | Listed on the brand sheet | — | No |
| Brand guideline, if one exists | Listed on the brand sheet | — | No |
| Photo library and usage rights for staff portraits | Listed on the brand sheet | — | No |
| Legal entity name for the footer | Listed on the brand sheet | — | No |
| Which system sits behind Member Login | Listed on the brand sheet | — | Answered in the build: GymMaster |
