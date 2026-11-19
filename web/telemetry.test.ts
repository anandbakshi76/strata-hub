import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";

const dir = mkdtempSync(join(tmpdir(), "strata-traces-"));

beforeAll(() => {
  process.env.TRACE_DIR = dir;
  process.env.TRACE_BACKEND = "local";
  process.env.LOG_CONTENT = "false";
});

function spans(): Record<string, unknown>[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .flatMap((f) => readFileSync(join(dir, f), "utf8").trim().split("\n"))
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

describe("telemetry", () => {
  it("writes a trace with a span when the skeleton renders", async () => {
    const { trace, flushTraces } = await import("./telemetry");
    const { render } = await import("./main");
    const dom = new JSDOM('<main id="app"></main>');
    const root = dom.window.document.getElementById("app") as unknown as HTMLElement;

    await trace("page.render", () => render(root));
    await flushTraces();

    expect(root.dataset.ready).toBe("true");
    const span = spans().find((s) => s.name === "page.render");
    expect(span).toBeDefined();
    expect(span?.trace_id).toMatch(/^[0-9a-f]{32}$/);
    expect(span?.status).toBe("ok");
  });

  it("masks emails, phone numbers, card numbers and keys before export", async () => {
    const { trace, flushTraces } = await import("./telemetry");
    await trace("mask.check", () => "done", {
      note: "sam@example.com +44 7700 900123 4111 1111 1111 1111 sk-abcdefghijklmnopqrstuvwx",
    });
    await flushTraces();
    const span = spans().find((s) => s.name === "mask.check");
    const text = JSON.stringify(span);
    expect(text).not.toContain("sam@example.com");
    expect(text).not.toContain("4111 1111 1111 1111");
    expect(text).not.toContain("sk-abcdefghijklmnopqrstuvwx");
    expect(text).not.toContain("7700 900123");
  });

  it("keeps sizes and hashes, not content, when LOG_CONTENT is false", async () => {
    const { trace, flushTraces } = await import("./telemetry");
    await trace("content.check", () => "done", { content: "the full request text" });
    await flushTraces();
    const span = spans().find((s) => s.name === "content.check");
    const attrs = span?.attributes as Record<string, unknown>;
    expect(JSON.stringify(attrs)).not.toContain("the full request text");
    expect(attrs["content.size"]).toBe(21);
    expect(attrs["content.sha256"]).toMatch(/^[0-9a-f]{64}$/);
  });
});
