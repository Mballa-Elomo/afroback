'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useMember } from '@/lib/auth';
import type { ContentType } from '@/lib/types';
import { AccountGate } from './ContentActions';
import { Avatar } from './Avatar';
import { useLang } from '@/lib/lang-client';
import { tc, timeAgo } from '@/lib/lang';
import { useModules } from '@/lib/settings';

/**
 * Commentaires façon Facebook (cdc-commentaires.md de l'app), mêmes fonctions
 * serveur : lister_commentaires, lister_reponses, publier_commentaire,
 * modifier_commentaire, supprimer_commentaire, aimer_commentaire,
 * signaler_commentaire. Lecture ouverte à tous ; écrire, répondre et aimer
 * demandent un compte (et l'accès au contenu, vérifié côté serveur).
 */

type Comment = {
  id: string;
  parent_id: string | null;
  reply_to_pseudo: string | null;
  texte: string | null;
  statut: string;
  like_count: number;
  reply_count: number;
  created_at: string;
  edited: boolean;
  mine: boolean | null;
  liked: boolean;
  author: { id: string; pseudo: string; avatar_url: string | null; equipe: boolean } | null;
};
type Thread = { total: number; peut_commenter?: boolean; items: Comment[] };

const ERR: Record<string, [string, string]> = {
  trop_rapide: ['Tu commentes très vite. Patiente quelques minutes avant de publier à nouveau.', "You're commenting very fast. Wait a few minutes before posting again."],
  acces: ['Abonne-toi pour participer à la discussion sur ce récit.', 'Subscribe to join the discussion on this story.'],
  longueur: ['Ton commentaire doit faire entre 1 et 2 000 caractères.', 'Your comment must be between 1 and 2,000 characters.'],
  sans_profil: ['Choisis ton pseudo (Mon compte › Mon profil) pour commenter.', 'Choose your username (My account › My profile) to comment.'],
  banni: ['Ton compte ne peut plus publier de commentaires.', 'Your account can no longer post comments.'],
};
const errorText = (code?: string) => (ERR[code ?? ''] ? tc(...ERR[code ?? '']) : tc("Ça n'a pas marché. Vérifie ta connexion et réessaie.", "That didn't work. Check your connection and try again."));

async function call<T>(fn: string, args: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) return { error: 'reseau' };
  if (data && typeof data === 'object' && 'ok' in data && (data as { ok: boolean }).ok === false) return { error: String((data as { error?: string }).error ?? 'inconnu') };
  return { data: data as T };
}


/** Masqué quand les commentaires sont coupés dans le back-office (Paramètres → Modules). */
export function Comments(props: { type: ContentType; slug: string }) {
  const modules = useModules();
  return modules.commentaires ? <CommentsInner {...props} /> : null;
}

