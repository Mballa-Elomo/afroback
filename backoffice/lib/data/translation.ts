import { getSupabaseAdmin } from '../supabase/server';

/**
 * Miroir de `translation_entries` (supabase/schema-translation.sql). Lecture
 * seule côté back-office pour l'instant : ce tableau montre l'avancement
 * réel de la traduction des 4 langues camerounaises, il ne remplace pas le
 * travail éditorial fait ailleurs (base de connaissances éwondo, recherche
 * de dictionnaires pour les 3 autres langues). Statut jamais recalculé côté
 * app : 'valide' ne peut venir que d'une relecture humaine par un locuteur
 * natif, jamais d'une logique automatique.
 */
export const LANGUES_TRADUCTION = [
  { code: 'ewo', nom: 'Éwondo' },
  { code: 'dua', nom: 'Douala' },
  { code: 'bas', nom: 'Bassa' },
  { code: 'bam', nom: 'Bamiléké' },
] as const;

export interface TranslationEntry {
  cle: string;
  langue: string;
  source_fr: string;
  brouillon: string | null;
  statut: 'vide' | 'brouillon' | 'valide';
}

export interface LanguageCoverage {
  code: string;
  nom: string;
  validated: number;
  brouillon: number;
  total: number;
}

export async function getTranslationEntriesAdmin(): Promise<TranslationEntry[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('translation_entries')
    .select('cle, langue, source_fr, brouillon, statut')
    .order('cle', { ascending: true });
  if (error) throw new Error(`Impossible de charger les traductions : ${error.message}`);
  return (data ?? []) as TranslationEntry[];
}

export function coverageByLanguage(entries: TranslationEntry[]): LanguageCoverage[] {
  return LANGUES_TRADUCTION.map(({ code, nom }) => {
    const rows = entries.filter((e) => e.langue === code);
    return {
      code,
      nom,
      validated: rows.filter((r) => r.statut === 'valide').length,
      brouillon: rows.filter((r) => r.statut === 'brouillon').length,
      total: rows.length,
    };
  });
}
