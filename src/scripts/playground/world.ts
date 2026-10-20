import * as THREE from 'three';
import { cobbleTexture, glowTexture } from './textures';

/** Street layout shared by the world, the stalls, and movement. */
export const STREET = { halfWidth: 2.5, start: 8, end: -40 } as const;

export interface World {
  update(t: number, dt: number): void;
}

const toon = (color: THREE.ColorRepresentation, gradientMap: THREE.Texture, extra: THREE.MeshToonMaterialParameters = {}) =>
  new THREE.MeshToonMaterial({ color, gradientMap, ...extra });

export function buildWorld(scene: THREE.Scene, gradientMap: THREE.Texture): World {
  const updaters: ((t: number, dt: number) => void)[] = [];

  // ── Sky: dusk gradient dome, stars, moon ──────────────────────────────────
  scene.fog = new THREE.FogExp2(0x1b2350, 0.02);
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(120, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color(0x0a0d2e) },
        middle: { value: new THREE.Color(0x26306b) },
        horizon: { value: new THREE.Color(0x8a5f8f) },
      },
      vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 middle; uniform vec3 horizon; varying vec3 vPos;
        void main(){ float h = normalize(vPos).y;
          vec3 c = mix(horizon, middle, smoothstep(-0.02, 0.22, h));
          c = mix(c, top, smoothstep(0.22, 0.75, h));
          gl_FragColor = vec4(c, 1.0); }`,
    }),
  );
  scene.add(sky);

  const starGeo = new THREE.BufferGeometry();
  const starPos: number[] = [];
  for (let i = 0; i < 700; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(0.15 + Math.random() * 0.85);
    starPos.push(100 * Math.sin(phi) * Math.cos(theta), 100 * Math.cos(phi), 100 * Math.sin(phi) * Math.sin(theta));
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xfff6dd, size: 0.55, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.85 }),
  );
  scene.add(stars);

  const moon = new THREE.Mesh(new THREE.CircleGeometry(4.2, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff1c4).multiplyScalar(1.6), fog: false }));
  moon.position.set(-24, 30, -80);
  moon.lookAt(0, 0, 0);
  scene.add(moon);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,236,190,0.55)'), fog: false, depthWrite: false, transparent: true }));
  halo.scale.set(26, 26, 1);
  halo.position.copy(moon.position).multiplyScalar(0.99);
  scene.add(halo);

  // Soft clouds drifting across the moon.
  const cloudTex = glowTexture('rgba(190,170,220,0.35)');
  const clouds: THREE.Sprite[] = [];
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, depthWrite: false, transparent: true, opacity: 0.6 }));
    c.scale.set(28 + Math.random() * 18, 7 + Math.random() * 4, 1);
    c.position.set(-60 + i * 22, 20 + Math.random() * 12, -85);
    scene.add(c);
    clouds.push(c);
  }
  updaters.push((t) => clouds.forEach((c, i) => (c.position.x = -70 + (((i * 23 + t * 0.6) % 140) + 140) % 140)));

  // ── Lights ─────────────────────────────────────────────────────────────────
  scene.add(new THREE.HemisphereLight(0x7d86d8, 0x2b2238, 1.15));
  const moonLight = new THREE.DirectionalLight(0xb9c4ff, 1.2);
  moonLight.position.set(-8, 14, -6);
  scene.add(moonLight);

  // ── Ground, lane, hills ──────────────────────────────────────────────────
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), toon(0x2c4a45, gradientMap));
  ground.rotation.x = -Math.PI / 2;
  ground.name = 'ground';
  scene.add(ground);

  const laneTex = cobbleTexture();
  const laneLength = STREET.start - STREET.end + 6;
  laneTex.repeat.set(2.5, laneLength / 2.2);
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(STREET.halfWidth * 2 + 1.6, laneLength), toon(0xffffff, gradientMap, { map: laneTex }));
  lane.rotation.x = -Math.PI / 2;
  lane.position.set(0, 0.01, (STREET.start + STREET.end) / 2);
  lane.name = 'ground';
  scene.add(lane);

  const hillMat = toon(0x22383f, gradientMap);
  for (const [x, z, r] of [[-30, -60, 22], [10, -70, 28], [40, -55, 20], [-55, -30, 18], [55, -20, 16]]) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12), hillMat);
    hill.scale.y = 0.45;
    hill.position.set(x, -2, z);
    scene.add(hill);
  }

  // ── Round, puffy trees (instanced) ─────────────────────────────────────────
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.22, 1.4, 8);
  const puffGeo = new THREE.IcosahedronGeometry(1, 1);
  const trunkMat = toon(0x4a3426, gradientMap);
  const leafColors = [0x2f6b4f, 0x3c7d55, 0x2a5a4c, 0x4a8a5c];
  const treeSpots: [number, number, number][] = [];
  for (let z = STREET.start + 2; z > STREET.end - 4; z -= 3.2) {
    for (const side of [-1, 1]) {
      const x = side * (7.2 + Math.random() * 5);
      treeSpots.push([x, z + Math.random() * 1.6, 0.8 + Math.random() * 0.6]);
    }
  }
  // A back row beyond the fireworks plaza, leaving the end of the lane open.
  for (let i = 0; i < 14; i++) {
    const x = -20 + i * 3 + Math.random() * 2;
    if (Math.abs(x) > 4.5) treeSpots.push([x, STREET.end - 8 - Math.random() * 6, 1 + Math.random() * 0.8]);
  }
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeSpots.length);
  const puffs = new THREE.InstancedMesh(puffGeo, toon(0xffffff, gradientMap), treeSpots.length * 3);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const col = new THREE.Color();
  treeSpots.forEach(([x, z, s], i) => {
    m.compose(new THREE.Vector3(x, 0.7 * s, z), q, new THREE.Vector3(s, s, s));
    trunks.setMatrixAt(i, m);
    for (let k = 0; k < 3; k++) {
      const ps = s * (0.95 - k * 0.18);
      m.compose(new THREE.Vector3(x + (k - 1) * 0.35 * s, (1.7 + k * 0.75) * s, z + (k % 2 ? 0.2 : -0.2) * s), q, new THREE.Vector3(ps * 1.15, ps, ps * 1.1));
      puffs.setMatrixAt(i * 3 + k, m);
      puffs.setColorAt(i * 3 + k, col.setHex(leafColors[(i + k) % leafColors.length]));
    }
  });
  scene.add(trunks, puffs);

  // ── Spirit tree with lanterns at the end of the lane ─────────────────────
  const bigTree = new THREE.Group();
  bigTree.position.set(0, 0, STREET.end - 3.5);
  const bigTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.2, 4.5, 12), trunkMat);
  bigTrunk.position.y = 2.25;
  bigTree.add(bigTrunk);
  const canopyMat = toon(0x3a7a58, gradientMap);
  for (const [x, y, z, r] of [[0, 6, 0, 3.2], [-2.4, 5.2, 0.4, 2.2], [2.5, 5.4, -0.2, 2.3], [0.6, 7.6, -0.4, 2.2], [-1.2, 7.2, 0.8, 1.8]]) {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), canopyMat);
    puff.position.set(x, y, z);
    bigTree.add(puff);
  }
  scene.add(bigTree);

  // ── Lantern strings across the lane ───────────────────────────────────────
  const poleMat = toon(0x5a3c28, gradientMap);
  const bulbPositions: THREE.Vector3[] = [];
  const lanternSpots: THREE.Vector3[] = [];
  const poleZs: number[] = [];
  for (let z = STREET.start - 1; z > STREET.end; z -= 5.5) poleZs.push(z);
  for (const z of poleZs) {
    for (const side of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 5.4, 8), poleMat);
      pole.position.set(side * (STREET.halfWidth + 0.55), 2.7, z);
      scene.add(pole);
    }
    // Sagging string across, plus one along each side to the next pole.
    const across = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-(STREET.halfWidth + 0.55), 5.3, z),
      new THREE.Vector3(0, 4.7, z),
      new THREE.Vector3(STREET.halfWidth + 0.55, 5.3, z),
    ]);
    for (let i = 0; i <= 10; i++) bulbPositions.push(across.getPoint(i / 10));
    lanternSpots.push(across.getPoint(0.3), across.getPoint(0.7));
    const wire = new THREE.Mesh(new THREE.TubeGeometry(across, 20, 0.012, 4), new THREE.MeshBasicMaterial({ color: 0x1a1420 }));
    scene.add(wire);
  }
  for (let i = 0; i < poleZs.length - 1; i++) {
    for (const side of [-1, 1]) {
      const x = side * (STREET.halfWidth + 0.55);
      const along = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, 5.3, poleZs[i]),
        new THREE.Vector3(x, 4.85, (poleZs[i] + poleZs[i + 1]) / 2),
        new THREE.Vector3(x, 5.3, poleZs[i + 1]),
      ]);
      for (let k = 1; k < 8; k++) bulbPositions.push(along.getPoint(k / 8));
    }
  }
  const bulbColors = [0xffd58a, 0xffb4a2, 0xfff0b8, 0xb8e0ff];
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), bulbPositions.length);
  bulbPositions.forEach((p, i) => {
    m.compose(p, q, new THREE.Vector3(1, 1, 1));
    bulbs.setMatrixAt(i, m);
    bulbs.setColorAt(i, col.setHex(bulbColors[i % bulbColors.length]).multiplyScalar(3.2));
  });
  scene.add(bulbs);

  // Paper lanterns (red/orange) hanging from the strings, gently swaying.
  const lanternGeo = new THREE.SphereGeometry(0.28, 16, 12);
  const lanternMats = [0xff6f59, 0xffa64d, 0xff8a7a].map(
    (c) => new THREE.MeshToonMaterial({ color: c, gradientMap, emissive: new THREE.Color(c), emissiveIntensity: 1.6 }),
  );
  const capMat = new THREE.MeshBasicMaterial({ color: 0x2a1a14 });
  const swayers: THREE.Group[] = [];
  lanternSpots.forEach((p, i) => {
    const g = new THREE.Group();
    g.position.copy(p);
    const body = new THREE.Mesh(lanternGeo, lanternMats[i % lanternMats.length]);
    body.scale.set(1, 1.25, 1);
    body.position.y = -0.45;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 10), capMat);
    cap.position.y = -0.1;
    const cap2 = cap.clone();
    cap2.position.y = -0.8;
    g.add(body, cap, cap2);
    scene.add(g);
    swayers.push(g);
  });
  updaters.push((t) => swayers.forEach((g, i) => (g.rotation.z = Math.sin(t * 1.3 + i) * 0.08)));

  // ── Fireflies ──────────────────────────────────────────────────────────────
  const flyCount = 70;
  const flyBase: THREE.Vector3[] = [];
  const flyGeo = new THREE.BufferGeometry();
  const flyPos = new Float32Array(flyCount * 3);
  for (let i = 0; i < flyCount; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    flyBase.push(new THREE.Vector3(side * (3 + Math.random() * 9), 0.6 + Math.random() * 2.4, STREET.start - Math.random() * (STREET.start - STREET.end + 6)));
  }
  flyGeo.setAttribute('position', new THREE.BufferAttribute(flyPos, 3));
  const flies = new THREE.Points(
    flyGeo,
    new THREE.PointsMaterial({
      map: glowTexture('rgba(220,255,160,1)'),
      color: new THREE.Color(0xd8ff9a).multiplyScalar(2.2),
      size: 0.32,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(flies);
  updaters.push((t) => {
    for (let i = 0; i < flyCount; i++) {
      const b = flyBase[i];
      flyPos[i * 3] = b.x + Math.sin(t * 0.5 + i) * 0.6;
      flyPos[i * 3 + 1] = b.y + Math.sin(t * 0.9 + i * 1.7) * 0.35;
      flyPos[i * 3 + 2] = b.z + Math.cos(t * 0.4 + i * 0.6) * 0.6;
    }
    flyGeo.attributes.position.needsUpdate = true;
  });

  return { update: (t, dt) => updaters.forEach((u) => u(t, dt)) };
}
