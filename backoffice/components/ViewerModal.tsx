'use client';

import { useState, type ReactNode } from 'react';
import { colors, fonts } from '@/lib/theme';

/** Modale de lecture seule (récit FR/EN...) — jamais un formulaire, jamais d'écriture depuis ce composant. */
export function ViewerModal({ trigger, title, children }: { trigger: ReactNode; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span onClick={() => setOpen(true)} style={{ display: 'inline-block', width: '100%' }}>
        {trigger}
      </span>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(6,4,2,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto', background: '#160f0a', border: `1px solid ${colors.border}`, borderRadius: 18, padding: 26 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: colors.textHeading }}>{title}</div>
              <span onClick={() => setOpen(false)} style={{ cursor: 'pointer', fontSize: 16, color: colors.textMuted }}>
                ✕
              </span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.8, color: colors.textBody, whiteSpace: 'pre-wrap' }}>{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
