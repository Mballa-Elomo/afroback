import type { DecouverteType, StatutFactuel } from './decouverteTypes';

/**
 * Libellés et icônes d'affichage par type — choix cosmétiques du chef de
 * projet (aucune donnée éditoriale inventée, juste de l'iconographie), pas
 * une donnée qui vient du contenu produit par l'agent afroback-decouverte.
 */
export const DECOUVERTE_TYPE_LABEL: Record<DecouverteType, string> = {
  village: 'Village',
  coutume: 'Coutume',
  objet: 'Objet',
  personnage: 'Personnage',
  fait: 'Fait',
};

export const DECOUVERTE_TYPE_ICON: Record<DecouverteType, string> = {
  village: '🏘️',
  coutume: '🎭',
  objet: '🏺',
  personnage: '👑',
  fait: '◆',
};

export const STATUT_FACTUEL_LABEL: Record<StatutFactuel, string> = {
  atteste: 'Attesté',
  tradition_orale: 'Tradition orale',
  debattu: 'Débattu',
};
