'use client';

import { colors } from '@/lib/theme';
import { definirLienTeaser, retirerTeaser, type Teaser, type TeaserFormat, type TeaserLang, type TeaserType } from '@/lib/actionsTeaser';
import { LienVideoCellule } from './LienVideoCellule';

const LANGUES: { code: TeaserLang; nom: string }[] = [
  { code: 'fr', nom: 'Français' },
  { code: 'en', nom: 'Anglais' },
];
const FORMATS: { code: TeaserFormat; nom: string }[] = [
  { code: 'paysage', nom: 'paysage 16:9 (site)' },
  { code: 'vertical', nom: 'vertical 9:16 (app)' },
];

export function TeaserSlots({ type, slug, teaser }: { type: TeaserType; slug: string; teaser: Teaser }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      {LANGUES.map((l) => (
        <div key={l.code}>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.textHeading, marginBottom: 10 }}>{l.nom}</div>
          <div style={{ display: 'grid', gap: 14 }}>
            {FORMATS.map((f) => (
              <LienVideoCellule
                key={f.code}
                label={`${l.code.toUpperCase()} ${f.nom}`}
                url={teaser[l.code]?.[f.code]}
                enregistrer={(lien) => definirLienTeaser(type, slug, l.code, f.code, lien)}
                retirer={() => retirerTeaser(type, slug, l.code, f.code)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
