# Phase 1 verifier report (19 November 2026)

**Verdict: ready.** All six phase 1 success criteria are met. Tests came first and check real behaviour. Nothing outside the phase changed.

Checked: branch `phase-1-sitemap-content-structure` at commit 9fd82fc, against `main` (28810ff, the foundation). Followed `.claude/agents/verifier.md`. This check ran in a fresh session that did not write the code. It changed no file except this report.

## `npm run check`

Exit code 0, in one run. Playwright did not crash, so no second run was needed.

- Prettier: "All matched files use Prettier code style!"
- ESLint: no findings.
- tsc: no errors.
- Vitest: 2 files, 15 of 15 tests passed.
- Playwright: 5 of 5 passed (1 worker, against the production build):
  - JavaScript off: every heading, story, spec, price and FAQ question is readable
  - JavaScript on: the JavaScript-off notice is removed
  - The page at 375, 768 and 1280 px: no sideways scroll, no console errors, no AA failures

## Success criteria

1. **Met.** Structure test: sections in the SPEC 5 order, one `h1`, no skipped levels. Evidence: `web/structure.test.ts`, tests "has the sections in the SPEC 5 order" and "has one h1 and no skipped heading levels", both pass. The order checked is top, inside, lights, climate, security, energy, reassemble, bundles, register, faq, then a `footer`.
2. **Met.** With JavaScript off, Playwright finds every module name, story, spec, bundle price and FAQ question (rule 2). Evidence: `e2e/no-js.spec.ts:7`, which passes. It runs with `javaScriptEnabled: false` and reads every value from `content.ts`: module headings, stories, spec labels and values, prices, the 6 FAQ summaries and questions, the footer and the notice.
3. **Met.** `docs/CONTENT.md` lists all the copy, and the person approved it. Evidence: line 3 of CONTENT.md reads "Status: Approved by Anand Bakshi on 19 November 2026". The approval is commit 6e55152. `content.status` is `"approved"`. The test "is approved by the person, in content.ts and CONTENT.md (rule 7)" checks that every string on the page, prices included, is still in CONTENT.md.
4. **Met.** The form has the three SPEC 6 fields, each with a visible label, and no others (rule 3). Evidence: the structure test "has exactly three fields" expects exactly `input:email:email`, `select::module` and `input:checkbox:consent`. "gives every field a visible label" and "offers the five module choices" also pass. See also `web/index.html:182-197`.
5. **Met.** The footer says Strata is a fictional product. Evidence: `web/index.html:251-254` reads "Strata is a fictional product made for a design pilot." The structure test checks the `footer` holds `content.footer`, and the JavaScript-off Playwright test checks it is visible.
6. **Met.** `npm run check` passes. Evidence: the run above, exit code 0.

## Tests first, and testing real behaviour

- **Order:** the tests and the code share commit 971c964, so git can't show which came first. The evidence is the build note `docs/log/2026-11-19-phase-1.md`. It records a first run against a stub, where 10 of 12 structure tests failed for the expected reasons. It says the one-`h1` and labels tests passed, and that the JavaScript-off browser test failed on the missing notice. I accept this as the evidence the brief asks for; it can't be confirmed from the history alone.
- **None skipped or focused:** I searched `web/` and `e2e/` for `.skip`, `.only`, `.todo`, `.fixme`, `xit`, `xdescribe` and `test.fail`. There are none.
- **None empty or always passing:** every test asserts against the real `web/index.html` (parsed with JSDOM) or the built page. Values come from `content.ts`, and some lists are matched exactly (section order, field list, options, bundle prices).
- **Minor, not blocking:**
  - The heading test checks only that each heading goes down at most one level from the one before. It doesn't check that the first heading is the `h1`. The page meets this anyway; the `h1` comes first.
  - The JavaScript-off test checks FAQ questions but not the answers. The answers sit inside closed `<details>` elements, which open without JavaScript. Criterion 2 asks only for questions. The structure test confirms all six answers are in the HTML.

## Scope

- **Changed files** (`git diff main...phase-1-sitemap-content-structure`): 16 files. Each is either in the phase 1 file list or in the "Added while building" list:
  - Planned: `web/index.html`, `web/content.ts`, `web/structure.test.ts`, `e2e/no-js.spec.ts`, `docs/CONTENT.md`, `docs/STATUS.md`, `docs/log/`
  - Added while building: `web/main.ts`, `web/styles/base.css` (skip link only), `playwright.config.ts`, `e2e/smoke.spec.ts` (new heading only), `docs/PROCESS.md` (check line only), `README.md`
  - The phase also adds `docs/PLAN.md`, written in Step 2 and approved.
- **No later-phase work:** `package.json`, the lock file, `web/form.ts` and `web/scene/` are unchanged. The form has no behaviour, and its button is `type="button"`. There is no section CSS, no fonts, no 3D and no motion.
- **Nothing from "Not for now":** no checkout, accounts, CMS, analytics or cookies. The form has no `action` and sends nothing. The only script is the site's own `main.ts`.

## Notes for the person

- This report has no blockers.
- The two minor test notes above could be tightened in a later phase if wanted.
