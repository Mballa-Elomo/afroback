'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell, CodeInput, Notice, Submit } from '@/components/auth-ui';
import { maskEmail, useAuth } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';

/**
 * « Nouveau navigateur détecté » (même règle que l'app, cdc-appareil-unique.md) :
 * prouver son identité par un code email, ou par le code de vérification en
 * 2 étapes si elle est activée.
 */
export default function NouvelAppareil() {
  const { session, device, mfa, requestDeviceCode, verifyDeviceWithEmailCode, verifyDeviceWithTotp, signOut } = useAuth();
  const { tr } = useLang();
  const router = useRouter();
  const [mode, setMode] = useState<'email' | 'totp'>('email');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const email = session?.user?.email ?? '';

  useEffect(() => {
    if (!session) router.replace('/connexion');
    else if (device === 'ok') router.replace('/');
  }, [session, device, router]);

  if (device === 'indisponible') {
    return (
      <AuthShell title={tr('Bientôt disponible', 'Coming soon')} subtitle={tr("La connexion au site est en cours d'activation.", 'Sign-in on the site is being activated.')}>
        <Notice tone="info">
          {tr(
            "La protection « un téléphone + un navigateur » doit être activée côté serveur avant la première connexion au site. Ton compte reste utilisable dans l'application.",
            'The “one phone + one browser” protection must be enabled on the server before the first sign-in on the site. Your account still works in the app.',
          )}
        </Notice>
        <button onClick={() => signOut().then(() => router.replace('/'))} className="mt-6 text-sm font-semibold text-gold">
          {tr('Revenir au site', 'Back to the site')}
        </button>
      </AuthShell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = mode === 'email' ? await verifyDeviceWithEmailCode(code) : await verifyDeviceWithTotp(code);
    setBusy(false);
    if (r.error) return setError(r.error);
    router.replace('/');
  };

  return (
    <AuthShell
      title={tr('Nouveau navigateur', 'New browser')}
      subtitle={tr("Pour protéger ton compte, confirme que c'est bien toi. Ton téléphone reste connecté.", "To protect your account, confirm it's really you. Your phone stays signed in.")}
      quote={tr('Ton compte reste à toi seul.', 'Your account stays yours alone.')}
    >
      {mode === 'email' ? (
        !sent ? (
          <div className="space-y-5">
            <p className="text-body">
              {tr('Nous allons envoyer un code à', 'We will send a code to')} <b className="text-ivory">{maskEmail(email)}</b>.
            </p>
            {error && <Notice>{error}</Notice>}
            <button
              onClick={async () => {
                setBusy(true);
                const r = await requestDeviceCode();
                setBusy(false);
                if (r.error) setError(r.error);
                else setSent(true);
              }}
              className="w-full rounded-full bg-gradient-to-r from-gold-pale via-gold to-gold-deep py-4 font-extrabold text-ink"
              disabled={busy}
            >
              {busy ? tr('Envoi…', 'Sending…') : tr('Recevoir le code', 'Get the code')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <CodeInput value={code} onChange={setCode} />
            {error && <Notice>{error}</Notice>}
            <Submit busy={busy} disabled={code.length !== 6}>
              {tr('Confirmer', 'Confirm')}
            </Submit>
          </form>
        )
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <p className="text-body">{tr("Entre le code à 6 chiffres de ton application d'authentification.", 'Enter the 6-digit code from your authenticator app.')}</p>
          <CodeInput value={code} onChange={setCode} />
          {error && <Notice>{error}</Notice>}
          <Submit busy={busy} disabled={code.length !== 6}>
            {tr('Confirmer', 'Confirm')}
          </Submit>
        </form>
      )}
      {mfa !== 'none' && mfa !== 'unknown' && (
        <button
          onClick={() => {
            setMode(mode === 'email' ? 'totp' : 'email');
            setCode('');
            setError(null);
          }}
          className="mt-6 w-full text-center text-sm font-semibold text-gold"
        >
          {mode === 'email' ? tr("Utiliser mon application d'authentification", 'Use my authenticator app') : tr('Recevoir plutôt un code par email', 'Get a code by email instead')}
        </button>
      )}
      <button onClick={() => signOut().then(() => router.replace('/'))} className="mt-3 w-full text-center text-sm text-muted hover:text-text">
        {tr('Annuler', 'Cancel')}
      </button>
    </AuthShell>
  );
}
