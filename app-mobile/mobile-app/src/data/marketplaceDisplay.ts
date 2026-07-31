import type { MarketplaceCategorie } from './marketplaceTypes';

/** Libellés/icônes cosmétiques par catégorie — taxonomie de départ, pas une donnée commerciale sensible (contrairement aux commissions/paliers). */
export const MARKETPLACE_CATEGORIE_LABEL: Record<MarketplaceCategorie, string> = {
  sculpture: 'Sculpture',
  bijoux: 'Bijoux',
  textile: 'Textile',
  poterie: 'Poterie',
  peinture: 'Peinture',
  instrument: 'Instrument',
  autre: 'Autre',
};

export const MARKETPLACE_CATEGORIE_ICON: Record<MarketplaceCategorie, string> = {
  sculpture: '🗿',
  bijoux: '💍',
  textile: '🧵',
  poterie: '🏺',
  peinture: '🎨',
  instrument: '🥁',
  autre: '✦',
};

export function formatFcfa(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}
