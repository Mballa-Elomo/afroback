import { CatalogueGrid } from '@/components/CatalogueGrid';
import { getAllTiles } from '@/lib/catalogue';
import { getLang } from '@/lib/lang-server';
import { pick } from '@/lib/lang';

export const revalidate = 120;

export async function generateMetadata() {
  const lang = await getLang();
  return { title: pick(lang, 'Découverte', 'Discovery'), description: pick(lang, 'Villages, coutumes, objets sacrés et figures traditionnelles. Ce qui est attesté est distingué de ce qui est raconté.', 'Villages, customs, sacred objects and traditional figures. What is documented is kept apart from what is told.') };
}

export default async function DecouvertePage() {
  const lang = await getLang();
  const { decouverteTiles } = await getAllTiles(lang);
  return (
    <CatalogueGrid
      eyebrow={`${decouverteTiles.length} ${pick(lang, 'LIEUX ET TRADITIONS', 'PLACES AND TRADITIONS')}`}
      title={pick(lang, 'Découverte', 'Discovery')}
      intro={pick(lang, 'Villages, coutumes, objets sacrés et figures traditionnelles. Ce qui est attesté est distingué de ce qui est raconté.', 'Villages, customs, sacred objects and traditional figures. What is documented is kept apart from what is told.')}
      tiles={decouverteTiles}
    />
  );
}
