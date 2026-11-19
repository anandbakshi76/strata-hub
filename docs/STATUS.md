# Status

Phase 1 (structure and content) is built on `phase-1-sitemap-content-structure`, 19 November 2026. The page has every section in the SPEC 5 order with its draft copy, readable with JavaScript off. It is not styled yet (phase 2a), and has no 3D or motion (phase 2b).

- `web/index.html`: header, hero, look inside with the four module chapters, reassemble line, bundles, register-interest form (fields only, no behaviour yet), FAQ, footer.
- `web/content.ts`: all copy, typed; `docs/CONTENT.md` lists it for approval. Approved by Anand Bakshi on 19 November 2026.
- `web/telemetry.ts`: traces build and test runs only; nothing in the browser (SPEC 13).
- Checks: `npm run check` runs Prettier, ESLint, TypeScript, Vitest (15 tests: telemetry and page structure) and Playwright (5 tests against the production build: three widths with axe, JavaScript off, JavaScript on).

## Run it

- `npm install` installs everything (Node 26, see `.nvmrc`).
- `npm run dev` starts the page at http://localhost:5173.
- `npm run check` runs every check. Playwright builds the site and tests it with `vite preview` on port 4173, using the installed Chrome.
- `npm run build` writes the static site to `dist/`.
