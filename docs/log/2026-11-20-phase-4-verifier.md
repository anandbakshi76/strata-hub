# Phase 4 verifier report (20 November 2026)

Phase 4 (Deployment & Documentation) of `docs/PLAN.md`, branch `phase-4-deployment-documentation` at a76f936, compared with `main` (ecc6e4c). Checked as `.claude/agents/verifier.md` says.

## Verdict: ready

All five phase 4 criteria are met. `npm run check` passes and `npm run build` prints no warning on either stream. The review's Blocker and four Should fix items are fixed. The final report matches the evidence. Nothing in the diff deploys, and nothing outside the phase changed. Phase 4 is the last phase, so the whole plan was checked too: every box is ticked except phase 3's Firefox box, which is explained. There are three small notes below. None of them blocks the merge.

## Phase 4 criteria

| Criterion | Result | Evidence |
|---|---|---|
| `npm run build` finishes with no errors and no warnings | Met | My `npm run build`: exit 0, stderr 0 bytes, stdout ends "✓ built in 278ms". No `(!)`, `warning` or `error` on either stream. Guarded by `web/release.test.ts` "finishes with no errors and no warnings", which now reads stdout and stderr (see Review fixes). |
| `dist/` holds the page, assets, `robots.txt` and `sitemap.xml`, and works from a plain static server | Met | Build output: `index.html`, `og-image.png`, `robots.txt`, `sitemap.xml`, and `assets/` with `.js`, `.css`, `.webp`, `.woff2`, `.woff`. Tested by `release.test.ts` "holds the page, its assets, …". All 63 Playwright tests run against `dist/` served by `vite preview`, and all pass. |
| DEPLOY.md and RUNBOOK.md give deploy, custom domain and rollback steps the person can follow without help | Met | I read them as someone who has never used Netlify. Deploy: account, import from GitHub, the repository name (matches `origin`), fields read from `netlify.toml`, renaming the site, and the three files to change if the address differs. Custom domain: CNAME for a subdomain, A record or Netlify DNS for a bare domain, the wait, the HTTPS check, setting the primary domain. Roll back: Netlify **Publish deploy** and how to resume auto publishing, the GitHub **Revert** button, and the command-line steps with `git revert -m 1`. **Rehearse a rollback** works right after the first deploy. After-deploy checks give `curl.exe` and `curl`, plus a browser route. RUNBOOK points to each of these. Structure tested by `release.test.ts` (DEPLOY headings, RUNBOOK has nothing left to fill in except the rehearsal line). |
| Every box in the plan is ticked or explained; the final report gives each acceptance test as met, not met or measured later | Met | `docs/PLAN.md`: all boxes in phases 1, 2a/2b, 3 and 4 are ticked except phase 3's "zero console errors in Chrome, Edge and Firefox…". It carries its explanation: Firefox was deferred by the person on 20 November 2026, and Safari isn't available. The final report ("Every plan box") explains it, and `docs/DEPLOY.md`, After you deploy, step 2 now holds the Firefox and Safari check for the person. The final report's table gives test 1 as Measured later and tests 2, 3 and 4 as Met (2 and 4 marked "simulated"). Tested by `release.test.ts` "the final report gives each acceptance test…". |
| `npm run check` passes | Met | Run in the foreground, exit 0 (output below). |

## `npm run check` (this session, a76f936)

```
> prettier --check .          All matched files use Prettier code style!
> eslint .                    (no output)
> tsc --noEmit                (no output)
> vitest run                  Test Files  5 passed (5)   Tests  29 passed (29)
> playwright test             63 passed (1.8m)
EXIT=0
```

Playwright ran once, with no crash (no exit code 134), so it didn't need a second run. `npm run build`: exit 0, empty stderr, no warning lines in stdout. `git status` was clean afterwards, apart from this report.

## Tests first, and tests that test real behaviour

- **Tests came first:** 22feb5c adds `web/release.test.ts` and `docs/log/2026-11-20-phase-4-first-run.txt` and nothing else. The netlify.toml, DEPLOY, RUNBOOK, CHANGELOG and final report came later, in c899a9c. The first run shows "Tests 5 failed | 2 passed (7)". The 5 failures have the expected causes: missing files, and the RUNBOOK still "(to be filled in". The 2 build tests passed because the build was already clean.
- **No skipped, focused or empty tests:** `release.test.ts` has no `.skip`, `.only` or `todo`. Every test makes real assertions on the build output or the file contents. The Vitest count went from 22 to 29.
- **The warning test can now fail (B1 proof):** `2026-11-20-phase-4-build-warning-proof.txt` is a short summary, not the test's own failure output. It says: exit 0, the warning only in stderr, the old check (stdout only) false, the fixed check (stdout and stderr) true. That is enough to show the logic, and I reproduced it myself. I used a scratch config outside the repo that extends `vite.config.ts` with `chunkSizeWarningLimit: 10`. I ran the same `spawnSync` call as the test and applied its regex `/\(!\)|warning|error/i`. The result: exit 0, stderr "(!) Some chunks are larger than 10 kB after minification", stdout-only regex false, stdout+stderr regex true. So the fixed test would fail on that build. Four of my five scratch runs printed the warning. The first run printed nothing on either stream, and I can't explain why (see Notes). With the repo's own config, the build has no warning.

