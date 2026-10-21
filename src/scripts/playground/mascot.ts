import * as THREE from 'three';

/**
 * Joy: a fluffy, chibi Akita Inu girl: red-fawn coat, big white mask, small ears tipped
 * forward, a thick curled tail, a pink collar with a heart tag, and a bow.
 * Built facing +z; the engine turns it toward the walking direction.
 */
export interface Mascot {
  group: THREE.Group;
  update(t: number, dt: number, speed: number): void;
}

export function buildMascot(gradientMap: THREE.Texture): Mascot {
  const toon = (color: THREE.ColorRepresentation, extra: THREE.MeshToonMaterialParameters = {}) =>
    new THREE.MeshToonMaterial({ color, gradientMap, ...extra });
  const sphere = (r: number, mat: THREE.Material, seg = 28) => new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat);

  const fur = toon(0xd9773a); // Akita red-fawn
  const furDark = toon(0xb85e2a);
  const cream = toon(0xfff5e8); // white "urajiro" markings
  const black = new THREE.MeshBasicMaterial({ color: 0x1b1418 });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pink = toon(0xf48fa6);

  const group = new THREE.Group();
  const body = new THREE.Group(); // bounces while walking
  group.add(body);

  // Round little body with a cream chest and belly.
  const torso = sphere(0.5, fur);
  torso.scale.set(1.08, 0.92, 1.18);
  torso.position.set(0, 0.54, -0.05);
  const chest = sphere(0.4, cream);
  chest.scale.set(0.9, 0.95, 0.6);
  chest.position.set(0, 0.56, 0.3);
  // Fluffy ruff around the neck.
  const ruff = sphere(0.42, cream, 24);
  ruff.scale.set(1.12, 0.55, 0.9);
  ruff.position.set(0, 0.86, 0.14);
  body.add(torso, chest, ruff);

  // Big head (chibi proportions).
  const head = new THREE.Group();
  head.position.set(0, 1.12, 0.22);
  body.add(head);
  const skull = sphere(0.48, fur, 32);
  skull.scale.set(1.12, 0.94, 0.95);
  const cheeks = sphere(0.37, cream, 28);
  cheeks.scale.set(1.2, 0.74, 0.78);
  cheeks.position.set(0, -0.15, 0.18);
  const muzzle = sphere(0.19, cream);
  muzzle.scale.set(1.2, 0.82, 0.95);
  muzzle.position.set(0, -0.1, 0.4);
  const nose = sphere(0.055, black, 14);
  nose.scale.set(1.3, 0.9, 1);
  nose.position.set(0, -0.03, 0.56);
  head.add(skull, cheeks, muzzle, nose);
  // Smile and a little tongue.
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16, Math.PI), black);
  smile.position.set(0, -0.13, 0.555);
  smile.rotation.set(0, 0, Math.PI);
  const tongue = sphere(0.045, pink, 12);
  tongue.scale.set(1, 0.6, 0.7);
  tongue.position.set(0, -0.19, 0.53);
  head.add(smile, tongue);

  // Shiny eyes with cream "eyebrow" dots above.
  for (const s of [-1, 1]) {
    const eye = sphere(0.062, black, 16);
    eye.scale.set(1.05, 1.0, 0.6);
    eye.position.set(s * 0.17, 0.06, 0.41);
    // Eyelashes: she's a girl.
    const lash = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.01), black);
    lash.position.set(s * 0.225, 0.1, 0.42);
    lash.rotation.z = s * 0.5;
    head.add(lash);
    const shine = sphere(0.024, white, 8);
    shine.position.set(s * 0.17 + 0.022, 0.1, 0.44);
    const brow = sphere(0.04, cream, 10);
    brow.scale.set(1.3, 0.8, 0.5);
    brow.position.set(s * 0.16, 0.2, 0.39);
    const blush = new THREE.Mesh(new THREE.CircleGeometry(0.06, 18), new THREE.MeshBasicMaterial({ color: 0xff9eb5, transparent: true, opacity: 0.7 }));
    blush.position.set(s * 0.29, -0.08, 0.36);
    blush.rotation.y = s * 0.6;
    head.add(eye, shine, brow, blush);
  }

  // Pointy ears with cream insides.
  const ears: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.24, 4), furDark);
    outer.scale.set(1, 1, 0.6);
    outer.rotation.y = Math.PI / 4;
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 4), cream);
    inner.scale.set(1, 1, 0.3);
    inner.rotation.y = Math.PI / 4;
    inner.position.set(0, -0.02, 0.03);
    ear.add(outer, inner);
    ear.position.set(s * 0.29, 0.38, 0.06);
    ear.rotation.set(0.35, 0, s * -0.3);
    head.add(ear);
    ears.push(ear);
  }

  // Red collar with a gold bell.
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.045, 8, 24), toon(0xff7aa8));
  collar.rotation.x = Math.PI / 2 - 0.25;
  collar.position.set(0, 0.84, 0.19);
  const tag = new THREE.Group();
  const heartMat = toon(0xffc93c, { emissive: new THREE.Color(0xffb703), emissiveIntensity: 0.5 });
  for (const s of [-1, 1]) {
    const lobe = sphere(0.04, heartMat, 12);
    lobe.position.set(s * 0.03, 0.02, 0);
    tag.add(lobe);
  }
  const point = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.08, 4), heartMat);
  point.rotation.z = Math.PI;
  point.position.y = -0.03;
  tag.add(point);
  tag.position.set(0, 0.74, 0.5);
  body.add(collar, tag);
  // Pink bow by her left ear.
  const bow = new THREE.Group();
  const bowMat = toon(0xff5c93);
  for (const s of [-1, 1]) {
    const loop = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.13, 10), bowMat);
    loop.rotation.z = s * Math.PI / 2;
    loop.position.x = s * 0.065;
    bow.add(loop);
  }
  bow.add(sphere(0.035, bowMat, 10));
  bow.position.set(0.3, 0.32, 0.22);
  bow.rotation.set(0.2, 0.4, -0.35);
  head.add(bow);

  // Stubby legs with cream paws.
  const legs: THREE.Group[] = [];
  for (const [x, z] of [[-0.2, 0.25], [0.2, 0.25], [-0.2, -0.3], [0.2, -0.3]]) {
    const leg = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.22, 10), fur);
    upper.position.y = -0.08;
    const paw = sphere(0.11, cream, 14);
    paw.scale.set(1, 0.65, 1.2);
    paw.position.set(0, -0.2, 0.03);
    leg.add(upper, paw);
    leg.position.set(x, 0.25, z);
    group.add(leg);
    legs.push(leg);
  }

  // Curled tail on the back.
  const tail = new THREE.Group();
  const curl = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.1, 12, 22, Math.PI * 1.75), fur);
  curl.rotation.y = Math.PI / 2;
  const under = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.06, 10, 22, Math.PI * 1.2), cream);
  under.rotation.y = Math.PI / 2;
  under.position.x = 0.05;
  const tip = sphere(0.1, cream, 12);
  tip.position.set(0, 0.06, 0.17);
  tail.add(curl, under, tip);
  tail.position.set(0, 0.92, -0.5);
  body.add(tail);

  // A soft warm light so Joy stays visible at night.
  const glow = new THREE.PointLight(0xffd6a0, 1.1, 2.6, 2);
  glow.position.set(0, 1.6, 0.6);
  group.add(glow);

  let walkPhase = 0;
  return {
    group,
    update(t, dt, speed) {
      const moving = speed > 0.05;
      walkPhase += dt * (moving ? 11 * Math.max(1, speed / 3.6) : 0); // faster trot when running
      body.position.y = moving ? Math.abs(Math.sin(walkPhase)) * 0.08 : Math.sin(t * 2.2) * 0.01;
      body.rotation.z = moving ? Math.sin(walkPhase) * 0.05 : 0;
      legs.forEach((leg, i) => {
        const phase = walkPhase + (i === 0 || i === 3 ? 0 : Math.PI);
        leg.rotation.x = moving ? Math.sin(phase) * 0.6 : 0;
      });
      // Happy tail wag, faster while walking; a little head tilt and ear twitch when idle.
      tail.rotation.z = Math.sin(t * (moving ? 18 : 8)) * 0.35;
      head.rotation.z = moving ? 0 : Math.sin(t * 0.9) * 0.08;
      head.rotation.x = moving ? 0.05 : Math.sin(t * 0.6) * 0.04;
      ears.forEach((e, i) => (e.rotation.x = Math.sin(t * 3 + i * 1.7) * (moving ? 0.12 : 0.05)));
      tongue.position.y = -0.19 + (moving ? Math.sin(walkPhase * 2) * 0.01 : 0);
    },
  };
}
