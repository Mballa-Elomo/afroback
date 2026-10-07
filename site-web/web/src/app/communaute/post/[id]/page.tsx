'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { PostCard, ReportDialog } from '@/components/community';
import { AccountGate } from '@/components/ContentActions';
import { useMember } from '@/lib/auth';
import { ago, createComment, postWithComments, type Post, type PostComment } from '@/lib/community';
import { useLang } from '@/lib/lang-client';

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { member, profile, subscription, session } = useMember();
  const { tr, lang } = useLang();
  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [gate, setGate] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const load = useCallback(() => {
    postWithComments(id).then((r) => {
      setPost(r.post);
      setComments(r.comments);
    });
  }, [id]);
  useEffect(() => {
    load();
  }, [load, session?.user?.id]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !profile) return setGate(true);
    if (!text.trim()) return;
    const r = await createComment(profile.id, id, text.trim());
    if (r.error) return setError(r.error);
    setText('');
    setError(null);
    load();
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-32">
      <Link href="/communaute" className="text-sm font-semibold text-gold">
        ‹ {tr('Communauté', 'Community')}
      </Link>
      <div className="mt-5">
        {post === undefined && <p className="text-muted">{tr('Chargement…', 'Loading…')}</p>}
        {post === null && <p className="text-body">{tr('Publication introuvable ou réservée aux membres connectés.', 'Post not found, or visible to signed-in members only.')}</p>}
        {post && <PostCard post={post} />}
      </div>

      {post && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-bold text-heading">
            {comments.length} {tr('commentaire', 'comment')}{comments.length > 1 ? 's' : ''}
          </h2>
          <ul className="mt-5 space-y-5">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <Avatar url={c.author?.avatar_url} name={c.author?.pseudo} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="inline-block max-w-full rounded-2xl bg-text/10 px-4 py-2.5">
                    <p className="text-sm font-bold text-ivory">{c.author?.pseudo ?? tr('Membre', 'Member')}</p>
                    <p className="whitespace-pre-line text-[15px] text-text">{c.statut === 'publie' ? c.contenu_texte : <i className="text-muted">{tr('Commentaire masqué', 'Comment hidden')}</i>}</p>
                  </div>
                  <div className="mt-1 flex gap-4 px-2 text-xs font-semibold text-muted">
                    <span>{ago(c.created_at, lang)}</span>
                    <button onClick={() => setReportId(c.id)} className="hover:text-terra">
                      {tr('Signaler', 'Report')}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {member && subscription ? (
            <form onSubmit={send} className="mt-6 flex gap-3">
              <Avatar url={profile?.avatar_url} name={profile?.pseudo} size={36} />
              <input value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder={tr('Écrire un commentaire…', 'Write a comment…')} className="flex-1 rounded-full bg-text/10 px-5 py-3 text-[15px] text-ivory ring-1 ring-text/10 placeholder:text-muted focus:outline-none focus:ring-gold/40" />
              <button className="rounded-full bg-gold px-5 text-sm font-bold text-ink">{tr('Envoyer', 'Send')}</button>
            </form>
          ) : member ? (
            <p className="mt-6 text-sm text-body">
              {tr('Commenter est réservé aux abonnés.', 'Commenting is for members only.')}{' '}
              <Link href="/abonnement" className="font-semibold text-gold">
                {tr('Voir les abonnements', 'See subscriptions')}
              </Link>
            </p>
          ) : (
            <button onClick={() => setGate(true)} className="mt-6 w-full rounded-full bg-text/10 px-5 py-3 text-left text-sm text-muted ring-1 ring-text/10">
              {tr('Écrire un commentaire…', 'Write a comment…')}
            </button>
          )}
          {error && <p className="mt-2 text-sm text-terra">{error}</p>}
        </section>
      )}
      {gate && <AccountGate reason={tr('commenter', 'comment')} onClose={() => setGate(false)} />}
      {reportId && <ReportDialog targetType="commentaire" targetId={reportId} onClose={() => setReportId(null)} />}
    </div>
  );
}
