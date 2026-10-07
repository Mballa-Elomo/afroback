import { notFound } from 'next/navigation';
import { getAllTiles, getDetail } from './catalogue';
import type { ContentType } from './types';
import { getLang } from './lang-server';

/** Carte + détail d'un contenu, pour les pages de lecture (404 si inconnu). */
export async function loadContent(type: ContentType, slug: string) {
  const lang = await getLang();
  const { heroTiles, mytheTiles, decouverteTiles } = await getAllTiles(lang);
  const pool = type === 'heros' ? heroTiles : type === 'mythe' ? mytheTiles : decouverteTiles;
  const tile = pool.find((t) => t.slug === slug);
  if (!tile) notFound();
  const detail = await getDetail(type, slug);
  // « À suivre » de la page vidéo (façon YouTube) : les autres récits du même type, les plus suivis d'abord.
  const related = pool.filter((t) => t.slug !== slug).sort((a, b) => b.score - a.score).slice(0, 8);
  return { tile, detail, lang, related };
}
