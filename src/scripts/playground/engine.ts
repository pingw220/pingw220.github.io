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
  /** The mouse was captured for looking around (desktop), or released. */
  onLookChange?(locked: boolean): void;
}

export interface Engine {
  /** Fade into a world; optionally arrive in front of one of its items. */
  enter(world: WorldId, arriveAt?: string): Promise<void>;
  /** Walk to an item in the current world, then use it. */
  visit(itemId: string): void;
  setPaused(paused: boolean): void;
  /** Release the mouse (e.g. before opening a panel). */
  releaseLook(): void;
  readonly world: WorldId;
  /** Add effects to the current world's scene (used for fireworks). */
  readonly scene: THREE.Scene;
}

const SPEED = 3.6;
const RUN_FACTOR = 2.2; // while Space or Shift is held
const RADIUS = 0.4; // Joy's size, for bumping into furniture
const NEAR_DISTANCE = 1.5;
const AIM_RANGE = 7; // how far the crosshair can pick things
const LOOK_SPEED = 0.0024;
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

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300);
  const gradientMap = toonGradient();
  const joy = buildMascot(gradientMap);

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
    camera.fov = narrow ? 66 : 55;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  // ── State ──────────────────────────────────────────────────────────────────
  const keys = new Set<string>();
  let target: THREE.Vector3 | null = null;
  let targetItem: Interactable | null = null;
  let near: Interactable | null = null; // what the prompt is about (aimed, or closest)
  let paused = false;
  let switching = false;
  const pos = joy.group.position;

  // Orbit camera: yaw/pitch around Joy, distance from Joy.
  let yaw = 0;
  let pitch = 0.35;
  // Extra height the camera looks at, e.g. up at the fireworks.
  let lift = 0;
  let skyUntil = 0;
  let dist = 6;
  let defaultDist = 6;
  const follow = new THREE.Vector3();
  let snapCamera = true;

  const clamp = (v: THREE.Vector3) => {
    const b = world.bounds;
    v.x = THREE.MathUtils.clamp(v.x, b.minX, b.maxX);
    v.z = THREE.MathUtils.clamp(v.z, b.minZ, b.maxZ);
    v.y = 0;
    return v;
  };

  function lookBehind(facing: number) {
    yaw = facing + Math.PI;
  }

  function placeJoy(arriveAt?: string) {
    const item = arriveAt ? world.items.find((i) => i.id === arriveAt) : undefined;
    if (item) {
      pos.copy(item.front);
      joy.group.rotation.y = item.facing + Math.PI; // turned away from the thing we just left
    } else {
      pos.copy(world.spawn);
      joy.group.rotation.y = world.spawnFacing;
    }
    clamp(pos);
    lookBehind(joy.group.rotation.y);
  }

  function activateWorld(next: World, arriveAt?: string) {
    world = next;
    world.scene.add(joy.group);
    renderPass.scene = world.scene;
    const b = world.bloom ?? DEFAULT_BLOOM;
    bloom.strength = b.strength;
    bloom.radius = b.radius;
    bloom.threshold = b.threshold;
    const c = world.camera;
    defaultDist = Math.hypot(c.back, c.up - 1.2) * 0.9;
    dist = defaultDist;
    pitch = Math.atan2(c.up - 1.2, c.back) * 0.8;
    target = null;
    targetItem = null;
    keys.clear();
    near?.setNear?.(false);
    near = null;
    options.onNear(null, world.id);
    placeJoy(arriveAt);
    snapCamera = true;
    options.onWorldChange(world.id);
  }
  activateWorld(world);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  let running = false;
  const MOVE_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
  const isLocked = () => document.pointerLockElement === renderer.domElement;
  const focusOk = () => isLocked() || host.contains(document.activeElement) || document.activeElement === document.body;
  window.addEventListener('keydown', (e) => {
    if (paused || switching || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as HTMLElement)?.closest?.('input, textarea, select, [contenteditable]')) return;
    const k = e.key.toLowerCase();
    if ((e.code === 'Space' || k === 'shift') && focusOk()) {
      // Hold Space (or Shift) to run.
      running = true;
      e.preventDefault();
    } else if (MOVE_KEYS.includes(k)) {
      if (!focusOk()) return;
      keys.add(k);
      target = null;
      targetItem = null;
      e.preventDefault();
    } else if ((k === 'e' || k === 'enter') && near && focusOk()) {
      e.preventDefault();
      use(near);
    }
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase());
    if (e.code === 'Space' || e.key === 'Shift') running = false;
  });
  window.addEventListener('blur', () => {
    keys.clear();
    running = false;
  });

  // ── Mouse look (desktop) and drag-to-look (touch) ─────────────────────────
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const itemHits = () => world.items.flatMap((i) => i.hits);
  const grounds = () => {
    const g: THREE.Object3D[] = [];
    world.scene.traverse((o) => o.userData.ground && g.push(o));
    return g;
  };
  const turn = (dx: number, dy: number) => {
    yaw -= dx * LOOK_SPEED;
    pitch = THREE.MathUtils.clamp(pitch + dy * LOOK_SPEED, -0.2, 1.25);
  };

  document.addEventListener('pointerlockchange', () => {
    keys.clear();
    options.onLookChange?.(isLocked());
  });
  document.addEventListener('mousemove', (e) => {
    if (isLocked() && !paused) turn(e.movementX, e.movementY);
  });

  let down: { x: number; y: number; id: number; type: string; moved: boolean } | null = null;
  renderer.domElement.addEventListener('pointerdown', (e) => {
    down = { x: e.clientX, y: e.clientY, id: e.pointerId, type: e.pointerType, moved: false };
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (paused || switching) return;
    if (down && down.id === e.pointerId && down.type !== 'mouse') {
      // Touch / pen: drag to look around.
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (down.moved || Math.hypot(dx, dy) > 8) {
        down.moved = true;
        turn(dx * 1.6, dy * 1.6);
        down.x = e.clientX;
        down.y = e.clientY;
      }
    }
  });
  renderer.domElement.addEventListener('pointerup', (e) => {
    const d = down;
    down = null;
    if (paused || switching || !d || d.moved) return;
    if (e.pointerType === 'mouse') {
      if (!isLocked()) {
        // First click captures the mouse for looking around.
        renderer.domElement.requestPointerLock?.();
        return;
      }
      if (near) use(near);
      return;
    }
    // Tap: walk to what was tapped.
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(itemHits(), false)[0];
    const id = hit?.object.userData.itemId as string | undefined;
    if (id) return visit(id);
    const ground = raycaster.intersectObjects(grounds(), false)[0];
    if (ground) {
      target = clamp(ground.point.clone());
      targetItem = null;
    }
  });
  renderer.domElement.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      dist = THREE.MathUtils.clamp(dist * (1 + e.deltaY * 0.0012), 1.8, 11);
    },
    { passive: false },
  );

  /** Use an item: open it if Joy is close, otherwise hop there first. */
  function use(item: Interactable) {
    const d = Math.hypot(item.front.x - pos.x, item.front.z - pos.z);
    if (d < NEAR_DISTANCE + 0.6) trigger(item);
    else visit(item.id);
  }
  function trigger(item: Interactable) {
    if (item.activate) {
      item.activate();
      if (item.skyLook) skyUntil = performance.now() / 1000 + item.skyLook;
    }
    else options.onActivate(item, world.id);
  }

  /** Go to an item right away (no waiting for Joy to walk) and use it. */
  function visit(itemId: string) {
    const item = world.items.find((i) => i.id === itemId);
    if (!item || switching) return;
    pos.copy(clamp(item.front.clone()));
    joy.group.rotation.y = item.facing;
    lookBehind(item.facing);
    target = null;
    targetItem = null;
    trigger(item);
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
  const move = new THREE.Vector3();
  const center = new THREE.Vector2(0, 0);
  const tmp = new THREE.Vector3();

  const frame = () => {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();

    // Keys move relative to where the camera looks.
    move.set(0, 0, 0);
    if (!paused && !switching) {
      const fx = -Math.sin(yaw);
      const fz = -Math.cos(yaw);
      const rx = Math.cos(yaw);
      const rz = -Math.sin(yaw);
      if (keys.has('arrowup') || keys.has('w')) move.add(tmp.set(fx, 0, fz));
      if (keys.has('arrowdown') || keys.has('s')) move.add(tmp.set(-fx, 0, -fz));
      if (keys.has('arrowleft') || keys.has('a')) move.add(tmp.set(-rx, 0, -rz));
      if (keys.has('arrowright') || keys.has('d')) move.add(tmp.set(rx, 0, rz));
    }
    if (move.lengthSq() === 0 && target && !switching) {
      move.subVectors(target, pos).setY(0);
      if (move.length() < 0.08) {
        move.set(0, 0, 0);
        target = null;
        if (targetItem) {
          const item = targetItem;
          targetItem = null;
          joy.group.rotation.y = item.facing;
          trigger(item);
        }
      }
    }
    let speed = 0;
    if (move.lengthSq() > 0) {
      const step = Math.min(SPEED * (running || target ? RUN_FACTOR : 1) * dt, move.length());
      move.normalize();
      // Move each axis separately so Joy slides along furniture instead of stopping.
      const blocked = (x: number, z: number) =>
        (world.obstacles ?? []).some((o) => x > o.minX - RADIUS && x < o.maxX + RADIUS && z > o.minZ - RADIUS && z < o.maxZ + RADIUS);
      const nx = pos.x + move.x * step;
      const nz = pos.z + move.z * step;
      const okX = !blocked(nx, pos.z);
      if (okX) pos.x = nx;
      const okZ = !blocked(pos.x, nz);
      if (okZ) pos.z = nz;
      if (target && !okX && !okZ) {
        target = null;
        targetItem = null;
      }
      clamp(pos);
      speed = step / dt;
      const want = Math.atan2(move.x, move.z);
      let diff = want - joy.group.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      joy.group.rotation.y += diff * Math.min(1, dt * 10);
    }
    joy.update(t, dt, speed);

    // Camera: orbit around Joy.
    tmp.set(pos.x, 1.25, pos.z);
    if (snapCamera) follow.copy(tmp);
    else follow.lerp(tmp, 1 - Math.exp(-dt * 12));
    const d = dist * (narrow ? 1.15 : 1);
    camera.position.set(
      follow.x + Math.sin(yaw) * Math.cos(pitch) * d,
      Math.max(0.35, follow.y + Math.sin(pitch) * d),
      follow.z + Math.cos(yaw) * Math.cos(pitch) * d,
    );
    lift += ((performance.now() / 1000 < skyUntil ? 5.5 : 0) - lift) * Math.min(1, dt * 2.5);
    camera.lookAt(follow.x, follow.y + 0.15 + lift, follow.z);
    snapCamera = false;

    // What the prompt is about: what the crosshair points at, else the closest thing.
    let best: Interactable | null = null;
    if (!switching) {
      raycaster.setFromCamera(center, camera);
      raycaster.far = d + AIM_RANGE;
      const hit = raycaster.intersectObjects(itemHits(), false)[0];
      const aimedId = hit?.object.userData.itemId as string | undefined;
      const aimed = aimedId ? world.items.find((i) => i.id === aimedId) : undefined;
      if (aimed && Math.hypot(aimed.front.x - pos.x, aimed.front.z - pos.z) < AIM_RANGE) best = aimed;
      if (!best) {
        let bestDist = NEAR_DISTANCE;
        for (const item of world.items) {
          if (item.proximity === false) continue;
          const dd = Math.hypot(item.front.x - pos.x, item.front.z - pos.z);
          if (dd < bestDist) {
            bestDist = dd;
            best = item;
          }
        }
      }
    }
    if (best !== near) {
      near?.setNear?.(false);
      best?.setNear?.(true);
      near = best;
      options.onNear(best, world.id);
    }
    world.items.forEach((i) => i.update?.(t));
    world.update(t, dt);

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
      if (p) document.exitPointerLock?.();
    },
    releaseLook() {
      document.exitPointerLock?.();
    },
    get world() {
      return world.id;
    },
    get scene() {
      return world.scene;
    },
  };
}
