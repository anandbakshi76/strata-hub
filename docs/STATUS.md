# Status

Phase 2a (the static styled page) is built on `phase-2a-pages-layout`, 20 November 2026. Phases 1 and 2a together give the whole page, styled from DESIGN.md and working without 3D or motion. Phase 2b adds the 3D hub and the scroll motion.

- `web/index.html`: every section in the SPEC 5 order with the approved copy; still images of the hub (assembled in the hero, exploded beside the chapters).
- `web/styles/`: `tokens.css` (DESIGN.md tokens), `base.css`, `site.css` (the sections, DESIGN.md 3 to 8).
- Fonts: Archivo 700 and 800, DM Sans 400 and 500, IBM Plex Mono 500, self-hosted through the `@fontsource` packages (no font service, rule 6).
- `web/form.ts`: the register-interest form checks the email and consent and shows the confirmation. Nothing is sent (rule 4).
- `web/menu.ts`: on phones the section links fold into a Menu button; without JavaScript they stay visible.
- `web/telemetry.ts`: traces build and test runs only; nothing in the browser (SPEC 13).
- Checks: `npm run check` runs Prettier, ESLint, TypeScript, Vitest (15 tests) and Playwright (20 tests against the production build, one worker).

## Run it

- `npm install` installs everything (Node 26, see `.nvmrc`).
- `npm run dev` starts the page at http://localhost:5173.
- `npm run check` runs every check. Playwright builds the site and tests it with `vite preview` on port 4173, using the installed Chrome.
- `npm run build` writes the static site to `dist/`.
