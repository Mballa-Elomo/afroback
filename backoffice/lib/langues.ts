export interface LangueVideo {
  code: string;
  label: string;
}

/**
 * Langues vidéo configurées pour les chapitres héros. Le stockage
 * (`heros.video_chapitres[].videos`, jsonb) est déjà arbitraire par langue —
 * ajouter une langue ici (+ uploader les fichiers réels depuis la fiche
 * héros) suffit, aucune migration de schéma n'est nécessaire pour ça. Seul
 * `hero_video_chapter_engagement.langue` (Supabase) a une contrainte de
 * format sur le code (2-3 lettres minuscules), voir
 * mobile-app/supabase/migration-video-chapitres-multilangue.sql.
 */
export const LANGUES_VIDEO: LangueVideo[] = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
];
