'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell, CodeInput, Notice, Submit } from '@/components/auth-ui';
import { maskEmail, useAuth } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';

function Verification() {
  const { verifySignupCode, resendSignupCode } = useAuth();
  const { tr } = useLang();
  const router = useRouter();
  const email = useSearchParams().get('email') ?? '';
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [wait, setWait] = useState(60);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await verifySignupCode(email, code);
    setBusy(false);
    if (res.error) return setError(res.error);
    router.replace('/bienvenue');
  };

  return (
    <AuthShell
      title={tr('Vérifie ton email', 'Check your email')}
      subtitle={
        <>
          {tr('Nous avons envoyé un code à 6 chiffres à', 'We sent a 6-digit code to')} <b className="text-ivory">{maskEmail(email)}</b>.
        </>
      }
    >
      <form onSubmit={submit} className="space-y-6">
        <CodeInput value={code} onChange={setCode} />
        {error && <Notice>{error}</Notice>}
        {sent && <Notice tone="success">{tr('Nouveau code envoyé.', 'New code sent.')}</Notice>}
        <Submit busy={busy} disabled={code.length !== 6}>
          {tr('Valider', 'Confirm')}
        </Submit>
      </form>
      <button
        disabled={wait > 0}
        onClick={async () => {
          const r = await resendSignupCode(email);
          if (r.error) setError(r.error);
          else {
            setSent(true);
            setWait(60);
          }
        }}
        className="mt-6 w-full text-center text-sm font-semibold text-gold disabled:text-muted"
      >
        {wait > 0 ? tr(`Renvoyer un code dans ${wait} s`, `Resend a code in ${wait} s`) : tr('Renvoyer un code', 'Resend a code')}
      </button>
    </AuthShell>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Verification />
    </Suspense>
  );
}
