import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { toonGradient } from './textures';
import { buildWorld, STREET } from './world';
import { buildStall, type Stall, type StallDef, type StallKind } from './stall';
import { buildMascot } from './mascot';

export interface MarketOptions {
  stalls: StallDef[];
  /** Mochi is close to a stall (or no longer close to any). */
  onNear(id: StallKind | null): void;
  /** Visit a stall: show its panel. */
  onOpen(id: StallKind): void;
}

export interface Market {
  /** Walk to a stall, then open it. */
  visit(id: StallKind): void;
  /** Stop reacting to keys/clicks (e.g. while a panel is open). */
  setPaused(paused: boolean): void;
  dispose(): void;
}

const SPEED = 3.4;
const NEAR_DISTANCE = 1.6;

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function startMarket(host: HTMLElement, options: MarketOptions): Market {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.touchAction = 'none';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
  const gradientMap = toonGradient();

  const world = buildWorld(scene, gradientMap);
  const stalls: Stall[] = options.stalls.map((def) => buildStall(def, gradientMap));
  stalls.forEach((s) => scene.add(s.group));
  const hitTargets = stalls.flatMap((s) => s.hits);
  const groundTargets: THREE.Object3D[] = [];
  scene.traverse((o) => o.name === 'ground' && groundTargets.push(o));

  const mochi = buildMascot(gradientMap);
  mochi.group.position.set(0, 0, STREET.start - 1);
  mochi.group.rotation.y = Math.PI; // face up the lane (-z)
  scene.add(mochi.group);

  // Post-processing: a soft glow on lanterns, bulbs, and the moon.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.45, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ── Sizing ─────────────────────────────────────────────────────────────────
  let narrow = false;
  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = `${w}px`;
    renderer.domElement.style.height = `${h}px`;
    composer.setSize(w, h);
    camera.aspect = w / h;
    narrow = camera.aspect < 0.9;
    camera.fov = narrow ? 62 : 50;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  // ── Input ──────────────────────────────────────────────────────────────────
  const keys = new Set<string>();
  let target: THREE.Vector3 | null = null;
  let targetStall: StallKind | null = null;
  let nearId: StallKind | null = null;
  let paused = false;

  const clampToStreet = (v: THREE.Vector3) => {
    v.x = THREE.MathUtils.clamp(v.x, -STREET.halfWidth + 0.3, STREET.halfWidth - 0.3);
    v.z = THREE.MathUtils.clamp(v.z, STREET.end + 1.5, STREET.start - 0.5);
    v.y = 0;
    return v;
  };

  const MOVE_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
  const onKeyDown = (e: KeyboardEvent) => {
    if (paused || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as HTMLElement)?.closest?.('input, textarea, select, [contenteditable]')) return;
    const k = e.key.toLowerCase();
    if (MOVE_KEYS.includes(k)) {
      // Only steer with arrow keys when the market has focus, so page scrolling still works elsewhere.
      if (k.startsWith('arrow') && !host.contains(document.activeElement) && document.activeElement !== document.body) return;
      keys.add(k);
      target = null;
      targetStall = null;
      e.preventDefault();
    } else if ((k === 'e' || k === 'enter') && nearId && (host.contains(document.activeElement) || document.activeElement === document.body)) {
      e.preventDefault();
      options.onOpen(nearId);
    }
  };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', () => keys.clear());

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downAt: { x: number; y: number } | null = null;
  const onPointerDown = (e: PointerEvent) => (downAt = { x: e.clientX, y: e.clientY });
  const onPointerUp = (e: PointerEvent) => {
    if (paused || !downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const stallHit = raycaster.intersectObjects(hitTargets, false)[0];
    if (stallHit) return visit(stallHit.object.userData.stallId as StallKind);
    const groundHit = raycaster.intersectObjects(groundTargets, false)[0];
    if (groundHit) {
      target = clampToStreet(groundHit.point.clone());
      targetStall = null;
    }
  };
  const onPointerMove = (e: PointerEvent) => {
    if (paused) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    renderer.domElement.style.cursor = raycaster.intersectObjects(hitTargets, false).length ? 'pointer' : 'default';
  };
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointermove', onPointerMove);

  function visit(id: StallKind) {
    const stall = stalls.find((s) => s.id === id);
    if (!stall) return;
    target = stall.front.clone();
    targetStall = id;
  }

  // ── Loop ───────────────────────────────────────────────────────────────────
  const timer = new THREE.Timer();
  timer.connect(document); // pauses cleanly while the tab is hidden
  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const move = new THREE.Vector3();
  let firstFrame = true;
  let raf = 0;
  let running = true;

  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();
    const pos = mochi.group.position;

    // Movement: keys steer directly; otherwise walk toward the clicked target.
    move.set(0, 0, 0);
    if (!paused) {
      if (keys.has('arrowup') || keys.has('w')) move.z -= 1;
      if (keys.has('arrowdown') || keys.has('s')) move.z += 1;
      if (keys.has('arrowleft') || keys.has('a')) move.x -= 1;
      if (keys.has('arrowright') || keys.has('d')) move.x += 1;
    }
    if (move.lengthSq() === 0 && target) {
      move.subVectors(target, pos).setY(0);
      if (move.length() < 0.08) {
        move.set(0, 0, 0);
        target = null;
        if (targetStall) {
          const id = targetStall;
          targetStall = null;
          // Turn to face the stall, then open it.
          const stall = stalls.find((s) => s.id === id)!;
          mochi.group.rotation.y = stall.group.position.x < 0 ? -Math.PI / 2 : Math.PI / 2;
          options.onOpen(id);
        }
      }
    }
    let speed = 0;
    if (move.lengthSq() > 0) {
      const step = Math.min(SPEED * dt, move.length());
      move.normalize();
      pos.addScaledVector(move, step);
      clampToStreet(pos);
      speed = step / dt;
      // Face the walking direction (smoothly).
      const want = Math.atan2(move.x, move.z);
      let diff = want - mochi.group.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      mochi.group.rotation.y += diff * Math.min(1, dt * 10);
    }
    mochi.update(t, dt, speed);

    // Nearest stall.
    let best: StallKind | null = null;
    let bestDist = NEAR_DISTANCE;
    for (const s of stalls) {
      const d = Math.hypot(s.front.x - pos.x, s.front.z - pos.z);
      if (d < bestDist) {
        bestDist = d;
        best = s.id;
      }
    }
    if (best !== nearId) {
      nearId = best;
      stalls.forEach((s) => s.setNear(s.id === best));
      options.onNear(best);
    }
    stalls.forEach((s) => s.update(t));
    world.update(t, dt);

    // Camera follows from behind and above.
    const back = narrow ? 8.6 : 6.6;
    const up = narrow ? 3.9 : 3.1;
    camPos.set(pos.x * 0.6, up, pos.z + back);
    const k = firstFrame ? 1 : 1 - Math.exp(-dt * 3);
    camera.position.lerp(camPos, k);
    lookAt.lerp(new THREE.Vector3(pos.x * 0.8, 1.5, pos.z - 3.5), k);
    camera.lookAt(lookAt);
    firstFrame = false;

    composer.render(dt);
  };
  frame();

  const onVisibility = () => {
    running = !document.hidden;
  };
  document.addEventListener('visibilitychange', onVisibility);

  return {
    visit,
    setPaused(p) {
      paused = p;
      keys.clear();
    },
    dispose() {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('visibilitychange', onVisibility);
      timer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
