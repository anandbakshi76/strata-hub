# Phase 2b: verifier report (20 November 2026)

## Verdict: not ready (one criterion not met)

Four of the five [2b] criteria and "`npm run check` passes" are met. One is not: **"With reduced motion, or with WebGL turned off, ... nothing is pinned"**. At 1024 px and wider the chapter still keeps the `position: sticky` rule from phase 2a, so it stays pinned beside the chapters when the 3D is off. The test that claims to check "nothing is pinned" doesn't assert it. The fix is small (see below), or the person can accept the sticky still as a departure. Everything else is in good shape: the review's Blocker and Should fix items are fixed or approved, the tests came first, and nothing outside the phase changed.

Branch `phase-2b-3d-hub-motion` at 09fe6f0, compared with `main` (6ad8065).

**Independence:** this ran in a fresh session that did not write the code, the tests or the docs on this branch. No file was changed except this report. Nothing was committed or pushed.

## Commands run

- `npm run check`: **exit 0**. Prettier clean, ESLint clean, `tsc --noEmit` clean, Vitest 4 files with **21 of 21** passed, Playwright **38 of 38** passed (1.3 min, one worker). No crash (no exit code 134), so Playwright didn't need a second run.
- `npm run perf`: **exit 0**, `FPS RESULT {"fps":59,"p95FrameMs":16.8,"frames":354}` (Pixel 5 profile, 4x CPU slowdown, SwiftShader). The target is 50.
- A browser check of my own: a production build (`dist/` from the check run) served with `vite preview` on port 4174, headless Chrome with SwiftShader, scripted with Playwright from the scratchpad. It checked:
  - the stills' CSS `position` and on-screen position across two chapters, with reduced motion, without WebGL, and with the 3D, at 375 and 1280 px
  - `data-active`, `data-explode` and the callout for each chapter, at the reassemble line, at Bundles and scrolling back up, at 375 and 1280 px
  - console errors.
  Results are under each criterion.

## Criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | [2b] The model has a base and four modules, under 20,000 triangles, built from shapes only (rule 1) | **Met** | `web/scene/hub.test.ts`, 5 tests pass: a base plus four modules in DESIGN order, a triangle count between 100 and 20,000, no `map` or `normalMap` on any material, stacked when assembled and spread when exploded, and the active module brought forward. `hub.ts` uses only `RoundedBoxGeometry`, `CylinderGeometry` and `BoxGeometry`, and `scene.ts` adds a `CircleGeometry` shadow. No loader and no texture. 3,080 triangles (STATUS; the review measured the same). |
| 2 | [2b] Scrolling explodes the hub, highlights each module in its chapter and reassembles it; scrolling up reverses it (SPEC 4.2), checked in the browser | **Met** (with one observation) | Playwright `motion.spec.ts`. Test 17 at 1280 px: explode 0 to above 0.95, `data-active` follows each chapter, below 0.05 at Bundles, and back to Security, then Lights, on the way up. Test 20 (review S1): the canvas is fully on screen when the hub has snapped back. Tests 21 and 22 (review B1, S3) at 375 and 768 px: the active module matches the chapter being read, both with the story just below the band and with the chapter centred, and the label in the band names it. My browser check matched at 375 and 1280 px: Lights, Climate, Security and Energy each active with the right callout. At 1280 px, with the reassemble line centred, the hub is fully together (`explode` 0) and the canvas is on screen. Scrolling back up to Energy explodes it again (`explode` 1). The screenshots in `docs/log/img/phase2b-1280-*.png` match. *Observation:* `phase2b-375-security.png` was taken before the S3 fix (378665d) and has no label in the band. My own 375 px screenshot at 09fe6f0 shows "Security / Up to 30" in the band. Also, at 375 px with the Energy chapter centred, `explode` is already 0.22 and the label is gone, because the reassembly starts while Energy is still being read on phones. The Energy label does show earlier in that chapter (test 21 checks this), so it doesn't fail the criterion. It's listed below for the person. |
| 3 | [2b] With reduced motion, or with WebGL turned off, the stills show, nothing is pinned and all content reads (SPEC 9) | **Not met** (at 1024 px and wider) | The stills show, no canvas is made and the content reads: motion tests 23 and 24, and review-2a test 34. **But "nothing is pinned" fails on wide screens.** `web/styles/site.css:290-295` (from phase 2a, unchanged on this branch) gives `.inside-grid .still` `position: sticky; top: 112px` at 1024 px and wider, with no condition on `.has-3d` or on reduced motion. Measured at 1280 px with the chapter scrolled from Climate to Security: with reduced motion, `position: sticky`, top 112 px before and after (moved 0 px); without WebGL, the same, sticky and moved 0 px. At 375 px the still is `static` and scrolls normally. DESIGN 7 says "Reduced motion: no scrubbing and no pinning". The reduced-motion test (`e2e/motion.spec.ts:132`) is named "... nothing is pinned ..." but only asserts that `data-explode` is absent and that no canvas exists. It never checks the still's position, so it can't catch this. |
| 4 | [2b] The 3D section holds 50 frames per second or more under Playwright's mid-range phone profile with 4x CPU slowdown, or the person has decided under rule 8 (acceptance test 4) | **Met** (an approximation) | `npm run perf` in this session: 59 fps, 95th percentile frame 16.8 ms. The branch reported 60 fps and the review 59 fps. Caveat (review N2, still true): `perf/fps.spec.ts` counts main-thread `requestAnimationFrame` callbacks, and CPU throttling doesn't slow the GPU process. The test asserts only `frames > 10`, so it records the number rather than enforcing 50. A real-phone check is still open (PLAN choice 6). |
| 5 | [2b] Zero console errors while scrolling the whole page | **Met** | Motion test 16 collects `console` errors and `pageerror` while scrolling from Lights to FAQ at 1280 px and expects none. The smoke tests at 375, 768 and 1280 px check load. My browser check scrolled every chapter, the reassemble line, Bundles and the page bottom at 375 and 1280 px: `console errors: []`. |
| 6 | `npm run check` passes | **Met** | Exit 0 in this session: 21 Vitest and 38 Playwright tests passed. |

