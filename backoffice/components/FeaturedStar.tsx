'use client';

import { useState, useTransition } from 'react';
import { colors } from '@/lib/theme';
import { toggleFeatured } from '@/app/(admin)/heros/actions';

/**
 * `publie` grise l'étoile pour un héros dépublié : un héros retiré du
 * catalogue public ne peut pas être mis à la une (règle appliquée aussi
 * côté serveur dans `toggleFeatured`, voir actions.ts) — autant l'empêcher
 * ici plutôt que de laisser cliquer pour finir sur l'indicateur d'échec
 * générique "⚠" sans explication.
 */
export function FeaturedStar({ slug, on, publie }: { slug: string; on: boolean; publie: boolean }) {
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
            await toggleFeatured(slug);
          } catch {
            // Jamais planter la liste des héros pour un simple toggle raté —
            // l'icône reprend son état précédent, l'admin peut réessayer.
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
