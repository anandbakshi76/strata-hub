// Telemetry is imported first, before anything else runs.
import { trace } from "./telemetry";

export function render(root: HTMLElement): void {
  root.dataset.ready = "true";
}

if (typeof document !== "undefined") {
  const root = document.getElementById("app");
  if (root) void trace("page.render", () => render(root));
}
