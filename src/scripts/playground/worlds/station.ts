import * as THREE from 'three';
import { buildExitDoor, buildRoom, FONT, labelTexture, makeKit, markHits, roomLights, wallTexture } from '../kit';
import { canvasTexture, glowTexture } from '../textures';
import type { Interactable, PlaygroundData, World } from '../types';

const W = 16;
const D = 15;
const H = 6.5;

/** A storybook world map: soft blobs for continents. */
function mapTexture(): THREE.CanvasTexture {
  return canvasTexture(1024, 512, (g, w, h) => {
    g.fillStyle = '#9fd3e6';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.25)';
    for (let y = 40; y < h; y += 60) g.fillRect(0, y, w, 2);
    g.fillStyle = '#9ccc8b';
    const land: [number, number, number, number][] = [
      [210, 150, 120, 80], [260, 230, 60, 60], [300, 360, 55, 90], // Americas
      [520, 140, 70, 50], [540, 260, 70, 100], // Europe / Africa
      [700, 160, 150, 80], [760, 260, 50, 40], [830, 380, 70, 40], // Asia / Australia
    ];
    for (const [x, y, rx, ry] of land) {
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#4a2c1a';
    g.font = `700 26px ${FONT}`;
    g.textAlign = 'center';
    g.fillText('✈', w / 2, h - 30);
  });
}

