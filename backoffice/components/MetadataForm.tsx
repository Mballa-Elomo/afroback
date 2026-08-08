'use client';

import { useActionState } from 'react';
import { saveMetadata } from '@/app/(admin)/heros/[slug]/actions';
import { colors, fonts } from '@/lib/theme';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#170f0a',
  border: `1px solid ${colors.border}`,
  borderRadius: 9,
  padding: '10px 12px',
  color: colors.textPrimary,
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
};

export function MetadataForm({
  slug,
  theme,
  region,
  ordreAffichage,
  avertissement,
}: {
  slug: string;
  theme: string[];
  region: string;
  ordreAffichage: number;
  avertissement: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | null; savedAt: number | null }, formData: FormData) => {
      const res = await saveMetadata(slug, formData);
      return { error: res.error, savedAt: res.error ? null : Date.now() };
    },
    { error: null, savedAt: null }
  );

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Thème(s), séparés par des virgules</div>
        <input name="theme" defaultValue={theme.join(', ')} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Région</div>
          <input name="region" defaultValue={region} required style={inputStyle} />
        </div>
        <div style={{ width: 90 }}>
          <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Ordre</div>
          <input name="ordre_affichage" type="number" defaultValue={ordreAffichage} style={inputStyle} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Avertissement de lecture (figures ambivalentes)</div>
        <input name="avertissement_lecture" defaultValue={avertissement ?? ''} placeholder="Aucun" style={inputStyle} />
      </div>

      {state.error && <div style={{ fontSize: 12, color: colors.terracottaText }}>{state.error}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            font: 'inherit',
            fontSize: 13,
            fontWeight: 700,
            padding: '11px 22px',
            borderRadius: 10,
            border: 'none',
            background: `linear-gradient(135deg, ${colors.accentGoldBright}, ${colors.terracotta})`,
            color: colors.ctaTextOnGold,
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? 'Enregistrement…' : 'Enregistrer les métadonnées'}
        </button>
        {state.savedAt && !pending && (
          <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.positive, fontFamily: fonts.body }}>✓ Modifications enregistrées</span>
        )}
      </div>
    </form>
  );
}
