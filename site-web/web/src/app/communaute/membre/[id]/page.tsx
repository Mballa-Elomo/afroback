'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { PostCard, ReportDialog } from '@/components/community';
import { useAuth } from '@/lib/auth';
import { memberWithPosts, type Post, type Profile } from '@/lib/community';
import { useLang } from '@/lib/lang-client';

export default function Membre({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session } = useAuth();
  const { tr, locale } = useLang();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    memberWithPosts(id).then((r) => {
      setProfile(r.profile);
      setPosts(r.posts);
    });
  }, [id, session?.user?.id]);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-32">
      <Link href="/communaute" className="text-sm font-semibold text-gold">
        ‹ {tr('Communauté', 'Community')}
      </Link>
      {profile === undefined && <p className="mt-6 text-muted">{tr('Chargement…', 'Loading…')}</p>}
      {profile === null && <p className="mt-6 text-body">{tr('Membre introuvable.', 'Member not found.')}</p>}
      {profile && (
        <>
          <div className="relative mt-5 overflow-hidden rounded-[32px] bg-gradient-to-br from-gold/15 via-surface to-ink p-8 text-center ring-1 ring-gold/20">
            <div className="flex justify-center">
              <Avatar url={profile.avatar_url} name={profile.pseudo} size={110} />
            </div>
            <h1 className="mt-4 font-display text-3xl font-black text-ivory">{profile.pseudo}</h1>
            {profile.bio && <p className="mt-2 text-body">{profile.bio}</p>}
            <p className="mt-2 text-xs text-muted">{tr('Membre depuis', 'Member since')} {new Date(profile.created_at).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</p>
            <button onClick={() => setReporting(true)} className="mt-4 text-xs font-semibold text-muted hover:text-terra">
              {tr('Signaler ce profil', 'Report this profile')}
            </button>
          </div>
          <div className="mt-8 space-y-6">
            {posts.length === 0 && <p className="text-center text-body">{tr("Aucune publication pour l'instant.", 'No posts yet.')}</p>}
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} />
            ))}
          </div>
        </>
      )}
      {reporting && profile && <ReportDialog targetType="profil" targetId={profile.id} onClose={() => setReporting(false)} />}
    </div>
  );
}
