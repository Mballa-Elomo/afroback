import { notFound } from 'next/navigation';
import type { ContentType } from '@/lib/types';
import { getAllTiles, getDetail } from '@/lib/catalogue';
import { ContentView } from './ContentView';
import { Row } from './Row';
import { getLang } from '@/lib/lang-server';
import { pick } from '@/lib/lang';

/** Page complète d'un contenu (adresse partageable et indexable). */
export async function DetailPage({ type, slug }: { type: ContentType; slug: string }) {
  const lang = await getLang();
  const { heroTiles, mytheTiles, decouverteTiles } = await getAllTiles(lang);
  const pool = type === 'heros' ? heroTiles : type === 'mythe' ? mytheTiles : decouverteTiles;
  const tile = pool.find((t) => t.slug === slug);
  if (!tile) notFound();
  const detail = await getDetail(type, slug);
  const others = pool.filter((t) => t.slug !== slug);
  return (
    <div>
      <ContentView tile={tile} detail={detail} />
      <Row title={pick(lang, 'À découvrir aussi', 'More to discover')} tiles={others} />
    </div>
  );
}

export async function detailMetadata(type: ContentType, slug: string) {
  const { heroTiles, mytheTiles, decouverteTiles } = await getAllTiles(await getLang());
  const pool = type === 'heros' ? heroTiles : type === 'mythe' ? mytheTiles : decouverteTiles;
  const tile = pool.find((t) => t.slug === slug);
  if (!tile) return {};
  return {
    title: tile.title,
    description: tile.summary,
    openGraph: { title: tile.title, description: tile.summary, images: tile.image ? [tile.image] : [] },
  };
}
