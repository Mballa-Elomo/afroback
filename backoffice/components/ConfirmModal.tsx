'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { colors, fonts } from '@/lib/theme';

/**
 * Modale de confirmation générique, réutilisée pour TOUTE action destructive
 * ou difficile à revenir en arrière (dépublier & archiver un héros, retirer
 * un média déjà en ligne...). Demande explicite de Yannick (2026-08-05) :
 * aucune action de ce type n'écrit en base sans une confirmation explicite
 * dans l'UI elle-même — jamais juste "fait confiance" au clic initial.
 */
export function ConfirmModal({
  trigger,
  title,
  description,
  confirmLabel,
  dangerous = true,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  dangerous?: boolean;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ display: 'inline-block' }}>
        {trigger}
      </span>
      {open && (
        <div
          onClick={() => !pending && setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(6,4,2,.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#160f0a',
              border: `1px solid ${dangerous ? 'rgba(139,58,47,.5)' : colors.borderStrong}`,
              borderRadius: 18,
              padding: 26,
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 12 }}>{dangerous ? '⚠️' : 'ℹ️'}</div>
            <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.textHeading, marginBottom: 8 }}>{title}</div>
            <p style={{ fontSize: 13, color: colors.textMutedAlt, lineHeight: 1.6, margin: '0 0 22px' }}>{description}</p>
            {error && <p style={{ fontSize: 12.5, color: '#E3A277', margin: '-10px 0 16px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                disabled={pending}
                style={{
                  font: 'inherit',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '11px 20px',
                  borderRadius: 11,
                  border: `1px solid ${colors.borderStrong}`,
                  background: 'none',
                  color: colors.textBody,
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                onClick={() =>
                  startTransition(async () => {
                    try {
                      setError(null);
                      await onConfirm();
                      setOpen(false);
                    } catch (e) {
                      // Jamais laisser une action ratée (réseau, timeout...)
                      // planter la page qui a ouvert cette modale — message
                      // affiché ici, la modale reste ouverte pour réessayer.
                      setError(e instanceof Error ? e.message : "Échec de l'action, réessaie.");
                    }
                  })
                }
                disabled={pending}
                style={{
                  font: 'inherit',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '11px 20px',
                  borderRadius: 11,
                  border: 'none',
                  background: dangerous ? '#8B3A2F' : `linear-gradient(135deg, ${colors.accentGoldBright}, ${colors.terracotta})`,
                  color: dangerous ? '#F7E7C8' : colors.ctaTextOnGold,
                  cursor: pending ? 'default' : 'pointer',
                  opacity: pending ? 0.6 : 1,
                }}
              >
                {pending ? 'Un instant…' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
