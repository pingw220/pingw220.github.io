import * as THREE from 'three';
import { buildExitDoor, EMOJI_FONT, FONT, imageOr, labelTexture, makeKit, markHits, roomLights } from '../kit';
import { canvasTexture } from '../textures';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import landTopo from 'world-atlas/land-110m.json';
import type { Interactable, LibraryCard, PlaygroundData, World } from '../types';

// The map shows 80°N–58°S, like the travel page.
const MAP_TOP = 80;
const MAP_SPAN = 138;
type Region = 'americas' | 'europe' | 'mideast' | 'asia' | 'oceania';
const regionOf = (lat: number, lon: number): Region =>
  lon < -30 ? 'americas' : lon < 45 ? 'europe' : lon < 62 ? 'mideast' : lat < -10 ? 'oceania' : 'asia';
const REGION_COLOR: Record<Region, string> = { americas: '#e76f51', europe: '#9b5de5', mideast: '#f4a261', asia: '#e63946', oceania: '#2a9d8f' };

/**
 * The storybook travel map from the travel page, painted on a canvas: a wavy ocean, cream land,
 * dashed flight routes from home, colored pins (houses for home), a compass, and sea creatures.
 */
function mapTexture(places: LibraryCard[]): THREE.CanvasTexture {
  const W = 2400;
  const H = Math.round((W * MAP_SPAN) / 360);
  return canvasTexture(W, H, (g, w, h) => {
    const X = (lon: number) => ((lon + 180) / 360) * w;
    const Y = (lat: number) => ((MAP_TOP - lat) / MAP_SPAN) * h;
    // Ocean with little waves.
    g.fillStyle = '#bfe6f5';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.6)';
    g.lineWidth = 2.5;
    for (let y = 30; y < h; y += 52) {
      for (let x = (y / 52) % 2 ? 0 : 46; x < w; x += 92) {
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + 11, y - 9, x + 23, y);
        g.quadraticCurveTo(x + 34, y + 9, x + 46, y);
        g.stroke();
      }
    }
    // Land.
    const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>;
    const land = feature(topo, topo.objects.land) as unknown as { features: { geometry: { type: string; coordinates: number[][][] | number[][][][] } }[] };
    g.beginPath();
    for (const f of land.features) {
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates as number[][][]] : (f.geometry.coordinates as number[][][][]);
      for (const poly of polys) {
        for (const ring of poly) {
          ring.forEach(([lon, lat], i) => {
            // Lift the pen where a ring wraps around the 180° meridian.
            if (i === 0 || Math.abs(lon - ring[i - 1][0]) > 180) g.moveTo(X(lon), Y(lat));
            else g.lineTo(X(lon), Y(lat));
          });
        }
      }
    }
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.25)';
    g.shadowBlur = 8;
    g.shadowOffsetY = 4;
    g.fillStyle = '#f8edc8';
    g.fill('evenodd');
    g.restore();
    g.strokeStyle = '#d9b56a';
    g.lineWidth = 2.5;
    g.lineJoin = 'round';
    g.stroke();

    const located = places.filter((p) => typeof p.lat === 'number' && typeof p.lon === 'number');
    const homes = located.filter((p) => p.home);
    // Flight routes from the nearer home.
    g.lineWidth = 3.5;
    g.setLineDash([10, 12]);
    g.lineCap = 'round';
    for (const p of located) {
      if (p.home) continue;
      const region = regionOf(p.lat!, p.lon!);
      const from = homes.find((h) => (region === 'americas') === (h.lon! < -30));
      if (!from) continue;
      const [x1, y1, x2, y2] = [X(from.lon!), Y(from.lat!), X(p.lon!), Y(p.lat!)];
      g.strokeStyle = REGION_COLOR[region];
      g.globalAlpha = 0.55;
      g.beginPath();
      g.moveTo(x1, y1);
      g.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 - Math.min(170, Math.hypot(x2 - x1, y2 - y1) * 0.28), x2, y2);
      g.stroke();
    }
    g.globalAlpha = 1;
    g.setLineDash([]);
    // Pins: a teardrop for each place, a little house for home.
    for (const p of located) {
      const x = X(p.lon!);
      const y = Y(p.lat!);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.3)';
      g.shadowBlur = 4;
      g.shadowOffsetY = 2;
      g.strokeStyle = '#ffffff';
      g.lineWidth = 3;
      if (p.home) {
        g.fillStyle = '#2a9d8f';
        g.beginPath();
        g.moveTo(x - 16, y);
        g.lineTo(x - 16, y - 17);
        g.lineTo(x, y - 33);
        g.lineTo(x + 16, y - 17);
        g.lineTo(x + 16, y);
        g.closePath();
        g.fill();
        g.stroke();
        g.restore();
        g.fillStyle = '#ffffff';
        g.fillRect(x - 4, y - 11, 8, 11);
        continue;
      }
      g.fillStyle = REGION_COLOR[regionOf(p.lat!, p.lon!)];
      g.beginPath();
      g.moveTo(x, y);
      g.bezierCurveTo(x - 9, y - 12, x - 14, y - 18, x - 14, y - 25);
      g.arc(x, y - 25, 14, Math.PI, 0);
      g.bezierCurveTo(x + 14, y - 18, x + 9, y - 12, x, y);
      g.fill();
      g.stroke();
      g.restore();
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(x, y - 25, 5, 0, Math.PI * 2);
      g.fill();
    }
    // Compass rose.
    const cx = 120;
    const cy = h - 120;
    g.fillStyle = 'rgba(255,250,240,0.92)';
    g.strokeStyle = '#d9b56a';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(cx, cy, 52, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = '#e63946';
    g.beginPath();
    g.moveTo(cx, cy - 46);
    g.lineTo(cx + 11, cy);
    g.lineTo(cx, cy + 46);
    g.lineTo(cx - 11, cy);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(138,90,58,0.75)';
    g.beginPath();
    g.moveTo(cx - 46, cy);
    g.lineTo(cx, cy + 11);
    g.lineTo(cx + 46, cy);
    g.lineTo(cx, cy - 11);
    g.closePath();
    g.fill();
    g.fillStyle = '#8a5a3a';
    g.font = `800 26px ${FONT}`;
    g.textAlign = 'center';
    g.fillText('N', cx, cy - 60);
    // Sea creatures and boats.
    g.font = `46px ${EMOJI_FONT}`;
    g.textBaseline = 'middle';
    for (const [e, lon, lat] of [['🐳', -150, 30], ['🐙', -45, 36], ['🐢', 75, -20], ['⛵', -27, -10], ['🐬', 152, 8], ['🐧', -3, -48], ['🏝️', -95, -15], ['🦈', 120, -42]] as const) {
      g.fillText(e, X(lon), Y(lat));
    }
  });
}

