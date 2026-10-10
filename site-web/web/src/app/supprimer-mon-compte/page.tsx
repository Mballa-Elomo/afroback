'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Field, Notice } from '@/components/auth-ui';
import { useMember } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';

/**
 * Suppression de compte (exigence Google Play, app-mobile/cdc-play-store.md,
 * lot 1). Page publique : c'est l'adresse donnée à Google dans « Sécurité des
 * données ». Elle explique la démarche (aussi possible dans l'app : Profil →
 * Sécurité → Supprimer mon compte) ; une personne connectée peut supprimer
 * son compte ici, mot de passe revérifié puis confirmation en deux temps.
 */
export default function SupprimerMonCompte() {
  const { ready, session, member, subscription, deleteAccount } = useMember();
  const { tr } = useLang();
  const [password, setPassword] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = !!password && understood && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!confirming) return setConfirming(true);
    setBusy(true);
    setError(null);
    const r = await deleteAccount(password);
    setBusy(false);
    if (r.error) {
      setConfirming(false);
      return setError(r.error);
    }
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pb-20 pt-32">
      <h1 className="text-gold-gradient font-display text-4xl font-black">{tr('Supprimer mon compte', 'Delete my account')}</h1>
      <p className="mt-4 text-body">
        {tr(
          'Tu peux supprimer ton compte AFROBACK à tout moment, ici ou dans l’application (Profil → Sécurité → Supprimer mon compte). La suppression est immédiate et définitive.',
          'You can delete your AFROBACK account at any time, here or in the app (Profile → Security → Delete my account). Deletion is immediate and permanent.'
        )}
      </p>

      <section className="mt-8 rounded-3xl bg-terra-deep/10 p-6 ring-1 ring-terra-deep/40">
        <h2 className="font-bold text-heading">{tr('Ce qui est supprimé', 'What is deleted')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-body">
          {tr(
            'Ton compte (email, téléphone, mot de passe, vérification en 2 étapes), ton profil et tes publications dans la Communauté, tes commentaires et « j’aime », les profils enfants et leur progression, ta boutique et tes commandes au Marché, ta progression aux quiz, tes photos, tes appareils de confiance.',
            'Your account (email, phone, password, 2-step verification), your Community profile and posts, your comments and likes, child profiles and their progress, your Market shop and orders, your quiz progress, your photos, your trusted devices.'
          )}
        </p>
        <h2 className="mt-5 font-bold text-heading">{tr('Ce qui est conservé', 'What is kept')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-body">
          {tr(
            'L’historique de tes paiements (montant, date, référence), sans aucun lien avec toi, pour respecter nos obligations comptables.',
            'Your payment history (amount, date, reference), with no link to you, to meet our accounting obligations.'
          )}
        </p>
      </section>

      <div className="mt-8">
        {done ? (
          <Notice tone="success">{tr('Ton compte a été supprimé. Merci d’avoir fait partie d’AFROBACK.', 'Your account has been deleted. Thank you for being part of AFROBACK.')}</Notice>
        ) : !ready ? null : !session ? (
          <div className="rounded-3xl bg-surface p-6 ring-1 ring-ivory/10">
            <p className="text-body">{tr('Connecte-toi pour supprimer ton compte.', 'Sign in to delete your account.')}</p>
            <Link href="/connexion?suite=/supprimer-mon-compte" className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-bold text-ink">
              {tr('Me connecter', 'Sign in')}
            </Link>
          </div>
        ) : !member ? (
          <Notice tone="info">{tr('Termine d’abord la vérification de ton compte sur ce navigateur.', 'First finish verifying your account on this browser.')}</Notice>
        ) : (
          <form onSubmit={submit} className="space-y-5 rounded-3xl bg-surface p-6 ring-1 ring-ivory/10">
            {subscription && (
              <Notice tone="error">{tr('Ton abonnement en cours sera perdu, sans remboursement.', 'Your current subscription will be lost, with no refund.')}</Notice>
            )}
            <Field
              label={tr('Ton mot de passe', 'Your password')}
              type="password"
              value={password}
              onChange={(v) => {
                setPassword(v);
                setConfirming(false);
              }}
              autoComplete="current-password"
            />
            <label className="flex cursor-pointer items-start gap-3 text-sm text-body">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => {
                  setUnderstood(e.target.checked);
                  setConfirming(false);
                }}
                className="mt-0.5 h-5 w-5 accent-[#a0522d]"
              />
              {tr('Je comprends que la suppression est définitive', 'I understand that deletion is permanent')}
            </label>
            {confirming && (
              <div className="rounded-2xl p-4 ring-1 ring-terra-deep">
                <p className="font-bold text-terra">{tr('Supprimer ton compte ?', 'Delete your account?')}</p>
                <p className="mt-1 text-sm text-body">{tr('Toutes tes données AFROBACK seront effacées. Cette action est irréversible.', 'All your AFROBACK data will be erased. This cannot be undone.')}</p>
              </div>
            )}
            {error && <Notice tone="error">{error}</Notice>}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-full bg-terra-deep px-6 py-3.5 font-bold text-ivory transition disabled:opacity-40"
            >
              {busy ? '…' : confirming ? tr('Supprimer', 'Delete') : tr('Supprimer définitivement', 'Delete permanently')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
