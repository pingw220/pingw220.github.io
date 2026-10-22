import * as THREE from 'three';
import { FONT, labelTexture, wallTexture, type Kit } from '../kit';
import { buildGallery } from './gallery';
import { canvasTexture } from '../textures';
import type { LibraryCard, PlaygroundData } from '../types';

const POSTER_COLORS: [string, string][] = [
  ['#1b2a4a', '#e94560'],
  ['#ff7b54', '#ffd56f'],
  ['#2d6a4f', '#95d5b2'],
  ['#5a189a', '#ff9e00'],
  ['#003049', '#fcbf49'],
  ['#9d0208', '#ffba08'],
];

/** A poster drawn on a canvas: bold title, studio and year, and simple shapes. */
export function posterTexture(card: LibraryCard, i: number): THREE.CanvasTexture {
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

/** A glowing cinema screen with a slow color wash, centered above `y` on the back wall. */
export function cinemaScreen(scene: THREE.Scene, kit: Kit, o: { text: string; width: number; height: number; y: number; z: number; H: number; W: number }) {
  const { toon, cyl, box, at } = kit;
  const screenTex = canvasTexture(512, 192, () => {});
  const screenCanvas = screenTex.image as HTMLCanvasElement;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(o.width, o.height), new THREE.MeshBasicMaterial({ map: screenTex, color: 0xd8d8d8 }));
  screen.position.set(0, o.y, o.z + 0.04);
  scene.add(screen);
  const draw = (t: number) => {
    const g = screenCanvas.getContext('2d')!;
    const grad = g.createLinearGradient(0, 0, 512, 192);
    grad.addColorStop(0, `hsl(${(t * 12) % 360}, 60%, 45%)`);
    grad.addColorStop(1, `hsl(${(t * 12 + 120) % 360}, 60%, 30%)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 192);
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.font = `800 40px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(o.text, 256, 96);
    screenTex.needsUpdate = true;
  };
  draw(0);
  const curtain = toon(0x9b1d2e);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) at(cyl(0.26, 0.3, o.H - 0.3, curtain, 10), s * (o.W / 2 - 0.4 - k * 0.38), (o.H - 0.3) / 2, o.z + 0.35, scene);
  at(box(o.W, 0.55, 0.35, curtain), 0, o.H - 0.28, o.z + 0.3, scene);
  let last = 0;
  return (t: number) => {
    if (t - last > 0.25) {
      draw(t);
      last = t;
    }
  };
}

/** A popcorn cart. */
export function popcornCart(scene: THREE.Scene, kit: Kit, gradientMap: THREE.Texture, x: number, z: number) {
  const { toon, glow, box, cyl, ball, at } = kit;
  const cart = at(new THREE.Group(), x, 0, z, scene);
  cart.add(at(box(1.2, 0.9, 0.8, toon(0xe63946)), 0, 0.65, 0), at(box(1.3, 0.1, 0.9, toon(0xf1faee)), 0, 1.12, 0));
  for (let k = 0; k < 4; k++) cart.add(at(box(0.15, 0.9, 0.82, toon(0xf1faee)), -0.45 + k * 0.3, 0.65, 0.005));
  for (const s of [-1, 1]) cart.add(at(cyl(0.18, 0.18, 0.06, toon(0x333333)), s * 0.45, 0.18, 0.45));
  const glass = box(1.0, 0.8, 0.7, new THREE.MeshToonMaterial({ color: 0xfff5d6, gradientMap, transparent: true, opacity: 0.35 }));
  cart.add(at(glass, 0, 1.6, 0));
  for (let k = 0; k < 26; k++) cart.add(at(ball(0.07, glow(0xfff1b5, 0.5), 8), -0.4 + (k % 7) * 0.13, 1.28 + Math.floor(k / 7) * 0.1, -0.2 + (k % 3) * 0.18));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.36), new THREE.MeshBasicMaterial({ map: labelTexture('POPCORN', { emoji: '🍿', bg: '#e63946', fg: '#fff8e7' }), transparent: true }));
  cart.add(at(sign, 0, 2.2, 0));
  return { minX: x - 0.7, maxX: x + 0.7, minZ: z - 0.5, maxZ: z + 0.5 };
}

/** Anime → a theater: the all-time top five under the screen, the rest by genre on the walls. */
export const theaterWorld = (data: PlaygroundData) =>
  buildGallery(data, {
    id: 'theater',
    prefix: 'anime',
    cards: data.anime,
    emoji: '🎞️',
    floor: wallTexture('#3a1d2e', '#43223a', 'dots'),
    wall: wallTexture('#2b1b30', '#341f3a', 'stripes'),
    trim: 0x1a0f1a,
    background: 0x0e0b16,
    light: 0xd9c9ff,
    accent: '#f15bb5',
    poster: posterTexture,
    decorate({ scene, kit, W, D, H, backTop }) {
      const update = cinemaScreen(scene, kit, { text: data.strings.nowShowing, width: 5.4, height: Math.max(1.4, H - backTop - 0.75), y: (backTop + H - 0.6) / 2, z: -D / 2 + 0.1, H, W });
      return { obstacles: [popcornCart(scene, kit, kit.gradientMap, -3.2, D / 2 - 2.4)], update };
    },
  });