/** What a window shows before its photo loads (or if there's no photo): sky and the name. */
function skyTexture(title: string, home: boolean): THREE.CanvasTexture {
  return canvasTexture(512, 400, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, home ? '#6fc3a8' : '#4f8fd6');
    grad.addColorStop(1, '#fbe3c0');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.85)';
    for (const [x, y, r] of [[120, 120, 40], [170, 110, 52], [220, 125, 36], [360, 220, 44], [410, 210, 30]]) {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#23324f';
    g.font = `800 44px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(title, w / 2, h * 0.78);
  });
}

/** Rounded window frame (a ring with a hole the photo shows through). */
function frameTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 320, (g, w, h) => {
    const r = 92;
    const path = (inset: number) => {
      g.beginPath();
      g.roundRect(inset, inset, w - inset * 2, h - inset * 2, r - inset * 0.6);
    };
    g.fillStyle = '#e9e4da';
    path(0);
    g.fill();
    g.globalCompositeOperation = 'destination-out';
    path(26);
    g.fill();
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = 'rgba(0,0,0,0.18)';
    g.lineWidth = 6;
    path(26);
    g.stroke();
  });
}

/** Travel → an airplane cabin. Every window looks out over one of the places; the map is up front. */
export const flightWorld = (data: PlaygroundData) => (gradientMap: THREE.Texture): World => {
  const kit = makeKit(gradientMap);
  const { toon, glow, box, cyl, at } = kit;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1a33);
  scene.fog = new THREE.Fog(0x0f1a33, 22, 48);
  roomLights(scene, 0xf4f1ff, 0x2a2d38, 1.45);

  const places = data.travel.map((place, index) => ({ place, index }));
  const perSide = Math.ceil(places.length / 2);
  const SPACING = 1.55;
  const D = Math.max(16, perSide * SPACING + 7);
  const R = 3.0; // fuselage radius
  const CY = 1.4; // fuselage center height
  const HALF_FLOOR = Math.sqrt(R * R - CY * CY); // half the floor width

  // Fuselage: an open cylinder seen from inside, a carpet with an aisle stripe, and two bulkheads.
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(R, R, D, 40, 1, true), toon(0xf2efe8, { side: THREE.BackSide }));
  shell.rotation.x = Math.PI / 2;
  shell.position.y = CY;
  scene.add(shell);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF_FLOOR * 2, D), toon(0x2f3e6e));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;
  floor.name = 'ground';
  scene.add(floor);
  const aisle = new THREE.Mesh(new THREE.PlaneGeometry(1.1, D), toon(0x3d4f8a));
  aisle.rotation.x = -Math.PI / 2;
  aisle.position.y = 0.02;
  scene.add(aisle);
  // Bulkheads face inward only, so the camera can look through the rear one from behind Joy.
  for (const s of [-1, 1]) {
    const bulk = new THREE.Mesh(new THREE.CircleGeometry(R, 40), toon(0xe3ddd0));
    bulk.position.set(0, CY, (s * D) / 2);
    if (s > 0) bulk.rotation.y = Math.PI;
    scene.add(bulk);
  }
  // Overhead bins and a strip of ceiling lights.
  for (const s of [-1, 1]) {
    const bins = box(1.1, 0.55, D - 1, toon(0xfaf8f3));
    bins.position.set(s * 1.85, 3.35, 0);
    bins.rotation.z = s * 0.35;
    scene.add(bins);
    const lip = box(0.06, 0.1, D - 1, toon(0xc9c2b4));
    lip.position.set(s * 1.35, 3.05, 0);
    scene.add(lip);
  }
  scene.add(at(box(0.4, 0.03, D - 1, glow(0xfff4d6, 1.6)), 0, CY + R - 0.08, 0));

  // Windows along both walls, each with a place's photo and a name plate.
  const items: Interactable[] = [];
  const frameTex = frameTexture();
  const WIN_W = 1.05;
  const WIN_H = 1.3;
  const WIN_Y = 1.75;
  const wallX = Math.sqrt(R * R - (WIN_Y - CY) ** 2) - 0.06;
  const firstZ = D / 2 - 4.2;
  const obstacles: NonNullable<World['obstacles']> = [];
  places.forEach(({ place, index }, k) => {
    const side = k % 2 === 0 ? -1 : 1;
    const z = firstZ - Math.floor(k / 2) * SPACING;
    const win = new THREE.Group();
    const photo = new THREE.Mesh(
      new THREE.PlaneGeometry(WIN_W * 0.82, WIN_H * 0.84),
      new THREE.MeshBasicMaterial({ map: imageOr(place.image, () => skyTexture(place.title, !!place.home), (WIN_W * 0.82) / (WIN_H * 0.84)), color: 0xe8e4dc }),
    );
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(WIN_W, WIN_H), new THREE.MeshBasicMaterial({ map: frameTex, transparent: true }));
    frame.position.z = 0.01;
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(1.35, 0.3),
      new THREE.MeshBasicMaterial({ map: labelTexture(place.title, { emoji: place.home ? '🏠' : '📍', bg: place.home ? '#d8f3dc' : '#fff3dc', border: place.home ? '#2a9d8f' : '#3fa7d6', height: 150 }), transparent: true }),
    );
    plate.position.set(0, -WIN_H / 2 - 0.24, 0.02);
    win.add(photo, frame, plate);
    win.position.set(side * wallX, WIN_Y, z);
    win.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    win.rotation.x = 0; // the wall is almost vertical at window height
    scene.add(win);
    const id = `place:${index}`;
    items.push({
      id,
      kind: 'item',
      label: place.title,
      emoji: place.home ? '🏠' : '✈️',
      front: new THREE.Vector3(side * 0.35, 0, z),
      facing: side < 0 ? -Math.PI / 2 : Math.PI / 2,
      hits: markHits([photo, frame, plate], id),
      setNear(nv) {
        win.scale.setScalar(nv ? 1.08 : 1);
      },
    });
  });

  // A pair of seats under every other window.
  const seatMat = toon(0x3a5ba0);
  const cushion = toon(0x4f74c4);
  for (let row = 0; row < perSide; row += 2) {
    const z = firstZ - row * SPACING - SPACING / 2;
    for (const s of [-1, 1]) {
      const g = at(new THREE.Group(), s * 1.55, 0, z, scene);
      for (const dx of [-0.32, 0.32]) {
        g.add(at(box(0.58, 0.14, 0.55, cushion), dx, 0.5, 0), at(box(0.58, 0.85, 0.14, seatMat), dx, 0.95, 0.3), at(box(0.5, 0.2, 0.1, toon(0xffffff)), dx, 1.3, 0.34));
      }
      g.add(at(box(1.3, 0.45, 0.5, toon(0x2b2f4a)), 0, 0.22, 0));
      obstacles.push({ minX: s * 1.55 - 0.75, maxX: s * 1.55 + 0.75, minZ: z - 0.35, maxZ: z + 0.42 });
    }
  }

  // Up front: the flight map with every place pinned.
  const MAP_W = 5.0;
  const MAP_H = (MAP_W * MAP_SPAN) / 360;
  const board = at(new THREE.Group(), 0, 2.0, -D / 2 + 0.06, scene);
  board.add(at(box(MAP_W + 0.24, MAP_H + 0.24, 0.08, toon(0x1d2433)), 0, 0, 0));
  const map = new THREE.Mesh(new THREE.PlaneGeometry(MAP_W, MAP_H), new THREE.MeshBasicMaterial({ map: mapTexture(data.travel), color: 0xe4e0d8 }));
  map.position.z = 0.05;
  board.add(map);
  const title = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.48), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.journal, { emoji: '🗺️', bg: '#fff3dc', border: '#3fa7d6' }), color: 0xe0d8cc, transparent: true }));
  title.position.set(0, 3.55, -D / 2 + 0.08);
  scene.add(title);
  // Walking up to the map opens the list of places.
  items.push({ id: 'map', kind: 'station', label: data.strings.journal, emoji: '🗺️', front: new THREE.Vector3(0, 0, -D / 2 + 2), facing: Math.PI, hits: markHits([map], 'map') });
  // The cabin door at the back.
  const exit = buildExitDoor(scene, kit, HALF_FLOOR - 0.08, D / 2 - 1.6, data.strings.back);
  items.push({ id: 'exit', kind: 'exit', label: data.strings.back, emoji: '🏮', front: new THREE.Vector3(HALF_FLOOR - 1.1, 0, D / 2 - 1.6), facing: Math.PI / 2, hits: markHits(exit.hits, 'exit') });
  // A drinks cart parked by the galley.
  const cart = at(new THREE.Group(), -1.3, 0, D / 2 - 1.5, scene);
  cart.add(at(box(0.6, 1.0, 0.9, toon(0xb8bcc6)), 0, 0.55, 0), at(box(0.62, 0.05, 0.92, toon(0x8a8f9c)), 0, 1.07, 0));
  for (let k = 0; k < 4; k++) cart.add(at(cyl(0.05, 0.05, 0.22, toon([0xe63946, 0xffd166, 0x2a9d8f, 0xf4a261][k])), -0.18 + (k % 2) * 0.36, 1.2, -0.2 + Math.floor(k / 2) * 0.4));
  obstacles.push({ minX: -1.7, maxX: -0.9, minZ: D / 2 - 2.05, maxZ: D / 2 - 0.95 });

  return {
    id: 'flight',
    scene,
    bounds: { minX: -HALF_FLOOR + 0.5, maxX: HALF_FLOOR - 0.9, minZ: -D / 2 + 1.6, maxZ: D / 2 - 0.8 },
    obstacles,
    spawn: new THREE.Vector3(0, 0, D / 2 - 1.6),
    spawnFacing: Math.PI,
    camera: { back: 3.6, up: 2.6, lookAhead: 3, lookY: 1.6, followX: 0.5 },
    bloom: { strength: 0.35, radius: 0.4, threshold: 0.95 },
    items,
    update() {},
  };
};
