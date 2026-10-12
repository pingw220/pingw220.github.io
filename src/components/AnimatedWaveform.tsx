import { useEffect, useRef } from 'react';

/**
 * Subtle animated waveform rendered on a canvas, used as a decorative hero
 * background. Layers three slow-moving harmonic curves in the site accent
 * colors. Renders a single static frame when the user prefers reduced motion.
 */

interface Layer {
  color: string;
  amplitude: number;
  wavelength: number;
  speed: number;
  yOffset: number;
  opacity: number;
}

const LAYERS: Layer[] = [
  { color: '#8b7cf6', amplitude: 26, wavelength: 340, speed: 0.35, yOffset: 0.52, opacity: 0.34 },
  { color: '#6b8cff', amplitude: 38, wavelength: 520, speed: 0.22, yOffset: 0.58, opacity: 0.24 },
  { color: '#f0c98a', amplitude: 18, wavelength: 240, speed: 0.5, yOffset: 0.46, opacity: 0.12 },
];

function drawFrame(ctx: CanvasRenderingContext2D, width: number, height: number, t: number) {
  ctx.clearRect(0, 0, width, height);
  for (const layer of LAYERS) {
    ctx.beginPath();
    const baseY = height * layer.yOffset;
    for (let x = 0; x <= width; x += 3) {
      const phase = (x / layer.wavelength) * Math.PI * 2 + t * layer.speed;
      // Sum two harmonics so the curve reads as audio, not a plain sine.
      const y =
        baseY +
        Math.sin(phase) * layer.amplitude +
        Math.sin(phase * 2.7 + t * 0.13) * layer.amplitude * 0.35;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = layer.color;
    ctx.globalAlpha = layer.opacity;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export default function AnimatedWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reducedMotion.matches) drawFrame(ctx, width, height, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const start = performance.now();
    const loop = (now: number) => {
      drawFrame(ctx, width, height, (now - start) / 1000);
      frame = requestAnimationFrame(loop);
    };

    const applyMotionPreference = () => {
      cancelAnimationFrame(frame);
      if (reducedMotion.matches) {
        drawFrame(ctx, width, height, 0);
      } else {
        frame = requestAnimationFrame(loop);
      }
    };

    applyMotionPreference();
    reducedMotion.addEventListener('change', applyMotionPreference);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reducedMotion.removeEventListener('change', applyMotionPreference);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
