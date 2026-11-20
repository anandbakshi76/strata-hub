# Phase 3: independent review (20 November 2026)

Pull request 4, `phase-3-seo-accessibility-performance` (ebc93cd) into `main` (f330a3a), reviewed against `REVIEW.md`.

**Independence:** a fresh Claude Code session started for this review. It did not write or change any of the phase 3 code, and it read the docs, the diff and the logs cold.

## Verdict: ready to merge once the three Should fix items are settled

There are no Blockers. `npm run check` passes and every phase 3 criterion has evidence. I can't call it ready yet because of three Should fix items:

- S1 needs the person's approval written in the pull request. `REVIEW.md` makes that a merge gate.
- S2 and S3 are a copy gap and a ticked box that its evidence doesn't support. Each is small to fix, or the person can agree to it as a follow-up.

## Commands run

- `npm run check`: exit 0. Prettier, ESLint and TypeScript are clean. Vitest: 4 files, 21 tests passed. Playwright: 63 passed in 1.9 min, one worker (54 Chrome, 9 Edge). No browser crash, so no second run was needed.
  - Test count before this phase: 35 Playwright on `main` (`docs/STATUS.md` there). Now 63. The count went up, not down.
- `npm run build`: exit 0. `start-*.js` is 655 kB raw and 180 kB gzip, `index-*.js` is 2.4 kB gzip, and the seo test reports 177 KB gzip in total.
- `npm run lighthouse` (mobile, 3 runs):
  - run 1: LCP 1.589 s, CLS 0.001, TBT 96 ms, performance 99
  - run 2: LCP 1.584 s, TBT 92 ms
  - run 3: LCP 1.591 s, TBT 113 ms
  - Every run scored accessibility 100, SEO 100 and best practices 100.
  - **Worst values: LCP 1.591 s, CLS 0.001, accessibility 100, TBT 113 ms, performance 99.** Exit 0.
  - The script overwrites `docs/log/2026-11-20-lighthouse.json` (see N1). I copied my run to the scratchpad and restored the committed file with `git checkout`, so no file in the repository changed.
- The tests-first commits:
  - e384727 holds only `e2e/seo.spec.ts` and its output: 4 failed for the expected reasons (missing title, no robots.txt, no CSP, small touch targets). The 2 that passed are guards, as the note says.
  - 4a9d2ec holds only `e2e/critique.spec.ts` and its output: 6 failed. The reduced-motion guard passed.
  - The nav-link regression test was added with its fix in a later commit, with no failing run recorded (N4).

## What I checked by eye

I built the site, served it with `vite preview`, and drove headless Chrome with SwiftShader WebGL at 375×800, 768×1024 and 1280×900. I scrolled once so the 3D could start. All console messages, errors and warnings included, were captured at every width.

- **Hero (all three widths):** the headline is visible at once. Exactly one orange button, the hero's; the header's Register interest is outlined. The hero still is the WebP render of the model and matches the 3D hub's rounded plates.
- **Chapters:** the canvas replaced the still at every width.
  - 375: the band shows the label "Lights / Up to 50".
  - 1280: the Energy callout is beside the plate with the orange line. Chapter names are display size.
  - The header is opaque stone-50 over the dark section.
- **End of look-inside (light fade):** I took six scroll steps through the reassembly at each width and read `data-light`, the reassemble line's opacity and the colour of every text block on screen.
  - At 1280 the fade runs 0 → 0.42 → 0.98 → 1 and the reassemble line fades with it.
  - Light text never sits on the light layer. Text measured "in view" on phones was under the opaque band, which follows the fade.
  - No seam. See N2 for the empty area left behind and the hard edge at the start of the fade on phones.
- **Bundles:**
  - 1280: three cards. Prices and rows line up, and the Recommended tag sits on the Home card's top edge. Drawn ticks and dashes; no "Hub: included" row (see S2).
  - 768: the cards are capped at 32rem and left-aligned, stacked.
  - 375: stacked, with the tag on the edge.
