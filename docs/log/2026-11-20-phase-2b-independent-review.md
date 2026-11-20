# Phase 2b: independent review (20 November 2026)

Pull request 3, `phase-2b-3d-hub-motion` (378665d) into `main` (6ad8065). Reviewed against `REVIEW.md`, `docs/PLAN.md` phase 2 [2b], `docs/SPEC.md` 4.2, 5, 9, 13 and `DESIGN.md` 5 to 8.

**Independence:** this review was done in a fresh session that did not write the code, the tests or the docs on this branch.

## Verdict: fix first

One Blocker: below 1024 px the model highlights the next module while the visitor is still reading the current chapter. Phones are the main audience (SPEC 3). `npm run check` passes (exit 0) and the desktop motion works as planned.

## Commands run

- `npm run check`: exit 0. Prettier, ESLint and tsc clean; Vitest 4 files, 21 tests passed; Playwright 35 passed (1.4 min, one worker). No crash, so no second Playwright run was needed.
- `npm run perf`: exit 0. `FPS RESULT {"fps":59,"p95FrameMs":17.2,"frames":355}` (Pixel 5 profile, 4x CPU slowdown, SwiftShader). The branch reports 60 fps and 16.8 ms, so the results agree.
- Triangle count, measured by importing `web/scene/hub.ts` and calling `triangleCount(buildHub().group)`: **3,080**.
- Visual check: a production build served with `vite preview`, headless Chrome with `--enable-unsafe-swiftshader --use-angle=swiftshader`, at 1280x900, 768x1024 and 375x812. At each width I scrolled to the section start, each of the four chapters, the reassemble line and the bundles, then took a screenshot and recorded `data-explode`, `data-active`, the canvas box and the callout. I also swept the scroll in 120 px steps from Energy to Bundles. No console errors at any width.

## Findings

### Blocker

**B1. Below 1024 px the highlighted module is one chapter ahead of the text being read.**
- Where: `web/scene/start.ts:85-90` (`start: phone ? "top 80%"`, `end: phone ? "bottom 40%"`).
- What: the phone and tablet trigger ranges overlap. The next chapter's heading enters the bottom 20% of the screen while the current chapter's text still fills the space below the band, and the last toggle wins. Measured with the chapter scrolled to the centre:
  - At 375: Lights centred gives `data-active="climate"`, and Climate centred gives `security`.
  - At 768: Lights gives `climate`, Climate gives `security` and Security gives `energy`. The callout also names the wrong module: with Climate centred it says "Security, Up to 30".
  - Screenshots: the 375 view with the Climate story under the band shows the charcoal Security plate pushed forward and warm.
- Why: SPEC 5 step 3 says each chapter's module is highlighted as that chapter comes into view. The ticked criterion says "highlights each module in its chapter … checked in the browser". The page gets this wrong for most visitors, who are on phones. `e2e/motion.spec.ts` only tests highlighting at 1280 px, so nothing caught it.
- Fix: give the narrow-screen triggers ranges that don't overlap, measured from the bottom of the band rather than the screen. For example, `start: () => \`top ${bandBottom + 24}px\``, with the same line for `end`, or "top 55%" and "bottom 55%". Then add a Playwright test at 375 px that puts each chapter's story just below the band and expects `data-active` to name that chapter.

### Should fix

**S1. On desktop the hub reassembles while the canvas scrolls off screen.**
- Where: `web/scene/start.ts:10, 66-71` (`RAMP_OUT = 0.9`; the timeline ends at `#reassemble bottom 40%`). The sticky area in `web/styles/site.css:629-650` ends with the chapters.
- What: the 120 px sweep at 1280x900 gives explode 1 → 0.89 → 0.5 → 0.12 → 0, while the visible part of the canvas goes 76% → 61% → 45% → 30% → 14%. The hub is fully reassembled only after the canvas has left the screen. In the screenshot with the reassemble line centred, the hub is half apart and the header cuts off its top. At 375 it is mostly fine: the visible part goes from 100% to 44%.
- Why: SPEC 4.2 and 5 step 4 ("the modules snap back into the hub") and DESIGN 7 (Reassemble). On desktop the visitor sees the hub leave half apart, not snap back. The test checks only `data-explode`, not whether the reassembly can be seen.
- Fix: finish the reassembly while the canvas is still sticky. Either end the timeline at the end of the sticky area (for example `endTrigger: "#energy", end: "bottom bottom"`), or keep the reassemble line inside the sticky container. Add a check that the canvas is fully in view when `data-explode` first drops below 0.05.

