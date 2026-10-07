import { currentLanguage } from './index';

/**
 * Contenu en anglais (décision du 2026-10-06, supabase/schema-i18n-contenu-en.sql).
 *
 * Chaque champ de texte affiché a son jumeau `_en` en base. Quand l'app est
 * en anglais, les repositories remplacent le champ français par sa version
 * anglaise si elle est remplie ; sinon le français reste affiché (jamais un
 * champ vide). Les écrans n'ont donc rien à savoir : ils lisent `titre`,
 * `resume_catalogue`… comme avant.
 *
 * Les textes longs qui ont déjà leur bascule FR/EN à l'écran (récit, audio,
 * texte Découverte) ne passent pas par ici : leur écran choisit la version.
 * `pays` et les identifiants de filtres ne sont jamais traduits ici (ils
 * servent de clés).
 */

export const HEROS_EN_FIELDS = [
  'nom_affiche',
  'sous_titre',
  'epoque',
  'region',
  'resume_catalogue',
  'avertissement_lecture',
  'frise_chronologique',
  'citations',
  'legendes_associees',
] as const;
export const MYTHES_EN_FIELDS = ['titre', 'sous_titre', 'peuple', 'region', 'zone', 'epoque', 'theme'] as const;
export const DECOUVERTE_EN_FIELDS = ['titre', 'sous_titre', 'region_ethnie', 'resume_liste', 'statut_fait_legende'] as const;
export const PAYS_EN_FIELDS = ['nom', 'resume'] as const;
export const NIVEAUX_EN_FIELDS = ['nom', 'tranche_age'] as const;

/** Colonnes `_en` lisibles dans les catalogues publics (les autres arrivent par get_*_detail). */
export const HEROS_EN_COLUMNS = ',nom_affiche_en,sous_titre_en,epoque_en,region_en,resume_catalogue_en,avertissement_lecture_en';
export const MYTHES_EN_COLUMNS = ',titre_en,sous_titre_en,peuple_en,region_en,zone_en,epoque_en,theme_en';
export const DECOUVERTE_EN_COLUMNS = ',titre_en,sous_titre_en,region_ethnie_en,resume_liste_en';

const filled = (v: unknown) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);

/** Applique les traductions disponibles selon la langue courante de l'app. */
export function localize<T>(row: T, fields: readonly string[]): T {
  if (currentLanguage() !== 'en' || !row) return row;
  const r = row as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = { ...r };
  for (const f of fields) {
    const en = r[`${f}_en`];
    if (filled(en)) {
      // La valeur française reste disponible pour les filtres et rapprochements (ex. epoque_fr, nom_fr).
      out[`${f}_fr`] = r[f];
      out[f] = en;
    }
  }
  return out as T;
}