function CommentsInner({ type, slug }: { type: ContentType; slug: string }) {
  const { member, profile, session } = useMember();
  const { tr } = useLang();
  const [sort, setSort] = useState<'pertinents' | 'recents'>('pertinents');
  const [thread, setThread] = useState<Thread | null>(null);
  const [gate, setGate] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.rpc('lister_commentaires', { p_type: type, p_slug: slug, p_tri: sort, p_limite: 20, p_decalage: 0 });
    setThread((data as Thread) ?? { total: 0, items: [] });
  }, [type, slug, sort]);
  useEffect(() => {
    load();
  }, [load, session?.user?.id]);

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return setGate(tr('commenter', 'comment'));
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    const r = await call<{ comment: Comment }>('publier_commentaire', { p_type: type, p_slug: slug, p_texte: text.trim(), p_parent: null });
    setBusy(false);
    if (r.error) return setError(errorText(r.error));
    setText('');
    load();
  };

  return (
    <section id="commentaires" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-heading">
          {thread ? tr(`${thread.total} commentaire${thread.total > 1 ? 's' : ''}`, `${thread.total} comment${thread.total > 1 ? 's' : ''}`) : tr('Commentaires', 'Comments')}
        </h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'pertinents' | 'recents')}
          className="rounded-md border border-gold/20 bg-surface px-3 py-1.5 text-sm text-body focus:outline-none"
          aria-label={tr('Trier les commentaires', 'Sort comments')}
        >
          <option value="pertinents">{tr('Les plus pertinents', 'Most relevant')}</option>
          <option value="recents">{tr('Les plus récents', 'Newest')}</option>
        </select>
      </div>

      {member ? (
        <form onSubmit={publish} className="mb-8 flex gap-3">
          <Avatar url={profile?.avatar_url} name={profile?.pseudo} size={40} />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={text ? 3 : 1}
              maxLength={2000}
              placeholder={tr('Écrire un commentaire…', 'Write a comment…')}
              className="w-full resize-none rounded-2xl bg-text/10 px-5 py-3 text-[15px] text-ivory ring-1 ring-text/10 placeholder:text-muted focus:outline-none focus:ring-gold/40"
            />
            {error && (
              <p className="mt-2 text-sm text-terra">
                {error} {(error.startsWith('Abonne') || error.startsWith('Subscribe')) && <Link href="/abonnement" className="font-semibold text-gold">{tr('Voir les abonnements', 'See subscriptions')}</Link>}
              </p>
            )}
            {text.trim() && (
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setText('')} className="px-4 py-2 text-sm text-muted hover:text-text">
                  {tr('Annuler', 'Cancel')}
                </button>
                <button disabled={busy} className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-ink disabled:opacity-50">
                  {busy ? tr('Envoi…', 'Sending…') : tr('Publier', 'Post')}
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <button
          onClick={() => setGate(tr('commenter', 'comment'))}
          className="mb-8 flex w-full items-center gap-3 rounded-full bg-text/8 px-5 py-3 text-left text-sm text-muted ring-1 ring-text/10 transition hover:ring-gold/30"
        >
          {tr('Écrire un commentaire…', 'Write a comment…')}
        </button>
      )}

      <ul className="space-y-5">
        {thread?.items.map((c) => <CommentItem key={c.id} c={c} type={type} slug={slug} member={member} onGate={setGate} onChanged={load} />)}
      </ul>
      {thread && thread.total === 0 && <p className="text-sm text-muted">{tr('Sois le premier à donner ton avis.', 'Be the first to share your thoughts.')}</p>}
      {gate && <AccountGate reason={gate} onClose={() => setGate(null)} />}
    </section>
  );
}

