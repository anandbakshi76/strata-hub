// Starts the 3D hub and its scroll motion (DESIGN.md 7). Loaded only when motion is allowed and
// WebGL works; if anything fails the stills stay and the page reads as before (rule 2, SPEC 9).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { content } from "../content";
import { MODULE_IDS, type ModuleId } from "./hub";
import { createHubScene } from "./scene";

const RAMP_IN = 0.12; // share of the look-inside scroll used to take the hub apart
const RAMP_OUT = 0.9; // where the reassembly starts

export function start(): boolean {
  const section = document.getElementById("inside");
  const still = section?.querySelector<HTMLElement>(".still");
  if (!section || !still) return false;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "A 3D model of the Strata hub. As you scroll it comes apart into its four modules, lights, climate, security and energy, and snaps back together.",
  );
  still.prepend(canvas);
  let hub;
  try {
    hub = createHubScene(canvas, still);
  } catch {
    canvas.remove();
    return false;
  }
  section.classList.add("has-3d");
  // If the GPU drops the context, go back to the stills (SPEC 9, review N5).
  canvas.addEventListener("webglcontextlost", () => {
    section.classList.remove("has-3d");
    ScrollTrigger.getAll().forEach((t) => t.kill());
    canvas.remove();
    still.querySelector(".callout")?.remove();
  });

  const callout = document.createElement("div");
  callout.className = "callout";
  callout.setAttribute("aria-hidden", "true"); // the chapter text already says this
  const calloutName = document.createElement("span");
  calloutName.className = "callout-name";
  const calloutSpec = document.createElement("span");
  calloutSpec.className = "callout-spec";
  callout.append(calloutName, calloutSpec);
  still.append(callout);

  let explode = 0;
  let active: ModuleId | null = null;
  const show = () => {
    section.dataset.explode = String(Math.round(explode * 100) / 100);
    if (active) section.dataset.active = active;
    else delete section.dataset.active;
    const point = hub.anchor();
    const module = content.modules.find((m) => m.id === active);
    if (point && module && explode > 0.5) {
      calloutName.textContent = module.name;
      calloutSpec.textContent = module.specs[0].value;
      callout.style.transform = `translate(${Math.round(point.x)}px, ${Math.round(point.y)}px)`;
      callout.classList.add("on");
    } else {
      callout.classList.remove("on");
    }
  };
  show();

  gsap.registerPlugin(ScrollTrigger);
  const progress = { p: 0 };
  gsap.to(progress, {
    p: 1,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top 75%",
      endTrigger: "#reassemble",
      end: "bottom bottom",
      scrub: 1,
    },
    onUpdate: () => {
      const p = progress.p;
      explode = p < RAMP_IN ? p / RAMP_IN : p > RAMP_OUT ? (1 - p) / (1 - RAMP_OUT) : 1;
      explode = Math.min(1, Math.max(0, explode));
      hub.setExplode(explode);
      show();
    },
  });

  // On phones and tablets the hub sits in a band at the top, so the chapter being read is the one
  // crossing a line just below the band; on wide screens, the one crossing the middle of the screen.
  // Start and end use the same line, so two chapters are never active at once (review B1).
  const narrow = window.matchMedia("(max-width: 1023px)").matches;
  const line = () => (narrow ? `${Math.round(64 + still.offsetHeight + 24)}px` : "center");
  for (const id of MODULE_IDS) {
    ScrollTrigger.create({
      trigger: `#${id}`,
      start: () => `top ${line()}`,
      end: () => `bottom ${line()}`,
      onToggle: (self) => {
        if (self.isActive) active = id;
        else if (active === id) active = null;
        hub.setActive(active);
        show();
      },
    });
  }

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
  return true;
}
