# Independent review: phase 1 (19 November 2026)

Branch `phase-1-sitemap-content-structure` at 5aca2d7 (same as `origin/phase-1-sitemap-content-structure`), diff `git diff main...phase-1-sitemap-content-structure` against `main` at 28810ff. Reviewed against `REVIEW.md`, phase 1 of `docs/PLAN.md`, `docs/SPEC.md` sections 4 to 9 and 13, `DESIGN.md` and the `brand` skill.

**Independence:** this review ran in a fresh Claude Code session that did not write the code, the plan or the earlier self-review. It changed no code and no existing file. It only wrote this file.

## Verdict

**Fix first.** There are no Blockers. `npm run check` passes and every phase 1 criterion is met in substance. Five Should fix items remain. Under `REVIEW.md` these are fixed in this pull request unless the person agrees to a follow-up. S1 and S5 matter most: S1 is a test that claims more than it checks, and S5 is a stray remote branch that would replace the README if the pull request came from it.

## Findings

No Blockers.

| # | Severity | Where | What is wrong | Why it matters | Suggested fix |
|---|----------|-------|---------------|----------------|---------------|
| S1 | Should fix | `e2e/no-js.spec.ts:6-18` | The test's title and PLAN criterion 2 say that with JavaScript off, Playwright finds "every module name, story, spec, bundle price and FAQ question". The test only checks the four module headings, the three prices, the number of `<summary>` elements (6) and the footer note. It never checks a story, a spec or the text of a FAQ question. | Rule 2 is about content reading in a real browser with scripting off. The jsdom test in `web/structure.test.ts` covers the text of the static HTML, but the criterion names Playwright. A test whose name claims more than it checks gives false confidence, and the self-review counted it as full evidence. | Import `content` from `../web/content` in the spec. Loop over `content.modules` (name, story, each spec label and value) and `content.faq` (question), and use `expect(body).toContainText(...)` for each. Keep the title as it is. |
| S2 | Should fix | `docs/STATUS.md:3` | Says the page has every section "with its draft copy". The copy was approved in 6e55152 (`content.ts` `status: "approved"`, `CONTENT.md` Status line). | REVIEW pass 5: STATUS.md must match the change. | Change it to "with its approved copy". |
| S3 | Should fix | `docs/log/2026-11-19-phase-1.md:7` and `:21-23` | The dated note says `content.ts` has `status: "draft"` and lists "The copy is not approved yet" under Not done. Both are stale after the approval commit. It also says `CONTENT.md` "is generated from" `content.ts`, but there is no generator script: the file is written by hand. | The log is the record of what was built and decided. Stale lines there mislead the next phase. | Add a line saying the content was approved on 19 November 2026 (6e55152), and replace "generated from" with "written from". |
| S4 | Should fix | `docs/log/2026-11-19-phase-1.md:23` (and AGENTS.md "Checking a phase") | The note says the verifier subagent "was not started as a separate agent". AGENTS.md and PROCESS.md require the verifier's verdict at the top of the phase report. | A required gate was skipped. This independent review covers the same ground but does not replace the step the process names. | Run `.claude/agents/verifier.md` on the branch and add its verdict to the report or the log. Or the person records in the pull request that they accept this review in its place. |
| S5 | Should fix | Remote branch `origin/Phase-1-sitemap,-content-and-structure`, commit 44c9588, `README.md` | A second remote branch exists alongside `phase-1-sitemap-content-structure`. It has one extra commit, made on GitHub, that replaces README.md with pull request description text: the title becomes "Phase 1: sitemap, content and structure", the run, check and build instructions are gone, and it says the copy is "(draft)" and "criterion 3 stays open". I could not see which branch the pull request is opened from (`gh` is not installed here). | If the pull request's head is that branch, merging it puts a stale pull request description in place of the README. That fails REVIEW pass 5, and the README would no longer say how to run the site. | Check that the pull request's head is `phase-1-sitemap-content-structure` at 5aca2d7. Put that text in the pull request description, not in README.md. Then delete the stray branch on GitHub, or revert 44c9588 on it. |
| N1 | Note | `web/structure.test.ts:111-115` | The rule 7 test checks only the Status line of `docs/CONTENT.md`, not that its text matches `content.ts`. I checked all 44 strings by script (hero, cue, reassemble, register, privacy, footer, every story, spec, price, FAQ question and answer): all match today. | The person approved the CONTENT.md text. If the two files drift, the page could show words nobody approved. Prices are already pinned by the test at `:74-78`. | In the same test, assert that CONTENT.md contains each story, spec, price and FAQ entry from `content.ts`. |
| N2 | Note | `docs/CONTENT.md:5` | The line "To approve: reply with 'content approved'... Then `status` ... becomes 'approved'" is left over from before the approval. | Small doc noise. | Remove it, or put it in the past tense. |
| N3 | Note | `web/index.html:38` | The `h2` "Scroll to look inside" is an instruction, not a section name, so screen-reader heading lists read it as a title. **Agree** with self-review finding 4. | Heading navigation reads more clearly with a section name. | In phase 2a, use a name such as "Inside Strata" as the `h2` and put the cue in its own line. |
| N4 | Note | `web/index.html:146,158,170` | The Home card has the primary button and the other two cards have `secondary`, but Home has no "Recommended" label. DESIGN.md 5 marks that label "Assumed: confirm". DESIGN.md 5 also allows only one primary button per screen. | The visual emphasis has been decided in markup before the person has confirmed the label. | Raise it with the person in phase 2a: confirm "Recommended" and the one-primary-button rule for the bundles screen. |
| N5 | Note | `playwright.config.ts:11-12` | `reuseExistingServer: false` with `--strictPort` makes `npm run check` fail if port 4173 is already in use, and every check now runs a full build. **Agree** with self-review finding 5. | Rare local clash, and a slightly slower check. | Leave it as it is. The error names the port. |
| N6 | Note | `web/index.html:180,202`, `web/main.ts:6` | With JavaScript on, the "Turn on JavaScript" notice is removed but the Register interest button (`type="button"`) does nothing. It is a dead control until phase 2a. With JavaScript off it correctly can never submit. | Fine for an unreleased phase, but phase 1 should not be deployed on its own. | No change. Make sure phase 2a lands before any release. |
| N7 | Note | Commit 971c964 | Tests and code arrived in one commit, so git cannot show that the tests came first. The only evidence is the log's account of the first run (10 of 12 structure tests and the no-JS test failing). | REVIEW pass 2 asks that tests were written first. | Accepted on the log's account. In later phases, commit the failing tests first, or paste the failing output into the log. |
| N8 | Note | `docs/PLAN.md`, `docs/PROCESS.md:7` | This pull request is the first time the approved PLAN.md, and the PROCESS.md check line (plan choice 8), reach `main`. | The person should know that merging phase 1 also lands the plan and the process change. | No change. Mention it in the pull request description. |

