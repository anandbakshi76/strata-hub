# Phase 2a: verifier report (20 November 2026)

**Verdict: ready.** All five [2a] criteria and "`npm run check` passes" are met. The review's Blocker (B1) and Should fix items (S1 to S4) are fixed, each with a test that failed before the fix. Two small notes, neither blocking, are at the end.

Checked: branch `phase-2a-pages-layout` at 55264ee (the same as pull request 2), against `docs/PLAN.md` phase 2 [2a], `docs/SPEC.md`, `DESIGN.md` and `.claude/agents/verifier.md`.

**Independence:** this ran in a fresh Claude Code session that did not plan, write or commit any of this code. It changed no code; this note is the only file it added. Nothing was committed or pushed.

## `npm run check`

One run, in the foreground. Exit code 0. No browser crash, so no second Playwright run was needed.

```
All matched files use Prettier code style!
> eslint .            (clean)
> tsc --noEmit        (clean)
 Test Files  3 passed (3)
      Tests  16 passed (16)
Running 29 tests using 1 worker
  29 passed (1.0m)
EXIT=0
```

## Criteria

| Criterion (PLAN phase 2 [2a]) | Result | Evidence |
|---|---|---|
| At 375, 768 and 1280 px: no sideways scroll, each section laid out as DESIGN.md 8, with screenshots in the report | Met | `e2e/layout.spec.ts:10` (overflow 0, fonts, colours, sticky header, at all three widths), `:43` (phone Menu), `:57` (desktop: bundles three across, still beside the text), `:73` (phone: bundles stacked), `:136` (one left edge); `e2e/smoke.spec.ts` (three widths). Screenshots in `docs/log/img/` (375, 375 menu, 768, 1280, 1280 chapter); I looked at the 375 and 1280 shots: light hero, dark chapters with spec lists, centred reassemble line, bundle cards stacked on the phone and three across on desktop with Home recommended, one-column form and FAQ, dark footer. The 3D-related layout (hero headline partly behind the hub, full-screen canvas on phones) is phase 2b, as the review's N8 records. |
| The keyboard reaches every link, button, field and FAQ question in order, with a visible focus ring | Met | `e2e/layout.spec.ts:105`: tabs through every visible focusable element, checks the order equals DOM order and that each has an outline of at least 2 px. Runs at 1280 px only; the review probed the phone header order by hand (correct). |
| Empty or invalid email and unticked consent show the SPEC 9 messages next to the fields; a valid submission shows the confirmation; no network request on submit (rule 4) | Met | `e2e/form.spec.ts` (5 tests: exact SPEC 9 messages linked by `aria-describedby`, `aria-invalid`, focus moved, confirmation text, zero requests and URL unchanged); `e2e/review-2a.spec.ts:8` (B1: JavaScript off, Enter sends nothing and keeps the URL); `web/form.ts` sends nothing (no fetch, `preventDefault` on submit). |
| axe finds no WCAG 2.2 AA failures; every text colour pair at least 4.5:1 (DESIGN.md 2) | Met | `e2e/smoke.spec.ts` (axe `wcag2a`, `wcag2aa`, `wcag22aa` at three widths) and `e2e/review-2a.spec.ts:88` (axe on the form's error state and the open phone menu): zero violations. I computed every text pair `site.css` uses: lowest are `--signal` on `--stone-100` 4.75:1 and `--signal` on `--stone-50` 4.96:1; white on `--signal` 5.18:1; `--error` on `--stone-100` 5.93:1; the rest 6.9:1 or more. |
| No request to any domain other than the site's own (rule 6), checked by Playwright | Met | `e2e/layout.spec.ts:14-27`: records every request at three widths and expects none outside `localhost:4173` or `data:`. Fonts come from `@fontsource` packages bundled by Vite (`web/main.ts`). |
| `npm run check` passes | Met | Output above, exit 0. |

## Tests first

- **Phase tests:** commit 52f7ec6 holds only `e2e/form.spec.ts`, `e2e/layout.spec.ts` and the first-run log, before any page code (cf36320). The log shows 11 failed, 3 passed, each failure for the expected reason (missing styles, form behaviour, Menu, stills). The phase note explains the three that passed on the unstyled page.
- **Review tests:** commit a982fe1 holds only `e2e/review-2a.spec.ts`, `web/styles.test.ts`, the review and its first-run log, before the fixes (55264ee). The log shows 7 failed (B1, S1 to S4, N1, N6) and 2 passed (the N4 regression guards, which the review expected to pass). The log has no Vitest output, so the eighth failure (`web/styles.test.ts`) isn't recorded; I confirmed it would fail at a982fe1, whose `site.css` still had eight raw colours (`#fff`, `rgb(...)`).
- **No weakening:** after 52f7ec6 the only test change in the page commit is one added test (shared left edge); 55264ee changes no test at all.
- **Real behaviour:** no `.skip`, `.only`, `.fixme`, `.todo` or `expect(true)` anywhere in `e2e/` or `web/`. Every test asserts on the rendered page, computed styles, requests or the stylesheet source; each new test failed before its code existed except the guards noted above.

## Review fixes

| Finding | Fixed? | Test |
|---|---|---|
| B1: with JavaScript off, Enter sent the email in a URL | Fixed: fields sit in `<fieldset disabled>` (`web/index.html:211`), enabled by `setUpForm` (`web/form.ts`); submit also calls `preventDefault` | `e2e/review-2a.spec.ts:8` (failed before with `?email=sam%40example.com` in the URL; passes now) |
| S1: header button didn't focus the email field | Fixed: `web/main.ts` focuses `#email` on click of any `a[href="#register"]` | `e2e/review-2a.spec.ts:24` |
| S2: glass effect on the header | Fixed: no `backdrop-filter` | `e2e/review-2a.spec.ts:33` |
| S3: raw colours; chapter names white | Fixed: new tokens `--white`, `--header-bg`, `--hairline-dark` in `tokens.css` (values from DESIGN.md 2, 4 and 5); chapter names `--stone-200` | `web/styles.test.ts` (no raw colours in `site.css` or `base.css`), `e2e/review-2a.spec.ts:41` |
| S4: form errors had no icon | Fixed: inline outline alert SVG, `aria-hidden="true"`, in each error | `e2e/review-2a.spec.ts:47` |

Notes also fixed with tests: N1 (`:57`), N6 (`:68`), N4 (`:81`, `:88`), N5 (screenshots in `docs/log/img/`). N2 and N3 are left for the person, N8 for phase 2b, as the phase note says.

## Scope

- `git diff main...phase-2a-pages-layout` (main at 513c984) touches 25 files, all named in PLAN phase 2's file list or recorded in the phase note: `web/styles/*.css`, `web/main.ts`, `web/form.ts`, `web/menu.ts`, `web/index.html`, `web/assets/stills/`, `e2e/layout.spec.ts`, `e2e/form.spec.ts`, `e2e/review-2a.spec.ts`, `web/styles.test.ts`, `package.json` and lock (the three `@fontsource` packages only), `docs/PLAN.md` (2a boxes ticked), `docs/STATUS.md`, `docs/log/`. No `docs/INTENT.md`, config or guard change.
- Nothing from 2b: no `web/scene/`, no Three.js or GSAP code added.
- Nothing from SPEC/PLAN "Not for now": no checkout, accounts, CMS, form service, analytics or cookies. No `fetch`, `XMLHttpRequest`, `sendBeacon`, cookie or storage use, and no outside URL in the page code (the only `https://` lines are npm registry entries in `package-lock.json` and the SVG namespace).

## Notes (not blocking)

1. `docs/STATUS.md` still says "Vitest (15 tests)" and "Playwright (20 tests)"; after the review fixes it is 16 and 29. A one-line update to make in this pull request.
2. The review tests' first-run log (`2026-11-20-phase-2a-review-tests-first-run.txt`) has only Playwright output, so the Vitest failure behind "8 fail" isn't on record (confirmed by reading the old stylesheet above). Worth saving the whole `npm run check` output next time.
