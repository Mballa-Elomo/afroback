'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMember } from '@/lib/auth';
import { useKid } from '@/lib/kid';
import { ageLabel, childProfiles, PARENT_OK, type ChildProfile } from '@/lib/kids';
import { Avatar } from '@/components/Avatar';
import { KidAvatar, PinGate } from '@/components/kids';
import { useLang } from '@/lib/lang-client';

/**
 * « Qui regarde ? » façon Netflix, comme l'écran de sélection de l'app : le
 * parent, ses enfants (accès libre, sans code), l'ajout d'un profil et
 * l'Espace Parent (protégé par le code PIN).
 */


export default function Profils() {
  const { ready, session, member, profile } = useMember();
  const { enterKid, markChosen } = useKid();
  const { tr, lang } = useLang();
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[] | null>(null);
  const [pin, setPin] = useState(false);

  useEffect(() => {
    if (ready && !session) router.replace('/connexion?suite=/profils');
    if (member) childProfiles().then(setChildren);
  }, [ready, session, member, router]);
  if (!member) return <div className="min-h-screen" />;

  const prenom = (session?.user?.user_metadata?.prenom as string) || profile?.pseudo || tr('Moi', 'Me');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 pb-16 pt-28">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-black text-ivory md:text-6xl">
        {tr('Qui regarde ?', "Who's watching?")}
      </motion.h1>
      <div className="mt-12 flex flex-wrap justify-center gap-8">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => {
            markChosen();
            router.push('/');
          }}
          className="group w-[140px] text-center"
        >
          <span className="mx-auto block w-fit rounded-3xl p-1 ring-2 ring-transparent transition group-hover:ring-gold">
            <Avatar url={profile?.avatar_url} name={prenom} size={132} />
          </span>
          <span className="mt-3 block text-lg font-semibold text-body group-hover:text-ivory">{prenom}</span>
        </motion.button>
        {children?.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 * (i + 1) }}
            onClick={() => {
              enterKid(c);
              router.push('/enfant');
            }}
            className="group w-[140px] text-center"
          >
            <span className="mx-auto block w-fit rounded-[34%] p-1 ring-2 ring-transparent transition group-hover:ring-gold">
              <KidAvatar prenom={c.prenom} couleur={c.avatar_couleur} size={132} />
            </span>
            <span className="mt-3 block text-lg font-semibold text-body group-hover:text-ivory">{c.prenom}</span>
            <span className="text-xs text-muted">{ageLabel(c.age, lang)} · {tr('Espace enfant', 'Kids space')}</span>
          </motion.button>
        ))}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 * ((children?.length ?? 0) + 1) }} className="w-[140px] text-center">
          <Link href="/profils/ajouter" className="group block">
            <span className="mx-auto grid h-[140px] w-[140px] place-items-center rounded-[34%] border-2 border-dashed border-ivory/25 text-5xl text-muted transition group-hover:border-gold group-hover:text-gold">+</span>
            <span className="mt-3 block text-lg font-semibold text-body group-hover:text-ivory">{tr('Ajouter un enfant', 'Add a child')}</span>
          </Link>
        </motion.div>
      </div>
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <button onClick={() => setPin(true)} className="rounded-full border border-gold/40 px-6 py-2.5 text-sm font-bold tracking-widest text-gold hover:bg-gold/10">
          🔐 {tr('ESPACE PARENT', 'PARENT SPACE')}
        </button>
        <Link href="/compte" className="rounded-full border border-ivory/20 px-6 py-2.5 text-sm font-bold tracking-widest text-body hover:border-gold hover:text-gold">
          {tr('GÉRER MON COMPTE', 'MANAGE MY ACCOUNT')}
        </Link>
      </div>
      <PinGate
        open={pin}
        onCancel={() => setPin(false)}
        onSuccess={() => {
          setPin(false);
          try {
            sessionStorage.setItem(PARENT_OK, String(Date.now()));
          } catch {}
          router.push('/profils/parent');
        }}
      />
    </div>
  );
}