- **Form at 375:** labels above the fields, a 24 px consent box, one orange submit, and the privacy note under the button.
- **Nav-link click:** from the top, Bundles (the menu on phones) landed at 72 px from the viewport top at all three widths, so the smooth scroll was not cut short by the 3D starting. The active link turns orange at 1280.
- **Console:** no errors or warnings at any width with the 3D running, so the CSP blocks nothing the page needs. No request went to any origin other than the site's own.
- **Served files:**
  - `/robots.txt` 200 `text/plain`, `/sitemap.xml` 200 `text/xml`, `/og-image.png` 200 `image/png`.
  - `dist/` holds only `index.html`, `assets/`, `og-image.png`, `robots.txt` and `sitemap.xml`. The dev-only `render-still.html` is not in the build.
  - I opened the share image: 1200×630, the hero with the model render.
- **Screenshots in `docs/log/img/phase3-*.png`:** these match what I saw.

## Findings

### Blockers

None.

### Should fix

**S1. `docs/INTENT.md` changed, with no approval from the person in the pull request.**
- Where: `docs/INTENT.md:87-88` (commit ebc93cd adds a "Recorded on 20 November 2026 at the phase 3 design critique" line).
- What is wrong: `REVIEW.md` ("Who approves") says a change to `docs/INTENT.md` needs the person's explicit approval in the pull request. The PR description lists the change under "What to review", but it carries no approval. There are no comments on the PR.
- Why it matters: INTENT is the approved anchor document, and the guard protects it.
- Fix: the person writes a PR comment approving the INTENT addition, or asks for it to be removed.

**S2. The bundle cards no longer say the hub is included.**
- Where: `web/index.html:188` onward (all three cards), against `docs/SPEC.md:43` ("Starter $199 (hub and lights) … Complete $499 (hub and all four modules)") and the approved `docs/CONTENT.md:53-55` ("Hub, lights" and so on).
- What is wrong: the approved critique fix dropped the repeated "Hub: included" row. Nothing replaced it, so the page never says a bundle includes the hub. Starter now reads as "$199, Lights: included", with climate, security and energy marked not included.
- Why it matters:
  - A visitor can't tell whether $199 buys a hub at all. That is a product claim (SPEC rule 7).
  - The page and the approved CONTENT.md disagree.
- Fix: add one line above or below the cards, such as "Every bundle includes the hub." Update `docs/CONTENT.md` and `web/content.ts` to match, with a Vitest or Playwright check. The new wording needs the person's approval (rule 7).

**S3. The CSP criterion is ticked, but Firefox was never checked.**
- Where: `docs/PLAN.md:107`: "[x] … zero console errors in Chrome, Edge and Firefox, and in Safari where available".
- What is wrong:
  - The "Done differently" paragraph, `playwright.config.ts` and the PR description all say Firefox and Safari are not tested, and are left to a hand check at release.
  - Safari is "where available", so leaving it out fits the wording. Firefox is not optional in the criterion.
  - I found no record of a Firefox run.
- Why it matters: a ticked box should mean the evidence exists (PROCESS: check every criterion). Firefox also differs from Chrome in how it treats CSP meta tags and console reporting, so Chrome and Edge passing doesn't prove Firefox is clean.
- Fix: either load the built page in Firefox once by hand and record the result in the phase note, or untick the box and record "Firefox deferred to phase 4, agreed by the person".

### Notes

**N1. Running `npm run lighthouse` overwrites the committed evidence.**
- `scripts/lighthouse.ts:94` writes `docs/log/<today>-lighthouse.json`. Any re-run on the same day replaces the file this PR commits; it happened during this review, and I restored the file.
- Suggestion: write to `logs/`, or add a time to the file name, and copy a run into `docs/log/` on purpose.
- Also: `spawn` with `shell: true` (line 26) prints a Node DEP0190 deprecation warning.

