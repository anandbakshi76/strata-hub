# Phase 3: verifier (20 November 2026)

Branch `phase-3-seo-accessibility-performance` at f7886ba, against `main` (f330a3a). Checked as `.claude/agents/verifier.md` says.

## Verdict: ready

Every phase 3 criterion is met, apart from one agreed deferral. That deferral is the Firefox part of the security-policy criterion: the person agreed on 20 November 2026 to move it to phase 4, and it is recorded in `docs/PLAN.md` and `docs/log/2026-11-20-phase-3.md`. It is not a failure. `npm run check`, `npm run build` and `npm run lighthouse` all exit 0. One merge gate is outside the code: S1 is recorded as pending until the person adds their approval comment on pull request 4.

## Criteria

- **Title, description, Open Graph tags, `robots.txt`, `sitemap.xml`: met.** `e2e/seo.spec.ts` tests 1 and 2 pass in Chrome and Edge. They check the title, a description of 70 to 170 characters, `og:*`, the Twitter card and the canonical link. They also check that `robots.txt` names the sitemap, that `sitemap.xml` lists the page, and that `/og-image.png` is served as PNG.
- **Lighthouse mobile: LCP under 2.5 s and accessibility 95 or more, saved in `docs/log/`: met.**
  - My run (3 runs), worst values: LCP 1.623 s, accessibility 100, layout shift 0.001. Exit 0.
  - Saved `docs/log/2026-11-20-lighthouse.json`, worst values: LCP 1.589 s, accessibility 100, layout shift 0.001.
- **JavaScript and model under 600 KB compressed, from the build output: met.**
  - `npm run build`: `start-*.js` is 655.31 kB raw and 180.14 kB gzip; `index-*.js` is 2.41 kB gzip.
  - The seo budget test prints "JS files: 2, 645 KB raw, 177 KB gzip" and passes. The model is procedural, so it sits inside the chunk.
- **Layout shift under 0.1: met.** The seo layout-shift test passes in Chrome and Edge (375 px, scrolled through to the FAQ). Lighthouse worst value 0.001.
- **Content Security Policy, zero console errors in Chrome, Edge, Firefox and Safari where available: met for Chrome and Edge; Firefox deferred (agreed); Safari not available.**
  - `dist/index.html` has `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'`, with no `unsafe-inline` and no `unsafe-eval`.
  - The seo CSP test checks for zero console errors while scrolling, and the smoke tests pass at 3 widths, in both Chrome and Edge.
  - `motion.spec.ts` "no console errors while scrolling" passes with the 3D running.
  - The box is correctly left unticked in PLAN.md.
- **Impeccable critique saved, each finding fixed or listed: met.**
  - `docs/log/2026-11-20-phase-3-impeccable-critique.md`: 22/32, with 2 P1 and 3 P2 findings, plus minor observations, open design calls and questions.
  - All five priority issues are fixed, along with design calls N2 and N6, as the person chose. The bundle buttons stay as they are, also by the person's choice. The rest remain listed for the person.
  - Fixes are tested in `e2e/critique.spec.ts` (8 tests pass).
  - Screenshots are in `docs/log/img/phase3-*.png`, five files. They were taken before the hub line was added; that line is proven by the Vitest test instead.
- **`npm run check` passes: met.**
  - Exit 0. Prettier, ESLint and tsc are clean.
  - Vitest: 4 files, 22 tests passed.
  - Playwright: 63 passed in 2.5 min on one worker (54 Chrome, 9 Edge).
  - No browser crashed, so no second run was needed.

## Commands run

- `npm run check`: exit 0, output summarised above. Last lines: `63 passed (2.5m)`.
- `npm run build`: exit 0, built in 750 ms, no errors.
- `npm run lighthouse`: exit 0.
  - run 1: LCP 1.623 s, CLS 0, TBT 1168 ms, performance 76
  - run 2: LCP 1.600 s, CLS 0.001, TBT 205 ms, performance 96
  - run 3: LCP 1.594 s, CLS 0.001, TBT 139 ms, performance 98
  - Accessibility, SEO and best practices scored 100 in every run.
  - **Worst: LCP 1.623 s (target under 2.5), accessibility 100 (target 95 or more), CLS 0.001 (target under 0.1).**
  - Run 1's high blocking time looks like a cold start on a busy machine (the check had just finished). Blocking time is not a phase 3 target, and runs 2 and 3 are in line with the saved file.
  - The script overwrites `docs/log/2026-11-20-lighthouse.json`, as review note N1 says. I copied my run to the scratchpad and restored the committed file with `git checkout`, so the file in the repository is unchanged.

