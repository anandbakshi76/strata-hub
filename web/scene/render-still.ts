// Development only: renders one still of the hub for scripts/render-stills.ts.
// URL: /render-still.html?explode=0&w=520&h=420
import { createHubScene } from "./scene";

const params = new URLSearchParams(location.search);
const width = Number(params.get("w") ?? 520);
const height = Number(params.get("h") ?? 420);
const frame = document.getElementById("frame") as HTMLElement;
const canvas = frame.querySelector("canvas") as HTMLCanvasElement;
frame.style.width = `${width}px`;
frame.style.height = `${height}px`;
canvas.style.width = "100%";
canvas.style.height = "100%";
const scene = createHubScene(canvas, frame, { preserveDrawingBuffer: true });
scene.setExplode(Number(params.get("explode") ?? 0));
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    document.title = "ready";
  }),
);
