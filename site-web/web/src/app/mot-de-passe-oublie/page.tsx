'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell, CodeInput, Field, Notice, Submit, TextLink } from '@/components/auth-ui';
import { maskEmail, useAuth } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';

const strong = (p: string) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

export default function MotDePasseOublie() {
  const { requestPasswordReset, resetPasswordWithCode } = useAuth();
  const { tr } = useLang();
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await requestPasswordReset(email);
    setBusy(false);
    if (r.error) return setError(r.error);
    setStep('code');
  };
  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strong(pwd)) return setError(tr('Mot de passe : au moins 8 caractères, avec des lettres et des chiffres.', 'Password: at least 8 characters, with letters and numbers.'));
    setBusy(true);
    setError(null);
    const r = await resetPasswordWithCode(email, code, pwd);
    setBusy(false);
    if (r.error) return setError(r.error);
    router.replace('/');
  };

  return (
    <AuthShell
      title={tr('Mot de passe oublié', 'Forgot password')}
      subtitle={
        step === 'email' ? (
          tr('Indique ton email : tu recevras un code pour choisir un nouveau mot de passe.', "Enter your email: you'll get a code to choose a new password.")
        ) : (
          <>
            {tr('Si un compte existe pour', 'If an account exists for')} <b className="text-ivory">{maskEmail(email)}</b>, {tr("un code vient d'y être envoyé.", 'a code has just been sent to it.')}
          </>
        )
      }
    >
      {step === 'email' ? (
        <form onSubmit={sendCode} className="space-y-5">
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
          {error && <Notice>{error}</Notice>}
          <Submit busy={busy} disabled={!email}>
            {tr('Recevoir un code', 'Get a code')}
          </Submit>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-6">
          <CodeInput value={code} onChange={setCode} />
          <Field label={tr('Nouveau mot de passe', 'New password')} type="password" value={pwd} onChange={setPwd} autoComplete="new-password" hint={tr('Au moins 8 caractères, avec des lettres et des chiffres.', 'At least 8 characters, with letters and numbers.')} />
          {error && <Notice>{error}</Notice>}
          <Submit busy={busy} disabled={code.length !== 6 || !pwd}>
            {tr('Changer mon mot de passe', 'Change my password')}
          </Submit>
        </form>
      )}
      <p className="mt-8 text-center text-sm">
        <TextLink href="/connexion">{tr('Retour à la connexion', 'Back to sign in')}</TextLink>
      </p>
    </AuthShell>
  );
}
