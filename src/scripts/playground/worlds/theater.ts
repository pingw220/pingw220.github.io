import * as THREE from 'three';
import { buildExitDoor, buildRoom, FONT, imageOr, labelTexture, makeKit, markHits, roomLights, wallTexture } from '../kit';
import { canvasTexture } from '../textures';
import type { Interactable, LibraryCard, PlaygroundData, World } from '../types';

const W = 14;
const D = 18;
const H = 6.5;
const POSTER_COLORS: [string, string][] = [
  ['#1b2a4a', '#e94560'],
  ['#ff7b54', '#ffd56f'],
  ['#2d6a4f', '#95d5b2'],
  ['#5a189a', '#ff9e00'],
  ['#003049', '#fcbf49'],
  ['#9d0208', '#ffba08'],
];

/** A poster drawn on a canvas: bold title, studio and year, and simple shapes. */
function posterTexture(card: LibraryCard, i: number): THREE.CanvasTexture {
  const [bg, accent] = POSTER_COLORS[i % POSTER_COLORS.length];
  return canvasTexture(360, 520, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, bg);
    grad.addColorStop(1, '#0b0d1a');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    // Rays and stars.
    g.save();
    g.translate(w / 2, h * 0.42);
    g.fillStyle = accent;
    g.globalAlpha = 0.18;
    for (let k = 0; k < 12; k++) {
      g.rotate(Math.PI / 6);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(-24, -w);
      g.lineTo(24, -w);
      g.fill();
    }
    g.restore();
    g.globalAlpha = 1;
    g.fillStyle = accent;
    g.beginPath();
    g.arc(w / 2, h * 0.42, 70, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff8e7';
    for (let k = 0; k < 18; k++) g.fillRect((k * 83) % w, (k * 47) % (h * 0.6), 3, 3);
    // Title, wrapped.
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    let size = 44;
    g.font = `900 ${size}px ${FONT}`;
    const words = /[㐀-鿿]/.test(card.title) ? [...card.title] : card.title.split(' ');
    const sep = /[㐀-鿿]/.test(card.title) ? '' : ' ';
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + sep + word : word;
      if (g.measureText(test).width > w - 50 && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    lines.push(line);
    if (lines.length > 3) {
      size = 34;
      g.font = `900 ${size}px ${FONT}`;
    }
    lines.forEach((l, k) => g.fillText(l, w / 2, h * 0.72 + k * (size + 8)));
    g.font = `600 20px ${FONT}`;
    g.fillStyle = accent;
    g.fillText([card.subtitle, card.date].filter(Boolean).join(' · '), w / 2, h - 34);
  });
}

