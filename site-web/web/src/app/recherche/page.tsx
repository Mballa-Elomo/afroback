import { Suspense } from 'react';
import { getAllTiles } from '@/lib/catalogue';
import { SearchResults } from '@/components/SearchResults';
import { getLang } from '@/lib/lang-server';

export const revalidate = 120;
export async function generateMetadata() {
  return { title: (await getLang()) === 'en' ? 'Search' : 'Recherche' };
}

export default async function RecherchePage() {
  const { heroTiles, mytheTiles, decouverteTiles } = await getAllTiles(await getLang());
  return (
    <Suspense>
      <SearchResults tiles={[...heroTiles, ...mytheTiles, ...decouverteTiles]} />
    </Suspense>
  );
}
