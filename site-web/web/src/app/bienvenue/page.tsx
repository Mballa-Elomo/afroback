'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthShell, Field, Notice } from '@/components/auth-ui';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/lang-client';

/**
 * Fin d'inscription sur le site (équivalent de l'assistant de l'app) :
 * pseudo de la communauté, centres d'intérêt, forfait souhaité. Le forfait
 * réel ne vient jamais de ce choix : seulement d'un paiement validé côté
 * serveur.
 */
const PSEUDO_RULE = /^[A-Za-zÀ-ÿ0-9_.-]{2,30}$/;
const USAGES = [
  { id: 'decouverte', title: 'Découvrir mes racines', text: 'Histoires, héros, traditions', titleEn: 'Discover my roots', textEn: 'Stories, heroes, traditions' },
  { id: 'enfants', title: 'Des profils pour mes enfants', text: 'Un espace enfant sécurisé, géré par toi', titleEn: 'Profiles for my children', textEn: 'A safe kids space, managed by you' },
  { id: 'vendeur', title: 'Vendre mes créations', text: 'Espace vendeur sur le Marché', titleEn: 'Sell my creations', textEn: 'Seller space on the Market' },
];
const PLANS = [
  { id: 'decouverte', name: 'Découverte', price: 'Gratuit', text: 'Reine Nzinga, le mythe de Ngan Medza et 2 lieux · communauté en lecture', nameEn: 'Découverte', priceEn: 'Free', textEn: 'Queen Nzinga, the myth of Ngan Medza and 2 places · read the community' },
  { id: 'racines', name: 'Racines', price: '1 500 FCFA / mois', text: 'Tous les héros, mythes et lieux · narrations et vidéos · commenter et publier', nameEn: 'Racines', priceEn: '1,500 FCFA / month', textEn: 'All heroes, myths and places · narrations and videos · comment and post' },
  { id: 'heritage', name: 'Héritage', price: '3 000 FCFA / mois', text: 'Tout Racines · -10 % au Marché · badge premium · avant-premières', nameEn: 'Héritage', priceEn: '3,000 FCFA / month', textEn: 'Everything in Racines · 10% off at the Market · premium badge · early access' },
];

