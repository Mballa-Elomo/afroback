import { WatchPlayer } from '@/components/WatchPlayer';
import { loadContent } from '@/lib/loadContent';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ chapitre?: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { tile, lang } = await loadContent('mythe', slug);
  return { title: `${lang === 'en' ? 'Watch' : 'Regarder'} · ${tile.title}` };
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const chap = Number((await searchParams).chapitre ?? 1) || 1;
  const { tile, detail, related } = await loadContent('mythe', slug);
  return <WatchPlayer type="mythe" tile={tile} detail={detail} initialChapter={chap} related={related} />;
}
