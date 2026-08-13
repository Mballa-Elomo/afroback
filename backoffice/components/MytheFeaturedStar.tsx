'use client';

import { useState, useTransition } from 'react';
import { colors } from '@/lib/theme';
import { toggleMytheFeatured } from '@/app/(admin)/mythologie/[slug]/actions';

/** Copie de FeaturedStar.tsx (héros) pour Mythologie — slot "à la une" indépendant, voir toggleMytheFeatured. */
export function MytheFeaturedStar({ slug, on, publie }: { slug: string; on: boolean; publie: boolean }) {
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
            await toggleMytheFeatured(slug);
          } catch {
            setError(true);
          }
        });
      }}
      title={error ? 'Échec, réessaie' : !on && !publie ? 'Dépublié — publie-le avant de le mettre à la une' : on ? 'Retirer de la une' : 'Mettre à la une'}
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
