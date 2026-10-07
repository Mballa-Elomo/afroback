'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';
import {
  accountPhone,
  cancelPayment,
  checkPayment,
  detectOperateur,
  fcfa,
  formatLocal,
  isValidMobileMoney,
  paymentError,
  price,
  PLAN_NAME,
  requestPayment,
  type Demande,
  type Operateur,
  type PaymentRequest,
} from '@/lib/payment';

/**
 * Feuille « Paiement Mobile Money » (cdc-paiement-sans-sortie.md, section 4).
 * Partagée par l'abonnement, le renouvellement et les dons :
 * 1. récapitulatif + numéro pré-rempli (modifiable) + badge MTN / Orange ;
 * 2. attente « Valide le paiement sur ton téléphone » (vérifié toutes les 3 s,
 *    3 minutes au plus, code USSD de secours, Annuler / Changer de numéro) ;
 * 3. succès sur place, ou échec / délai dépassé avec Réessayer.
 * Aucune page externe : la personne ne quitte jamais le site.
 */

const WAIT_SECONDS = 180;
const POLL_MS = 3000;

type Step = 'form' | 'sending' | 'waiting' | 'success' | 'failed';

export function OperatorBadge({ op }: { op: Operateur | null }) {
  if (!op) return null;
  return op === 'MTN' ? (
    <span className="rounded-full bg-[#ffcc00] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-black">MTN MoMo</span>
  ) : (
    <span className="rounded-full bg-[#ff7900] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-black">Orange Money</span>
  );
}

