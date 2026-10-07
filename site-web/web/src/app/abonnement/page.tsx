'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMember } from '@/lib/auth';
import { fcfa, price, type Periode, type Plan } from '@/lib/payment';
import { Notice } from '@/components/auth-ui';
import { PaymentSheet } from '@/components/PaymentSheet';
import { SubscriptionControls } from '@/components/SubscriptionControls';
import { useLang } from '@/lib/lang-client';

/**
 * Abonnements (lot 4) : mêmes forfaits et mêmes prix que l'app, paiement
 * Mobile Money Campay (MTN, Orange) sans quitter le site (feuille de paiement,
 * cdc-paiement-sans-sortie.md), résiliation / reprise. Le forfait actif vient
 * toujours du serveur (mon_abonnement), jamais d'un choix fait ici.
 */
const PLANS: { id: 'decouverte' | Plan; name: string; nameEn: string; perks: string[]; perksEn: string[]; highlight?: boolean }[] = [
  {
    id: 'decouverte',
    name: 'Découverte',
    nameEn: 'Découverte',
    perks: ['Reine Nzinga, le mythe de Ngan Medza et 2 lieux', 'Communauté en lecture', 'Marché', 'Soutenir AFROBACK'],
    perksEn: ['Queen Nzinga, the myth of Ngan Medza and 2 places', 'Read the community', 'Market', 'Support AFROBACK'],
  },
  {
    id: 'racines',
    name: 'Racines',
    nameEn: 'Racines',
    highlight: true,
    perks: ['Tous les héros, mythes et lieux', 'Narrations et vidéos', 'Publier, commenter, aimer et vendre', '-5 % au Marché'],
    perksEn: ['All heroes, myths and places', 'Narrations and videos', 'Post, comment, like and sell', '5% off at the Market'],
  },
  {
    id: 'heritage',
    name: 'Héritage',
    nameEn: 'Héritage',
    perks: ['Tout Racines', '-10 % au Marché', 'Badge premium', 'Avant-première des nouveaux récits'],
    perksEn: ['Everything in Racines', '10% off at the Market', 'Premium badge', 'Early access to new stories'],
  },
];
const NAME: Record<Plan, string> = { racines: 'Racines', heritage: 'Héritage' };
const NAME_EN = NAME; // noms de marque, identiques en anglais

