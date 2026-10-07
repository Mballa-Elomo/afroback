'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from './Avatar';
import { AccountGate } from './ContentActions';
import { useMember } from '@/lib/auth';
import { ago, createPost, MOTIFS, report, type Motif, type Post } from '@/lib/community';
import { uploadImage } from '@/lib/upload';
import { useLang } from '@/lib/lang-client';

/** Carte de publication : auteur, texte, photo, commentaires, signalement. */
export function PostCard({ post, index = 0, onReported }: { post: Post; index?: number; onReported?: () => void }) {
  const [reporting, setReporting] = useState(false);
  const { tr, lang } = useLang();
  const hidden = post.statut !== 'publie';
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index, 4) * 0.06 }}
      className="overflow-hidden rounded-3xl bg-surface ring-1 ring-ivory/10"
    >
      <div className="flex items-center gap-3 p-5">
        <Link href={post.author ? `/communaute/membre/${post.author.id}` : '#'}>
          <Avatar url={post.author?.avatar_url} name={post.author?.pseudo} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={post.author ? `/communaute/membre/${post.author.id}` : '#'} className="font-bold text-ivory hover:text-gold">
            {post.author?.pseudo ?? tr('Membre', 'Member')}
          </Link>
          <p className="text-xs text-muted">{ago(post.created_at, lang)}</p>
        </div>
        <button onClick={() => setReporting(true)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:bg-ivory/5 hover:text-terra" aria-label={tr('Signaler', 'Report')}>
          {tr('Signaler', 'Report')}
        </button>
      </div>
      {hidden ? (
        <p className="px-5 pb-5 text-sm italic text-muted">{tr("Cette publication n'est pas visible publiquement (charte ou signalements).", 'This post is not publicly visible (charter or reports).')}</p>
      ) : (
        <>
          <Link href={`/communaute/post/${post.id}`} className="block px-5 pb-4">
            <p className="whitespace-pre-line text-[16px] leading-relaxed text-text">{post.contenu_texte}</p>
          </Link>
          {post.image_url && (
            <Link href={`/communaute/post/${post.id}`} className="block bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt="" loading="lazy" className="max-h-[560px] w-full object-cover" />
            </Link>
          )}
        </>
      )}
      <div className="flex items-center gap-4 border-t border-ivory/10 px-5 py-3 text-sm">
        <Link href={`/communaute/post/${post.id}`} className="font-semibold text-body hover:text-gold">
          💬 {post.comments ? tr(`${post.comments} commentaire${post.comments > 1 ? 's' : ''}`, `${post.comments} comment${post.comments > 1 ? 's' : ''}`) : tr('Commenter', 'Comment')}
        </Link>
      </div>
      {reporting && (
        <ReportDialog
          targetType="post"
          targetId={post.id}
          onClose={() => {
            setReporting(false);
            onReported?.();
          }}
        />
      )}
    </motion.article>
  );
}

