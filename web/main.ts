// Telemetry is imported first, before anything else runs.
import { trace } from "./telemetry";

export function render(root: HTMLElement): void {
  // JavaScript is on: remove the notices that only apply when it is off (SPEC 9).
  root.ownerDocument.querySelectorAll("[data-no-js]").forEach((el) => el.remove());
  root.dataset.ready = "true";
}

if (typeof document !== "undefined") {
  const root = document.getElementById("app");
  if (root) void trace("page.render", () => render(root));
}
