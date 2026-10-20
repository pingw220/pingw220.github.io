import * as THREE from 'three';
import { buildExitDoor, buildRoom, FONT, labelTexture, makeKit, markHits, roomLights, wallTexture, woodTexture } from '../kit';
import { canvasTexture, glowTexture } from '../textures';
import type { Interactable, PlaygroundData, World } from '../types';

const W = 13;
const D = 15;
const H = 6;

function letterTexture(title: string, date: string, i: number): THREE.CanvasTexture {
  const tints = ['#fff6e3', '#fdeaea', '#eaf4ff', '#eefbe8'];
  return canvasTexture(384, 256, (g, w, h) => {
    g.fillStyle = tints[i % tints.length];
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,80,50,0.45)';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(w / 2, h * 0.55);
    g.lineTo(w, 0);
    g.stroke();
    // Stamp.
    g.fillStyle = '#e76f51';
    g.fillRect(w - 78, 18, 56, 66);
    g.fillStyle = '#fff6e3';
    g.font = `700 30px ${FONT}`;
    g.textAlign = 'center';
    g.fillText('♪', w - 50, 62);
    g.fillStyle = '#4a2c1a';
    g.textAlign = 'left';
    let size = 30;
    g.font = `800 ${size}px ${FONT}`;
    while (g.measureText(title).width > w - 50 && size > 16) {
      size -= 2;
      g.font = `800 ${size}px ${FONT}`;
    }
    g.fillText(title, 24, h - 70);
    g.font = `500 20px ${FONT}`;
    g.globalAlpha = 0.7;
    g.fillText(date, 24, h - 36);
  });
}

