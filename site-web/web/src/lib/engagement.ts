'use client';

import { supabase } from './supabase';
import type { ContentType } from './types';

/**
 * Compteurs d'engagement : mêmes fonctions serveur que l'application, pour
 * que les lectures, écoutes et vues du site s'ajoutent aux mêmes
 * statistiques (back-office et compteurs affichés). Un échec ne bloque
 * jamais la lecture.
 */

const safe = async (fn: string, args: Record<string, unknown>) => {
  try {
    await supabase.rpc(fn, args);
  } catch {
    /* compteur non bloquant */
  }
};

/** Ouverture du récit (héros, mythe) ou consultation d'une fiche Découverte. */
export function recordRead(type: ContentType, id: string) {
  if (type === 'heros') return safe('increment_hero_engagement', { p_hero_id: id, p_event: 'recit' });
  if (type === 'mythe') return safe('increment_mythe_engagement', { p_mythe_id: id, p_event: 'recit' });
  return safe('increment_decouverte_consultation', { p_item_id: id });
}

/** Première lecture de la narration audio. */
export function recordListen(type: ContentType, id: string, lang: string) {
  if (type === 'heros') return safe('increment_audio_engagement', { p_hero_id: id, p_langue: lang });
  if (type === 'mythe') return safe('increment_mythe_audio_engagement', { p_mythe_id: id, p_langue: lang });
}

/** Ouverture du lecteur vidéo (héros, mythe). */
export function recordWatchOpen(type: ContentType, id: string) {
  if (type === 'heros') return safe('increment_hero_engagement', { p_hero_id: id, p_event: 'video' });
  if (type === 'mythe') return safe('increment_mythe_engagement', { p_mythe_id: id, p_event: 'video' });
}

/** Lecture d'un chapitre vidéo. */
export function recordWatchChapter(type: ContentType, id: string, chapitre: number, lang: string) {
  if (type === 'heros') return safe('increment_video_chapter_engagement', { p_hero_id: id, p_chapitre: chapitre, p_langue: lang });
  if (type === 'mythe') return safe('increment_mythe_video_chapter_engagement', { p_mythe_id: id, p_chapitre: chapitre, p_langue: lang });
  return safe('increment_decouverte_video', { p_item_id: id, p_langue: lang });
}
