'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { catLabel, fcfa, type Product } from '@/lib/market';
import { useLang } from '@/lib/lang-client';

/** Carte produit : photo, catégorie, nom, prix, artisan ; zoom et halo au survol. */
export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const out = p.statut === 'rupture' || p.stock <= 0;
  const { tr, lang } = useLang();
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index, 8) * 0.05 }}>
      <Link href={`/marche/produit/${p.id}`} className="group block overflow-hidden rounded-3xl bg-surface ring-1 ring-ivory/10 transition hover:-translate-y-1 hover:glow-gold">
        <div className="relative aspect-square overflow-hidden bg-ink">
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          ) : (
            <span className="bg-pattern absolute inset-0 opacity-20" />
          )}
          <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-[10px] font-extrabold tracking-wider text-gold backdrop-blur">{catLabel(p.categorie, lang).toUpperCase()}</span>
          {out && <span className="absolute right-3 top-3 rounded-full bg-terra px-3 py-1 text-[10px] font-extrabold text-ink">{tr('ÉPUISÉ', 'SOLD OUT')}</span>}
        </div>
        <div className="p-5">
          <p className="line-clamp-1 font-display text-lg font-bold text-ivory">{p.nom}</p>
          {p.vendor && <p className="mt-0.5 text-xs text-muted">{tr('par', 'by')} {p.vendor.nom_boutique}</p>}
          <p className="mt-3 font-display text-xl font-black text-gold">{fcfa(p.prix_fcfa)}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export function MarketHeader({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-32 md:px-14">
      <div className="bg-pattern absolute inset-0 opacity-[0.05]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_70%_0%,rgba(227,162,119,0.2),transparent_60%)]" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] text-terra">{eyebrow}</p>
          <h1 className="text-gold-gradient is-animated mt-3 font-display text-5xl font-black md:text-7xl">{title}</h1>
          {text && <p className="mt-4 max-w-2xl text-lg text-body">{text}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
