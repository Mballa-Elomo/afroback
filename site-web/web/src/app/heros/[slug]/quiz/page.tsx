import { QuizPlayer } from '@/components/QuizPlayer';
import { loadContent } from '@/lib/loadContent';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { tile } = await loadContent('heros', slug);
  return { title: `Quiz · ${tile.title}`, robots: { index: false } };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { tile } = await loadContent('heros', slug);
  return <QuizPlayer type="heros" slug={slug} title={tile.title} image={tile.image} />;
}
