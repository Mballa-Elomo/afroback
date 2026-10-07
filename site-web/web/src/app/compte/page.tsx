'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMember } from '@/lib/auth';
import { Avatar } from '@/components/Avatar';
import { useLang } from '@/lib/lang-client';
import { ProgressSummary } from '@/components/quiz';

const PLAN_NAME: Record<string, string> = { racines: 'Racines', heritage: 'Héritage' };
const PLAN_NAME_EN = PLAN_NAME; // noms de marque, identiques en anglais

export default function Compte() {
  const { ready, session, member, profile, subscription, signOut } = useMember();
  const { tr, locale } = useLang();
  const router = useRouter();
  useEffect(() => {
    if (ready && !session) router.replace('/connexion?suite=/compte');
  }, [ready, session, router]);
  if (!member) return <div className="min-h-screen" />;

  const prenom = (session?.user?.user_metadata?.prenom as string) ?? '';
  const ends = subscription?.ends_at ? new Date(subscription.ends_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const planName = (p: string) => tr(PLAN_NAME[p], PLAN_NAME_EN[p]);
  const tiles = [
    { href: '/compte/profil', title: tr('Mon profil', 'My profile'), text: tr('Pseudo, prénom, photo', 'Username, first name, photo') },
    { href: '/abonnement', title: tr('Mon abonnement', 'My subscription'), text: subscription ? `${planName(subscription.plan)} · ${tr('actif', 'active')}` : tr('Forfait Découverte (gratuit)', 'Découverte plan (free)') },
    { href: '/compte/mot-de-passe', title: tr('Mot de passe', 'Password'), text: tr('Changer de mot de passe', 'Change password') },
    { href: '/compte/securite', title: tr('Sécurité', 'Security'), text: tr('Vérification en 2 étapes', '2-step verification') },
    { href: '/profils', title: tr('Qui regarde ?', "Who's watching?"), text: tr('Ton profil et ceux de tes enfants', "Your profile and your children's") },
    { href: '/don', title: tr('Soutenir AFROBACK', 'Support AFROBACK'), text: tr('Financer les prochains récits', 'Fund the next stories') },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-32 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-gold/20 via-surface to-ink p-8 ring-1 ring-gold/25 md:p-12"
      >
        <div className="bg-pattern absolute inset-0 opacity-[0.06]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <Avatar url={profile?.avatar_url} name={profile?.pseudo || prenom} size={96} />
          <div className="flex-1">
            <p className="text-xs font-bold tracking-[0.25em] text-gold">{tr('MON COMPTE', 'MY ACCOUNT')}</p>
            <h1 className="mt-1 font-display text-4xl font-black text-ivory md:text-5xl">{prenom || profile?.pseudo}</h1>
            <p className="mt-1 text-body">
              @{profile?.pseudo ?? tr('sans pseudo', 'no username')} · {session?.user?.email}
            </p>
          </div>
          <div className="rounded-2xl bg-ink/60 px-6 py-4 text-center ring-1 ring-gold/30">
            <p className="text-xs font-bold tracking-[0.2em] text-muted">{tr('FORFAIT', 'PLAN')}</p>
            <p className="font-display text-2xl font-black text-gold">{subscription ? planName(subscription.plan) : 'Découverte'}</p>
            {ends && <p className="text-xs text-body">{tr("jusqu'au", 'until')} {ends}</p>}
          </div>
        </div>
      </motion.div>

      <ProgressSummary />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t, i) => (
          <motion.div key={t.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <Link href={t.href} className="group block rounded-3xl bg-surface p-6 ring-1 ring-ivory/10 transition hover:-translate-y-1 hover:ring-gold/50">
              <p className="font-display text-xl font-bold text-ivory">{t.title}</p>
              <p className="mt-1 text-sm text-body">{t.text}</p>
              <p className="mt-4 text-sm font-bold text-gold transition group-hover:translate-x-1">{tr('Ouvrir →', 'Open →')}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <button onClick={() => signOut().then(() => router.replace('/'))} className="mt-10 rounded-full border border-terra/40 px-6 py-3 font-bold text-terra transition hover:bg-terra/10">
        {tr('Se déconnecter', 'Sign out')}
      </button>
    </div>
  );
}
