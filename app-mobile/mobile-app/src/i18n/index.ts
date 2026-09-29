import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import fr from './fr';
import en from './en';

/**
 * Traduction de l'app (cdc-i18n-app.md) — posée le 2026-09-29 à la demande
 * de Yannick : choix de la langue dès l'écran 1, tout le parcours d'entrée
 * (logo → accueil) traduit FR/EN. Le reste de l'app sera extrait par lots
 * dans fr.ts/en.ts ; en attendant, ces écrans restent en français quelle que
 * soit la langue choisie.
 *
 * Ordre de priorité de la langue au démarrage : choix enregistré sur cet
 * appareil → langue du téléphone (si français ou anglais) → français.
 * Seuls FR et EN sont proposés (décision du 2026-09-29) ; les 4 langues
 * camerounaises s'ajouteront ici quand leur contenu existera.
 */
export type AppLanguage = 'fr' | 'en';
export const APP_LANGUAGES: { code: AppLanguage; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
];

const STORAGE_KEY = 'afroback:language';

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  returnNull: false,
});

function isAppLanguage(v: unknown): v is AppLanguage {
  return v === 'fr' || v === 'en';
}

/** À appeler une fois au démarrage, avant le premier rendu des écrans. */
export async function loadInitialLanguage(): Promise<AppLanguage> {
  let lang: AppLanguage = 'fr';
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (isAppLanguage(stored)) {
      lang = stored;
    } else {
      const device = getLocales()[0]?.languageCode;
      if (isAppLanguage(device)) lang = device;
    }
  } catch {
    // Stockage ou détection indisponible : français par défaut.
  }
  await i18n.changeLanguage(lang);
  return lang;
}

/** Change la langue immédiatement dans toute l'app et la mémorise sur l'appareil. */
export async function setAppLanguage(lang: AppLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Best-effort : au pire, le choix sera redemandé au prochain lancement.
  }
}

export function currentLanguage(): AppLanguage {
  return isAppLanguage(i18n.language) ? i18n.language : 'fr';
}

/** `t` + langue courante ; le composant se re-rend à chaque changement de langue. */
export function useI18n() {
  const { t, i18n: instance } = useTranslation();
  return { t, lang: (isAppLanguage(instance.language) ? instance.language : 'fr') as AppLanguage };
}

export default i18n;
