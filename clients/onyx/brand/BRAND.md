# ONYX Gym & Fitness — brand portfolio

**Status:** captured from the public site, awaiting client confirmation · **Version:** 1.0.0 · **Captured:** 17 September 2026

This folder is the source of truth for how ONYX looks, sounds and behaves inside the
learning portal and every SimStudio simulation built for it.

| File | What it is |
| --- | --- |
| `brand.json` | The machine-readable truth. Every colour, type step, shape value, component rule and the SimStudio kit. Edit this, nothing else. |
| `tokens.css` | Generated from `brand.json` by `node tools/build-tokens.js onyx`. The portal imports it. Never hand-edited. |
| `brand-sheet.html` | The visual portfolio. Open it in a browser. Self-contained, dark, phone-first. Send it to the client for sign-off. |
| `assets/onyx-logo.svg`, `assets/onyx-mark.svg`, `assets/recover-logo.svg` | Vector stand-ins drawn from the site. The client's master files replace them at the same paths. |
| `assets/reference/` | Cropped captures of the logo, the sub-brand lockup and each component, plus a contact sheet of the sixteen screens the portfolio was built from. |

---

## 1. Snapshot

- **Trading name:** ONYX Gym & Fitness. Always ONYX in capitals. The sub-brand is RECOVER by ONYX, always RECOVER in capitals.
- **Positioning:** *One of Sydney's top rated 24/7 gyms.* *Not only a gym, but also a community.*
- **Promise:** *We believe in creating an environment where you feel comfortable to be yourself, regardless of your training experience or goals.*
- **Locations:** Alexandria, 20 Bowden Street, Alexandria NSW, open, the flagship. Artarmon, second site, in pre-registration.
- **Offering:** 24/7 gym access; unlimited group fitness classes; personal training from coaches with bodybuilding and powerlifting backgrounds; RECOVER by ONYX infrared sauna and ice bath contrast therapy in Together and Solo rooms; Evolt360 body scan; Fitness Passport accepted.
- **Founders:** Katie King and Joey, co-founders. **Team shown publicly:** Mick Abboud, Head of Excellence.
- **Equipment partners shown on site:** Fitness Passport, Life Fitness, Hammer Strength (Official Training Center), Panatta, Rogue, Watson Gym Equipment.
- **Web:** onyxgym.com.au, with a Member Login tab pinned to every page.

A pricing snapshot as observed on the day sits in `brand.json` under `identity.pricingSnapshot`. It is demo content for the portal, not a price list.

## 2. Voice

Confident, warm, community-first, plain-spoken, direct.

- Speak to one person: *you*, *your goals*, *whenever it suits you*.
- Benefit first, detail second.
- Sentence case for headings. UPPERCASE for navigation, buttons, tabs and section labels only.
- Every heading carries one green-emphasised phrase, and it is the phrase the sentence is about: *Meet ONYX **Coaches***, *Biggest **24/7 Gym** in Alexandria*, *Not only a gym, but also a **community.***
- Australian English.
- Lists use the outlined circle-tick. Never plain bullets.
- One exclamation mark per page, at most.

| Always | Never |
| --- | --- |
| ONYX, RECOVER by ONYX | Onyx, Recover |
| members, coaches, community | customers, trainers, users, clients |
| 24/7, group fitness classes, personal training | |

## 3. Logo

**Primary lockup.** A green outlined gem mark on the left: a six-point irregular stone with two facet lines that converge on the bottom vertex and a third short line tapering from the left vertex. ONYX in condensed grey block capitals, the O chamfered at its top-left corner to echo the facet. *— GYM & FITNESS —* in small green capitals beneath the wordmark, flanked by short dashes.

**Mark alone.** Favicon and app icon, drawn in green on a black square. A white watermark at 35 to 40% opacity in the bottom-right of bio panels. Grey when it sits in a row of partner logos.

**RECOVER by ONYX.** *RECOVER.* in outlined italic condensed green capitals with a full stop, *by* in a white script, then the ONYX lockup in white underneath.

Rules:

- Clear space equals the height of the gem mark on every side. Minimum lockup width 120px.
- On black, or on photography under the standard 60 to 70% black dim. The site never shows the lockup on a light surface. If a light surface is unavoidable, use the mark alone in black.
- Never recoloured, never on a green or amber fill, never stretched.
- The vectors in `assets/` are stand-ins drawn from the site captures. They are accurate in geometry and colour and they are replaced by the client's master files at the same paths, which changes nothing else.

## 4. Colour

Three colours do the work. Green is the brand, amber is the only colour that asks for a click, black is the room they stand in. Values are pixel-sampled from the live site and each returned a single dominant value.

