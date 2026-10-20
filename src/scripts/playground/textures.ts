import * as THREE from 'three';

/** A few hard tone bands, for the hand-painted anime ("toon") look. */
export function toonGradient(steps: number[] = [0.42, 0.72, 1]): THREE.DataTexture {
  const data = new Uint8Array(steps.length * 4);
  steps.forEach((v, i) => {
    const c = Math.round(v * 255);
    data.set([c, c, c, 255], i * 4);
  });
  const tex = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

export function canvasTexture(
  width: number,
  height: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d')!, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Awning stripes with a scalloped bottom edge. */
export function awningTexture(color: string, light = '#fff6e8'): THREE.CanvasTexture {
  return canvasTexture(512, 256, (g, w, h) => {
    const n = 8;
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? light : color;
      g.fillRect((i * w) / n, 0, w / n + 1, h * 0.8);
    }
    // Scallops
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? light : color;
      g.beginPath();
      g.arc(((i + 0.5) * w) / n, h * 0.8, w / n / 2, 0, Math.PI);
      g.fill();
    }
  });
}

/** Wooden sign board with an emoji and a label. */
export function signTexture(emoji: string, label: string, accent: string): THREE.CanvasTexture {
  return canvasTexture(768, 256, (g, w, h) => {
    roundRect(g, 6, 6, w - 12, h - 12, 46);
    g.fillStyle = '#6b4329';
    g.fill();
    roundRect(g, 22, 22, w - 44, h - 44, 34);
    g.fillStyle = '#fff3dc';
    g.fill();
    g.lineWidth = 8;
    g.strokeStyle = accent;
    g.stroke();
    // Little nail heads
    g.fillStyle = '#3d2616';
    for (const [x, y] of [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]]) {
      g.beginPath();
      g.arc(x, y, 7, 0, Math.PI * 2);
      g.fill();
    }
    const font = '"Inter","PingFang TC","Microsoft JhengHei","Noto Sans TC",system-ui,sans-serif';
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.font = `112px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    const emojiW = g.measureText(emoji).width;
    let size = 92;
    g.font = `800 ${size}px ${font}`;
    while (g.measureText(label).width > w - 150 - emojiW && size > 40) {
      size -= 4;
      g.font = `800 ${size}px ${font}`;
    }
    const labelW = g.measureText(label).width;
    const startX = (w - (emojiW + 24 + labelW)) / 2;
    g.font = `112px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    g.fillText(emoji, startX, h / 2 + 6);
    g.font = `800 ${size}px ${font}`;
    g.fillStyle = '#4a2c1a';
    g.fillText(label, startX + emojiW + 24, h / 2 + 6);
  });
}

/** Vertical cloth banner: emoji on top, label below (one character per line for Chinese). */
export function bannerTexture(emoji: string, label: string, color: string): THREE.CanvasTexture {
  return canvasTexture(256, 640, (g, w, h) => {
    // Cloth with a slightly darker hem and a split at the bottom.
    g.fillStyle = color;
    roundRect(g, 8, 0, w - 16, h - 8, 18);
    g.fill();
    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.fillRect(8, h - 70, w - 16, 10);
    g.clearRect(w / 2 - 4, h - 60, 8, 60);
    g.fillStyle = '#fff6e8';
    roundRect(g, 26, 26, w - 52, h - 110, 14);
    g.fill();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    g.fillText(emoji, w / 2, 110);
    const font = '"Inter","PingFang TC","Microsoft JhengHei","Noto Sans TC",system-ui,sans-serif';
    const cjk = /[\u3400-\u9fff]/.test(label);
    g.fillStyle = '#4a2c1a';
    if (cjk) {
      const chars = [...label];
      const size = Math.min(64, Math.floor(330 / chars.length));
      g.font = `800 ${size}px ${font}`;
      chars.forEach((c, i) => g.fillText(c, w / 2, 210 + i * (size + 8) + size / 2));
    } else {
      // Latin labels read top-to-bottom, rotated.
      g.save();
      g.translate(w / 2, 360);
      g.rotate(Math.PI / 2);
      let size = 58;
      g.font = `800 ${size}px ${font}`;
      while (g.measureText(label).width > 330 && size > 26) {
        size -= 2;
        g.font = `800 ${size}px ${font}`;
      }
      g.fillText(label, 0, 0);
      g.restore();
    }
  });
}

/** Cobblestone lane. */
export function cobbleTexture(): THREE.CanvasTexture {
  const tex = canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#3e3a52';
    g.fillRect(0, 0, w, h);
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const rows = 10;
    for (let r = 0; r < rows; r++) {
      const y = (r + 0.5) * (h / rows);
      const offset = r % 2 ? 0 : 26;
      for (let x = -30 + offset; x < w + 30; x += 52) {
        const sw = 22 + rand() * 6;
        const sh = 18 + rand() * 5;
        const tone = 92 + Math.floor(rand() * 28);
        g.fillStyle = `rgb(${tone - 10}, ${tone - 14}, ${tone + 16})`;
        roundRect(g, x - sw + rand() * 4, y - sh, sw * 2, sh * 2, 12);
        g.fill();
        g.fillStyle = 'rgba(255,240,220,0.08)';
        roundRect(g, x - sw + 4, y - sh + 3, sw * 1.6, sh * 0.7, 8);
        g.fill();
      }
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Soft round glow for the moon halo and fireflies. */
export function glowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)'): THREE.CanvasTexture {
  return canvasTexture(128, 128, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.55)'));
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });
}
