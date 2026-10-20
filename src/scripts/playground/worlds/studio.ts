import * as THREE from 'three';
import { buildExitDoor, buildRoom, labelTexture, makeKit, markHits, roomLights, wallTexture, woodTexture } from '../kit';
import { glowTexture } from '../textures';
import type { Interactable, PlaygroundData, World } from '../types';

const W = 16;
const D = 22;
const H = 6;
const FRAME_W = 1.5;
const FRAME_H = FRAME_W * (9 / 16);

/** Music → a cozy recording studio. Every performance hangs on the wall; walk up to play it. */
export const studioWorld = (data: PlaygroundData) => (gradientMap: THREE.Texture): World => {
  const kit = makeKit(gradientMap);
  const { toon, glow, box, cyl, ball, at } = kit;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14182c);
  scene.fog = new THREE.Fog(0x14182c, 18, 40);
  roomLights(scene, 0xffe9cc, 0x2a2238, 1.25);
  buildRoom(scene, kit, { width: W, depth: D, height: H, floor: woodTexture(), wall: wallTexture('#2e4057', '#34496a', 'panels'), trim: 0x3a2618 });

  const items: Interactable[] = [];
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const frameMat = toon(0x6b4329);
  const sectionSigns: THREE.Object3D[] = [];

  /** Hang one framed video on a wall. */
  function hang(video: PlaygroundData['music'][number]['videos'][number], wall: 'left' | 'right' | 'back', u: number, y: number, offset: number) {
    const g = new THREE.Group();
    const frame = box(FRAME_W + 0.14, FRAME_H + 0.14, 0.06, frameMat);
    const tex = loader.load(`https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/mqdefault.jpg`);
    tex.colorSpace = THREE.SRGBColorSpace;
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(FRAME_W, FRAME_H), new THREE.MeshBasicMaterial({ map: tex, color: 0xd9d4cc }));
    pic.position.z = 0.035;
    g.add(frame, pic);
    let front: THREE.Vector3;
    let facing: number;
    if (wall === 'left') {
      g.position.set(-W / 2 + 0.05, y, u);
      g.rotation.y = Math.PI / 2;
      front = new THREE.Vector3(-W / 2 + 1.1, 0, u + offset);
      facing = -Math.PI / 2;
    } else if (wall === 'right') {
      g.position.set(W / 2 - 0.05, y, u);
      g.rotation.y = -Math.PI / 2;
      front = new THREE.Vector3(W / 2 - 1.1, 0, u + offset);
      facing = Math.PI / 2;
    } else {
      g.position.set(u, y, -D / 2 + 0.05);
      front = new THREE.Vector3(u + offset, 0, -D / 2 + 3);
      facing = Math.PI;
    }
    scene.add(g);
    const id = `video:${video.id}`;
    items.push({
      id,
      kind: 'item',
      label: video.title,
      emoji: '🎬',
      front,
      facing,
      hits: markHits([frame, pic], id),
      setNear(n) {
        g.scale.setScalar(n ? 1.06 : 1);
      },
    });
  }

  function sign(text: string, sub: string, wall: 'left' | 'right' | 'back', u: number, y: number) {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 0.6),
      new THREE.MeshBasicMaterial({ map: labelTexture(text, { sub, bg: '#fff3dc', border: '#e76f51', height: 192 }), color: 0xe0d8cc, transparent: true }),
    );
    if (wall === 'left') {
      plane.position.set(-W / 2 + 0.06, y, u);
      plane.rotation.y = Math.PI / 2;
    } else if (wall === 'right') {
      plane.position.set(W / 2 - 0.06, y, u);
      plane.rotation.y = -Math.PI / 2;
    } else plane.position.set(u, y, -D / 2 + 0.06);
    scene.add(plane);
    sectionSigns.push(plane);
  }

  /** Lay out a section as a two-row grid along a wall between u0 and u1. */
  function gallery(section: PlaygroundData['music'][number] | undefined, wall: 'left' | 'right', u0: number, u1: number) {
    if (!section || !section.videos.length) return;
    const cols = Math.ceil(section.videos.length / 2);
    const step = cols > 1 ? (u1 - u0) / (cols - 1) : 0;
    section.videos.forEach((v, i) => {
      const col = Math.floor(i / 2);
      const top = i % 2 === 0;
      const u = cols > 1 ? u0 + step * col : (u0 + u1) / 2;
      // Stagger where Mochi stands so each frame (top or bottom) can be reached by walking.
      const dir = Math.sign(u1 - u0) || 1;
      hang(v, wall, u, top ? 3.05 : 1.75, (top ? -0.3 : 0.3) * dir * Math.min(1, Math.abs(step) / 1.6));
    });
    sign(section.title, `${section.videos.length} 🎻`, wall, (u0 + u1) / 2, 4.25);
  }

  const [solo, chamber, uw, school] = data.music;
  gallery(solo, 'left', 8, 1.6);
  gallery(chamber, 'left', -1.2, -7.6);
  gallery(uw, 'right', 7.4, -8.2);
  // Any further sections join the back wall with the school orchestras.
  const backVideos = [school, ...data.music.slice(4)].filter(Boolean).flatMap((s) => s!.videos);
  backVideos.forEach((v, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const k = Math.floor(i / 2);
    hang(v, 'back', side * (4.6 + (k % 2) * 1.9), k < 2 ? 2.4 : 3.6, 0);
  });
  if (school) sign(school.title, `${backVideos.length} 🎻`, 'back', -5.5, 4.4);

  // ── Stage with a cello, mic, and spotlights ───────────────────────────────
  const stage = at(new THREE.Group(), 0, 0, -D / 2 + 1.6, scene);
  stage.add(at(box(5.2, 0.32, 2.8, toon(0x5a3a26)), 0, 0.16, 0));
  stage.add(at(box(5.4, 0.06, 3.0, toon(0x3d2718)), 0, 0.33, 0));
  const cello = new THREE.Group();
  const celloWood = toon(0xb0632c);
  const lower = ball(0.42, celloWood, 24);
  lower.scale.set(1, 1.15, 0.42);
  const upper = ball(0.33, celloWood, 24);
  upper.scale.set(1, 1.1, 0.42);
  upper.position.y = 0.66;
  const neck = box(0.08, 0.95, 0.06, toon(0x2a1a10));
  neck.position.y = 1.4;
  const scroll = ball(0.07, toon(0x2a1a10));
  scroll.position.y = 1.9;
  const strings = box(0.05, 1.6, 0.01, new THREE.MeshBasicMaterial({ color: 0xe8e0d0 }));
  strings.position.set(0, 0.8, 0.19);
  cello.add(lower, upper, neck, scroll, strings);
  cello.rotation.z = -0.12;
  at(cello, 0.5, 0.95, 0.2, stage);
  const chair = new THREE.Group();
  chair.add(at(box(0.7, 0.08, 0.6, toon(0x7a4a2c)), 0, 0.55, 0), at(box(0.7, 0.8, 0.08, toon(0x7a4a2c)), 0, 0.95, -0.28));
  for (const [x, z] of [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]]) chair.add(at(cyl(0.03, 0.03, 0.55, toon(0x3d2718)), x, 0.27, z));
  at(chair, -0.5, 0.36, -0.2, stage);
  const standMat = toon(0x2b2b33);
  stage.add(at(cyl(0.02, 0.02, 1.1, standMat), -1.6, 0.9, 0.4), at(box(0.55, 0.4, 0.03, standMat), -1.6, 1.5, 0.45));
  stage.add(at(cyl(0.02, 0.02, 1.4, standMat), 1.7, 1.05, 0.5), at(ball(0.08, toon(0x9aa0aa)), 1.7, 1.8, 0.5));
  // Spotlight cones.
  for (const x of [-1.2, 1.4]) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 4.6, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xfff1c9, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
    );
    cone.position.set(x, 2.9, 0);
    stage.add(cone);
    const spot = new THREE.SpotLight(0xffe6b0, 18, 9, 0.5, 0.6, 1.4);
    spot.position.set(x, 5.4, 0.4);
    spot.target.position.set(x * 0.4, 0, 0);
    stage.add(spot, spot.target);
  }
  // ON AIR light.
  const onAir = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ map: labelTexture('ON AIR', { bg: '#3a0d12', fg: '#ff6b6b', border: '#ff6b6b' }), transparent: true }));
  onAir.position.set(0, 4.6, -D / 2 + 0.07);
  scene.add(onAir);
  const onAirMat = onAir.material as THREE.MeshBasicMaterial;

  // Speakers, acoustic panels, rug, pendant lamps.
  for (const s of [-1, 1]) {
    const spk = at(new THREE.Group(), s * 3.4, 0, -D / 2 + 1.4, scene);
    spk.add(at(box(0.9, 1.5, 0.7, toon(0x26262e)), 0, 0.75, 0));
    for (const [y, r] of [[1.15, 0.22], [0.5, 0.3]]) {
      const cone = cyl(r, r * 0.8, 0.05, toon(0x55555f), 20);
      cone.rotation.x = Math.PI / 2;
      spk.add(at(cone, 0, y, 0.36));
    }
  }
  const panelColors = [0xe76f51, 0xf4a261, 0x2a9d8f, 0xe9c46a];
  for (let i = 0; i < 6; i++) {
    const p = box(0.9, 0.9, 0.12, toon(panelColors[i % 4]));
    at(p, -5.5 + i * 2.2, 5.2, -D / 2 + 0.08, scene);
  }
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.2, 40), toon(0x8e3b46));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.012, 1);
  scene.add(rug);
  const rugInner = new THREE.Mesh(new THREE.RingGeometry(2.4, 2.7, 40), toon(0xf4d58d));
  rugInner.rotation.x = -Math.PI / 2;
  rugInner.position.set(0, 0.014, 1);
  scene.add(rugInner);
  const lampGlow = glowTexture('rgba(255,214,150,0.7)');
  for (const [x, z] of [[-3.5, 5], [3.5, 5], [-3.5, -3], [3.5, -3]]) {
    scene.add(at(cyl(0.01, 0.01, 0.4, new THREE.MeshBasicMaterial({ color: 0x111111 })), x, H - 0.2, z));
    scene.add(at(ball(0.2, glow(0xffd29a, 2.2)), x, H - 0.45, z));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lampGlow, transparent: true, depthWrite: false }));
    halo.scale.set(0.9, 0.9, 1);
    scene.add(at(halo, x, H - 0.45, z));
    const l = new THREE.PointLight(0xffd29a, 6, 9, 1.5);
    scene.add(at(l, x, H - 0.65, z));
  }

  // Exit back to the market, on the right wall near the entrance.
  const exit = buildExitDoor(scene, kit, W / 2 - 0.05, 9.4, data.strings.back);
  items.push({ id: 'exit', kind: 'exit', label: data.strings.back, emoji: '🏮', front: new THREE.Vector3(W / 2 - 1.1, 0, 9.4), facing: Math.PI / 2, hits: markHits(exit.hits, 'exit') });

  return {
    id: 'studio',
    scene,
    bounds: { minX: -W / 2 + 1.1, maxX: W / 2 - 1.1, minZ: -D / 2 + 3, maxZ: D / 2 - 0.8 },
    spawn: new THREE.Vector3(0, 0, D / 2 - 1.6),
    spawnFacing: Math.PI,
    camera: { back: 6.4, up: 4.4, lookAhead: 3, lookY: 1.7, followX: 0.75 },
    bloom: { strength: 0.45, radius: 0.4, threshold: 0.94 },
    items,
    update(t) {
      onAirMat.color.setScalar(1.2 + Math.sin(t * 2) * 0.3);
    },
  };
};
