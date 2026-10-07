'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { Tile } from '@/lib/types';
import { tileHref } from '@/lib/catalogue';
import { useInfo } from './InfoModal';
import { useLang } from '@/lib/lang-client';

/**
 * Carrousel d'ouverture, façon plateforme de streaming : 5 récits qui
 * défilent toutes les 8 s (pause au survol), image en parallaxe qui suit la
 * souris, titre révélé lettre par lettre, barres de progression cliquables,
 * vignettes des récits suivants. Extrait vidéo muet si le récit en a un.
 */

export type Slide = { tile: Tile; video?: string | null; label: string };

const DURATION = 8000;

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const { open } = useInfo();
  const { tr } = useLang();
  const start = useRef(0);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const imgX = useTransform(sx, (v) => v * -22);
  const imgY = useTransform(sy, (v) => v * -14);
  const textX = useTransform(sx, (v) => v * 8);

  const go = useCallback((i: number) => {
    setIndex((i + slides.length) % slides.length);
    setElapsed(0);
    start.current = performance.now();
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    start.current = performance.now() - elapsed;
    let raf = 0;
    const tick = (t: number) => {
      const e = t - start.current;
      if (e >= DURATION) {
        go(index + 1);
        return;
      }
      setElapsed(e);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, index, slides.length, go]);

  if (slides.length === 0) return null;
  const s = slides[index];

  return (
    <section
      className="relative h-[100svh] min-h-[620px] w-full overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrousel"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={s.tile.slug}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1.04 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ opacity: { duration: 1.1 }, scale: { duration: 9, ease: 'linear' } }}
        >
          <div className="absolute inset-x-0 top-0 h-[62%] lg:inset-y-0 lg:left-auto lg:h-full lg:w-[64%]">
            <motion.div style={{ x: imgX, y: imgY }} className="absolute -inset-6">
              {s.tile.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.tile.image} alt="" className="h-full w-full object-cover object-[50%_18%]" />
              )}
              {s.video && <DelayedVideo src={s.video} />}
            </motion.div>
            {/* fondu de l'image vers le noir (gauche sur ordinateur, bas sur téléphone) */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent lg:bg-gradient-to-r lg:from-ink lg:via-ink/30 lg:to-transparent" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Lumières et dégradés */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-ink via-ink/60 to-transparent lg:block" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(240,195,107,0.18),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />

      <motion.div style={{ x: textX }} className="absolute inset-x-5 bottom-[18%] max-w-3xl md:left-14 md:bottom-[20%]">
        <AnimatePresence mode="wait">
          <motion.div key={s.tile.slug} exit={{ opacity: 0, y: -20, transition: { duration: 0.35 } }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="mb-5 flex flex-wrap items-center gap-3"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ink/40 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.22em] text-gold backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" /> {s.label}
              </span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wider ${s.tile.free ? 'bg-free/90 text-ink' : 'bg-ivory/10 text-ivory'}`}>
                {s.tile.free ? tr('GRATUIT', 'FREE') : tr('ABONNÉS', 'MEMBERS')}
              </span>
            </motion.div>

            <h1 className="font-display text-[44px] font-black leading-[0.95] tracking-tight text-ivory drop-shadow-[0_6px_30px_rgba(0,0,0,0.6)] sm:text-6xl md:text-7xl xl:text-[96px]">
              <LetterReveal text={s.tile.title} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-4 text-sm font-semibold tracking-wide text-gold-pale md:text-base"
            >
              {s.tile.kicker} {s.tile.meta && <span className="text-muted">· {s.tile.meta}</span>}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-4 line-clamp-3 max-w-xl text-base leading-relaxed text-text/90 md:text-lg"
            >
              {s.tile.summary}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href={tileHref(s.tile)}
                className="group inline-flex items-center gap-3 rounded-full bg-ivory py-2 pl-2 pr-7 text-base font-extrabold text-ink transition hover:bg-gold-pale"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-gold transition group-hover:scale-110">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {tr('Découvrir le récit', 'Discover the story')}
              </Link>
              <button
                onClick={() => open(s.tile)}
                className="inline-flex items-center gap-2 rounded-full border border-ivory/25 bg-ivory/10 px-7 py-3.5 text-base font-bold text-ivory backdrop-blur-md transition hover:border-gold/60 hover:bg-ivory/15"
              >
                {tr("Plus d'infos", 'More info')}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Vignettes des récits suivants (ordinateur) */}
      <div className="absolute bottom-[20%] right-14 hidden gap-3 xl:flex">
        {slides.map((sl, i) =>
          i === index ? null : (
            <button
              key={sl.tile.slug}
              onClick={() => go(i)}
              className="group relative h-40 w-28 overflow-hidden rounded-xl ring-1 ring-ivory/15 transition hover:-translate-y-2 hover:ring-gold/60"
              aria-label={tr(`Voir ${sl.tile.title}`, `View ${sl.tile.title}`)}
            >
              {sl.tile.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sl.tile.image} alt="" className="h-full w-full object-cover object-[50%_20%] opacity-70 transition duration-500 group-hover:scale-110 group-hover:opacity-100" />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
              <span className="absolute inset-x-2 bottom-2 line-clamp-2 text-left font-display text-[11px] font-bold leading-tight text-ivory">{sl.tile.title}</span>
            </button>
          )
        )}
      </div>

      {/* Progression */}
      <div className="absolute bottom-[8%] left-5 right-5 flex gap-2 md:left-14 md:right-auto md:w-[420px]">
        {slides.map((sl, i) => (
          <button key={sl.tile.slug} onClick={() => go(i)} className="group h-6 flex-1" aria-label={tr(`Récit ${i + 1}`, `Story ${i + 1}`)}>
            <span className="block h-[3px] overflow-hidden rounded-full bg-ivory/20 transition group-hover:bg-ivory/40">
              <span
                className="block h-full rounded-full bg-gold"
                style={{ width: i < index ? '100%' : i === index ? `${(elapsed / DURATION) * 100}%` : '0%' }}
              />
            </span>
          </button>
        ))}
      </div>

      {/* Invitation à défiler */}
      <div className="absolute bottom-8 right-8 hidden items-center gap-3 text-[11px] font-bold tracking-[0.25em] text-muted md:flex">
        {tr('DÉFILER', 'SCROLL')}
        <span className="relative h-10 w-[1.5px] overflow-hidden bg-ivory/15">
          <motion.span className="absolute inset-x-0 h-4 bg-gold" animate={{ y: [-16, 40] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }} />
        </span>
      </div>
    </section>
  );
}

function LetterReveal({ text }: { text: string }) {
  const words = text.split(' ');
  let n = 0;
  return (
    <span className="inline">
      {words.map((w, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {w.split('').map((ch, ci) => {
            const i = n++;
            return (
              <motion.span
                key={ci}
                className="inline-block"
                initial={{ opacity: 0, y: '0.5em', rotateX: -70, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.25 + i * 0.028, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {ch}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

function DelayedVideo({ src }: { src: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setShow(true), 1800);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <motion.video
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
