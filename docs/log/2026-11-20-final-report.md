# Final report: Strata Hub (20 November 2026)

The build is complete through phase 4: five phases (1, 2a, 2b, 3, 4), each built tests first, reviewed in a fresh session, checked by the verifier in a fresh session, and merged by the person on GitHub.

## Acceptance tests (SPEC 2)

| # | Acceptance test | Result | Evidence |
|---|-----------------|--------|----------|
| 1. | At least 4% of visitors register interest | **Measured later** | Nothing is sent in the pilot (A4), so there are no registrations to count. The form is complete and tested (`e2e/form.spec.ts`). Needs a form service and analytics, both approved by the person first (rules 4 and 6). |
| 2. | LCP under 2.5 s at the 75th percentile on a mid-range phone | **Met** (simulated) | Lighthouse mobile, worst of three: 1.59 s (`docs/log/2026-11-20-lighthouse.json`). On the live site, check again from Chrome (DEPLOY.md, After you deploy). |
| 3. | Lighthouse accessibility 95 or more, no WCAG 2.2 AA failures | **Met** | Lighthouse accessibility 100; axe finds no AA failures at three widths, in the form's error state and in the open phone menu. |
| 4. | The 3D section at 50 frames per second or more on a mid-range phone | **Met** (simulated) | `npm run perf`: 60 frames per second, 95th percentile frame 16.8 ms, Pixel 5 profile with 4x CPU slowdown. Not yet measured on a real phone (PLAN choice 6). |

## Every plan box

All boxes in PLAN.md are ticked except one, explained: phase 3's "zero console errors in Chrome, Edge and Firefox, and in Safari where available". Chrome and Edge are tested; Firefox was deferred to phase 4 by the person and is now a step in DEPLOY.md, After you deploy, because Firefox isn't installed on this machine. Safari is not available here.

## Open for the person

1. Deploy (DEPLOY.md) and confirm the address; if it is not `https://strata-hub.netlify.app`, change it in the three files DEPLOY.md lists.
2. Check Firefox and Safari on the live site.
3. Rehearse a rollback once and write the date in RUNBOOK.md.
4. Measure the frame rate on a real phone, if you have one.
5. Tag the release `v1.0.0`.

## Numbers

- Tests: Vitest 29 (telemetry, structure, styles, release), Playwright 63 (Chrome, plus Edge for the page and security checks).
- JavaScript 177 KB compressed (budget 600 KB); the 3D chunk loads after the first scroll has settled.
- Lighthouse mobile: performance 97, accessibility 100, best practices 100, SEO 100.
