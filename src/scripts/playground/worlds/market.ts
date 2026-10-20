import * as THREE from 'three';
import { buildWorld, STREET } from '../world';
import { buildStall, type StallKind } from '../stall';
import type { Interactable, PlaygroundData, World } from '../types';

const PROPS: Record<string, StallKind> = { studio: 'music', postoffice: 'posts', library: 'novels', theater: 'anime', station: 'travel' };

/** The night market lane: each stall leads into its own world. */
export const marketWorld = (data: PlaygroundData) => (gradientMap: THREE.Texture): World => {
  const scene = new THREE.Scene();
  const scenery = buildWorld(scene, gradientMap);
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
  return {
    id: 'market',
    scene,
    bounds: { minX: -STREET.halfWidth + 0.3, maxX: STREET.halfWidth - 0.3, minZ: STREET.end + 1.5, maxZ: STREET.start - 0.5 },
    spawn: new THREE.Vector3(0, 0, STREET.start - 1),
    spawnFacing: Math.PI,
    camera: { back: 6.6, up: 3.1, lookAhead: 3.5, lookY: 1.5, followX: 0.6 },
    items,
    update: scenery.update,
  };
};
