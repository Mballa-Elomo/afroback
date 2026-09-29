import { ONBOARDING_ILLUSTRATIONS } from './ui';

/**
 * Écrans de présentation du carrousel. Les textes (titres, paragraphe,
 * description de l'illustration) sont dans `src/i18n/fr.ts` / `en.ts`, sous
 * `intro.<key>`. Écran 3 : "Apprends. Joue." de la maquette remplacé par
 * "Écoute. Découvre." (décision D4 : ne rien promettre qui n'existe pas
 * encore dans l'app — pas de jeux ni d'AR à ce jour).
 */
export const INTRO_SLIDES = [
  { key: 'racines', image: ONBOARDING_ILLUSTRATIONS.racines },
  { key: 'histoires', image: ONBOARDING_ILLUSTRATIONS.histoires },
  { key: 'transmettre', image: ONBOARDING_ILLUSTRATIONS.transmettre },
] as const;
