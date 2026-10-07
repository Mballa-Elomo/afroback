'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field, Notice, Submit, TextLink } from '@/components/auth-ui';
import { useMember } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';

const strong = (p: string) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

export default function MotDePasse() {
  const { ready, session, member, changePassword } = useMember();
  const { tr } = useLang();
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  useEffect(() => {
    if (ready && !session) router.replace('/connexion?suite=/compte/mot-de-passe');
  }, [ready, session, router]);
  if (!member) return <div className="min-h-screen" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!strong(next)) return setMsg({ tone: 'error', text: tr('Nouveau mot de passe : au moins 8 caractères, avec des lettres et des chiffres.', 'New password: at least 8 characters, with letters and numbers.') });
    setBusy(true);
    const r = await changePassword(current, next);
    setBusy(false);
    if (r.error) return setMsg({ tone: 'error', text: r.error });
    setCurrent('');
    setNext('');
    setMsg({ tone: 'success', text: tr('Mot de passe changé. Tes autres appareils ont été déconnectés par sécurité.', 'Password changed. Your other devices have been signed out for security.') });
  };

  return (
    <div className="mx-auto max-w-xl px-5 pb-16 pt-32">
      <TextLink href="/compte">‹ {tr('Mon compte', 'My account')}</TextLink>
      <h1 className="text-gold-gradient mt-4 font-display text-4xl font-black">{tr('Mot de passe', 'Password')}</h1>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label={tr('Mot de passe actuel', 'Current password')} type="password" value={current} onChange={setCurrent} autoComplete="current-password" />
        <Field label={tr('Nouveau mot de passe', 'New password')} type="password" value={next} onChange={setNext} autoComplete="new-password" hint={tr('Au moins 8 caractères, avec des lettres et des chiffres.', 'At least 8 characters, with letters and numbers.')} />
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <Submit busy={busy} disabled={!current || !next}>
          {tr('Changer mon mot de passe', 'Change my password')}
        </Submit>
      </form>
    </div>
  );
}
