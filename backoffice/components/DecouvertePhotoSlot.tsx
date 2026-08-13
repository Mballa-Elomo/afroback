'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { colors, fonts } from '@/lib/theme';
import { removeDecouvertePhoto } from '@/app/(admin)/decouverte/[slug]/actions';
import { ConfirmModal } from './ConfirmModal';

/** Copie de MediaUploadSlot.tsx (héros), simplifiée : une fiche Découverte n'a qu'une photo, pas de variantes de slot. */
export function DecouvertePhotoSlot({ slug, present }: { slug: string; present: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onPick = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set('file', file);
        const res = await fetch(`/api/decouverte/${slug}/media`, { method: 'POST', body: fd }).then((r) => r.json());
        if (res.error) setError(res.error);
        else router.refresh();
      } catch {
        setError("Échec de l'upload (connexion interrompue). Réessaie.");
      } finally {
        if (inputRef.current) inputRef.current.value = '';
      }
    });
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          border: `1px dashed ${colors.borderStrong}`,
          borderRadius: 10,
          padding: '11px 13px',
          cursor: pending ? 'default' : 'pointer',
          opacity: pending ? 0.6 : 1,
        }}
      >
        <span style={{ fontSize: 15 }}>⬆</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>Photo</div>
          <div style={{ fontSize: 10, color: colors.textMuted }}>{pending ? 'Envoi en cours…' : 'JPG / PNG / WEBP'}</div>
        </div>
        <span style={{ fontFamily: fonts.mono, fontSize: 9, color: present ? colors.positive : colors.terracottaTextAlt }}>
          {present ? 'REMPLACER' : 'MANQUANTE'}
        </span>
      </div>
      <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={(e) => onPick(e.target.files?.[0])} />
      {error && <div style={{ fontSize: 11, color: colors.terracottaText, marginTop: 6 }}>{error}</div>}
      {present && (
        <div style={{ marginTop: 6 }}>
          <ConfirmModal
            trigger={<span style={{ fontSize: 10.5, color: colors.textFaint, cursor: 'pointer', textDecoration: 'underline' }}>Retirer cette photo</span>}
            title="Retirer cette photo ?"
            description="Le fichier reste dans le stockage, mais l'app mobile ne l'affichera plus tant qu'une photo n'est pas ré-uploadée ici."
            confirmLabel="Retirer"
            onConfirm={() => removeDecouvertePhoto(slug)}
          />
        </div>
      )}
    </div>
  );
}
