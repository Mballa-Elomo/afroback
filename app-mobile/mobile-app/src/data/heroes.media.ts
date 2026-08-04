/**
 * URLs des médias réellement produits (Supabase Storage, bucket public
 * `heroes-media`), par slug de héros. Séparé de `heroes.curated.ts` car ce
 * sont des faits de production (ce média existe ou non), pas un jugement
 * éditorial. Un héros absent de cet objet n'a simplement aucun média
 * produit à ce jour (statut_narration_audio / statut_video restent
 * "a_produire" / "storyboard_pret" dans export-heroes-json.mjs).
 *
 * Mis à jour le 2026-07-29 depuis livrables/sites-web/afroback/app-mobile/
 * production-media/ et le dossier local "AFROBACK CONTENT" de Yannick.
 */

export interface HeroVideoChapitreMedia {
  numero: number;
  titre_chapitre: string;
  video_url_fr?: string;
  video_url_en?: string;
}

export interface HeroMediaFields {
  image_carte_catalogue?: string;
  narration_audio_fr_url?: string;
  narration_audio_en_url?: string;
  video_url?: string;
  video_chapitres?: HeroVideoChapitreMedia[];
}

const STORAGE_BASE = 'https://ygkyapryramhaskfbrrt.supabase.co/storage/v1/object/public/heroes-media';

export const HEROES_MEDIA: Record<string, HeroMediaFields> = {
  'martin-paul-samba': {
    image_carte_catalogue: `${STORAGE_BASE}/images/martin-paul-samba.jpg`,
    narration_audio_fr_url: `${STORAGE_BASE}/audio/martin-paul-samba-fr.mp3`,
    video_url: `${STORAGE_BASE}/video/martin-paul-samba.mp4`,
  },
  'reine-nzinga': {
    image_carte_catalogue: `${STORAGE_BASE}/images/reine-nzinga.jpg`,
    narration_audio_fr_url: `${STORAGE_BASE}/audio/reine-nzinga-fr.mp3`,
    narration_audio_en_url: `${STORAGE_BASE}/audio/reine-nzinga-en.mp3`,
    // Chapitre 1/4 seul tourné à ce jour (2026-07-31) — les 3 autres
    // restent en storyboard tant qu'ils ne sont pas produits.
    video_chapitres: [
      {
        numero: 1,
        titre_chapitre: 'Naître dans un monde qui se referme',
        video_url_fr: `${STORAGE_BASE}/video/reine-nzinga-chap1-fr.mp4`,
        video_url_en: `${STORAGE_BASE}/video/reine-nzinga-chap1-en.mp4`,
      },
    ],
  },
  'ruben-um-nyobe': {
    image_carte_catalogue: `${STORAGE_BASE}/images/ruben-um-nyobe.jpg`,
    narration_audio_fr_url: `${STORAGE_BASE}/audio/ruben-um-nyobe-fr.mp3`,
    narration_audio_en_url: `${STORAGE_BASE}/audio/ruben-um-nyobe-en.mp3`,
  },
  'charles-atangana': {
    image_carte_catalogue: `${STORAGE_BASE}/images/charles-atangana.jpg`,
  },
  'ernest-ouandie': {
    image_carte_catalogue: `${STORAGE_BASE}/images/ernest-ouandie.jpg`,
  },
  'manu-dibango': {
    image_carte_catalogue: `${STORAGE_BASE}/images/manu-dibango.jpg`,
  },
  'sultan-njoya': {
    image_carte_catalogue: `${STORAGE_BASE}/images/sultan-njoya.jpg`,
  },
  // Fichier source nommé "Felix-Mounier.jpg" par Yannick — coquille probable
  // pour Félix Moumié (aucun autre "Felix" dans le catalogue, portrait dans
  // le même style que les autres cartes héros).
  'felix-moumie': {
    image_carte_catalogue: `${STORAGE_BASE}/images/felix-moumie.jpg`,
  },
};
