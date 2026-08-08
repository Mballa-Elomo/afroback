'use client';

import { useEffect } from 'react';
import { colors, fonts } from '@/lib/theme';

/**
 * Filet de sécurité final pour toute la zone admin : si malgré les
 * try/catch dans les actions et les composants (voir MediaUploadSlot,
 * ChapterVideoGrid, ConfirmModal, HeroDetailActions...) une erreur
 * imprévue remonte quand même jusqu'ici, l'admin voit un écran de
 * récupération au lieu de l'overlay de crash brut de Next.js — un outil
 * d'administration ne doit jamais rester bloqué sur une page cassée.
 * Ajouté le 2026-08-06 après le crash réel de HeroDetailPage lors d'un
 * upload audio (voir lib/supabase/middleware.ts pour le correctif de fond).
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Erreur back-office :', error);
  }, [error]);

  return (
    <div style={{ padding: '60px 28px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
      <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.textHeading, marginBottom: 8 }}>
        Une erreur inattendue est survenue
      </div>
      <p style={{ fontSize: 13, color: colors.textMutedAlt, maxWidth: 420, margin: '0 auto 22px', lineHeight: 1.6 }}>
        {error.message || 'Rien de plus précis à afficher — réessaie ; si ça persiste, note ce que tu faisais.'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          font: 'inherit',
          fontSize: 13,
          fontWeight: 700,
          padding: '11px 22px',
          borderRadius: 10,
          border: 'none',
          background: `linear-gradient(135deg, ${colors.accentGoldBright}, ${colors.terracotta})`,
          color: colors.ctaTextOnGold,
          cursor: 'pointer',
        }}
      >
        Réessayer
      </button>
    </div>
  );
}
