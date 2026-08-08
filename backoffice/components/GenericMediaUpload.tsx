'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/theme';
import type { MediaSlot } from '@/lib/uploadMedia';

const SLOTS: { id: MediaSlot; label: string }[] = [
  { id: 'photo', label: 'Photo catalogue' },
  { id: 'audioFr', label: 'Audio FR' },
  { id: 'audioEn', label: 'Audio EN' },
  { id: 'video', label: 'Vidéo' },
];

export function GenericMediaUpload({ heroes }: { heroes: { slug: string; nom_affiche: string }[] }) {
  const router = useRouter();
  const [heroSlug, setHeroSlug] = useState(heroes[0]?.slug ?? '');
  const [slot, setSlot] = useState<MediaSlot>('photo');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (file: File | undefined) => {
    if (!file || !heroSlug) return;
    setError(null);
    startTransition(async () => {
      try {
        // Route Handler (pas une Server Action) — voir lib/uploadMedia.ts.
        const fd = new FormData();
        fd.set('kind', slot);
        fd.set('file', file);
        const res = await fetch(`/api/heros/${heroSlug}/media`, { method: 'POST', body: fd }).then((r) => r.json());
        if (res.error) setError(res.error);
        else router.refresh();
      } catch {
        setError("Échec de l'upload (connexion interrompue). Réessaie.");
      } finally {
        if (inputRef.current) inputRef.current.value = '';
      }
    });
  };

  const selectStyle: React.CSSProperties = {
    background: '#170f0a',
    border: `1px solid ${colors.border}`,
    borderRadius: 9,
    padding: '9px 11px',
    color: colors.textPrimary,
    fontSize: 12.5,
    outline: 'none',
  };

  return (
    <div
      style={{
        border: `2px dashed ${colors.borderStrong}`,
        borderRadius: 16,
        padding: 24,
        textAlign: 'center',
        background: colors.panelDeep,
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={heroSlug} onChange={(e) => setHeroSlug(e.target.value)} style={selectStyle}>
          {heroes.map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.nom_affiche}
            </option>
          ))}
        </select>
        <select value={slot} onChange={(e) => setSlot(e.target.value as MediaSlot)} style={selectStyle}>
          {SLOTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div onClick={() => inputRef.current?.click()} style={{ cursor: pending ? 'default' : 'pointer' }}>
        <div style={{ fontSize: 38, opacity: 0.5 }}>⬆</div>
        <div style={{ fontWeight: 600, fontSize: 14, color: colors.textHeading, marginTop: 10 }}>
          {pending ? 'Envoi en cours…' : 'Cliquer pour choisir un fichier'}
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>jpg · png · webp (image) · mp3 (audio) · mp4 (vidéo)</div>
      </div>
      <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={(e) => onPick(e.target.files?.[0])} />
      {error && <div style={{ fontSize: 12, color: colors.terracottaText, marginTop: 12 }}>{error}</div>}
    </div>
  );
}
