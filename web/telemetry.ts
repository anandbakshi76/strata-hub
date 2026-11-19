// The only module that talks to the tracing tool. Every other file calls trace(name, fn).
// In the browser it records nothing (SPEC 13: nothing is recorded about visitors); it only runs fn.
// In Node (tests and build scripts) it writes spans as JSON lines to TRACE_DIR, masked first.

export type Attributes = Record<string, string | number | boolean>;

interface Tracer {
  run<T>(name: string, fn: () => T | Promise<T>, attributes: Attributes): Promise<T>;
  flush(): Promise<void>;
}

const inNode = typeof process !== "undefined" && Boolean(process.versions?.node);
let tracer: Promise<Tracer> | undefined;

function getTracer(): Promise<Tracer> {
  // The path is built at run time so the browser bundle never includes the Node exporter.
  const nodeModule = "./telemetry.node" + ".ts";
  tracer ??= import(/* @vite-ignore */ nodeModule).then((m: { createTracer: () => Tracer }) =>
    m.createTracer(),
  );
  return tracer;
}

export async function trace<T>(
  name: string,
  fn: () => T | Promise<T>,
  attributes: Attributes = {},
): Promise<T> {
  if (!inNode) return fn();
  return (await getTracer()).run(name, fn, attributes);
}

export async function flushTraces(): Promise<void> {
  if (inNode && tracer) await (await tracer).flush();
}