**S2. Departures 1 and 2 change approved SPEC and INTENT wording. The person has to approve them, not just see them recorded.**
- Where: `docs/PLAN.md:64`, departures (1) and (2).
- What: (1) SPEC 9 asks for stills "rendered from our own model", but the SVG drawings stay. (2) INTENT names "Hero with the 3D hub" as a key screen, and SPEC 5 step 1 says "the assembled hub in 3D". DESIGN 7 has a hero load motion for the hub. The hero keeps its still instead.
- Why: PROCESS says requirements change in SPEC only when the person asks, and `docs/INTENT.md` is the person's decision. The plan says "recorded", not "approved".
- Judgement: both are reasonable on the merits. The SVG stills are about 1 kB, sharp and already approved with the design sample. A still in the hero protects LCP (acceptance test 2) and keeps Three.js off the critical path. The person should approve them explicitly in the pull request, and SPEC 9 and 5.1 should be updated if the person agrees. INTENT keeps its wording, with the decision recorded.

**S3. The phone layout departs from DESIGN 8 and DESIGN 5 without a recorded departure.**
- Where: `web/styles/site.css:629-635` (a sticky band at the top, `height: 34svh`) and `site.css:684-689` (callouts only from 768 px). The test name in `e2e/motion.spec.ts:72` cites "gap 21".
- What:
  - DESIGN 8 asks for phones: "Canvas fills the screen with the chapter text in a panel at the bottom". The build puts a 34% band at the top, and the chapters scroll underneath it, so a chapter's heading slides under the band while its story is still being read. The 375 screenshots show the Lights and Climate stories with no heading on screen.
  - DESIGN 5 says the callout "appears when its chapter is in view", with no phone exception, but phones get none.
  - The "gap 21" reference is to phase 2a's note (`docs/log/2026-11-20-phase-2a.md:8`). That item is about labels inside the SVG drawings, not phone callouts.
- Why: DESIGN.md wins over the brand docs, and DESIGN's "one memorable thing" is the hub coming apart "with thin callouts naming each module". Together with B1, a phone visitor gets no reliable cue for which module they are reading about.
- Fix: either build the DESIGN 8 phone layout, or record the band and the hidden callouts as departures for the person to approve, and correct the "gap 21" references. If the band stays, consider a small fixed label inside the band that names the active module.

**S4. README does not mention `npm run perf`.**
- Where: `README.md`, "Run it".
- Why: AGENTS.md says README carries how to run the project. The branch adds a new command and documents it only in STATUS.md.
- Fix: add one line, for example "`npm run perf` measures the frame rate in the 3D section (Pixel 5 profile, 4x CPU slowdown)".

### Note

- **N1.** `docs/log/2026-11-20-phase-2b.md:8` says "About 1,500 triangles". I measured 3,080, and STATUS.md says 3,080. Correct the note.
- **N2.** The perf number may be optimistic. `perf/fps.spec.ts` counts `requestAnimationFrame` callbacks on the main thread. CDP CPU throttling slows the renderer's main thread but not the GPU process, where SwiftShader rasterises, so frames the GPU drops can still count as 60 fps. The file comment calls the number "pessimistic", which is not established. Suggestion: also record dropped frames from a Chrome trace or `long-animation-frame` entries, and keep the real-phone check open (PLAN choice 6). SPEC 13's "3D ready within 4 s on the phone profile" is not measured yet; phase 3 covers SPEC 13.
- **N3.** The PLAN 2b "Files" line still names `web/scene/scroll.ts`. What was built is `web/scene/start.ts` plus `web/scene/scene.ts`. Update the line or mention it in the departures.
- **N4.** `web/scene/start.ts:85` reads the media query once, so a tablet rotated across 1024 px keeps its old trigger points. The breakpoints also differ: `scene.ts:16` uses 767 px for the pixel ratio, `start.ts` uses 1023 px and the callout CSS uses 768 px. A turn to reduced motion during the visit is ignored too. `gsap.matchMedia()` (gsap-core skill) would handle all three and revert cleanly.
- **N5.** `web/main.ts:37-38`: the probe canvas's WebGL context is never released. Free it with `WEBGL_lose_context`. There is also no `webglcontextlost` handler. If the context is lost, the stills stay hidden behind a blank canvas. Removing `has-3d` in that handler would bring them back (SPEC 9).
- **N6.** DESIGN 7's "Hero load" (hub fades up, headline line by line) and "Section text" (rise and fade, staggered) motions are not built, and PLAN [2b] does not list them. The person should say whether they are dropped (the hero load is moot after departure 2) or belong to a later phase.
- **N7.** `vite.config.ts` raises `chunkSizeWarningLimit` to 700 kB to hide the warning for the 655 kB (180 kB compressed) 3D chunk. That is acceptable against the SPEC 10 budget of 600 kB compressed. Phase 3 should confirm the total from the build output.

## The six passes

