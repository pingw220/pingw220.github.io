import * as THREE from 'three';
import { awningTexture, bannerTexture, signTexture } from './textures';
import { STREET } from './world';

export type StallKind = 'music' | 'posts' | 'novels' | 'anime' | 'dramas' | 'movies' | 'travel' | 'sports' | 'mail';

export interface StallDef {
  /** The world this stall leads into. */
  id: string;
  /** Which props to put on the counter. */
  props: StallKind;
  label: string;
  emoji: string;
  /** Awning color. */
  color: string;
  side: -1 | 1;
  z: number;
}

export interface Stall {
  id: string;
  group: THREE.Group;
  /** Where Joy stands to visit the stall (on the lane). */
  front: THREE.Vector3;
  hits: THREE.Object3D[];
  setNear(near: boolean): void;
  update(t: number): void;
}

type Toon = (color: THREE.ColorRepresentation, extra?: THREE.MeshToonMaterialParameters) => THREE.MeshToonMaterial;

export function buildStall(def: StallDef, gradientMap: THREE.Texture): Stall {
  const toon: Toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap, ...extra });
  const group = new THREE.Group();
  const hits: THREE.Object3D[] = [];
  const add = <T extends THREE.Object3D>(obj: T, hit = true): T => {
    group.add(obj);
    if (hit) hits.push(obj);
    return obj;
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  const wood = toon(0x8a5a3a);
  const darkWood = toon(0x5e3c27);

  // Counter, back shelf, posts. Built facing +z, then turned toward the lane.
  const counter = add(box(2.8, 0.95, 0.9, wood));
  counter.position.set(0, 0.475, 0.35);
  const top = add(box(3.0, 0.08, 1.05, darkWood));
  top.position.set(0, 0.98, 0.35);
  const back = add(box(2.8, 2.3, 0.14, darkWood));
  back.position.set(0, 1.15, -0.7);
  for (const y of [1.45, 2.05]) {
    const shelf = add(box(2.6, 0.06, 0.32, wood));
    shelf.position.set(0, y, -0.52);
  }
  for (const [x, z] of [[-1.45, 0.85], [1.45, 0.85], [-1.45, -0.72], [1.45, -0.72]]) {
    const post = add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.75, 8), darkWood));
    post.position.set(x, 1.375, z);
  }

  // Striped awning with a scalloped front edge.
  const stripes = awningTexture(def.color);
  const roof = add(new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.1), toon(0xffffff, { map: stripes, side: THREE.DoubleSide })));
  roof.position.set(0, 2.88, 0.1);
  roof.rotation.x = -Math.PI / 2 + 0.32;
  const valance = add(
    new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.55), toon(0xffffff, { map: stripes, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })),
  );
  valance.position.set(0, 2.33, 1.12);

  // Sign board above the awning.
  const sign = add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.8), new THREE.MeshBasicMaterial({ map: signTexture(def.emoji, def.label, def.color), color: 0xd8d2c8, transparent: true })));
  sign.position.set(0, 3.55, 0.9);
  sign.rotation.x = -0.12;

  // Hanging cloth banner (noren-style) at the front corner, facing down the lane so the
  // stall can be read from a distance. The lane runs along the stall's local x axis.
  const bannerTex = bannerTexture(def.emoji, def.label, def.color);
  const banner = add(new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.55), new THREE.MeshBasicMaterial({ map: bannerTex, color: 0xd8d2c8, transparent: true, side: THREE.DoubleSide })));
  // On the entrance-side corner, turned so its front faces back down the lane (toward
  // the camera) on both sides of the street.
  banner.position.set(def.side * 1.5, 1.95, 1.2);
  banner.rotation.y = -Math.PI / 2;
  const bannerRod = add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 6), darkWood), false);
  bannerRod.position.set(banner.position.x, 2.75, 1.2);
  bannerRod.rotation.x = Math.PI / 2;

  // Paper lantern hanging at the front corner, lighting the stall.
  const lanternColor = new THREE.Color(def.color).lerp(new THREE.Color(0xffd08a), 0.5);
  const lanternMat = toon(lanternColor, { emissive: lanternColor.clone(), emissiveIntensity: 1.4 });
  const lantern = add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), lanternMat), false);
  lantern.scale.set(1, 1.25, 1);
  lantern.position.set(1.3, 2.0, 1.15);
  const light = new THREE.PointLight(0xffc98a, 5, 7, 1.6);
  light.position.set(0.6, 2.0, 1.4);
  group.add(light);

  // Props on the counter.
  const animated: ((t: number) => void)[] = [];
  buildProps(def.props, group, toon, animated);

  // Face the lane.
  group.position.set(def.side * (STREET.halfWidth + 1.85), 0, def.z);
  group.rotation.y = def.side < 0 ? Math.PI / 2 : -Math.PI / 2;
  hits.forEach((h) => (h.userData.itemId = def.id));

  const front = new THREE.Vector3(def.side * (STREET.halfWidth - 0.55), 0, def.z);

  let near = false;
  return {
    id: def.id,
    group,
    front,
    hits,
    setNear(n) {
      near = n;
    },
    update(t) {
      animated.forEach((a) => a(t));
      const target = near ? 2.6 : 1.4;
      lanternMat.emissiveIntensity += (target - lanternMat.emissiveIntensity) * 0.1;
      light.intensity += ((near ? 9 : 5) - light.intensity) * 0.1;
      sign.position.y = 3.55 + (near ? Math.sin(t * 4) * 0.04 + 0.05 : 0);
      banner.rotation.x = Math.sin(t * 1.6 + def.z) * 0.04;
    },
  };
}

