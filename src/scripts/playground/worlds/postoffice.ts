import * as THREE from 'three';
import { buildExitDoor, buildRoom, labelTexture, makeKit, markHits, roomLights, wallTexture, woodTexture } from '../kit';
import { glowTexture } from '../textures';
import { noteTexture } from './writing';
import type { Interactable, PlaygroundData, World } from '../types';

const W = 13;
const D = 15;
const H = 6;

export interface PublicMessage {
  id: number;
  name: string;
  message: string;
  date: string;
}

/**
 * Messages → a post office. Drop a letter in the mailbox (public or private); public
 * letters are pinned to the board. The page loads messages and sends them here with a
 * `playground:messages` event.
 */
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
  at(ball(0.16, toon(0xd4a017)), 2.6, 1.3, -D / 2 + 2.4, scene);
  at(cyl(0.12, 0.12, 0.25, toon(0x9b2226)), -2.4, 1.3, -D / 2 + 2.3, scene);
  at(box(0.8, 0.5, 0.6, toon(0xc8a97e)), -3.3, 1.43, -D / 2 + 2.5, scene);
  at(box(0.06, 0.52, 0.62, toon(0x9b2226)), -3.3, 1.43, -D / 2 + 2.5, scene);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.7), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.postOffice, { emoji: '✉️', bg: '#fff3dc', border: '#2a9d8f' }), color: 0xe0d8cc, transparent: true }));
  sign.position.set(0, 5.1, -D / 2 + 0.62);
  scene.add(sign);

  // Red mailbox: walk up to it to write a message.
  const items: Interactable[] = [];
  const mailbox = at(new THREE.Group(), 3.6, 0, D / 2 - 4.2, scene);
  const boxBody = cyl(0.45, 0.45, 1.5, toon(0xd62828), 20);
  const top = ball(0.45, toon(0xd62828), 20);
  top.scale.y = 0.6;
  mailbox.add(at(boxBody, 0, 0.75, 0), at(top, 0, 1.5, 0), at(box(0.42, 0.06, 0.05, toon(0x1a1a1a)), 0, 1.25, 0.44), at(cyl(0.12, 0.16, 0.12, toon(0x1a1a1a)), 0, 0.06, 0));
  const mailSign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.writeMessage, { emoji: '💌', bg: '#fff3dc', border: '#d62828' }), color: 0xe0d8cc, transparent: true }));
  mailbox.add(at(mailSign, 0, 2.35, 0));
  const heart = ball(0.12, glow(0xff6b9a, 1));
  mailbox.add(at(heart, 0, 1.95, 0));
  items.push({
    id: 'mailbox',
    kind: 'station',
    label: data.strings.writeMessage,
    emoji: '💌',
    front: new THREE.Vector3(3.6, 0, D / 2 - 2.9),
    facing: Math.PI,
    hits: markHits([boxBody, top, mailSign], 'mailbox'),
    update(t) {
      heart.position.y = 1.95 + Math.sin(t * 2.4) * 0.08;
    },
  });

  // Board of public messages (left wall). Rebuilt whenever messages arrive.
  const board = at(new THREE.Group(), -W / 2 + 0.08, 2.4, 0.6, scene);
  board.rotation.y = Math.PI / 2;
  board.add(at(box(7.4, 3.2, 0.08, toon(0xc68b59)), 0, 0, 0));
  for (const [x, y, w, h] of [[0, 1.66, 7.6, 0.14], [0, -1.66, 7.6, 0.14], [-3.76, 0, 0.14, 3.4], [3.76, 0, 0.14, 3.4]] as const) board.add(at(box(w, h, 0.12, toon(0x6b4329)), x, y, 0.02));
  const notes = new THREE.Group();
  board.add(notes);
  const boardTitle = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.5), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.messageBoard, { emoji: '📌', bg: '#fff3dc', border: '#2a9d8f' }), color: 0xe0d8cc, transparent: true }));
  board.add(at(boardTitle, 0, 2.05, 0.06));
  const isMessage = (i: Interactable) => i.id.startsWith('msg:');

  function showMessages(list: PublicMessage[]) {
    notes.clear();
    for (let k = items.length - 1; k >= 0; k--) if (isMessage(items[k])) items.splice(k, 1);
    if (list.length === 0) {
      const note = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.1), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.beFirst, { emoji: '💌', bg: '#fff6e3', border: '#2a9d8f' }), color: 0xe0d8cc, transparent: true }));
      note.position.z = 0.06;
      notes.add(note);
      return;
    }
    list.slice(0, 15).forEach((m, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const u = -2.9 + col * 1.45;
      const note = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.87), new THREE.MeshBasicMaterial({ map: noteTexture(m.name || data.strings.anonymous, m.message, i), color: 0xe0d8cc }));
      note.position.set(u, 0.95 - row * 1.0, 0.06);
      note.rotation.z = (((i * 37) % 9) - 4) * 0.012;
      notes.add(note, at(ball(0.05, toon(0xe63946), 8), u, 1.35 - row * 1.0, 0.1));
      const id = `msg:${m.id}`;
      items.push({
        id,
        kind: 'item',
        label: m.name || data.strings.anonymous,
        emoji: '💌',
        front: new THREE.Vector3(-W / 2 + 1.2, 0, 0.6 - u),
        facing: -Math.PI / 2,
        hits: markHits([note], id),
        setNear(nv) {
          note.scale.setScalar(nv ? 1.08 : 1);
        },
      });
    });
  }
  showMessages([]);
  window.addEventListener('playground:messages', (e) => showMessages((e as CustomEvent<PublicMessage[]>).detail));

  const lampGlow = glowTexture('rgba(255,214,150,0.65)');
  for (const [x, z] of [[-2.5, 2], [2.5, 2], [0, -3]]) {
    scene.add(at(ball(0.2, glow(0xffd29a, 2.2)), x, H - 0.45, z));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lampGlow, transparent: true, depthWrite: false }));
    halo.scale.set(0.9, 0.9, 1);
    scene.add(at(halo, x, H - 0.45, z));
    scene.add(at(new THREE.PointLight(0xffd29a, 6, 9, 1.5), x, H - 0.65, z));
  }

  const exit = buildExitDoor(scene, kit, W / 2 - 0.05, D / 2 - 1.4, data.strings.back);
  items.push({ id: 'exit', kind: 'exit', label: data.strings.back, emoji: '🏮', front: new THREE.Vector3(W / 2 - 1.2, 0, D / 2 - 1.4), facing: Math.PI / 2, hits: markHits(exit.hits, 'exit') });

  return {
    id: 'postoffice',
    scene,
    bounds: { minX: -W / 2 + 1.2, maxX: W / 2 - 1.2, minZ: -D / 2 + 3.4, maxZ: D / 2 - 0.8 },
    obstacles: [{ minX: 3.1, maxX: 4.1, minZ: D / 2 - 4.7, maxZ: D / 2 - 3.7 }],
    spawn: new THREE.Vector3(0, 0, D / 2 - 1.6),
    spawnFacing: Math.PI,
    camera: { back: 5.8, up: 4.2, lookAhead: 3, lookY: 1.6, followX: 0.75 },
    bloom: { strength: 0.4, radius: 0.4, threshold: 0.94 },
    items,
    update() {},
  };
};
