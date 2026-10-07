'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ContentType, Tile } from '@/lib/types';
import { TYPE_PATH } from '@/lib/catalogue';
import { useMember } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';
import { localeOf, type Lang } from '@/lib/lang';

/**
 * Ligne de statistiques façon YouTube (lectures · écoutes · vues, vrais
 * chiffres de stats_contenu) et boutons J'aime / Commentaires / Partager.
 * J'aimer demande un compte (connexion au lot 3) : en invité, une invitation
 * à se connecter s'affiche, comme dans l'application.
 */

type Stats = { lectures: number; ecoutes: number; vues: number; likes: number; aime: boolean; peut_aimer?: boolean };

const plural = (lang: Lang, n: number, one: string, many: string) => `${n.toLocaleString(localeOf(lang))} ${n > 1 ? many : one}`;

export function ContentActions({ type, tile, onComments }: { type: ContentType; tile: Tile; onComments?: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [gate, setGate] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const { member, session, subscription } = useMember();
  const { lang, tr } = useLang();

  useEffect(() => {
    supabase.rpc('stats_contenu', { p_type: type, p_slug: tile.slug }).then(({ data }) => data && setStats(data as Stats));
  }, [type, tile.slug, session?.user?.id, subscription?.plan]);

  // J'aime (aimer_contenu, même règle que l'app : réservé aux comptes qui ont accès au contenu).
  const toggleLike = async () => {
    if (!member) return setGate(true);
    if (!stats || busy) return;
    if (stats.peut_aimer === false) return setPaywall(true);
    const like = !stats.aime;
    setBusy(true);
    setStats({ ...stats, aime: like, likes: Math.max(0, stats.likes + (like ? 1 : -1)) });
    const { data, error } = await supabase.rpc('aimer_contenu', { p_type: type, p_slug: tile.slug, p_aime: like });
    setBusy(false);
    const res = data as { ok?: boolean; likes?: number } | null;
    if (error || !res?.ok) setStats((s) => (s ? { ...s, aime: !like, likes: Math.max(0, s.likes + (like ? -1 : 1)) } : s));
    else setStats((s) => (s ? { ...s, aime: like, likes: res.likes ?? s.likes } : s));
  };

  const share = async () => {
    const url = `${window.location.origin}/${TYPE_PATH[type]}/${tile.slug}`;
    const accroche =
      type === 'heros'
        ? tr(`Découvre l'histoire de ${tile.title} sur AFROBACK`, `Discover the story of ${tile.title} on AFROBACK`)
        : type === 'mythe'
          ? tr(`Découvre le mythe « ${tile.title} » sur AFROBACK`, `Discover the myth “${tile.title}” on AFROBACK`)
          : tr(`À découvrir sur AFROBACK : ${tile.title}`, `Discover on AFROBACK: ${tile.title}`);
    const text = `✨ ${accroche}\n\n${tile.summary}`;
    if (navigator.share) {
      navigator.share({ title: tile.title, text, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n\n👉 ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      /* presse-papiers refusé */
    }
  };

  const parts: string[] = [];
  if (stats?.lectures) parts.push(plural(lang, stats.lectures, tr('lecture', 'read'), tr('lectures', 'reads')));
  if (stats?.ecoutes) parts.push(plural(lang, stats.ecoutes, tr('écoute', 'listen'), tr('écoutes', 'listens')));
  if (stats?.vues) parts.push(plural(lang, stats.vues, tr('vue', 'view'), tr('vues', 'views')));

  const pill = 'inline-flex items-center gap-2 rounded-full border border-ivory/15 bg-ink/40 px-4 py-2 text-sm font-semibold text-text backdrop-blur transition hover:border-gold/50 hover:text-ivory';

  return (
    <div className="space-y-3">
      {parts.length > 0 && <p className="text-sm font-medium text-body">{parts.join('  ·  ')}</p>}
      <div className="flex flex-wrap gap-2">
        <button onClick={toggleLike} className={`${pill} ${stats?.aime ? '!border-gold !bg-gold !text-ink' : ''}`} aria-label={tr("J'aime", 'Like')} aria-pressed={!!stats?.aime}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v11H3V10zM7 10l4-8a3 3 0 0 1 3 3v4h6a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H7" />
          </svg>
          {stats && stats.likes > 0 ? stats.likes : tr("J'aime", 'Like')}
        </button>
        <button onClick={() => (onComments ? onComments() : document.getElementById('commentaires')?.scrollIntoView({ behavior: 'smooth' }))} className={pill}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z" />
          </svg>
          {tr('Commentaires', 'Comments')}
        </button>
        <button onClick={share} className={pill}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
          </svg>
          {copied ? tr('Message copié !', 'Message copied!') : tr('Partager', 'Share')}
        </button>
      </div>
      {gate && <AccountGate reason={tr('aimer ce récit', 'like this story')} onClose={() => setGate(false)} />}
      {paywall && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4" onClick={() => setPaywall(false)} role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-xl bg-surface p-7 text-center ring-1 ring-gold/25" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-xl font-bold text-ivory">{tr('Réservé aux abonnés', 'Members only')}</p>
            <p className="mt-2 text-sm text-body">{tr('Abonne-toi pour aimer et commenter tous les récits.', 'Subscribe to like and comment on every story.')}</p>
            <Link href="/abonnement" className="mt-6 block rounded-md bg-gold px-5 py-3 font-bold text-ink hover:bg-gold-pale">
              {tr('Voir les abonnements', 'See subscriptions')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/** Invitation à se connecter (actions réservées aux membres). */
export function AccountGate({ reason, onClose }: { reason: string; onClose: () => void }) {
  const { tr } = useLang();
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-xl bg-surface p-7 text-center ring-1 ring-gold/25" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-medaillon.jpg" alt="" className="mx-auto h-16 w-16 rounded-full ring-2 ring-gold" />
        <p className="mt-4 font-display text-xl font-bold text-ivory">{tr(`Crée ton compte pour ${reason}`, `Create your account to ${reason}`)}</p>
        <p className="mt-2 text-sm text-body">{tr("Ton compte AFROBACK est le même sur l'application et sur le site.", 'Your AFROBACK account is the same in the app and on the site.')}</p>
        <Link href="/connexion" className="mt-6 block rounded-md bg-gold px-5 py-3 font-bold text-ink hover:bg-gold-pale">
          {tr('Se connecter', 'Sign in')}
        </Link>
        <button onClick={onClose} className="mt-3 text-sm text-muted hover:text-text">
          {tr('Plus tard', 'Later')}
        </button>
      </div>
    </div>
  );
}