/** Signalement (motifs identiques à l'app), traité par l'équipe depuis le back-office. */
export function ReportDialog({ targetType, targetId, onClose }: { targetType: 'post' | 'commentaire' | 'profil'; targetId: string; onClose: () => void }) {
  const { member, profile } = useMember();
  const { tr } = useLang();
  const [motif, setMotif] = useState<Motif | null>(null);
  const [desc, setDesc] = useState('');
  const [done, setDone] = useState<string | null>(null);
  if (!member) return <AccountGate reason={tr('signaler un contenu', 'report content')} onClose={onClose} />;
  const send = async () => {
    if (!motif || !profile) return;
    const r = await report(profile.id, targetType, targetId, motif, desc);
    setDone(r.error ?? tr('Merci, ton signalement a été transmis à l’équipe AFROBACK.', 'Thank you, your report has been sent to the AFROBACK team.'));
  };
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 px-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl bg-surface p-7 ring-1 ring-gold/20" onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-2xl font-bold text-ivory">{tr('Signaler', 'Report')}</p>
        {done ? (
          <>
            <p className="mt-4 text-body">{done}</p>
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-gold py-3 font-bold text-ink">
              {tr('Fermer', 'Close')}
            </button>
          </>
        ) : (
          <>
            <div className="mt-5 space-y-2">
              {MOTIFS.map((m) => (
                <button key={m.id} onClick={() => setMotif(m.id)} className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${motif === m.id ? 'border-gold bg-gold/10 text-ivory' : 'border-ivory/15 text-body hover:border-gold/40'}`}>
                  {tr(m.label, m.en)}
                </button>
              ))}
            </div>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={tr('Précisions (facultatif)', 'Details (optional)')} rows={3} className="mt-4 w-full rounded-2xl bg-ink/60 px-4 py-3 text-sm text-ivory ring-1 ring-ivory/10 focus:outline-none focus:ring-gold/40" />
            <button onClick={send} disabled={!motif} className="mt-5 w-full rounded-full bg-gold py-3 font-bold text-ink disabled:opacity-40">
              {tr('Envoyer le signalement', 'Send the report')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Zone « Partage avec la communauté » : texte + photo. Publication réservée aux abonnés (règle serveur). */
export function Composer({ onPosted }: { onPosted: () => void }) {
  const { member, profile, subscription } = useMember();
  const { tr } = useLang();
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gate, setGate] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  if (!member) {
    return (
      <>
        <button onClick={() => setGate(true)} className="w-full rounded-3xl bg-surface p-5 text-left text-muted ring-1 ring-ivory/10 hover:ring-gold/40">
          {tr('Partage une histoire, une photo, une question…', 'Share a story, a photo, a question…')}
        </button>
        {gate && <AccountGate reason={tr('publier dans la communauté', 'post in the community')} onClose={() => setGate(false)} />}
      </>
    );
  }
  if (!subscription) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-gold/15 to-surface p-6 ring-1 ring-gold/25">
        <p className="font-display text-xl font-bold text-ivory">{tr('Publier est réservé aux abonnés', 'Posting is for members only')}</p>
        <p className="mt-1 text-sm text-body">{tr('Avec ton compte gratuit, tu lis la communauté. Abonne-toi pour publier et commenter.', 'With your free account, you can read the community. Subscribe to post and comment.')}</p>
        <Link href="/abonnement" className="mt-4 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-ink">
          {tr('Voir les abonnements', 'See subscriptions')}
        </Link>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="rounded-3xl bg-surface p-6 ring-1 ring-ivory/10">
        <p className="text-body">{tr("Choisis d'abord ton pseudo pour publier.", 'First choose your username to post.')}</p>
        <Link href="/compte/profil" className="mt-3 inline-block font-semibold text-gold">
          {tr('Créer mon profil →', 'Create my profile →')}
        </Link>
      </div>
    );
  }

  const publish = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    const r = await createPost(profile.id, text.trim(), image);
    setBusy(false);
    if (r.error) return setError(r.error);
    if (r.post && r.post.statut !== 'publie') setError(tr("Ta publication ne respecte peut-être pas la charte : elle n'est pas visible publiquement.", 'Your post may not follow the charter: it is not publicly visible.'));
    setText('');
    setImage(null);
    onPosted();
  };

  return (
    <div className="rounded-3xl bg-surface p-5 ring-1 ring-ivory/10">
      <div className="flex gap-3">
        <Avatar url={profile.avatar_url} name={profile.pseudo} size={44} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={text ? 4 : 2}
          maxLength={2000}
          placeholder={tr('Partage une histoire, une photo, une question…', 'Share a story, a photo, a question…')}
          className="flex-1 resize-none bg-transparent pt-2 text-[16px] text-ivory placeholder:text-muted focus:outline-none"
        />
      </div>
      {image && (
        <div className="relative mt-3 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="max-h-80 w-full object-cover" />
          <button onClick={() => setImage(null)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-ink/80 text-ivory">
            ✕
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-terra">{error}</p>}
      <div className="mt-3 flex items-center justify-between border-t border-ivory/10 pt-3">
        <button onClick={() => file.current?.click()} disabled={busy} className="rounded-full px-4 py-2 text-sm font-semibold text-body hover:bg-ivory/5 hover:text-gold">
          🖼 Photo
        </button>
        <input
          ref={file}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            const r = await uploadImage(f, 'posts');
            setBusy(false);
            if (r.error) setError(r.error);
            else setImage(r.url ?? null);
          }}
        />
        <button onClick={publish} disabled={busy || !text.trim()} className="rounded-full bg-gold px-6 py-2.5 text-sm font-extrabold text-ink disabled:opacity-40">
          {busy ? tr('Un instant…', 'One moment…') : tr('Publier', 'Post')}
        </button>
      </div>
    </div>
  );
}

export const CHARTE = [
  { title: 'Respecte les personnes et les cultures', text: "Les désaccords existent, les insultes n'ont pas leur place. On ne se moque pas d'une tradition, d'une langue ou d'une origine.", titleEn: 'Respect people and cultures', textEn: 'Disagreements happen, insults have no place here. Nobody mocks a tradition, a language or an origin.' },
  { title: 'Partage avec honnêteté', text: "Ne présente pas une rumeur ou une opinion comme un fait établi. Si tu n'es pas sûr, dis-le.", titleEn: 'Share honestly', textEn: "Don't present a rumour or an opinion as an established fact. If you're not sure, say so." },
  { title: 'Pas de haine, pas de harcèlement', text: 'Contenu raciste, sexiste, homophobe ou tout appel à la violence : suppression immédiate et bannissement possible.', titleEn: 'No hate, no harassment', textEn: 'Racist, sexist or homophobic content, or any call to violence: immediate removal and possible ban.' },
  { title: 'Pas de spam', text: "Pas de publicité non sollicitée. Ce n'est pas une vitrine commerciale.", titleEn: 'No spam', textEn: 'No unsolicited advertising. This is not a shop window.' },
  { title: 'Protège la vie privée', text: 'Ne partage pas d’informations personnelles (numéro, adresse) sans consentement, la tienne ou celle des autres.', titleEn: 'Protect privacy', textEn: "Don't share personal information (phone number, address) without consent, yours or anyone else's." },
  { title: 'Signale plutôt que de réagir seul', text: "Un contenu qui te semble poser problème ? Utilise le bouton de signalement, l'équipe AFROBACK le traite.", titleEn: 'Report rather than react alone', textEn: 'Something looks wrong? Use the report button, the AFROBACK team will handle it.' },
];
