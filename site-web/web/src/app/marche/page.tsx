'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MarketHeader, ProductCard } from '@/components/market';
import { CATEGORIES, products, type Categorie, type Product } from '@/lib/market';
import { useCart } from '@/lib/cart';
import { useLang } from '@/lib/lang-client';

/** Marché : artisanat authentique, en direct des artisans. Filtres par catégorie, tri, recherche. */
export default function Marche() {
  const [list, setList] = useState<Product[] | null>(null);
  const [cat, setCat] = useState<Categorie | 'tout'>('tout');
  const [sort, setSort] = useState<'recent' | 'prix_asc' | 'prix_desc'>('recent');
  const [q, setQ] = useState('');
  const { count } = useCart();
  const { tr } = useLang();

  useEffect(() => {
    products().then(setList);
  }, []);

  const shown = useMemo(() => {
    let l = (list ?? []).filter((p) => (cat === 'tout' || p.categorie === cat) && (!q || `${p.nom} ${p.vendor?.nom_boutique ?? ''}`.toLowerCase().includes(q.toLowerCase())));
    if (sort === 'prix_asc') l = [...l].sort((a, b) => a.prix_fcfa - b.prix_fcfa);
    if (sort === 'prix_desc') l = [...l].sort((a, b) => b.prix_fcfa - a.prix_fcfa);
    return l;
  }, [list, cat, sort, q]);

  return (
    <div>
      <MarketHeader
        eyebrow={tr('ARTISANAT AUTHENTIQUE', 'AUTHENTIC CRAFTS')}
        title={tr('Le Marché', 'The Market')}
        text={tr('Sculptures, bijoux, textiles, poteries : achète en direct aux artisans du continent.', 'Sculptures, jewellery, textiles, pottery: buy directly from artisans across the continent.')}
      >
        <div className="flex gap-3">
          <Link href="/marche/panier" className="rounded-full bg-ivory/10 px-5 py-3 text-sm font-bold text-ivory ring-1 ring-ivory/20 hover:ring-gold">
            🛒 {tr('Panier', 'Cart')} {count > 0 && <span className="ml-1 rounded-full bg-gold px-2 py-0.5 text-ink">{count}</span>}
          </Link>
          <Link href="/marche/vendeur" className="rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-ink">
            {tr('Espace vendeur', 'Seller space')}
          </Link>
        </div>
      </MarketHeader>

      <div className="sticky top-0 z-30 border-y border-ivory/10 bg-ink/85 backdrop-blur-xl md:top-[88px]">
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 md:px-14">
          <div className="no-scrollbar flex w-full gap-2 overflow-x-auto md:w-auto md:flex-1">
            {[{ id: 'tout' as const, label: 'Tout', en: 'All' }, ...CATEGORIES].map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)} className={`relative shrink-0 rounded-full px-4 py-2 text-xs font-bold tracking-wider ${cat === c.id ? 'text-ink' : 'text-body hover:text-ivory'}`}>
                {cat === c.id && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-gold" />}
                <span className="relative">{tr(c.label, c.en).toUpperCase()}</span>
              </button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Rechercher…', 'Search…')} className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2 text-sm text-ivory ring-1 ring-ivory/10 placeholder:text-muted focus:outline-none focus:ring-gold/50 md:w-56 md:flex-none" />
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-full bg-surface px-4 py-2 text-sm text-body ring-1 ring-ivory/10 focus:outline-none">
            <option value="recent">{tr('Plus récents', 'Newest')}</option>
            <option value="prix_asc">{tr('Prix croissant', 'Price: low to high')}</option>
            <option value="prix_desc">{tr('Prix décroissant', 'Price: high to low')}</option>
          </select>
        </div>
      </div>

      <div className="px-5 py-12 md:px-14">
        {list === null && <p className="text-muted">{tr('Chargement du catalogue…', 'Loading the catalogue…')}</p>}
        {list && list.length === 0 && (
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[36px] bg-gradient-to-br from-terra-deep/25 via-surface to-ink p-12 text-center ring-1 ring-terra/25">
            <div className="bg-pattern absolute inset-0 opacity-[0.06]" />
            <p className="relative text-xs font-bold tracking-[0.3em] text-terra">{tr('OUVERTURE PROCHAINE', 'OPENING SOON')}</p>
            <p className="relative mt-3 font-display text-4xl font-black text-ivory">{tr('Les premiers artisans arrivent', 'The first artisans are on their way')}</p>
            <p className="relative mx-auto mt-4 max-w-lg text-body">{tr('Tu es artisan ? Ouvre ta boutique sur AFROBACK et présente tes créations à toute la communauté.', 'Are you an artisan? Open your shop on AFROBACK and show your creations to the whole community.')}</p>
            <Link href="/marche/vendeur" className="relative mt-8 inline-block rounded-full bg-gold px-8 py-4 font-extrabold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.35)]">
              {tr('Ouvrir ma boutique', 'Open my shop')}
            </Link>
          </div>
        )}
        {list && list.length > 0 && shown.length === 0 && <p className="text-body">{tr('Aucun article ne correspond.', 'No matching item.')}</p>}
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
          {shown.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/marche/mes-commandes" className="text-sm font-semibold text-gold hover:underline">
            {tr('Suivre mes commandes →', 'Track my orders →')}
          </Link>
        </div>
      </div>
    </div>
  );
}
