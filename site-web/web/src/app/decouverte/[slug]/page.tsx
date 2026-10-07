import { DetailPage, detailMetadata } from '@/components/DetailPage';

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return detailMetadata('decouverte', slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <DetailPage type="decouverte" slug={slug} />;
}
