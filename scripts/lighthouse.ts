// Lighthouse on the production build, mobile profile (acceptance tests 2 and 3). Run with
// `npm run lighthouse` after `npm run build`. Writes a summary to docs/log/ and fails (exit 1)
// when LCP is 2.5 s or more, accessibility is under 95, or layout shift is 0.1 or more.
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { flushTraces, trace } from "../web/telemetry.ts";

const PORT = 4179;
const runs = Number(process.env.RUNS ?? 3);

async function waitForServer(url: string): Promise<void> {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Preview server did not start at ${url}`);
}

const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  shell: process.platform === "win32",
  stdio: "ignore",
});

const results: {
  lcp: number;
  cls: number;
  tbt: number;
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
}[] = [];
try {
  await waitForServer(`http://localhost:${PORT}/`);
  for (let i = 0; i < runs; i++) {
    const r = await trace(
      "lighthouse.run",
      async () => {
        const chrome = await chromeLauncher.launch({
          chromeFlags: ["--headless=new", "--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
        });
        try {
          const out = await lighthouse(`http://localhost:${PORT}/`, {
            port: chrome.port,
            output: "json",
            logLevel: "error",
            onlyCategories: ["performance", "accessibility", "seo", "best-practices"],
          });
          if (!out) throw new Error("Lighthouse returned no result");
          const lhr = out.lhr;
          const audit = (id: string) => lhr.audits[id]?.numericValue ?? NaN;
          const score = (id: string) => Math.round((lhr.categories[id]?.score ?? 0) * 100);
          return {
            lcp: Math.round(audit("largest-contentful-paint")) / 1000,
            cls: Math.round(audit("cumulative-layout-shift") * 1000) / 1000,
            tbt: Math.round(audit("total-blocking-time")),
            performance: score("performance"),
            accessibility: score("accessibility"),
            seo: score("seo"),
            bestPractices: score("best-practices"),
          };
        } finally {
          await chrome.kill();
        }
      },
      { run: i + 1 },
    );
    results.push(r);
    console.log(`run ${i + 1}:`, JSON.stringify(r));
  }
} finally {
  server.kill();
  await flushTraces();
}

const worst = {
  lcp: Math.max(...results.map((r) => r.lcp)),
  cls: Math.max(...results.map((r) => r.cls)),
  accessibility: Math.min(...results.map((r) => r.accessibility)),
};
const summary = {
  date: new Date().toISOString(),
  profile: "Lighthouse default mobile: Moto G Power emulation, 4x CPU slowdown, simulated slow 4G",
  runs: results,
  worst,
  targets: { lcpSecondsBelow: 2.5, accessibilityAtLeast: 95, clsBelow: 0.1 },
};
writeFileSync(
  `docs/log/${new Date().toISOString().slice(0, 10)}-lighthouse.json`,
  JSON.stringify(summary, null, 2) + "\n",
);
console.log("worst:", JSON.stringify(worst));
const ok = worst.lcp < 2.5 && worst.accessibility >= 95 && worst.cls < 0.1;
if (!ok) {
  console.error("Lighthouse targets not met.");
  process.exit(1);
}
process.exit(0);