### To make criterion 3 pass

Either:

- scope the wide-screen sticky rule to the 3D, for example `.inside.has-3d .inside-grid .still` in place of `.inside-grid .still` in `site.css:290`, or turn it off under `prefers-reduced-motion: reduce` and without `.has-3d`
- and make the reduced-motion and no-WebGL tests assert it at 1280 px, for example that `getComputedStyle(still).position` isn't `sticky`, or that the still's top moves when the page scrolls by one chapter.

Or the person accepts the sticky still on wide screens with the 3D off as a departure (it doesn't move or scrub; it only stays in place), and the criterion is reworded.

## Tests first

- **38e7197** (tests only, before any code) adds `web/scene/hub.test.ts` and `e2e/motion.spec.ts`. The output is in `docs/log/2026-11-20-phase-2b-first-run.txt`: `hub.test.ts` fails with "Cannot find module './hub'", and 4 of 6 motion tests fail because no canvas is found ("element(s) not found"). The 2 fallback tests passed, since the stills already existed. The log says so.
- **48381ec** (tests for the review findings, before the fixes) adds the S1, B1 and S3 tests. The output is in `docs/log/2026-11-20-phase-2b-review-tests-first-run.txt`: 3 failed (the S1 reassembly-on-screen test, and the 375 and 768 px active-module tests), 6 passed.
- **Test changes after the failing runs:**
  - 38e7197 to 378665d: only `e2e/layout.spec.ts`. It now accepts the canvas in place of the chapter still and keeps the alt, width and height checks. The reduced-motion and no-WebGL tests still require the still to be visible. That's justified, not weaker.
  - 48381ec to HEAD: `e2e/motion.spec.ts`. In the B1 and S3 test, the "just below the band" line is now worked out from where the band sticks (64 px header plus band height plus 16), instead of the band's position before scrolling. A centred-chapter assertion, the review's own measurement, was added. The first is a fix to how the test sets up the scroll position, and the second makes the test stronger. Neither loosens what it checks.
  - `perf/fps.spec.ts`: only the comment changed (review N2).
  - The log says the 375 px case passed once against the old code, so the reviewer's measurement is the evidence for 375 px there.
- **Nothing skipped, focused or empty.** `test.skip`, `.only`, `.fixme`, `.todo` and `describe.skip` appear nowhere in `e2e`, `web` or `perf`. Every 2b test asserts on page state, model state or measured values. The test count went up: Vitest 15 to 21 and Playwright 20 to 38 since phase 2a.
- **One test claims more than it checks:** the reduced-motion "nothing is pinned" test (criterion 3 above).

## Review fixes (`2026-11-20-phase-2b-independent-review.md`)

| Finding | State | Evidence |
|---|---|---|
| **B1** (Blocker): highlight one chapter ahead below 1024 px | **Fixed, with a test** | `start.ts:93-107`: on narrow screens, start and end use one line just below the band, so two chapters can't be active at once. Tests 21 and 22 at 375 and 768 px failed first (48381ec) and pass now. My check at 375 px: each chapter centred gives its own module. |
| **S1**: on desktop the hub reassembled off screen | **Fixed, with a test** | `index.html`: `#reassemble` moved inside the sticky grid. `start.ts:76-77`: the timeline ends at `#reassemble` "bottom bottom". Test 20 failed first and passes now. My check at 1280 px: reassembled (`explode` 0) with the canvas on screen (see the screenshot note under criterion 2). |
| **S2**: departures 1 and 2 need the person's approval | **Approved** | 09fe6f0: PLAN records departures 1, 2 and 5 as approved by Anand Bakshi on 20 November 2026. SPEC 5.1, 8 and 9, DESIGN 7 and 8, and INTENT "Changes after approval" are updated with the date and the approver. The original INTENT lines are kept. |
| **S3**: the phone layout departs from DESIGN 8 and has no callout | **Fixed and approved** | The phone and tablet label in the band (`site.css:702-716`, the callout placed in the band), tested in tests 21 and 22. The band is departure 5, approved, and DESIGN 8 is updated. The wrong "gap 21" reference is gone from the test name. |
| **S4**: README lacks `npm run perf` | **Fixed** (a doc fix, no test needed) | `README.md` has the line. |
| Notes N1, N2, N3, N5 | Fixed | N1: the log says 3,080 triangles. N2: the perf comment says "approximation". N3: the PLAN Files line names `scene.ts` and `start.ts`. N5: `main.ts` releases the probe context, and `start.ts:32-37` handles `webglcontextlost` (no test, since a lost context is hard to trigger in Playwright). |
| Notes N4, N6, N7 | Left for the person or phase 3 | As the phase 2b log says. |

Departures 3 (CSS sticky instead of a GSAP pin) and 4 (`npm run perf` kept out of `npm run check`) weren't asked to be approved. They don't change SPEC, DESIGN or INTENT wording: DESIGN 7 already says "sticky", and the criterion names the perf profile. The review judged both reasonable.

## Scope

- `git diff --stat main...phase-2b-3d-hub-motion`: 29 files. All are in the phase:
  - the scene files (`hub.ts`, `scene.ts`, `start.ts`) and `hub.test.ts`
  - `main.ts` (loads the 3D), `index.html` (the reassemble line moved for S1), `site.css`
  - `e2e/motion.spec.ts`, plus the `e2e/layout.spec.ts` change above
  - `perf/`, `playwright.perf.config.ts`, the `perf` script in `package.json`, `tsconfig.json` (includes `perf`), `playwright.config.ts` (SwiftShader), `vite.config.ts` (chunk warning limit, review N7)
  - README, STATUS, PLAN, the phase logs, the review, the first-run outputs and 4 screenshots
  - the approved SPEC, DESIGN and INTENT updates.
- No new dependencies: `package-lock.json` is unchanged, and `three` and `gsap` were already in place.
- **Nothing from SPEC 14 "Not for now"** crept in: a grep of the added lines in `web`, `e2e`, `perf` and `package.json` for checkout, account, login, CMS, analytics, cookie, `fetch(`, `sendBeacon` or a form service found nothing. The 1280 px layout test still checks own-domain requests only, with the 3D loaded.
- Working tree clean before and after this run, apart from this report.

## Small doc mismatches (not blocking)

- `docs/STATUS.md` says Playwright runs 35 tests. It runs 38 (the 3 review tests were added after).
- `docs/STATUS.md` says the callout shows "on wide screens". Phones and tablets now also get the label in the band.
- `DESIGN.md:83` (section 5, "3D fallback image") still says the stills are "rendered from our own model". Departure 1 updated SPEC 9 but not this row.
- `docs/log/img/phase2b-375-security.png` predates the S3 fix (no label in the band). A fresh 375 px screenshot would show the approved layout.

## For the person (observations, not criteria)

- On phones the reassembly starts during the Energy chapter. With Energy centred at 375 px, `explode` is 0.22 and the Energy label is hidden (it needs `explode` above 0.5). On desktop, Energy stays fully apart (`explode` 1). Consider starting the reassembly later on narrow screens.
- The frame rate is an emulated approximation (criterion 4). A check on a real mid-range phone is still open.
