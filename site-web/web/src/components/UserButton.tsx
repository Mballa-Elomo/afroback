'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Avatar } from './Avatar';
import { useLang } from '@/lib/lang-client';
import { usePaymentPolicy } from '@/lib/settings';
import { useModules } from '@/lib/settings';

const PLAN: Record<string, string> = { racines: 'Racines', heritage: 'Héritage' };
const PLAN_EN = PLAN; // noms de marque, identiques en anglais (décision de l'app)

/** Bouton de compte de la barre : « Se connecter » en invité, avatar + menu une fois connecté. */
export function UserButton({ compact }: { compact?: boolean }) {
  const { session, device, profile, subscription, signOut } = useAuth();
  const { tr } = useLang();
  const pay = usePaymentPolicy();
  const modules = useModules();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!session || device !== 'ok') {
    return (
      <Link
        href="/connexion"
        className={`rounded-full bg-gradient-to-r from-gold-pale via-gold to-gold-deep px-5 py-2.5 text-sm font-extrabold text-ink shadow-[0_6px_24px_rgba(240,195,107,0.35)] transition hover:-translate-y-0.5 ${compact ? '' : 'hidden sm:inline-block'}`}
      >
        {tr('Se connecter', 'Sign in')}
      </Link>
    );
  }

  const prenom = (session.user.user_metadata?.prenom as string) ?? '';
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-full p-0.5 transition hover:ring-2 hover:ring-gold/50" aria-label={tr('Mon compte', 'My account')} aria-expanded={open}>
        <Avatar url={profile?.avatar_url} name={profile?.pseudo || prenom} size={40} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl bg-surface/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-gold/20 backdrop-blur-xl"
          >
            <div className="border-b border-ivory/10 p-4">
              <p className="font-bold text-ivory">{prenom || profile?.pseudo}</p>
              <p className="text-xs text-gold">{subscription ? tr(`Forfait ${PLAN[subscription.plan]}`, `${PLAN_EN[subscription.plan]} plan`) : tr('Forfait Découverte', 'Découverte plan')}</p>
            </div>
            {[
              ['/profils', tr('Qui regarde ?', "Who's watching?")],
              ['/compte', tr('Mon compte', 'My account')],
              ['/abonnement', subscription ? tr('Mon abonnement', 'My subscription') : tr("S'abonner", 'Subscribe')],
              ['/don', tr('Soutenir AFROBACK', 'Support AFROBACK')],
            ].filter(([href]) => (href !== '/don' || pay.dons) && (href !== '/profils' || modules.espace_enfant)).map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-text hover:bg-ivory/5 hover:text-gold">
                {label}
              </Link>
            ))}
            <button
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.replace('/');
              }}
              className="block w-full border-t border-ivory/10 px-4 py-3 text-left text-sm text-terra hover:bg-ivory/5"
            >
              {tr('Se déconnecter', 'Sign out')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
