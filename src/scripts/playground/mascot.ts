import * as THREE from 'three';

/**
 * Mochi: a round, fluffy chinchilla (龍貓 = chinchilla) carrying a little lantern.
 * Built facing +z; the caller turns it toward the walking direction.
 */
export interface Mascot {
  group: THREE.Group;
  update(t: number, dt: number, speed: number): void;
}

export function buildMascot(gradientMap: THREE.Texture): Mascot {
  const toon = (color: THREE.ColorRepresentation, extra: THREE.MeshToonMaterialParameters = {}) =>
    new THREE.MeshToonMaterial({ color, gradientMap, ...extra });
  const sphere = (r: number, mat: THREE.Material, seg = 24) => new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat);

  const fur = toon(0xa7abba);
  const furDark = toon(0x8c90a1);
  const cream = toon(0xf4ead8);
  const pink = toon(0xf5a3b5);
  const black = new THREE.MeshBasicMaterial({ color: 0x1b1622 });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const group = new THREE.Group();
  const body = new THREE.Group(); // bounces while walking
  group.add(body);

  // Round body + head in one soft blob, like a chinchilla loaf.
  const torso = sphere(0.55, fur, 32);
  torso.scale.set(1, 0.95, 0.92);
  torso.position.y = 0.6;
  const head = sphere(0.43, fur, 32);
  head.position.set(0, 1.12, 0.08);
  const belly = sphere(0.42, cream);
  belly.scale.set(0.82, 0.88, 0.45);
  belly.position.set(0, 0.55, 0.36);
  const muzzle = sphere(0.18, cream);
  muzzle.scale.set(1.25, 0.8, 0.7);
  muzzle.position.set(0, 1.0, 0.42);
  body.add(torso, head, belly, muzzle);

  // Big round ears with pink insides.
  const ears: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    const outer = sphere(0.24, furDark);
    outer.scale.set(1, 1.05, 0.32);
    const inner = sphere(0.17, pink);
    inner.scale.set(1, 1.05, 0.2);
    inner.position.z = 0.05;
    ear.add(outer, inner);
    ear.position.set(s * 0.3, 1.52, 0.02);
    ear.rotation.z = s * -0.35;
    body.add(ear);
    ears.push(ear);
  }

  // Shiny eyes, nose, blush, whiskers.
  for (const s of [-1, 1]) {
    const eye = sphere(0.075, black, 16);
    eye.scale.set(0.9, 1.1, 0.6);
    eye.position.set(s * 0.17, 1.17, 0.42);
    const shine = sphere(0.026, white, 8);
    shine.position.set(s * 0.17 + 0.025, 1.21, 0.47);
    const blush = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), new THREE.MeshBasicMaterial({ color: 0xff9eb5, transparent: true, opacity: 0.75 }));
    blush.position.set(s * 0.29, 1.02, 0.4);
    blush.rotation.y = s * 0.55;
    body.add(eye, shine, blush);
    for (let k = 0; k < 3; k++) {
      const whisker = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.32, 4), black);
      whisker.rotation.z = Math.PI / 2 + s * (k - 1) * 0.18;
      whisker.position.set(s * 0.27, 1.0 + (1 - k) * 0.03, 0.47);
      body.add(whisker);
    }
  }
  const nose = sphere(0.04, pink, 12);
  nose.scale.set(1.3, 0.9, 1);
  nose.position.set(0, 1.06, 0.55);
  body.add(nose);

  // Little feet and a fluffy tail.
  const feet: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    const foot = sphere(0.13, cream, 16);
    foot.scale.set(1, 0.55, 1.4);
    foot.position.set(s * 0.22, 0.06, 0.18);
    group.add(foot);
    feet.push(foot);
  }
  const tail = sphere(0.22, furDark);
  tail.scale.set(0.8, 0.8, 1.2);
  tail.position.set(0, 0.45, -0.55);
  body.add(tail);

  // A tiny lantern on a stick, held out to the side.
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.75, 6), toon(0x6b4329));
  stick.rotation.z = -0.9;
  stick.position.set(0.62, 0.95, 0.18);
  const lanternGroup = new THREE.Group();
  lanternGroup.position.set(0.92, 1.12, 0.18);
  const glowColor = new THREE.Color(0xffc37a);
  const paper = sphere(0.11, toon(0xffb35c, { emissive: glowColor, emissiveIntensity: 1.8 }), 16);
  paper.scale.set(1, 1.25, 1);
  paper.position.y = -0.2;
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 4), black);
  string.position.y = -0.05;
  lanternGroup.add(paper, string);
  const glow = new THREE.PointLight(0xffb870, 1.2, 2.2, 2);
  glow.position.y = -0.2;
  lanternGroup.add(glow);
  body.add(stick, lanternGroup);

  let walkPhase = 0;
  return {
    group,
    update(t, dt, speed) {
      const moving = speed > 0.05;
      walkPhase += dt * (moving ? 9 : 0);
      const hop = moving ? Math.abs(Math.sin(walkPhase)) * 0.12 : 0;
      const breathe = 1 + Math.sin(t * 2.2) * 0.015;
      body.position.y = hop;
      body.scale.set(1 / Math.sqrt(breathe), breathe, 1 / Math.sqrt(breathe));
      body.rotation.z = moving ? Math.sin(walkPhase) * 0.06 : Math.sin(t * 0.8) * 0.02;
      feet.forEach((f, i) => (f.position.z = 0.18 + (moving ? Math.sin(walkPhase + i * Math.PI) * 0.12 : 0)));
      ears.forEach((e, i) => (e.rotation.x = Math.sin(t * 3 + i * 1.3) * 0.08 + (moving ? -0.15 : 0)));
      lanternGroup.rotation.z = Math.sin(t * 2.5) * 0.15 - (moving ? 0.2 : 0);
      tail.rotation.y = Math.sin(t * 4) * 0.2;
    },
  };
}
