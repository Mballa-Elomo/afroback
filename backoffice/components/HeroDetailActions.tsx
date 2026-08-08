'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { colors } from '@/lib/theme';
import { toggleFeatured, togglePublication, archiveHero } from '@/app/(admin)/heros/actions';
import { ConfirmModal } from './ConfirmModal';

export function HeroTopActions({ slug, aLaUne, publie }: { slug: string; aLaUne: boolean; publie: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<void>) => {
    if (pending) return;
    startTransition(async () => {
      try {
        setError(null);
        await action();
      } catch (e) {
        // Jamais planter la fiche héros pour un toggle raté (réseau,
        // timeout...) — message affiché sous les boutons, l'admin réessaie.
        setError(e instanceof Error ? e.message : 'Échec, réessaie.');
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <button
        onClick={() => run(() => toggleFeatured(slug))}
        disabled={pending}
        style={{
          font: 'inherit',
          fontSize: 12.5,
          fontWeight: 700,
          padding: '10px 16px',
          borderRadius: 10,
          border: `1px solid ${colors.borderStrong}`,
          background: aLaUne ? 'rgba(240,195,107,.14)' : 'transparent',
          color: colors.accentGold,
          cursor: pending ? 'default' : 'pointer',
        }}
      >
        {aLaUne ? '★ Retirer de la une' : '☆ Mettre à la une'}
      </button>
      <button
        onClick={() => run(() => togglePublication(slug))}
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

export function ArchiveHeroButton({ slug, nom }: { slug: string; nom: string }) {
  const router = useRouter();
  return (
    <ConfirmModal
      trigger={
        <button
          style={{
            font: 'inherit',
            fontSize: 12,
            fontWeight: 700,
            padding: '10px 16px',
            borderRadius: 9,
            border: '1px solid rgba(139,58,47,.5)',
            background: 'rgba(139,58,47,.12)',
            color: colors.terracottaText,
            cursor: 'pointer',
          }}
        >
          Dépublier &amp; archiver ce héros…
        </button>
      }
      title="Dépublier & archiver ?"
      description={`« ${nom} » sera retiré du catalogue visible dans l'app grand public. Ses données et médias sont conservés — republiable à tout moment depuis cette même fiche.`}
      confirmLabel="Dépublier & archiver"
      onConfirm={async () => {
        await archiveHero(slug);
        router.refresh();
      }}
    />
  );
}
