import { CatalogueGrid } from '@/components/CatalogueGrid';
import { getAllTiles } from '@/lib/catalogue';
import { getLang } from '@/lib/lang-server';
import { pick } from '@/lib/lang';

export const revalidate = 120;

export async function generateMetadata() {
  const lang = await getLang();
  return { title: pick(lang, 'Héros', 'Heroes'), description: pick(lang, "Rois, reines, résistants, bâtisseurs et artistes : les vies qui ont façonné l'Afrique, racontées comme par un griot.", 'Kings, queens, resisters, builders and artists: the lives that shaped Africa, told the way a griot would.') };
}

export default async function HerosPage() {
  const lang = await getLang();
  const { heroTiles } = await getAllTiles(lang);
  return (
    <CatalogueGrid
      eyebrow={`${heroTiles.length} ${pick(lang, 'HISTOIRES DE HÉROS', 'HERO STORIES')}`}
      title={pick(lang, 'Histoires & Héros', 'History & Heroes')}
      intro={pick(lang, "Rois, reines, résistants, bâtisseurs et artistes : les vies qui ont façonné l'Afrique, racontées comme par un griot.", 'Kings, queens, resisters, builders and artists: the lives that shaped Africa, told the way a griot would.')}
      tiles={heroTiles}
    />
  );
}
