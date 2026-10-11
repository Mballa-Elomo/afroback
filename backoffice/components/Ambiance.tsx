'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Sankofa } from './Sankofa';
import s from './ambiance.module.css';

/**
 * Couche d'immersion du back-office (2026-10-10) : halos qui dérivent,
 * poussières d'or, Sankofa en filigrane, lumière qui suit la souris, cartes
 * en relief (data-tilt), apparition au défilement et barre de navigation
 * tissée. Tout s'éteint si le système demande de réduire les animations.
 */

/** À appeler avant une navigation par code (router.push) pour afficher la barre de chargement. */
export function annoncerNavigation() {
  window.dispatchEvent(new Event('afa-navigation'));
}

const REVELER = '.afa-page > * > *, .afa-page table tbody tr, .afa-page [role="row"], .afa-page [data-reveal-auto]';

export function Ambiance() {
  const pathname = usePathname();
  const params = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lumiereRef = useRef<HTMLDivElement>(null);
  const premierAffichage = useRef(true);
  const [chargement, setChargement] = useState<'repos' | 'en_cours' | 'fin'>('repos');

  // --- Barre de navigation : démarre au clic sur un lien interne, finit quand la page change.
  useEffect(() => {
    const demarrer = () => setChargement('en_cours');
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      demarrer();
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('afa-navigation', demarrer);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('afa-navigation', demarrer);
    };
  }, []);

  useEffect(() => {
    setChargement((c) => (c === 'en_cours' ? 'fin' : c));
    const t = setTimeout(() => setChargement((c) => (c === 'fin' ? 'repos' : c)), 650);
    return () => clearTimeout(t);
  }, [pathname, params]);

  // --- Apparition au défilement (blocs et lignes de tableau). Avant l'affichage
  // (useLayoutEffect) pour éviter tout clignotement ; au tout premier chargement,
  // ce qui est déjà à l'écran reste tel quel.
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.dataset.reveal = 'in';
          io.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
    );
    const preparer = () => {
      const vus = new Map<Element, number>();
      document.querySelectorAll<HTMLElement>(REVELER).forEach((el) => {
        if (el.dataset.reveal) return;
        if (premierAffichage.current && el.getBoundingClientRect().top < innerHeight) {
          el.dataset.reveal = 'deja';
          return;
        }
        // Décalage en cascade entre éléments frères.
        const parent = el.parentElement!;
        const i = vus.get(parent) ?? 0;
        vus.set(parent, i + 1);
        el.style.setProperty('--reveal-delai', `${Math.min(i, 12) * 45}ms`);
        el.dataset.reveal = 'out';
        io.observe(el);
      });
    };
    preparer();
    premierAffichage.current = false;
    // Les contenus chargés ou filtrés après coup sont pris en charge aussi.
    const mo = new MutationObserver(() => preparer());
    const racine = document.getElementById('afa-scroll-container');
    if (racine) mo.observe(racine, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  // --- Lumière qui suit la souris + relief des cartes [data-tilt].
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return;
    let x = innerWidth / 2,
      y = innerHeight / 3,
      cx = x,
      cy = y,
      raf = 0;
    const boucle = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      lumiereRef.current?.style.setProperty('transform', `translate3d(${cx - 300}px, ${cy - 300}px, 0)`);
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(boucle) : 0;
    };
    let carte: HTMLElement | null = null;
    const relacher = () => {
      if (!carte) return;
      carte.style.transform = '';
      carte.style.removeProperty('--tilt-x');
      carte.style.removeProperty('--tilt-y');
      carte.removeAttribute('data-tilt-actif');
      carte = null;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(boucle);
      const c = (e.target as HTMLElement).closest<HTMLElement>('[data-tilt]');
      if (c !== carte) relacher();
      if (!c) return;
      carte = c;
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      c.setAttribute('data-tilt-actif', '');
      c.style.setProperty('--tilt-x', `${px * 100}%`);
      c.style.setProperty('--tilt-y', `${py * 100}%`);
      c.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 9}deg) translateY(-3px)`;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', relacher);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', relacher);
      cancelAnimationFrame(raf);
    };
  }, []);

  // --- Poussières d'or (canevas léger, en pause quand l'onglet est caché).
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const taille = () => {
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
    };
    taille();
    window.addEventListener('resize', taille);
    const N = innerWidth < 700 ? 18 : 42;
    const grains = Array.from({ length: N }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: 0.6 + Math.random() * 1.8,
      v: 0.12 + Math.random() * 0.35,
      d: Math.random() * Math.PI * 2,
      a: 0.25 + Math.random() * 0.55,
    }));
    let raf = 0;
    let t = 0;
    const dessiner = () => {
      t += 0.01;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const g of grains) {
        g.y -= g.v;
        g.x += Math.sin(t + g.d) * 0.25;
        if (g.y < -10) {
          g.y = innerHeight + 10;
          g.x = Math.random() * innerWidth;
        }
        const scintille = g.a * (0.6 + 0.4 * Math.sin(t * 3 + g.d * 5));
        const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r * 4);
        grad.addColorStop(0, `rgba(251, 227, 166, ${scintille})`);
        grad.addColorStop(1, 'rgba(240, 195, 107, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(dessiner);
    };
    const visibilite = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === 'visible') raf = requestAnimationFrame(dessiner);
    };
    raf = requestAnimationFrame(dessiner);
    document.addEventListener('visibilitychange', visibilite);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', taille);
      document.removeEventListener('visibilitychange', visibilite);
    };
  }, []);

  return (
    <>
      <div className={s.fond} aria-hidden>
        <span className={`${s.orbe} ${s.orbe1}`} />
        <span className={`${s.orbe} ${s.orbe2}`} />
        <span className={`${s.orbe} ${s.orbe3}`} />
        <Sankofa size={760} epaisseur={1.2} className={s.filigrane} />
      </div>
      <canvas ref={canvasRef} className={s.poussieres} aria-hidden />
      <div ref={lumiereRef} className={s.lumiere} aria-hidden />
      <div className={`${s.barre} ${chargement === 'en_cours' ? s.barreEnCours : chargement === 'fin' ? s.barreFin : ''}`} aria-hidden />
    </>
  );
}