export default function Bienvenue() {
  const { session, profile, completeOnboarding, refresh, onboardingComplete } = useAuth();
  const { lang, tr } = useLang();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pseudo, setPseudo] = useState('');
  const [usages, setUsages] = useState<string[]>(['decouverte']);
  const [plan, setPlan] = useState('racines');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prenom = (session?.user?.user_metadata?.prenom as string) ?? '';

  useEffect(() => {
    if (!session) router.replace('/connexion');
    else if (onboardingComplete) router.replace('/');
  }, [session, onboardingComplete, router]);
  useEffect(() => {
    if (profile?.pseudo) setPseudo(profile.pseudo);
  }, [profile]);

  const savePseudo = async () => {
    setError(null);
    if (!PSEUDO_RULE.test(pseudo)) return setError(tr('Pseudo : 2 à 30 caractères (lettres, chiffres, point, tiret, tiret bas).', 'Username: 2 to 30 characters (letters, numbers, dot, hyphen, underscore).'));
    setBusy(true);
    if (!profile) {
      const escaped = pseudo.replace(/[\\%_]/g, (c) => `\\${c}`);
      const { data } = await supabase.from('community_profiles_public').select('id').ilike('pseudo', escaped).limit(1);
      if ((data ?? []).length > 0) {
        setBusy(false);
        return setError(tr('Ce pseudo est déjà pris.', 'This username is already taken.'));
      }
      const uid = session?.user?.id;
      const { error: e } = await supabase.from('community_profiles').insert({ user_id: uid, pseudo });
      if (e) {
        setBusy(false);
        return setError(/duplicate|unique/i.test(e.message) ? tr('Ce pseudo est déjà pris.', 'This username is already taken.') : tr("Le pseudo n'a pas pu être enregistré.", 'The username could not be saved.'));
      }
      await refresh();
    }
    setBusy(false);
    setStep(1);
  };

  const finish = async () => {
    setBusy(true);
    const r = await completeOnboarding({
      langue_interface: lang,
      usages,
      forfait: 'decouverte',
      billing: null,
      payment_status: 'none',
      forfait_souhaite: plan === 'decouverte' ? null : plan,
    });
    setBusy(false);
    if (r.error) return setError(r.error);
    router.replace(plan === 'decouverte' ? '/' : `/abonnement?forfait=${plan}`);
  };

  return (
    <AuthShell
      title={prenom ? tr(`Bienvenue, ${prenom}`, `Welcome, ${prenom}`) : tr('Bienvenue', 'Welcome')}
      subtitle={tr('Encore trois petites étapes.', 'Just three more short steps.')}
      quote={tr('Bienvenue dans la grande famille AFROBACK.', 'Welcome to the AFROBACK family.')}
    >
      <div className="mb-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? 'bg-gold' : 'bg-ivory/15'}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
          {step === 0 && (
            <div className="space-y-5">
              <p className="font-display text-2xl font-bold text-ivory">{tr('Ton pseudo', 'Your username')}</p>
              <p className="text-sm text-body">{tr("C'est ton nom dans la communauté et les commentaires.", 'This is your name in the community and in comments.')}</p>
              <Field label={tr('Pseudo', 'Username')} value={pseudo} onChange={setPseudo} placeholder={tr('ex. Mpodol237', 'e.g. Mpodol237')} />
              {error && <Notice>{error}</Notice>}
              <button onClick={savePseudo} disabled={busy || !pseudo} className="w-full rounded-full bg-gold py-4 font-extrabold text-ink disabled:opacity-50">
                {busy ? tr('Un instant…', 'One moment…') : tr('Continuer', 'Continue')}
              </button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <p className="font-display text-2xl font-bold text-ivory">{tr('Comment vas-tu vivre AFROBACK ?', 'How will you use AFROBACK?')}</p>
              {USAGES.map((u) => {
                const on = usages.includes(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => setUsages(on ? usages.filter((x) => x !== u.id) : [...usages, u.id])}
                    className={`w-full rounded-2xl border p-5 text-left transition ${on ? 'border-gold bg-gold/10' : 'border-ivory/15 hover:border-gold/40'}`}
                  >
                    <p className="font-bold text-ivory">{tr(u.title, u.titleEn)}</p>
                    <p className="text-sm text-body">{tr(u.text, u.textEn)}</p>
                  </button>
                );
              })}
              <button onClick={() => setStep(2)} className="w-full rounded-full bg-gold py-4 font-extrabold text-ink">
                {tr('Continuer', 'Continue')}
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <p className="font-display text-2xl font-bold text-ivory">{tr('Choisis ton forfait', 'Choose your plan')}</p>
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${plan === p.id ? 'border-gold bg-gold/10' : 'border-ivory/15 hover:border-gold/40'}`}
                >
                  <p className="flex items-baseline justify-between">
                    <span className="font-display text-xl font-bold text-ivory">{tr(p.name, p.nameEn)}</span>
                    <span className="text-sm font-bold text-gold">{tr(p.price, p.priceEn)}</span>
                  </p>
                  <p className="mt-1 text-sm text-body">{tr(p.text, p.textEn)}</p>
                </button>
              ))}
              {error && <Notice>{error}</Notice>}
              <button onClick={finish} disabled={busy} className="w-full rounded-full bg-gold py-4 font-extrabold text-ink disabled:opacity-50">
                {busy ? tr('Un instant…', 'One moment…') : plan === 'decouverte' ? tr('Commencer gratuitement', 'Start for free') : tr('Continuer vers le paiement', 'Continue to payment')}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  );
}
