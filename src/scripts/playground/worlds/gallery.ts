import * as THREE from 'three';
import { buildExitDoor, buildRoom, imageOr, labelTexture, makeKit, markHits, roomLights, type Kit } from '../kit';
import { glowTexture } from '../textures';
import { rankTexture } from './library';
import type { Interactable, LibraryCard, PlaygroundData, World, WorldId } from '../types';

const POSTER_W = 1.5;
const POSTER_H = 2.17;
const STEP = 1.9; // poster spacing along a wall
const GROUP_GAP = 0.9;
const POSTER_Y = 2.35;
const W = 14;
const H = 6.8;

export interface GalleryOptions {
  id: WorldId;
  /** Item ids are `${prefix}:<index in cards>`. */
  prefix: string;
  cards: LibraryCard[];
  emoji: string;
  floor: THREE.Texture | THREE.ColorRepresentation;
  wall: THREE.Texture | THREE.ColorRepresentation;
  trim: THREE.ColorRepresentation;
  background: number;
  light: number;
  accent: string;
  /** Drawn poster for items without an image. */
  poster(card: LibraryCard, i: number): THREE.Texture;
  /** Extra furniture. Returns obstacles and an update function. */
  decorate?(ctx: { scene: THREE.Scene; kit: Kit; W: number; D: number; H: number; backTop: number }): { obstacles?: World['obstacles']; update?(t: number): void };
}

type Group = { title: string; items: { card: LibraryCard; index: number }[] };

/**
 * A room of posters: ranked favorites in a row on the back wall, everything else grouped by
 * category along the side walls, each group under its own sign.
 */
