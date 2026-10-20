import * as THREE from 'three';
import { buildExitDoor, buildRoom, EMOJI_FONT, FONT, imageOr, labelTexture, makeKit, markHits, roomLights, wallTexture } from '../kit';
import { canvasTexture } from '../textures';
import type { Interactable, LibraryCard, PlaygroundData, World } from '../types';

const W = 18;
const D = 16;
const H = 7;

type Sport = 'football' | 'tennis' | 'basketball' | 'tabletennis' | 'other';
const sportOf = (card: LibraryCard): Sport => {
  const s = `${card.subtitle ?? ''}`;
  if (/football|soccer|足球/i.test(s)) return 'football';
  if (/table tennis|桌球|乒乓/i.test(s)) return 'tabletennis';
  if (/tennis|網球/i.test(s)) return 'tennis';
  if (/basketball|籃球/i.test(s)) return 'basketball';
  return 'other';
};
const EMOJI: Record<Sport, string> = { football: '⚽', tennis: '🎾', basketball: '🏀', tabletennis: '🏓', other: '🏅' };

/** Fallback portrait card when there's no photo. */
function portraitCard(card: LibraryCard, sport: Sport): THREE.CanvasTexture {
  return canvasTexture(400, 520, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#22336b');
    grad.addColorStop(1, '#0d1430');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `160px ${EMOJI_FONT}`;
    g.fillText(EMOJI[sport], w / 2, h * 0.4);
    g.fillStyle = '#ffd166';
    g.font = `800 40px ${FONT}`;
    g.fillText(card.title, w / 2, h * 0.75);
  });
}

/** Floor with court lines. */
function courtTexture(): THREE.CanvasTexture {
  return canvasTexture(1024, 1024, (g, w, h) => {
    g.fillStyle = '#c98a4b';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.12)';
    for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 3, h);
    g.strokeStyle = '#fff6e3';
    g.lineWidth = 10;
    g.strokeRect(60, 60, w - 120, h - 120);
    g.beginPath();
    g.arc(w / 2, h / 2, 140, 0, Math.PI * 2);
    g.moveTo(60, h / 2);
    g.lineTo(w - 60, h / 2);
    g.stroke();
  });
}

