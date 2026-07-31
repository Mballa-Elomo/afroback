#!/usr/bin/env node
// Exporte le dataset fusionné (généré + curaté) en JSON brut, pour générer le seed SQL.
// Réplique la logique de fusion de src/data/heroesRepository.ts en évitant les soucis
// de résolution d'extension de Node avec les imports TypeScript relatifs.
import { writeFileSync } from 'node:fs';
import { HEROES_CURATED } from '../src/data/heroes.curated.ts';
import { HEROES_MEDIA } from '../src/data/heroes.media.ts';
import generated from '../src/data/heroes.generated.json' with { type: 'json' };

const heroes = HEROES_CURATED.map((curated) => {
  const gen = generated[curated.slug];
  if (!gen) throw new Error(`Pas de données générées pour ${curated.slug}`);
  const media = HEROES_MEDIA[curated.slug] ?? {};
  return {
    id: curated.slug,
    slug: curated.slug,
    nom_affiche: curated.nom_affiche,
    nom_complet: curated.nom_complet,
    sous_titre: curated.sous_titre,
    epoque: curated.epoque,
    region: curated.region,
    theme: curated.theme,
    resume_catalogue: curated.resume_catalogue,
    annee_naissance_indicative: curated.annee_naissance_indicative ?? null,
    annee_mort_indicative: curated.annee_mort_indicative ?? null,
    recit_fr_texte: gen.recit_fr_texte,
    recit_fr_fichier_source: gen.recit_fr_fichier_source,
    recit_chapitres_fr: gen.recit_chapitres_fr,
    recit_en_texte: gen.recit_en_texte,
    recit_en_fichier_source: gen.recit_en_fichier_source,
    recit_chapitres_en: gen.recit_chapitres_en,
    frise_chronologique: gen.frise_chronologique,
    citations: curated.citations,
    sources: gen.sources,
    legendes_associees: curated.legendes_associees,
    heros_lies: gen.heros_lies,
    chapitres_storyboard: gen.chapitres_storyboard,
    statut_recit_texte: 'pret',
    statut_narration_audio: media.narration_audio_fr_url || media.narration_audio_en_url ? 'pret' : 'a_produire',
    statut_video: media.video_url ? 'pret' : 'storyboard_pret',
    image_carte_catalogue: media.image_carte_catalogue ?? null,
    narration_audio_fr_url: media.narration_audio_fr_url ?? null,
    narration_audio_en_url: media.narration_audio_en_url ?? null,
    video_url: media.video_url ?? null,
    avertissement_lecture: curated.avertissement_lecture ?? null,
    ordre_affichage: curated.ordre_affichage,
  };
}).sort((a, b) => a.ordre_affichage - b.ordre_affichage);

const OUT = process.argv[2] || './heroes-export.tmp.json';
writeFileSync(OUT, JSON.stringify(heroes, null, 2), 'utf8');
console.log('OK', heroes.length, 'héros exportés vers', OUT);
