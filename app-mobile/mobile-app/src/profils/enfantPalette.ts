import type { AvatarCouleur } from '../data/parentEnfantTypes';

/**
 * 4 dégradés d'avatar enfant, extraits verbatim des pastilles de
 * `design-reference-parent-enfant.dc.excerpt.html` (ONBOARDING · PROFILS
 * ENFANTS). Pas de photo uploadée pour un profil enfant — une couleur
 * choisie parmi ces 4, fidèle à la maquette.
 */
export const AVATAR_GRADIENTS: Record<AvatarCouleur, readonly [string, string]> = {
  terracotta: ['#C25E2E', '#8B3A2F'],
  bleu: ['#3E6B8B', '#274a63'],
  violet: ['#5B4B8A', '#3A2E63'],
  or: ['#D9A441', '#B06A1E'],
};

export const AVATAR_COULEURS: AvatarCouleur[] = ['terracotta', 'bleu', 'violet', 'or'];

export const AVATAR_LABEL: Record<AvatarCouleur, string> = {
  terracotta: 'Terracotta',
  bleu: 'Bleu',
  violet: 'Violet',
  or: 'Or',
};