## The six passes

1. **Plan and spec.** The diff delivers phase 1's named files, plus the files listed under "Added while building", which the plan records as required. Nothing from Not for now. Checked against SPEC:
   - The section order matches SPEC 5: hero, look inside, the four chapters, reassemble, bundles, register, FAQ, footer.
   - The header has Modules, Bundles, FAQ and Register interest (SPEC 8).
   - Each story is 40 words or fewer: 24, 20, 24 and 17 (SPEC 8).
   - Each module has 3 specs (SPEC 4.3).
   - The bundles match A6: Starter $199 with lights; Home $349 with lights, climate and security; Complete $499 with all four.
   - The six FAQ entries are `<details>` (SPEC 4.6, 5).
   - The form has exactly email, the five module choices and consent (SPEC 6, rule 3).
   - The privacy note and the no-JavaScript text use the exact SPEC 9 and 10 wording.
   - The footer note and Back to top match SPEC 5.8.
   - No sound or media (rule 5), and no third-party request (rule 6).

   Findings: S1, N4, N8.
2. **Tests.** 15 Vitest tests (3 telemetry, 12 structure) and 5 Playwright tests, up from 3 and 3 on `main`. None is skipped, focused, empty or always passing. Each one checks real HTML or real browser behaviour. Findings: S1, N1, N7.
3. **Security.** No secrets in the diff. The only input from outside is the form. It has no behaviour yet, its button is `type="button"`, and the form has no `action`, so nothing can leave the page. No sign-in or roles (SPEC 3). No external scripts or styles: the favicon is an inline data URI.
4. **Data and rules.** Personal data (the email) is only collected by a field and is not stored, sent or logged (SPEC 6, rule 4). The form asks for no more than an email and one optional choice (rule 3). The approved prices are pinned by a test (rule 7). TECH_STACK.md names no other place for rules, so their place is the page and its tests.
5. **Docs.** README.md on this branch is correct. PLAN.md's phase 1 boxes are ticked, and the dated note and self-review are present. RUNBOOK.md is unchanged, which is right because deployment did not change. Findings: S2, S3, S5, N2.
6. **Traces.** The phase adds no request: the site is static and the browser records nothing (SPEC 13, approved at Step 1). `trace()` returns `fn()` with nothing exported when not in Node (`web/telemetry.ts:30`). The one traced call, `page.render` in `web/main.ts:12`, has a span in the test run.

   I opened the sample trace that this check run wrote to `%TEMP%/strata-traces-arRfsY/*.jsonl`:
   - `page.render` has a 32-hex `trace_id`, status `ok` and empty attributes.
   - `mask.check` holds only `[email] +[card][phone] [key]`.
   - `content.check` holds only `content.size` and `content.sha256`.

   No key, personal data or request text appears, and LOG_CONTENT is off. The file in `logs/traces/` is the earlier foundation trace (`foundation.check`, its email masked). No trace is missing.