**N2. The light fade leaves an empty light area, and phones still see a hard edge at the start of the fade.**
- At 768 and 1280, once the fade finishes:
  - The reassemble line is at opacity 0 (`web/styles/site.css:849`).
  - The page shows about 300 to 500 px of empty stone-50 between the reassembled hub and "Choose your bundle".
- At 375, the dark section's lower edge meets the light page in view before the fade starts.
  - Cause: `start: "top 25%"` (`web/scene/start.ts:117`) is inside the 34svh band on phones.
- This is not wrong behaviour, and the person approved the fade. Suggestion: on phones and tablets, start the fade earlier, or trim the section's bottom space once the light layer is fully on.

**N3. Leftover and duplicate code.**
- `web/main.ts:56-59` has two comments describing two versions of the same trigger. The first, "on the first scroll after the page has loaded", is out of date. Keep the second.
- `web/styles/site.css:768` and `:773` are two `.inside {}` blocks that could be one, alongside the original at `:251`.

**N4. Gaps in test coverage (none hides a criterion).**
- The nav-link regression test was written with its fix, so there is no failing run on record.
- The light-fade test runs only at 1280 px.
- The one-orange-button test skips 768 px. It passes by eye.
- Nothing checks that the stills are the WebP renders, or that `og-image.png` is 1200×630.
- Suggestion: add 375 px to the fade test, since phones are where N2 shows.

**N5. The 3D waits for a scroll.**
- `web/main.ts:70`: scroll events are watched only after `load`.
- A visitor who opens a deep link such as `/#lights` and doesn't scroll again sees the stills, not the 3D, until they scroll. The fallback is acceptable, but worth knowing.
- SPEC 13's "3D ready within 4 s on the phone profile" is not measured now that loading waits for a scroll. Phase 4's final report should say "measured later" or measure it from the first scroll.

**N6. No script regenerates the share image.**
- `web/public/og-image.png` was updated by hand in ebc93cd. Nothing like `npm run stills` regenerates it, so it can drift from the hero.
- Suggestion: add it to `scripts/render-stills.ts`, or note how it was made in the phase note.

## The six passes

1. **Plan and spec.**
   - The diff delivers PLAN phase 3:
     - head tags, `web/public/robots.txt`, `sitemap.xml`
     - `scripts/lighthouse.ts`, `e2e/seo.spec.ts`
     - CSP (a Vite plugin, build only), touch targets, the 3D loaded after first paint
     - the Impeccable critique and its approved fixes
   - Files outside the plan's list are explained in "Done differently" and the phase note: `scripts/render-stills.ts`, `web/render-still.html`, `web/scene/render-still.ts`, `e2e/critique.spec.ts`, `playwright.config.ts` (Edge).
   - Nothing from Not for now is added. No analytics, cookies or form service. `form-action 'none'` reinforces rule 4.
   - The SPEC 9 still wording, the DESIGN 3/5/7 amendments and the INTENT note are consistent with each other.
   - Exceptions: S2 and S3.
2. **Tests.**
   - Every criterion has a test, except "results saved", which is the JSON file, and Firefox (S3).
   - The tests came first in their own commits, with real failing output.
   - No skip, only or empty tests.
   - The changed `review-2a` N6 test now checks `aria-hidden` on the SVG icons. It still tests the same rule, not a weaker one.
   - The count went from 35 to 63 Playwright tests.
3. **Security.**
   - No secrets in code.
   - The CSP is `default-src 'self'`, `script-src 'self'` and `style-src 'self'`, with no `unsafe-inline` and no `unsafe-eval`. `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`.
   - GSAP and Three.js set styles through the CSSOM, which the CSP allows, and the console stays clean.
   - The only outside input is the form, which phase 2a already validates.
   - There are no roles to check.
4. **Data and rules.**
   - Nothing is sent or stored: the form tests pass, and no request goes to another origin.
   - Fonts stay self-hosted (rule 6).
   - Prices are unchanged. The hub row is the only claim affected (S2).