function buildProps(kind: StallKind, group: THREE.Group, toon: Toon, animated: ((t: number) => void)[]) {
  const counterTop = 1.02;
  const put = (obj: THREE.Object3D, x: number, y: number, z: number) => {
    obj.position.set(x, y, z);
    group.add(obj);
    return obj;
  };
  const sphere = (r: number, color: THREE.ColorRepresentation, extra?: THREE.MeshToonMaterialParameters) =>
    new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), toon(color, extra));
  const box = (w: number, h: number, d: number, color: THREE.ColorRepresentation, extra?: THREE.MeshToonMaterialParameters) =>
    new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color, extra));

  // Jars and little things on the back shelves for every stall.
  const jarColors = [0xffd3a3, 0xb7e3c8, 0xc9c2ff, 0xffb9c8];
  for (let i = 0; i < 4; i++) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.26, 12), toon(jarColors[i], { transparent: true, opacity: 0.9 }));
    put(jar, -0.9 + i * 0.6, 1.62, -0.52);
  }

  if (kind === 'music') {
    // A small cello leaning by the counter.
    const cello = new THREE.Group();
    const wood = 0xa35a2a;
    const lower = sphere(0.36, wood);
    lower.scale.set(1, 1.15, 0.45);
    const upper = sphere(0.28, wood);
    upper.scale.set(1, 1.1, 0.45);
    upper.position.y = 0.55;
    const neck = box(0.07, 0.75, 0.05, 0x3a2416);
    neck.position.y = 1.15;
    const scroll = sphere(0.06, 0x3a2416);
    scroll.position.y = 1.55;
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), toon(0x777777));
    pin.position.y = -0.48;
    cello.add(lower, upper, neck, scroll, pin);
    cello.rotation.z = -0.18;
    put(cello, 0.95, counterTop + 0.45, 0.35);
    // Floating notes.
    for (let i = 0; i < 3; i++) {
      const note = new THREE.Group();
      const head = sphere(0.07, 0xfff3c4, { emissive: new THREE.Color(0xfff3c4), emissiveIntensity: 1.2 });
      head.scale.set(1.25, 1, 0.6);
      const stem = box(0.02, 0.22, 0.02, 0xfff3c4, { emissive: new THREE.Color(0xfff3c4), emissiveIntensity: 1.2 });
      stem.position.set(0.07, 0.11, 0);
      note.add(head, stem);
      put(note, -0.7 + i * 0.45, counterTop + 0.4, 0.4);
      animated.push((t) => {
        note.position.y = counterTop + 0.4 + ((t * 0.35 + i * 0.33) % 1) * 1.1;
        note.rotation.z = Math.sin(t * 2 + i) * 0.3;
        note.scale.setScalar(1 - (((t * 0.35 + i * 0.33) % 1) ** 3) * 0.9);
      });
    }
  } else if (kind === 'posts') {
    for (let i = 0; i < 5; i++) {
      const paper = box(0.55, 0.025, 0.42, i % 2 ? 0xfdf6e6 : 0xf3e9d2);
      paper.rotation.y = (i - 2) * 0.08;
      put(paper, -0.7, counterTop + 0.02 + i * 0.03, 0.35);
    }
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12), toon(0xf5e6c4));
    scroll.rotation.z = Math.PI / 2;
    put(scroll, 0.2, counterTop + 0.09, 0.45);
    for (const s of [-1, 1]) {
      const end = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12), toon(0xc0453a));
      end.rotation.z = Math.PI / 2;
      put(end, 0.2 + s * 0.32, counterTop + 0.09, 0.45);
    }
    const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.16, 12), toon(0x2b2f5c));
    put(ink, 0.9, counterTop + 0.08, 0.3);
    const quill = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.6, 8), toon(0xfdfbf7));
    quill.rotation.z = -0.5;
    put(quill, 0.98, counterTop + 0.35, 0.3);
  } else if (kind === 'novels') {
    const colors = [0x9b3b4a, 0x2f5d8a, 0xd9a441, 0x3f7a5a, 0x7b4fa0];
    for (let i = 0; i < 5; i++) {
      const book = box(0.5, 0.11, 0.36, colors[i]);
      book.rotation.y = (i % 2 ? 1 : -1) * 0.12;
      put(book, -0.75, counterTop + 0.06 + i * 0.11, 0.35);
    }
    for (let i = 0; i < 6; i++) {
      const spine = box(0.1, 0.42 + (i % 3) * 0.06, 0.3, colors[(i + 2) % colors.length]);
      put(spine, 0.25 + i * 0.12, counterTop + 0.22, 0.25);
    }
    // Books on the top shelf too.
    for (let i = 0; i < 8; i++) put(box(0.09, 0.32, 0.24, colors[i % colors.length]), -1.0 + i * 0.27, 2.25, -0.52);
  } else if (kind === 'anime') {
    const tv = new THREE.Group();
    tv.add(box(0.75, 0.58, 0.5, 0xf4e3c3));
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.42), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x8fd3ff).multiplyScalar(1.3) }));
    screen.position.z = 0.256;
    tv.add(screen);
    for (const s of [-1, 1]) {
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6), toon(0x555555));
      antenna.position.set(s * 0.12, 0.45, 0);
      antenna.rotation.z = s * -0.5;
      tv.add(antenna);
    }
    put(tv, -0.55, counterTop + 0.3, 0.35);
    animated.push((t) => (screen.material as THREE.MeshBasicMaterial).color.setHSL(0.55 + Math.sin(t * 0.8) * 0.1, 0.8, 0.7).multiplyScalar(1.3));
    // A little star plush.
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), toon(0xffd166, { emissive: new THREE.Color(0xffb703), emissiveIntensity: 0.6 }));
    put(star, 0.6, counterTop + 0.35, 0.4);
    animated.push((t) => {
      star.rotation.y = t * 1.5;
      star.position.y = counterTop + 0.35 + Math.sin(t * 2) * 0.05;
    });
  } else if (kind === 'sports') {
    // Soccer ball, basketball, and a trophy.
    const soccer = sphere(0.2, 0xffffff);
    put(soccer, -0.75, counterTop + 0.2, 0.35);
    for (let k = 0; k < 6; k++) {
      const patch = sphere(0.06, 0x222222);
      const a = (k / 6) * Math.PI * 2;
      put(patch, -0.75 + Math.cos(a) * 0.17, counterTop + 0.2 + Math.sin(a) * 0.17, 0.42);
    }
    const hoopBall = sphere(0.22, 0xe76f2a);
    put(hoopBall, -0.15, counterTop + 0.22, 0.35);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.08, 0.32, 16), toon(0xffc93c, { emissive: new THREE.Color(0xffb703), emissiveIntensity: 0.4 }));
    put(cup, 0.7, counterTop + 0.5, 0.35);
    put(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), toon(0xffc93c)), 0.7, counterTop + 0.24, 0.35);
    put(box(0.32, 0.1, 0.32, 0x3d2718), 0.7, counterTop + 0.05, 0.35);
    for (const s of [-1, 1]) {
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12, Math.PI), toon(0xffc93c));
      handle.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2;
      put(handle, 0.7 + s * 0.21, counterTop + 0.55, 0.35);
    }
    const racket = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 6, 20), toon(0x3a86ff));
    racket.scale.y = 1.3;
    racket.rotation.z = 0.4;
    put(racket, 0.2, counterTop + 0.55, 0.15);
    animated.push((t) => (cup.rotation.y = t * 0.8));
  } else if (kind === 'mail') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 16), toon(0xd62828));
    put(body, -0.7, counterTop + 0.3, 0.35);
    const dome = sphere(0.22, 0xd62828);
    dome.scale.y = 0.6;
    put(dome, -0.7, counterTop + 0.6, 0.35);
    put(box(0.2, 0.03, 0.02, 0x1a1a1a), -0.7, counterTop + 0.48, 0.57);
    for (let i = 0; i < 4; i++) {
      const env = box(0.42, 0.02, 0.28, [0xfff6e3, 0xfdeaea, 0xeaf4ff, 0xeefbe8][i]);
      env.rotation.y = (i - 1.5) * 0.15;
      put(env, 0.35, counterTop + 0.02 + i * 0.025, 0.35);
    }
    const heart = sphere(0.09, 0xff6b9a, { emissive: new THREE.Color(0xff6b9a), emissiveIntensity: 0.8 });
    put(heart, 0.35, counterTop + 0.35, 0.35);
    animated.push((t) => (heart.position.y = counterTop + 0.35 + Math.sin(t * 2.5) * 0.06));
  } else if (kind === 'dramas') {
    // A flat TV on a stand, and a stack of box sets.
    const tv = new THREE.Group();
    tv.add(box(0.95, 0.58, 0.06, 0x1d1d26));
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.49), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    screen.position.z = 0.032;
    tv.add(screen);
    const foot = box(0.3, 0.04, 0.2, 0x1d1d26);
    foot.position.y = -0.34;
    tv.add(foot);
    put(tv, -0.45, counterTop + 0.37, 0.3);
    animated.push((t) => (screen.material as THREE.MeshBasicMaterial).color.setHSL((t * 0.05) % 1, 0.7, 0.62).multiplyScalar(1.3));
    for (let i = 0; i < 4; i++) {
      const set = box(0.34, 0.08, 0.46, [0xe63946, 0x457b9d, 0x2a9d8f, 0xffb703][i]);
      set.rotation.y = (i - 1.5) * 0.1;
      put(set, 0.62, counterTop + 0.04 + i * 0.085, 0.35);
    }
  } else if (kind === 'movies') {
    // A spinning film reel, a clapperboard, and popcorn.
    const reel = new THREE.Group();
    reel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 24), toon(0x2b2b33)));
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.07, 12), toon(0x9aa0ad));
      hole.position.set(Math.cos(a) * 0.17, 0.001, Math.sin(a) * 0.17);
      reel.add(hole);
    }
    reel.rotation.x = Math.PI / 2;
    const reelHolder = new THREE.Group();
    reelHolder.add(reel);
    put(reelHolder, -0.6, counterTop + 0.36, 0.3);
    animated.push((t) => (reel.rotation.y = t * 1.6));
    const clap = new THREE.Group();
    clap.add(box(0.46, 0.32, 0.03, 0x1d1d26));
    const arm = box(0.48, 0.07, 0.035, 0xffffff);
    arm.position.set(0, 0.2, 0);
    clap.add(arm);
    put(clap, 0.05, counterTop + 0.17, 0.4);
    animated.push((t) => (arm.rotation.z = Math.max(0, Math.sin(t * 2.2)) * 0.35));
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.34, 14), toon(0xe63946));
    put(bucket, 0.65, counterTop + 0.17, 0.35);
    for (let k = 0; k < 7; k++) put(sphere(0.06, 0xfff1b5), 0.65 + Math.cos(k) * 0.09, counterTop + 0.37 + (k % 2) * 0.04, 0.35 + Math.sin(k) * 0.09);
  } else if (kind === 'travel') {
    const suitcase = box(0.7, 0.48, 0.25, 0x2f8f8a);
    put(suitcase, -0.6, counterTop + 0.24, 0.35);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 16, Math.PI), toon(0x3a2416));
    put(handle, -0.6, counterTop + 0.48, 0.35);
    for (const [x, c] of [[-0.75, 0xffd166], [-0.45, 0xef476f]] as const) put(box(0.12, 0.12, 0.01, c), x, counterTop + 0.3, 0.48);
    const globe = sphere(0.24, 0x4aa3df);
    put(globe, 0.6, counterTop + 0.42, 0.35);
    const land = sphere(0.245, 0x6cc070, { transparent: true, opacity: 0.85 });
    land.scale.set(1, 0.6, 0.7);
    put(land, 0.62, counterTop + 0.45, 0.36);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.12, 0.18, 10), toon(0x5e3c27));
    put(stand, 0.6, counterTop + 0.09, 0.35);
    animated.push((t) => {
      globe.rotation.y = t * 0.6;
      land.rotation.y = t * 0.6;
    });
  }
}
