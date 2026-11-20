# Impeccable critique: the Strata Hub launch page (20 November 2026)

Method: dual-agent (A: design review in its own sub-agent · B: detector and browser evidence in its own sub-agent). Neither saw the other's output. Target: `web/index.html`, built and served locally, looked at 375, 768 and 1280 px with the 3D hub on. Mode: Persuade.

## Design health score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 3 | Callouts follow the active module; no active-section state in the nav, no progress through the four chapters |
| 2 | Match with the real world | 3 | Plain copy; "Matter and Zigbee" unexplained |
| 3 | User control and freedom | 3 | Back to top, Escape closes the menu; the menu doesn't close on an outside tap |
| 4 | Consistency and standards | 2 | Six "Register interest" buttons in three treatments; two orange buttons share most screens |
| 5 | Error prevention | 3 | Good form guards; bundle buttons drop the bundle choice |
| 6 | Recognition rather than recall | 2 | Bundle cards list module names only; at 768 px they stack full width and can't be compared |
| 7 | Flexibility and efficiency | n/a | One linear persuasion path |
| 8 | Aesthetic and minimalist design | 3 | Disciplined; the 92% header goes muddy grey over the dark section |
| 9 | Error recovery | 3 | Clear messages with icon and focus; a stale error stays while you type until the next click |
| 10 | Help and documentation | n/a | The FAQ does this job |
| **Total** | | **22/32** | **Good (69%), at the edge of Acceptable** |

## Design specificity

**Review (A):** split. The dark look-inside stretch is authored for this product: the exploded plates, the signal-glow leader to a name and a mono spec, spec tables on hairlines, the one orange line on the energy plate. The light sections are category-standard: a three-card pricing grid with a pill, a plain accordion, a grey form panel. The hero drawing (sharp-cornered flat isometric) doesn't read as the same object as the rounded 3D plates.

**Detector (B):** one warning, `cramped-padding` on `<section id="inside">` (`web/styles/site.css:251` sets only block padding). Likely a false positive: its children carry their own side padding, and the top padding is set. No DESIGN.md choice (palette, single accent, fonts, pill buttons) was flagged. Console clean at 375 and 1280 px; all five font faces loaded; no sideways scroll.

**Overlay:** not available. The page's Content Security Policy (`script-src 'self'`) blocked the detector overlay script, as it should; nothing was injected.

## What works

1. **The chapters at 1280 px:** the sticky hub on the right two thirds, text on the left, mono specs on hairlines, four finishes clearly told apart. This is DESIGN.md's "one memorable thing", delivered.
2. **Colour and type discipline:** orange only on actions and callouts, no gradients or glass, Archivo 800 kept for big moments, mono only for data.
3. **Honest copy and solid accessibility basics:** "One email at launch. Nothing else.", "Recommended" not "Most popular"; skip link, labels above fields, 44 px targets, logical tab order, focus moves to the field on error.

## Priority issues

1. **[P1] Two primary buttons on the first screen (phase 2a N3).** Header and hero both orange at every width; the header button also pairs with the Home card and the form submit lower down. Breaks DESIGN 5 "one primary button per screen". Fix: give the header button the existing outline (`.button.secondary`) treatment; hero, Home card and form submit stay orange. Where: `site.css .site-header .button`. Command: polish.
2. **[P1] A hard cut out of the climax, plus a seam.** The dark section ends on a hard edge, and the band's border-bottom leaves a hairline seam at the dark-to-light edge. DESIGN 7's "background turns light again" isn't built. Fix: in the scrubbed timeline after the reassembly, fade a full-bleed stone-50 layer in by opacity; drop the band's border near the section end. Where: `scene/start.ts`, `site.css .inside.has-3d .still`. Command: animate.
3. **[P2] The hero drawing and the 3D model look like different objects.** SPEC 9 says the stills match the model. Fix: redraw both SVG stills with rounded plates, thinner plates and a base in the model's proportions, traced from a capture of the scene. Where: `web/assets/stills/*.svg`. Command: polish.
4. **[P2] Bundles don't support comparison.** The Recommended tag pushes the Home card's rows about 41 px down; cards list module names only and repeat "Hub: included"; at 768 px each card is full width and a screen tall. Fix: put the tag on the card's top border so rows and prices line up; drop the "Hub: included" row; cap cards at about 32rem below 1024 px. Where: `site.css .tag, .card, .cards`, `index.html`. Command: layout.
5. **[P2] The header goes muddy over the dark section.** Stone-50 at 92% over stone-900 turns grey with headings ghosting through. Fix: an opaque stone-50 header while `#inside` is under it, and record that in DESIGN 5. Where: `site.css .site-header`, `main.ts`. Command: polish.

## Persona red flags

- **Jordan (first-timer):** the only scroll cue is the small grey "Scroll to look inside" below the fold; at 768 px the hero leaves a large empty area. "Matter and Zigbee" unexplained. Bundle cards name modules without saying what they do.
- **Riley (stress tester):** "Register interest" on Complete forgets the bundle. A valid email typed after an error keeps the red message until the next click. The invalid field with focus shows a double red ring. Rotating a tablet across 1023 px keeps the old chapter trigger line.
- **Casey (mobile):** 6,431 px tall at 375 px; in the chapters about 470 px is left for text, specs fall below the fold and text slices under the band; the only persistent call to action is top right, out of thumb reach; the recommended Home card is second.

## Minor observations

- The reassemble line is left-aligned; DESIGN 8 says centred.
- At 1280 px the form and FAQ are left-aligned with more than half the width empty.
- The Lights callout leader is lost against the top plate's edge.
- The active-plate highlight is very subtle, barely visible on Security at 375 px.
- The open phone menu has no backdrop and covers the hero headline.
- The first `h2` ("Scroll to look inside") uses DM Sans while the others use Archivo (styled as a lead-in in phase 2a, kept as approved copy).

## Open design calls (from the review)

- **N2:** raise chapter names to about `clamp(48px, 6vw, 88px)`; keep the bundles title at Archivo 700 and amend DESIGN 3.
- **N6:** build the hero headline motion with `translateY` inside `overflow: hidden` wrappers, never from opacity 0, so LCP isn't delayed.

## Questions to consider

1. If the exploded 3D hub is the memorable thing, should the hero show a render of the actual model rather than a drawing?
2. Should the FAQ move before the form, so the last thing a visitor sees is the action? (SPEC A9 fixes the current order.)
3. Should the bundle buttons say "Register for Home" and carry that choice into the form?
