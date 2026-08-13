'use client';

import { useState, useTransition } from 'react';
import { colors } from '@/lib/theme';
import { toggleMytheFeatured, toggleMythePublication } from '@/app/(admin)/mythologie/[slug]/actions';

/** Copie de HeroTopActions (heros/HeroDetailActions.tsx) pour Mythologie — mêmes deux boutons, même logique de garde. */
export function MytheTopActions({ slug, aLaUne, publie }: { slug: string; aLaUne: boolean; publie: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<void>) => {
    if (pending) return;
    startTransition(async () => {
      try {
        setError(null);
        await action();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Échec, réessaie.');
      }
    });
  };

  const featuredToggleDisabled = pending || (!aLaUne && !publie);

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => run(() => toggleMytheFeatured(slug))}
          disabled={featuredToggleDisabled}
          title={!aLaUne && !publie ? 'Dépublié — publie-le avant de le mettre à la une' : undefined}
          style={{
            font: 'inherit',
            fontSize: 12.5,
            fontWeight: 700,
            padding: '10px 16px',
            borderRadius: 10,
            border: `1px solid ${colors.borderStrong}`,
            background: aLaUne ? 'rgba(240,195,107,.14)' : 'transparent',
            color: colors.accentGold,
            cursor: featuredToggleDisabled ? 'default' : 'pointer',
            opacity: featuredToggleDisabled && !pending ? 0.45 : 1,
          }}
        >
          {aLaUne ? '★ Retirer de la une' : '☆ Mettre à la une'}
        </button>
        <button
          onClick={() => run(() => toggleMythePublication(slug))}
          disabled={pending}
          style={{
            font: 'inherit',
            fontSize: 12.5,
            fontWeight: 700,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: publie ? colors.terracottaTextAlt : `linear-gradient(135deg, ${colors.accentGoldBright}, ${colors.terracotta})`,
            color: publie ? '#1a1109' : colors.ctaTextOnGold,
            cursor: pending ? 'default' : 'pointer',
          }}
        >
          {publie ? 'Dépublier' : 'Publier'}
        </button>
      </div>
      {error && <p style={{ fontSize: 11.5, color: colors.terracottaText, marginTop: 8 }}>{error}</p>}
    </div>
  );
}
