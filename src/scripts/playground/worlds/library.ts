import * as THREE from 'three';
import { buildExitDoor, buildRoom, EMOJI_FONT, FONT, labelTexture, makeKit, markHits, roomLights, wallTexture, woodTexture } from '../kit';
import { canvasTexture, glowTexture } from '../textures';
import type { Interactable, LibraryCard, PlaygroundData, World } from '../types';

const W = 18;
const D = 20;
const H = 6.5;

const COVER_COLORS = ['#8c2f39', '#2f5d8a', '#3f7a5a', '#7b4fa0', '#b5651d', '#1f6f78', '#a23b72', '#4b5d16', '#5c3c92', '#9a3412'];

/** A book cover drawn on a canvas: title (vertical for Chinese), author, a simple ornament. */
function coverTexture(book: LibraryCard, i: number, lang: 'en' | 'zh'): THREE.CanvasTexture {
  const color = COVER_COLORS[i % COVER_COLORS.length];
  return canvasTexture(320, 460, (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.22)';
    g.fillRect(0, 0, 26, h); // spine shadow
    g.strokeStyle = '#f4d58d';
    g.lineWidth = 6;
    g.strokeRect(42, 22, w - 64, h - 44);
    g.lineWidth = 2;
    g.strokeRect(54, 34, w - 88, h - 68);
    g.fillStyle = '#fff6e3';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const title = book.title;
    const cjk = /[㐀-鿿]/.test(title);
    if (cjk) {
      const chars = [...title].filter((c) => c.trim());
      const size = Math.min(64, Math.floor(300 / chars.length));
      g.font = `800 ${size}px ${FONT}`;
      const cols = chars.length > 6 ? 2 : 1;
      const perCol = Math.ceil(chars.length / cols);
      chars.forEach((c, k) => {
        const col = Math.floor(k / perCol);
        const x = cols === 1 ? w / 2 + 12 : w / 2 + 12 + (cols - 1 - col * 2) * (size * 0.55);
        g.fillText(c, x, 70 + (k % perCol) * (size + 6) + size / 2);
      });
    } else {
      // Wrap Latin titles.
      let size = 40;
      g.font = `800 ${size}px ${FONT}`;
      const words = title.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (g.measureText(test).width > w - 120 && line) {
          lines.push(line);
          line = word;
        } else line = test;
      }
      lines.push(line);
      if (lines.length > 5) size = 32;
      g.font = `800 ${size}px ${FONT}`;
      lines.forEach((l, k) => g.fillText(l, w / 2 + 12, 120 + k * (size + 10)));
    }
    g.font = `600 22px ${FONT}`;
    g.fillStyle = '#f4d58d';
    if (book.subtitle) g.fillText(book.subtitle, w / 2 + 12, h - 70);
    g.font = `30px ${EMOJI_FONT}`;
    g.fillText(lang === 'zh' ? '⚔️' : '📖', w / 2 + 12, h - 115);
  });
}

