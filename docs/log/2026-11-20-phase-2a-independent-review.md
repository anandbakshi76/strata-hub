# Phase 2a: independent review (20 November 2026)

Pull request 2, `phase-2a-pages-layout` (cf36320) into `main` (513c984), against `REVIEW.md`, `docs/PLAN.md` phase 2a, `docs/SPEC.md` and `DESIGN.md`.

**Independence:** this review ran in a fresh Claude Code session that did not write, plan or commit any of this code. It changed no code and no existing file; this note is the only file it added.

## Verdict

**Fix first.** One Blocker: with JavaScript off, pressing Enter in the email field submits the form as a GET request and puts the email address in the URL, without consent (rule 4). Fix it and the four Should fix items, then re-run `npm run check`. Everything else in the phase is solid: the checks pass, the tests were written first, and the page matches DESIGN.md closely at all three widths.

## `npm run check`

Exit code 0. Prettier clean, ESLint clean, `tsc` clean, Vitest 15 passed (2 files), Playwright 20 passed (43.3 s, one worker). No crash, so no second Playwright run was needed.

```
All matched files use Prettier code style!
 Test Files  2 passed (2)
      Tests  15 passed (15)
Running 20 tests using 1 worker
  20 passed (43.3s)
EXIT 0
```

## Findings

### Blocker

**B1. With JavaScript off, Enter in the email field sends the email in a URL, without consent.**
- Where: `web/index.html:207` (`<form novalidate>` with no `action`) and the comment at `web/index.html:232`.
- What: the form has one text-like field (the email), so browsers submit it implicitly when Enter is pressed, even with no submit button (HTML implicit submission). `novalidate` turns off the `required` checks. Probe with JavaScript disabled, at 375 px: fill `sam@example.com`, press Enter. Result: `GET http://localhost:4181/?email=sam%40example.com&module=Not+sure+yet`, page URL changed to that address. Consent was not ticked.
- Why it matters: rule 4 ("never sent anywhere without consent, and in the pilot not sent at all") and SPEC 6 ("not sent, saved or logged"). The email reaches the host's access logs, the browser history and any proxy. The comment at line 232 and the phase note ("so the email can never land in a URL") claim the opposite. The bug came in with phase 1's markup, but rule 4 is enforced by this phase (PLAN rules table: "Phase 2 `form.ts`, no-network criterion"), and the JavaScript-on test does not cover it.
- Fix: make the fields inert until JavaScript runs, for example wrap them in `<fieldset disabled>` in the HTML and have `setUpForm` remove `disabled` (disabled controls block implicit submission and are never sent). Add a Playwright test with `javaScriptEnabled: false` that presses Enter in the email field and expects no request and an unchanged URL. With JavaScript on the same probe sends nothing and shows the confirmation, so only the no-JS path needs the change.

### Should fix

**S1. The header button doesn't put the focus in the email field (SPEC 5).**
- Where: `web/index.html:29` (`<a class="button" href="#register">`), `web/main.ts` (no handler).
- What: SPEC 5 says the header's button "jumps to step 6 and puts the focus in the email field". Probe at 1280 px: after clicking it, the URL is `/#register` and `document.activeElement` is `BODY`.
- Why it matters: PLAN phase 2 delivers "5 (the sticky header and its button)", and it is a static behaviour, not motion. Keyboard and screen-reader users land at the section, not in the field.
- Fix: in `main.ts`, on click of any `a[href="#register"]`, focus `#email` (with `preventScroll: false`) after the jump; add a Playwright test. If the person prefers it in 2b, record that in the plan.

**S2. The header uses a glass effect, which DESIGN.md 2 rules out.**
- Where: `web/styles/site.css:128-129` (`background: rgb(250 250 249 / 92%); backdrop-filter: blur(8px);`).
- What: DESIGN.md 2: "No gradients as decoration and no glass effects." Over the dark chapters the blurred header turns a muddy grey (seen in the 1280 px chapter screenshot). DESIGN.md 5 asks for `--stone-50` at 92% "once you scroll", not a blur.
- Fix: remove `backdrop-filter`; keep the 92% background (as a token-based colour, see S3).

**S3. Raw colours in the stylesheet, against "tokens only, no raw hex" (PLAN 2a step 3, DESIGN.md 2, brand skill).**
- Where: `web/styles/site.css:96` and `:478` (`#fff`), `:318` (`#fff` for chapter names), `:128` (`rgb(250 250 249 / 92%)`), `:303`, `:336`, `:340`, `:362` (`rgb(231 229 228 / 16%)`).
- What: eight raw colour values. Two of them also change the design: chapter names are pure white (`rgb(255, 255, 255)` measured), where DESIGN.md 2 gives `--stone-200` as main text on dark.
- Why it matters: the token file is the single place to change the palette; raw values drift. The test "design fonts and colours" doesn't catch it.
- Fix: add tokens for white (`--white`, used for button text and field backgrounds, as DESIGN.md 2 says "white text on it"), the header background and the dark hairline (DESIGN.md 4 gives its value); use `--stone-200` for chapter names. Optionally a lint step that fails on hex outside `tokens.css`.

