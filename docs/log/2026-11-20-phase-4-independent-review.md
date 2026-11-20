# Phase 4 independent review (20 November 2026)

Pull request 5, `phase-4-deployment-documentation` (c899a9c) into `main` (ecc6e4c). Reviewed against `REVIEW.md`, phase 4 of `docs/PLAN.md`, `docs/SPEC.md` and `docs/PROCESS.md` (Releasing and rolling back).

**Independence:** this review ran in a fresh session that did not write the code or the documents. It changed no code and no existing file; this report is the only new file.

## Verdict: fix first

One Blocker: the test for "no warnings" can never fail, because Vite prints its warnings to stderr and the test reads only stdout. The build is clean today (checked below), so the fix is small. Everything else is sound: the headers in `netlify.toml` match the page's Content Security Policy, nothing in the diff deploys, `npm run check` passes, and the final report agrees with the evidence in `docs/log/`. There are four Should fix findings in the deployment guide and the changelog.

## `npm run check`

Run in the foreground on c899a9c, exit code 0:

- Prettier: "All matched files use Prettier code style!"
- ESLint and tsc: no output, no errors
- Vitest: "Test Files 5 passed (5)", "Tests 29 passed (29)" (main had 22, so the count went up by the 7 new tests)
- Playwright: "63 passed (1.9m)", no crash, no retry needed

`git status` was clean afterwards.

## Findings

### Blocker

**B1. The "no warnings" check reads stdout only, and Vite writes warnings to stderr** (`web/release.test.ts:14-21`)

- What is wrong: `execFileSync(..., { stdio: ["ignore", "pipe", "pipe"] })` returns stdout only. The test then checks that this stdout has no `(!)`, `warning` or `error`. Vite 8 prints its build warnings through its logger to stderr. I proved this with a scratch config that extends `vite.config.ts` and sets `chunkSizeWarningLimit: 10`: the build exited 0, stderr held "(!) Some chunks are larger than 10 kB after minification", and stdout held no warning lines. Under that build the test would still pass.
- Why it matters: PLAN phase 4 criterion 1 is "finishes with no errors and no warnings". The errors part is covered (a failed build exits non-zero and `execFileSync` throws). The warnings part has a test that always passes. REVIEW.md pass 2 bans always-passing tests and counts a criterion with no test as a Blocker. The phase note says the two build tests passed at the first run. Seeing a test fail first would have caught this.
- Today's build: a normal `vite build` exits 0 with 0 bytes of stderr, so the criterion is met. It just isn't guarded.
- Suggested fix: use `spawnSync` (or `execFileSync` with `stdio: "pipe"` inside try/catch) and check `stdout + stderr`. Prove it once by making it fail on purpose, for example with a temporary low `chunkSizeWarningLimit`, and save that output in `docs/log/`.

### Should fix

**S1. `git revert` of a merge commit fails without `-m 1`** (`docs/DEPLOY.md:44`, `docs/RUNBOOK.md` Roll back)

- What is wrong: "`git revert` the bad merge on a branch" gives no command. Pull requests here are merged with merge commits (for example ecc6e4c, "Merge pull request #4"). A plain `git revert <sha>` on a merge commit stops with "is a merge but no -m option was given".
- Why it matters: this is the fallback rollback for someone who has never done one, and they would hit it during an incident.
- Suggested fix: give the exact steps: `git switch -c revert-<tag> main`, `git revert -m 1 <merge sha>`, then push and merge the pull request. Or say: use the **Revert** button on the merged pull request in GitHub.

**S2. `curl -I` doesn't work as written in Windows PowerShell** (`docs/DEPLOY.md:54`, `docs/RUNBOOK.md` Health)

- What is wrong: in Windows PowerShell 5.1, `curl` is an alias for `Invoke-WebRequest`, and `-I` is not a parameter it takes, so the command fails.
- Why it matters: PROCESS.md says everything must work on Windows and Mac. This is the only check that the security headers reached the live site. The person works on Windows.
- Suggested fix: write `curl.exe -I <address>` (curl.exe ships with Windows 10 and 11) and `curl -I <address>` on Mac. Or describe the check in the browser: developer tools, **Network**, the page request, **Response headers**.

**S3. The rollback rehearsal has no steps, and it can't run before the first release as written** (`docs/DEPLOY.md:46`, `docs/RUNBOOK.md` "Last rehearsed on")