| Token | Hex | RGB | Role |
| --- | --- | --- | --- |
| ONYX Black | `#000000` | 0 0 0 | Page canvas, card fills, menu overlay. The brand is dark-native. |
| ONYX Green | `#8DCA76` | 141 202 118 | Primary. Headline emphasis, the mark, dividers, frames, ticks, links, the Member Login tab, pricing labels, bio panels. |
| Action Amber | `#FFBA00` | 255 186 0 | Every call to action. Letter-spaced section labels inside the menu. The MOST POPULAR ribbon edges. |
| White | `#FFFFFF` | 255 255 255 | Headings, body copy, menu items, form fills. |
| Wordmark Grey | `#ACACAC` | 172 172 172 | The ONYX wordmark, partner logos, outlined section numerals. |

Derived for the portal, not on the marketing site:

| Token | Hex | Role |
| --- | --- | --- |
| Ink | `#0A0A0A` | Text on green or amber fills. |
| Surface | `#111111` | Portal cards and panels on the black canvas. |
| Surface raised | `#1A1A1A` | Hover states, nested panels, dark inputs. |
| Green deep | `#5E9A49` | Pressed green controls. |
| Green tint | `#8DCA76` at 15% | Selected rows, active navigation. |
| Amber deep | `#D99E00` | Pressed amber buttons. |
| Error red | `#E5484D` | Validation and wrong attempts. The site has no red; this one reads on black beside the green. |
| Muted text | `#8A8A8A` | Secondary text and captions. The floor for legibility. |
| Hairline | `#2A2A2A` | Quiet structural dividers. Green is for feature dividers. |

### Contrast

Computed by `tools/build-tokens.js` and live on the brand sheet.

| Foreground on background | Ratio | Grade | Used for |
| --- | --- | --- | --- |
| Green on black | 10.84:1 | AAA | Links, ticks, emphasis |
| White on black | 21.00:1 | AAA | Headings and body |
| Amber on black | 12.28:1 | AAA | Labels, button faces |
| Grey on black | 9.25:1 | AAA | Wordmark, partner logos |
| Muted on black | 6.08:1 | AA | Secondary text |
| **White on green** | **1.94:1** | **Fail** | Site: Member Login tab, pricing label, bio panel |
| Ink on green | 10.22:1 | AAA | Portal: text on green |
| **White on amber** | **1.71:1** | **Fail** | Site: button text |
| Ink on amber | 11.57:1 | AAA | Portal: button text |
| Error red on black | 5.37:1 | AA | Validation text |
| White on error red | 3.91:1 | AA large | Text on an error fill, 24px and up |

**The one departure from the site.** The marketing site sets white text on green tabs and amber buttons; both fail AA at every size. Inside the portal, text on a green or amber fill is set in Ink. Shapes, colours and case stay exactly as the site has them. Only the ink changes. Large display headings on a green bio panel are the one place white on green survives, and only at 32px bold and above.

## 5. Typography

**Poppins**, from Google Fonts under the SIL Open Font License. Four weights: Regular 400 for reading, Medium 500 for links, SemiBold 600 for headings and buttons, Bold 700 for prices. The portal self-hosts the woff2 files so it works offline.

| Step | Size | Weight | Line height | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
| Display | 44px | 600 | 1.1 | -0.01em | Hero headings |
| H1 | 32px | 600 | 1.15 | -0.01em | Page titles |
| H2 | 26px | 600 | 1.2 | 0 | Section headings, pricing labels |
| H3 | 20px | 600 | 1.3 | 0 | Card titles, names |
| Price | 56px | 700 | 1 | -0.02em | The green figure on a pricing card; stat tiles |
| Body | 17px | 400 | 1.6 | 0 | Paragraphs |
| Body small | 15px | 400 | 1.55 | 0 | Captions, meta, dense lists |
| Label | 13px | 600 | 1.2 | 0.28em, caps | Section labels, in amber |
| Nav | 18px | 600 | 1.2 | 0.02em, caps | Menu items |
| Button | 16px | 600 | 1 | 0.04em, caps | BOOK NOW, JOIN TODAY |
| Tab | 15px | 600 | 1 | 0.06em, caps | The vertical MEMBER LOGIN tab |

Rules: the marketing site centres its text; the portal left-aligns body copy and lists and keeps centred type for hero blocks and empty states. Headings never exceed two lines on a phone. Outlined display numerals (03, 04) are Poppins Bold at 120px and up, a 2px grey stroke with no fill, sitting behind the corner of a photo.

## 6. Shape

