'use client';

import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/lib/lang-client';

/**
 * Protection du contenu (phase 2, app-mobile/securite-phase2-protection-contenu.md, lots B et C).
 * - Copie : sélection, copier/couper, clic droit, glisser et raccourcis
 *   (Ctrl/Cmd + C, X, A, S, P, U) bloqués hors des champs de saisie.
 * - Capture : un navigateur ne peut pas interdire une capture d'écran. On
 *   floute la page quand la fenêtre perd le focus (outil de capture,
 *   enregistreur, changement d'onglet), on remplace le presse-papiers après
 *   Impr. écran, et l'impression donne une page vide (globals.css).
 * Filigrane retiré le 2026-10-08 à la demande de Yannick.
 */

const BLOCKED_KEYS = new Set(['c', 'x', 'a', 's', 'p', 'u']);
const ALWAYS_BLOCKED = new Set(['s', 'p', 'u']);

function isEditable(target: EventTarget | null) {
  const el = target instanceof Element ? target : null;
  if (!el) return false;
  // data-allow-copy : exception volontaire (clé secrète de la vérification en 2 étapes).
  return !!el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [data-allow-copy]');
}

export function ContentShield() {
  const { tr } = useLang();
  const [veiled, setVeiled] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const message = tr('Contenu protégé par AFROBACK', 'Content protected by AFROBACK');
  const messageRef = useRef(message);
  messageRef.current = message;

  useEffect(() => {
    // Copier/couper visent l'élément actif (souvent body) : on regarde aussi où commence la sélection.
    const selectionEditable = () => isEditable(document.getSelection()?.anchorNode?.parentElement ?? null);
    const block = (e: Event) => {
      if (isEditable(e.target)) return;
      if ((e.type === 'copy' || e.type === 'cut') && selectionEditable()) return;
      e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && BLOCKED_KEYS.has(key)) {
        if (ALWAYS_BLOCKED.has(key) || !(isEditable(e.target) || selectionEditable())) e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'PrintScreen') return;
      navigator.clipboard?.writeText(messageRef.current).catch(() => {});
      setVeiled(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setVeiled(!document.hasFocus()), 1500);
    };
    const onBlur = () => setVeiled(true);
    const onFocus = () => setVeiled(false);
    const onVisibility = () => setVeiled(document.visibilityState === 'hidden' || !document.hasFocus());

    const opts = { capture: true };
    for (const type of ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart']) document.addEventListener(type, block, opts);
    document.addEventListener('keydown', onKeyDown, opts);
    document.addEventListener('keyup', onKeyUp, opts);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      for (const type of ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart']) document.removeEventListener(type, block, opts);
      document.removeEventListener('keydown', onKeyDown, opts);
      document.removeEventListener('keyup', onKeyUp, opts);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  return (
    <>
      {veiled && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-ink/85 backdrop-blur-2xl" aria-hidden="true">
          <p className="px-6 text-center font-display text-lg font-bold tracking-[0.12em] text-gold">{message}</p>
        </div>
      )}
    </>
  );
}
