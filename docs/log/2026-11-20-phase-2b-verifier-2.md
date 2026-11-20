# Phase 2b: verifier report, second run (20 November 2026)

## Verdict: ready

All five [2b] criteria and "`npm run check` passes" are met. The one criterion the first report found not met (`2026-11-20-phase-2b-verifier.md`, criterion 3, "nothing is pinned" at 1024 px and wider with the 3D off) is fixed. It now has a test that was committed first and failed for the right reason.

Branch `phase-2b-3d-hub-motion` at c291ec1, compared with `main` (6ad8065).

**Independence:** this ran in the same fresh verifier session as the first report. That session did not write the code, the tests or the fix. No file was changed except this report. Nothing was committed or pushed, and the branch wasn't switched.

## What changed since the first report

- **9a9d730** (test first): adds two Playwright tests to `e2e/motion.spec.ts` at 1280 px, one with reduced motion and one with no WebGL. Each expects the chapter still's computed `position` not to be `sticky`, and the still to move more than 100 px when the page scrolls from Climate to Security. The output is in `docs/log/2026-11-20-phase-2b-pin-test-first-run.txt`. Both tests fail at the assertion `Expected: not "sticky"` (`motion.spec.ts:192`), which is the expected reason. The commit also adds the first verifier report.
- **c291ec1** (fix): `web/styles/site.css` removes `position: sticky; top: 112px` from `.inside-grid .still` at 1024 px and wider. The only pinned rule left is `.inside.has-3d .still`, so the still is pinned only when the 3D hub is running. `e2e/motion.spec.ts` adds `waitForTimeout(1000)` after each scroll, because smooth scrolling is on without reduced motion. The tests still check the same two things: not sticky, and moves more than 100 px. So this is a fix to the timing, and it doesn't loosen the test. `docs/log/2026-11-20-phase-2b.md` gains 4 lines describing the fix. No other file changed.

## Commands run

- `npm run check`: **exit 0**. Prettier clean, ESLint clean, `tsc --noEmit` clean, Vitest 4 files with **21 of 21** passed, Playwright **40 of 40** passed (1.4 min, one worker). That's 38 before plus the 2 new pin tests, tests 25 and 26. No crash (no exit code 134), so Playwright didn't need a second run.
- `npm run perf`: **exit 0**, `FPS RESULT {"fps":60,"p95FrameMs":16.8,"frames":359}` (Pixel 5 profile, 4x CPU slowdown, SwiftShader).
- A browser check of my own: a production build served with `vite preview` on port 4174, headless Chrome with SwiftShader, scripted with Playwright from the scratchpad. I scrolled from Climate to Security with a 1.2 s wait after each scroll.

  | Mode | Width | `position` of `#inside .still` | Moved while scrolling |
  |---|---|---|---|
  | Reduced motion | 1280 | static | 630 px (scrolls with the page) |
  | No WebGL | 1280 | static | 630 px (scrolls with the page) |
  | Reduced motion | 375 | static | 414 px |
  | No WebGL | 375 | static | 414 px |
  | 3D on | 1280 | sticky (top 96) | 0 px (the one pinned area) |
  | 3D on | 375 | sticky (top 64) | 0 px (the band) |

## Criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | [2b] The model has a base and four modules, under 20,000 triangles, built from shapes only (rule 1) | **Met** | `web/scene/hub.test.ts` passes 5 of 5. 3,080 triangles. Shapes only and no textures. `hub.ts` and `hub.test.ts` are unchanged since the first report. |
| 2 | [2b] Scrolling explodes the hub, highlights each module in its chapter and reassembles it; scrolling up reverses it (SPEC 4.2), checked in the browser | **Met** | Motion tests 17 and 20 to 22 pass. My browser check at 375 and 1280 px: each chapter makes its own module active with the right callout or label, the hub is reassembled (`explode` 0) at the reassemble line with the canvas on screen, and scrolling back up to Energy explodes it again at 1280 px. The results are the same as in the first report. The fix didn't touch the 3D path: the `.has-3d` rules and `start.ts` are unchanged. |
| 3 | [2b] With reduced motion, or with WebGL turned off, the stills show, nothing is pinned and all content reads (SPEC 9) | **Met** (was not met) | The stills show, there's no canvas and the content reads: motion tests 23 and 24, and review-2a test 34. Nothing is pinned: new tests 25 and 26 at 1280 px (not sticky, moves more than 100 px) failed first in 9a9d730 and pass now. My table above shows the still is `static` and scrolls with the page at 1280 and 375 px in both modes. |
| 4 | [2b] The 3D section holds 50 frames per second or more under Playwright's mid-range phone profile with 4x CPU slowdown, or the person has decided under rule 8 (acceptance test 4) | **Met** (an approximation) | `npm run perf`: 60 fps, 95th percentile frame 16.8 ms. The caveat from the first report still applies: it counts main-thread frames on emulated hardware, and a real-phone check is still open (PLAN choice 6). |
| 5 | [2b] Zero console errors while scrolling the whole page | **Met** | Motion test 16 passes. My scripted scroll through every chapter, the reassemble line, Bundles and the page bottom at 375 and 1280 px logged `console errors: []`. |
| 6 | `npm run check` passes | **Met** | Exit 0: 21 Vitest and 40 Playwright tests passed. |

## Tests first, review fixes, scope

- **Tests first:** the new pin tests were committed before the fix and failed for the expected reason (see above). `test.skip`, `.only`, `.fixme` and `.todo` still appear nowhere. The test count went up from 38 to 40 Playwright tests.
- **Review fixes:** unchanged since the first report. B1, S1, S3 and S4 are fixed with tests where possible, and S2 is approved in 09fe6f0.
- **Scope:** c291ec1 touches only `site.css`, `motion.spec.ts` and the phase 2b log. 9a9d730 adds only the test, its first-run output and the first verifier report. Nothing from SPEC 14 "Not for now", and no new dependencies.

## Still open from the first report (not criteria)

- Small doc mismatches:
  - `docs/STATUS.md` says Playwright runs 35 tests. It now runs 40.
  - `docs/STATUS.md` says the callout shows "on wide screens". Phones and tablets also get the label in the band.
  - `DESIGN.md:83` still says the stills are "rendered from our own model".
  - `docs/log/img/phase2b-375-security.png` predates the label in the band.
- On phones the reassembly starts during the Energy chapter. With Energy centred at 375 px, `explode` is 0.22 and there's no label (measured again in this run).
- The frame rate is still an emulated approximation. A check on a real phone is open.
