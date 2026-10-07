'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/Avatar';
import { ProductCard } from '@/components/market';
import { useMember } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { addReview, catLabel, fcfa, product, reviews, vendorPublic, type Product, type Review } from '@/lib/market';
import { useLang } from '@/lib/lang-client';

export default function ProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { member, profile, session } = useMember();
  const { add } = useCart();
  const { tr, lang } = useLang();
  const [p, setP] = useState<Product | null | undefined>(undefined);
  const [others, setOthers] = useState<Product[]>([]);
  const [revs, setRevs] = useState<Review[]>([]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [note, setNote] = useState(5);
  const [avis, setAvis] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    product(id).then((x) => {
      setP(x);
      if (x) vendorPublic(x.vendor_id).then((v) => setOthers(v.products.filter((o) => o.id !== x.id)));
    });
    reviews(id).then(setRevs);
  }, [id]);

  if (p === undefined) return <p className="px-5 pt-40 text-center text-muted">{tr('Chargement…', 'Loading…')}</p>;
  if (p === null) return <p className="px-5 pt-40 text-center text-body">{tr('Article introuvable.', 'Item not found.')}</p>;
  const out = p.statut === 'rupture' || p.stock <= 0;
  const avg = revs.length ? revs.reduce((s, r) => s + r.note, 0) / revs.length : 0;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-32 md:px-10">
      <Link href="/marche" className="text-sm font-semibold text-gold">
        ‹ {tr('Le Marché', 'The Market')}
      </Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="overflow-hidden rounded-[32px] bg-surface ring-1 ring-ivory/10">
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image_url} alt={p.nom} className="aspect-square w-full object-cover" />
          ) : (
            <div className="bg-pattern aspect-square opacity-20" />
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-xs font-bold tracking-[0.25em] text-terra">{catLabel(p.categorie, lang).toUpperCase()}</p>
          <h1 className="mt-2 font-display text-4xl font-black text-ivory md:text-5xl">{p.nom}</h1>
          {revs.length > 0 && (
            <p className="mt-2 text-sm text-gold">
              {'★'.repeat(Math.round(avg))}
              <span className="text-muted">{'★'.repeat(5 - Math.round(avg))}</span> <span className="text-body">({revs.length} {tr('avis', revs.length > 1 ? 'reviews' : 'review')})</span>
            </p>
          )}
          <p className="mt-5 font-display text-4xl font-black text-gold">{fcfa(p.prix_fcfa)}</p>
          {p.description && <p className="mt-5 whitespace-pre-line leading-relaxed text-body">{p.description}</p>}
          <p className={`mt-4 text-sm font-semibold ${out ? 'text-terra' : 'text-free'}`}>{out ? tr('Épuisé', 'Sold out') : tr(`${p.stock} en stock`, `${p.stock} in stock`)}</p>
          {!out && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-full ring-1 ring-ivory/20">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-12 text-xl text-ivory">
                  −
                </button>
                <span className="w-8 text-center font-bold text-ivory">{qty}</span>
                <button onClick={() => setQty(Math.min(p.stock, qty + 1))} className="h-12 w-12 text-xl text-ivory">
                  +
                </button>
              </div>
              <button
                onClick={() => {
                  add({ productId: p.id, vendorId: p.vendor_id, nom: p.nom, prix: p.prix_fcfa, image: p.image_url, stock: p.stock }, qty);
                  setAdded(true);
                }}
                className="flex-1 rounded-full bg-gold py-4 font-extrabold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.35)] transition hover:-translate-y-0.5"
              >
                {tr('Ajouter au panier', 'Add to cart')}
              </button>
            </div>
          )}
          {added && (
            <p className="mt-3 text-sm text-free">
              {tr('Ajouté !', 'Added!')}{' '}
              <Link href="/marche/panier" className="font-semibold text-gold">
                {tr('Voir le panier →', 'View cart →')}
              </Link>
            </p>
          )}
          {p.vendor && (
            <Link href={`/marche/artisan/${p.vendor.id}`} className="mt-8 flex items-center gap-4 rounded-3xl bg-surface p-5 ring-1 ring-ivory/10 transition hover:ring-gold/50">
              <Avatar url={p.vendor.avatar_url} name={p.vendor.nom_boutique} size={52} />
              <div>
                <p className="font-bold text-ivory">{p.vendor.nom_boutique}</p>
                <p className="text-sm text-body">
                  {p.vendor.artisanat} · {p.vendor.region}
                </p>
              </div>
              <span className="ml-auto text-gold">→</span>
            </Link>
          )}
        </motion.div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-heading">{tr('Avis', 'Reviews')}</h2>
        {revs.length === 0 && <p className="mt-3 text-body">{tr("Pas encore d'avis sur cet article.", 'No reviews for this item yet.')}</p>}
        <ul className="mt-5 space-y-4">
          {revs.map((r) => (
            <li key={r.id} className="rounded-3xl bg-surface p-5 ring-1 ring-ivory/10">
              <p className="text-gold">
                {'★'.repeat(r.note)}
                <span className="text-muted">{'★'.repeat(5 - r.note)}</span>
              </p>
              <p className="mt-2 text-text">{r.commentaire}</p>
              <p className="mt-2 text-xs text-muted">{r.auteur_nom}</p>
              {r.reponse_vendeur && <p className="mt-3 rounded-2xl bg-gold/10 p-3 text-sm text-body">{tr("Réponse de l'artisan :", "Artisan's reply:")} {r.reponse_vendeur}</p>}
            </li>
          ))}
        </ul>
        {member && session && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const r = await addReview(p.id, profile?.pseudo ?? tr('Membre', 'Member'), note, avis.trim());
              setMsg(r.error ?? tr('Merci pour ton avis !', 'Thank you for your review!'));
              if (!r.error) {
                setAvis('');
                reviews(id).then(setRevs);
              }
            }}
            className="mt-6 rounded-3xl bg-surface p-5 ring-1 ring-ivory/10"
          >
            <p className="font-bold text-ivory">{tr('Tu as acheté cet article ? Donne ton avis', 'Bought this item? Leave a review')}</p>
            <div className="mt-3 flex gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setNote(n)} className={n <= note ? 'text-gold' : 'text-muted'}>
                  ★
                </button>
              ))}
            </div>
            <textarea value={avis} onChange={(e) => setAvis(e.target.value)} rows={3} required className="mt-3 w-full rounded-2xl bg-ink/60 px-4 py-3 text-sm text-ivory ring-1 ring-ivory/10 focus:outline-none focus:ring-gold/40" />
            {msg && <p className="mt-2 text-sm text-body">{msg}</p>}
            <button className="mt-3 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-ink">{tr('Publier mon avis', 'Post my review')}</button>
          </form>
        )}
      </section>

      {others.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-heading">{tr('Du même artisan', 'From the same artisan')}</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            {others.slice(0, 4).map((o, i) => (
              <ProductCard key={o.id} p={o} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