## Tests first, and real

- e384727 adds only `e2e/seo.spec.ts` and `2026-11-20-phase-3-first-run.txt`.
  - 4 tests failed for the expected reasons: the title was "Strata Hub", robots.txt was missing, the CSP meta timed out, and touch targets were too small.
  - The 2 that passed (the size budget and layout shift) are guards, as the phase note says.
- 4a9d2ec adds only `e2e/critique.spec.ts` and `2026-11-20-phase-3-critique-tests-first-run.txt`. 6 tests failed on real assertions. The 1 that passed is the reduced-motion guard.
- 74d1096 adds only the hub-line Vitest test and `2026-11-20-phase-3-hub-line-test-first-run.txt`. It failed with `expected undefined to be 'Every bundle includes the hub.'`.
- No `.skip`, `.only`, `.fixme` or `.todo` anywhere in `e2e/`, `web/` or `perf/`.
- The tests read real values from the page: computed styles, DOM, network, the console and layout-shift entries. None asserts a constant.
- Changed tests:
  - `motion.spec.ts` and `perf/fps.spec.ts` add one scroll each, because the 3D now loads on the first scroll. Their assertions are unchanged.
  - The `review-2a` N6 test now checks that the 12 SVG icons are `aria-hidden`. That is the same rule for the new drawn icons, and no weaker.
- Counts went up, not down: Playwright went from 35 on `main` to 63, and Vitest from 21 to 22.
- The nav-link regression test in `critique.spec.ts` was added with its fix, with no failing run on record. The review already noted this as N4; it guards a bug found in phase 3 and doesn't prove a criterion.

## Independent review: Should fix items

- **S1 (INTENT.md change needs the person's approval in the PR): recorded as pending.** The phase note records that the person approved it and will add the approval as a comment on pull request 4. I can't see GitHub, so this stays pending until the person comments. `REVIEW.md` makes that comment a merge gate.
- **S2 (bundles never say the hub is included): settled.**
  - "Every bundle includes the hub." is at `web/index.html:186`, `web/content.ts:82` and `docs/CONTENT.md:51`, and the rule 7 approval is noted in CONTENT.md.
  - The Vitest test in `web/structure.test.ts` checks all three and passes. Its failing first run was committed first, in 74d1096.
- **S3 (Firefox box ticked without evidence): settled.** The PLAN.md box is unticked, and the deferral to phase 4 is recorded with the person's agreement and the reason (Firefox isn't installed).

## Scope

`git diff --stat main...HEAD` shows 46 files. All of them fall into one of these groups:

- **Files the plan names:** head tags, `web/public/robots.txt`, `web/public/sitemap.xml`, `scripts/lighthouse.ts`, `e2e/seo.spec.ts`, and the CSS and scene fixes.
- **Logs and screenshots:** dated logs, first-run outputs and screenshots in `docs/log/`.
- **Additions explained in "Done differently" and the phase note:**
  - `scripts/render-stills.ts`, `web/render-still.html`, `web/scene/render-still.ts`, the WebP stills and `og-image.png`
  - `e2e/critique.spec.ts`
  - the `playwright.config.ts` Edge project
  - the `vite.config.ts` CSP plugin
  - the two new dev dependencies, `lighthouse` and `chrome-launcher`
- **Approved document updates:**
  - DESIGN.md: header opacity, display face and hero motion.
  - SPEC.md: the SPEC 9 still wording.
  - INTENT.md: one recorded line (see S1).
  - CONTENT.md: the hub line.
  - `docs/PLAN.md`, `docs/STATUS.md` and `README.md` were also updated.

Nothing from Not for now crept in. There is no checkout, no accounts, no CMS and no form service. There are no analytics or cookies, and the only requests go to the site's own origin. `form-action 'none'` reinforces rule 4.

## Notes (not blocking)

- `docs/STATUS.md` still says "Vitest (21 tests)". The S2 test made it 22.
- `docs/STATUS.md` gives the worst Lighthouse performance as 97. The committed JSON's worst is 98. Performance is not a target.

## Independence

This ran in a fresh Claude Code session that did not write or change any of the phase 3 code. It changed no file other than this report: no commit, no push and no branch switch.