function CommentItem({
  c,
  type,
  slug,
  member,
  onGate,
  onChanged,
  reply = false,
}: {
  c: Comment;
  type: ContentType;
  slug: string;
  member: boolean;
  onGate: (r: string) => void;
  onChanged: () => void;
  reply?: boolean;
}) {
  const [replies, setReplies] = useState<Comment[] | null>(null);
  const { tr, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(c.liked);
  const [likes, setLikes] = useState(c.like_count);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [menu, setMenu] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadReplies = async () => {
    const { data } = await supabase.rpc('lister_reponses', { p_parent: reply ? c.parent_id : c.id, p_limite: 20, p_decalage: 0 });
    setReplies((data as Comment[]) ?? []);
  };
  const toggleReplies = async () => {
    setOpen((v) => !v);
    if (!replies) loadReplies();
  };
  const like = async () => {
    if (!member) return onGate(tr('aimer ce commentaire', 'like this comment'));
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    const r = await call<{ liked: boolean; like_count: number }>('aimer_commentaire', { p_id: c.id, p_aime: next });
    if (r.error) {
      setLiked(!next);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
      setMsg(errorText(r.error));
    } else if (r.data) setLikes(r.data.like_count);
  };
  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const r = await call('publier_commentaire', { p_type: type, p_slug: slug, p_texte: draft.trim(), p_parent: c.id });
    if (r.error) return setMsg(errorText(r.error));
    setDraft('');
    setReplying(false);
    setOpen(true);
    loadReplies();
    onChanged();
  };
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await call('modifier_commentaire', { p_id: c.id, p_texte: draft.trim() });
    if (r.error) return setMsg(errorText(r.error));
    setEditing(false);
    onChanged();
  };
  const remove = async () => {
    if (!window.confirm(tr('Supprimer ce commentaire ?', 'Delete this comment?'))) return;
    const r = await call('supprimer_commentaire', { p_id: c.id });
    if (r.error) return setMsg(errorText(r.error));
    onChanged();
  };
  const report = async () => {
    const r = await call('signaler_commentaire', { p_id: c.id, p_motif: 'contenu_inapproprie' });
    setMenu(false);
    setMsg(r.error ? errorText(r.error) : tr('Merci, le commentaire a été signalé à l’équipe.', 'Thank you, the comment has been reported to the team.'));
  };

  const hidden = c.texte === null || c.statut !== 'publie';
  return (
    <li className="flex gap-3">
      <Avatar url={c.author?.avatar_url} name={c.author?.pseudo} size={reply ? 32 : 40} />
      <div className="min-w-0 flex-1">
        {editing ? (
          <form onSubmit={saveEdit}>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="w-full rounded-2xl bg-text/10 px-4 py-3 text-[15px] text-ivory ring-1 ring-gold/40 focus:outline-none" />
            <div className="mt-1 flex gap-3 text-sm">
              <button className="font-semibold text-gold">{tr('Enregistrer', 'Save')}</button>
              <button type="button" onClick={() => setEditing(false)} className="text-muted">
                {tr('Annuler', 'Cancel')}
              </button>
            </div>
          </form>
        ) : (
          <div className="relative inline-block max-w-full rounded-2xl bg-text/10 px-4 py-2.5">
            <p className="flex items-center gap-2 text-sm font-bold text-ivory">
              {c.author?.pseudo ?? tr('Membre', 'Member')}
              {c.author?.equipe && <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">AFROBACK</span>}
            </p>
            <p className={`mt-0.5 whitespace-pre-line text-[15px] ${hidden ? 'italic text-muted' : 'text-text'}`}>
              {c.reply_to_pseudo && <span className="font-semibold text-gold">@{c.reply_to_pseudo} </span>}
              {hidden ? tr('Commentaire supprimé', 'Comment deleted') : c.texte}
            </p>
            {likes > 0 && (
              <span className="absolute -bottom-2.5 right-2 flex items-center gap-1 rounded-full bg-surface px-1.5 py-0.5 text-[11px] text-text shadow ring-1 ring-text/10">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] text-ink">👍</span>
                {likes}
              </span>
            )}
          </div>
        )}
        {!hidden && !editing && (
          <div className="relative mt-1.5 flex flex-wrap items-center gap-4 px-2 text-xs font-semibold text-muted">
            <span>{timeAgo(c.created_at, lang)}</span>
            <button onClick={like} className={liked ? 'text-gold' : 'hover:text-text'}>
              {tr("J'aime", 'Like')}
            </button>
            <button onClick={() => (member ? setReplying((v) => !v) : onGate(tr('répondre', 'reply')))} className="hover:text-text">
              {tr('Répondre', 'Reply')}
            </button>
            {c.edited && <span>{tr('Modifié', 'Edited')}</span>}
            {member && (
              <button onClick={() => setMenu((v) => !v)} className="px-1 hover:text-text" aria-label={tr("Plus d'actions", 'More actions')}>
                •••
              </button>
            )}
            {menu && (
              <div className="absolute left-24 top-6 z-20 min-w-40 overflow-hidden rounded-xl bg-surface-2 text-sm shadow-xl ring-1 ring-ivory/10">
                {c.mine ? (
                  <>
                    <button
                      onClick={() => {
                        setDraft(c.texte ?? '');
                        setEditing(true);
                        setMenu(false);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-text hover:bg-ivory/5"
                    >
                      {tr('Modifier', 'Edit')}
                    </button>
                    <button onClick={remove} className="block w-full px-4 py-2.5 text-left text-terra hover:bg-ivory/5">
                      {tr('Supprimer', 'Delete')}
                    </button>
                  </>
                ) : (
                  <button onClick={report} className="block w-full px-4 py-2.5 text-left text-text hover:bg-ivory/5">
                    {tr('Signaler', 'Report')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {msg && <p className="mt-1 px-2 text-xs text-terra">{msg}</p>}
        {replying && (
          <form onSubmit={sendReply} className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              maxLength={2000}
              placeholder={tr(`Répondre à ${c.author?.pseudo ?? 'ce membre'}…`, `Reply to ${c.author?.pseudo ?? 'this member'}…`)}
              className="flex-1 rounded-full bg-text/10 px-4 py-2 text-sm text-ivory ring-1 ring-text/10 placeholder:text-muted focus:outline-none focus:ring-gold/40"
            />
            <button className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-ink">{tr('Envoyer', 'Send')}</button>
          </form>
        )}
        {!reply && c.reply_count > 0 && (
          <button onClick={toggleReplies} className="mt-2 px-2 text-sm font-semibold text-gold hover:underline">
            {open
              ? tr('Masquer les réponses', 'Hide replies')
              : tr(`Voir ${c.reply_count > 1 ? `les ${c.reply_count} réponses` : 'la réponse'}`, `View ${c.reply_count > 1 ? `${c.reply_count} replies` : 'reply'}`)}
          </button>
        )}
        {open && replies && (
          <ul className="mt-3 space-y-4">
            {replies.map((r) => (
              <CommentItem key={r.id} c={r} type={type} slug={slug} member={member} onGate={onGate} onChanged={loadReplies} reply />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