- What is wrong: PROCESS.md asks for a rollback rehearsal before the first release. Netlify's "publish a previous deploy" needs at least two production deploys, and before v1.0.0 there is only one. The guide doesn't say how to rehearse, or how to get the site back to automatic deploys afterwards.
- Why it matters: the person can't fill in the RUNBOOK line without help, so the PLAN criterion "rollback steps the person can follow without help" isn't fully met.
- Suggested fix: add a short "Rehearse a rollback" list. Deploy, merge a harmless change such as a CHANGELOG line, publish the first deploy from **Deploys**, check the page, choose **Start auto publishing** again, then write the date in RUNBOOK.md.

**S4. CHANGELOG makes two claims the evidence doesn't support** (`CHANGELOG.md:12`)

- What is wrong: "screen reader friendly": nothing in the build tested a screen reader. The evidence is axe and Lighthouse automated checks (SPEC 2 test 3, SPEC 10 WCAG 2.2 AA). "Main content in about 1.6 seconds": this is a simulated lab number (Lighthouse Moto G Power profile), stated to visitors as fact.
- Why it matters: the task asks that the changelog claims nothing the spec doesn't support. SPEC 7 rule 7 says claims change only with approval, and DESIGN.md Tone says no made-up claims.
- Suggested fix: "keyboard friendly and checked against WCAG 2.2 AA" and "fast on phones (main content in about 1.6 seconds in our tests)". Or remove the number.

### Note

**N1. Header and meta-tag CSP can drift apart** (`netlify.toml:14`, `vite.config.ts:6-16`)
They match today. The header is the meta policy with `frame-ancestors 'none'` added. The test only checks that certain strings are present, and `vite preview` doesn't send Netlify headers, so no browser test sees the header policy. Suggested: a Vitest check that the header equals `CSP + "; frame-ancestors 'none'"`. That means exporting `CSP` from one place.

**N2. SPEC 13 "results recorded per release" has no step** (PLAN phase 4 "Delivers")
The Lighthouse JSON comes from the phase 3 build. The page is unchanged since, so it still holds. No Playwright result is saved for the release, and DEPLOY.md doesn't ask for one at each release. Suggested: one line in DEPLOY.md "Before you start" or in the RUNBOOK: run `npm run check` and `npm run lighthouse`, and save the output as `docs/log/<date>-release-<tag>.txt`.

**N3. Tagging comes at a different point in each document** (`docs/DEPLOY.md:9`, `docs/log/2026-11-20-final-report.md:24`)
DEPLOY.md tags and pushes v1.0.0 before the first deploy. The final report lists the tag last, after the Firefox, Safari and rollback checks. Suggested: choose one. Tagging after the live checks pass fits "a release is a known-good point" better.

**N4. Deploy step 4 suggests the address will be `strata-hub.netlify.app`** (`docs/DEPLOY.md:16`)
Netlify gives a new site a random name. The name `strata-hub` only comes after step 5's rename. Suggested: "a random address such as `https://sparkly-cat-1234.netlify.app`; step 5 renames it".

**N5. Lighthouse performance "97" doesn't match the JSON** (`docs/log/2026-11-20-final-report.md:30`, `docs/STATUS.md:23`)
The committed JSON gives 99, 98 and 99, so the worst is 98. The phase 3 verifier flagged this already, and the number was carried into the final report. Performance isn't a target, so nothing else changes.

**N6. The phase 3 Firefox box still says "deferred to phase 4"** (`docs/PLAN.md:107`)
It is explained in the final report, and PLAN line 97 already said "checked by hand at release". But the box text doesn't point to where the check now lives. Suggested: add "now in DEPLOY.md, After you deploy, step 2, for the person".

**N7. The build inside `release.test.ts` isn't traced** (REVIEW pass 6)
The build adds no request, and the site has no browser tracing (OBSERVABILITY Step 1 concern), so this is not a missing trace. `scripts/lighthouse.ts` and `scripts/render-stills.ts` wrap their work in telemetry spans. The test build and plain `npm run build` don't. That's fine if intended. Mentioned only so the choice is recorded.

## The six passes