/** Travel → a little train station with a map of places. */
export const stationWorld = (data: PlaygroundData) => (gradientMap: THREE.Texture): World => {
  const kit = makeKit(gradientMap);
  const { toon, glow, box, cyl, ball, at } = kit;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x121a28);
  scene.fog = new THREE.Fog(0x121a28, 16, 34);
  roomLights(scene, 0xfff1dd, 0x2a2d38, 1.35);
  buildRoom(scene, kit, { width: W, depth: D, height: H, floor: wallTexture('#b9a68d', '#a8957c', 'panels'), wall: wallTexture('#e8dcc4', '#ddd0b5', 'stripes'), trim: 0x5a3a24 });

  // Map board on the back wall.
  const board = at(new THREE.Group(), 0, 3.1, -D / 2 + 0.1, scene);
  board.add(at(box(8.4, 4.4, 0.12, toon(0x6b4329)), 0, 0, 0));
  const map = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshBasicMaterial({ map: mapTexture(), color: 0xe0dcd4 }));
  map.position.z = 0.07;
  board.add(map);
  const items: Interactable[] = [];
  const places = data.travel.slice(0, 12);
  if (places.length === 0) {
    const note = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.comingSoon, { emoji: '🧳', bg: '#fff6e3', border: '#3fa7d6' }), color: 0xe0d8cc, transparent: true }));
    note.position.z = 0.1;
    board.add(note);
  }
  places.forEach((place, i) => {
    const u = -3.4 + ((i * 2.9) % 7);
    const v = 1.2 - Math.floor((i * 2.9) / 7) * 0.9;
    const pin = at(new THREE.Group(), u, v, 0.12, board);
    const head = ball(0.14, glow(0xe63946, 0.8));
    pin.add(at(head, 0, 0.12, 0), at(cyl(0.015, 0.015, 0.22, toon(0x555555)), 0, -0.02, 0));
    const id = `place:${i}`;
    items.push({
      id,
      kind: 'item',
      label: place.title,
      emoji: '📍',
      front: new THREE.Vector3(u, 0, -D / 2 + 2.6),
      facing: Math.PI,
      hits: markHits([head], id),
      setNear(nv) {
        pin.scale.setScalar(nv ? 1.6 : 1);
      },
    });
  });
  const title = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.6), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.journal, { emoji: '🗺️', bg: '#fff3dc', border: '#3fa7d6' }), color: 0xe0d8cc, transparent: true }));
  title.position.set(0, 5.8, -D / 2 + 0.15);
  scene.add(title);

  // Departures board, clock, ticket window, benches.
  const departures = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.1), new THREE.MeshBasicMaterial({ map: labelTexture('DEPARTURES', { bg: '#1b1b1b', fg: '#ffd166', border: '#333333' }), transparent: true }));
  departures.position.set(-W / 2 + 0.1, 4.4, -2);
  departures.rotation.y = Math.PI / 2;
  scene.add(departures);
  const clock = at(new THREE.Group(), W / 2 - 0.1, 4.4, -2, scene);
  clock.rotation.y = -Math.PI / 2;
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.55, 32), new THREE.MeshBasicMaterial({ color: 0xfffaf0 }));
  clock.add(face, at(new THREE.Mesh(new THREE.RingGeometry(0.55, 0.63, 32), toon(0x3d2718)), 0, 0, 0.01));
  const hourHand = at(box(0.05, 0.3, 0.02, new THREE.MeshBasicMaterial({ color: 0x1a1a1a })), 0, 0.12, 0.03, clock);
  const minuteHand = at(box(0.03, 0.45, 0.02, new THREE.MeshBasicMaterial({ color: 0x1a1a1a })), 0, 0.2, 0.04, clock);
  hourHand.geometry.translate(0, 0.1, 0);
  minuteHand.geometry.translate(0, 0.1, 0);
  hourHand.position.y = 0;
  minuteHand.position.y = 0;
  const ticket = at(new THREE.Group(), W / 2 - 0.4, 0, 2, scene);
  ticket.rotation.y = -Math.PI / 2;
  ticket.add(at(box(2.6, 2.6, 0.6, toon(0x6b4329)), 0, 1.3, 0), at(box(1.4, 0.9, 0.62, new THREE.MeshBasicMaterial({ color: 0x1e2a3a })), 0, 1.7, 0.01));
  ticket.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.45), new THREE.MeshBasicMaterial({ map: labelTexture('TICKETS', { emoji: '🎫', bg: '#fff3dc' }), transparent: true })), 0, 2.85, 0.32));
  const benchMat = toon(0x8a5a3a);
  const obstacles: NonNullable<World['obstacles']> = [];
  for (const [x, z] of [[-3.6, 1.2], [3.6, 1.2], [-3.6, -2.2], [3.6, -2.2]]) {
    const bench = at(new THREE.Group(), x, 0, z, scene);
    bench.add(at(box(2.4, 0.1, 0.6, benchMat), 0, 0.5, 0), at(box(2.4, 0.5, 0.08, benchMat), 0, 0.85, -0.28));
    for (const s of [-1, 1]) bench.add(at(box(0.08, 0.5, 0.55, toon(0x2b2b33)), s * 1.05, 0.25, 0));
    obstacles.push({ minX: x - 1.2, maxX: x + 1.2, minZ: z - 0.35, maxZ: z + 0.35 });
  }
  // A little suitcase on one bench.
  at(box(0.55, 0.38, 0.22, toon(0x2f8f8a)), -3.2, 0.75, 1.2, scene);

  const lampGlow = glowTexture('rgba(255,214,150,0.65)');
  for (const [x, z] of [[-4, 3], [4, 3], [0, -2]]) {
    scene.add(at(ball(0.2, glow(0xffd29a, 2.2)), x, H - 0.45, z));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lampGlow, transparent: true, depthWrite: false }));
    halo.scale.set(0.9, 0.9, 1);
    scene.add(at(halo, x, H - 0.45, z));
    scene.add(at(new THREE.PointLight(0xffd29a, 6, 9, 1.5), x, H - 0.45, z));
  }

  const exit = buildExitDoor(scene, kit, -W / 2 + 0.05, D / 2 - 1.6, data.strings.back);
  items.push({ id: 'exit', kind: 'exit', label: data.strings.back, emoji: '🏮', front: new THREE.Vector3(-W / 2 + 1.2, 0, D / 2 - 1.6), facing: -Math.PI / 2, hits: markHits(exit.hits, 'exit') });
  if (places.length === 0) {
    items.push({ id: 'map', kind: 'item', label: data.strings.journal, emoji: '🗺️', front: new THREE.Vector3(0, 0, -D / 2 + 2.6), facing: Math.PI, hits: markHits([map], 'map') });
  }

  return {
    id: 'station',
    scene,
    bounds: { minX: -W / 2 + 1.2, maxX: W / 2 - 1.6, minZ: -D / 2 + 2.6, maxZ: D / 2 - 0.8 },
    obstacles,
    spawn: new THREE.Vector3(0, 0, D / 2 - 1.6),
    spawnFacing: Math.PI,
    camera: { back: 6, up: 4.4, lookAhead: 3, lookY: 1.8, followX: 0.75 },
    bloom: { strength: 0.4, radius: 0.4, threshold: 0.94 },
    items,
    update(t) {
      minuteHand.rotation.z = -t * 0.5;
      hourHand.rotation.z = -t * 0.04;
    },
  };
};