function Abonnement() {
  const { session, member, subscription } = useMember();
  const { lang, tr, locale } = useLang();
  const router = useRouter();
  const wanted = useSearchParams().get('forfait');
  const [periode, setPeriode] = useState<Periode>('monthly');
  const [sheet, setSheet] = useState<Plan | null>(null);

  const choose = (plan: Plan) => {
    if (!session) return router.push(`/connexion?suite=${encodeURIComponent(`/abonnement?forfait=${plan}`)}`);
    if (!member) return;
    setSheet(plan);
  };

  // Arrivée depuis l'inscription (/bienvenue) ou la connexion avec un forfait choisi : la feuille s'ouvre d'elle-même, une fois.
  const autoOpened = useRef(false);
  useEffect(() => {
    if (autoOpened.current || !member || (wanted !== 'racines' && wanted !== 'heritage')) return;
    autoOpened.current = true;
    setTimeout(() => setSheet(wanted), 0);
  }, [member, wanted]);

  return (
    <div className="relative overflow-hidden px-5 pb-20 pt-32 md:px-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(240,195,107,0.22),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl text-center">
        <p className="text-xs font-bold tracking-[0.3em] text-gold">{tr('ABONNEMENTS', 'SUBSCRIPTIONS')}</p>
        <h1 className="text-gold-gradient is-animated mt-3 font-display text-5xl font-black md:text-7xl">{tr("Toute l'histoire, sans limite", 'The whole story, no limits')}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-body">{tr("Paiement simple par Mobile Money. Un seul abonnement pour le site et l'application.", 'Simple payment by Mobile Money. One subscription for the site and the app.')}</p>
        {subscription && (
          <div className="mx-auto mt-6 max-w-md">
            <Notice tone="success">
              {tr(`Forfait ${NAME[subscription.plan]} actif`, `${NAME_EN[subscription.plan]} plan active`)}
              {subscription.ends_at ? ` ${tr("jusqu'au", 'until')} ${new Date(subscription.ends_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}.{' '}
              {subscription.resilie_le ? '' : tr('Payer à nouveau prolonge ton abonnement.', 'Paying again extends your subscription.')}
            </Notice>
            <SubscriptionControls className="mt-4" />
          </div>
        )}

        <div className="mx-auto mt-10 inline-flex rounded-full bg-surface p-1.5 ring-1 ring-ivory/10">
          {(['monthly', 'yearly'] as Periode[]).map((p) => (
            <button key={p} onClick={() => setPeriode(p)} className={`relative rounded-full px-6 py-2.5 text-sm font-bold transition ${periode === p ? 'text-ink' : 'text-body'}`}>
              {periode === p && <motion.span layoutId="periode" className="absolute inset-0 rounded-full bg-gold" />}
              <span className="relative">
                {p === 'monthly' ? tr('Mensuel', 'Monthly') : tr('Annuel', 'Yearly')} {p === 'yearly' && <span className="ml-1 text-xs opacity-80">-17 %</span>}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
          {PLANS.map((p, i) => {
            const paid = p.id !== 'decouverte';
            const isCurrent = paid ? subscription?.plan === p.id : member && !subscription;
            const isWanted = wanted === p.id;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`relative flex flex-col rounded-[32px] p-8 ring-1 ${p.highlight || isWanted ? 'bg-gradient-to-b from-gold/20 to-surface ring-gold/60' : 'bg-surface ring-ivory/10'}`}
              >
                {p.highlight && <span className="absolute -top-3 left-8 rounded-full bg-gold px-3 py-1 text-[11px] font-extrabold tracking-wider text-ink">{tr('LE PLUS CHOISI', 'MOST POPULAR')}</span>}
                <p className="font-display text-3xl font-black text-ivory">{tr(p.name, p.nameEn)}</p>
                <p className="mt-4">
                  <span className="font-display text-4xl font-black text-gold">{paid ? fcfa(price(p.id as Plan, periode)) : tr('Gratuit', 'Free')}</span>
                  {paid && <span className="text-sm text-muted"> / {periode === 'monthly' ? tr('mois', 'month') : tr('an', 'year')}</span>}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {(lang === 'en' ? p.perksEn : p.perks).map((perk) => (
                    <li key={perk} className="flex gap-3 text-[15px] text-text">
                      <span className="text-gold">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                {paid ? (
                  <button
                    onClick={() => choose(p.id as Plan)}
                    className={`mt-8 rounded-full py-4 font-extrabold transition hover:-translate-y-0.5 ${p.highlight || isWanted ? 'bg-gold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.35)]' : 'bg-ivory/10 text-ivory ring-1 ring-ivory/20 hover:ring-gold'}`}
                  >
                    {isCurrent ? tr(`Renouveler ${p.name}`, `Renew ${p.nameEn}`) : tr(`Choisir ${p.name}`, `Choose ${p.nameEn}`)}
                  </button>
                ) : (
                  <p className="mt-8 rounded-full py-4 text-center text-sm font-bold text-muted ring-1 ring-ivory/10">{isCurrent ? tr('Ton forfait actuel', 'Your current plan') : tr('Inclus avec ton compte', 'Included with your account')}</p>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-body">
          <span className="rounded-full bg-[#ffcc00] px-4 py-1.5 font-extrabold text-black">MTN MoMo</span>
          <span className="rounded-full bg-[#ff7900] px-4 py-1.5 font-extrabold text-black">Orange Money</span>
          <span>{tr('Paiement sécurisé par Campay · sans engagement', 'Secure payment by Campay · no commitment')}</span>
        </div>
      </div>
      {sheet && <PaymentSheet request={{ type: 'abonnement', plan: sheet, periode }} onClose={() => setSheet(null)} />}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Abonnement />
    </Suspense>
  );
}
