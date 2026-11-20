import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// PLAN phase 4: a clean build, a complete dist/, hosting config, and the release documents.
const root = new URL("..", import.meta.url);
const file = (p: string) => readFileSync(new URL(p, root), "utf8");

describe("the production build", () => {
  const out = mkdtempSync(join(tmpdir(), "strata-build-"));
  // Vite writes warnings to stderr, so both streams are checked (review B1).
  const run = spawnSync(
    process.execPath,
    [join("node_modules", "vite", "bin", "vite.js"), "build", "--outDir", out, "--emptyOutDir"],
    { cwd: new URL(".", root), encoding: "utf8" },
  );
  const log = `${run.stdout}
${run.stderr}`;

  it("finishes with no errors and no warnings", () => {
    expect(run.status).toBe(0);
    expect(log).toMatch(/built in/);
    expect(log).not.toMatch(/\(!\)|warning|error/i);
  });

  it("holds the page, its assets, robots.txt, sitemap.xml and the share image", () => {
    for (const f of ["index.html", "robots.txt", "sitemap.xml", "og-image.png"])
      expect(existsSync(join(out, f)), f).toBe(true);
    const assets = readdirSync(join(out, "assets"));
    for (const ext of [".js", ".css", ".webp", ".woff2"])
      expect(
        assets.some((a) => a.endsWith(ext)),
        ext,
      ).toBe(true);
  });
}, 60_000);

describe("hosting", () => {
  it("netlify.toml builds with npm run build, publishes dist/ and sends security headers", () => {
    const toml = file("netlify.toml");
    expect(toml).toMatch(/command\s*=\s*"npm run build"/);
    expect(toml).toMatch(/publish\s*=\s*"dist"/);
    expect(toml).toMatch(/NODE_VERSION\s*=\s*"26"/);
    expect(toml).toContain("Content-Security-Policy");
    expect(toml).toContain("frame-ancestors 'none'");
    expect(toml).toContain("X-Content-Type-Options");
  });
});

describe("release documents", () => {
  it("DEPLOY.md walks through deploying, the custom domain and rolling back", () => {
    const deploy = file("docs/DEPLOY.md");
    for (const heading of [
      "## Deploy to Netlify",
      "## Custom domain",
      "## Roll back",
      "## After you deploy",
    ])
      expect(deploy, heading).toContain(heading);
    expect(deploy).toContain("netlify.toml");
  });

  it("RUNBOOK.md has no part left to fill in, apart from the rollback rehearsal for the person", () => {
    const runbook = file("docs/RUNBOOK.md");
    expect(runbook).not.toContain("(to be filled in");
    expect(runbook).toContain("Last rehearsed on: ____ by ____");
  });

  it("CHANGELOG.md has a first release entry written for a visitor", () => {
    const log = file("CHANGELOG.md");
    expect(log).toMatch(/^## 1\.0\.0/m);
    expect(log).toContain("register interest");
  });

  it("the final report gives each acceptance test as met, not met or measured later", () => {
    const report = file("docs/log/2026-11-20-final-report.md");
    for (const n of ["1.", "2.", "3.", "4."]) expect(report).toContain(`| ${n}`);
    expect(report).toMatch(/measured later/i);
  });
});
