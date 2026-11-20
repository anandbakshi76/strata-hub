// Telemetry is imported first, before anything else runs.
import { trace } from "./telemetry";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/ibm-plex-mono/500.css";
import { setUpForm } from "./form";
import { setUpMenu } from "./menu";

export function render(root: HTMLElement): void {
  const doc = root.ownerDocument;
  doc.documentElement.classList.add("js");
  // JavaScript is on: remove the notices that only apply when it is off (SPEC 9).
  doc.querySelectorAll("[data-no-js]").forEach((el) => el.remove());
  const form = doc.querySelector<HTMLFormElement>("#register form");
  if (form) setUpForm(form);
  const menu = doc.querySelector<HTMLButtonElement>(".menu-button");
  const links = doc.getElementById("nav-links");
  if (menu && links) setUpMenu(menu, links);
  // SPEC 5: the Register interest buttons jump to the form and put the focus in the email field.
  doc.querySelectorAll<HTMLAnchorElement>('a[href="#register"]').forEach((link) =>
    link.addEventListener("click", () => {
      requestAnimationFrame(() => doc.getElementById("email")?.focus({ preventScroll: true }));
    }),
  );
  root.dataset.ready = "true";
}

if (typeof document !== "undefined") {
  const root = document.getElementById("app");
  if (root) void trace("page.render", () => render(root));
}