/** Posts → a post office. Every post is a letter pinned to the board. */
export const postOfficeWorld = (data: PlaygroundData) => (gradientMap: THREE.Texture): World => {
  const kit = makeKit(gradientMap);
  const { toon, glow, box, cyl, ball, at } = kit;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x161a26);
  scene.fog = new THREE.Fog(0x161a26, 16, 34);
  roomLights(scene, 0xfff1dd, 0x2e2a35, 1.35);
  buildRoom(scene, kit, { width: W, depth: D, height: H, floor: woodTexture('#8f6a4a', '#7b5a3e'), wall: wallTexture('#2f5d5a', '#346663', 'stripes'), trim: 0x2a1a10 });

  // Counter and pigeonholes along the back.
  at(box(8, 1.1, 1.0, toon(0x7a4f32)), 0, 0.55, -D / 2 + 2.4, scene);
  at(box(8.2, 0.08, 1.2, toon(0x9b6a45)), 0, 1.14, -D / 2 + 2.4, scene);
  const holes = at(new THREE.Group(), 0, 0, -D / 2 + 0.35, scene);
  holes.add(at(box(7.6, 3.4, 0.5, toon(0x5a3a24)), 0, 2.9, 0));
  const envMat = [0xfff6e3, 0xfdeaea, 0xeaf4ff].map((c) => toon(c));
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 10; c++) {
      holes.add(at(box(0.66, 0.56, 0.1, toon(0x3d2718)), -3.3 + c * 0.73, 1.55 + r * 0.66, 0.26));
      if ((r * 7 + c * 3) % 4 === 0) holes.add(at(box(0.5, 0.32, 0.05, envMat[(r + c) % 3]), -3.3 + c * 0.73, 1.5 + r * 0.66, 0.33));
    }
  }
  // Bell, stamp, parcel on the counter.
  at(ball(0.16, toon(0xd4a017)), 2.6, 1.3, -D / 2 + 2.4, scene);
  at(cyl(0.12, 0.12, 0.25, toon(0x9b2226)), -2.4, 1.3, -D / 2 + 2.3, scene);
  at(box(0.8, 0.5, 0.6, toon(0xc8a97e)), -3.3, 1.43, -D / 2 + 2.5, scene);
  at(box(0.06, 0.52, 0.62, toon(0x9b2226)), -3.3, 1.43, -D / 2 + 2.5, scene);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.7), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.postOffice, { emoji: '✉️', bg: '#fff3dc', border: '#2a9d8f' }), color: 0xe0d8cc, transparent: true }));
  sign.position.set(0, 5.1, -D / 2 + 0.62);
  scene.add(sign);

  // Red mailbox near the entrance.
  const items: Interactable[] = [];
  const mailbox = at(new THREE.Group(), 3.8, 0, D / 2 - 3.2, scene);
  const boxBody = cyl(0.42, 0.42, 1.4, toon(0xd62828), 20);
  const top = ball(0.42, toon(0xd62828), 20);
  top.scale.y = 0.6;
  const slot = box(0.4, 0.06, 0.05, toon(0x1a1a1a));
  mailbox.add(at(boxBody, 0, 0.7, 0), at(top, 0, 1.4, 0), at(slot, 0, 1.2, 0.41), at(cyl(0.12, 0.16, 0.12, toon(0x1a1a1a)), 0, 0.06, 0));
  items.push({
    id: 'mailbox',
    kind: 'item',
    label: data.strings.mailbox,
    emoji: '📮',
    front: new THREE.Vector3(3.8, 0, D / 2 - 2.0),
    facing: Math.PI,
    hits: markHits([boxBody, top], 'mailbox'),
  });

  // Cork board with one letter per post (left wall).
  const board = at(new THREE.Group(), -W / 2 + 0.08, 2.4, 0.6, scene);
  board.rotation.y = Math.PI / 2;
  board.add(at(box(7.4, 3.2, 0.08, toon(0xc68b59)), 0, 0, 0));
  for (const [x, y, w, h] of [[0, 1.66, 7.6, 0.14], [0, -1.66, 7.6, 0.14], [-3.76, 0, 0.14, 3.4], [3.76, 0, 0.14, 3.4]] as const) board.add(at(box(w, h, 0.12, toon(0x6b4329)), x, y, 0.02));
  const posts = data.posts.slice(0, 15);
  if (posts.length === 0) {
    const note = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.1), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.noLetters, { emoji: '🌙', bg: '#fff6e3', border: '#2a9d8f' }), color: 0xe0d8cc, transparent: true }));
    note.position.z = 0.06;
    note.rotation.z = -0.04;
    board.add(note);
  }
  posts.forEach((post, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const u = -2.9 + col * 1.45;
    const letter = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.87), new THREE.MeshBasicMaterial({ map: letterTexture(post.title, post.date, i), color: 0xe0d8cc }));
    letter.position.set(u, 0.95 - row * 1.0, 0.06);
    letter.rotation.z = ((i * 37) % 9 - 4) * 0.012;
    board.add(letter);
    board.add(at(ball(0.05, toon(0xe63946), 8), u, 1.35 - row * 1.0, 0.1));
    const id = `post:${i}`;
    items.push({
      id,
      kind: 'item',
      label: post.title,
      emoji: '✉️',
      // Board runs along z on the left wall; letters' u maps to -z.
      front: new THREE.Vector3(-W / 2 + 1.2, 0, 0.6 - u),
      facing: -Math.PI / 2,
      hits: markHits([letter], id),
      setNear(nv) {
        letter.scale.setScalar(nv ? 1.08 : 1);
      },
    });
  });

  // Hanging lamps.
  const lampGlow = glowTexture('rgba(255,214,150,0.65)');
  for (const [x, z] of [[-2.5, 2], [2.5, 2], [0, -3]]) {
    scene.add(at(ball(0.2, glow(0xffd29a, 2.2)), x, H - 0.45, z));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lampGlow, transparent: true, depthWrite: false }));
    halo.scale.set(0.9, 0.9, 1);
    scene.add(at(halo, x, H - 0.45, z));
    scene.add(at(new THREE.PointLight(0xffd29a, 6, 9, 1.5), x, H - 0.45, z));
  }

  const exit = buildExitDoor(scene, kit, W / 2 - 0.05, D / 2 - 1.4, data.strings.back);
  items.push({ id: 'exit', kind: 'exit', label: data.strings.back, emoji: '🏮', front: new THREE.Vector3(W / 2 - 1.2, 0, D / 2 - 1.4), facing: Math.PI / 2, hits: markHits(exit.hits, 'exit') });

  return {
    id: 'postoffice',
    scene,
    bounds: { minX: -W / 2 + 1.2, maxX: W / 2 - 1.2, minZ: -D / 2 + 3.4, maxZ: D / 2 - 0.8 },
    obstacles: [{ minX: 3.35, maxX: 4.25, minZ: D / 2 - 3.65, maxZ: D / 2 - 2.75 }],
    spawn: new THREE.Vector3(0, 0, D / 2 - 1.6),
    spawnFacing: Math.PI,
    camera: { back: 5.8, up: 4.2, lookAhead: 3, lookY: 1.6, followX: 0.75 },
    bloom: { strength: 0.4, radius: 0.4, threshold: 0.94 },
    items,
    update() {},
  };
};
