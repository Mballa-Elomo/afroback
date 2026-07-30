/**
 * Types miroir du schéma Postgres (voir supabase/seed.sql et
 * app-mobile/data-model-heros.md). Les champs optionnels sont typés
 * `| null` en plus d'`undefined` car Postgres/Supabase renvoie `null`,
 * jamais `undefined`, pour une colonne vide.
 */

export type StatutAttestation = 'attestee' | 'rapportee_par_tiers' | 'non_authentifiee';

export type StatutContenu = 'pret' | 'brouillon' | 'a_produire';
export type StatutAudio = 'pret' | 'en_cours' | 'a_produire';
export type StatutVideo = 'pret' | 'en_cours' | 'storyboard_pret' | 'a_produire';

export interface FriseEvenement {
  date: string;
  evenement: string;
}

export interface Citation {
  texte: string;
  statut_attestation: StatutAttestation;
  source: string;
}

export interface LegendeAssociee {
  titre: string;
  description: string;
  statut: 'legende';
}

/**
 * Planche individuelle d'un chapitre de storyboard (voir
 * `.claude/agents/afroback-storyboard.md`) — extraite mécaniquement par
 * `scripts/build-heroes-data.mjs` depuis les fichiers
 * `Récits africains storyboards/[slug]/chapitre-N.md`. Alimente le
 * diaporama animé (`StoryboardSlideshow`), seule "vidéo" disponible tant
 * qu'aucun documentaire n'est produit pour un héros.
 */
export interface Planche {
  numero: number;
  titre: string;
  /** Texte affiché à l'écran (date, lieu...), `null` si la planche n'en a pas ("aucun" dans le storyboard source). */
  texte_ecran: string | null;
  /** Ligne de narration, ou une didascalie entre parenthèses (ex. "(silence, respiration du récit)") pour les planches muettes. */
  voix_off: string | null;
  cadrage: string | null;
  action_visuelle: string | null;
  decor: string | null;
  ambiance_lumiere: string | null;
  palette: string | null;
  duree_secondes: number | null;
  transition: string | null;
}

export interface ChapitreStoryboard {
  numero: number;
  titre_chapitre: string;
  fichier_source: string;
  nb_planches: number;
  statut: StatutContenu;
  planches: Planche[];
}

export interface Heros {
  id: string;
  slug: string;
  nom_affiche: string;
  nom_complet: string;
  sous_titre: string;
  epoque: string;
  region: string;
  theme: string[];
  resume_catalogue: string;
  annee_naissance_indicative?: string | null;
  annee_mort_indicative?: string | null;
  recit_fr_texte: string;
  recit_fr_fichier_source: string;
  recit_en_texte?: string | null;
  recit_en_fichier_source?: string | null;
  frise_chronologique: FriseEvenement[];
  citations: Citation[];
  sources: string[];
  legendes_associees: LegendeAssociee[];
  heros_lies: string[];
  chapitres_storyboard: ChapitreStoryboard[];
  statut_recit_texte: StatutContenu;
  statut_narration_audio: StatutAudio;
  statut_video: StatutVideo;
  image_carte_catalogue?: string | null;
  narration_audio_fr_url?: string | null;
  narration_audio_en_url?: string | null;
  video_url?: string | null;
  avertissement_lecture?: string | null;
  ordre_affichage: number;
}
