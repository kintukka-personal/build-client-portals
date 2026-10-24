# {{name}} — intake

Phase 0 of the client-portal workflow ([`docs/ROADMAP.md`](../../docs/ROADMAP.md),
[`docs/playbook/00-intake.md`](../../docs/playbook/00-intake.md)). Written by
`tools/new-client.js` on {{today}}. Answer every line; where a question does not apply,
write `n/a` and why. The Phase 0 gate fails while any TODO is left.

## 1. The client

| | |
| --- | --- |
| Short name, styled as they style it | {{name}} |
| Trading name | {{tradingName}} |
| Legal entity, for the footer | TODO |
| Slug (permanent: file names and subdomain) | `{{slug}}` |
| Website | {{website}} |
| Sector | TODO |
| Locations, with status (open, opening, pre-registration) | TODO |
| Sub-brands that need their own lockup | TODO |

## 2. People

| Role | Name | Contact |
| --- | --- | --- |
| Main contact, day to day | TODO | TODO |
| Signs off the brand and the portal | TODO | TODO |
| Supplies content (SOPs, FAQs, photos) | TODO | TODO |
| Owns the domain's DNS | TODO | TODO |
| Maintains the portal after handover (us, or named) | TODO | TODO |

## 3. Audiences and their words

Which doors does the welcome screen show? The default is all four.

| Audience | In? | Their name for it | Key |
| --- | --- | --- | --- |
| Customers (no key, first door) | TODO | TODO: members, patients, guests, clients… | none |
| Employee | TODO | TODO | `employee` until real keys are issued |
| Manager | TODO | TODO | `manager` |
| Owner | TODO | TODO | `owner` |

- What the client calls their customers, staff and services — the `vocabulary.always` list: TODO
- Words they never use — `vocabulary.never`: TODO

## 4. Modules

| Module | On? | Notes |
| --- | --- | --- |
| Learning paths, Learn, Support, Me | on | always |
| Reports (owner) | TODO | |
| Import data and Insights | TODO | which exports exist — see section 7 |
| Process library (owner) | TODO | |
| Blog / What's new | TODO | who writes posts |
| Look around (floorplan) | TODO | how many sites; is there an equipment or room list |
| Customer area | TODO | |

## 5. Content they already have

The fastest content is the client's own, corrected. List what exists, and where.

- Standard operating procedures: TODO
- Onboarding notes or a first-week plan: TODO
- Checklists (opening, closing, cleaning, safety): TODO
- Training videos: TODO
- The questions the front desk gets asked most: TODO
- Photos of the real space, and rights to staff portraits: TODO

## 6. Systems

Every system a new starter touches is a candidate simulation and a candidate deep link.

| System | What for | Who can give us access or a recording |
| --- | --- | --- |
| Booking or member system | TODO | TODO |
| Point of sale or payments | TODO | TODO |
| Rostering | TODO | TODO |
| The customer app | TODO | TODO |

- The three to five system tasks a new starter does most (these become the first simulations): TODO

## 7. Data

- Exports the owner already pulls, and from which system: TODO
- One real month of each, with direct identifiers tokenised before it is sent: TODO (date requested)
- Definitions that move the headline, agreed with the owner (for example: what counts as a conversion): TODO

## 8. Hosting

- Subdomain: `{{slug}}.<our-domain>` for the showcase; their own host later (`learn.<their-domain>`)? TODO
- Single file only, hosted and installable, or both: TODO
- Any mail on the domain whose MX records must be carried across before DNS moves: TODO
- Does anything need to sit behind a real login (Cloudflare Access) rather than a key: TODO

## 9. Dates

| Milestone | Date |
| --- | --- |
| Kickoff | TODO |
| Brand sheet to the client | TODO |
| Showcase | TODO |
| Launch to staff | TODO |

## 10. Asks sent

Copy every outstanding ask into `meta.confirmWithClient` in `{{slug}}-brand.json`, so the
brand sheet and the handover pack print the same list.

| Ask | Sent | Chased | Received |
| --- | --- | --- | --- |
| Master logo files (SVG or AI) | TODO | | |
| Brand guideline, if one exists | TODO | | |
| Photo library and usage rights | TODO | | |
| SOPs, checklists and FAQs | TODO | | |
| Access to, or recordings of, the systems in section 6 | TODO | | |
| One month of each export in section 7 | TODO | | |
| Legal entity name | TODO | | |
| DNS owner and contact | TODO | | |