## Phase 1 criteria and evidence

| Criterion (PLAN phase 1) | Met? | Evidence |
|---|---|---|
| The structure test passes: sections in the SPEC 5 order, one `h1`, no skipped heading levels | Yes | `web/structure.test.ts:10-38`. Vitest: 15 passed in this session's `npm run check`. Read by hand: one `h1` (`index.html:29`), then h2, h3 ×4, h2, h3 ×3, h2, h2. |
| With JavaScript disabled, Playwright finds every module name, story, spec, bundle price and FAQ question (rule 2) | Yes in substance, with a weak test | Playwright `no-js.spec.ts:6` passed. The stories, specs and FAQ question text are in the static HTML (`index.html:40-126, 212-247`), and jsdom checks them in `structure.test.ts:59-99`. The Playwright test itself does not check stories, specs or question text (S1). |
| `docs/CONTENT.md` lists all copy, and the person has approved it or marked changes (rule 7) | Yes | `CONTENT.md:3` "Status: Approved by Anand Bakshi on 19 November 2026". `content.ts:29` `status: "approved"`, checked by `structure.test.ts:111`. All 44 strings in `content.ts` appear in CONTENT.md (checked by script in this review). |
| The form has the three fields from SPEC 6, each with a visible label, and no other fields (rule 3) | Yes | `index.html:181-200`. `structure.test.ts:121-138` checks exactly `input:email`, `select:module` and `input:checkbox:consent`, a `label[for]` on each, and the five choices. |
| The footer says Strata is a fictional product | Yes | `index.html:252`. `structure.test.ts:108` and `no-js.spec.ts:17`. |
| `npm run check` passes | Yes | Run in this session on 5aca2d7. Output below. |

## `npm run check` (this session, branch at 5aca2d7)

```
> npm run format:check && npm run lint && npm run types && npm run test && npm run test:e2e
All matched files use Prettier code style!
(eslint: no output)  (tsc --noEmit: no output)
 Test Files  2 passed (2)
      Tests  15 passed (15)
Running 5 tests using 2 workers
  ok 1 e2e\no-js.spec.ts:6:1 › with JavaScript off, every heading, story, spec, price and FAQ question is readable
  ok 3 e2e\no-js.spec.ts:23:3 › with JavaScript on › the JavaScript-off notice is removed
  ok 2 e2e\smoke.spec.ts:5:3 › the page loads at 375px with no sideways scroll, no console errors and no AA failures
  ok 4 e2e\smoke.spec.ts:5:3 › the page loads at 768px ...
  ok 5 e2e\smoke.spec.ts:5:3 › the page loads at 1280px ...
  5 passed (14.9s)
EXIT=0
```

## Where this review agrees or disagrees with the self-review

- **Agree:** findings 1 to 3 (the bundle module check, the README and the plan's file list) were real, and all three are fixed on this branch. Findings 4 and 5 are carried here as N3 and N5.
- **Disagree:** the self-review's criteria evidence says the no-JS Playwright test shows "every module, story, spec, price and FAQ question is readable". It does not check stories, specs or question text (S1).
- **Disagree:** the self-review says "No GitHub remote". There is one now, and it carries a stray second phase 1 branch that rewrites the README (S5).
- **Missed by the self-review:** the stale "draft" wording in STATUS.md and the dated note (S2, S3), the skipped verifier step (S4), and that nothing checks CONTENT.md against `content.ts` (N1).
- **Its own independence line was honest:** it said it did not meet REVIEW.md's fresh-session rule. This review is the independent one.

## Not checked

- I did not open the page in a browser by hand. Phase 1 is unstyled structure, and the Playwright runs at three widths, with JavaScript on and off and with axe, passed.
- I could not see the pull request's head branch on GitHub, because the `gh` CLI is not installed here (S5).
