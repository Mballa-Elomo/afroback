/** Types, formats et statut des sponsors, utilisables côté navigateur (aucun accès serveur ici). */

export type Format = 'banniere_accueil' | 'presente_par' | 'fin_video' | 'page_partenaires';

export const FORMATS: Record<Format, { label: string; aide: string; cible: 'obligatoire' | 'facultative' | 'aucune' }> = {
  banniere_accueil: { label: 'Bannière d’accueil', aide: 'Encart sur l’accueil de l’app et du site (rotation s’il y en a plusieurs).', cible: 'aucune' },
  presente_par: { label: '« Présenté par »', aide: 'Sur la fiche d’un héros, d’un mythe ou d’un lieu choisi.', cible: 'obligatoire' },
  fin_video: { label: 'Fin de vidéo', aide: 'Carte « Avec le soutien de » à la fin d’une vidéo (un contenu, ou tous).', cible: 'facultative' },
  page_partenaires: { label: 'Page Partenaires', aide: 'Présentation dans la page qui liste les partenaires.', cible: 'aucune' },
};

export interface Sponsor {
  id: string;
  nom: string;
  logo_url: string | null;
  site_url: string | null;
  description_fr: string | null;
  description_en: string | null;
  contact_nom: string | null;
  contact_email: string | null;
  contact_telephone: string | null;
  montant_fcfa: number | null;
  date_debut: string | null;
  date_fin: string | null;
  actif: boolean;
  notes: string | null;
  cree_le: string;
}

export interface Emplacement {
  id: string;
  sponsor_id: string;
  format: Format;
  cible_type: 'heros' | 'mythe' | 'decouverte' | null;
  cible_slug: string | null;
  /** « Présenté par » : null = fiche (tous formats), sinon lecture / écoute / vidéo (schema-sponsors-ciblage.sql). */
  cible_format?: CibleFormat | null;
  /** Chapitre visé (lecture, vidéo, fin de vidéo) ; null = tous les chapitres. */
  cible_chapitre?: number | null;
  accroche_fr: string | null;
  accroche_en: string | null;
  actif: boolean;
}

export type CibleFormat = 'lecture' | 'ecoute' | 'video';

export const FORMATS_CIBLES: Record<CibleFormat, string> = {
  lecture: 'Lecture du récit',
  ecoute: 'Écoute (audio)',
  video: 'Vidéo',
};

export interface Stat {
  emplacement_id: string;
  jour: string;
  affichages: number;
  clics: number;
}

export interface CibleContenu {
  type: 'heros' | 'mythe' | 'decouverte';
  slug: string;
  titre: string;
}

export interface DonneesSponsors {
  sponsors: Sponsor[];
  emplacements: Emplacement[];
  stats: Stat[];
  cibles: CibleContenu[];
  installe: boolean;
}

export type StatutSponsor = 'brouillon' | 'programme' | 'en_cours' | 'termine' | 'suspendu';

/** Statut calculé à partir de l'interrupteur et des dates du contrat. */
export function statutSponsor(s: Sponsor, aujourdhui = new Date().toISOString().slice(0, 10)): StatutSponsor {
  if (!s.actif) return s.date_debut || s.date_fin ? 'suspendu' : 'brouillon';
  if (s.date_fin && s.date_fin < aujourdhui) return 'termine';
  if (s.date_debut && s.date_debut > aujourdhui) return 'programme';
  return 'en_cours';
}
