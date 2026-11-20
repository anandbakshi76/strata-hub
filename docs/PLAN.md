# Plan: Strata Hub

Status: Approved (Approved by Anand Bakshi on 19 November 2026, with suggested changes 1 and 2 accepted)
Built from: `docs/SPEC.md` (approved 19 November 2026) and `DESIGN.md` (approved 19 November 2026)
Record ID: (none given in INTENT.md)

The build of the Strata Hub launch page: the four phases asked for, in that order, with phase 2 split into 2a and 2b (approved). Each phase is one branch and one pull request. `npm run check` must pass at the end of every phase.

## Changes to the phases (approved)

The person accepted both changes on 19 November 2026. The build runs in five phases: **1, 2a, 2b, 3, 4**, each its own branch and pull request. The steps become: Step 3 phase 1, Step 4 phase 2a (static page), Step 4b phase 2b (3D hub and scroll motion, a new prompt written from this plan), Step 5 phase 3, Step 6 phase 4.

1. **Split phase 2 into 2a and 2b.** "Pages & Layout" as given would carry both the static page and the 3D model with its scroll motion, which is the largest and riskiest part of the build (SPEC 4.2, rule 8, acceptance test 4). DESIGN.md says to build every section static first, pass Playwright, then add motion. Suggested: **2a Pages & Layout (static)** and **2b 3D hub & scroll motion**. Reason: two reviewable pull requests instead of one very large one, and the static page is safe to ship even if the 3D needs more work or a decision under rule 8.
2. **Add the Impeccable critique to phase 3.** DESIGN.md section 9 says Impeccable reviews the look once, after Playwright passes and before the evidence gate. Phase 3 is where that fits. Reason: the given phase list has no design review.

Phases 2a and 2b take the parts marked [2a] and [2b] below. Branches: `phase-2a-pages-layout` and `phase-2b-3d-hub-motion`.

## Phase 1: Sitemap, Content & Structure

**Delivers:** SPEC 4.1 (the one-page structure), 4.3 (module copy and specs), 4.4 (bundle content), 4.6 (FAQ), 5 (page order), 8 (sections), 6 (form fields, as structure only); rule 2 (content without JavaScript).

**Order of the work**

1. Tests first: a Vitest test that reads `web/index.html` and checks the sections exist in the SPEC 5 order with one `h1` and correct heading levels; a Playwright test with JavaScript disabled that every heading, story, spec, bundle and FAQ answer is readable (rule 2).
2. `web/content.ts`: all copy in one place, typed. The four module stories (up to 40 words each) and 3 specs each, the three bundles with prices, the six FAQ questions and answers, the privacy note and the footer note. Every text block is marked `draft: true` until the person approves it. The copy is drafted from SPEC 4 and answers A6 to A8, rather than the word PLACEHOLDER the app suggests, so the page can be reviewed with real words.
3. `web/index.html`: semantic HTML for the header, hero, look-inside, four module chapters, reassemble line, bundles, register-interest form (fields and labels only, no behaviour), FAQ (`<details>`), footer. The content is in the HTML itself, so it reads with JavaScript off.
4. `docs/CONTENT.md`: the same copy as a readable list for the person to approve.

**Files:** `web/index.html`, `web/content.ts`, `web/structure.test.ts`, `e2e/no-js.spec.ts`, `docs/CONTENT.md`, `docs/STATUS.md`, `docs/log/`. Added while building (see the phase 1 note): `web/main.ts` (removes the JavaScript-off notice), `web/styles/base.css` (skip link), `playwright.config.ts` (tests the production build), `e2e/smoke.spec.ts` (new heading), `docs/PROCESS.md` (check line, plan choice 8), `README.md`.

**Could break:** the foundation smoke test expects the heading "Strata Hub: foundation"; it is updated to the real `h1` in the same commit.

**Success criteria**

- [x] The structure test passes: sections in the SPEC 5 order, one `h1`, no skipped heading levels.
- [x] With JavaScript disabled, Playwright finds every module name, story, spec, bundle price and FAQ question (rule 2).
- [x] `docs/CONTENT.md` lists all copy, and the person has approved it or marked changes (prices and claims need approval, rule 7). (Approved by Anand Bakshi on 19 November 2026.)
- [x] The form has the three fields from SPEC 6, each with a visible label, and no other fields (rule 3).
- [x] The footer says Strata is a fictional product.
- [x] `npm run check` passes.

## Phase 2: Pages & Layout

