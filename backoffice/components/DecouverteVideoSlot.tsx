'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { colors, fonts } from '@/lib/theme';
import { removeDecouverteVideo } from '@/app/(admin)/decouverte/[slug]/actions';
import { ConfirmModal } from './ConfirmModal';

/**
 * Vidéo d'une fiche Découverte pour UNE langue — pas de chapitres
 * (contrairement à héros/mythologie), donc pas de grille : un seul slot par
 * langue active, sur le modèle de ChapterVideoCell (ChapterVideoGrid.tsx)
 * sans la dimension chapitre.
 */
export function DecouverteVideoSlot({
  slug,
  lang,
  label,
  url,
  visionnages,
}: {
  slug: string;
  lang: string;
  label: string;
  url?: string;
  visionnages: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const present = !!url;

  const onPick = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set('lang', lang);
        fd.set('file', file);
        const res = await fetch(`/api/decouverte/${slug}/video`, { method: 'POST', body: fd }).then((r) => r.json());
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
        onClick={() => !pending && inputRef.current?.click()}
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
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>Vidéo {label}</div>
          <div style={{ fontSize: 10, color: colors.textMuted }}>
            {pending ? 'Envoi en cours…' : present ? `👁 ${visionnages.toLocaleString('fr-FR')} visionnage${visionnages === 1 ? '' : 's'}` : 'MP4'}
          </div>
        </div>
        <span style={{ fontFamily: fonts.mono, fontSize: 9, color: present ? colors.positive : colors.terracottaTextAlt }}>
          {present ? 'EN LIGNE' : 'À PRODUIRE'}
        </span>
      </div>
      <input ref={inputRef} type="file" accept="video/mp4" style={{ display: 'none' }} onChange={(e) => onPick(e.target.files?.[0])} />
      {error && <div style={{ fontSize: 11, color: colors.terracottaText, marginTop: 6 }}>{error}</div>}
      {present && (
        <div style={{ marginTop: 6 }}>
          <ConfirmModal
            trigger={<span style={{ fontSize: 10.5, color: colors.textFaint, cursor: 'pointer', textDecoration: 'underline' }}>Retirer cette vidéo</span>}
            title="Retirer cette vidéo ?"
            description="Le fichier reste dans le stockage, mais l'app mobile ne l'affichera plus tant qu'une vidéo n'est pas ré-uploadée ici."
            confirmLabel="Retirer"
            onConfirm={() => removeDecouverteVideo(slug, lang)}
          />
        </div>
      )}
    </div>
  );
}
