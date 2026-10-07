import { WatchPlayer } from '@/components/WatchPlayer';
import { loadContent } from '@/lib/loadContent';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ chapitre?: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { tile, lang } = await loadContent('decouverte', slug);
  return { title: `${lang === 'en' ? 'Watch' : 'Regarder'} · ${tile.title}` };
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const chap = Number((await searchParams).chapitre ?? 1) || 1;
  const { tile, detail } = await loadContent('decouverte', slug);
  return <WatchPlayer type="decouverte" tile={tile} detail={detail} initialChapter={chap} />;
}
