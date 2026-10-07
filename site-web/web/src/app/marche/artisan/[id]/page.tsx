'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { ProductCard } from '@/components/market';
import { vendorPublic, type Product, type Vendor } from '@/lib/market';
import { useLang } from '@/lib/lang-client';

export default function Artisan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tr } = useLang();
  const [v, setV] = useState<Vendor | null | undefined>(undefined);
  const [list, setList] = useState<Product[]>([]);
  useEffect(() => {
    vendorPublic(id).then((r) => {
      setV(r.vendor);
      setList(r.products);
    });
  }, [id]);

  if (v === undefined) return <p className="px-5 pt-40 text-center text-muted">{tr('Chargement…', 'Loading…')}</p>;
  if (v === null) return <p className="px-5 pt-40 text-center text-body">{tr('Artisan introuvable.', 'Artisan not found.')}</p>;
  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-32 md:px-10">
      <Link href="/marche" className="text-sm font-semibold text-gold">
        ‹ {tr('Le Marché', 'The Market')}
      </Link>
      <div className="relative mt-6 overflow-hidden rounded-[36px] bg-gradient-to-br from-terra-deep/25 via-surface to-ink p-10 ring-1 ring-terra/25">
        <div className="bg-pattern absolute inset-0 opacity-[0.06]" />
        <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <Avatar url={v.avatar_url} name={v.nom_boutique} size={120} />
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-terra">{v.artisanat.toUpperCase()}</p>
            <h1 className="mt-1 font-display text-4xl font-black text-ivory md:text-5xl">{v.nom_boutique}</h1>
            <p className="mt-1 text-body">{v.region}</p>
            {v.bio && <p className="mt-4 max-w-2xl leading-relaxed text-text">{v.bio}</p>}
          </div>
        </div>
      </div>
      <h2 className="mt-12 font-display text-2xl font-bold text-heading">{tr('Ses créations', 'Creations')} · {list.length}</h2>
      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
        {list.map((p, i) => (
          <ProductCard key={p.id} p={{ ...p, vendor: v }} index={i} />
        ))}
      </div>
    </div>
  );
}
