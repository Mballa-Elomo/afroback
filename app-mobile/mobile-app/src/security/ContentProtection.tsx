import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { useI18n } from '../i18n';
import { colors, typography } from '../theme/tokens';

/**
 * Protection du contenu (phase 2, app-mobile/securite-phase2-protection-contenu.md).
 *
 * - iOS / Android : captures et enregistrements d'écran bloqués par le
 *   système sur toute l'app (FLAG_SECURE sur Android, iOS 13+), aperçu flouté
 *   dans le sélecteur d'applications iOS. Le texte n'est jamais
 *   sélectionnable (comportement par défaut de <Text>).
 * - Web (afroback-test) : un navigateur ne peut pas interdire une capture.
 *   Sélection, copie, clic droit, glisser, impression et raccourcis bloqués
 *   hors des champs de saisie ; page floutée quand la fenêtre perd le focus ;
 *   presse-papiers remplacé après Impr. écran. Mêmes règles que le site.
 * Filigrane retiré le 2026-10-08 à la demande de Yannick.
 */

export function ContentProtection() {
  const { t } = useI18n();
  const veiled = useWebShield(t('brand.protectedContent'));

  useEffect(() => {
    if (Platform.OS === 'web') return;
    ScreenCapture.preventScreenCaptureAsync('afroback-contenu').catch(() => {});
    if (Platform.OS === 'ios') ScreenCapture.enableAppSwitcherProtectionAsync(0.9).catch(() => {});
  }, []);

  return (
    <>
      {veiled && (
        <View style={styles.veil} aria-hidden>
          <Text style={styles.veilText}>{t('brand.protectedContent')}</Text>
        </View>
      )}
    </>
  );
}

// --- Web uniquement ---------------------------------------------------------

const WEB_CSS = `
body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
body * { -webkit-user-select: none !important; user-select: none !important; }
input, textarea, select, [contenteditable=''], [contenteditable='true'], [data-allow-copy], [data-allow-copy] * {
  -webkit-user-select: text !important; user-select: text !important; -webkit-touch-callout: default;
}
img, video, audio, svg { -webkit-user-drag: none; }
@media print {
  body > * { display: none !important; }
  body::after { content: 'Contenu protégé par AFROBACK · Content protected by AFROBACK'; display: block; padding: 40vh 2rem 0; text-align: center; font: 700 18px Arial, sans-serif; color: #000; }
}`;
const BLOCKED_KEYS = new Set(['c', 'x', 'a', 's', 'p', 'u']);
const ALWAYS_BLOCKED = new Set(['s', 'p', 'u']);

function isEditable(target: EventTarget | null) {
  const el = typeof Element !== 'undefined' && target instanceof Element ? target : null;
  return !!el?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [data-allow-copy]');
}

/** Freins web ; renvoie true quand la page doit être voilée. */
function useWebShield(message: string) {
  const [veiled, setVeiled] = useState(false);
  const messageRef = useRef(message);
  messageRef.current = message;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.setAttribute('data-afroback', 'protection');
    style.textContent = WEB_CSS;
    document.head.appendChild(style);

    let flash: ReturnType<typeof setTimeout> | null = null;
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
      if (flash) clearTimeout(flash);
      flash = setTimeout(() => setVeiled(!document.hasFocus()), 1500);
    };
    const onBlur = () => setVeiled(true);
    const onFocus = () => setVeiled(false);
    const onVisibility = () => setVeiled(document.visibilityState === 'hidden' || !document.hasFocus());
    // Lecteurs audio/vidéo natifs du navigateur : pas de bouton « Télécharger » ni d'image dans l'image.
    const lockMedia = () => {
      document.querySelectorAll('video, audio').forEach((m) => {
        m.setAttribute('controlslist', 'nodownload noremoteplayback');
        m.setAttribute('disablepictureinpicture', '');
        m.setAttribute('disableremoteplayback', '');
      });
    };
    const observer = new MutationObserver(lockMedia);
    observer.observe(document.body, { childList: true, subtree: true });
    lockMedia();

    const opts = { capture: true };
    const blocked = ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'];
    for (const type of blocked) document.addEventListener(type, block, opts);
    document.addEventListener('keydown', onKeyDown, opts);
    document.addEventListener('keyup', onKeyUp, opts);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      for (const type of blocked) document.removeEventListener(type, block, opts);
      document.removeEventListener('keydown', onKeyDown, opts);
      document.removeEventListener('keyup', onKeyUp, opts);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      observer.disconnect();
      if (flash) clearTimeout(flash);
      style.remove();
    };
  }, []);

  return veiled;
}

const styles = StyleSheet.create({
  veil: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(7,5,4,0.97)',
  },
  veilText: {
    fontFamily: typography.display,
    fontSize: 17,
    letterSpacing: 2,
    textAlign: 'center',
    color: colors.accentGoldBright,
  },
});
