'use client';

import { useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { useMember, type Subscription } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';
import { cancelSubscription, PLAN_NAME, resumeSubscription } from '@/lib/payment';
import { PaymentSheet } from '@/components/PaymentSheet';

/**
 * Résiliation, reprise et rappel de renouvellement (cdc-paiement-sans-sortie.md,
 * 4.3 et 4.4). Tout dépend des champs `resiliable` / `resilie_le` renvoyés par
 * mon_abonnement() : tant que le script SQL n'est pas exécuté ils sont absents,
 * et rien de tout cela ne s'affiche (comportement d'avant).
 */

const RENEW_WINDOW_MS = 3 * 24 * 3600 * 1000;

function useLongDate() {
  const { locale } = useLang();
  return (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '');
}

/** Abonnement payé, non résilié, qui se termine dans moins de 3 jours. */
export function needsRenewal(sub: Subscription, now: number): boolean {
  if (!sub || !sub.ends_at || sub.resilie_le) return false;
  const paid = sub.resiliable ?? sub.source === 'paiement';
  if (!paid) return false;
  const left = new Date(sub.ends_at).getTime() - now;
  return left > 0 && left < RENEW_WINDOW_MS;
}

/** Bouton « Résilier mon abonnement » / libellé « Résilié » + « Reprendre ». */
export function SubscriptionControls({ className = '', showLabel = true }: { className?: string; showLabel?: boolean }) {
  const { subscription, refresh } = useMember();
  const { tr } = useLang();
  const longDate = useLongDate();
  const titleId = useId();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!confirm) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && setConfirm(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirm, busy]);

  if (!subscription) return null;
  const name = PLAN_NAME[subscription.plan];
  const ends = longDate(subscription.ends_at);

  const run = async (fn: () => Promise<{ error: string | null }>) => {
    setBusy(true);
    setError(null);
    const r = await fn();
    if (r.error) setError(r.error);
    else {
      await refresh();
      setConfirm(false);
    }
    setBusy(false);
  };

  if (subscription.resilie_le) {
    return (
      <div className={className}>
        {showLabel && (
          <p className="text-sm font-semibold text-terra">
            {name} · {tr('Résilié', 'Cancelled')} · {tr(`actif jusqu'au ${ends}`, `active until ${ends}`)}
          </p>
        )}
        <button onClick={() => run(resumeSubscription)} disabled={busy} className={`${showLabel ? 'mt-3' : ''} rounded-full bg-gold px-6 py-2.5 text-sm font-extrabold text-ink transition hover:-translate-y-0.5 disabled:opacity-60`}>
          {busy ? tr('Un instant…', 'One moment…') : tr('Reprendre mon abonnement', 'Resume my subscription')}
        </button>
        {error && (
          <p role="alert" className="mt-2 text-sm text-terra">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (subscription.resiliable !== true) return null;

  return (
    <div className={className}>
      <button onClick={() => setConfirm(true)} className="text-sm font-semibold text-muted underline-offset-4 transition hover:text-terra hover:underline">
        {tr('Résilier mon abonnement', 'Cancel my subscription')}
      </button>
      {confirm && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:px-4" data-lenis-prevent onClick={() => !busy && setConfirm(false)}>
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[32px] bg-surface px-6 pb-8 pt-7 text-left ring-1 ring-gold/30 sm:rounded-[32px] sm:px-8"
          >
            <h2 id={titleId} className="font-display text-2xl font-black text-ivory">
              {tr('Résilier ton abonnement ?', 'Cancel your subscription?')}
            </h2>
            <p className="mt-3 text-body">
              {tr(
                `Ton abonnement ${name} reste actif jusqu'au ${ends}. Ensuite, tu repasseras en Découverte (gratuit). Aucun remboursement pour la période en cours.`,
                `Your ${name} subscription stays active until ${ends}. After that, you will go back to Découverte (free). No refund for the current period.`
              )}
            </p>
            {error && (
              <p role="alert" className="mt-3 text-sm text-terra">
                {error}
              </p>
            )}
            <div className="mt-6 grid gap-3">
              <button onClick={() => setConfirm(false)} disabled={busy} autoFocus className="rounded-full bg-gold py-3.5 font-extrabold text-ink">
                {tr('Garder mon abonnement', 'Keep my subscription')}
              </button>
              <button onClick={() => run(cancelSubscription)} disabled={busy} className="rounded-full border border-terra/50 py-3.5 font-bold text-terra transition hover:bg-terra/10 disabled:opacity-60">
                {busy ? tr('Un instant…', 'One moment…') : tr('Confirmer la résiliation', 'Confirm cancellation')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/** Bandeau discret « Ton abonnement X se termine le … · Renouveler » (accueil, compte). */
export function RenewBanner({ className = '' }: { className?: string }) {
  const { member, subscription } = useMember();
  const { tr, locale } = useLang();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // Heure lue après le montage : jamais pendant le rendu serveur.
    const t = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(t);
  }, []);

  if (!member || now === null || !subscription || (!open && !needsRenewal(subscription, now))) return null;
  const name = PLAN_NAME[subscription.plan];
  const ends = subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString(locale, { day: 'numeric', month: 'long' }) : '';

  return (
    <>
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-3 text-sm text-gold-pale ${className}`} role="status">
        <span>{tr(`Ton abonnement ${name} se termine le ${ends}`, `Your ${name} subscription ends on ${ends}`)}</span>
        <button onClick={() => setOpen(true)} className="rounded-full bg-gold px-4 py-1.5 font-extrabold text-ink transition hover:-translate-y-0.5">
          {tr('Renouveler', 'Renew')}
        </button>
      </div>
      {open && <PaymentSheet request={{ type: 'abonnement', plan: subscription.plan, periode: 'monthly' }} onClose={() => setOpen(false)} />}
    </>
  );
}
