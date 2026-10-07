'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Ambiance du site : défilement doux (Lenis), grain de film et poussière
 * d'or qui flotte lentement en arrière-plan (canvas léger, coupé si
 * l'utilisateur limite les animations ou si l'onglet est caché).
 */
export function Ambient() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const c = canvas.current;
    if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let w = 0;
    let h = 0;
    const resize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const count = window.innerWidth < 768 ? 18 : 42;
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.25 + 0.05),
      vx: (Math.random() - 0.5) * 0.12,
      a: Math.random() * 0.5 + 0.15,
      t: Math.random() * Math.PI * 2,
    }));
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        d.t += 0.02;
        if (d.y < -10) {
          d.y = h + 10;
          d.x = Math.random() * w;
        }
        const alpha = d.a * (0.6 + 0.4 * Math.sin(d.t));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,195,107,${alpha})`;
        ctx.shadowColor = 'rgba(240,195,107,0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[1] opacity-70" />
      <div aria-hidden className="film-grain" />
    </>
  );
}
