'use client';

import { useState, useTransition } from 'react';
import { colors } from '@/lib/theme';
import { toggleFeatured } from '@/app/(admin)/heros/actions';

export function FeaturedStar({ slug, on }: { slug: string; on: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  return (
    <span
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (pending) return;
        startTransition(async () => {
          try {
            setError(false);
            await toggleFeatured(slug);
          } catch {
            // Jamais planter la liste des héros pour un simple toggle raté —
            // l'icône reprend son état précédent, l'admin peut réessayer.
            setError(true);
          }
        });
      }}
      title={error ? 'Échec, réessaie' : on ? 'Retirer de la une' : 'Mettre à la une'}
      style={{ cursor: 'pointer', fontSize: 18, color: error ? colors.terracottaTextAlt : on ? colors.accentGoldBright : colors.textFaint, opacity: pending ? 0.5 : 1 }}
    >
      {error ? '⚠' : on ? '★' : '☆'}
    </span>
  );
}
