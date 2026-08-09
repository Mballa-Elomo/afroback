'use client';

import { useState } from 'react';
import { colors, fonts } from '@/lib/theme';
import { LANGUES_VIDEO } from '@/lib/langues';
import { MediaUploadSlot } from './MediaUploadSlot';
import { ChapterVideoGrid } from './ChapterVideoGrid';
import { RecitDrawer } from './RecitDrawer';
import { StatusBadge } from './StatusBadge';
import type { ChapitreStoryboard, RecitChapitre, VideoChapitreAdmin } from '@/lib/data/heros';
import type { VideoChapterEngagementRow } from '@/lib/data/engagement';

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: 11,
  letterSpacing: '.08em',
  color: colors.textMuted,
  marginBottom: 10,
};

/**
 * Regroupe TOUT le contenu qui dépend d'une langue (audio, vidéo par
 * chapitre, récit) derrière un seul sélecteur de langue, plutôt que 3
 * panneaux séparés où chaque section répète FR/EN chacune à sa façon —
 * demande de Yannick le 2026-08-09 pour désencombrer la fiche héros : on
 * choisit une langue une fois, tout ce qu'il y a à corriger pour cette
 * langue est au même endroit.
 *
 * Les onglets viennent de `LANGUES_VIDEO` (lib/langues.ts) — déjà la liste
 * la plus extensible des trois puisque la vidéo par chapitre est stockée en
 * jsonb libre. L'audio (`narration_audio_fr_url`/`_en_url`) et le récit
 * (`recit_fr_texte`/`recit_en_texte`) restent, eux, limités à des colonnes
 * FR/EN fixes en base (décision volontairement pas prise en même temps que
 * la vidéo, voir la conversation du 2026-08-09) : un onglet au-delà de
 * FR/EN affiche donc la vidéo normalement mais explique que l'audio et le
 * récit n'ont pas encore de colonne dédiée, plutôt que de planter ou de
 * faire semblant.
 */
export function HeroLanguageContent({
  slug,
  audio,
  videoChapitres,
  videoEngagementRows,
  chapitresStoryboard,
  recitChapitresEn,
  recitFr,
  recitEn,
}: {
  slug: string;
  audio: {
    fr: { present: boolean; engagementCount: number };
    en: { present: boolean; engagementCount: number };
  };
  videoChapitres: VideoChapitreAdmin[];
  videoEngagementRows: VideoChapterEngagementRow[];
  /** Titres par défaut des chapitres, en français — voir ChapterVideoGrid.tsx. */
  chapitresStoryboard: ChapitreStoryboard[];
  /** Titres par défaut des chapitres, en anglais (déjà traduits) — voir ChapterVideoGrid.tsx. */
  recitChapitresEn: RecitChapitre[] | null;
  recitFr: string;
  recitEn: string | null;
}) {
  const [active, setActive] = useState(LANGUES_VIDEO[0]?.code ?? 'fr');
  const activeLangue = LANGUES_VIDEO.find((l) => l.code === active);
  const activeLabel = activeLangue?.label ?? active;
  const isFr = active === 'fr';
  const isEn = active === 'en';

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {LANGUES_VIDEO.map((l) => (
          <button key={l.code} type="button" onClick={() => setActive(l.code)} style={tabStyle(l.code === active)}>
            {l.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={sectionTitleStyle}>NARRATION AUDIO</div>
          {isFr || isEn ? (
            <MediaUploadSlot
              slug={slug}
              kind={isFr ? 'audioFr' : 'audioEn'}
              label={`Audio ${activeLabel}`}
              hint="MP3 · narration"
              present={audio[isFr ? 'fr' : 'en'].present}
              engagementCount={audio[isFr ? 'fr' : 'en'].engagementCount}
            />
          ) : (
            <EmptyNote text={`Audio ${activeLabel} non disponible pour l'instant — nécessite une évolution du modèle de données (colonne dédiée), pas encore faite.`} />
          )}
        </div>

        <div>
          <div style={sectionTitleStyle}>VIDÉO PAR CHAPITRE</div>
          <ChapterVideoGrid
            slug={slug}
            videoChapitres={videoChapitres}
            engagementRows={videoEngagementRows}
            chapitresStoryboard={chapitresStoryboard}
            recitChapitresEn={recitChapitresEn}
            lang={active}
            label={activeLabel}
          />
        </div>

        <div>
          <div style={sectionTitleStyle}>RÉCIT</div>
          {isFr && <RecitRow slug={slug} lang="fr" label={`Récit ${activeLabel}`} text={recitFr} />}
          {isEn &&
            (recitEn !== null ? (
              <RecitRow slug={slug} lang="en" label={`Récit ${activeLabel}`} text={recitEn} />
            ) : (
              <EmptyNote text="Aucun récit EN enregistré pour l'instant." />
            ))}
          {!isFr && !isEn && (
            <EmptyNote text={`Récit ${activeLabel} non disponible pour l'instant — nécessite une évolution du modèle de données (colonne dédiée), pas encore faite.`} />
          )}
        </div>
      </div>
    </div>
  );
}

function tabStyle(isActive: boolean): React.CSSProperties {
  return {
    font: 'inherit',
    fontSize: 12.5,
    fontWeight: 700,
    padding: '9px 20px',
    borderRadius: 10,
    border: `1px solid ${isActive ? colors.accentGold : colors.border}`,
    background: isActive ? `linear-gradient(135deg, rgba(240,195,107,.18), rgba(139,90,43,.12))` : 'transparent',
    color: isActive ? colors.textHeading : colors.textMutedAlt,
    cursor: 'pointer',
  };
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div
      style={{
        border: `1px dashed ${colors.border}`,
        borderRadius: 10,
        padding: '11px 13px',
        fontSize: 11.5,
        color: colors.textFaint,
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}

function RecitRow({ slug, lang, label, text }: { slug: string; lang: 'fr' | 'en'; label: string; text: string }) {
  return (
    <RecitDrawer
      slug={slug}
      lang={lang}
      title={label}
      text={text}
      trigger={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: colors.row, border: `1px solid ${colors.border}`, borderRadius: 9, padding: '11px 13px' }}>
          <span>📖</span>
          <span style={{ flex: 1, fontSize: 12.5 }}>{label}</span>
          {text ? <span style={{ color: colors.accentGold }}>›</span> : <StatusBadge label="ABSENT" tone="warning" />}
        </div>
      }
    />
  );
}
