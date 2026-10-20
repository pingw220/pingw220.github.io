import * as THREE from 'three';
import { glowTexture } from './textures';

/** Rockets that rise, burst into colored sparks, and fade. One pooled particle system. */
export interface Fireworks {
  /** Launch a show of `count` rockets from around `origin`. */
  show(origin: THREE.Vector3, count?: number): void;
  update(dt: number): void;
}

const MAX = 2400;
const COLORS = [0xff6b6b, 0xffd166, 0x06d6a0, 0x4cc9f0, 0xf15bb5, 0xff9f1c, 0xc77dff, 0xffffff];

export function buildFireworks(scene: THREE.Scene): Fireworks {
  const positions = new Float32Array(MAX * 3);
  const colors = new Float32Array(MAX * 3);
  const velocities = new Float32Array(MAX * 3);
  const life = new Float32Array(MAX); // seconds left; <= 0 means free
  const base = new Float32Array(MAX * 3); // original color, faded by life
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.45,
      map: glowTexture(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  points.frustumCulled = false;
  scene.add(points);

  // Rockets on their way up.
  const rockets: { p: THREE.Vector3; v: THREE.Vector3; fuse: number; color: THREE.Color; trail: number }[] = [];
  const queue: { at: number; origin: THREE.Vector3 }[] = [];
  let clock = 0;
  let cursor = 0;
  const color = new THREE.Color();

  const spawn = (x: number, y: number, z: number, vx: number, vy: number, vz: number, c: THREE.Color, l: number) => {
    for (let n = 0; n < MAX; n++) {
      const i = (cursor + n) % MAX;
      if (life[i] > 0) continue;
      cursor = (i + 1) % MAX;
      positions.set([x, y, z], i * 3);
      velocities.set([vx, vy, vz], i * 3);
      base.set([c.r, c.g, c.b], i * 3);
      life[i] = l;
      return;
    }
  };

  const burst = (p: THREE.Vector3, c: THREE.Color) => {
    const second = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
    const n = 140;
    for (let k = 0; k < n; k++) {
      // Even-ish directions on a sphere.
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const speed = 5 + Math.random() * 2.5;
      const cc = k % 3 === 0 ? second : c;
      spawn(p.x, p.y, p.z, r * Math.cos(th) * speed, u * speed, r * Math.sin(th) * speed, cc.clone().multiplyScalar(2.6), 1.6 + Math.random() * 0.8);
    }
  };

  return {
    show(origin, count = 8) {
      for (let k = 0; k < count; k++) queue.push({ at: clock + k * 0.45 + Math.random() * 0.25, origin: origin.clone() });
    },
    update(dt) {
      clock += dt;
      for (let k = queue.length - 1; k >= 0; k--) {
        if (queue[k].at > clock) continue;
        const o = queue.splice(k, 1)[0].origin;
        rockets.push({
          p: o.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5)),
          v: new THREE.Vector3((Math.random() - 0.5) * 3, 9.5 + Math.random() * 2.5, -3 - Math.random() * 2.5),
          fuse: 0.85 + Math.random() * 0.3,
          color: new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]),
          trail: 0,
        });
      }
      for (let k = rockets.length - 1; k >= 0; k--) {
        const r = rockets[k];
        r.p.addScaledVector(r.v, dt);
        r.v.y -= 5 * dt;
        r.fuse -= dt;
        r.trail += dt;
        if (r.trail > 0.02) {
          r.trail = 0;
          spawn(r.p.x, r.p.y, r.p.z, 0, -0.5, 0, color.setHex(0xffe0a8).multiplyScalar(2), 0.35);
        }
        if (r.fuse <= 0) {
          burst(r.p, r.color);
          rockets.splice(k, 1);
        }
      }
      for (let i = 0; i < MAX; i++) {
        if (life[i] <= 0) {
          colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = 0;
          continue;
        }
        life[i] -= dt;
        velocities[i * 3 + 1] -= 3.2 * dt; // gravity
        velocities[i * 3] *= 0.985;
        velocities[i * 3 + 2] *= 0.985;
        positions[i * 3] += velocities[i * 3] * dt;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
        const f = Math.max(0, Math.min(1, life[i] / 1.2));
        colors[i * 3] = base[i * 3] * f;
        colors[i * 3 + 1] = base[i * 3 + 1] * f;
        colors[i * 3 + 2] = base[i * 3 + 2] * f;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    },
  };
}
