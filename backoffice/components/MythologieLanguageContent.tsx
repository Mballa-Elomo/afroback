'use client';

import { useState } from 'react';
import { colors, fonts } from '@/lib/theme';
import { LANGUES_VIDEO } from '@/lib/langues';
import { MythologieMediaSlot } from './MythologieMediaSlot';
import { MythologieChapterVideoGrid } from './MythologieChapterVideoGrid';
import { MytheChapitreDrawer } from './MytheChapitreDrawer';
import { StatusBadge } from './StatusBadge';
import type { MytheChapitre } from '@/lib/data/mythologie';
import type { MytheVideoChapterEngagementRow } from '@/lib/data/mythologieEngagement';
import type { VideoChapitreAdmin } from '@/lib/data/mythologie';

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: 11,
  letterSpacing: '.08em',
  color: colors.textMuted,
  marginBottom: 10,
};

/**
 * Copie de HeroLanguageContent.tsx pour Mythologie — même principe (un
 * sélecteur de langue, tout le contenu qui en dépend au même endroit).
 * Contrairement aux héros, `recit_chapitres_en` peut être un tableau vide
 * (aucun mythe traduit à ce jour) : l'onglet EN affiche alors 4 chapitres
 * vides, éditables directement (saveMytheChapitre crée l'entrée à la volée).
 */
export function MythologieLanguageContent({
  slug,
  audio,
  videoChapitres,
  videoEngagementRows,
  recitChapitresFr,
  recitChapitresEn,
}: {
  slug: string;
  audio: {
    fr: { present: boolean };
    en: { present: boolean };
  };
  videoChapitres: VideoChapitreAdmin[];
  videoEngagementRows: MytheVideoChapterEngagementRow[];
  recitChapitresFr: MytheChapitre[];
  recitChapitresEn: MytheChapitre[];
}) {
  const [active, setActive] = useState(LANGUES_VIDEO[0]?.code ?? 'fr');
  const activeLangue = LANGUES_VIDEO.find((l) => l.code === active);
  const activeLabel = activeLangue?.label ?? active;
  const isFr = active === 'fr';
  const isEn = active === 'en';
  const chapitresTitresFr = recitChapitresFr.map((c) => ({ numero: c.numero, titre: c.titre }));
  const chapitresTitresEn = recitChapitresEn.map((c) => ({ numero: c.numero, titre: c.titre }));

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
            <MythologieMediaSlot
              slug={slug}
              kind={isFr ? 'audioFr' : 'audioEn'}
              label={`Audio ${activeLabel}`}
              hint="MP3 · narration"
              present={audio[isFr ? 'fr' : 'en'].present}
            />
          ) : (
            <EmptyNote text={`Audio ${activeLabel} non disponible pour l'instant — nécessite une évolution du modèle de données (colonne dédiée), pas encore faite.`} />
          )}
        </div>

        <div>
          <div style={sectionTitleStyle}>VIDÉO PAR CHAPITRE</div>
          <MythologieChapterVideoGrid
            slug={slug}
            videoChapitres={videoChapitres}
            engagementRows={videoEngagementRows}
            chapitresTitresFr={chapitresTitresFr}
            chapitresTitresEn={chapitresTitresEn}
            lang={active}
            label={activeLabel}
          />
        </div>

        <div>
          <div style={sectionTitleStyle}>RÉCIT — 4 CHAPITRES</div>
          {isFr || isEn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3, 4].map((numero) => {
                const source = isFr ? recitChapitresFr : recitChapitresEn;
                const chapitre = source.find((c) => c.numero === numero) ?? { numero, titre: '', texte: '' };
                return (
                  <ChapitreRow
                    key={numero}
                    slug={slug}
                    numero={numero}
                    lang={isFr ? 'fr' : 'en'}
                    label={`Chapitre ${numero}${activeLabel ? ` (${activeLabel})` : ''}`}
                    titre={chapitre.titre}
                    texte={chapitre.texte}
                  />
                );
              })}
            </div>
          ) : (
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
    <div style={{ border: `1px dashed ${colors.border}`, borderRadius: 10, padding: '11px 13px', fontSize: 11.5, color: colors.textFaint, lineHeight: 1.5 }}>
      {text}
    </div>
  );
}

function ChapitreRow({
  slug,
  numero,
  lang,
  label,
  titre,
  texte,
}: {
  slug: string;
  numero: number;
  lang: 'fr' | 'en';
  label: string;
  titre: string;
  texte: string;
}) {
  return (
    <MytheChapitreDrawer
      slug={slug}
      numero={numero}
      lang={lang}
      panelTitle={label}
      titre={titre}
      texte={texte}
      trigger={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: colors.row, border: `1px solid ${colors.border}`, borderRadius: 9, padding: '11px 13px' }}>
          <span>📖</span>
          <span style={{ flex: 1, fontSize: 12.5 }}>
            {label}
            {titre ? ` — ${titre}` : ''}
          </span>
          {texte ? <span style={{ color: colors.accentGold }}>›</span> : <StatusBadge label="ABSENT" tone="warning" />}
        </div>
      }
    />
  );
}
