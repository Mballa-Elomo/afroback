export type EraCategory = 'precolonial' | 'colonial' | 'independances';

export const ERA_FILTERS: { id: EraCategory | 'tous'; label: string }[] = [
  { id: 'tous', label: 'heroesList.eraAll' },
  { id: 'precolonial', label: 'heroesList.eraPrecolonial' },
  { id: 'colonial', label: 'heroesList.eraColonial' },
  { id: 'independances', label: 'heroesList.eraIndependances' },
];

/**
 * Regroupe le champ libre `epoque` (ex. "Colonial (Kamerun allemand,
 * 1884-1916)") en 3 grandes catégories pour les filtres du catalogue,
 * fidèles à la maquette. Les figures contemporaines (ex. Manu Dibango,
 * 1933-2020) sont rattachées à "Indépendances" : chronologiquement
 * postérieures, pas de 4e onglet dans la maquette pour elles.
 */
export function eraCategory(epoque: string): EraCategory {
  const e = epoque.toLowerCase();
  if (e.startsWith('précolonial')) return 'precolonial';
  if (e.includes('indépendance') || e.includes('contemporain')) return 'independances';
  return 'colonial';
}