## Review fixes (`2026-11-20-phase-4-independent-review.md`)

| Item | Fixed? | Evidence |
|---|---|---|
| B1: the warning check read stdout only | Fixed | `release.test.ts:13-26` uses `spawnSync`, checks `run.status === 0` and runs the regex over `stdout + stderr`. My own reproduction is above. |
| S1: `git revert` of a merge needs `-m 1` | Fixed | DEPLOY.md, Roll back: the GitHub **Revert** button first, then `git switch main`, `git pull`, `git switch -c revert-bad-release`, `git revert -m 1 <the merge commit's id>`, and the push and pull request. RUNBOOK says the same. |
| S2: `curl -I` fails in Windows PowerShell | Fixed | DEPLOY.md After you deploy step 5 and RUNBOOK Health give `curl.exe -I` for Windows, `curl -I` for a Mac, and the browser Network-tab route. |
| S3: no rollback rehearsal steps | Fixed | DEPLOY.md has a new "Rehearse a rollback" section: make a second deploy, publish the first, check it, resume auto publishing, write the date in RUNBOOK. |
| S4: two changelog claims without evidence | Fixed | CHANGELOG.md now says "checked against WCAG 2.2 AA" (not "screen reader friendly") and "about 1.6 seconds in our tests". |

The review's Notes N1 to N7 were optional. N2, N3, N4, N5 and N6 are still open. N5 is listed under Notes below because it is a number in the final report.

## Final report against the evidence

- **Test 1, Measured later:** right. Nothing is sent in the pilot (A4). `e2e/form.spec.ts` passes in this run.
- **Test 2, LCP 1.59 s worst of three, Met (simulated):** matches `docs/log/2026-11-20-lighthouse.json` (1.589, 1.584, 1.586 s; target under 2.5 s; Moto G Power profile).
- **Test 3, accessibility 100 and no AA failures, Met:** the JSON shows accessibility 100 in all three runs. The axe tests at 375, 768 and 1280 px (`e2e/smoke.spec.ts`, Chrome and Edge) and in the error state and open menu (`e2e/review-2a.spec.ts:90`) pass in this run.
- **Test 4, 60 fps and p95 16.8 ms, Met (simulated):** matches `2026-11-20-phase-2b-verifier-2.md` (`"fps":60,"p95FrameMs":16.8`) and STATUS.md. Not measured on a real phone, which the report says.
- **Numbers:** Vitest 29 and Playwright 63 match this run. "JavaScript 177 KB compressed" matches the Playwright budget line ("2, 645 KB raw, 177 KB gzip"). Vite reports 182.6 kB, because it counts 1000 bytes as a kB. Either way it is well under 600 KB.
- **One mismatch (not a criterion):** "performance 97" in the final report and STATUS.md. The JSON gives 99, 98 and 99, so the worst is 98 (review N5, first raised by the phase 3 verifier). Performance isn't an acceptance test, so the results above stand.

## Scope

- **Nothing deploys:** the diff adds no CI workflow, deploy script, Netlify CLI call, token or `.github/` file. `netlify.toml` is passive config that Netlify reads when the person connects the site. DEPLOY.md and RUNBOOK.md leave every deploy, tag push and rollback to the person, as PROCESS.md (Releasing) requires.
- **Nothing outside the phase changed:** `git diff main...phase-4-deployment-documentation` touches 13 files: `CHANGELOG.md`, `README.md`, `docs/DEPLOY.md`, `docs/PLAN.md` (phase 4 Done line and ticks only), `docs/RUNBOOK.md`, `docs/STATUS.md`, `netlify.toml`, `web/release.test.ts`, and five files in `docs/log/` (phase 4 note, first run, review, warning proof, final report). No page, style, script or scene file changed. `netlify.toml` isn't in the plan's file list, but it is recorded in the PLAN "Done" line and needed for SPEC 10 static hosting. `release.test.ts` takes the place of the planned `e2e/build.spec.ts` or `scripts/check-build.ts`, which keeps to what the plan meant.
- **Not for now:** no form service, analytics, cookies, accounts or CMS. Netlify Forms isn't turned on, and the header's `form-action 'none'` blocks form sending anyway.

## Notes (not blocking)

1. **Performance 97 vs 98:** the final report and STATUS.md say 97, and the JSON's worst run is 98 (above).
2. **The first scratch run of the warning proof printed nothing:** one of my five builds with the 10 kB limit had empty stderr and stdout without the warning, so the regex didn't match. The other four printed it every time. That run used a scratch config only. The repo test and config aren't affected, but if it happens to real builds, a warning could slip through once in a while.
3. **Review notes still open:** N2 (no step to save results per release), N3 (tag before or after the live checks), N4 (Netlify's first address is random until step 5), N6 (PLAN's Firefox box doesn't point to DEPLOY.md). The final report and DEPLOY.md cover N6 in substance. The others are for the person to decide.

## Independence

This check ran in a fresh session that did not write the code, the documents or the review. It changed no file apart from adding this report, and it committed nothing, pushed nothing and switched no branch. My scratch config and script were in the session's scratchpad, outside the repo.
