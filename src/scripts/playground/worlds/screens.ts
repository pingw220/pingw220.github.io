import * as THREE from 'three';
import { FONT, wallTexture, woodTexture } from '../kit';
import { canvasTexture } from '../textures';
import { buildGallery } from './gallery';
import { cinemaScreen, popcornCart, posterTexture } from './theater';
import type { LibraryCard, PlaygroundData } from '../types';

/** A drawn poster for a TV series: a flat screen shape, the title, and the network. */
function seriesPoster(card: LibraryCard, i: number): THREE.CanvasTexture {
  const colors = ['#1d3557', '#6a040f', '#264653', '#3c096c', '#7f5539', '#003049'];
  return canvasTexture(360, 520, (g, w, h) => {
    g.fillStyle = colors[i % colors.length];
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.12)';
    g.fillRect(40, 70, w - 80, 170);
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `900 40px ${FONT}`;
    const cjk = /[㐀-鿿]/.test(card.title);
    const words = cjk ? [...card.title] : card.title.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + (cjk ? '' : ' ') + word : word;
      if (g.measureText(test).width > w - 50 && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    lines.push(line);
    lines.slice(0, 4).forEach((l, k) => g.fillText(l, w / 2, 320 + k * 48));
    g.font = `600 20px ${FONT}`;
    g.fillStyle = '#ffd166';
    g.fillText([card.subtitle, card.date].filter(Boolean).join(' · '), w / 2, h - 34);
  });
}

/** TV dramas → a cozy living room: a big TV, a couch, and the series on the walls by country. */
export const dramasWorld = (data: PlaygroundData) =>
  buildGallery(data, {
    id: 'dramas',
    prefix: 'drama',
    cards: data.dramas,
    emoji: '📺',
    floor: woodTexture('#8f6a4a', '#7b5a3e'),
    wall: wallTexture('#3d5a5b', '#456667', 'stripes'),
    trim: 0x2a1a10,
    background: 0x141c22,
    light: 0xfff0dd,
    accent: '#2a9d8f',
    poster: seriesPoster,
    decorate({ scene, kit, D }) {
      const { toon, box, ball, cyl, at } = kit;
      const backZ = -D / 2;
      // A big TV on a low cabinet, with a gently changing picture.
      const tv = at(new THREE.Group(), 0, 0, backZ + 0.5, scene);
      tv.add(at(box(4.2, 0.6, 0.7, toon(0x6b4329)), 0, 0.3, 0));
      tv.add(at(box(4.6, 2.6, 0.12, toon(0x15151c)), 0, 2.3, -0.2));
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 2.35), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      screen.position.set(0, 2.3, -0.13);
      tv.add(screen);
      const tvLight = new THREE.PointLight(0x9bb7ff, 6, 10, 1.4);
      tvLight.position.set(0, 2.3, 1.5);
      tv.add(tvLight);
      for (let k = 0; k < 4; k++) tv.add(at(box(0.25, 0.42, 0.3, toon([0xe63946, 0x457b9d, 0x2a9d8f, 0xffb703][k])), -1.6 + k * 0.3, 0.81, 0.1));
      // A couch facing the TV, a coffee table, and a rug.
      const couchZ = backZ + 5.2;
      const couch = at(new THREE.Group(), 0, 0, couchZ, scene);
      const fabric = toon(0xd97b66);
      couch.add(at(box(3.6, 0.5, 1.0, fabric), 0, 0.4, 0), at(box(3.6, 0.9, 0.3, fabric), 0, 0.95, 0.4));
      for (const s of [-1, 1]) couch.add(at(box(0.3, 0.75, 1.0, fabric), s * 1.8, 0.55, 0));
      for (const s of [-1, 1]) couch.add(at(ball(0.22, toon(0xffd166)), s * 1.2, 0.82, 0.15));
      const table = at(new THREE.Group(), 0, 0, couchZ - 1.5, scene);
      table.add(at(box(1.6, 0.08, 0.8, toon(0x8a5a3a)), 0, 0.45, 0));
      for (const [x, z] of [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]]) table.add(at(cyl(0.04, 0.04, 0.42, toon(0x5e3c27)), x, 0.21, z));
      table.add(at(cyl(0.18, 0.12, 0.14, toon(0xfff1b5)), -0.4, 0.56, 0), at(box(0.2, 0.04, 0.06, toon(0x222222)), 0.4, 0.5, 0.1));
      const rug = new THREE.Mesh(new THREE.CircleGeometry(2.4, 40), toon(0x6d597a));
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(0, 0.02, couchZ - 1.2);
      scene.add(rug);
      return {
        obstacles: [
          { minX: -2.1, maxX: 2.1, minZ: backZ, maxZ: backZ + 1.0 },
          { minX: -2.0, maxX: 2.0, minZ: couchZ - 0.55, maxZ: couchZ + 0.6 },
          { minX: -0.85, maxX: 0.85, minZ: couchZ - 1.95, maxZ: couchZ - 1.05 },
        ],
        update(t) {
          (screen.material as THREE.MeshBasicMaterial).color.setHSL((t * 0.03) % 1, 0.55, 0.6).multiplyScalar(1.2);
        },
      };
    },
  });

/** Movies → a cinema: the all-time favorites under the screen, and rows of seats. */
export const moviesWorld = (data: PlaygroundData) =>
  buildGallery(data, {
    id: 'movies',
    prefix: 'movie',
    cards: data.movies,
    emoji: '🎬',
    floor: wallTexture('#2a1f3d', '#33264a', 'dots'),
    wall: wallTexture('#1f1530', '#291c3d', 'stripes'),
    trim: 0x120c1c,
    background: 0x0b0814,
    light: 0xd9c9ff,
    accent: '#e9c46a',
    poster: posterTexture,
    decorate({ scene, kit, W, D, H, backTop }) {
      const update = cinemaScreen(scene, kit, { text: data.strings.nowShowing, width: 6, height: Math.max(1.4, H - backTop - 0.75), y: (backTop + H - 0.6) / 2, z: -D / 2 + 0.1, H, W });
      // Rows of red seats.
      const seatMat = kit.toon(0xc0283e);
      const rows = 3;
      const cols = 8;
      const seats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.45, 0.6), seatMat, rows * cols);
      const backs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.7, 0.14), seatMat, rows * cols);
      const m = new THREE.Matrix4();
      const firstZ = -D / 2 + 5.4;
      let n = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = -3.15 + c * 0.9;
          const z = firstZ + r * 1.4;
          m.makeTranslation(x, 0.4, z);
          seats.setMatrixAt(n, m);
          m.makeTranslation(x, 0.9, z + 0.3);
          backs.setMatrixAt(n, m);
          n++;
        }
      }
      scene.add(seats, backs);
      return {
        obstacles: [
          { minX: -3.6, maxX: 3.6, minZ: firstZ - 0.4, maxZ: firstZ + (rows - 1) * 1.4 + 0.5 },
          popcornCart(scene, kit, kit.gradientMap, -4.6, D / 2 - 2.4),
        ],
        update,
      };
    },
  });
