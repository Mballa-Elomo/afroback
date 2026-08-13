'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { colors, fonts } from '@/lib/theme';
import { removeMytheChapterVideo, updateMytheChapterTitle } from '@/app/(admin)/mythologie/[slug]/actions';
import type { VideoLang } from '@/lib/uploadMedia';
import type { VideoChapitreAdmin } from '@/lib/data/mythologie';
import type { MytheVideoChapterEngagementRow } from '@/lib/data/mythologieEngagement';
import { ConfirmModal } from './ConfirmModal';

/** Copie de ChapterVideoGrid.tsx (héros) pour Mythologie — un mythe a toujours 4 chapitres (recit_chapitres_fr), même structure. */
const CHAPTERS = [1, 2, 3, 4] as const;

function chapterFor(list: VideoChapitreAdmin[], numero: number): VideoChapitreAdmin {
  return list.find((c) => c.numero === numero) ?? { numero, titre_chapitre: '' };
}

export function MythologieChapterVideoGrid({
  slug,
  videoChapitres,
  engagementRows,
  chapitresTitresFr,
  chapitresTitresEn,
  lang,
  label,
}: {
  slug: string;
  videoChapitres: VideoChapitreAdmin[];
  engagementRows: MytheVideoChapterEngagementRow[];
  /** Titres par défaut FR — repris de `recit_chapitres_fr` (toujours peuplé). */
  chapitresTitresFr: { numero: number; titre: string }[];
  /** Titres par défaut EN — repris de `recit_chapitres_en` (vide tant qu'aucune traduction n'existe). */
  chapitresTitresEn: { numero: number; titre: string }[];
  lang: string;
  label: string;
}) {
  const readyCount = videoChapitres.filter((c) => c.videos?.[lang]).length;
  const engagementMap = new Map<number, number>();
  for (const row of engagementRows) if (row.langue === lang) engagementMap.set(row.chapitre_numero, row.visionnages);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.5, margin: 0 }}>
          Le mythe est découpé en 4 chapitres ; chaque chapitre peut avoir sa vidéo en {label.toLowerCase()}.
        </p>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textMuted, flex: 'none', marginLeft: 12 }}>
          {readyCount} / {CHAPTERS.length} en ligne
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CHAPTERS.map((numero) => {
          const chapter = chapterFor(videoChapitres, numero);
          const titreParDefaut =
            (lang === 'fr' ? chapitresTitresFr : chapitresTitresEn).find((c) => c.numero === numero)?.titre ?? '';
          const titre = chapter.titre_chapitre || titreParDefaut;
          return (
            <div key={numero} style={{ background: colors.panelDeep, border: `1px solid ${colors.borderHairline}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.accentGoldAlt, flex: 'none' }}>CHAP. {numero}</span>
                <ChapterTitleInput slug={slug} numero={numero} titre={titre} />
              </div>
              <ChapterVideoCell
                slug={slug}
                numero={numero}
                lang={lang}
                label={label}
                url={chapter.videos?.[lang]}
                visionnages={engagementMap.get(numero) ?? 0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChapterTitleInput({ slug, numero, titre }: { slug: string; numero: number; titre: string }) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(titre);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (value === titre) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set('titre_chapitre', value);
      const res = await updateMytheChapterTitle(slug, numero, fd);
      if (!res.error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        placeholder="Titre du chapitre"
        disabled={pending}
        style={{
          flex: 1,
          background: '#170f0a',
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          padding: '7px 10px',
          color: colors.textPrimary,
          fontSize: 12.5,
          outline: 'none',
        }}
      />
      {saved && <span style={{ fontSize: 10.5, color: colors.positive }}>✓</span>}
    </div>
  );
}

function ChapterVideoCell({
  slug,
  numero,
  lang,
  label,
  url,
  visionnages,
}: {
  slug: string;
  numero: number;
  lang: VideoLang;
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
        fd.set('chapterNum', String(numero));
        fd.set('lang', lang);
        fd.set('file', file);
        const res = await fetch(`/api/mythologie/${slug}/chapter-video`, { method: 'POST', body: fd }).then((r) => r.json());
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
          gap: 8,
          border: `1px dashed ${colors.borderStrong}`,
          borderRadius: 9,
          padding: '9px 11px',
          cursor: pending ? 'default' : 'pointer',
          opacity: pending ? 0.6 : 1,
        }}
      >
        <span style={{ fontSize: 13 }}>⬆</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 9.5, color: colors.textMuted }}>
            {pending ? 'Envoi…' : present ? `👁 ${visionnages.toLocaleString('fr-FR')} visionnage${visionnages === 1 ? '' : 's'}` : 'MP4'}
          </div>
        </div>
        <span style={{ fontFamily: fonts.mono, fontSize: 8.5, fontWeight: 700, color: present ? colors.positive : colors.terracottaTextAlt }}>
          {present ? 'EN LIGNE' : 'À PRODUIRE'}
        </span>
      </div>
      <input ref={inputRef} type="file" accept="video/mp4" style={{ display: 'none' }} onChange={(e) => onPick(e.target.files?.[0])} />
      {error && <div style={{ fontSize: 10, color: colors.terracottaText, marginTop: 4 }}>{error}</div>}
      {present && (
        <div style={{ marginTop: 4 }}>
          <ConfirmModal
            trigger={<span style={{ fontSize: 9.5, color: colors.textFaint, cursor: 'pointer', textDecoration: 'underline' }}>Retirer</span>}
            title="Retirer cette vidéo ?"
            description="Le fichier reste dans le stockage, mais l'app mobile ne l'affichera plus pour ce chapitre tant qu'une vidéo n'est pas ré-uploadée."
            confirmLabel="Retirer"
            onConfirm={() => removeMytheChapterVideo(slug, numero, lang)}
          />
        </div>
      )}
    </div>
  );
}