1. **Plan and spec.** The branch delivers the [2b] steps: tests first, `hub.ts`, the scroll motion (in `start.ts`), and the speed check. Nothing from Not for now is included. Departures: see S2, S3 and N3, and the judgement below. The SPEC 4.2 and 5.3 behaviour works on desktop, but is wrong on narrow screens (B1) and partly hidden on desktop (S1).
2. **Tests.** The tests-first commit 38e7197 holds `web/scene/hub.test.ts` (failed: module missing) and `e2e/motion.spec.ts` (4 of 6 failed on the missing canvas). The two fallback tests passed because the stills already existed. The output is in `docs/log/2026-11-20-phase-2b-first-run.txt`. Between 38e7197 and 378665d the only test change is `e2e/layout.spec.ts`. It now accepts the canvas in place of the chapter still, keeps the alt, width and height checks on the image, and the reduced-motion and no-WebGL tests still require the still to be visible. That change is justified, not a weakening. Nothing is skipped or empty. Test counts went up: Vitest 21, Playwright 35. Gap: highlighting and reassembly are tested only at 1280 px and only through data attributes (B1, S1).
3. **Security.** The 3D code takes no outside input and holds no secrets. A grep of `web/scene` and `web/main.ts` found no `fetch`, `sendBeacon`, XHR, WebSocket, storage, cookie or `console` call.
4. **Data and rules.** No personal data is touched. Rule 1: the model is built from Three.js shapes, and `hub.test.ts` asserts there are no `map` or `normalMap` textures. Rule 2: the 3D loads after `data-ready`, only with motion allowed and WebGL present, and the stills stay if it fails. Rule 6: the 3D chunk comes from the site's own origin, and the 1280 layout test checks own-domain requests with the 3D loaded.
5. **Docs.** STATUS.md and PLAN.md are updated and the dated note is there. Three problems: README is missing the perf command (S4), the triangle count in the note is wrong (N1), and the PLAN Files line is stale (N3). RUNBOOK needs no change because deployment did not change.
6. **Traces.** The site is static, and SPEC 13 says nothing is recorded in the browser. The 3D code sends and records nothing (pass 3). The perf script writes `logs/perf.json` on the developer's machine only; `logs/` is git-ignored. No trace is missing.

## The four departures

1. **SVG stills instead of renders of the model:** reasonable (small, sharp, already approved). It changes SPEC 9's wording, so it needs the person's approval (S2).
2. **Hero keeps its still; the 3D only in look-inside:** reasonable for LCP and for reading first. It departs from INTENT's key screen, SPEC 5.1 and DESIGN 7's hero load, so it needs the person's approval (S2).
3. **CSS sticky instead of a GSAP pin:** reasonable. DESIGN 7 itself says "The canvas stays in place (sticky)", so this matches the design and avoids the pin's layout jump. It does make S1 easier to hit, because the sticky area ends before the timeline does.
4. **Frame-rate check as `npm run perf`, outside `npm run check`:** reasonable, since a measurement shouldn't make the build flaky. The criterion rests on a SwiftShader approximation (N2), so a real-phone check stays open.

## Evidence for each [2b] criterion

| Criterion | Met? | Evidence |
|---|---|---|
| Base and four modules, under 20,000 triangles, shapes only (rule 1) | Yes | `hub.test.ts` (5 tests pass); measured 3,080 triangles; `RoundedBoxGeometry`, `CylinderGeometry` and `BoxGeometry` only, with no textures. |
| Scrolling explodes, highlights each module in its chapter, reassembles; scrolling up reverses (SPEC 4.2), checked in the browser | **Partly** | At 1280: `data-active` matches each chapter, explode reaches 1, then 0 at Bundles, and it reverses (motion test 17 and my screenshots). Below 1024 px the wrong module is highlighted (B1). On desktop the reassembly happens mostly off screen (S1). |
| Reduced motion or no WebGL: stills show, nothing pinned, content reads (SPEC 9) | Yes | Motion tests 20 and 21 (no canvas, still visible, no `data-explode`, Energy heading visible); review-2a N4 test. |
| 50 fps or more on the phone profile with 4x CPU slowdown, or a rule 8 decision | Yes, with N2 | `npm run perf`: 59 fps, p95 17.2 ms (my run); 60 fps and 16.8 ms on the branch. Method caveat in N2. |
| Zero console errors while scrolling the whole page | Yes | Motion test 16; my runs at 1280, 768 and 375 logged no console errors. |
| `npm run check` passes | Yes | Exit 0: Vitest 21 of 21, Playwright 35 of 35. |

## Checked by eye

- **1280:** the dark chapters show the canvas in the right two thirds and the text in the left third, as DESIGN 8 asks. The hub separates along the vertical axis and the active plate comes forward with a warm tint. The orange (`--signal-glow`) leader-line callout shows the module name and its first spec (Climate "5 to 35 °C", Energy "Up to 16"). The canvas stays at `top: 96px` from Climate to Security. With Energy centred it has started to scroll up, and at the reassemble line the hub is half together with its top cut off (S1).
- **768:** a 347 px band at the top with callouts. The highlight and callout are one chapter ahead (B1).
- **375:** a 275 px band at the top, no callouts. The highlight is one chapter ahead, and the chapter heading sits under the band while its story is read (B1, S3).
- The branch's own screenshots (`docs/log/img/phase2b-*.png`) match what I saw at the positions they show.
