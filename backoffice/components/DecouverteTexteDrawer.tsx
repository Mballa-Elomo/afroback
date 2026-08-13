'use client';

import { useActionState, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { saveDecouverteTexte } from '@/app/(admin)/decouverte/[slug]/actions';
import { colors, fonts } from '@/lib/theme';

type Lang = 'fr' | 'en';

/**
 * Panneau latéral pour consulter et corriger le texte publié d'une fiche
 * Découverte — copie de RecitDrawer.tsx (composants séparés plutôt que
 * paramétrer une action commune, cohérent avec le reste du back-office où
 * chaque fiche importe directement sa propre Server Action).
 */
export function DecouverteTexteDrawer({
  trigger,
  slug,
  lang,
  title,
  text,
}: {
  trigger: ReactNode;
  slug: string;
  lang: Lang;
  title: string;
  text: string;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savedText, setSavedText] = useState(text);
  const [draft, setDraft] = useState(text);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | null }, formData: FormData) => {
      const value = String(formData.get('texte') ?? '');
      const res = await saveDecouverteTexte(slug, lang, value);
      if (!res.error) {
        setSavedText(value);
        setEditing(false);
      }
      return { error: res.error };
    },
    { error: null }
  );

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, draft, savedText]);

  useEffect(() => {
    if (!open) return;
    const scrollContainer = document.getElementById('afa-scroll-container');
    const previous = scrollContainer?.style.overflow;
    if (scrollContainer) scrollContainer.style.overflow = 'hidden';
    return () => {
      if (scrollContainer) scrollContainer.style.overflow = previous ?? '';
    };
  }, [open]);

  function close() {
    if (pending) return;
    if (editing && draft !== savedText) {
      const ok = window.confirm('Des modifications non enregistrées seront perdues. Fermer quand même ?');
      if (!ok) return;
    }
    setOpen(false);
    setEditing(false);
    setDraft(savedText);
  }

  function startEdit() {
    setDraft(savedText);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(savedText);
    setEditing(false);
  }

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ display: 'inline-block', width: '100%', cursor: 'pointer' }}>
        {trigger}
      </span>

      {open &&
        mounted &&
        createPortal(
          <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(6,4,2,.72)' }}>
            <style>{`
            @keyframes decouverte-texte-drawer-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
          `}</style>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: '100%',
                width: 'min(560px, 100vw)',
                background: '#160f0a',
                borderLeft: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-16px 0 40px rgba(0,0,0,.45)',
                animation: 'decouverte-texte-drawer-in .22s ease-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '18px 22px',
                  borderBottom: `1px solid ${colors.border}`,
                  flex: 'none',
                }}
              >
                <div>
                  <div style={{ fontFamily: fonts.display, fontSize: 17, fontWeight: 700, color: colors.textHeading }}>{title}</div>
                  <div style={{ fontSize: 10.5, color: colors.textFaint, marginTop: 2 }}>{editing ? 'Mode édition' : 'Lecture'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!editing && (
                    <button type="button" onClick={startEdit} style={editButtonStyle}>
                      ✎ Modifier
                    </button>
                  )}
                  <span onClick={close} style={{ cursor: 'pointer', fontSize: 16, color: colors.textMuted, padding: 4, lineHeight: 1 }}>
                    ✕
                  </span>
                </div>
              </div>

              {editing ? (
                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                  <textarea
                    name="texte"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={pending}
                    autoFocus
                    style={{
                      flex: 1,
                      minHeight: 0,
                      resize: 'none',
                      background: '#170f0a',
                      border: 'none',
                      outline: 'none',
                      padding: '20px 22px',
                      color: colors.textPrimary,
                      fontFamily: fonts.body,
                      fontSize: 13.5,
                      lineHeight: 1.8,
                    }}
                  />
                  {state.error && <div style={{ padding: '0 22px 12px', fontSize: 12, color: colors.terracottaText }}>{state.error}</div>}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '16px 22px',
                      borderTop: `1px solid ${colors.border}`,
                      flex: 'none',
                    }}
                  >
                    <button type="submit" disabled={pending} style={saveButtonStyle(pending)}>
                      {pending ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    <button type="button" onClick={cancelEdit} disabled={pending} style={cancelButtonStyle}>
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 22px',
                    fontSize: 13.5,
                    lineHeight: 1.8,
                    color: colors.textBody,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {savedText || 'Aucun texte enregistré.'}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

const editButtonStyle: React.CSSProperties = {
  font: 'inherit',
  fontSize: 12,
  fontWeight: 600,
  padding: '7px 14px',
  borderRadius: 8,
  border: `1px solid ${colors.borderStrong}`,
  background: 'transparent',
  color: colors.accentGold,
  cursor: 'pointer',
};

const cancelButtonStyle: React.CSSProperties = {
  font: 'inherit',
  fontSize: 13,
  fontWeight: 600,
  padding: '11px 18px',
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  background: 'transparent',
  color: colors.textMuted,
  cursor: 'pointer',
};

function saveButtonStyle(pending: boolean): React.CSSProperties {
  return {
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
  };
}
