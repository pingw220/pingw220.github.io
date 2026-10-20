import * as THREE from 'three';
import { buildExitDoor, buildRoom, FONT, labelTexture, makeKit, markHits, roomLights, wallTexture, woodTexture } from '../kit';
import { canvasTexture, glowTexture } from '../textures';
import type { Interactable, PlaygroundData, World } from '../types';

const W = 13;
const D = 14;
const H = 6;

/** A note card for one post. */
export function noteTexture(title: string, sub: string, i: number): THREE.CanvasTexture {
  const tints = ['#fff6e3', '#fdeaea', '#eaf4ff', '#eefbe8', '#fff3c4'];
  return canvasTexture(384, 256, (g, w, h) => {
    g.fillStyle = tints[i % tints.length];
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,150,200,0.35)';
    g.lineWidth = 2;
    for (let y = 70; y < h; y += 34) {
      g.beginPath();
      g.moveTo(16, y);
      g.lineTo(w - 16, y);
      g.stroke();
    }
    g.fillStyle = '#4a2c1a';
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    let size = 30;
    g.font = `800 ${size}px ${FONT}`;
    while (g.measureText(title).width > w - 40 && size > 16) {
      size -= 2;
      g.font = `800 ${size}px ${FONT}`;
    }
    g.fillText(title, 20, 54);
    g.font = `500 20px ${FONT}`;
    g.globalAlpha = 0.7;
    const words = sub.split(/(\s+)/);
    let line = '';
    let y = 100;
    for (const word of words) {
      const test = line + word;
      if (g.measureText(test).width > w - 40 && line) {
        g.fillText(line, 20, y);
        line = word.trimStart();
        y += 34;
        if (y > h - 10) break;
      } else line = test;
    }
    if (y <= h - 10) g.fillText(line, 20, y);
  });
}