**S4. Form errors have no icon (DESIGN.md 5).**
- Where: `web/styles/site.css:510-514` (`.error`), `web/index.html` `#email-error`, `#consent-error`.
- What: DESIGN.md 5: "Errors sit under the field in `--error` with an icon and the text from SPEC section 9." The 375 px error screenshot shows red text only. Colour alone is a weaker signal (WCAG 1.4.1 is met by the text, but the design asks for the icon).
- Fix: add a Lucide outline alert icon (1.5 px stroke, 20 px, `aria-hidden="true"`) before each message, inline SVG so no request is added.

### Note

- **N1. FAQ plus turns into an x, not a minus.** `web/styles/site.css:571-573` rotates "+" 45 degrees. DESIGN.md 5: "a plus that turns into a minus". Swap the content to "\2212" for `[open]` instead of rotating.
- **N2. The display face is missing from the bundles title, and chapter names are small for display.** DESIGN.md 3: Archivo 800 for "the hero headline, the four chapter names and the bundles title", display size 48 to 112 px. Measured: `#bundles h2` weight 700; chapter names 32 / 38 / 56 px at 375 / 768 / 1280 (`site.css:315-319`). A design call for the person or the phase 3 critique.
- **N3. Two primary buttons on the first screen.** DESIGN.md 5: "One primary button per screen." The header button and the hero button are both `--signal` pills on the first screen at every width. Consider the hero button primary and the header one secondary, or confirm with the person.
- **N4. Tests that are weaker than their names.** `e2e/layout.spec.ts:105` (keyboard order) passed on the unstyled page in the first run, so it adds little beyond default browser focus; it also runs at 1280 px only, so the phone Menu path is untested for keyboard (my probe at 375 px: Skip to content, Strata, Menu, Register interest, which is correct). `e2e/layout.spec.ts:82` (stills) doesn't emulate reduced motion, although PLAN 2a step 1 lists "the stills shown when reduced motion is on"; my probe with `reducedMotion: "reduce"` shows both stills loaded. axe (`e2e/smoke.spec.ts`) runs only on the page at load, not on the form's error state or the open menu. Worth adding before 2b changes these areas.
- **N5. Screenshots aren't in the report.** PLAN 2a criterion 1 says "with screenshots in the report". The note says they were looked at; none are attached to the pull request or committed. Attach them to the pull request so the person can see them.
- **N6. Generated content in bundle lists.** `site.css:436-450` adds "✓" and "–" as `::before` content, which some screen readers announce ("check mark") before "Hub: included". Use `content: "\2713" / ""` to give it empty alt text.
- **N7. The PLAN boxes are ticked before review.** `docs/PLAN.md` phase 2a criteria are all `[x]` in this pull request. PROCESS.md step 4 asks for that, so it is in order, but the Blocker above means criterion 3 (nothing sent) isn't fully met yet; untick it or fix B1 in this pull request.
- **N8. Layout gaps that 2b will close.** At 1280 px the hero headline sits beside the hub, not "partly behind" it (DESIGN.md 8); chapters are 70svh, not 100svh (DESIGN.md 4); on phones the exploded still sits above the chapters rather than a full-screen canvas with a bottom text panel. All are reasonable for a static page and noted in the phase note; listed so 2b picks them up.

## The six passes

