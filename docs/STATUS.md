# Status

Phases 1, 2a, 2b and 3 are built (3 on `phase-3-seo-accessibility-performance`, 20 November 2026). The page is complete: approved copy, the styled page and form, the 3D hub with its scroll motion, search and sharing tags, a Content Security Policy, and the design-critique fixes. Phase 4 adds deployment and documentation.

- `web/index.html`: every section in the SPEC 5 order with the approved copy; still images of the hub (assembled in the hero, exploded beside the chapters).
- `web/styles/`: `tokens.css` (DESIGN.md tokens), `base.css`, `site.css` (the sections, DESIGN.md 3 to 8).
- Fonts: Archivo 700 and 800, DM Sans 400 and 500, IBM Plex Mono 500, self-hosted through the `@fontsource` packages (no font service, rule 6).
- `web/form.ts`: the register-interest form checks the email and consent and shows the confirmation. Nothing is sent (rule 4).
- `web/menu.ts`: on phones the section links fold into a Menu button; without JavaScript they stay visible.
- `web/scene/`: `hub.ts` (the procedural model: a base and four plates, about 3,100 triangles (measured: 3,080), no textures), `scene.ts` (renderer, camera, lights, contact shadow; renders only when something changes), `start.ts` (GSAP ScrollTrigger: explode, active module, callout). Loaded after the page is readable, only when motion is allowed and WebGL works.
- `web/telemetry.ts`: traces build and test runs only; nothing in the browser (SPEC 13).
- Checks: `npm run check` runs Prettier, ESLint, TypeScript, Vitest (21 tests) and Playwright (63 tests against the production build: Chrome for all, Edge for the page and security checks). `npm run perf` measures the frame rate in the 3D section (last run: 60 frames per second, 95th percentile frame 16.8 ms, Pixel 5 profile with 4x CPU slowdown).

## Run it

- `npm install` installs everything (Node 26, see `.nvmrc`).
- `npm run dev` starts the page at http://localhost:5173.
- `npm run check` runs every check. Playwright builds the site and tests it with `vite preview` on port 4173, using the installed Chrome.
- `npm run build` writes the static site to `dist/`.

## Measurements (20 November 2026)

- `npm run lighthouse` (mobile, three runs, worst): LCP 1.59 s, layout shift 0.001, accessibility 100, SEO 100, best practices 100, performance 97. Saved in `docs/log/2026-11-20-lighthouse.json`.
- `npm run perf`: 60 frames per second in the 3D section, 95th percentile frame 16.8 ms.
- JavaScript 177 KB compressed (budget 600 KB); the 3D chunk loads only after the first scroll has settled.
- `npm run stills` renders the fallback stills from the model.