**Delivers:** SPEC 4.1 to 4.6 as they look and behave, 5 (the sticky header and its button), 9 (all the error and fallback cases), 10 (accessibility), 12 (sizes); rules 1, 2, 3, 4, 5, 6, 8; DESIGN.md sections 2 to 8.

**Order of the work**

[2a] Static page
1. Tests first: Playwright at 375, 768 and 1280 px for each section's layout (DESIGN.md 8), keyboard order through the header, bundles, form and FAQ, visible focus, the form's error messages and confirmation (SPEC 9, 4.5), nothing sent on submit (rule 4: no network request), axe with no AA failures, and the stills shown when reduced motion is on.
2. Fonts: self-hosted Archivo 800 and 700, DM Sans 400 and 500, IBM Plex Mono 500 through the `@fontsource` npm packages (open source, bundled by Vite: no font service, rule 6).
3. CSS by section from DESIGN.md: header, buttons, hero, dark chapters, spec list, callout layout, bundle cards, form, FAQ, footer. Tokens only, no raw hex.
4. `web/form.ts`: validation and the confirmation message from SPEC 4.5 and 9; consent required; nothing sent.
5. Still images for the hero and the chapters: the self-made SVG drawings from the design sample, as interim stills, until [2b] renders them from the model.

[2b] 3D hub and scroll motion
6. Tests first: a test that `web/scene/hub.ts` builds four modules and a base under 20,000 triangles; Playwright that the canvas appears, stays pinned through the four chapters, and that with reduced motion or no WebGL the stills show and nothing is pinned (SPEC 9).
7. `web/scene/hub.ts`: the procedural model (DESIGN.md 6), no textures or images (rule 1).
8. `web/scene/scroll.ts`: GSAP ScrollTrigger with `scrub: 1`, one pinned area, explode, highlight the active module, callouts, reassemble (DESIGN.md 7). Loaded after the text, so it never blocks reading.
9. `scripts/render-stills.ts`: renders the assembled and exploded hub to WebP through Playwright, inside a telemetry span, replacing the interim SVG stills.
10. Speed check against acceptance test 4 (50 frames per second). If it fails, stop and ask (rule 8).

**Files:** `web/styles/*.css`, `web/main.ts`, `web/form.ts`, `web/scene/hub.ts`, `web/scene/scroll.ts` (built as `web/scene/scene.ts` and `web/scene/start.ts`), `web/assets/stills/`, `scripts/render-stills.ts`, `e2e/layout.spec.ts`, `e2e/form.spec.ts`, `e2e/motion.spec.ts`, `web/scene/hub.test.ts`, `package.json` (fonts), `docs/STATUS.md`, `docs/log/`.

**Departures in 2b (recorded 20 November 2026; departures 1, 2 and 5 approved by Anand Bakshi on 20 November 2026, with SPEC, DESIGN and INTENT updated):** (1) [Reversed at the phase 3 critique: the stills are now rendered from the model by `npm run stills`.] The stills stay as the self-made SVG drawings approved with the design sample, not renders of the model (step 9): they are about 1 kB each, sharp at any size and already approved; `scripts/render-stills.ts` was not built. (2) The hero keeps its still image; the 3D hub lives only in the look-inside section, where it explodes. The hero is the Largest Contentful Paint, so a still there keeps it fast (acceptance test 2), and Three.js loads after the page is readable. (3) The pinned area is CSS `position: sticky`, not a GSAP pin: still one pinned area, with no layout jump. (5) Phones and tablets: the hub is a band at the top (34% of the screen) with the chapters scrolling below it and a label in the band naming the active module, instead of DESIGN.md 8's full-screen canvas with a text panel at the bottom. (4) The frame-rate check is `npm run perf` (Pixel 5 profile, 4x CPU slowdown), kept out of `npm run check` because it measures rather than passes or fails.

**Could break:** the speed target (3D on a mid-range phone); text reflow when fonts load (layout shift); the pinned area on iOS Safari; reading order if the canvas sits in front of the text.

**Success criteria**

