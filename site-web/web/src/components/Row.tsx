'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Tile } from '@/lib/types';
import { TitleCard } from './TitleCard';
import { useLang } from '@/lib/lang-client';

/**
 * Rangée animée : le titre et les cartes apparaissent en cascade quand la
 * rangée entre à l'écran. Flèches rondes, défilement par écran, glisser au
 * doigt sur téléphone. Cartes poster (héros) ou larges (mythes, lieux).
 */
export function Row({ title, subtitle, tiles, href, variant }: { title: string; subtitle?: string; tiles: Tile[]; href?: string; variant?: 'poster' | 'wide' }) {
  const { tr } = useLang();
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  if (tiles.length === 0) return null;
  const poster = (variant ?? (tiles[0].type === 'heros' ? 'poster' : 'wide')) === 'poster';

  const by = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: 'smooth' });
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };

  return (
    <section className="relative my-10 md:my-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="mb-5 flex items-end justify-between gap-4 px-5 md:px-14"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-heading md:text-[32px]">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted md:text-base">{subtitle}</p>}
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-3 block h-[2px] bg-gradient-to-r from-gold to-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          {href && (
            <Link href={href} className="mr-2 hidden text-sm font-bold text-gold transition hover:text-gold-pale sm:block">
              {tr('Tout voir →', 'See all →')}
            </Link>
          )}
          <Arrow dir="left" disabled={atStart} onClick={() => by(-1)} />
          <Arrow dir="right" disabled={atEnd} onClick={() => by(1)} />
        </div>
      </motion.div>

      <div ref={track} onScroll={onScroll} className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-smooth px-5 py-6 md:gap-5 md:px-14">
        {tiles.map((t, i) => (
          <motion.div
            key={`${t.type}:${t.slug}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: Math.min(i, 6) * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
            className={`shrink-0 snap-start ${poster ? 'w-[44%] sm:w-[30%] md:w-[23%] lg:w-[18%] xl:w-[15.5%]' : 'w-[78%] sm:w-[46%] md:w-[36%] lg:w-[29%] xl:w-[23.5%]'}`}
          >
            <TitleCard tile={t} variant={poster ? 'poster' : 'wide'} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Arrow({ dir, disabled, onClick }: { dir: 'left' | 'right'; disabled: boolean; onClick: () => void }) {
  const { tr } = useLang();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="hidden h-11 w-11 place-items-center rounded-full border border-ivory/15 text-ivory transition hover:border-gold hover:bg-gold hover:text-ink disabled:pointer-events-none disabled:opacity-25 md:grid"
      aria-label={dir === 'left' ? tr('Précédent', 'Previous') : tr('Suivant', 'Next')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'left' ? <path d="m15 5-7 7 7 7" /> : <path d="m9 5 7 7-7 7" />}
      </svg>
    </button>
  );
}
