'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMember } from '@/lib/auth';
import { fcfa, myOrders, statutLabel, type Order } from '@/lib/market';
import { useLang } from '@/lib/lang-client';

export default function MesCommandes() {
  const { ready, session, member } = useMember();
  const { tr, lang, locale } = useLang();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => {
    if (ready && !session) router.replace('/connexion?suite=/marche/mes-commandes');
    if (member) myOrders().then(setOrders);
  }, [ready, session, member, router]);

  return (
    <div className="mx-auto max-w-4xl px-5 pb-16 pt-32">
      <Link href="/marche" className="text-sm font-semibold text-gold">
        ‹ {tr('Le Marché', 'The Market')}
      </Link>
      <h1 className="text-gold-gradient mt-4 font-display text-5xl font-black">{tr('Mes commandes', 'My orders')}</h1>
      {orders?.length === 0 && <p className="mt-8 text-body">{tr("Tu n'as pas encore passé de commande.", "You haven't placed an order yet.")}</p>}
      <ul className="mt-8 space-y-4">
        {orders?.map((o) => (
          <li key={o.id} className="rounded-3xl bg-surface p-6 ring-1 ring-ivory/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">{new Date(o.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${o.statut === 'expediee' || o.statut === 'livree' ? 'bg-free/20 text-free' : o.statut === 'annulee' ? 'bg-terra/20 text-terra' : 'bg-gold/15 text-gold'}`}>
                {statutLabel(o.statut, lang)}
              </span>
            </div>
            <ul className="mt-3 space-y-1 text-body">
              {o.items.map((it) => (
                <li key={it.product_id}>
                  {it.quantite} × {it.nom}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-display text-2xl font-black text-gold">{fcfa(o.montant_total_fcfa)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
