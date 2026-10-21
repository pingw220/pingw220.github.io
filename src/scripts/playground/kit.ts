import * as THREE from 'three';
import { canvasTexture } from './textures';

/** Shared building blocks for the playground worlds. */

export const FONT = '"Inter","PingFang TC","Microsoft JhengHei","Noto Sans TC",system-ui,sans-serif';
export const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export function makeKit(gradientMap: THREE.Texture) {
  const toon = (color: THREE.ColorRepresentation, extra: THREE.MeshToonMaterialParameters = {}) =>
    new THREE.MeshToonMaterial({ color, gradientMap, ...extra });
  const glow = (color: THREE.ColorRepresentation, intensity = 1.6) =>
    new THREE.MeshToonMaterial({ color, gradientMap, emissive: new THREE.Color(color), emissiveIntensity: intensity });
  const box = (w: number, h: number, d: number, mat: THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const cyl = (rt: number, rb: number, h: number, mat: THREE.Material, seg = 14) =>
    new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  const ball = (r: number, mat: THREE.Material, seg = 18) => new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), mat);
  const at = <T extends THREE.Object3D>(obj: T, x: number, y: number, z: number, parent?: THREE.Object3D): T => {
    obj.position.set(x, y, z);
    parent?.add(obj);
    return obj;
  };
  return { toon, glow, box, cyl, ball, at, gradientMap };
}
export type Kit = ReturnType<typeof makeKit>;

/** A room open toward the camera (+z): floor, back wall, side walls, and skirting. */
export function buildRoom(
  scene: THREE.Scene,
  kit: Kit,
  o: { width: number; depth: number; height: number; floor: THREE.Texture | THREE.ColorRepresentation; wall: THREE.Texture | THREE.ColorRepresentation; trim?: THREE.ColorRepresentation },
) {
  const { width: w, depth: d, height: h } = o;
  const mat = (src: THREE.Texture | THREE.ColorRepresentation, repeat: [number, number]) => {
    if (src instanceof THREE.Texture) {
      const t = src.clone();
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(...repeat);
      t.needsUpdate = true;
      return kit.toon(0xffffff, { map: t });
    }
    return kit.toon(src);
  };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(o.floor, [w / 4, d / 4]));
  floor.rotation.x = -Math.PI / 2;
  floor.name = 'ground';
  scene.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(o.wall, [w / 4, h / 4]));
  back.position.set(0, h / 2, -d / 2);
  scene.add(back);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(d, h), mat(o.wall, [d / 4, h / 4]));
    side.position.set((s * w) / 2, h / 2, 0);
    side.rotation.y = -s * (Math.PI / 2);
    scene.add(side);
  }
  const trim = kit.toon(o.trim ?? 0x4a3020);
  for (const [x, z, len, ry] of [[0, -d / 2 + 0.06, w, 0], [-w / 2 + 0.06, 0, d, Math.PI / 2], [w / 2 - 0.06, 0, d, Math.PI / 2]] as const) {
    const skirt = kit.box(len, 0.22, 0.12, trim);
    skirt.position.set(x, 0.11, z);
    skirt.rotation.y = ry;
    scene.add(skirt);
  }
  return { floor, back };
}

/** Plank floor. */
export function woodTexture(base = '#9c6b45', dark = '#7d5235'): THREE.CanvasTexture {
  return canvasTexture(512, 512, (g, w, h) => {
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const y = (r * h) / rows;
      g.fillStyle = r % 2 ? base : dark;
      g.fillRect(0, y, w, h / rows);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(0, y, w, 3);
      const off = (r * 137) % w;
      g.fillRect(off, y, 3, h / rows);
      g.fillStyle = 'rgba(255,255,255,0.05)';
      for (let k = 0; k < 6; k++) g.fillRect(((k * 97 + r * 41) % w), y + 10 + ((k * 13) % 30), 70, 2);
    }
  });
}

/** Wallpaper with soft vertical stripes or a small pattern. */
export function wallTexture(base: string, accent: string, pattern: 'stripes' | 'dots' | 'panels' = 'stripes'): THREE.CanvasTexture {
  return canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    g.fillStyle = accent;
    if (pattern === 'stripes') for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 22, h);
    if (pattern === 'dots') for (let y = 16; y < h; y += 42) for (let x = (y / 42) % 2 ? 16 : 37; x < w; x += 42) g.fillRect(x, y, 6, 6);
    if (pattern === 'panels') {
      g.strokeStyle = accent;
      g.lineWidth = 6;
      g.strokeRect(14, 14, w - 28, h - 28);
    }
  });
}

