# Strata Hub

A scroll-driven launch page for Strata, a fictional modular smart home hub whose modules snap together. A 3D model of the hub comes apart into its four modules (lights, climate, security, energy) as you scroll, followed by the bundles, a register-interest form and an FAQ. Strata is fictional: the page was built as a design pilot.

## Run it

- `npm install` installs everything (Node 26, see `.nvmrc`).
- `npm run dev` starts the page at http://localhost:5173.
- `npm run check` runs every check: format, lint, types, unit tests and browser tests (Playwright with axe, against the production build, using the installed Chrome).
- `npm run build` writes the static site to `dist/`.
- `npm run perf` measures the frame rate in the 3D section (Pixel 5 profile, 4x CPU slowdown).
- `npm run lighthouse` runs Lighthouse on the built site (mobile, three runs) and saves the result in `docs/log/`.
- `npm run stills` renders the fallback stills from the 3D model.

## Deploy

Netlify builds and serves the site from `netlify.toml`. Step by step, with the custom domain and rollback: `docs/DEPLOY.md`. What changed: `CHANGELOG.md`.

See `docs/STATUS.md` for what is built, and `docs/PLAN.md` for the phases.
