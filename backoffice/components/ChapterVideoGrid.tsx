'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { colors, fonts } from '@/lib/theme';
import { removeChapterVideo, updateChapterTitle } from '@/app/(admin)/heros/[slug]/actions';
import type { VideoLang } from '@/lib/uploadMedia';
import type { VideoChapitreAdmin } from '@/lib/data/heros';
// `import type` uniquement : erasé à la compilation, donc sûr à importer
// depuis un composant client même si `lib/data/engagement.ts` contient par
// ailleurs du code serveur (`getSupabaseAdmin`, `next/headers`) — on
// n'importe jamais une fonction de ce module ici, seulement sa forme de
// données. La `Map` elle-même n'est jamais passée en prop (non sérialisable
// à travers la frontière Server/Client Component) : on reçoit un tableau
// brut et on construit l'index localement.
import type { VideoChapterEngagementRow } from '@/lib/data/engagement';
import { ConfirmModal } from './ConfirmModal';

const CHAPTERS = [1, 2, 3, 4] as const;

function chapterFor(list: VideoChapitreAdmin[], numero: number): VideoChapitreAdmin {
  return list.find((c) => c.numero === numero) ?? { numero, titre_chapitre: '' };
}

export function ChapterVideoGrid({
  slug,
  videoChapitres,
  engagementRows,
}: {
  slug: string;
  videoChapitres: VideoChapitreAdmin[];
  /** Ajouté le 2026-08-06 (demande de Yannick) : visionnages réels par chapitre × langue. Tableau vide tant que `schema-engagement-detail.sql` n'est pas exécuté — chaque case affiche alors 0, jamais un chiffre inventé. */
  engagementRows: VideoChapterEngagementRow[];
}) {
  const readyCount = videoChapitres.reduce((n, c) => n + (c.video_url_fr ? 1 : 0) + (c.video_url_en ? 1 : 0), 0);
  const engagementMap = new Map<string, number>();
  for (const row of engagementRows) engagementMap.set(`${row.chapitre_numero}-${row.langue}`, row.visionnages);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontFamily: fonts.display, fontSize: 12, letterSpacing: '.1em', color: colors.accentGoldSoft }}>
          VIDÉOS — 4 CHAPITRES × 2 LANGUES
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textMuted }}>{readyCount} / 8 en ligne</div>
      </div>
      <p style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.5, margin: '0 0 14px' }}>
        Chaque histoire est découpée en 4 chapitres ; chaque chapitre peut avoir sa vidéo en français et en anglais.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {CHAPTERS.map((numero) => {
          const chapter = chapterFor(videoChapitres, numero);
          return (
            <div key={numero} style={{ background: colors.panelDeep, border: `1px solid ${colors.borderHairline}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.accentGoldAlt, flex: 'none' }}>CHAP. {numero}</span>
                <ChapterTitleInput slug={slug} numero={numero} titre={chapter.titre_chapitre} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <ChapterVideoCell slug={slug} numero={numero} lang="fr" label="Français" url={chapter.video_url_fr} visionnages={engagementMap.get(`${numero}-fr`) ?? 0} />
                <ChapterVideoCell slug={slug} numero={numero} lang="en" label="English" url={chapter.video_url_en} visionnages={engagementMap.get(`${numero}-en`) ?? 0} />
              </div>
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
      const res = await updateChapterTitle(slug, numero, fd);
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
        // Route Handler (pas une Server Action) — voir lib/uploadMedia.ts.
        const fd = new FormData();
        fd.set('chapterNum', String(numero));
        fd.set('lang', lang);
        fd.set('file', file);
        const res = await fetch(`/api/heros/${slug}/chapter-video`, { method: 'POST', body: fd }).then((r) => r.json());
        if (res.error) setError(res.error);
        else router.refresh();
      } catch {
        // Même filet que MediaUploadSlot.tsx : un échec réseau/timeout ne
        // doit jamais faire planter toute la fiche héros, juste afficher
        // un message ici.
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
            onConfirm={() => removeChapterVideo(slug, numero, lang)}
          />
        </div>
      )}
    </div>
  );
}
