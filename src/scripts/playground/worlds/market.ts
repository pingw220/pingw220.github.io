import * as THREE from 'three';
import { buildWorld, STREET } from '../world';
import { buildStall, type StallKind } from '../stall';
import { buildFireworks } from '../fireworks';
import { labelTexture, makeKit, markHits } from '../kit';
import type { Interactable, PlaygroundData, World } from '../types';

const PROPS: Record<string, StallKind> = {
  studio: 'music',
  writing: 'posts',
  library: 'novels',
  theater: 'anime',
  station: 'travel',
  sports: 'sports',
  postoffice: 'mail',
};

/** The night market lane: each stall leads into its own world; fireworks at the far end. */
export const marketWorld = (data: PlaygroundData) => (gradientMap: THREE.Texture): World => {
  const scene = new THREE.Scene();
  const scenery = buildWorld(scene, gradientMap);
  const kit = makeKit(gradientMap);
  const { toon, glow, box, cyl, at } = kit;

  const items: Interactable[] = data.stalls.map((def) => {
    const stall = buildStall({ ...def, props: PROPS[def.id] }, gradientMap);
    scene.add(stall.group);
    return {
      id: def.id,
      kind: 'enter',
      label: def.label,
      emoji: def.emoji,
      front: stall.front,
      facing: def.side < 0 ? -Math.PI / 2 : Math.PI / 2,
      hits: stall.hits,
      setNear: stall.setNear,
      update: stall.update,
    };
  });

  // ── Fireworks plaza at the end of the lane ─────────────────────────────────
  const fireworks = buildFireworks(scene);
  const plazaZ = STREET.end + 3.2;
  const launcher = at(new THREE.Group(), 0, 0, plazaZ - 1.6, scene);
  const crate = box(1.4, 0.6, 0.9, toon(0x8a5a3a));
  launcher.add(at(crate, 0, 0.3, 0));
  const rocketColors = [0xff6b6b, 0x4cc9f0, 0xffd166];
  const rockets: THREE.Group[] = [];
  rocketColors.forEach((c, i) => {
    const r = new THREE.Group();
    r.add(at(cyl(0.07, 0.07, 0.7, toon(c)), 0, 0.35, 0), at(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 10), toon(0xfff3dc)), 0, 0.81, 0));
    r.add(at(cyl(0.008, 0.008, 0.2, new THREE.MeshBasicMaterial({ color: 0x1a1a1a })), 0, -0.05, 0));
    launcher.add(at(r, -0.4 + i * 0.4, 0.6, 0));
    rockets.push(r);
  });
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.6),
    new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.fireworks, { emoji: '🎆', bg: '#fff3dc', border: '#f15bb5' }), color: 0xd8d2c8, transparent: true }),
  );
  launcher.add(at(sign, 0, 1.9, 0.1));
  launcher.add(at(cyl(0.04, 0.04, 1.3, toon(0x5e3c27)), -1.0, 0.95, 0), at(cyl(0.04, 0.04, 1.3, toon(0x5e3c27)), 1.0, 0.95, 0));
  // A ring of little lamps around the plaza.
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    at(kit.ball(0.12, glow(rocketColors[k % 3], 1.8)), Math.cos(a) * 3.2, 0.12, plazaZ + Math.sin(a) * 2.2, scene);
  }
  const burstAt = new THREE.Vector3(0, 0.8, plazaZ - 2);
  items.push({
    id: 'fireworks',
    kind: 'item',
    label: data.strings.fireworks,
    emoji: '🎆',
    front: new THREE.Vector3(0, 0, plazaZ + 0.6),
    facing: Math.PI,
    hits: markHits([crate, sign, ...rockets.flatMap((r) => r.children)], 'fireworks'),
    activate() {
      fireworks.show(burstAt, 10);
    },
    skyLook: 7,
    update(t) {
      rockets.forEach((r, i) => (r.position.y = 0.6 + Math.max(0, Math.sin(t * 2 + i)) * 0.05));
    },
  });

  let nextAmbient = 6;
  let elapsed = 0;
  return {
    id: 'market',
    scene,
    bounds: { minX: -STREET.halfWidth + 0.3, maxX: STREET.halfWidth - 0.3, minZ: STREET.end + 2.2, maxZ: STREET.start - 0.5 },
    obstacles: [{ minX: -0.75, maxX: 0.75, minZ: plazaZ - 2.1, maxZ: plazaZ - 1.1 }],
    spawn: new THREE.Vector3(0, 0, STREET.start - 1),
    spawnFacing: Math.PI,
    camera: { back: 6.6, up: 3.1, lookAhead: 3.5, lookY: 1.5, followX: 0.6 },
    items,
    update(t, dt) {
      scenery.update(t, dt);
      fireworks.update(dt);
      elapsed += dt;
      // Now and then, a single rocket goes up on its own.
      if (elapsed > nextAmbient) {
        fireworks.show(burstAt, 1);
        nextAmbient = elapsed + 9 + Math.random() * 8;
      }
    },
  };
};
