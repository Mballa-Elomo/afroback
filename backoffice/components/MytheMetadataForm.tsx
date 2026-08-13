'use client';

import { useActionState, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { saveMytheMetadata } from '@/app/(admin)/mythologie/[slug]/actions';
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

export function MytheMetadataForm({
  slug,
  titre,
  sousTitre,
  peuple,
  region,
  zone,
  epoque,
  typeContenu,
  theme,
  ordreAffichage,
}: {
  slug: string;
  titre: string;
  sousTitre: string;
  peuple: string;
  region: string;
  zone: string;
  epoque: string;
  typeContenu: string;
  theme: string;
  ordreAffichage: number;
}) {
  const formId = `mythe-metadata-form-${slug}`;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | null; savedAt: number | null }, formData: FormData) => {
      const res = await saveMytheMetadata(slug, formData);
      return { error: res.error, savedAt: res.error ? null : Date.now() };
    },
    { error: null, savedAt: null }
  );

  return (
    <>
      <form id={formId} action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Titre</div>
          <input name="titre" defaultValue={titre} required style={inputStyle} />
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Sous-titre</div>
          <input name="sous_titre" defaultValue={sousTitre} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Peuple</div>
            <input name="peuple" defaultValue={peuple} style={inputStyle} />
          </div>
          <div style={{ width: 90 }}>
            <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Ordre</div>
            <input name="ordre_affichage" type="number" defaultValue={ordreAffichage} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Région</div>
            <input name="region" defaultValue={region} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Zone</div>
            <input name="zone" defaultValue={zone} style={inputStyle} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Époque</div>
          <input name="epoque" defaultValue={epoque} style={inputStyle} />
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Type de contenu</div>
          <input name="type_contenu" defaultValue={typeContenu} style={inputStyle} />
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Thème(s)</div>
          <input name="theme" defaultValue={theme} style={inputStyle} />
        </div>
        {state.error && <div style={{ fontSize: 12, color: colors.terracottaText }}>{state.error}</div>}
      </form>

      {mounted &&
        createPortal(
          <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
            {state.savedAt && !pending && (
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: colors.positive,
                  fontFamily: fonts.body,
                  background: '#160f0a',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 10,
                  padding: '9px 14px',
                }}
              >
                ✓ Modifications enregistrées
              </span>
            )}
            <button
              type="submit"
              form={formId}
              disabled={pending}
              style={{
                font: 'inherit',
                fontSize: 13.5,
                fontWeight: 700,
                padding: '13px 26px',
                borderRadius: 12,
                border: 'none',
                background: `linear-gradient(135deg, ${colors.accentGoldBright}, ${colors.terracotta})`,
                color: colors.ctaTextOnGold,
                cursor: pending ? 'default' : 'pointer',
                opacity: pending ? 0.6 : 1,
                boxShadow: '0 8px 24px rgba(0,0,0,.45)',
              }}
            >
              {pending ? 'Enregistrement…' : 'Enregistrer les métadonnées'}
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
