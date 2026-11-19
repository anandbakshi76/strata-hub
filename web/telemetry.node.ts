// Node only: OpenTelemetry with a file exporter that writes one JSON line per span.
import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { SpanStatusCode, type Span } from "@opentelemetry/api";
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
  type ReadableSpan,
  type SpanExporter,
} from "@opentelemetry/sdk-trace-base";
import type { Attributes } from "./telemetry";

const MASKS: [RegExp, string][] = [
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]"],
  [/\b(?:\d[ -]?){13,19}\b/g, "[card]"],
  [/(sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,})/g, "[key]"],
  [/\+?\d[\d ()-]{7,}\d/g, "[phone]"],
];
const CONTENT_KEYS = /^(content|body|text|request|response|prompt)$/i;

export function mask(value: string): string {
  return MASKS.reduce((s, [re, label]) => s.replace(re, label), value);
}

function clean(attributes: Attributes, logContent: boolean): Attributes {
  const out: Attributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "string" && CONTENT_KEYS.test(key) && !logContent) {
      out[`${key}.size`] = value.length;
      out[`${key}.sha256`] = createHash("sha256").update(value).digest("hex");
    } else {
      out[key] = typeof value === "string" ? mask(value) : value;
    }
  }
  return out;
}

class JsonLinesExporter implements SpanExporter {
  private readonly dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  export(spans: ReadableSpan[], done: (result: { code: number }) => void): void {
    mkdirSync(this.dir, { recursive: true });
    const file = join(this.dir, `traces-${new Date().toISOString().slice(0, 10)}.jsonl`);
    const lines = spans.map((s) => {
      const ctx = s.spanContext();
      const ms = (t: [number, number]) => t[0] * 1000 + t[1] / 1e6;
      return JSON.stringify({
        name: s.name,
        trace_id: ctx.traceId,
        span_id: ctx.spanId,
        start: new Date(ms(s.startTime)).toISOString(),
        duration_ms: Math.round((ms(s.endTime) - ms(s.startTime)) * 1000) / 1000,
        status: s.status.code === SpanStatusCode.ERROR ? "error" : "ok",
        error: s.status.message ? mask(s.status.message) : undefined,
        attributes: s.attributes,
      });
    });
    appendFileSync(file, lines.join("\n") + "\n");
    done({ code: 0 });
  }

  async shutdown(): Promise<void> {}
}

export function createTracer() {
  const dir = process.env.TRACE_DIR ?? "logs/traces";
  const backend = process.env.TRACE_BACKEND ?? "local";
  if (backend !== "local")
    throw new Error(`TRACE_BACKEND=${backend} is not set up yet; use local.`);
  const logContent = process.env.LOG_CONTENT === "true";
  const provider = new BasicTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(new JsonLinesExporter(dir))],
  });
  const tracer = provider.getTracer("strata-hub");

  return {
    async run<T>(name: string, fn: () => T | Promise<T>, attributes: Attributes): Promise<T> {
      return tracer.startActiveSpan(name, async (span: Span) => {
        span.setAttributes(clean(attributes, logContent));
        try {
          const result = await fn();
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
          throw error;
        } finally {
          span.end();
        }
      });
    },
    async flush(): Promise<void> {
      await provider.forceFlush();
    },
  };
}