/** Novels → a library. Each novel stands on a display table; walk up to open it. */
export const libraryWorld = (data: PlaygroundData) => (gradientMap: THREE.Texture): World => {
  const kit = makeKit(gradientMap);
  const { toon, glow, box, cyl, ball, at } = kit;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1420);
  scene.fog = new THREE.Fog(0x1a1420, 18, 40);
  roomLights(scene, 0xffe7c4, 0x3a2a2a, 1.3);
  buildRoom(scene, kit, { width: W, depth: D, height: H, floor: woodTexture('#7a4b2e', '#6a3f25'), wall: wallTexture('#4a3b33', '#54443a', 'stripes'), trim: 0x2e1d12 });

  // ── Bookshelves along the walls, full of colorful books ───────────────────
  const shelfMat = toon(0x5a3a24);
  const bookGeo = new THREE.BoxGeometry(1, 1, 1);
  const bookMat = toon(0xffffff);
  const spines: THREE.Matrix4[] = [];
  const spineColors: THREE.Color[] = [];
  const palette = [0x8c2f39, 0x2f5d8a, 0x3f7a5a, 0x7b4fa0, 0xd9a441, 0x1f6f78, 0xa23b72, 0xc2b280, 0x5c3c92, 0xe07a5f];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let seed = 3;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function shelfUnit(x: number, z: number, ry: number, width: number) {
    const unit = new THREE.Group();
    unit.add(at(box(width, H - 0.6, 0.5, shelfMat), 0, (H - 0.6) / 2, -0.05));
    for (let r = 0; r < 5; r++) {
      const y = 0.35 + r * 1.1;
      unit.add(at(box(width - 0.1, 0.06, 0.55, toon(0x7a4f32)), 0, y, 0.05));
      let cx = -width / 2 + 0.15;
      while (cx < width / 2 - 0.2) {
        const bw = 0.12 + rand() * 0.1;
        const bh = 0.7 + rand() * 0.28;
        const tilt = rand() < 0.08 ? 0.18 : 0;
        const local = new THREE.Vector3(cx + bw / 2, y + 0.03 + bh / 2, 0.08);
        m.compose(local, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), tilt), new THREE.Vector3(bw, bh, 0.38));
        unit.updateMatrixWorld();
        spines.push(m.clone().premultiply(new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry), new THREE.Vector3(1, 1, 1))));
        spineColors.push(new THREE.Color(palette[Math.floor(rand() * palette.length)]));
        cx += bw + 0.015 + (rand() < 0.1 ? 0.25 : 0);
      }
    }
    unit.position.set(x, 0, z);
    unit.rotation.y = ry;
    scene.add(unit);
  }
  for (const x of [-6, -2, 2, 6]) shelfUnit(x, -D / 2 + 0.3, 0, 3.6);
  for (const z of [-6, -2.2, 1.6]) {
    shelfUnit(-W / 2 + 0.3, z, Math.PI / 2, 3.6);
    shelfUnit(W / 2 - 0.3, z, -Math.PI / 2, 3.6);
  }
  const books = new THREE.InstancedMesh(bookGeo, bookMat, spines.length);
  spines.forEach((mat, i) => {
    books.setMatrixAt(i, mat);
    books.setColorAt(i, spineColors[i]);
  });
  scene.add(books);

  // A rolling ladder, a reading nook, and a window with the moon.
  const ladder = at(new THREE.Group(), 4.5, 0, -D / 2 + 0.9, scene);
  for (const s of [-1, 1]) ladder.add(at(box(0.07, 4.8, 0.07, toon(0x8a5a3a)), s * 0.35, 2.4, 0));
  for (let k = 0; k < 9; k++) ladder.add(at(box(0.7, 0.05, 0.07, toon(0x8a5a3a)), 0, 0.4 + k * 0.5, 0));
  ladder.rotation.x = -0.12;
  const nook = at(new THREE.Group(), -W / 2 + 2, 0, D / 2 - 6.5, scene);
  nook.add(at(box(1.3, 0.5, 1.1, toon(0xb5524a)), 0, 0.3, 0), at(box(1.3, 1.0, 0.25, toon(0xb5524a)), 0, 0.9, -0.45));
  for (const s of [-1, 1]) nook.add(at(box(0.25, 0.75, 1.1, toon(0x9c4038)), s * 0.6, 0.55, 0));
  nook.add(at(cyl(0.03, 0.03, 1.8, toon(0x2b2b33)), 1.1, 0.9, -0.2), at(ball(0.28, glow(0xffd29a, 1.8)), 1.1, 1.85, -0.2));
  const nookLight = new THREE.PointLight(0xffd29a, 5, 6, 1.6);
  nook.add(at(nookLight, 1.1, 1.6, 0));
  const plant = at(new THREE.Group(), -W / 2 + 0.9, 0, D / 2 - 4.2, scene);
  plant.add(at(cyl(0.3, 0.22, 0.5, toon(0xc0764a)), 0, 0.25, 0), at(ball(0.55, toon(0x3c7d55)), 0, 0.95, 0), at(ball(0.4, toon(0x4a8a5c)), 0.25, 1.35, 0.1));
  const window_ = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.2), new THREE.MeshBasicMaterial({ color: 0x1e2a5a }));
  window_.position.set(0, 4.2, -D / 2 + 0.6);
  scene.add(window_);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff1c4).multiplyScalar(1.5) }));
  moon.position.set(0.7, 4.5, -D / 2 + 0.62);
  scene.add(moon);
  for (const [w, h, x, y] of [[3.2, 0.1, 0, 3.1], [3.2, 0.1, 0, 5.3], [0.1, 2.3, -1.55, 4.2], [0.1, 2.3, 1.55, 4.2], [0.06, 2.2, 0, 4.2], [3, 0.06, 0, 4.2]] as const)
    scene.add(at(box(w, h, 0.08, toon(0x3d2718)), x, y, -D / 2 + 0.66));

  // Warm lamps over the tables.
  const lampGlow = glowTexture('rgba(255,214,150,0.65)');
  for (const [x, z] of [[-4, 3], [4, 3], [-4, -3], [4, -3], [0, 6]]) {
    scene.add(at(ball(0.22, glow(0xffd29a, 2.2)), x, H - 0.45, z));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lampGlow, transparent: true, depthWrite: false }));
    halo.scale.set(0.9, 0.9, 1);
    scene.add(at(halo, x, H - 0.45, z));
    scene.add(at(new THREE.PointLight(0xffd29a, 6, 9, 1.5), x, H - 0.65, z));
  }

  // ── Display tables: one per author with 3+ books, the rest share a table ───
  const items: Interactable[] = [];
  const byAuthor = new Map<string, LibraryCard[]>();
  for (const b of data.novels) {
    const key = b.subtitle ?? '';
    byAuthor.set(key, [...(byAuthor.get(key) ?? []), b]);
  }
  const groups: { title: string; books: LibraryCard[] }[] = [];
  const others: LibraryCard[] = [];
  for (const [author, list] of byAuthor) (list.length >= 3 && author ? groups.push({ title: author, books: list }) : others.push(...list));
  if (others.length) groups.push({ title: data.strings.moreBooks, books: others });

  // Tables along the left and right sides (books facing the center aisle), then one at the back.
  const obstacles: NonNullable<World['obstacles']> = [];
  const slots = [
    { x: -4.4, z: 0, facing: -Math.PI / 2, along: 'z' as const, dir: 1 },
    { x: 4.4, z: 0, facing: Math.PI / 2, along: 'z' as const, dir: -1 },
    { x: 0, z: -6.6, facing: Math.PI, along: 'x' as const, dir: 1 },
  ];
  let bookIndex = 0;
  groups.slice(0, slots.length).forEach((group, gi) => {
    const slot = slots[gi];
    const n = group.books.length;
    const spacing = Math.min(0.82, 12 / Math.max(n, 1));
    const length = Math.max(2.6, n * spacing + 0.6);
    const table = new THREE.Group();
    table.add(at(box(length, 0.9, 1.0, toon(0x6b4329)), 0, 0.45, 0), at(box(length + 0.2, 0.08, 1.15, toon(0x8a5a3a)), 0, 0.93, 0));
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 0.62),
      new THREE.MeshBasicMaterial({ map: labelTexture(group.title, { sub: `${n} 📚`, bg: '#fff3dc', border: '#9b5de5', height: 192 }), color: 0xe0d8cc, transparent: true }),
    );
    sign.position.set(0, 2.55, -0.35);
    table.add(sign);
    table.position.set(slot.x, 0, slot.z);
    // Local +z of the table faces the aisle.
    table.rotation.y = slot.along === 'z' ? slot.facing + Math.PI : 0;
    scene.add(table);
    const half = length / 2 + 0.1;
    obstacles.push(slot.along === 'z' ? { minX: slot.x - 0.58, maxX: slot.x + 0.58, minZ: slot.z - half, maxZ: slot.z + half } : { minX: slot.x - half, maxX: slot.x + half, minZ: slot.z - 0.58, maxZ: slot.z + 0.58 });

    group.books.forEach((book, k) => {
      const u = (-((n - 1) * spacing) / 2 + k * spacing) * slot.dir;
      const g = new THREE.Group();
      const cover = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.9), new THREE.MeshBasicMaterial({ map: coverTexture(book, bookIndex, data.lang), color: 0xdcd6cc }));
      cover.position.z = 0.056;
      const block = box(0.62, 0.9, 0.11, toon(0xf3ead7));
      g.add(block, cover);
      g.position.set(u, 1.42, 0.05);
      g.rotation.x = -0.12;
      table.add(g);
      const world = new THREE.Vector3();
      table.updateMatrixWorld(true);
      g.getWorldPosition(world);
      const out = new THREE.Vector3(Math.sin(slot.facing + Math.PI), 0, Math.cos(slot.facing + Math.PI)); // toward the aisle
      const id = `book:${bookIndex}`;
      const baseY = 1.42;
      let isNear = false;
      items.push({
        id,
        kind: 'item',
        label: book.title,
        emoji: '📖',
        front: new THREE.Vector3(world.x, 0, world.z).addScaledVector(out, 1.25),
        facing: slot.facing,
        hits: markHits([block, cover], id),
        setNear(nv) {
          isNear = nv;
        },
        update(t) {
          const goal = isNear ? baseY + 0.18 + Math.sin(t * 3) * 0.03 : baseY;
          g.position.y += (goal - g.position.y) * 0.15;
          g.rotation.x += ((isNear ? 0 : -0.12) - g.rotation.x) * 0.15;
        },
      });
      bookIndex++;
    });
  });

  const exit = buildExitDoor(scene, kit, -W / 2 + 0.05, D / 2 - 1.8, data.strings.back);
  items.push({ id: 'exit', kind: 'exit', label: data.strings.back, emoji: '🏮', front: new THREE.Vector3(-W / 2 + 1.2, 0, D / 2 - 1.8), facing: -Math.PI / 2, hits: markHits(exit.hits, 'exit') });

  return {
    id: 'library',
    scene,
    bounds: { minX: -W / 2 + 1.2, maxX: W / 2 - 1.2, minZ: -5.2, maxZ: D / 2 - 0.8 },
    obstacles,
    spawn: new THREE.Vector3(0, 0, D / 2 - 1.6),
    spawnFacing: Math.PI,
    camera: { back: 6, up: 4.6, lookAhead: 3, lookY: 1.4, followX: 0.75 },
    bloom: { strength: 0.4, radius: 0.4, threshold: 0.94 },
    items,
    update() {},
  };
};
