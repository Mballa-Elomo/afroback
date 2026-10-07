'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/lib/cart';
import { fcfa } from '@/lib/market';
import { useLang } from '@/lib/lang-client';

export default function Panier() {
  const { items, subtotal, setQty, remove } = useCart();
  const { tr } = useLang();
  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-32 md:px-10">
      <Link href="/marche" className="text-sm font-semibold text-gold">
        ‹ {tr('Continuer mes achats', 'Continue shopping')}
      </Link>
      <h1 className="text-gold-gradient mt-4 font-display text-5xl font-black">{tr('Mon panier', 'My cart')}</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-[32px] bg-surface p-12 text-center ring-1 ring-ivory/10">
          <p className="font-display text-2xl font-bold text-ivory">{tr('Ton panier est vide', 'Your cart is empty')}</p>
          <Link href="/marche" className="mt-6 inline-block rounded-full bg-gold px-7 py-3 font-extrabold text-ink">
            {tr('Découvrir le Marché', 'Explore the Market')}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          <ul className="space-y-4">
            <AnimatePresence>
              {items.map((it) => (
                <motion.li key={it.productId} layout exit={{ opacity: 0, x: -40 }} className="flex items-center gap-5 rounded-3xl bg-surface p-4 ring-1 ring-ivory/10">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-ink">
                    {it.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/marche/produit/${it.productId}`} className="line-clamp-1 font-bold text-ivory hover:text-gold">
                      {it.nom}
                    </Link>
                    <p className="font-bold text-gold">{fcfa(it.prix)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full ring-1 ring-ivory/20">
                        <button onClick={() => setQty(it.productId, it.quantite - 1)} className="h-9 w-9 text-ivory">
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-ivory">{it.quantite}</span>
                        <button onClick={() => setQty(it.productId, it.quantite + 1)} className="h-9 w-9 text-ivory">
                          +
                        </button>
                      </div>
                      <button onClick={() => remove(it.productId)} className="text-xs text-muted hover:text-terra">
                        {tr('Retirer', 'Remove')}
                      </button>
                    </div>
                  </div>
                  <p className="hidden font-display text-lg font-bold text-ivory sm:block">{fcfa(it.prix * it.quantite)}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <aside className="h-fit rounded-[32px] bg-gradient-to-b from-gold/12 to-surface p-7 ring-1 ring-gold/25 lg:sticky lg:top-28">
            <p className="text-sm text-body">{tr('Sous-total', 'Subtotal')}</p>
            <p className="font-display text-4xl font-black text-gold">{fcfa(subtotal)}</p>
            <p className="mt-2 text-xs text-muted">{tr('Livraison organisée directement avec chaque artisan.', 'Delivery is arranged directly with each artisan.')}</p>
            <Link href="/marche/commande" className="mt-6 block rounded-full bg-gold py-4 text-center font-extrabold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.35)]">
              {tr('Passer la commande', 'Place the order')}
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