5. **Docs.**
   - `docs/STATUS.md` gives the right counts: 21 Vitest and 63 Playwright.
   - `README.md` adds `npm run lighthouse` and `npm run stills`.
   - `docs/PLAN.md` boxes are ticked, with "Done differently".
   - The dated notes are there: the phase note, the critique, and both first-run outputs.
   - `docs/RUNBOOK.md` needs no change, since deployment hasn't changed.
6. **Traces.**
   - `scripts/lighthouse.ts` and `scripts/render-stills.ts` wrap their work in `trace()` from `web/telemetry.ts` and call `flushTraces()`.
   - Sample spans from my run in `logs/traces/traces-2026-11-20.jsonl`:
     - `{"name":"lighthouse.run","trace_id":"878372…","duration_ms":10220.674,"status":"ok","attributes":{"run":1}}`
     - These hold no key, no personal data and no content.
   - The browser records nothing (SPEC 13). The page makes no new requests.
   - No trace is missing.

## Phase 3 criteria and their evidence

| Criterion (`docs/PLAN.md` phase 3) | Evidence | Met |
|---|---|---|
| Unique title and description, Open Graph tags, `robots.txt` and `sitemap.xml` | `e2e/seo.spec.ts` tests 1 and 2 pass in Chrome and Edge. I fetched all three files from the built site (200, with the right types) and opened the 1200×630 share image | Yes |
| Lighthouse mobile: LCP under 2.5 s, accessibility 95 or more, saved in `docs/log/` | My run, worst: LCP 1.591 s, accessibility 100. Committed `docs/log/2026-11-20-lighthouse.json` shows worst LCP 1.59 s, accessibility 100 | Yes |
| JavaScript and model under 600 KB compressed, from the build output | Build: `start` chunk 180.12 kB gzip plus `index` 2.42 kB. The seo test reports 177 KB gzip in total. The model is procedural, inside the chunk | Yes |
| Cumulative Layout Shift under 0.1 | Lighthouse worst 0.001. The seo layout-shift test (375 px, scrolled through to the FAQ) passes | Yes |
| CSP in place; zero console errors in Chrome, Edge and Firefox, and Safari where available | CSP meta in `dist/index.html`. The seo CSP test and smoke tests pass in Chrome and Edge. My own run had no errors or warnings at three widths with the 3D on. Firefox not checked | Partly (S3) |
| Impeccable critique saved in `docs/log/`, each finding fixed or listed | `docs/log/2026-11-20-phase-3-impeccable-critique.md`, from two isolated assessments. The phase note lists the person's choices. P1 ×2, P2 ×3, N2 and N6 are fixed, tested in `e2e/critique.spec.ts` (8 tests pass) and checked by eye above. Bundle buttons kept, by the person's choice. The minor observations and questions stay listed for the person | Yes |
| `npm run check` passes | Exit 0, 21 Vitest and 63 Playwright passed (output summarised above) | Yes |

### Approved critique fixes, one by one

| Fix | Done | Test | By eye |
|---|---|---|---|
| P1 one orange button; header button outlined | `index.html` header `.button.secondary` | critique test 1 (375 and 1280) | Yes, at all three widths |
| P1 light fade after the reassembly, no seam | `start.ts` light layer; band border removed | critique test 2 (1280) | Yes, at three widths (N2) |
| P2 stills rendered from the model | `npm run stills`, WebP 16 and 20 kB | layout test: stills have alt text and fixed sizes (it doesn't check the source) | Yes, they match the 3D |
| P2 bundles line up; no hub row; capped width | `site.css` `.card .tag`, SVG icons, 32rem cap | critique test 4 | Yes (S2) |
| P2 opaque header over the dark section | `main.ts` `setUpHeader`, `.over-dark` | critique test 3 | Yes |
| N2 chapter names 48 to 88 px | `site.css` `.chapter h3` | critique test 5 | Yes |
| N6 headline rises, never transparent, none with reduced motion | `site.css` `@keyframes rise` | critique tests 6 and 7 | Yes |
