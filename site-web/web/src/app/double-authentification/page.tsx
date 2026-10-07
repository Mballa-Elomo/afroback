'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell, CodeInput, Notice, Submit } from '@/components/auth-ui';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';

export default function DoubleAuthentification() {
  const { session, mfa, verifyMfa, signOut } = useAuth();
  const { tr } = useLang();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) router.replace('/connexion');
    else if (mfa === 'ok' || mfa === 'none') router.replace('/');
  }, [session, mfa, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await verifyMfa(code);
    setBusy(false);
    if (r.error) return setError(r.error);
    router.replace('/');
  };

  return (
    <AuthShell title={tr('Vérification en 2 étapes', '2-step verification')} subtitle={tr("Entre le code à 6 chiffres affiché dans ton application d'authentification.", 'Enter the 6-digit code shown in your authenticator app.')}>
      <form onSubmit={submit} className="space-y-6">
        <CodeInput value={code} onChange={setCode} />
        {error && <Notice>{error}</Notice>}
        <Submit busy={busy} disabled={code.length !== 6}>
          {tr('Confirmer', 'Confirm')}
        </Submit>
      </form>
      <button onClick={() => signOut().then(() => router.replace('/'))} className="mt-6 w-full text-center text-sm text-muted hover:text-text">
        {tr('Se déconnecter', 'Sign out')}
      </button>
    </AuthShell>
  );
}
