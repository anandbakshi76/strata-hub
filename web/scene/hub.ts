// The Strata hub, built from shapes in code (DESIGN.md 6, rule 1): a base and four module plates.
// No textures and no image files. Positions only; the scene and the scroll motion drive it.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const MODULE_IDS = ["lights", "climate", "security", "energy"] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

const BASE_HEIGHT = 0.36;
const PLATE_HEIGHT = 0.18;
const EXPLODED_GAP = 0.72; // extra space between plates when exploded
const FORWARD = 0.55; // how far the active module comes toward the camera

// DESIGN.md 6: lights frosted white, climate warm grey, security matte charcoal, energy brushed metal.
const FINISH: Record<ModuleId, THREE.MeshStandardMaterialParameters> = {
  lights: { color: 0xf5f5f4, roughness: 0.65, metalness: 0 },
  climate: { color: 0xa8a29e, roughness: 0.55, metalness: 0.05 },
  security: { color: 0x44403c, roughness: 0.9, metalness: 0 },
  energy: { color: 0xd6d3d1, roughness: 0.35, metalness: 0.6 },
};

export interface Hub {
  group: THREE.Group;
  base: THREE.Mesh;
  modules: Record<ModuleId, THREE.Group>;
  setExplode(t: number): void;
  setActive(id: ModuleId | null): void;
  /** The height of the hub's centre for the given explode amount, for the camera to look at. */
  centreY(t: number): number;
}

export function triangleCount(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const g = mesh.geometry;
    count += (g.index ? g.index.count : (g.attributes.position?.count ?? 0)) / 3;
  });
  return Math.round(count);
}

export function buildHub(): Hub {
  const group = new THREE.Group();
  group.name = "strata-hub";

  const base = new THREE.Mesh(
    new RoundedBoxGeometry(2.2, BASE_HEIGHT, 2.2, 3, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.7 }),
  );
  base.name = "base";
  base.position.y = BASE_HEIGHT / 2;
  group.add(base);

  const plate = new RoundedBoxGeometry(2, PLATE_HEIGHT, 2, 3, 0.07);
  const modules = {} as Record<ModuleId, THREE.Group>;
  const materials = {} as Record<ModuleId, THREE.MeshStandardMaterial>;
  for (const id of MODULE_IDS) {
    const m = new THREE.Group();
    m.name = id;
    materials[id] = new THREE.MeshStandardMaterial(FINISH[id]);
    m.add(new THREE.Mesh(plate, materials[id]));
    modules[id] = m;
    group.add(m);
  }

  // Details: the light ring on top of the lights module, and the signal line on the energy module.
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.02, 32),
    new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.3 }),
  );
  ring.position.y = PLATE_HEIGHT / 2 + 0.01;
  modules.lights.add(ring);
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.025, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.4 }),
  );
  line.position.set(-0.35, 0, 1.005);
  modules.energy.add(line);

  // Bottom to top: energy, security, climate, lights.
  const order = [...MODULE_IDS].reverse();
  const yFor = (index: number, t: number) =>
    BASE_HEIGHT + PLATE_HEIGHT / 2 + index * PLATE_HEIGHT + t * (index + 1) * EXPLODED_GAP;

  let active: ModuleId | null = null;
  let explode = 0;
  const apply = () => {
    order.forEach((id, i) => {
      const m = modules[id];
      m.position.y = yFor(i, explode);
      m.position.z = active === id ? FORWARD * explode : 0;
      const mat = materials[id];
      mat.emissive.setHex(active === id ? 0x2a1608 : 0x000000);
    });
  };
  apply();

  return {
    group,
    base,
    modules,
    setExplode(t) {
      explode = Math.min(1, Math.max(0, t));
      apply();
    },
    setActive(id) {
      // The active module comes forward in proportion to how far apart the hub is.
      active = id;
      apply();
    },
    centreY(t) {
      return (yFor(0, t) + yFor(order.length - 1, t)) / 2;
    },
  };
}
