"use client";

import { useEffect, useRef } from "react";

/**
 * A live, animated dither field — flowing organic noise rendered as a
 * grid of small blocks, the way an ASCII/pixel generative background
 * actually moves rather than sitting there as a static gradient. Pure
 * canvas, no external noise library: a handful of layered sine waves
 * produce the same "drifting cloud" quality at a fraction of the cost.
 */
export function NoiseField({ className, cell = 10, color = "58,221,130", maxAlpha = 0.16 }: { className?: string; cell?: number; color?: string; maxAlpha?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0, cols = 0, rows = 0;
    let frame: number;
    let t = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / cell) + 1;
      rows = Math.ceil(height / cell) + 1;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const n =
            (Math.sin(x * 0.09 + t * 0.6) +
              Math.sin(y * 0.11 - t * 0.4) +
              Math.sin((x + y) * 0.06 + t * 0.35) +
              Math.sin(Math.hypot(x - cols / 2, y - rows / 2) * 0.14 - t * 0.5)) /
            4;
          const a = Math.max(0, n) * maxAlpha;
          if (a < 0.008) continue;
          ctx.fillStyle = `rgba(${color},${a.toFixed(3)})`;
          ctx.fillRect(x * cell, y * cell, cell - 1.5, cell - 1.5);
        }
      }
      if (!reduceMotion) {
        t += 0.008;
        frame = requestAnimationFrame(draw);
      }
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [cell, color, maxAlpha]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
