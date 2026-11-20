// The 3D scene for the look-inside chapters (DESIGN.md 6): one model, a fixed scroll-driven camera,
// a soft key light and fill, and a contact shadow. It renders only when something changes.
import * as THREE from "three";
import { buildHub, type ModuleId } from "./hub";

export interface HubScene {
  setExplode(t: number): void;
  setActive(id: ModuleId | null): void;
  /** Screen position (in the container's pixels) of the active module's right edge, for the callout. */
  anchor(): { x: number; y: number } | null;
  dispose(): void;
}

export function createHubScene(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  options: { preserveDrawingBuffer?: boolean } = {},
): HubScene {
  // preserveDrawingBuffer is only for scripts/render-stills.ts, which reads the pixels back.
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
  });
  const phone = window.matchMedia("(max-width: 767px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, phone ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1c1917, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 8, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-5, 3, -2);
  scene.add(fill);

  const hub = buildHub();
  scene.add(hub.group);
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.9, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  scene.add(shadow);

  let explode = 0;
  let active: ModuleId | null = null;
  let frame = 0;

  const placeCamera = () => {
    const y = hub.centreY(explode);
    const distance = 9 + explode * 3.5;
    camera.position.set(distance * 0.62, y + 2.4 + explode * 0.6, distance * 0.78);
    camera.lookAt(0, y, 0);
  };

  const render = () => {
    frame = 0;
    placeCamera();
    renderer.render(scene, camera);
  };
  const requestRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  return {
    setExplode(t) {
      explode = t;
      hub.setExplode(t);
      requestRender();
    },
    setActive(id) {
      active = id;
      hub.setActive(id);
      requestRender();
    },
    anchor() {
      if (!active) return null;
      placeCamera();
      camera.updateMatrixWorld();
      const point = new THREE.Vector3(1, 0, 0);
      hub.modules[active].localToWorld(point);
      point.project(camera);
      const { width, height } = container.getBoundingClientRect();
      return { x: ((point.x + 1) / 2) * width, y: ((1 - point.y) / 2) * height };
    },
    dispose() {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      renderer.dispose();
    },
  };
}
