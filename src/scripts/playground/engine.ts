import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { toonGradient } from './textures';
import { buildMascot } from './mascot';
import type { Interactable, World, WorldId } from './types';

export interface EngineOptions {
  /** Build a world the first time it's visited. */
  worlds: Record<WorldId, (gradientMap: THREE.Texture) => World>;
  onNear(item: Interactable | null, world: WorldId): void;
  onActivate(item: Interactable, world: WorldId): void;
  onWorldChange(world: WorldId): void;
}

export interface Engine {
  /** Fade into a world; optionally arrive in front of one of its items. */
  enter(world: WorldId, arriveAt?: string): Promise<void>;
  /** Walk to an item in the current world, then use it. */
  visit(itemId: string): void;
  setPaused(paused: boolean): void;
  readonly world: WorldId;
}

const SPEED = 3.4;
const RADIUS = 0.4; // Mochi's size, for bumping into furniture
const NEAR_DISTANCE = 1.5;
const DEFAULT_BLOOM = { strength: 0.6, radius: 0.45, threshold: 0.92 };

export function startEngine(host: HTMLElement, options: EngineOptions, first: WorldId = 'market'): Engine {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.touchAction = 'none';
  host.appendChild(renderer.domElement);

  // Fade overlay for world transitions.
  const fade = document.createElement('div');
  fade.style.cssText = 'position:absolute;inset:0;background:#0b0d2e;opacity:1;pointer-events:none;transition:opacity 380ms ease';
  host.appendChild(fade);
  const setFade = (on: boolean) =>
    new Promise<void>((res) => {
      fade.style.opacity = on ? '1' : '0';
      setTimeout(res, 400);
    });

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
  const gradientMap = toonGradient();
  const mochi = buildMascot(gradientMap);

  const built = new Map<WorldId, World>();
  const getWorld = (id: WorldId) => {
    if (!built.has(id)) {
      const w = options.worlds[id](gradientMap);
      w.scene.traverse((o) => o.name === 'ground' && (o.userData.ground = true));
      built.set(id, w);
    }
    return built.get(id)!;
  };
  let world = getWorld(first);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(world.scene, camera);
  composer.addPass(renderPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), DEFAULT_BLOOM.strength, DEFAULT_BLOOM.radius, DEFAULT_BLOOM.threshold);
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
  new ResizeObserver(resize).observe(host);
  resize();

  // ── State ──────────────────────────────────────────────────────────────────
  const keys = new Set<string>();
  let target: THREE.Vector3 | null = null;
  let targetItem: Interactable | null = null;
  let near: Interactable | null = null;
  let paused = false;
  let switching = false;
  let snapCamera = true;
  const pos = mochi.group.position;

  const clamp = (v: THREE.Vector3) => {
    const b = world.bounds;
    v.x = THREE.MathUtils.clamp(v.x, b.minX, b.maxX);
    v.z = THREE.MathUtils.clamp(v.z, b.minZ, b.maxZ);
    v.y = 0;
    return v;
  };

  function placeMochi(arriveAt?: string) {
    const item = arriveAt ? world.items.find((i) => i.id === arriveAt) : undefined;
    if (item) {
      pos.copy(item.front);
      mochi.group.rotation.y = item.facing + Math.PI; // turned away from the thing we just left
    } else {
      pos.copy(world.spawn);
      mochi.group.rotation.y = world.spawnFacing;
    }
    clamp(pos);
  }

  function activateWorld(next: World, arriveAt?: string) {
    world = next;
    world.scene.add(mochi.group);
    renderPass.scene = world.scene;
    const b = world.bloom ?? DEFAULT_BLOOM;
    bloom.strength = b.strength;
    bloom.radius = b.radius;
    bloom.threshold = b.threshold;
    target = null;
    targetItem = null;
    keys.clear();
    if (near) near.setNear?.(false);
    near = null;
    options.onNear(null, world.id);
    placeMochi(arriveAt);
    snapCamera = true;
    options.onWorldChange(world.id);
  }
  activateWorld(world);

  // ── Input ──────────────────────────────────────────────────────────────────
  const MOVE_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
  const focusOk = () => host.contains(document.activeElement) || document.activeElement === document.body;
  window.addEventListener('keydown', (e) => {
    if (paused || switching || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as HTMLElement)?.closest?.('input, textarea, select, [contenteditable]')) return;
    const k = e.key.toLowerCase();
    if (MOVE_KEYS.includes(k)) {
      if (!focusOk()) return;
      keys.add(k);
      target = null;
      targetItem = null;
      e.preventDefault();
    } else if ((k === 'e' || k === 'enter') && near && focusOk()) {
      e.preventDefault();
      options.onActivate(near, world.id);
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const setPointer = (e: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
  };
  const itemHits = () => world.items.flatMap((i) => i.hits);
  const grounds = () => {
    const g: THREE.Object3D[] = [];
    world.scene.traverse((o) => o.userData.ground && g.push(o));
    return g;
  };
  let downAt: { x: number; y: number } | null = null;
  renderer.domElement.addEventListener('pointerdown', (e) => (downAt = { x: e.clientX, y: e.clientY }));
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (paused || switching || !downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
    setPointer(e);
    const hit = raycaster.intersectObjects(itemHits(), false)[0];
    const id = hit?.object.userData.itemId as string | undefined;
    if (id) return visit(id);
    const ground = raycaster.intersectObjects(grounds(), false)[0];
    if (ground) {
      target = clamp(ground.point.clone());
      targetItem = null;
    }
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (paused || switching) return;
    setPointer(e);
    renderer.domElement.style.cursor = raycaster.intersectObjects(itemHits(), false).length ? 'pointer' : 'default';
  });

  function visit(itemId: string) {
    const item = world.items.find((i) => i.id === itemId);
    if (!item || switching) return;
    target = clamp(item.front.clone());
    targetItem = item;
  }

  async function enter(id: WorldId, arriveAt?: string) {
    if (switching) return;
    switching = true;
    await setFade(true);
    activateWorld(getWorld(id), arriveAt);
    composer.render(0);
    await setFade(false);
    switching = false;
  }

  // ── Loop ───────────────────────────────────────────────────────────────────
  const timer = new THREE.Timer();
  timer.connect(document);
  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const lookGoal = new THREE.Vector3();
  const move = new THREE.Vector3();

  const frame = () => {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();

    move.set(0, 0, 0);
    if (!paused && !switching) {
      if (keys.has('arrowup') || keys.has('w')) move.z -= 1;
      if (keys.has('arrowdown') || keys.has('s')) move.z += 1;
      if (keys.has('arrowleft') || keys.has('a')) move.x -= 1;
      if (keys.has('arrowright') || keys.has('d')) move.x += 1;
    }
    if (move.lengthSq() === 0 && target && !switching) {
      move.subVectors(target, pos).setY(0);
      if (move.length() < 0.08) {
        move.set(0, 0, 0);
        target = null;
        if (targetItem) {
          const item = targetItem;
          targetItem = null;
          mochi.group.rotation.y = item.facing;
          options.onActivate(item, world.id);
        }
      }
    }
    let speed = 0;
    if (move.lengthSq() > 0) {
      const step = Math.min(SPEED * dt, move.length());
      move.normalize();
      // Move each axis separately so Mochi slides along furniture instead of stopping.
      const blocked = (x: number, z: number) =>
        (world.obstacles ?? []).some((o) => x > o.minX - RADIUS && x < o.maxX + RADIUS && z > o.minZ - RADIUS && z < o.maxZ + RADIUS);
      const nx = pos.x + move.x * step;
      if (!blocked(nx, pos.z)) pos.x = nx;
      const nz = pos.z + move.z * step;
      if (!blocked(pos.x, nz)) pos.z = nz;
      // If walking toward a target got completely stuck, give up rather than push forever.
      if (target && Math.abs(nx - pos.x) > 1e-6 && Math.abs(nz - pos.z) > 1e-6) {
        target = null;
        targetItem = null;
      }
      clamp(pos);
      speed = step / dt;
      const want = Math.atan2(move.x, move.z);
      let diff = want - mochi.group.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      mochi.group.rotation.y += diff * Math.min(1, dt * 10);
    }
    mochi.update(t, dt, speed);

    // Nearest usable thing.
    let best: Interactable | null = null;
    let bestDist = NEAR_DISTANCE;
    for (const item of world.items) {
      if (item.proximity === false) continue;
      const d = Math.hypot(item.front.x - pos.x, item.front.z - pos.z);
      if (d < bestDist) {
        bestDist = d;
        best = item;
      }
    }
    if (best !== near && !switching) {
      near?.setNear?.(false);
      best?.setNear?.(true);
      near = best;
      options.onNear(best, world.id);
    }
    world.items.forEach((i) => i.update?.(t));
    world.update(t, dt);

    // Camera follows from behind and above.
    const c = world.camera;
    const back = c.back * (narrow ? 1.25 : 1);
    const up = c.up * (narrow ? 1.2 : 1);
    camPos.set(pos.x * c.followX, up, pos.z + back);
    lookGoal.set(pos.x * Math.min(1, c.followX + 0.2), c.lookY, pos.z - c.lookAhead);
    const k = snapCamera ? 1 : 1 - Math.exp(-dt * 3);
    camera.position.lerp(camPos, k);
    lookAt.lerp(lookGoal, k);
    camera.lookAt(lookAt);
    snapCamera = false;

    composer.render(dt);
  };
  frame();
  setFade(false);

  return {
    enter,
    visit,
    setPaused(p) {
      paused = p;
      keys.clear();
    },
    get world() {
      return world.id;
    },
  };
}
