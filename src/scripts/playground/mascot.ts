import * as THREE from 'three';

/**
 * Mochi: a round, chibi Shiba Inu puppy with a red collar and a little bell.
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

  const fur = toon(0xe9a15a); // shiba orange
  const furDark = toon(0xd08840);
  const cream = toon(0xfff1dc); // white "urajiro" markings
  const black = new THREE.MeshBasicMaterial({ color: 0x1b1418 });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pink = toon(0xf48fa6);

  const group = new THREE.Group();
  const body = new THREE.Group(); // bounces while walking
  group.add(body);

  // Round little body with a cream chest and belly.
  const torso = sphere(0.46, fur);
  torso.scale.set(1, 0.9, 1.15);
  torso.position.set(0, 0.52, -0.05);
  const chest = sphere(0.36, cream);
  chest.scale.set(0.85, 0.95, 0.6);
  chest.position.set(0, 0.55, 0.28);
  body.add(torso, chest);

  // Big head (chibi proportions).
  const head = new THREE.Group();
  head.position.set(0, 1.12, 0.22);
  body.add(head);
  const skull = sphere(0.46, fur, 32);
  skull.scale.set(1.05, 0.95, 0.95);
  const cheeks = sphere(0.34, cream, 28);
  cheeks.scale.set(1.12, 0.7, 0.75);
  cheeks.position.set(0, -0.16, 0.18);
  const muzzle = sphere(0.18, cream);
  muzzle.scale.set(1.15, 0.8, 0.95);
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
    const eye = sphere(0.068, black, 16);
    eye.scale.set(0.9, 1.15, 0.6);
    eye.position.set(s * 0.17, 0.06, 0.4);
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
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 4), furDark);
    outer.scale.set(1, 1, 0.45);
    outer.rotation.y = Math.PI / 4;
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 4), cream);
    inner.scale.set(1, 1, 0.3);
    inner.rotation.y = Math.PI / 4;
    inner.position.set(0, -0.02, 0.03);
    ear.add(outer, inner);
    ear.position.set(s * 0.26, 0.4, 0.02);
    ear.rotation.z = s * -0.28;
    head.add(ear);
    ears.push(ear);
  }

  // Red collar with a gold bell.
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.045, 8, 24), toon(0xd62839));
  collar.rotation.x = Math.PI / 2 - 0.25;
  collar.position.set(0, 0.86, 0.17);
  const bell = sphere(0.06, toon(0xffc93c, { emissive: new THREE.Color(0xffb703), emissiveIntensity: 0.5 }), 14);
  bell.position.set(0, 0.76, 0.46);
  body.add(collar, bell);

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
  const curl = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.075, 10, 20, Math.PI * 1.6), fur);
  curl.rotation.y = Math.PI / 2;
  const tip = sphere(0.075, cream, 12);
  tip.position.set(0, 0.05, 0.14);
  tail.add(curl, tip);
  tail.position.set(0, 0.85, -0.52);
  body.add(tail);

  // A soft warm light so Mochi stays visible at night.
  const glow = new THREE.PointLight(0xffd6a0, 1.1, 2.6, 2);
  glow.position.set(0, 1.6, 0.6);
  group.add(glow);

  let walkPhase = 0;
  return {
    group,
    update(t, dt, speed) {
      const moving = speed > 0.05;
      walkPhase += dt * (moving ? 11 : 0);
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