/** Anime → a little movie theater with posters to browse. */
export const theaterWorld = (data: PlaygroundData) => (gradientMap: THREE.Texture): World => {
  const kit = makeKit(gradientMap);
  const { toon, glow, box, cyl, ball, at } = kit;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0b16);
  scene.fog = new THREE.Fog(0x0e0b16, 16, 36);
  roomLights(scene, 0xd9c9ff, 0x221a2a, 1.05);
  buildRoom(scene, kit, { width: W, depth: D, height: H, floor: wallTexture('#3a1d2e', '#43223a', 'dots'), wall: wallTexture('#2b1b30', '#341f3a', 'stripes'), trim: 0x1a0f1a });

  // Screen with curtains.
  const screenTex = canvasTexture(512, 256, () => {});
  const screenCanvas = screenTex.image as HTMLCanvasElement;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 4.2), new THREE.MeshBasicMaterial({ map: screenTex, color: 0xd8d8d8 }));
  screen.position.set(0, 3.4, -D / 2 + 0.1);
  scene.add(screen);
  const drawScreen = (t: number) => {
    const g = screenCanvas.getContext('2d')!;
    const grad = g.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, `hsl(${(t * 12) % 360}, 60%, 45%)`);
    grad.addColorStop(1, `hsl(${(t * 12 + 120) % 360}, 60%, 30%)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.font = `800 40px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(data.strings.nowShowing, 256, 128);
    screenTex.needsUpdate = true;
  };
  drawScreen(0);
  const screenLight = new THREE.PointLight(0x9bb7ff, 8, 14, 1.4);
  screenLight.position.set(0, 3.4, -D / 2 + 2.5);
  scene.add(screenLight);
  const curtain = toon(0x9b1d2e);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const fold = cyl(0.28, 0.32, H - 0.3, curtain, 10);
      at(fold, s * (4.6 + k * 0.42), (H - 0.3) / 2, -D / 2 + 0.4, scene);
    }
  }
  at(box(W, 0.7, 0.4, curtain), 0, H - 0.35, -D / 2 + 0.4, scene);

  // Rows of seats facing the screen.
  const seatMat = toon(0xc0283e);
  const seatGeo = new THREE.BoxGeometry(0.7, 0.45, 0.6);
  const backGeo = new THREE.BoxGeometry(0.7, 0.7, 0.14);
  const seatCount = 5 * 8;
  const seats = new THREE.InstancedMesh(seatGeo, seatMat, seatCount);
  const backs = new THREE.InstancedMesh(backGeo, seatMat, seatCount);
  const mm = new THREE.Matrix4();
  let n = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) {
      const x = -3.15 + c * 0.9;
      const z = -5.6 + r * 1.15;
      const y = 0.4 + r * 0.12;
      mm.makeTranslation(x, y, z);
      seats.setMatrixAt(n, mm);
      mm.makeTranslation(x, y + 0.5, z + 0.3);
      backs.setMatrixAt(n, mm);
      n++;
    }
  }
  scene.add(seats, backs);
  const obstacles = [{ minX: -3.6, maxX: 3.6, minZ: -6, maxZ: -0.6 }];

  // Posters along the side walls, front to back.
  const items: Interactable[] = [];
  data.anime.forEach((card, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2);
    const z = 5.4 - row * 2.6;
    const g = new THREE.Group();
    const frame = box(1.7, 2.4, 0.1, toon(0x241a2c));
    const lit = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 2.56), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff1c4).multiplyScalar(1.6) }));
    lit.position.z = -0.06;
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.17), new THREE.MeshBasicMaterial({ map: imageOr(card.image, () => posterTexture(card, i)), color: 0xe0dcd4 }));
    poster.position.z = 0.056;
    g.add(lit, frame, poster);
    g.position.set(side * (W / 2 - 0.12), 2.5, z);
    g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(g);
    const light = new THREE.PointLight(0xfff1c4, 2.5, 4, 1.8);
    light.position.set(side * (W / 2 - 1), 3.6, z);
    scene.add(light);
    const id = `anime:${i}`;
    items.push({
      id,
      kind: 'item',
      label: card.title,
      emoji: '🎞️',
      front: new THREE.Vector3(side * (W / 2 - 1.2), 0, z),
      facing: side < 0 ? -Math.PI / 2 : Math.PI / 2,
      hits: markHits([frame, poster], id),
      setNear(nv) {
        light.intensity = nv ? 6 : 2.5;
      },
    });
  });

  // Popcorn cart by the entrance.
  const cart = at(new THREE.Group(), -4.6, 0, D / 2 - 2.4, scene);
  cart.add(at(box(1.2, 0.9, 0.8, toon(0xe63946)), 0, 0.65, 0), at(box(1.3, 0.1, 0.9, toon(0xf1faee)), 0, 1.12, 0));
  for (let k = 0; k < 4; k++) cart.add(at(box(0.15, 0.9, 0.82, toon(0xf1faee)), -0.45 + k * 0.3, 0.65, 0.005));
  for (const s of [-1, 1]) cart.add(at(cyl(0.18, 0.18, 0.06, toon(0x333333)), s * 0.45, 0.18, 0.45));
  const glass = box(1.0, 0.8, 0.7, new THREE.MeshToonMaterial({ color: 0xfff5d6, gradientMap, transparent: true, opacity: 0.35 }));
  cart.add(at(glass, 0, 1.6, 0));
  for (let k = 0; k < 26; k++) cart.add(at(ball(0.07, glow(0xfff1b5, 0.5), 8), -0.4 + (k % 7) * 0.13, 1.28 + Math.floor(k / 7) * 0.1, -0.2 + (k % 3) * 0.18));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.36), new THREE.MeshBasicMaterial({ map: labelTexture('POPCORN', { emoji: '🍿', bg: '#e63946', fg: '#fff8e7' }), transparent: true }));
  cart.add(at(sign, 0, 2.2, 0));

  const exit = buildExitDoor(scene, kit, W / 2 - 0.05, D / 2 - 1.6, data.strings.back);
  items.push({ id: 'exit', kind: 'exit', label: data.strings.back, emoji: '🏮', front: new THREE.Vector3(W / 2 - 1.2, 0, D / 2 - 1.6), facing: Math.PI / 2, hits: markHits(exit.hits, 'exit') });

  let lastDraw = 0;
  return {
    id: 'theater',
    scene,
    bounds: { minX: -W / 2 + 1.2, maxX: W / 2 - 1.2, minZ: -6.5, maxZ: D / 2 - 0.8 },
    obstacles,
    spawn: new THREE.Vector3(0, 0, D / 2 - 1.6),
    spawnFacing: Math.PI,
    camera: { back: 6, up: 4.2, lookAhead: 3, lookY: 1.8, followX: 0.75 },
    bloom: { strength: 0.5, radius: 0.45, threshold: 0.93 },
    items,
    update(t) {
      if (t - lastDraw > 0.25) {
        drawScreen(t);
        lastDraw = t;
      }
    },
  };
};
