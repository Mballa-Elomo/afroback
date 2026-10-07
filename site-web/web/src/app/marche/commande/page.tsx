'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field, Notice, Submit } from '@/components/auth-ui';
import { useMember } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { fcfa, placeOrders, type OrderItem } from '@/lib/market';
import { useLang } from '@/lib/lang-client';

/**
 * Commande : une commande par artisan, comme dans l'app. Le paiement Mobile
 * Money n'est pas encore branché sur le Marché : la commande est enregistrée
 * « en attente de paiement » et l'artisan contacte l'acheteur.
 */
export default function Commande() {
  const { ready, session, member } = useMember();
  const { items, subtotal, clear } = useCart();
  const { tr } = useLang();
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [tel, setTel] = useState('');
  const [methode, setMethode] = useState<'mtn_momo' | 'orange_money'>('mtn_momo');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ total: number; tel: string } | null>(null);

  useEffect(() => {
    if (ready && !session) router.replace('/connexion?suite=/marche/commande');
  }, [ready, session, router]);

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-5 pb-16 pt-40 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold text-4xl text-ink">✓</div>
        <h1 className="mt-6 font-display text-4xl font-black text-ivory">{tr('Commande enregistrée', 'Order placed')}</h1>
        <p className="mt-4 text-body">
          {tr("Le paiement Mobile Money n'est pas encore intégré au Marché. Le ou les artisans te contacteront au", 'Mobile Money payment is not yet built into the Market. The artisan(s) will contact you on')}{' '}
          <b className="text-ivory">{done.tel}</b>{' '}
          {tr(`pour finaliser le paiement (${fcfa(done.total)}) et organiser la livraison.`, `to complete the payment (${fcfa(done.total)}) and arrange delivery.`)}
        </p>
        <Link href="/marche/mes-commandes" className="mt-8 inline-block rounded-full bg-gold px-7 py-3 font-extrabold text-ink">
          {tr('Suivre mes commandes', 'Track my orders')}
        </Link>
      </div>
    );
  }
  if (!member) return <div className="min-h-screen" />;
  if (items.length === 0) {
    return (
      <div className="px-5 pt-40 text-center">
        <p className="text-body">{tr('Ton panier est vide.', 'Your cart is empty.')}</p>
        <Link href="/marche" className="mt-4 inline-block font-semibold text-gold">
          {tr('Retour au Marché', 'Back to the Market')}
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !adresse || !ville || !tel) return setError(tr('Tous les champs de livraison sont obligatoires.', 'All delivery fields are required.'));
    setBusy(true);
    setError(null);
    const byVendor = new Map<string, OrderItem[]>();
    items.forEach((it) => {
      const list = byVendor.get(it.vendorId) ?? [];
      list.push({ product_id: it.productId, nom: it.nom, prix_unitaire_fcfa: it.prix, quantite: it.quantite });
      byVendor.set(it.vendorId, list);
    });
    const r = await placeOrders(byVendor, { nom, adresse, ville, telephone: tel }, methode);
    setBusy(false);
    if (r.error) return setError(r.error);
    setDone({ total: subtotal, tel });
    clear();
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-5 pb-16 pt-32 md:px-10 lg:grid-cols-[1fr_340px]">
      <form onSubmit={submit} className="space-y-5">
        <h1 className="text-gold-gradient font-display text-5xl font-black">{tr('Livraison', 'Delivery')}</h1>
        <Field label={tr('Nom complet', 'Full name')} value={nom} onChange={setNom} autoComplete="name" />
        <Field label={tr('Adresse', 'Address')} value={adresse} onChange={setAdresse} autoComplete="street-address" />
        <Field label={tr('Ville', 'City')} value={ville} onChange={setVille} autoComplete="address-level2" />
        <Field label={tr('Téléphone', 'Phone')} value={tel} onChange={setTel} placeholder="+237 6XX XX XX XX" autoComplete="tel" />
        <p className="pt-2 text-sm font-semibold text-text">{tr('Moyen de paiement souhaité', 'Preferred payment method')}</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ['mtn_momo', 'MTN MoMo', 'bg-[#ffcc00]'],
              ['orange_money', 'Orange Money', 'bg-[#ff7900]'],
            ] as const
          ).map(([id, label, color]) => (
            <button type="button" key={id} onClick={() => setMethode(id)} className={`rounded-2xl border p-4 text-left transition ${methode === id ? 'border-gold bg-gold/10' : 'border-ivory/15'}`}>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold text-black ${color}`}>{label}</span>
            </button>
          ))}
        </div>
        {error && <Notice>{error}</Notice>}
        <Submit busy={busy}>{tr('Confirmer la commande', 'Confirm the order')}</Submit>
      </form>
      <aside className="h-fit rounded-[32px] bg-surface p-7 ring-1 ring-ivory/10 lg:sticky lg:top-28">
        <p className="font-bold text-ivory">{tr('Récapitulatif', 'Summary')}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((it) => (
            <li key={it.productId} className="flex justify-between gap-3 text-body">
              <span className="line-clamp-1">
                {it.quantite} × {it.nom}
              </span>
              <span>{fcfa(it.prix * it.quantite)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-ivory/10 pt-4 font-display text-3xl font-black text-gold">{fcfa(subtotal)}</p>
      </aside>
    </div>
  );
}
