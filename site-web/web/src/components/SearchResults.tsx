'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Tile } from '@/lib/types';
import { TitleCard } from './TitleCard';
import { useLang } from '@/lib/lang-client';

/** Recherche instantanée sans accents (même logique que l'app), résultats en grille. */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function SearchResults({ tiles }: { tiles: Tile[] }) {
  const { tr } = useLang();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  useEffect(() => setQ(params.get('q') ?? ''), [params]);

  const results = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return tiles;
    return tiles.filter((t) => norm(`${t.title} ${t.kicker} ${t.meta} ${t.summary}`).includes(n));
  }, [q, tiles]);

  return (
    <div className="px-4 pb-10 pt-28 md:px-10 md:pt-32 xl:px-14">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
        placeholder={tr('Un héros, un mythe, un lieu…', 'A hero, a myth, a place…')}
        className="w-full max-w-2xl rounded-lg border border-gold/25 bg-surface px-5 py-4 text-lg text-text placeholder:text-muted focus:border-gold focus:outline-none"
        aria-label={tr('Rechercher', 'Search')}
      />
      <p className="mt-6 text-sm text-muted">
        {q.trim()
          ? tr(`${results.length} résultat${results.length > 1 ? 's' : ''} pour « ${q.trim()} »`, `${results.length} result${results.length > 1 ? 's' : ''} for “${q.trim()}”`)
          : tr('Tout le catalogue', 'The whole catalogue')}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {results.map((t) => (
          <TitleCard key={`${t.type}:${t.slug}`} tile={t} />
        ))}
      </div>
    </div>
  );
}
