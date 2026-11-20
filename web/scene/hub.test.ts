import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { buildHub, MODULE_IDS, triangleCount } from "./hub";

// PLAN phase 2b, DESIGN.md 6, rule 1.
describe("the procedural hub", () => {
  const hub = buildHub();

  it("has a base and four modules, in the DESIGN.md order", () => {
    expect(hub.base).toBeInstanceOf(THREE.Object3D);
    expect(MODULE_IDS).toEqual(["lights", "climate", "security", "energy"]);
    expect(Object.keys(hub.modules)).toEqual([...MODULE_IDS]);
  });

  it("stays under 20,000 triangles", () => {
    const count = triangleCount(hub.group);
    expect(count).toBeGreaterThan(100);
    expect(count).toBeLessThan(20_000);
  });

  it("is built from shapes only: no textures or image files (rule 1)", () => {
    hub.group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of materials) {
        const textured = m as THREE.MeshStandardMaterial;
        expect(textured.map ?? null).toBeNull();
        expect(textured.normalMap ?? null).toBeNull();
      }
    });
  });

  it("stacks the modules when assembled and spreads them when exploded", () => {
    hub.setExplode(0);
    const assembled = MODULE_IDS.map((id) => hub.modules[id].position.y);
    hub.setExplode(1);
    const exploded = MODULE_IDS.map((id) => hub.modules[id].position.y);
    // Lights is on top, energy at the bottom, in both states.
    expect([...assembled].sort((a, b) => b - a)).toEqual(assembled);
    expect([...exploded].sort((a, b) => b - a)).toEqual(exploded);
    const spread = (ys: number[]) => (ys[0] ?? 0) - (ys[ys.length - 1] ?? 0);
    expect(spread(exploded)).toBeGreaterThan(spread(assembled) * 3);
  });

  it("brings the active module forward and leaves the others in place", () => {
    hub.setExplode(1);
    hub.setActive("climate");
    expect(hub.modules.climate.position.z).toBeGreaterThan(hub.modules.lights.position.z);
    hub.setActive(null);
    expect(hub.modules.climate.position.z).toBe(hub.modules.lights.position.z);
  });
});
