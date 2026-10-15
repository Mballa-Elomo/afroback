import { HeroCarousel, type Slide } from '@/components/HeroCarousel';
import { Row } from '@/components/Row';
import { Manifesto, NamesMarquee, TopRanked, Universes } from '@/components/HomeSections';
import { getAllTiles, getDetail, pickFeatured } from '@/lib/catalogue';
import { videosOf } from '@/lib/content';
import type { Tile } from '@/lib/types';
import { getLang } from '@/lib/lang-server';
import { pick } from '@/lib/lang';
import { RenewBanner } from '@/components/SubscriptionControls';
import { BanniereSponsor } from '@/components/Sponsor';

export const revalidate = 120;

/**
 * Accueil (refonte « cinéma » du 2026-10-02) : carrousel d'ouverture, rangées
 * animées, classement des plus suivis, trois univers, manifeste. Tout vient
 * des vraies données : thèmes, contenus gratuits, statistiques réelles.
 */
export default async function Home() {
  const lang = await getLang();
  const t = (fr: string, en: string) => pick(lang, fr, en);
  const { heroes, decouverte, heroTiles, mytheTiles, decouverteTiles } = await getAllTiles(lang);
  const all: Tile[] = [...heroTiles, ...mytheTiles, ...decouverteTiles];

  // Carrousel : le récit à la une, puis les récits avec image les plus suivis (un mythe inclus).
  const featured = pickFeatured(heroes);
  const pool = [
    heroTiles.find((t) => t.slug === featured?.slug),
    ...[...heroTiles].filter((t) => t.image && t.slug !== featured?.slug).sort((a, b) => b.score - a.score).slice(0, 3),
    [...mytheTiles].filter((t) => t.image).sort((a, b) => b.score - a.score)[0],
  ].filter((t): t is Tile => !!t);
  const slides: Slide[] = await Promise.all(
    pool.map(async (tile, i) => {
      let video: string | null = null;
      if (tile.free) {
        const d = await getDetail(tile.type, tile.slug);
        video = videosOf(d, tile.type, lang, tile.title)[0]?.src ?? null;
      }
      return { tile, video, label: i === 0 ? t('À LA UNE', 'FEATURED') : tile.type === 'mythe' ? t('MYTHE FONDATEUR', 'FOUNDING MYTH') : t('HISTOIRE & HÉROS', 'HISTORY & HEROES') };
    })
  );

  const byTheme = (theme: string) => heroTiles.filter((t) => heroes.find((h) => h.slug === t.slug)?.theme?.includes(theme));
  const top = all.filter((t) => t.score > 0 && t.image).sort((a, b) => b.score - a.score).slice(0, 10);
  const decouverteBy = (types: string[]) => decouverteTiles.filter((tile) => types.includes(decouverte.find((d) => d.slug === tile.slug)?.type ?? ''));
  const img = (tiles: Tile[]) => tiles.find((t) => t.image)?.image ?? null;

  return (
    <>
      <HeroCarousel slides={slides} />
      <div className="relative z-10 -mt-16 md:-mt-24">
        <RenewBanner className="relative mx-5 mb-6 md:mx-14" />
        <Row title={t('Gratuit sur AFROBACK', 'Free on AFROBACK')} subtitle={t('Commence ici : à lire, écouter et regarder sans abonnement', 'Start here: read, listen and watch without a subscription')} tiles={all.filter((x) => x.free)} variant="wide" />
        <BanniereSponsor className="relative mx-5 my-8 md:mx-14" />
        <Row title={t('Les résistants', 'The resisters')} subtitle={t('Ceux et celles qui ont dit non', 'The men and women who said no')} tiles={byTheme('Résistance')} href="/heros" />
        <TopRanked tiles={top} />
        <Row title={t('Mythes fondateurs', 'Founding myths')} subtitle={t('Les récits que les peuples se transmettent depuis des siècles', 'The stories peoples have handed down for centuries')} tiles={mytheTiles} href="/mythes" />
        <NamesMarquee names={heroTiles.map((t) => t.title)} />
        <Universes
          items={[
            { href: '/heros', title: t('Histoires & Héros', 'History & Heroes'), count: `${heroTiles.length} ${t('RÉCITS', 'STORIES')}`, text: t('Rois, reines, résistants, bâtisseurs et artistes, racontés comme par un griot.', 'Kings, queens, resisters, builders and artists, told the way a griot would.'), image: img(byTheme('Résistance')) },
            { href: '/mythes', title: t('Mythologie', 'Mythology'), count: `${mytheTiles.length} ${t('MYTHES', 'MYTHS')}`, text: t('Les légendes fondatrices des peuples, présentées comme légendes.', 'The founding legends of peoples, presented as legends.'), image: img(mytheTiles) },
            { href: '/decouverte', title: t('Découverte', 'Discovery'), count: `${decouverteTiles.length} ${t('LIEUX ET TRADITIONS', 'PLACES AND TRADITIONS')}`, text: t('Villages, coutumes, objets sacrés et figures traditionnelles.', 'Villages, customs, sacred objects and traditional figures.'), image: img(decouverteTiles) },
          ]}
        />
        <Row title={t('Bâtisseurs et politiques', 'Builders and statesmen')} tiles={byTheme('Politique')} href="/heros" />
        <Row title={t('Villages et lieux', 'Villages and places')} tiles={decouverteBy(['village'])} href="/decouverte" />
        <Row title={t('Arts et savoirs', 'Arts and knowledge')} tiles={heroTiles.filter((h) => heroes.find((x) => x.slug === h.slug)?.theme?.some((th) => th === 'Art' || th === 'Science'))} href="/heros" />
        <Row title={t('Coutumes, objets et personnages', 'Customs, objects and figures')} tiles={decouverteBy(['coutume', 'objet', 'personnage'])} href="/decouverte" />
        <Manifesto />
        <Row title={t('Tous les héros', 'All heroes')} tiles={heroTiles} href="/heros" />
      </div>
    </>
  );
}