- [x] [2a] At 375, 768 and 1280 px: no sideways scroll, each section laid out as DESIGN.md 8 (checked in the browser, with screenshots in the report).
- [x] [2a] The keyboard reaches every link, button, field and FAQ question in order, with a visible focus ring.
- [x] [2a] An empty or invalid email and an unticked consent box show the SPEC 9 messages next to the fields; a valid submission shows the confirmation; Playwright sees no network request on submit (rule 4).
- [x] [2a] axe finds no WCAG 2.2 AA failures; every text colour pair is at least 4.5:1 (DESIGN.md 2).
- [x] [2a] No request to any domain other than the site's own (rule 6), checked by Playwright.
- [x] [2b] The model has a base and four modules, under 20,000 triangles, built from shapes only (rule 1).
- [x] [2b] Scrolling explodes the hub, highlights each module in its chapter and reassembles it; scrolling up reverses it (SPEC 4.2), checked in the browser.
- [x] [2b] With reduced motion, or with WebGL turned off, the stills show, nothing is pinned and all content reads (SPEC 9).
- [x] [2b] The 3D section holds 50 frames per second or more under Playwright's mid-range phone profile with 4x CPU slowdown, or the person has decided under rule 8 (acceptance test 4).
- [x] [2b] Zero console errors while scrolling the whole page.
- [x] `npm run check` passes.

## Phase 3: SEO, Accessibility & Performance

**Delivers:** SPEC 2 (acceptance tests 2 and 3), 10 (speed budget, Content Security Policy), 12 (browsers), 13 (observability targets); the Impeccable critique (suggested change 2).

**Order of the work**

1. Tests first: Playwright checks for the title, meta description, Open Graph tags, `robots.txt` and `sitemap.xml`; a Lighthouse run (mobile) through a script that fails under the targets.
2. SEO: one title and description for the single page, Open Graph image from the stills, `robots.txt`, `sitemap.xml`.
3. Accessibility pass: the canvas's text alternative, `aria-describedby` on errors, touch targets at least 44 px, reduced-motion review.
4. Performance: the page's JavaScript and model under 600 KB compressed (SPEC 10), fonts preloaded, stills with width and height set so nothing shifts, the 3D loaded after first paint.
5. Content Security Policy as a meta tag: only the site's own scripts, styles, fonts and images.
6. Impeccable critique of the finished page; fix what it finds that DESIGN.md supports, and list the rest for the person.

**Files:** `web/index.html` (head), `web/public/robots.txt`, `web/public/sitemap.xml`, `scripts/lighthouse.ts`, `e2e/seo.spec.ts`, CSS and scene files for fixes, `docs/log/` (Lighthouse and Impeccable results), `docs/STATUS.md`.

**Done differently (recorded 20 November 2026):** Edge runs in Playwright beside Chrome; Firefox and Safari need browser downloads and are checked by hand at release (phase 4). The site URL in the head tags, robots.txt and sitemap.xml is assumed to be `https://strata-hub.netlify.app` until phase 4 decides the host. The 3D now loads after the first scroll has settled, which brought LCP from about 3.0 s to 1.4 to 1.6 s. The person approved the Impeccable critique fixes and design calls N2 and N6; the stills are rendered from the model again (`npm run stills`).

**Could break:** the Content Security Policy can block GSAP or Three.js if they inject styles; fixes from the critique can move away from DESIGN.md (they must not, without the person).

**Success criteria**

- [x] The page has a unique title and description, Open Graph tags, `robots.txt` and `sitemap.xml`.
- [x] Lighthouse mobile: LCP under 2.5 s (acceptance test 2) and accessibility 95 or more (acceptance test 3); results saved in `docs/log/`.
- [x] JavaScript and the model together under 600 KB compressed, shown from the build output.
- [x] Cumulative Layout Shift under 0.1.
- [x] The Content Security Policy is in place and the page shows zero console errors in Chrome, Edge and Firefox, and in Safari where available (SPEC 12).
- [x] The Impeccable critique is saved in `docs/log/`, with each finding fixed or listed for the person.
- [x] `npm run check` passes.

## Phase 4: Deployment & Documentation

**Delivers:** SPEC 10 (static hosting), 13 (results recorded per release); RUNBOOK.md deploy and rollback; README.md and CHANGELOG.md.

**Order of the work**

1. Tests first: a check that `npm run build` finishes with no errors or warnings and that `dist/` holds the page, assets, `robots.txt` and `sitemap.xml`.
2. `docs/DEPLOY.md`: a step-by-step guide for Netlify (and the Vercel differences), including the custom domain step. The person deploys; the agent never does (PROCESS: Releasing).
3. RUNBOOK.md: the deploy and rollback commands, health check (the page loads and shows its `h1`), and the rollback rehearsal line for the person to fill in.
4. README.md, STATUS.md and CHANGELOG.md for the finished build; a final report against the four acceptance tests.

**Files:** `docs/DEPLOY.md`, `docs/RUNBOOK.md`, `README.md`, `CHANGELOG.md`, `docs/STATUS.md`, `e2e/build.spec.ts` or `scripts/check-build.ts`, `docs/log/`.

**Could break:** nothing in the page; the guide could go stale if the host changes its screens.

