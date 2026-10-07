'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { Tile } from '@/lib/types';
import { TitleCard } from './TitleCard';
import { useLang } from '@/lib/lang-client';

/* ------------------------------------------------------------------ */
/* Classement « Les plus suivis » (vraies statistiques, aucun chiffre    */
/* inventé) : grands numéros dorés en relief derrière les posters.       */
/* ------------------------------------------------------------------ */
export function TopRanked({ tiles }: { tiles: Tile[] }) {
  const { tr } = useLang();
  if (tiles.length < 3) return null;
  return (
    <section className="relative my-16 md:my-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-6 px-5 md:px-14"
      >
        <p className="text-xs font-bold tracking-[0.3em] text-gold">{tr('EN CE MOMENT SUR AFROBACK', 'TRENDING ON AFROBACK')}</p>
        <h2 className="mt-2 font-display text-3xl font-black text-heading md:text-5xl">{tr('Les plus suivis', 'Most followed')}</h2>
      </motion.div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-6 md:px-14">
        {tiles.map((t, i) => (
          <motion.div
            key={`${t.type}:${t.slug}`}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.09, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex shrink-0 items-end"
          >
            <span
              className="relative z-0 -mr-6 select-none font-display text-[150px] font-black leading-[0.8] text-transparent md:-mr-8 md:text-[210px]"
              style={{ WebkitTextStroke: '3px rgba(240,195,107,0.55)' }}
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="relative z-10 w-40 md:w-48">
              <TitleCard tile={t} variant="poster" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Les 3 univers : panneaux qui s'ouvrent au survol (accordéon visuel).  */
/* ------------------------------------------------------------------ */
type Universe = { href: string; title: string; text: string; count: string; image: string | null };

export function Universes({ items }: { items: Universe[] }) {
  const { tr } = useLang();
  const [active, setActive] = useState(0);
  return (
    <section className="my-20 px-5 md:my-28 md:px-14">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <p className="text-xs font-bold tracking-[0.3em] text-gold">{tr('TROIS PORTES VERS LES ORIGINES', 'THREE DOORS TO THE ROOTS')}</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-black text-heading md:text-5xl">{tr('Choisis ton voyage', 'Choose your journey')}</h2>
      </motion.div>
      <div className="mt-10 flex h-[560px] flex-col gap-3 md:h-[520px] md:flex-row">
        {items.map((u, i) => {
          const isActive = active === i;
          return (
            <motion.div
              key={u.href}
              layout
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              animate={{ flex: isActive ? 3.2 : 1 }}
              transition={{ type: 'spring', stiffness: 160, damping: 24 }}
              className="relative min-h-0 overflow-hidden rounded-3xl ring-1 ring-ivory/10"
            >
              <Link href={u.href} className="absolute inset-0" aria-label={u.title}>
                {u.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <motion.img
                    src={u.image}
                    alt=""
                    animate={{ scale: isActive ? 1.06 : 1.25 }}
                    transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
                    className="absolute inset-0 h-full w-full object-cover object-[50%_25%]"
                  />
                )}
                <span className={`absolute inset-0 transition duration-700 ${isActive ? 'bg-gradient-to-t from-ink via-ink/40 to-transparent' : 'bg-ink/65'}`} />
                <span className="absolute inset-x-6 bottom-6 md:inset-x-8 md:bottom-8">
                  <span className="text-xs font-bold tracking-[0.25em] text-gold">{u.count}</span>
                  <span className={`mt-1 block font-display font-black text-ivory transition-all duration-500 ${isActive ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'}`}>
                    {u.title}
                  </span>
                  <motion.span
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 12 }}
                    transition={{ duration: 0.4, delay: isActive ? 0.2 : 0 }}
                    className="mt-3 block max-w-md text-sm leading-relaxed text-text md:text-base"
                  >
                    {u.text}
                  </motion.span>
                  <motion.span
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.4, delay: isActive ? 0.3 : 0 }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-ink"
                  >
                    {tr('Explorer →', 'Explore →')}
                  </motion.span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Manifeste : texte qui s'éclaire mot à mot au défilement.              */
/* ------------------------------------------------------------------ */
export function Manifesto() {
  const { tr } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 40%'] });
  const text = tr(
    'Avant les livres, il y avait la parole. Des rois, des reines, des résistants, des peuples entiers dont les noms ont traversé les siècles de bouche à oreille. AFROBACK leur rend leur voix.',
    'Before books, there was the spoken word. Kings, queens, resisters, whole peoples whose names crossed the centuries by word of mouth. AFROBACK gives them back their voice.',
  );
  const words = text.split(' ');
  return (
    <section ref={ref} className="relative my-24 overflow-hidden py-20 md:my-32 md:py-28">
      <div className="bg-pattern absolute inset-0 opacity-[0.05]" />
      <div className="relative mx-auto max-w-5xl px-5 md:px-14">
        <p className="mb-8 text-xs font-bold tracking-[0.3em] text-gold">{tr('RETOUR AUX ORIGINES', 'BACK TO THE ROOTS')}</p>
        <p className="font-display text-3xl font-bold leading-[1.25] md:text-5xl">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {w}
            </Word>
          ))}
        </p>
      </div>
    </section>
  );
}

function Word({ children, progress, range }: { children: string; progress: ReturnType<typeof useScroll>['scrollYProgress']; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const color = useTransform(progress, range, ['#8c7b67', '#fff4e0']);
  return (
    <motion.span style={{ opacity, color }} className="mr-[0.28em] inline-block">
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Bandeau défilant des noms (marquee).                                  */
/* ------------------------------------------------------------------ */
export function NamesMarquee({ names }: { names: string[] }) {
  const line = [...names, ...names];
  return (
    <div className="relative my-10 overflow-hidden border-y border-gold/15 py-5">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
        {line.map((n, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl font-bold text-ivory/30 md:text-4xl">
            {n}
            <span className="text-gold">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
