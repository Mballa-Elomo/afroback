'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMember } from '@/lib/auth';
import { fcfa, openPaymentTab, startPayment } from '@/lib/payment';
import { Notice } from '@/components/auth-ui';
import { PaymentWatcher } from '@/components/PaymentWatcher';
import { useLang } from '@/lib/lang-client';

/** Soutenir AFROBACK : don ponctuel par Mobile Money (entre 200 et 1 000 000 FCFA, vérifié côté serveur). */
const AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function Don() {
  const { session, member } = useMember();
  const { tr, locale } = useLang();
  const router = useRouter();
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState('');
  const [anonyme, setAnonyme] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watch, setWatch] = useState<string | null>(null);
  const value = custom ? Number(custom.replace(/\D/g, '')) : amount;

  const give = async () => {
    if (!session) return router.push('/connexion?suite=/don');
    if (!member) return;
    if (!(value >= 200 && value <= 1_000_000)) return setError(tr('Montant entre 200 et 1 000 000 FCFA.', 'Amount between 200 and 1,000,000 FCFA.'));
    setError(null);
    const win = openPaymentTab();
    setBusy(true);
    const r = await startPayment({ type: 'don', montant: value, anonyme }, win);
    setBusy(false);
    if (r.error) return setError(r.error);
    if (r.paiementId) setWatch(r.paiementId);
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-5 pb-20 pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_10%,rgba(227,162,119,0.22),transparent_60%)]" />
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold tracking-[0.3em] text-terra">{tr('SOUTENIR AFROBACK', 'SUPPORT AFROBACK')}</p>
        <h1 className="text-gold-gradient mt-3 font-display text-5xl font-black md:text-6xl">{tr('Fais vivre la mémoire', 'Keep the memory alive')}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-body">{tr('Chaque don finance les prochains récits, narrations et vidéos : recherches, voix, illustrations.', 'Every donation funds the next stories, narrations and videos: research, voices, illustrations.')}</p>

        <div className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-5">
          {AMOUNTS.map((a) => (
            <motion.button
              key={a}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setAmount(a);
                setCustom('');
              }}
              className={`rounded-2xl py-5 font-display text-lg font-black transition ${!custom && amount === a ? 'bg-gold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.35)]' : 'bg-surface text-ivory ring-1 ring-ivory/10 hover:ring-gold/50'}`}
            >
              {a.toLocaleString(locale)}
            </motion.button>
          ))}
        </div>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          inputMode="numeric"
          placeholder={tr('Autre montant (FCFA)', 'Other amount (FCFA)')}
          className="mt-4 w-full rounded-2xl border border-ivory/15 bg-surface px-5 py-4 text-center text-lg text-ivory placeholder:text-muted focus:border-gold focus:outline-none"
        />
        <label className="mt-5 inline-flex items-center gap-3 text-sm text-body">
          <input type="checkbox" checked={anonyme} onChange={(e) => setAnonyme(e.target.checked)} className="h-4 w-4 accent-[#f0c36b]" />
          {tr('Rester anonyme', 'Stay anonymous')}
        </label>
        {error && (
          <div className="mt-5">
            <Notice>{error}</Notice>
          </div>
        )}
        <button onClick={give} disabled={busy} className="mt-8 w-full rounded-full bg-gradient-to-r from-gold-pale via-gold to-gold-deep py-5 text-lg font-extrabold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.35)] transition hover:-translate-y-0.5 disabled:opacity-60">
          {busy ? tr('Ouverture du paiement…', 'Opening payment…') : tr(`Donner ${fcfa(value || 0)}`, `Give ${fcfa(value || 0)}`)}
        </button>
        <p className="mt-4 text-xs text-muted">{tr('MTN MoMo · Orange Money · paiement sécurisé par Campay', 'MTN MoMo · Orange Money · secure payment by Campay')}</p>
      </div>
      {watch && <PaymentWatcher paiementId={watch} kind="don" onClose={() => setWatch(null)} />}
    </div>
  );
}
