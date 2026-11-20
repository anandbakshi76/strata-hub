# Strata Hub: design system

Status: Approved by Anand Bakshi on 19 November 2026, with the design sample in `design/sample/` (QG2)
Built from: `docs/INTENT.md` (Design intent), `docs/SPEC.md` (approved), `design/references/` (5 shots) and UI/UX Pro Max searches (landing, colour, typography, GSAP, Three.js).

This is the single source for how the page looks and moves. `docs/BRAND.md` summarises it, and the `brand` skill applies it. If a rule here conflicts with the spec, the spec wins: raise it with the person.

## 1. Direction

**Calm, precise, premium hardware.** The product carries the colour and the detail; the page around it stays quiet.

- **Pattern:** scroll-triggered storytelling (UI/UX Pro Max, landing). An intro hook, then one chapter per module, then the reassembly as the climax, then bundles and the form.
- **One memorable thing:** the hub coming apart along one axis as you scroll, with thin callouts naming each module (refs 02 and 04). Everything else is disciplined and plain.
- **Chapter colour:** the page is light, and the "look inside" chapters turn dark, like opening the product. It turns light again for the bundles. This is the only big colour change on the page.

What UI/UX Pro Max suggested that we did **not** take: its one-shot design system (a SaaS operations pattern, slate with status green, then Rubik/Nunito and "launch blue"). They didn't match the intent or the references. See PILOT-NOTES gap 8.

## 2. Colour

Tokens are CSS custom properties on `:root`. Components use tokens, never raw hex.

| Token | Hex | Use | Contrast checked |
|-------|-----|-----|------------------|
| `--stone-50` | #FAFAF9 | Page background (light chapters) | |
| `--stone-100` | #F5F5F4 | Cards, FAQ rows on light | |
| `--stone-300` | #D6D3D1 | Hairlines and borders on light (decorative only) | |
| `--stone-600` | #57534E | Secondary text on light | 7.30:1 on stone-50 |
| `--stone-900` | #1C1917 | Main text on light; background of dark chapters | 16.74:1 on stone-50 |
| `--stone-200` | #E7E5E4 | Main text on dark | 13.93:1 on stone-900 |
| `--stone-400` | #A8A29E | Secondary text on dark | 6.93:1 on stone-900 |
| `--signal` | #C2410C | Buttons and links on light (white text on it) | white on it 5.18:1; it on stone-50 4.96:1 |
| `--signal-dark` | #9A3412 | Button hover and pressed on light | 7.00:1 on stone-50 |
| `--signal-glow` | #FB923C | Callout lines, dots and focus ring on dark | 7.73:1 on stone-900 |
| `--error` | #B91C1C | Error text and field border on light | 6.19:1 on stone-50 |

Rules:

- **One accent.** `--signal` is only for actions (buttons, links, the active section link) and, as `--signal-glow`, for callouts on dark. Never for decoration or large areas.
- **No gradients as decoration** and no glass effects. Shadows only under the 3D model, soft and grounded.
- **Focus ring:** 2 px solid, `--signal` on light and `--signal-glow` on dark, with a 2 px offset. Never removed.
- **Fixed scheme.** The page follows its own chapters (light, dark, light). There is no theme toggle and it does not follow the system dark mode. (Assumed: confirm.)

## 3. Type

Both families are open source (SIL Open Font License) and **self-hosted** as WOFF2 (spec rule 6). Load only the weights listed.

| Role | Family | Weights | Size (phone → desktop) | Line height | Tracking |
|------|--------|---------|------------------------|-------------|----------|
| Display (hero headline, chapter numbers) | Archivo | 800 | 48 → 112 px (`clamp`) | 0.95 | -0.03em |
| Heading (section and chapter titles) | Archivo | 700 | 28 → 48 px | 1.1 | -0.02em |
| Body | DM Sans | 400, 500 | 17 → 18 px | 1.55 | 0 |
| Small (labels, privacy note, footer) | DM Sans | 500 | 14 px | 1.45 | 0.01em |
| Specs and readings | IBM Plex Mono | 500 | 14 → 15 px | 1.4 | 0 |

Rules:

- **The display face is used a few times only:** the hero headline, the four chapter names and the bundles title. Everything else is DM Sans. (refs 01 and 03)
- **Mono only where it carries data:** the 3 specs per module, prices and readings. Not for labels or buttons.
- **Sentence case everywhere.** No all-caps labels, no tracked-out eyebrows, and no single accented word in a headline.
- **Line length** 45 to 70 characters for body text (max-width 34rem).
- **Body never below 16 px** on any screen.

## 4. Space, grid and shape

- **Spacing scale (spacious):** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px, as `--space-1` to `--space-10`.
- **Grid:** 4 columns on phones, 8 on tablets and 12 on desktop. 16 px gutters on phones, 24 px from 768 px up. Content max-width 1200 px, centred.
- **Sections:** each chapter is at least one screen tall (`min-height: 100svh`) and holds one idea. (ref 05 rhythm)
- **Radius:** 999 px for buttons (pill), 16 px for bundle cards and the form panel, 0 for everything else. Radius is a signal of "you can press or fill this".
- **Hairlines:** 1 px `--stone-300` on light, `rgba(231,229,228,0.16)` on dark, as dividers only.

## 5. Components

