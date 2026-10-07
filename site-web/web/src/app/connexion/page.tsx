'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell, Field, Notice, Submit, TextLink } from '@/components/auth-ui';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';

function Connexion() {
  const { signIn, session, device } = useAuth();
  const { tr } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const [id, setId] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = params.get('suite') || '/';

  useEffect(() => {
    if (session && device === 'ok') router.replace(next);
  }, [session, device, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn(id, pwd);
    setBusy(false);
    if (res.error) return setError(res.error);
    if (res.unconfirmed && res.email) router.push(`/verification?email=${encodeURIComponent(res.email)}`);
  };

  return (
    <AuthShell title={tr('Bon retour', 'Welcome back')} subtitle={tr("Connecte-toi avec ton compte AFROBACK : le même que dans l'application.", 'Sign in with your AFROBACK account: the same one as in the app.')}>
      {device === 'remplace' && (
        <div className="mb-5">
          <Notice tone="info">{tr("Tu as été déconnecté parce que ton compte s'est ouvert sur un autre navigateur.", 'You were signed out because your account was opened in another browser.')}</Notice>
        </div>
      )}
      <form onSubmit={submit} className="space-y-5">
        <Field label={tr('Email ou téléphone', 'Email or phone')} value={id} onChange={setId} placeholder={tr('ton@email.com ou +2376…', 'you@email.com or +2376…')} autoComplete="username" />
        <Field label={tr('Mot de passe', 'Password')} type="password" value={pwd} onChange={setPwd} autoComplete="current-password" />
        <div className="text-right text-sm">
          <TextLink href="/mot-de-passe-oublie">{tr('Mot de passe oublié ?', 'Forgot your password?')}</TextLink>
        </div>
        {error && <Notice>{error}</Notice>}
        <Submit busy={busy} disabled={!id || !pwd}>
          {tr('Se connecter', 'Sign in')}
        </Submit>
      </form>
      <p className="mt-8 text-center text-sm text-body">
        {tr('Pas encore de compte ?', 'No account yet?')} <TextLink href="/inscription">{tr('Créer mon compte', 'Create my account')}</TextLink>
      </p>
    </AuthShell>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Connexion />
    </Suspense>
  );
}
