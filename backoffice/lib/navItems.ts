/**
 * Structure de la sidebar — reprise verbatim de la maquette (14 écrans, 3
 * groupes). `enabled: false` pour tout ce qui n'est pas encore construit
 * (lots 2 et 3, voir prompt-claude-design-backoffice.md, section "Notes
 * pour Yannick") : ces entrées restent visibles pour la fidélité à la
 * maquette et pour que Yannick voie le plan d'ensemble, mais ne sont **pas
 * cliquables** — pas de lien mort, juste un état visuellement inerte avec
 * l'étiquette du lot prévu.
 */
export interface NavItem {
  id: string;
  icon: string;
  label: string;
  href?: string;
  enabled: boolean;
  lot?: 2 | 3;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    group: '',
    items: [{ id: 'dash', icon: '▤', label: 'Tableau de bord', href: '/', enabled: true }],
  },
  {
    group: 'CONTENU',
    items: [
      { id: 'heroes', icon: '★', label: 'Histoires & Héros', href: '/heros', enabled: true },
      { id: 'discover', icon: '🧭', label: 'Découverte', enabled: false, lot: 2 },
      { id: 'mythology', icon: '🌙', label: 'Mythologie', enabled: false, lot: 2 },
      { id: 'ecole', icon: '🏅', label: 'École des Héros', enabled: false, lot: 2 },
      { id: 'media', icon: '🖼', label: 'Bibliothèque médias', href: '/media', enabled: true },
      { id: 'translation', icon: '🌐', label: 'Traduction', enabled: false, lot: 2 },
    ],
  },
  {
    group: 'COMMUNAUTÉ & BUSINESS',
    items: [
      { id: 'community', icon: '💬', label: 'Communauté', enabled: false, lot: 3 },
      { id: 'market', icon: '🛍', label: 'Marketplace', enabled: false, lot: 3 },
      { id: 'dons', icon: '🤲', label: 'Dons', enabled: false, lot: 3 },
      { id: 'revenue', icon: '◈', label: 'Abonnements', enabled: false, lot: 3 },
      { id: 'sponsors', icon: '🤝', label: 'Sponsors', enabled: false, lot: 3 },
    ],
  },
  {
    group: 'UTILISATEURS & SYSTÈME',
    items: [
      { id: 'users', icon: '👥', label: 'Utilisateurs', enabled: false, lot: 3 },
      { id: 'settings', icon: '⚙', label: 'Paramètres', enabled: false, lot: 3 },
    ],
  },
];
