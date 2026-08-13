'use client';

import { useState } from 'react';
import { colors, fonts } from '@/lib/theme';
import { LANGUES_VIDEO } from '@/lib/langues';
import { DecouverteVideoSlot } from './DecouverteVideoSlot';
import { DecouverteTexteDrawer } from './DecouverteTexteDrawer';
import { StatusBadge } from './StatusBadge';

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: 11,
  letterSpacing: '.08em',
  color: colors.textMuted,
  marginBottom: 10,
};

/**
 * Copie de HeroLanguageContent.tsx pour Découverte, simplifiée : pas
 * d'audio ni de chapitres pour une fiche Découverte, seulement le texte
 * (déjà en base, `contenu_fr_texte`/`contenu_en_texte`) et une vidéo par
 * langue (ajoutée le 2026-08-12).
 */
export function DecouverteLanguageContent({
  slug,
  contenuFr,
  contenuEn,
  videos,
  videoEngagement,
}: {
  slug: string;
  contenuFr: string;
  contenuEn: string | null;
  videos: Record<string, string>;
  videoEngagement: { fr: number; en: number };
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
          <div style={sectionTitleStyle}>TEXTE</div>
          {isFr && <TexteRow slug={slug} lang="fr" label={`Texte ${activeLabel}`} text={contenuFr} />}
          {isEn &&
            (contenuEn !== null ? (
              <TexteRow slug={slug} lang="en" label={`Texte ${activeLabel}`} text={contenuEn} />
            ) : (
              <EmptyNote text="Aucun texte EN enregistré pour l'instant." />
            ))}
          {!isFr && !isEn && (
            <EmptyNote text={`Texte ${activeLabel} non disponible pour l'instant — nécessite une évolution du modèle de données (colonne dédiée), pas encore faite.`} />
          )}
        </div>

        <div>
          <div style={sectionTitleStyle}>VIDÉO</div>
          {isFr || isEn ? (
            <DecouverteVideoSlot
              slug={slug}
              lang={active}
              label={activeLabel}
              url={videos[active]}
              visionnages={isFr ? videoEngagement.fr : videoEngagement.en}
            />
          ) : (
            <EmptyNote text={`Vidéo ${activeLabel} non disponible pour l'instant.`} />
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

function TexteRow({ slug, lang, label, text }: { slug: string; lang: 'fr' | 'en'; label: string; text: string }) {
  return (
    <DecouverteTexteDrawer
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