/** Sports → a hall of my GOATs. */
export const sportsWorld = (data: PlaygroundData) => (gradientMap: THREE.Texture): World => {
  const kit = makeKit(gradientMap);
  const { toon, glow, box, cyl, ball, at } = kit;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1428);
  scene.fog = new THREE.Fog(0x0f1428, 18, 40);
  roomLights(scene, 0xe8eeff, 0x1f2238, 1.25);
  const floorTex = courtTexture();
  const room = buildRoom(scene, kit, { width: W, depth: D, height: H, floor: floorTex, wall: wallTexture('#1f2a55', '#26336a', 'stripes'), trim: 0xd4a017 });
  // Court lines read best unrepeated.
  const floorMat = room.floor.material as THREE.MeshToonMaterial;
  floorMat.map!.repeat.set(1, 1);

  const banner = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.1), new THREE.MeshBasicMaterial({ map: labelTexture(data.strings.goats, { emoji: '🐐', bg: '#ffd166', fg: '#1f2a55', border: '#1f2a55' }), transparent: true }));
  banner.position.set(0, H - 1.1, -D / 2 + 0.08);
  scene.add(banner);

  const items: Interactable[] = [];
  const n = data.sports.length;
  const spacing = Math.min(3.8, (W - 3) / Math.max(n, 1));
  data.sports.forEach((card, i) => {
    const sport = sportOf(card);
    const x = -((n - 1) * spacing) / 2 + i * spacing;
    const z = -D / 2 + 3.2;
    const g = at(new THREE.Group(), x, 0, z, scene);
    // Marble pedestal.
    const base = cyl(0.75, 0.85, 1.0, toon(0xeeeae2), 24);
    g.add(at(base, 0, 0.5, 0), at(cyl(0.85, 0.85, 0.1, toon(0xd4a017), 24), 0, 1.02, 0));
    // Framed portrait behind the pedestal.
    const frame = box(1.7, 2.2, 0.1, toon(0xd4a017));
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.0), new THREE.MeshBasicMaterial({ map: imageOr(card.image, () => portraitCard(card, sport)), color: 0xe4e0d8 }));
    photo.position.z = 0.056;
    const portrait = at(new THREE.Group(), 0, 3.2, -0.9, g);
    portrait.add(frame, photo);
    // Sport prop on the pedestal.
    const prop = at(new THREE.Group(), 0, 1.35, 0, g);
    if (sport === 'football') {
      prop.add(ball(0.26, toon(0xffffff), 20));
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        prop.add(at(ball(0.07, toon(0x222222), 8), Math.cos(a) * 0.22, Math.sin(a) * 0.12, Math.sin(a) * 0.15 + 0.05));
      }
    } else if (sport === 'basketball') {
      prop.add(ball(0.28, toon(0xe76f2a), 20));
      const seam = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.012, 6, 30), toon(0x2a1a10));
      prop.add(seam);
      const seam2 = seam.clone();
      seam2.rotation.y = Math.PI / 2;
      prop.add(seam2);
    } else if (sport === 'tennis') {
      const head = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 24), toon(0x3a86ff));
      head.scale.y = 1.3;
      head.position.y = 0.25;
      const handle = cyl(0.03, 0.03, 0.4, toon(0x222222));
      handle.position.y = -0.2;
      const tb = ball(0.08, toon(0xd9f542, { emissive: new THREE.Color(0xd9f542), emissiveIntensity: 0.3 }));
      tb.position.set(0.3, -0.25, 0.1);
      prop.add(head, handle, tb);
    } else if (sport === 'tabletennis') {
      const paddle = cyl(0.2, 0.2, 0.04, toon(0xd62828), 24);
      paddle.rotation.x = Math.PI / 2;
      paddle.position.y = 0.15;
      const grip = box(0.07, 0.25, 0.06, toon(0x8a5a3a));
      grip.position.y = -0.12;
      const pb = ball(0.05, toon(0xffffff));
      pb.position.set(0.28, 0.1, 0.05);
      prop.add(paddle, grip, pb);
    } else prop.add(ball(0.22, toon(0xffd166)));
    // Name plaque.
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.42),
      new THREE.MeshBasicMaterial({ map: labelTexture(card.title, { sub: card.subtitle, bg: '#1f2a55', fg: '#ffd166', border: '#ffd166', height: 220 }), transparent: true }),
    );
    plaque.position.set(0, 0.62, 0.82);
    g.add(plaque);
    // Spotlight.
    const spot = new THREE.SpotLight(0xfff2cc, 14, 10, 0.45, 0.6, 1.4);
    spot.position.set(x, H - 0.3, z + 1.5);
    spot.target.position.set(x, 1.5, z);
    scene.add(spot, spot.target);
    const id = `athlete:${i}`;
    items.push({
      id,
      kind: 'item',
      label: card.title,
      emoji: EMOJI[sport],
      front: new THREE.Vector3(x, 0, z + 2.1),
      facing: Math.PI,
      hits: markHits([base, frame, photo, plaque], id),
      update(t) {
        prop.rotation.y = t * 0.9 + i;
        prop.position.y = 1.35 + Math.sin(t * 2 + i) * 0.05;
      },
      setNear(nv) {
        spot.intensity = nv ? 24 : 14;
      },
    });
  });
  const obstacles = data.sports.map((_, i) => {
    const x = -((n - 1) * spacing) / 2 + i * spacing;
    const z = -D / 2 + 3.2;
    return { minX: x - 0.85, maxX: x + 0.85, minZ: z - 1.0, maxZ: z + 0.85 };
  });

  // A trophy case at the side.
  const cabinet = at(new THREE.Group(), -W / 2 + 0.9, 0, 2.5, scene);
  cabinet.rotation.y = Math.PI / 2;
  cabinet.add(at(box(3, 2.6, 0.7, toon(0x5e3c27)), 0, 1.3, 0));
  for (let k = 0; k < 5; k++) {
    const cup = cyl(0.14, 0.06, 0.3, glow(0xffc93c, 0.4));
    cabinet.add(at(cup, -1.1 + k * 0.55, 1.75 + (k % 2) * 0.6, 0.2));
  }

  const exit = buildExitDoor(scene, kit, W / 2 - 0.05, D / 2 - 1.6, data.strings.back);
  items.push({ id: 'exit', kind: 'exit', label: data.strings.back, emoji: '🏮', front: new THREE.Vector3(W / 2 - 1.2, 0, D / 2 - 1.6), facing: Math.PI / 2, hits: markHits(exit.hits, 'exit') });

  return {
    id: 'sports',
    scene,
    bounds: { minX: -W / 2 + 1.8, maxX: W / 2 - 1.2, minZ: -D / 2 + 2.2, maxZ: D / 2 - 0.8 },
    obstacles,
    spawn: new THREE.Vector3(0, 0, D / 2 - 1.6),
    spawnFacing: Math.PI,
    camera: { back: 6, up: 4, lookAhead: 3, lookY: 1.8, followX: 0.75 },
    bloom: { strength: 0.45, radius: 0.4, threshold: 0.94 },
    items,
    update() {},
  };
};