1. **Plan and spec.** The diff touches only files PLAN phase 2 names (`web/styles/*.css`, `web/main.ts`, `web/form.ts`, `web/assets/stills/`, `e2e/layout.spec.ts`, `e2e/form.spec.ts`, `package.json`, `docs/STATUS.md`, `docs/log/`) plus `web/menu.ts` and `web/index.html` (needed for the Menu and the stills; recorded in the note). Nothing from Not for now. Fonts are `@fontsource` (plan choice 4); stills are the interim SVGs (plan choice 3). Gaps: B1 (rule 4), S1 (SPEC 5).
2. **Tests.** Tests first in their own commit 52f7ec6 (only `e2e/` and the first-run log); 11 of 14 failed for the expected reasons, recorded in `docs/log/2026-11-20-phase-2a-first-run.txt`. After that commit, the only test change is one added test (the shared left edge); no test was edited, skipped or weakened. Playwright count went from 5 to 20; Vitest stays at 15. Each 2a criterion has a test, except the JavaScript-off submission (B1) and the header focus (S1). Weak spots in N4.
3. **Security.** No secrets in code. The only outside input is the form: the email is trimmed, checked against a pattern and 254 characters, and never written to the page (it uses `textContent` for fixed messages only). No `innerHTML`. B1 is the hole.
4. **Data and rules.** Personal data: the email stays in the page with JavaScript on (probe: no request, URL unchanged, confirmation shown). With JavaScript off it leaks (B1). Rules: 3 met (email, one optional choice, consent only); 5 met (no `audio` or autoplay `video`, tested); 6 met (only own-origin requests at all three widths, tested; fonts bundled by Vite).
5. **Docs.** `docs/STATUS.md` updated and accurate (Vitest 15, Playwright 20). Dated note `docs/log/2026-11-20-phase-2a.md` present with choices and alternatives. `README.md` unchanged; it still matches how to run the site. `docs/RUNBOOK.md` unchanged, correctly, since deployment didn't change.
6. **Traces.** The site is static and records nothing in the browser (SPEC 13, OBSERVABILITY "Concern for the person", approved at Step 1). The phase adds no runtime request: the only network traffic is the page's own CSS, JS, fonts and SVG stills, and the form sends nothing with JavaScript on. No trace is missing. The no-JS GET in B1 is a request that must not exist at all, not one to trace.

## What I checked by eye

Built with `npm run build` and served with `vite preview` on port 4181. Screenshots in headless Chrome (Playwright) at 375, 768 and 1280 px, full page and first screen, plus the open phone menu, a chapter at 1280 px, and the form's error state at each width. Against DESIGN.md:

- **2 Colour:** light page, dark chapters, light bundles, dark footer; one accent used for actions; focus ring on dark uses `--signal-glow`. Header turns grey over dark (S2); chapter names white rather than `--stone-200` (S3).
- **3 Type:** Archivo 800 hero at 48 / 69 / 112 px, DM Sans body 17 to 18 px, Plex Mono for specs and prices, sentence case throughout. N2 for bundles title and chapter sizes.
- **4 Space and shape:** 16 px gutter on phones, 24 px from 768 px, 1200 px max, one shared left edge (64 px at 1280). Pill buttons, 16 px cards and form panel, 8 px fields.
- **5 Components:** header 64 px with Menu on phones and the button always visible; primary 48 px, header 44 px; bundle cards with tick and dash and text, Home with 2 px dark border and "Recommended"; form labels above, 48 px fields, 24 px checkbox; FAQ rows. Missing error icon (S4); FAQ x instead of minus (N1).
- **6 and 7 (3D and motion):** not in 2a. Stills shown in place of the canvas with alt text and fixed width and height; reduced motion shows both stills.
- **8 Page by section:** hero headline above the hub on phones and 768, beside it at 1280; chapters dark with the still above (phone) or sticky beside (1280); reassemble line centred; cards stacked at 375 and 768 and three across at 1280; form 32rem; FAQ 44rem; footer one row at 768 and 1280, wrapping to two at 375. No sideways scroll at any width (`scrollWidth - innerWidth` = 0).

## Phase 2a criteria and their evidence

| Criterion (PLAN phase 2a) | Met? | Evidence |
|---|---|---|
| At 375, 768 and 1280 px: no sideways scroll, each section laid out as DESIGN.md 8, with screenshots in the report | Met, screenshots missing from the report (N5) | `e2e/layout.spec.ts:10-41` and `e2e/smoke.spec.ts` at three widths; `layout.spec.ts:57-80` (bundles three across and stacked, still beside the text); `layout.spec.ts:136` (one left edge); overflow 0 in my probe; my screenshots above |
| The keyboard reaches every link, button, field and FAQ question in order, with a visible focus ring | Met (weakly tested, N4) | `layout.spec.ts:105` at 1280 px; my 375 px probe of the header order |
| Empty or invalid email and unticked consent show the SPEC 9 messages next to the fields; a valid submission shows the confirmation; no network request on submit | **Not fully met (B1)** | With JavaScript on: `e2e/form.spec.ts` (5 tests: messages, `aria-invalid`, `aria-describedby`, focus, confirmation, no request) and my Enter-key probe. With JavaScript off, Enter sends a GET with the email |
| axe finds no WCAG 2.2 AA failures; every text colour pair at least 4.5:1 | Met | `e2e/smoke.spec.ts` (axe tags `wcag2a`, `wcag2aa`, `wcag22aa`) at three widths; the pairs used are DESIGN.md 2's checked pairs (stone-600 on stone-100 and error on stone-100 stay above 5.9:1) |
| No request to any domain other than the site's own | Met | `layout.spec.ts:14-27` at three widths; my probe saw only `localhost` requests |

## Suggested next step

Fix B1 with its test, and S1 to S4, in this pull request; re-run `npm run check`; then hand to the verifier. The Notes are optional; N2 and N3 are design calls for the person.
