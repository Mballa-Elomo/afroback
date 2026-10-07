import { CatalogueGrid } from '@/components/CatalogueGrid';
import { getAllTiles } from '@/lib/catalogue';
import { getLang } from '@/lib/lang-server';
import { pick } from '@/lib/lang';

export const revalidate = 120;

export async function generateMetadata() {
  const lang = await getLang();
  return { title: pick(lang, 'Mythologie', 'Mythology'), description: pick(lang, 'Les récits fondateurs, transmis de génération en génération. Légendes présentées comme légendes.', 'Founding stories, handed down from generation to generation. Legends presented as legends.') };
}

export default async function MythesPage() {
  const lang = await getLang();
  const { mytheTiles } = await getAllTiles(lang);
  return (
    <CatalogueGrid
      eyebrow={`${mytheTiles.length} ${pick(lang, 'MYTHES FONDATEURS', 'FOUNDING MYTHS')}`}
      title={pick(lang, 'Mythologie', 'Mythology')}
      intro={pick(lang, 'Les récits fondateurs, transmis de génération en génération. Légendes présentées comme légendes.', 'Founding stories, handed down from generation to generation. Legends presented as legends.')}
      tiles={mytheTiles}
    />
  );
}
