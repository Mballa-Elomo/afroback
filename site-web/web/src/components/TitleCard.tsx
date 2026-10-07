'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { Tile } from '@/lib/types';
import { tileHref } from '@/lib/catalogue';
import { useInfo } from './InfoModal';
import { useLang } from '@/lib/lang-client';

/**
 * Carte de contenu « vivante » :
 * - poster (2:3) pour les héros, large (16:10) pour mythes et Découverte ;
 * - inclinaison 3D qui suit la souris, reflet lumineux, halo doré ;
 * - au survol : l'image respire, les infos et boutons montent ;
 * - un clic ouvre la fenêtre « Plus d'infos ».
 */
export function TitleCard({ tile, variant }: { tile: Tile; variant?: 'poster' | 'wide' }) {
  const v = variant ?? (tile.type === 'heros' ? 'poster' : 'wide');
  const { tr } = useLang();
  const { open } = useInfo();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [9, -9]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-11, 11]), { stiffness: 220, damping: 20 });
  const glareX = useTransform(px, [0, 1], ['0%', '100%']);
  const glareY = useTransform(py, [0, 1], ['0%', '100%']);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,244,224,0.28), transparent 55%)`);

  return (
    <motion.div
      ref={ref}
      className="group relative [perspective:900px]"
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      <motion.button
        onClick={() => open(tile)}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.04, y: -6 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className={`relative block w-full overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-ivory/10 transition-shadow duration-300 group-hover:glow-gold ${
          v === 'poster' ? 'aspect-[2/3]' : 'aspect-[16/10]'
        }`}
        aria-label={tr(`${tile.title}, plus d'infos`, `${tile.title}, more info`)}
      >
        {tile.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tile.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[50%_22%] transition duration-[1.2s] ease-out group-hover:scale-110"
          />
        ) : (
          <span className="bg-pattern absolute inset-0 opacity-20" />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent opacity-90 transition group-hover:opacity-100" />
        <motion.span style={{ background: glare }} className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" />

        <span className="absolute left-3 top-3 flex gap-1.5">
          {tile.free ? (
            <span className="rounded-full bg-free px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-ink">{tr('GRATUIT', 'FREE')}</span>
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-gold ring-1 ring-gold/40 backdrop-blur" aria-label={tr('Réservé aux abonnés', 'Members only')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
          )}
        </span>

        <span className="absolute inset-x-4 bottom-4 translate-y-0 transition duration-500 group-hover:-translate-y-1" style={{ transform: 'translateZ(40px)' }}>
          <span className="block truncate text-[10px] font-bold tracking-[0.18em] text-gold">{tile.kicker}</span>
          <span className={`mt-1 line-clamp-2 font-display font-bold leading-[1.1] text-ivory ${v === 'poster' ? 'text-xl' : 'text-lg md:text-xl'}`}>
            {tile.title}
          </span>
          <span className="grid grid-rows-[0fr] transition-all duration-500 group-hover:grid-rows-[1fr]">
            <span className="overflow-hidden">
              <span className="mt-2 line-clamp-3 block text-[13px] leading-snug text-body">{tile.summary}</span>
              <span className="mt-3 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-ink">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="text-xs font-bold text-gold-pale">{tr("Plus d'infos", 'More info')}</span>
                {tile.likes > 0 && <span className="ml-auto text-xs text-body">♥ {tile.likes}</span>}
              </span>
            </span>
          </span>
        </span>
      </motion.button>
      <Link href={tileHref(tile)} className="sr-only">
        {tr('Ouvrir la page de', 'Open the page for')} {tile.title}
      </Link>
    </motion.div>
  );
}
