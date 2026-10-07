'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { checkPayment, type PaymentStatus } from '@/lib/payment';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';

/**
 * Ancien parcours (page Campay) : ne sert plus qu'à /paiement/retour, pour un
 * paiement commencé avant la feuille de paiement sans sortie (PaymentSheet).
 * Suivi du paiement en direct : vérifie toutes les 4 s pendant 6 minutes
 * (la personne valide sur son téléphone, MTN ou Orange). Succès : forfait
 * rechargé depuis le serveur.
 */
export function PaymentWatcher({ paiementId, kind, onClose }: { paiementId: string; kind: 'abonnement' | 'don'; onClose: () => void }) {
  const { refresh } = useAuth();
  const { tr } = useLang();
  const [statut, setStatut] = useState<PaymentStatus | 'timeout'>('en_attente');

  useEffect(() => {
    let stop = false;
    const started = Date.now();
    const tick = async () => {
      if (stop) return;
      const { data } = await checkPayment(paiementId);
      if (data && data.statut !== 'en_attente') {
        setStatut(data.statut);
        if (data.statut === 'reussi') refresh();
        return;
      }
      if (Date.now() - started > 6 * 60_000) return setStatut('timeout');
      setTimeout(tick, 4000);
    };
    tick();
    return () => {
      stop = true;
    };
  }, [paiementId, refresh]);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-[32px] bg-surface p-8 text-center ring-1 ring-gold/30">
        {statut === 'en_attente' && (
          <>
            <div className="mx-auto h-20 w-20 animate-spin rounded-full border-4 border-gold/20 border-t-gold" />
            <p className="mt-6 font-display text-2xl font-bold text-ivory">{tr('Confirme sur ton téléphone', 'Confirm on your phone')}</p>
            <p className="mt-2 text-body">{tr('Valide le paiement sur ton téléphone (MTN MoMo ou Orange Money). Cette page se met à jour toute seule.', 'Approve the payment on your phone (MTN MoMo or Orange Money). This page updates by itself.')}</p>
          </>
        )}
        {statut === 'reussi' && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold text-4xl text-ink">
              ✓
            </motion.div>
            <p className="mt-6 font-display text-3xl font-black text-ivory">{kind === 'don' ? tr('Merci pour ton soutien !', 'Thank you for your support!') : tr('Bienvenue !', 'Welcome!')}</p>
            <p className="mt-2 text-body">{kind === 'don' ? tr('Ton don finance les prochains récits.', 'Your donation funds the next stories.') : tr('Ton abonnement est actif : tous les récits sont débloqués.', 'Your subscription is active: every story is unlocked.')}</p>
            <Link href="/" onClick={onClose} className="mt-6 inline-block rounded-full bg-gold px-7 py-3 font-extrabold text-ink">
              {tr('Découvrir les récits', 'Discover the stories')}
            </Link>
          </>
        )}
        {(statut === 'echoue' || statut === 'annule' || statut === 'expire' || statut === 'rembourse') && (
          <>
            <p className="font-display text-2xl font-bold text-ivory">{tr('Paiement non abouti', 'Payment not completed')}</p>
            <p className="mt-2 text-body">{tr("Aucun montant n'a été débité. Tu peux réessayer.", 'Nothing was charged. You can try again.')}</p>
            <button onClick={onClose} className="mt-6 rounded-full bg-gold px-7 py-3 font-extrabold text-ink">
              {tr('Réessayer', 'Try again')}
            </button>
          </>
        )}
        {statut === 'timeout' && (
          <>
            <p className="font-display text-2xl font-bold text-ivory">{tr('Toujours en attente', 'Still pending')}</p>
            <p className="mt-2 text-body">{tr('Si tu as validé sur ton téléphone, ton forfait sera débloqué dès que Campay confirmera. Tu peux fermer cette fenêtre.', 'If you approved on your phone, your plan will unlock as soon as Campay confirms. You can close this window.')}</p>
            <button onClick={onClose} className="mt-6 rounded-full border border-gold/40 px-7 py-3 font-bold text-gold">
              {tr('Fermer', 'Close')}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