| Component | Rules |
|-----------|-------|
| **Header** | Logo on the left, three links (Modules, Bundles, FAQ) and the Register interest button on the right. 64 px tall, `--stone-50` at 92% opacity once you scroll. On phones the links fold into a menu button labelled "Menu"; the Register interest button stays visible. |
| **Primary button** | Pill, `--signal` fill, white DM Sans 500, 48 px tall (44 px minimum touch target), 24 px side padding. Hover and pressed: `--signal-dark`. One primary button per screen. |
| **Text link** | `--signal` underlined, 2 px offset. |
| **Callout** (on the 3D model) | A 1 px `--signal-glow` leader line from the module to a label: module name (DM Sans 500) and one spec (Plex Mono). Appears when its chapter is in view. (ref 04) |
| **Spec list** | Three rows, each a label in `--stone-400` and a value in Plex Mono `--stone-200`, divided by hairlines. |
| **Bundle card** | `--stone-100`, radius 16, 32 px padding. Name (Archivo 700), price (Plex Mono 500, 32 px), a module list with a tick or dash and a text alternative ("Included", "Not included"), and a secondary button "Register interest". The Home bundle has a 2 px `--stone-900` border and the label "Recommended" (Assumed: confirm). Never "Most popular" or "Most chosen": that would be a made-up claim. (ref 05) |
| **Form** | Labels above fields, always visible. Fields 48 px tall, 1 px `--stone-600` border, radius 8. Errors sit under the field in `--error` with an icon and the text from SPEC section 9, and the field gets `aria-invalid` and `aria-describedby`. Consent is a 24 px checkbox with its label clickable. |
| **FAQ row** | A `<details>` element: question in DM Sans 500, a plus that turns into a minus, and the answer in body text. Each opens on its own. |
| **3D fallback image** | A still of the assembled hub (hero) and the exploded hub (chapters), rendered from our own model, same size and place as the canvas, with alt text. |

Icons: one outline set (Lucide), 1.5 px stroke, 20 or 24 px, `aria-hidden` when decorative. No emoji as icons.

## 6. The 3D model and scene

- **Model:** procedural, built in code from Three.js shapes (spec rule 1). The hub is a rounded square base (about 2 by 2 by 0.5 units) with four stacked module plates, each a different finish: lights (frosted white), climate (warm grey), security (matte charcoal), energy (brushed metal with one `--signal` line).
- **Materials:** `MeshStandardMaterial` with low roughness variation; no texture images. One soft key light, one fill, and a contact shadow under the hub.
- **Camera:** a fixed, scroll-driven camera rig, not OrbitControls (UI/UX Pro Max, Three.js: a scripted reveal must keep its path).
- **Budget:** one model, under 20,000 triangles; device pixel ratio capped at 2 (1.5 on phones); the render loop stops when the canvas is off screen or the tab is hidden.

## 7. Motion

Static first: every section is built and passes Playwright without motion, then GSAP is added (INTENT Design intent).

| Moment | What moves | How |
|--------|-----------|-----|
| Hero load | The headline appears line by line (the hero hub is a still since 20 November 2026) | 600 ms, `power2.out`, once. No other load animation. Not built yet: open for phase 3. |
| Look inside (the one pinned area) | The canvas stays in place (sticky) while the four chapters scroll past it. The modules separate along the vertical axis; the active module comes forward and its callout appears. | ScrollTrigger with `scrub: 1`, tied to the scroll position, not timed. |
| Reassemble | The modules snap back together and the background turns light again | The same scrubbed timeline, reversed into place. |
| Section text | Headline and specs rise 24 px and fade in | 500 ms, `power2.out`, at most 8 items staggered by 80 ms, once per section. |
| Buttons and links | Colour change only | 150 to 200 ms. |

Rules:

- **Only one pinned area** on the page (UI/UX Pro Max, GSAP: no more than 1 or 2).
- **Animate only transform and opacity.** Never width, height, top or left.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, no scrubbing and no pinning; the fallback stills are shown and every section is in its final state (spec section 9).
- **Never block reading:** text is in the page before any motion runs, and the page reads the same if GSAP fails to load.
- Call `ScrollTrigger.refresh()` after fonts and the model load.

## 8. Page by section

| Section | Background | Layout (phone → desktop) | Reference |
|---------|------------|--------------------------|-----------|
| Hero | Light | Headline above the hub still on phones; headline left, hub still right on desktop | 01 |
| Look inside and the 4 chapters | Dark | On phones and tablets the canvas is a band at the top (about a third of the screen) with a label naming the active module, and the chapters scroll below it; on desktop the canvas is the right two thirds, text left third (changed 20 November 2026, approved by Anand Bakshi) | 02, 03, 04 |
| Reassemble | Dark → light | One line, centred | 02 |
| Bundles | Light | Cards stacked on phones, three across from 1024 px | 05 |
| Register interest | Light | One column, max-width 32rem | 05 |
| FAQ | Light | One column, max-width 44rem | 05 |
| Footer | `--stone-900` | One row: the fictional-product note and Back to top | |

## 9. Checks (how this design is verified)

- **Playwright** at 375, 768 and 1280 px: no horizontal scroll, every section present in order, keyboard reaches every control with a visible focus, the form errors appear as in SPEC section 9, and reduced motion shows the stills.
- **axe** through Playwright: no WCAG 2.2 AA failures.
- **Contrast:** every token pair in section 2 at 4.5:1 or more for text.
- **Impeccable** reviews the look once, after Playwright passes and before the evidence gate (QG4).
- **Lighthouse** mobile: LCP under 2.5 s, accessibility 95 or more.

## 10. For the person to confirm

- Assumed: a fixed light-dark-light scheme, with no theme toggle or system dark mode.
- Assumed: Archivo 800 as the display face. The other choice from the same mood is a single family (DM Sans at 700 for headings), which is quieter but less memorable.
- Assumed: the Home bundle is marked "Recommended" (our recommendation, not a sales claim). It can be removed.