export function buildGallery(data: PlaygroundData, o: GalleryOptions) {
  return (gradientMap: THREE.Texture): World => {
    const kit = makeKit(gradientMap);
    const { toon, glow, box, ball, at } = kit;

    const indexed = o.cards.map((card, index) => ({ card, index }));
    const ranked = indexed.filter((c) => c.card.rank).sort((a, b) => a.card.rank! - b.card.rank!);
    const groups = new Map<string, Group>();
    for (const c of indexed) {
      if (c.card.rank) continue;
      const key = c.card.category || data.strings.moreItems;
      if (!groups.has(key)) groups.set(key, { title: key, items: [] });
      groups.get(key)!.items.push(c);
    }
    // Split the groups between the two side walls, balancing their lengths.
    const span = (g: Group) => g.items.length * STEP;
    const walls: Group[][] = [[], []];
    const used = [0, 0];
    for (const g of groups.values()) {
      const w = used[0] <= used[1] ? 0 : 1;
      walls[w].push(g);
      used[w] += span(g) + GROUP_GAP;
    }
    const sideLength = Math.max(...used, 0);
    const D = Math.max(16, sideLength + 5.5);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(o.background);
    scene.fog = new THREE.Fog(o.background, 18, 44);
    roomLights(scene, o.light, 0x221a2a, 1.2);
    buildRoom(scene, kit, { width: W, depth: D, height: H, floor: o.floor, wall: o.wall, trim: o.trim });

    const items: Interactable[] = [];
    const obstacles: NonNullable<World['obstacles']> = [];
    const frameMat = toon(0x241a2c);
    const litMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff1c4).multiplyScalar(1.6) });

    const poster = (card: LibraryCard, index: number, rank?: number) => {
      const g = new THREE.Group();
      const frame = box(POSTER_W + 0.2, POSTER_H + 0.23, 0.1, frameMat);
      const lit = new THREE.Mesh(new THREE.PlaneGeometry(POSTER_W + 0.36, POSTER_H + 0.39), litMat);
      lit.position.z = -0.06;
      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(POSTER_W, POSTER_H),
        new THREE.MeshBasicMaterial({ map: imageOr(card.image, () => o.poster(card, index), POSTER_W / POSTER_H), color: 0xe0dcd4 }),
      );
      art.position.z = 0.056;
      g.add(lit, frame, art);
      if (rank) {
        const badge = new THREE.Mesh(new THREE.CircleGeometry(0.26, 28), new THREE.MeshBasicMaterial({ map: rankTexture(rank), transparent: true }));
        badge.position.set(POSTER_W / 2 - 0.12, POSTER_H / 2 - 0.12, 0.08);
        g.add(badge);
      }
      return { g, hits: [frame, art] };
    };
    const sign = (text: string, sub: string, width: number, top = false) =>
      new THREE.Mesh(
        new THREE.PlaneGeometry(width, width / 4),
        new THREE.MeshBasicMaterial({ map: labelTexture(text, { sub, bg: top ? '#ffd166' : '#fff3dc', border: top ? '#9b2226' : o.accent }), color: 0xe0d8cc, transparent: true }),
      );

    // Back wall: the ranked favorites.
    const backZ = -D / 2 + 0.12;
    if (ranked.length) {
      const n = ranked.length;
      const step = Math.min(STEP, (W - 1.6) / n);
      ranked.forEach(({ card, index }, k) => {
        const x = -((n - 1) * step) / 2 + k * step;
        const { g, hits } = poster(card, index, card.rank);
        g.scale.setScalar(Math.min(1, step / STEP));
        g.position.set(x, POSTER_Y, backZ);
        scene.add(g);
        const light = new THREE.PointLight(0xfff1c4, 2.5, 4, 1.8);
        light.position.set(x, 3.8, backZ + 1.2);
        scene.add(light);
        const id = `${o.prefix}:${index}`;
        items.push({
          id,
          kind: 'item',
          label: card.title,
          emoji: '🏆',
          front: new THREE.Vector3(x, 0, -D / 2 + 1.9),
          facing: Math.PI,
          hits: markHits(hits, id),
          setNear(nv) {
            light.intensity = nv ? 6 : 2.5;
          },
        });
      });
      const top = sign(data.strings.allTimeTop.replace('{n}', String(n)), '🏆', 3.6, true);
      top.position.set(0, POSTER_Y + POSTER_H / 2 + 0.75, backZ + 0.02);
      scene.add(top);
    }
    const backTop = ranked.length ? POSTER_Y + POSTER_H / 2 + 1.25 : 0.4;

    // Side walls: one run of posters per category, front (door end) to back.
    walls.forEach((list, w) => {
      const side = w === 0 ? -1 : 1;
      const x = side * (W / 2 - 0.12);
      let z = D / 2 - 3.4;
      for (const group of list) {
        const n = group.items.length;
        const start = z;
        group.items.forEach(({ card, index }, k) => {
          const pz = start - k * STEP - STEP / 2;
          const { g, hits } = poster(card, index);
          g.position.set(x, POSTER_Y, pz);
          g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
          scene.add(g);
          const light = new THREE.PointLight(0xfff1c4, 2.2, 4, 1.8);
          light.position.set(side * (W / 2 - 1), 3.7, pz);
          scene.add(light);
          const id = `${o.prefix}:${index}`;
          items.push({
            id,
            kind: 'item',
            label: card.title,
            emoji: o.emoji,
            front: new THREE.Vector3(side * (W / 2 - 1.3), 0, pz),
            facing: side < 0 ? -Math.PI / 2 : Math.PI / 2,
            hits: markHits(hits, id),
            setNear(nv) {
              light.intensity = nv ? 6 : 2.2;
            },
          });
        });
        const len = n * STEP;
        const label = sign(group.title, `${n} ${o.emoji}`, Math.min(3.4, len), false);
        label.position.set(side * (W / 2 - 0.1), POSTER_Y + POSTER_H / 2 + 0.6, start - len / 2);
        label.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        scene.add(label);
        z = start - len - GROUP_GAP;
      }
    });

    // Soft ceiling lamps down the middle.
    const lampGlow = glowTexture('rgba(255,214,150,0.6)');
    for (let z = D / 2 - 3; z > -D / 2 + 2; z -= 6) {
      scene.add(at(ball(0.2, glow(0xffd29a, 2)), 0, H - 0.45, z));
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lampGlow, transparent: true, depthWrite: false }));
      halo.scale.set(0.9, 0.9, 1);
      scene.add(at(halo, 0, H - 0.45, z));
      scene.add(at(new THREE.PointLight(0xffd29a, 4, 9, 1.6), 0, H - 0.7, z));
    }

    const extra = o.decorate?.({ scene, kit, W, D, H, backTop }) ?? {};
    obstacles.push(...(extra.obstacles ?? []));

    const exit = buildExitDoor(scene, kit, W / 2 - 0.05, D / 2 - 1.6, data.strings.back);
    items.push({ id: 'exit', kind: 'exit', label: data.strings.back, emoji: '🏮', front: new THREE.Vector3(W / 2 - 1.2, 0, D / 2 - 1.6), facing: Math.PI / 2, hits: markHits(exit.hits, 'exit') });

    return {
      id: o.id,
      scene,
      bounds: { minX: -W / 2 + 1.2, maxX: W / 2 - 1.2, minZ: -D / 2 + 1.9, maxZ: D / 2 - 0.8 },
      obstacles,
      spawn: new THREE.Vector3(0, 0, D / 2 - 1.6),
      spawnFacing: Math.PI,
      camera: { back: 6, up: 4.2, lookAhead: 3, lookY: 1.8, followX: 0.75 },
      bloom: { strength: 0.45, radius: 0.45, threshold: 0.93 },
      items,
      update(t) {
        extra.update?.(t);
      },
    };
  };
}