**Success criteria**

- [ ] `npm run build` finishes with no errors and no warnings.
- [ ] `dist/` holds the page, assets, `robots.txt` and `sitemap.xml`, and works when served from a plain static server (checked in the browser with `npm run preview`).
- [ ] DEPLOY.md and RUNBOOK.md give deploy, custom domain and rollback steps the person can follow without help.
- [ ] Every box in this plan is ticked or explained, and the final report gives each acceptance test as met, not met or measured later.
- [ ] `npm run check` passes.

## Parallel work

None of the phases can run fully in parallel: each builds on the page from the one before. Phase 4's deployment guide (DEPLOY.md) could be written in parallel with phase 3, but its build checks need phase 3's final build, so it is planned in order.

## How each success measure is proved

| Acceptance test (SPEC 2 and INTENT) | Proved by |
|---|---|
| 1. At least 4% of visitors register | Not measurable in the pilot: nothing is sent (A4). Proved instead that the form can be completed and confirmed (phase 2 criterion 3); the 4% is measured only once a form service is approved. |
| 2. LCP under 2.5 s on a mid-range phone | Phase 3, Lighthouse mobile criterion |
| 3. Lighthouse accessibility 95 or more, no AA failures | Phase 2 axe criterion and phase 3 Lighthouse criterion |
| 4. 50 frames per second in the 3D section | Phase 2 [2b] speed criterion, or the person's decision under rule 8 |

## Where each business rule is enforced

| Rule (SPEC 7) | Phase and part |
|---|---|
| 1. Procedural model, no copied assets | Phase 2 [2b] `hub.ts`, criterion "built from shapes only" |
| 2. Content never depends on 3D or JavaScript | Phase 1 HTML and no-JS test; phase 2 fallback criterion |
| 3. Email and one optional choice only | Phase 1 form structure criterion |
| 4. Nothing sent without consent; nothing sent in the pilot | Phase 2 `form.ts`, no-network criterion |
| 5. No sound unless the visitor starts it | No sound in the build; phase 2 checks no `<audio>` or `<video autoplay>` |
| 6. No third-party script, tracker or cookie | Phase 2 self-hosted fonts and own-domain criterion; phase 3 Content Security Policy |
| 7. Prices and claims change only with approval | Phase 1 CONTENT.md approval criterion |
| 8. Stop and ask if the 3D is too slow | Phase 2 [2b] speed criterion |

## Open questions

The spec has two. Neither blocks a phase:

- The name "Strata": the build uses it; changing it later is a text change in `content.ts`.
- When the full copy is approved: phase 1 drafts it in CONTENT.md and asks for approval there (phase 1 criterion 3).

## Not for now (kept out)

Online checkout, user accounts, a CMS, sending the form to a real service, analytics and cookies. No phase adds them.

## Options not chosen

- **One HTML page with all copy written in HTML only**, instead of `content.ts` plus HTML: rejected because CONTENT.md and tests read the copy from one typed source; the HTML still carries the text so it works without JavaScript.
- **A pre-built 3D model file (glTF)** instead of a procedural model: rejected by rule 1 and the 20,000-triangle budget; a procedural model is smaller and needs no asset pipeline.
- **OrbitControls** so visitors can turn the model: rejected because DESIGN.md 6 calls for a scripted, scroll-driven camera.
- **CSS scroll-driven animations** instead of GSAP: rejected because the stack names GSAP ScrollTrigger and Safari support for scroll timelines is uneven.
- **A form service now** (Netlify Forms, Formspree): rejected by A4 and rule 6 for the pilot.
- **Loading fonts from Google Fonts**: rejected by rule 6; `@fontsource` packages bundle them.

## Choices for the person to review

1. **Split phase 2 into 2a and 2b** (suggested change 1): the biggest choice in this plan.
2. **Impeccable critique in phase 3** (suggested change 2).
3. **Interim SVG stills in phase 2a**, replaced by renders of the model in 2b.
4. **`@fontsource` packages** for self-hosted fonts.
5. **Acceptance test 1 (4%) is measured later**, not in the pilot, because nothing is sent.
6. **The frame-rate check uses Playwright's phone profile with 4x CPU slowdown**, an approximation of a mid-range phone; a check on a real phone is better if you have one.
7. **Netlify first in DEPLOY.md**, with the Vercel differences listed.
8. **`npm run check` includes Playwright** (added in Step 1, beyond the PROCESS.md list): the PROCESS.md line "runs format, lint, types and tests (vitest)" should mention it, which I will update in phase 1 with your agreement.
