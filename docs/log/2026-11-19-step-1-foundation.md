# Step 1: project foundation (19 November 2026)

## Built

- Setup: `package.json` (three, gsap; Vite 8, TypeScript 6, Vitest 5, Playwright 1.65 with axe, ESLint 10, Prettier 3, OpenTelemetry API 1.9 and sdk-trace-base 2.12), `.nvmrc` (26), `tsconfig.json` (strict), `eslint.config.js`, Prettier config, `vite.config.ts` (root `web/`), `playwright.config.ts`.
- Skeleton: `web/index.html`, `web/main.ts`, `web/styles/tokens.css` and `base.css`.
- Telemetry: `web/telemetry.ts` (browser: runs fn only) and `web/telemetry.node.ts` (OpenTelemetry with a JSON-lines file exporter, masking, sizes and hashes when LOG_CONTENT=false).
- Tests: `web/telemetry.test.ts` (3, shown failing against a stub first), `e2e/smoke.spec.ts` (3 widths with axe).
- Filled: OBSERVABILITY.md author and targets (with a concern recorded), RUNBOOK.md who to call.

## Choices

- Tracing for build and test runs only, approved by the person: the site has no server and SPEC 13 records nothing about visitors.
- `@opentelemetry/sdk-trace-base` instead of `sdk-node`: it is the tracing part of sdk-node, and the newest API (1.10) clashes with its peer range, so the API is pinned to 1.9.
- Playwright runs on the installed Chrome (`channel: "chrome"`), so no browser download.
- A small inline SVG favicon: without it the page logged a 404, which the console-error check caught.

## Problems met

- `npx prettier --write .` reformatted `.claude/settings.json` and `scripts/agent-guard.mjs`, both protected files. Restored from Git and added to `.prettierignore`.
- Node's built-in type stripping can't run TypeScript parameter properties, so `telemetry.node.ts` uses plain fields.
