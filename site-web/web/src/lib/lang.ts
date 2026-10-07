/**
 * Langue du site : français ou anglais (décision du 2026-10-06). Le choix
 * est gardé dans un cookie pour que les pages préparées côté serveur
 * arrivent directement dans la bonne langue. Sans choix : langue du
 * navigateur, sinon français.
 */
export type Lang = 'fr' | 'en';
export const LANG_COOKIE = 'afroback-lang';
export const isLang = (v: unknown): v is Lang => v === 'fr' || v === 'en';

/** Texte de l'interface : la version de la langue courante. */
export const pick = (lang: Lang, fr: string, en: string) => (lang === 'en' ? en : fr);

/**
 * Champ de contenu traduit : en anglais, la colonne « _en » si elle est
 * remplie, sinon le français (repli tant que la traduction n'est pas chargée).
 */
export function loc<T = string>(row: Record<string, unknown> | null | undefined, field: string, lang: Lang): T {
  if (!row) return '' as T;
  if (lang === 'en') {
    const en = row[`${field}_en`];
    if (en !== null && en !== undefined && en !== '' && !(Array.isArray(en) && en.length === 0)) return en as T;
  }
  return row[field] as T;
}

/** Formats de date et de nombre de la langue. */
export const localeOf = (lang: Lang) => (lang === 'en' ? 'en-GB' : 'fr-FR');

/** « il y a 5 min » / « 5 min ago », puis la date au-delà d'un mois. */
export function timeAgo(iso: string, lang: Lang): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const en = lang === 'en';
  if (s < 60) return en ? 'just now' : "à l'instant";
  if (s < 3600) return en ? `${Math.floor(s / 60)} min ago` : `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return en ? `${Math.floor(s / 3600)} h ago` : `il y a ${Math.floor(s / 3600)} h`;
  if (s < 2592000) return en ? `${Math.floor(s / 86400)} d ago` : `il y a ${Math.floor(s / 86400)} j`;
  return new Date(iso).toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Langue courante côté navigateur, pour les messages produits hors des
 * composants (erreurs renvoyées par lib/*). Côté serveur : français.
 */
export function clientLang(): Lang {
  if (typeof document === 'undefined') return 'fr';
  return document.documentElement.lang === 'en' ? 'en' : 'fr';
}
/** Raccourci des lib/* : pick() avec la langue du navigateur. */
export const tc = (fr: string, en: string) => pick(clientLang(), fr, en);
