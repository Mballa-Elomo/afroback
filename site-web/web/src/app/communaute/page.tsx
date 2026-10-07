'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/Avatar';
import { Composer, PostCard } from '@/components/community';
import { useMember } from '@/lib/auth';
import { feed, recentMembers, type Post, type Profile } from '@/lib/community';
import { useLang } from '@/lib/lang-client';

/** Communauté : fil central, profil et charte à gauche, nouveaux membres à droite. */
export default function Communaute() {
  const { member, profile, session } = useMember();
  const { tr } = useLang();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);

  const load = useCallback(() => {
    feed().then(setPosts);
    recentMembers().then(setMembers);
  }, []);
  useEffect(() => {
    load();
  }, [load, session?.user?.id]);

  return (
    <div>
      <section className="relative overflow-hidden px-5 pb-10 pt-32 md:px-14">
        <div className="bg-pattern absolute inset-0 opacity-[0.05]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_30%_0%,rgba(240,195,107,0.18),transparent_60%)]" />
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative text-xs font-bold tracking-[0.3em] text-gold">
          {tr('LA GRANDE FAMILLE AFROBACK', 'THE AFROBACK FAMILY')}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gold-gradient is-animated relative mt-3 font-display text-5xl font-black md:text-7xl">
          {tr('Communauté', 'Community')}
        </motion.h1>
        <p className="relative mt-4 max-w-2xl text-lg text-body">{tr('Partage tes histoires de famille, tes questions et tes découvertes avec celles et ceux qui reviennent aux origines.', 'Share your family stories, your questions and your discoveries with everyone going back to the roots.')}</p>
      </section>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-16 md:px-14 lg:grid-cols-[260px_1fr_280px]">
        <aside className="hidden space-y-5 lg:block">
          <div className="sticky top-28 space-y-5">
            {member && profile ? (
              <div className="rounded-3xl bg-surface p-6 text-center ring-1 ring-ivory/10">
                <div className="flex justify-center">
                  <Avatar url={profile.avatar_url} name={profile.pseudo} size={72} />
                </div>
                <p className="mt-3 font-bold text-ivory">{profile.pseudo}</p>
                <Link href={`/communaute/membre/${profile.id}`} className="mt-2 inline-block text-sm font-semibold text-gold">
                  {tr('Voir mon profil →', 'View my profile →')}
                </Link>
              </div>
            ) : (
              <div className="rounded-3xl bg-surface p-6 ring-1 ring-ivory/10">
                <p className="font-bold text-ivory">{tr('Rejoins la discussion', 'Join the conversation')}</p>
                <p className="mt-1 text-sm text-body">{tr('Crée ton compte gratuit pour suivre la communauté.', 'Create your free account to follow the community.')}</p>
                <Link href="/inscription" className="mt-4 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-ink">
                  {tr('Créer mon compte', 'Create my account')}
                </Link>
              </div>
            )}
            <Link href="/communaute/charte" className="block rounded-3xl bg-gradient-to-br from-terra-deep/20 to-surface p-6 ring-1 ring-terra/25 transition hover:ring-terra/60">
              <p className="text-xs font-bold tracking-[0.2em] text-terra">{tr('CHARTE', 'CHARTER')}</p>
              <p className="mt-1 font-display text-lg font-bold text-ivory">{tr('Les règles de la maison', 'House rules')}</p>
              <p className="mt-1 text-sm text-body">{tr('Respect, honnêteté, bienveillance.', 'Respect, honesty, kindness.')}</p>
            </Link>
          </div>
        </aside>

        <main className="space-y-6">
          <Composer onPosted={load} />
          {posts === null && <p className="text-muted">{tr('Chargement du fil…', 'Loading the feed…')}</p>}
          {posts && posts.length === 0 && (
            <div className="rounded-3xl bg-surface p-10 text-center ring-1 ring-ivory/10">
              <p className="font-display text-2xl font-bold text-ivory">{session ? tr('Le fil attend sa première histoire', 'The feed is waiting for its first story') : tr('Connecte-toi pour voir le fil', 'Sign in to see the feed')}</p>
              <p className="mt-2 text-body">{session
                  ? tr('Sois la première personne à partager quelque chose avec la communauté.', 'Be the first to share something with the community.')
                  : tr('Les publications de la communauté sont visibles avec un compte AFROBACK, même gratuit.', 'Community posts are visible with an AFROBACK account, even a free one.')}</p>
              {!session && (
                <Link href="/connexion?suite=/communaute" className="mt-5 inline-block rounded-full bg-gold px-6 py-3 font-bold text-ink">
                  {tr('Se connecter', 'Sign in')}
                </Link>
              )}
            </div>
          )}
          {posts?.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl bg-surface p-6 ring-1 ring-ivory/10">
            <p className="text-xs font-bold tracking-[0.2em] text-gold">{tr('NOUVEAUX MEMBRES', 'NEW MEMBERS')}</p>
            <ul className="mt-4 space-y-3">
              {members.map((m) => (
                <li key={m.id}>
                  <Link href={`/communaute/membre/${m.id}`} className="flex items-center gap-3 rounded-2xl p-1.5 transition hover:bg-ivory/5">
                    <Avatar url={m.avatar_url} name={m.pseudo} size={36} />
                    <span className="truncate text-sm font-semibold text-text">{m.pseudo}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