/** Text label (sign, plaque) on a rounded board. */
export function labelTexture(
  text: string,
  o: { bg?: string; fg?: string; border?: string; width?: number; height?: number; emoji?: string; size?: number; sub?: string } = {},
): THREE.CanvasTexture {
  const W = o.width ?? 768;
  const H = o.height ?? 192;
  return canvasTexture(W, H, (g, w, h) => {
    const r = Math.min(40, h / 4);
    g.beginPath();
    g.roundRect(6, 6, w - 12, h - 12, r);
    g.fillStyle = o.bg ?? '#fff3dc';
    g.fill();
    if (o.border) {
      g.lineWidth = 10;
      g.strokeStyle = o.border;
      g.stroke();
    }
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = o.fg ?? '#4a2c1a';
    let size = o.size ?? Math.round(h * 0.42);
    const full = o.emoji ? `${o.emoji} ${text}` : text;
    g.font = `800 ${size}px ${FONT}`;
    while (g.measureText(full).width > w - 60 && size > 18) {
      size -= 2;
      g.font = `800 ${size}px ${FONT}`;
    }
    const y = o.sub ? h * 0.4 : h / 2 + 4;
    if (o.emoji) {
      const tw = g.measureText(text).width;
      g.font = `${size}px ${EMOJI_FONT}`;
      const ew = g.measureText(o.emoji).width;
      const start = (w - (ew + 16 + tw)) / 2;
      g.textAlign = 'left';
      g.fillText(o.emoji, start, y);
      g.font = `800 ${size}px ${FONT}`;
      g.fillText(text, start + ew + 16, y);
    } else g.fillText(text, w / 2, y);
    if (o.sub) {
      g.textAlign = 'center';
      g.font = `600 ${Math.round(size * 0.55)}px ${FONT}`;
      g.globalAlpha = 0.75;
      g.fillText(o.sub, w / 2, h * 0.72);
    }
  });
}

/** A clickable spot with a mesh list; helper for items built from several meshes. */
export function markHits(objs: THREE.Object3D[], id: string): THREE.Object3D[] {
  objs.forEach((o) => (o.userData.itemId = id));
  return objs;
}

/** Room lighting: soft fill plus a few warm lamps. */
export function roomLights(scene: THREE.Scene, sky = 0xfff1dd, ground = 0x4a3a40, intensity = 1.6) {
  scene.add(new THREE.HemisphereLight(sky, ground, intensity));
  const key = new THREE.DirectionalLight(0xfff0d8, 0.9);
  key.position.set(4, 10, 8);
  scene.add(key);
}

/** Exit door on the left wall near the entrance, labelled "Back to the market". */
export function buildExitDoor(scene: THREE.Scene, kit: Kit, x: number, z: number, label: string) {
  const door = new THREE.Group();
  const frame = kit.toon(0x5e3c27);
  const leaf = kit.box(1.3, 2.3, 0.08, kit.toon(0x8a5a3a));
  leaf.position.y = 1.15;
  const knob = kit.ball(0.06, kit.toon(0xffd166));
  knob.position.set(0.45, 1.15, 0.06);
  const lintel = kit.box(1.6, 0.14, 0.16, frame);
  lintel.position.y = 2.38;
  door.add(leaf, knob, lintel);
  for (const s of [-1, 1]) {
    const jamb = kit.box(0.14, 2.4, 0.16, frame);
    jamb.position.set(s * 0.72, 1.2, 0);
    door.add(jamb);
  }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: labelTexture(label, { emoji: '🏮', bg: '#fff3dc', border: '#e76f51' }), color: 0xe0d8cc, transparent: true }));
  sign.position.set(0, 2.75, 0.05);
  door.add(sign);
  const lamp = kit.ball(0.12, kit.glow(0xffc37a, 2));
  lamp.position.set(0.95, 2.1, 0.2);
  door.add(lamp);
  const light = new THREE.PointLight(0xffc37a, 4, 5, 1.6);
  light.position.set(0.9, 2, 0.8);
  door.add(light);
  door.position.set(x, 0, z);
  door.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
  scene.add(door);
  return { door, hits: [leaf, lintel, sign] };
}

/**
 * Use a photo/cover when there is one (falls back to the drawn texture if it can't load).
 * With `aspect` (width / height of the surface), the photo is center-cropped to fit.
 */
export function imageOr(url: string | undefined, fallback: () => THREE.Texture, aspect?: number): THREE.Texture {
  const drawn = fallback();
  if (!url) return drawn;
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const tex = loader.load(
    url,
    // The photo is a different size than the placeholder: free the GPU copy so it's reallocated.
    (t) => {
      const img = t.image as HTMLImageElement;
      if (aspect && img.width && img.height) {
        const ratio = img.width / img.height / aspect;
        if (ratio > 1) t.repeat.set(1 / ratio, 1);
        else t.repeat.set(1, ratio);
        t.offset.set((1 - t.repeat.x) / 2, (1 - t.repeat.y) / 2);
      }
      t.dispose();
      t.needsUpdate = true;
    },
    undefined,
    () => {
      // Couldn't load (offline, blocked): keep showing the drawn texture.
      tex.image = drawn.image as HTMLImageElement;
      tex.dispose();
      tex.needsUpdate = true;
    },
  );
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  // Until it arrives, show the drawn version.
  tex.image = drawn.image as HTMLImageElement;
  tex.needsUpdate = true;
  return tex;
}