1. **Plan and spec:** the diff delivers the files PLAN phase 4 names. It also adds `netlify.toml`, which is recorded in the PLAN "Done" line and needed for SPEC 10 static hosting. The build check is `web/release.test.ts` rather than `e2e/build.spec.ts` or `scripts/check-build.ts`, which is within the spirit of the plan. Nothing from Not for now: no form service, analytics or cookies. Netlify Forms isn't turned on (the form has no `netlify` attribute, and `form-action 'none'` blocks it anyway).
2. **Tests:** written first in their own commit (22feb5c). The first-run output shows 5 of 7 failing for the expected reasons. No skipped, focused or empty tests. The count went up (22 to 29). Problem: B1.
3. **Security:** no secrets. Headers: CSP (same as the meta tag, plus `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. The built `index.html` has one external module script and no inline script or style, and the favicon `data:` URL is allowed by `img-src 'self' data:`. Three.js and GSAP set styles through the CSSOM, which `style-src 'self'` allows. The Playwright console-error checks already pass under the identical meta policy, so the header won't block the site. The long cache on `/assets/*` only covers hashed files: `dist/assets` holds only hashed names, and `og-image.png`, `robots.txt` and `sitemap.xml` stay outside it. **No deploy:** no Netlify CLI, deploy script, CI workflow or token in the diff. DEPLOY.md and RUNBOOK.md leave every deploy, tag push and rollback to the person.
4. **Data and rules:** no change to the form or the data. `form-action 'none'` in the header keeps rule 4 at the edge too.
5. **Docs:** README (Deploy section), STATUS, RUNBOOK (deploy, where it runs, rollback, health) and the dated note are all there. Problems: S1, S2, S3, N3, N4.
6. **Traces:** no new request, so no trace needed. See N7.

## Phase 4 criteria

| Criterion (PLAN phase 4) | Met? | Evidence |
|---|---|---|
| `npm run build` finishes with no errors and no warnings | Met, but the test doesn't guard warnings (B1) | My `vite build` of c899a9c: exit 0, stderr 0 bytes, stdout "built in". `release.test.ts` passes, but it can't see warnings. |
| `dist/` holds the page, assets, `robots.txt` and `sitemap.xml`, and works from a plain static server | Met | My build output: `index.html`, `og-image.png`, `robots.txt`, `sitemap.xml`, and `assets/` with `.js`, `.css`, `.webp` and `.woff2`. Playwright's `webServer` is `npm run build && npx vite preview --port 4173`, and all 63 tests pass against it. |
| DEPLOY.md and RUNBOOK.md give deploy, custom domain and rollback steps the person can follow without help | Mostly met | Deploy and custom domain are clear: the Netlify import flow, CNAME or A record, HTTPS, primary domain, and the three files to change if the address differs. Rollback through Netlify's **Publish deploy** and **Start auto publishing** is right. Gaps: S1 (revert of a merge), S2 (curl on Windows), S3 (how to rehearse). |
| Every box ticked or explained; the final report gives each acceptance test as met, not met or measured later | Met | One unticked box (phase 3 Firefox), explained in the final report and PLAN line 97 (N6). Final report checked against the evidence: test 1 is measured later (A4, nothing sent). Test 2 is 1.59 s worst of three in `2026-11-20-lighthouse.json` (1.589, 1.584, 1.586). Test 3: accessibility 100 in all three runs, and the axe tests at 375, 768 and 1280 px plus the error state and open menu (`e2e/smoke.spec.ts`, `e2e/review-2a.spec.ts:90`) pass. Test 4: 60 fps and 16.8 ms p95, matching `2026-11-20-phase-2b-verifier-2.md` ("fps":60,"p95FrameMs":16.8). Tests 2 and 4 are marked "simulated", which is honest. Only mismatch: N5. |
| `npm run check` passes | Met | Exit 0. Vitest 29 of 29, Playwright 63 of 63 (output above). |

## Files read

`AGENTS.md`, `REVIEW.md`, `docs/INTENT.md`, `docs/SPEC.md`, `docs/TECH_STACK.md`, `docs/CODE_STANDARDS.md`, `docs/PROCESS.md`, `docs/BRAND.md`, `DESIGN.md`, `docs/STATUS.md`, `docs/RUNBOOK.md`, `docs/OBSERVABILITY.md`, `docs/PLAN.md`; the full diff `main...phase-4-deployment-documentation`; `netlify.toml`, `docs/DEPLOY.md`, `CHANGELOG.md`, `README.md`, the final report, the phase 4 note and first-run output, `web/release.test.ts`, `vite.config.ts`, `package.json`, `playwright.config.ts`, and `docs/log/2026-11-20-lighthouse.json`.
