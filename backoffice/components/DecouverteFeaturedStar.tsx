'use client';

import { useState, useTransition } from 'react';
import { colors } from '@/lib/theme';
import { toggleDecouverteFeatured } from '@/app/(admin)/decouverte/[slug]/actions';

/** Copie de FeaturedStar.tsx (héros) pour Découverte — slot "à la une" indépendant, voir toggleDecouverteFeatured. */
export function DecouverteFeaturedStar({ slug, on, publie }: { slug: string; on: boolean; publie: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const disabled = pending || (!on && !publie);

  return (
    <span
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        startTransition(async () => {
          try {
            setError(false);
            await toggleDecouverteFeatured(slug);
          } catch {
            setError(true);
          }
        });
      }}
      title={error ? 'Échec, réessaie' : !on && !publie ? 'Dépubliée — publie-la avant de la mettre à la une' : on ? 'Retirer de la une' : 'Mettre à la une'}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 18,
        color: error ? colors.terracottaTextAlt : on ? colors.accentGoldBright : colors.textFaint,
        opacity: pending ? 0.5 : !on && !publie ? 0.35 : 1,
      }}
    >
      {error ? '⚠' : on ? '★' : '☆'}
    </span>
  );
}
