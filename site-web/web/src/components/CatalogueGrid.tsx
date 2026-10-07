'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Tile } from '@/lib/types';
import { TitleCard } from './TitleCard';
import { useLang } from '@/lib/lang-client';

/**
 * Page de catalogue : grande bannière (mosaïque des visuels qui défile),
 * titre doré, filtres en pastilles animées, grille qui apparaît en cascade.
 */
const ALL = '__all';
const FREE = '__free';

export function CatalogueGrid({ title, intro, tiles, eyebrow }: { title: string; intro: string; tiles: Tile[]; eyebrow?: string }) {
  const { tr } = useLang();
  const filters = useMemo(() => {
    const set = new Set<string>();
    tiles.forEach((t) => t.kicker.split(' · ').forEach((k) => k && set.add(k)));
    return [ALL, FREE, ...[...set].slice(0, 8)];
  }, [tiles]);
  const [filter, setFilter] = useState(ALL);
  const shown = tiles.filter((t) => filter === ALL || (filter === FREE ? t.free : t.kicker.includes(filter)));
  const images = tiles.filter((t) => t.image).map((t) => t.image as string);
  const poster = tiles[0]?.type === 'heros';

  return (
    <div>
      <section className="relative flex min-h-[62svh] items-end overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 gap-2 opacity-35 md:grid-cols-6">
          {[...images, ...images, ...images].slice(0, 12).map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: i * 0.05 }}
              className="overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover object-[50%_25%] grayscale-[35%]" />
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/40" />
        <div className="relative w-full px-5 pb-14 pt-40 md:px-14">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold tracking-[0.3em] text-gold">
            {eyebrow ?? `${tiles.length} ${tr('RÉCITS', 'STORIES')}`}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-gold-gradient is-animated mt-3 font-display text-5xl font-black leading-none md:text-8xl"
          >
            {title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-5 max-w-2xl text-base text-text/90 md:text-xl">
            {intro}
          </motion.p>
        </div>
      </section>

      <div className="sticky top-0 z-30 border-y border-ivory/10 bg-ink/85 backdrop-blur-xl md:top-[88px]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3 md:px-14">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-xs font-bold tracking-wider transition ${filter === f ? 'text-ink' : 'text-body hover:text-ivory'}`}
            >
              {filter === f && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-gold" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative">{f === ALL ? tr('TOUT', 'ALL') : f === FREE ? tr('GRATUIT', 'FREE') : f}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className={`grid gap-5 px-5 py-12 md:px-14 ${poster ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {shown.map((t, i) => (
          <motion.div
            key={`${t.type}:${t.slug}`}
            layout
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(i, 10) * 0.05 }}
          >
            <TitleCard tile={t} />
          </motion.div>
        ))}
      </motion.div>
      {shown.length === 0 && <p className="px-5 pb-10 text-muted md:px-14">{tr('Aucun récit pour ce filtre.', 'No story for this filter.')}</p>}
    </div>
  );
}
