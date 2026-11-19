# Status

The foundation is in place (Step 1, 19 November 2026). Nothing of Strata Hub is built yet: no sections, no 3D, no motion.

- `web/`: one page that loads ("Strata Hub: foundation"), the design tokens from DESIGN.md in `web/styles/tokens.css`, and the telemetry module.
- Telemetry: `web/telemetry.ts` traces build and test runs only, as JSON lines in `logs/traces/`, masked. In the browser it records nothing (SPEC 13).
- Checks: `npm run check` runs Prettier, ESLint, TypeScript, Vitest (3 telemetry tests) and Playwright (the page at 375, 768 and 1280 px: no sideways scroll, no console errors, no axe AA failures).

## Run it

- `npm install` installs everything (Node 26, see `.nvmrc`).
- `npm run dev` starts the page at http://localhost:5173.
- `npm run check` runs every check. Playwright uses the Chrome installed on the machine.
- `npm run build` writes the static site to `dist/`.
