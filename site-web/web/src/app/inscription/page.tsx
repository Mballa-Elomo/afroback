'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell, Field, Notice, PhoneField, Submit, TextLink } from '@/components/auth-ui';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';

const strong = (p: string) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

export default function Inscription() {
  const { signUp } = useAuth();
  const { tr } = useLang();
  const router = useRouter();
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [pwd, setPwd] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strong(pwd)) return setError(tr('Mot de passe : au moins 8 caractères, avec des lettres et des chiffres.', 'Password: at least 8 characters, with letters and numbers.'));
    setBusy(true);
    setError(null);
    const res = await signUp({ email, password: pwd, prenom, telephone: tel });
    setBusy(false);
    if (res.error) return setError(res.error);
    router.push(`/verification?email=${encodeURIComponent(email.trim().toLowerCase())}`);
  };

  return (
    <AuthShell
      title={tr('Rejoins AFROBACK', 'Join AFROBACK')}
      subtitle={tr("Crée ton compte gratuit : il marche aussi dans l'application.", 'Create your free account: it works in the app too.')}
      art="https://ygkyapryramhaskfbrrt.supabase.co/storage/v1/object/public/heroes-media/images/sultan-njoya.jpg"
      quote={tr("Les histoires qui ont façonné l'Afrique t'attendent.", 'The stories that shaped Africa are waiting for you.')}
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label={tr('Prénom', 'First name')} value={prenom} onChange={setPrenom} autoComplete="given-name" />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder={tr('ton@email.com', 'you@email.com')} autoComplete="email" />
        <PhoneField value={tel} onChange={setTel} />
        <Field label={tr('Mot de passe', 'Password')} type="password" value={pwd} onChange={setPwd} autoComplete="new-password" hint={tr('Au moins 8 caractères, avec des lettres et des chiffres.', 'At least 8 characters, with letters and numbers.')} />
        <label className="flex items-start gap-3 text-sm text-body">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 h-4 w-4 accent-[#f0c36b]" />
          <span>
            {tr("J'accepte les", 'I accept the')} <TextLink href="/legal/cgu">{tr("conditions d'utilisation", 'terms of use')}</TextLink> {tr('et la', 'and the')}{' '}
            <TextLink href="/legal/confidentialite">{tr('politique de confidentialité', 'privacy policy')}</TextLink>.
          </span>
        </label>
        {error && <Notice>{error}</Notice>}
        <Submit busy={busy} disabled={!prenom || !email || !tel || !pwd || !ok}>
          {tr('Créer mon compte', 'Create my account')}
        </Submit>
      </form>
      <p className="mt-8 text-center text-sm text-body">
        {tr('Déjà un compte ?', 'Already have an account?')} <TextLink href="/connexion">{tr('Se connecter', 'Sign in')}</TextLink>
      </p>
    </AuthShell>
  );
}
