'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { colors, fonts } from '@/lib/theme';
import { removeChapterVideo, updateChapterTitle } from '@/app/(admin)/heros/[slug]/actions';
import type { VideoLang } from '@/lib/uploadMedia';
import type { ChapitreStoryboard, RecitChapitre, VideoChapitreAdmin } from '@/lib/data/heros';
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

/**
 * Liste des 4 chapitres pour UNE langue à la fois — la langue vient d'en
 * dehors (onglet actif, voir HeroLanguageContent.tsx), ce composant ne
 * connaît pas `LANGUES_VIDEO` et n'affiche jamais plusieurs langues en même
 * temps. Avant le 2026-08-09, ce composant affichait toutes les langues
 * empilées sous chaque chapitre ; ça a été remonté d'un niveau (onglet de
 * langue partagé avec l'audio et le récit) pour que changer de langue montre
 * tout le contenu de cette langue au même endroit, plutôt que de forcer à
 * chercher la bonne colonne dans chaque section séparément.
 */
export function ChapterVideoGrid({
  slug,
  videoChapitres,
  engagementRows,
  chapitresStoryboard,
  recitChapitresEn,
  lang,
  label,
}: {
  slug: string;
  videoChapitres: VideoChapitreAdmin[];
  /** Ajouté le 2026-08-06 (demande de Yannick) : visionnages réels par chapitre × langue. Tableau vide tant que `schema-engagement-detail.sql` n'est pas exécuté — chaque case affiche alors 0, jamais un chiffre inventé. */
  engagementRows: VideoChapterEngagementRow[];
  /**
   * Titres du storyboard (pilier Histoires & Héros, déjà écrits pour les 4
   * chapitres par le griot/storyboardeur, en français) — sert de valeur par
   * défaut pour le titre de chapitre vidéo EN FRANÇAIS tant qu'il n'a jamais
   * été modifié ici. Dès qu'un titre est enregistré via `updateChapterTitle`,
   * il est stocké dans `video_chapitres[].titre_chapitre` et prend le dessus
   * pour toujours, quelle que soit la langue affichée (la dernière
   * modification gagne) — demande de Yannick le 2026-08-09.
   */
  chapitresStoryboard: ChapitreStoryboard[];
  /**
   * Titres des chapitres du récit EN ANGLAIS (`heros.recit_chapitres_en`) —
   * mêmes titres que le storyboard par construction (voir le commentaire de
   * `RecitChapitre` côté app mobile, `mobile-app/src/data/types.ts`), déjà
   * traduits et relus par le pipeline de traduction. Sert de valeur par
   * défaut pour l'onglet EN — jamais le titre français utilisé tel quel : si
   * aucune traduction n'existe encore pour ce chapitre, le champ reste vide
   * (placeholder) plutôt que d'afficher du français dans un champ "anglais",
   * ou d'inventer une traduction ici. `null`/absent tant que le récit EN
   * n'existe pas du tout pour ce héros.
   */
  recitChapitresEn: RecitChapitre[] | null;
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
          Chaque histoire est découpée en 4 chapitres ; chaque chapitre peut avoir sa vidéo en {label.toLowerCase()}.
        </p>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textMuted, flex: 'none', marginLeft: 12 }}>
          {readyCount} / {CHAPTERS.length} en ligne
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CHAPTERS.map((numero) => {
          const chapter = chapterFor(videoChapitres, numero);
          const titreStoryboardFr = chapitresStoryboard.find((c) => c.numero === numero)?.titre_chapitre ?? '';
          const titreParDefaut = lang === 'fr' ? titreStoryboardFr : (recitChapitresEn?.find((c) => c.numero === numero)?.titre ?? '');
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