Square-cornered throughout. Buttons, cards, tabs, inputs and frames sit at 0 radius. The only circles are avatars, the circle-tick icon and the play button. No drop shadows; depth comes from black-on-black tone steps and green lines. Border weights: 1px hairline, 2px frame, 3px emphasis. Hero photography sits under a 60 to 70% black overlay.

## 7. Components

Rebuilt from the tokens on the brand sheet. Specifications are in `brand.json` under `components`.

- **Primary button.** Amber fill, uppercase SemiBold, 18px 44px padding, 0 radius. Full-width inside the menu overlay, fixed-width and centred on pages. Portal text is Ink.
- **Secondary button.** Derived: transparent with a 2px green border and green text.
- **Text link.** Green, no underline inline. *LEARN MORE* in uppercase with a thin trailing arrow.
- **Side tab.** *MEMBER LOGIN*, green fill, rotated 90°, fixed to the right edge and vertically centred on every page.
- **Pricing card.** 2px green frame with a gap at the top where the green label tab overlaps the frame edge. 56px bold green price. 1px green rule. Circle-tick list. Amber button. *MOST POPULAR*: a black band with amber edges and outlined white type, tilted about 7°, crossing the top of the card.
- **Team card.** Circular portrait with a 1px green ring, name in H3, role in body, *LEARN MORE →* in green.
- **Bio panel.** Solid green with the gem watermark bottom-right, H2 heading, 1px divider at 40% opacity, circle-tick list. Portal text is Ink.
- **Menu overlay.** Full-screen black. Thick green X. Amber letter-spaced section label with a back chevron. White uppercase rows with right chevrons. Two stacked full-width amber CTAs: *JOIN ALEXANDRIA*, *REGISTER ARTARMON*.
- **Icons.** Thick 3-bar hamburger and X in green. 2px white chevrons. 1.5px outlined circle-tick. White outlined play button.
- **Inputs.** White fill with a 1px green border on the site; in the portal, Surface raised fill with the same border and white text. 56px tall, 0 radius. Amber focus ring.
- **Slide indicators.** Short horizontal bars, green when active.

## 8. Imagery

Real coaches and members photographed in the gym. Black ONYX tees. Dark interiors with green structural accents on pillars and walls. Portraits: arms crossed, straight to camera, grey brick with a diagonal green stripe behind; cropped to a circle for cards and square for bios. Heroes are dimmed 60 to 70%. Never bright, never washed out, never stock.

In the portal, onboarding content uses the client's own photos of the real space: reception, gym floor, RECOVER rooms, class studio. A simulation sits on a plain black canvas with no photo behind it.

## 9. Portal translation

- **Theme:** dark. Canvas black, cards Surface with a hairline border, upgrading to a 2px green frame when active or selected.
- **Audience colours:** Employee green, Manager amber, Owner white. The colour marks the area, never the body text.
- **Progress:** amber, the same colour as the button that continues it.
- **Navigation:** mirrors the site. Top bar with the lockup and a thick hamburger, full-screen black overlay menu, bottom tab bar on phones.
- **Favicon and app icon:** the green mark on a black square.
- **Text on green or amber fills:** Ink.

## 10. SimStudio brand kit

Enter these in *Settings → Brand kits* and save the kit as **ONYX**. Then *Export* the kit and keep the `.simbrand.json` beside this file.

| Decision | Value | Paints |
| --- | --- | --- |
| Highlight | `#8DCA76` | The click target, the arrow, the typed field |
| Box | `#FFBA00` | A region to read, drawn apart from the target |
| Player accent | `#FFBA00` | Next and the progress bar |
| Callout paper | `#000000` | The card the prompt sits on |
| Callout ink | `#FFFFFF` | The words on it |
| Wrong attempt | `#E5484D` | A miss and the note that follows it |

Shape and strength: screen dim 60%, roundness 0, border weight 3px. Typeface Poppins.

## 11. Provenance and open items

**Sources.** onyxgym.com.au, sixteen mobile captures on 17 September 2026 covering home, memberships and pricing, RECOVER, meet the team, coaches, founders and contact. Colours pixel-sampled from those captures. Type identified as Poppins from letterform shapes.

**To confirm with ONYX before the portal ships:**

1. Master logo files for the lockup, the mark and RECOVER by ONYX.
2. Any existing brand guideline document. Where it disagrees with this portfolio, the guideline wins and `brand.json` is updated.
3. Photo library and usage rights for staff portraits inside the portal.
4. Legal entity name for the portal footer.
5. Which gym management system sits behind Member Login, so the portal can deep-link to it.

## Changelog

- **1.0.0 · 2026-09-17** · First capture from the public site. Palette, type, logo geometry, components, voice, portal rules and SimStudio kit.