export function PaymentSheet({ request, onClose }: { request: PaymentRequest; onClose: () => void }) {
  const { session, subscription, refresh } = useAuth();
  const { tr, locale } = useLang();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('form');
  const [phone, setPhone] = useState(() => accountPhone(session?.user));
  const [error, setError] = useState<string | null>(null);
  const [demande, setDemande] = useState<Demande | null>(null);
  const [left, setLeft] = useState(WAIT_SECONDS);
  const [failure, setFailure] = useState<'refuse' | 'delai'>('refuse');
  const pollId = useRef(0);

  const isSub = request.type === 'abonnement';
  const amount = isSub ? price(request.plan, request.periode) : request.montant;
  const op = detectOperateur(phone);
  const valid = isValidMobileMoney(phone);
  const planName = isSub ? PLAN_NAME[request.plan] : '';
  const recap = isSub
    ? `${planName} · ${request.periode === 'monthly' ? tr('1 mois', '1 month') : tr('12 mois', '12 months')} · ${fcfa(amount)}`
    : `${tr('Don', 'Donation')} · ${fcfa(amount)}`;

  // Défilement de la page bloqué + Échap (seulement quand rien n'est en cours).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const stopPolling = () => {
    pollId.current++;
  };

  // Attente : vérification toutes les 3 s, compte à rebours de 3 minutes.
  useEffect(() => {
    if (step !== 'waiting' || !demande) return;
    const id = ++pollId.current;
    const counter = pollId;
    const started = Date.now();
    const timer = setInterval(() => setLeft(Math.max(0, WAIT_SECONDS - Math.floor((Date.now() - started) / 1000))), 1000);
    const tick = async () => {
      if (pollId.current !== id) return;
      const { data } = await checkPayment(demande.paiement_id);
      if (pollId.current !== id) return;
      if (data?.statut === 'reussi') {
        stopPolling();
        await refresh();
        setStep('success');
        return;
      }
      if (data && (data.statut === 'echoue' || data.statut === 'expire' || data.statut === 'annule' || data.statut === 'rembourse')) {
        stopPolling();
        setFailure('refuse');
        setStep('failed');
        return;
      }
      if (Date.now() - started >= WAIT_SECONDS * 1000) {
        stopPolling();
        // La demande est abandonnée ; si elle est validée plus tard, le rattrapage la crédite quand même.
        cancelPayment(demande.paiement_id).catch(() => {});
        setFailure('delai');
        setStep('failed');
        return;
      }
      setTimeout(tick, POLL_MS);
    };
    const first = setTimeout(tick, POLL_MS);
    return () => {
      clearInterval(timer);
      clearTimeout(first);
      if (counter.current === id) counter.current++;
    };
  }, [step, demande, refresh]);

  const pay = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!valid) {
      setError(paymentError('numero_invalide'));
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setStep('sending');
    const r = await requestPayment(request, phone);
    if (!r.data) {
      setError(r.error ?? paymentError());
      setStep('form');
      return;
    }
    setDemande(r.data);
    setLeft(WAIT_SECONDS);
    setStep('waiting');
  };

  const abandon = useCallback(async () => {
    stopPolling();
    if (demande && step === 'waiting') await cancelPayment(demande.paiement_id).catch(() => {});
  }, [demande, step]);

  const cancel = async () => {
    await abandon();
    onClose();
  };

  const changeNumber = async () => {
    await abandon();
    setDemande(null);
    setError(null);
    setStep('form');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const close = useCallback(() => {
    if (step === 'sending' || step === 'waiting') return;
    onClose();
  }, [step, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    if (step === 'form') inputRef.current?.focus();
  }, [step]);

  const endsAt = subscription?.ends_at ? new Date(subscription.ends_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:px-4" data-lenis-prevent onClick={close}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[32px] bg-surface px-6 pb-8 pt-6 ring-1 ring-gold/30 sm:rounded-[32px] sm:px-8"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ivory/15 sm:hidden" aria-hidden />
        {(step === 'form' || step === 'success' || step === 'failed') && (
          <button onClick={close} aria-label={tr('Fermer', 'Close')} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-xl text-muted transition hover:bg-ivory/10 hover:text-ivory">
            ×
          </button>
        )}

        <AnimatePresence mode="wait">
          {(step === 'form' || step === 'sending') && (
            <motion.form key="form" onSubmit={pay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} noValidate>
              <p className="text-xs font-bold tracking-[0.25em] text-gold">{tr('PAIEMENT MOBILE MONEY', 'MOBILE MONEY PAYMENT')}</p>
              <h2 id={titleId} className="mt-2 font-display text-2xl font-black text-ivory">
                {recap}
              </h2>
              <label className="mt-6 block">
                <span className="mb-2 block text-sm font-semibold text-text">{tr('Numéro Mobile Money', 'Mobile Money number')}</span>
                <span className={`flex items-center gap-2 rounded-2xl border bg-ink/60 pr-3 transition focus-within:border-gold ${error ? 'border-terra' : 'border-ivory/15'}`}>
                  <span className="pl-5 text-base text-muted">+237</span>
                  <input
                    ref={inputRef}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => {
                      setPhone(formatLocal(e.target.value));
                      setError(null);
                    }}
                    placeholder="6XX XX XX XX"
                    disabled={step === 'sending'}
                    aria-invalid={!!error}
                    aria-describedby={`${titleId}-hint`}
                    className="w-full bg-transparent py-4 text-lg tracking-wide text-ivory placeholder:text-muted focus:outline-none"
                  />
                  <OperatorBadge op={op} />
                </span>
                <span id={`${titleId}-hint`} className="mt-1.5 block text-xs text-muted">
                  {tr('MTN MoMo ou Orange Money, au Cameroun. Tu valideras sur ton téléphone.', 'MTN MoMo or Orange Money, in Cameroon. You will approve on your phone.')}
                </span>
              </label>
              {error && (
                <p role="alert" className="mt-4 rounded-2xl border border-terra/40 bg-terra-deep/15 px-4 py-3 text-sm text-terra">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={step === 'sending'}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-gold-pale via-gold to-gold-deep py-4 text-base font-extrabold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.3)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
              >
                {step === 'sending' ? tr('Envoi de la demande…', 'Sending the request…') : tr(`Payer ${fcfa(amount)}`, `Pay ${fcfa(amount)}`)}
              </button>
              <p className="mt-3 text-center text-xs text-muted">{tr('Paiement sécurisé par Campay · tu restes sur AFROBACK', 'Secure payment by Campay · you stay on AFROBACK')}</p>
            </motion.form>
          )}

          {step === 'waiting' && demande && (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="relative mx-auto mt-2 grid h-24 w-24 place-items-center" aria-hidden>
                <span className="absolute inset-0 animate-ping rounded-3xl bg-gold/15" />
                <span className="relative grid h-20 w-14 place-items-center rounded-2xl border-2 border-gold bg-ink text-2xl">📱</span>
              </div>
              <h2 id={titleId} className="mt-5 font-display text-2xl font-black text-ivory">
                {tr('Valide le paiement sur ton téléphone', 'Approve the payment on your phone')}
              </h2>
              <p className="mt-2 flex items-center justify-center gap-2 font-semibold text-gold-pale">
                <span>{demande.telephone_masque}</span>
                <OperatorBadge op={demande.operateur === 'ORANGE' ? 'ORANGE' : demande.operateur === 'MTN' ? 'MTN' : null} />
              </p>
              <p className="mt-3 text-body" aria-live="polite">
                {tr(
                  `Une demande de ${fcfa(demande.montant)} vient d'être envoyée. Saisis ton code secret Mobile Money pour valider.`,
                  `A ${fcfa(demande.montant)} payment request has just been sent. Enter your Mobile Money PIN to approve.`
                )}
              </p>
              <p className="mt-4 rounded-2xl bg-ink/60 px-4 py-3 text-sm text-body ring-1 ring-ivory/10">
                {tr('Rien reçu ? Compose ', 'Nothing received? Dial ')}
                <strong className="font-extrabold text-gold">{demande.ussd_code || (demande.operateur === 'ORANGE' ? '#150*50#' : '*126#')}</strong>
                {tr(' sur ton téléphone.', ' on your phone.')}
              </p>
              <p className="mt-4 font-display text-3xl font-black tabular-nums text-ivory" aria-label={tr(`Temps restant : ${mm} min ${ss} s`, `Time left: ${mm} min ${ss} s`)}>
                {mm}:{ss}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={cancel} className="rounded-full border border-ivory/20 py-3 font-bold text-ivory transition hover:border-terra hover:text-terra">
                  {tr('Annuler', 'Cancel')}
                </button>
                <button onClick={changeNumber} className="rounded-full border border-gold/40 py-3 font-bold text-gold transition hover:bg-gold/10">
                  {tr('Changer de numéro', 'Change number')}
                </button>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                {tr(
                  'Si tu annules mais valides quand même la demande sur ton téléphone, le paiement sera crédité normalement : tu ne perds jamais ton argent.',
                  'If you cancel but still approve the request on your phone, the payment will be credited normally: you never lose your money.'
                )}
              </p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center" aria-live="polite">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto mt-2 grid h-20 w-20 place-items-center rounded-full bg-gold text-4xl text-ink" aria-hidden>
                ✓
              </motion.div>
              <h2 id={titleId} className="mt-6 font-display text-3xl font-black text-ivory">
                {isSub ? tr(`Bienvenue dans ${planName} !`, `Welcome to ${planName}!`) : tr('Merci pour ton soutien !', 'Thank you for your support!')}
              </h2>
              <p className="mt-2 text-body">
                {isSub
                  ? endsAt
                    ? tr(`Actif jusqu'au ${endsAt}. Tous les récits sont débloqués.`, `Active until ${endsAt}. Every story is unlocked.`)
                    : tr('Ton abonnement est actif : tous les récits sont débloqués.', 'Your subscription is active: every story is unlocked.')
                  : tr('Ton don finance les prochains récits.', 'Your donation funds the next stories.')}
              </p>
              {isSub ? (
                <Link href="/" onClick={onClose} className="mt-6 inline-block rounded-full bg-gold px-8 py-3.5 font-extrabold text-ink">
                  {tr('Commencer', 'Start')}
                </Link>
              ) : (
                <button onClick={onClose} className="mt-6 rounded-full bg-gold px-8 py-3.5 font-extrabold text-ink">
                  {tr('Fermer', 'Close')}
                </button>
              )}
            </motion.div>
          )}

          {step === 'failed' && (
            <motion.div key="ko" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center" role="alert">
              <div className="mx-auto mt-2 grid h-16 w-16 place-items-center rounded-full bg-terra-deep/30 text-3xl text-terra" aria-hidden>
                !
              </div>
              <h2 id={titleId} className="mt-5 font-display text-2xl font-black text-ivory">
                {failure === 'delai' ? tr('Délai dépassé', 'Time is up') : tr('Paiement non validé', 'Payment not approved')}
              </h2>
              <p className="mt-2 text-body">{tr('Paiement non validé. Vérifie ton solde puis réessaie.', 'Payment not approved. Check your balance and try again.')}</p>
              {failure === 'delai' && (
                <p className="mt-2 text-xs text-muted">
                  {tr('Si tu valides la demande plus tard, elle sera tout de même créditée.', 'If you approve the request later, it will still be credited.')}
                </p>
              )}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => pay()} className="rounded-full bg-gold py-3 font-extrabold text-ink">
                  {tr('Réessayer', 'Try again')}
                </button>
                <button onClick={changeNumber} className="rounded-full border border-gold/40 py-3 font-bold text-gold transition hover:bg-gold/10">
                  {tr('Changer de numéro', 'Change number')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