/** Posts → a cozy writing room. Every post is a note on the cork board. */
export const writingWorld = (data: PlaygroundData) => (gradientMap: THREE.Texture): World => {
  const kit = makeKit(gradientMap);
  const { toon, glow, box, cyl, ball, at } = kit;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1622);
  scene.fog = new THREE.Fog(0x1a1622, 16, 34);
  roomLights(scene, 0xffeedd, 0x2e2a35, 1.3);
  buildRoom(scene, kit, { width: W, depth: D, height: H, floor: woodTexture('#8f6a4a', '#7b5a3e'), wall: wallTexture('#5b4a6e', '#64527a', 'dots'), trim: 0x2a1a10 });

  // Writing desk with a typewriter, lamp, and stacks of paper.
  const desk = at(new THREE.Group(), 0, 0, -D / 2 + 1.8, scene);
  desk.add(at(box(3.6, 0.1, 1.4, toon(0x8a5a3a)), 0, 1.0, 0));
  for (const [x, z] of [[-1.65, -0.6], [1.65, -0.6], [-1.65, 0.6], [1.65, 0.6]]) desk.add(at(box(0.1, 1.0, 0.1, toon(0x5e3c27)), x, 0.5, z));
  const typewriter = at(new THREE.Group(), 0, 1.05, 0.1, desk);
  typewriter.add(at(box(1.0, 0.25, 0.7, toon(0x2b2f5c)), 0, 0.13, 0), at(box(0.9, 0.08, 0.3, toon(0x1d2040)), 0, 0.28, -0.25));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) typewriter.add(at(cyl(0.03, 0.03, 0.03, toon(0xfff3dc), 8), -0.35 + c * 0.1, 0.27, 0.05 + r * 0.09));
  typewriter.add(at(box(0.7, 0.45, 0.01, toon(0xfffaf0)), 0, 0.55, -0.28));
  desk.add(at(box(0.6, 0.06, 0.45, toon(0xfffaf0)), -1.2, 1.09, 0.1));
  desk.add(at(cyl(0.02, 0.02, 0.7, toon(0x2b2b33)), 1.3, 1.4, -0.3), at(ball(0.16, glow(0xffd29a, 2)), 1.3, 1.78, -0.3));
  const deskLight = new THREE.PointLight(0xffd29a, 5, 6, 1.6);
  desk.add(at(deskLight, 1.2, 1.7, 0.2));
  desk.add(at(cyl(0.09, 0.08, 0.16, toon(0xe76f51)), 1.0, 1.13, 0.35)); // coffee cup
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.7), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.writingRoom, { emoji: '✍️', bg: '#fff3dc', border: '#2a9d8f' }), color: 0xe0d8cc, transparent: true }));
  sign.position.set(0, 4.9, -D / 2 + 0.08);
  scene.add(sign);
  // Window with the moon, and a bookshelf.
  scene.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), new THREE.MeshBasicMaterial({ color: 0x1e2a5a })), 3.8, 3.4, -D / 2 + 0.06));
  scene.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.35, 28), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff1c4).multiplyScalar(1.5) })), 4.3, 3.7, -D / 2 + 0.08));
  const shelf = at(new THREE.Group(), -4.2, 0, -D / 2 + 0.4, scene);
  shelf.add(at(box(2.4, 3.2, 0.5, toon(0x5a3a24)), 0, 1.6, 0));
  const spineColors = [0x8c2f39, 0x2f5d8a, 0x3f7a5a, 0xd9a441, 0x7b4fa0];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) shelf.add(at(box(0.18, 0.6, 0.3, toon(spineColors[(r + k) % 5])), -0.95 + k * 0.24, 0.55 + r * 1.0, 0.12));
  at(new THREE.Group().add(at(cyl(0.3, 0.22, 0.5, toon(0xc0764a)), 0, 0.25, 0), at(ball(0.5, toon(0x3c7d55)), 0, 0.9, 0)), W / 2 - 1, 0, -D / 2 + 1, scene);

  // Cork board with one note per post (left wall).
  const items: Interactable[] = [];
  const board = at(new THREE.Group(), -W / 2 + 0.08, 2.4, 1, scene);
  board.rotation.y = Math.PI / 2;
  board.add(at(box(7.4, 3.2, 0.08, toon(0xc68b59)), 0, 0, 0));
  for (const [x, y, w, h] of [[0, 1.66, 7.6, 0.14], [0, -1.66, 7.6, 0.14], [-3.76, 0, 0.14, 3.4], [3.76, 0, 0.14, 3.4]] as const) board.add(at(box(w, h, 0.12, toon(0x6b4329)), x, y, 0.02));
  const posts = data.posts.slice(0, 15);
  if (posts.length === 0) {
    const note = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.1), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.noPosts, { emoji: '🌙', bg: '#fff6e3', border: '#2a9d8f' }), color: 0xe0d8cc, transparent: true }));
    note.position.z = 0.06;
    note.rotation.z = -0.04;
    board.add(note);
  }
  posts.forEach((post, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const u = -2.9 + col * 1.45;
    const note = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.87), new THREE.MeshBasicMaterial({ map: noteTexture(post.title, post.description, i), color: 0xe0d8cc }));
    note.position.set(u, 0.95 - row * 1.0, 0.06);
    note.rotation.z = (((i * 37) % 9) - 4) * 0.012;
    board.add(note);
    board.add(at(ball(0.05, toon(0xe63946), 8), u, 1.35 - row * 1.0, 0.1));
    const id = `post:${i}`;
    items.push({
      id,
      kind: 'item',
      label: post.title,
      emoji: '📝',
      front: new THREE.Vector3(-W / 2 + 1.2, 0, 1 - u),
      facing: -Math.PI / 2,
      hits: markHits([note], id),
      setNear(nv) {
        note.scale.setScalar(nv ? 1.08 : 1);
      },
    });
  });

  const lampGlow = glowTexture('rgba(255,214,150,0.65)');
  for (const [x, z] of [[-2.5, 2], [2.5, 2]]) {
    scene.add(at(ball(0.2, glow(0xffd29a, 2.2)), x, H - 0.45, z));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lampGlow, transparent: true, depthWrite: false }));
    halo.scale.set(0.9, 0.9, 1);
    scene.add(at(halo, x, H - 0.45, z));
    scene.add(at(new THREE.PointLight(0xffd29a, 6, 9, 1.5), x, H - 0.65, z));
  }

  const exit = buildExitDoor(scene, kit, W / 2 - 0.05, D / 2 - 1.4, data.strings.back);
  items.push({ id: 'exit', kind: 'exit', label: data.strings.back, emoji: '🏮', front: new THREE.Vector3(W / 2 - 1.2, 0, D / 2 - 1.4), facing: Math.PI / 2, hits: markHits(exit.hits, 'exit') });

  return {
    id: 'writing',
    scene,
    bounds: { minX: -W / 2 + 1.2, maxX: W / 2 - 1.2, minZ: -D / 2 + 3.1, maxZ: D / 2 - 0.8 },
    spawn: new THREE.Vector3(0, 0, D / 2 - 1.6),
    spawnFacing: Math.PI,
    camera: { back: 5.8, up: 4.2, lookAhead: 3, lookY: 1.6, followX: 0.75 },
    bloom: { strength: 0.4, radius: 0.4, threshold: 0.94 },
    items,
    update() {},
  };
};
