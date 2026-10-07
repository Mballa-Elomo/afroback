'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field, Notice, Submit, TextLink } from '@/components/auth-ui';
import { Avatar } from '@/components/Avatar';
import { useMember } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/lang-client';

/** Modifier son profil (même règles que l'app : pseudo unique sans tenir compte des majuscules, photo dans user-uploads). */
const PSEUDO_RULE = /^[A-Za-zÀ-ÿ0-9_.-]{2,30}$/;

export default function Profil() {
  const { ready, session, member, profile, refresh } = useMember();
  const { tr } = useLang();
  const router = useRouter();
  const [pseudo, setPseudo] = useState('');
  const [prenom, setPrenom] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ready && !session) router.replace('/connexion?suite=/compte/profil');
  }, [ready, session, router]);
  useEffect(() => {
    setPseudo(profile?.pseudo ?? '');
    setAvatar(profile?.avatar_url ?? null);
    setPrenom((session?.user?.user_metadata?.prenom as string) ?? '');
  }, [profile, session]);
  if (!member) return <div className="min-h-screen" />;

  const upload = async (f: File) => {
    if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 5_000_000) return setMsg({ tone: 'error', text: tr('Image JPG, PNG ou WebP de moins de 5 Mo.', 'JPG, PNG or WebP image under 5 MB.') });
    setBusy(true);
    const ext = f.type.split('/')[1];
    const path = `${session!.user.id}/avatars-communaute/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('user-uploads').upload(path, f, { contentType: f.type });
    setBusy(false);
    if (error) return setMsg({ tone: 'error', text: tr("La photo n'a pas pu être envoyée.", 'The photo could not be uploaded.') });
    setAvatar(supabase.storage.from('user-uploads').getPublicUrl(path).data.publicUrl);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!PSEUDO_RULE.test(pseudo)) return setMsg({ tone: 'error', text: tr('Pseudo : 2 à 30 caractères (lettres, chiffres, point, tiret, tiret bas).', 'Username: 2 to 30 characters (letters, numbers, dot, hyphen, underscore).') });
    setBusy(true);
    if (pseudo.toLowerCase() !== (profile?.pseudo ?? '').toLowerCase()) {
      const escaped = pseudo.replace(/[\\%_]/g, (c) => `\\${c}`);
      const { data } = await supabase.from('community_profiles_public').select('id').ilike('pseudo', escaped).limit(1);
      if ((data ?? []).length > 0) {
        setBusy(false);
        return setMsg({ tone: 'error', text: tr('Ce pseudo est déjà pris.', 'This username is already taken.') });
      }
    }
    const uid = session!.user.id;
    const res = profile
      ? await supabase.from('community_profiles').update({ pseudo, avatar_url: avatar }).eq('user_id', uid)
      : await supabase.from('community_profiles').insert({ user_id: uid, pseudo, avatar_url: avatar });
    const res2 = await supabase.auth.updateUser({ data: { prenom: prenom.trim() } });
    setBusy(false);
    if (res.error || res2.error) return setMsg({ tone: 'error', text: tr("L'enregistrement n'a pas abouti. Réessaie.", 'Saving failed. Try again.') });
    await refresh();
    setMsg({ tone: 'success', text: tr('Profil enregistré.', 'Profile saved.') });
  };

  return (
    <div className="mx-auto max-w-xl px-5 pb-16 pt-32">
      <TextLink href="/compte">‹ {tr('Mon compte', 'My account')}</TextLink>
      <h1 className="text-gold-gradient mt-4 font-display text-4xl font-black">{tr('Mon profil', 'My profile')}</h1>
      <form onSubmit={save} className="mt-8 space-y-6">
        <div className="flex items-center gap-5">
          <Avatar url={avatar} name={pseudo || prenom} size={88} />
          <div className="space-x-3">
            <button type="button" onClick={() => file.current?.click()} className="rounded-full bg-ivory/10 px-5 py-2.5 text-sm font-bold text-ivory ring-1 ring-ivory/20 hover:ring-gold/50">
              {tr('Changer la photo', 'Change photo')}
            </button>
            {avatar && (
              <button type="button" onClick={() => setAvatar(null)} className="text-sm text-muted hover:text-text">
                {tr('Retirer', 'Remove')}
              </button>
            )}
            <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </div>
        </div>
        <Field label={tr('Pseudo', 'Username')} value={pseudo} onChange={setPseudo} hint={tr('Ton nom dans la communauté et les commentaires.', 'Your name in the community and in comments.')} />
        <Field label={tr('Prénom', 'First name')} value={prenom} onChange={setPrenom} />
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <Submit busy={busy}>{tr('Enregistrer', 'Save')}</Submit>
      </form>
    </div>
  );
}
