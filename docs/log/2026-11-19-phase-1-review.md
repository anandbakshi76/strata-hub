# Review: phase 1 (19 November 2026)

Branch `phase-1-sitemap-content-structure`, diff against `main` (28810ff). Reviewed against REVIEW.md, the phase in PLAN.md and SPEC 4 to 9. No GitHub remote, so the review used the local branch diff.

**Independence:** the same agent that wrote the code did this review, in the same session. REVIEW.md asks for a fresh session or another person; this review does not meet that, and says so.

**Verdict: ready to merge after the three Should fix items** (fixed in this branch before the merge).

## Findings

| # | Severity | Where | What is wrong | Why it matters | Fix |
|---|----------|-------|---------------|----------------|-----|
| 1 | Should fix | `web/structure.test.ts`, bundles test | It checked each card's name and price, but not which modules each card says are included | A card could say "Energy: included" for Home and no test would catch it; `content.bundles[].includes` was never compared with the page | Added a check of every "Module: included / not included" line against `content.ts` (fixed) |
| 2 | Should fix | `README.md` | Unchanged from the starter: no `check` or `build` commands, and no plain description | PROCESS.md step 5 and REVIEW pass 5 ask for README to match the change | Rewritten with what the page is and how to run, check and build it (fixed) |
| 3 | Should fix | `docs/PLAN.md`, phase 1 Files | The build changed files the plan didn't name (`main.ts`, `base.css`, `playwright.config.ts`, `smoke.spec.ts`, `PROCESS.md`) | PROCESS.md: if the build departs from the plan, update the plan in the same change | Listed under "Added while building" (fixed) |
| 4 | Note | `web/index.html`, `#inside` heading | The `h2` is "Scroll to look inside", an instruction rather than a section name, so screen-reader heading lists read it as a section title | Clearer heading navigation | Consider an `h2` such as "Inside Strata" with the cue as a separate line, in phase 2a |
| 5 | Note | `playwright.config.ts` | `reuseExistingServer: false` fails if port 4173 is already in use | Rare local clash | Leave; the error names the port |

## Passes

1. **Plan and spec:** delivers phase 1's files and criteria; nothing from Not for now; rules 2, 3 and 7 match the spec. Finding 3.
2. **Tests:** written first (first run: 10 of 12 structure tests and the no-JS test failed); none skipped or focused; the count went up from 6 to 20. Finding 1.
3. **Security:** no secrets; the form takes input but has no behaviour yet and its button cannot submit, so nothing leaves the page.
4. **Data and rules:** the form asks only for email, one optional choice and consent (SPEC 6, rule 3); nothing is stored or sent.
5. **Docs:** STATUS.md and the dated note are there. Finding 2.
6. **Traces:** the phase adds no request; the browser records nothing (SPEC 13). The sample trace in `logs/traces/` holds no key and its email is masked as "[email]".

## Criteria evidence

- Structure test passes (sections in order, one `h1`, no skipped levels): `npm run check`, Vitest 15 passed.
- With JavaScript off, every module, story, spec, price and FAQ question is readable: Playwright `no-js.spec.ts` passed.
- CONTENT.md approved: "Approved by Anand Bakshi on 19 November 2026" in CONTENT.md, checked by a test.
- The form has exactly the three fields with labels: structure tests passed.
- The footer says Strata is fictional: structure and no-JS tests passed.
- `npm run check` passes: exit 0 after the fixes (Vitest 15, Playwright 5).
