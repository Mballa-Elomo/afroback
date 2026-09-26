import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../data/supabaseClient';

/**
 * Authentification par téléphone + mot de passe uniquement (décision de
 * Yannick du 2026-07-30) : pas d'email, pas de Google/Facebook, pas de code
 * OTP envoyé par SMS. Ça suppose que le provider "Phone" est activé côté
 * dashboard Supabase (Authentication → Providers → Phone) avec la
 * confirmation automatique activée (pas de vérification SMS), sans quoi
 * `signUpWithPhone` crée bien le compte mais aucune session n'est ouverte
 * (voir le message d'erreur renvoyé dans ce cas).
 *
 * Authentification à deux facteurs (MFA/2FA, lot cybersécurité du 2026-09-25,
 * revu le 2026-09-26) : TOTP uniquement (app d'authentification type Google
 * Authenticator/Authy), jamais SMS — même raison que ci-dessus, pas de
 * fournisseur SMS payant à gérer. Proposée activement juste après
 * l'inscription (`app/onboarding/mfa-proposal.tsx`), jamais obligatoire —
 * voir `app-mobile/cdc-mfa-inscription.md`.
 *
 * **TOTP maison, pas le module MFA natif de Supabase Auth** : ce dernier
 * échoue à 100% côté serveur (`"Error generating QR Code"`, bug confirmé le
 * 2026-09-25, hors de notre contrôle). Remplacé par une implémentation
 * conforme au RFC 6238, calculée et vérifiée en PL/pgSQL
 * (`supabase/schema-totp-custom.sql`) via des fonctions RPC
 * (`mfa_totp_enroll`, `mfa_totp_confirm`, `mfa_totp_status`,
 * `mfa_totp_verify_challenge`, `mfa_totp_disable`) — jamais
 * `supabase.auth.mfa.*`. Le niveau d'assurance de session (AAL) n'existe
 * plus côté Supabase pour ce facteur : `mfaChallengeSatisfiedRef` ci-dessous
 * en tient lieu, en mémoire seulement (jamais persisté), ce qui a le même
 * effet voulu — revalider le code à chaque nouveau lancement de l'app.
 */

export interface OnboardingChoices {
  langueInterface: 'fr' | 'en';
  usages: string[];
  forfait: 'decouverte' | 'racines' | 'heritage';
  billing?: 'monthly' | 'yearly';
  /** 'simulated' tant qu'aucun agrégateur Mobile Money n'est branché (voir payment.tsx) — jamais confondu avec un vrai paiement. */
  paymentStatus?: 'none' | 'simulated';
}

/**
 * Statut MFA (2FA) : distinct de la session elle-même. Une session peut
 * exister (mot de passe correct) sans avoir encore passé le défi TOTP de
 * cette session — voir `refreshMfaStatus`/`confirmMfaChallengePassed`.
 */
export type MfaStatus =
  | 'unknown' // pas encore vérifié
  | 'not_enrolled' // aucun facteur MFA activé sur ce compte
  | 'challenge_required' // facteur activé, code pas encore saisi pour cette session
  | 'satisfied'; // pas de MFA, ou code déjà validé pour cette session

interface AuthState {
  /** undefined tant que la session initiale n'a pas été lue depuis le stockage local. */
  session: Session | null | undefined;
  /** true une fois l'assistant post-inscription (langue/usage/forfait) terminé — voir completeOnboarding. */
  onboardingComplete: boolean;
  mfaStatus: MfaStatus;
  refreshMfaStatus: () => Promise<void>;
  /** Appelée par l'écran de défi (`app/onboarding/mfa-challenge.tsx`) après un code validé — fait passer `mfaStatus` à 'satisfied' pour le reste de cette session app. */
  confirmMfaChallengePassed: () => void;
  signUpWithPhone: (params: {
    phone: string;
    password: string;
    prenom: string;
    pays: string;
  }) => Promise<{ error: string | null }>;
  signInWithPhone: (params: { phone: string; password: string }) => Promise<{ error: string | null }>;
  completeOnboarding: (choices: OnboardingChoices) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [mfaStatus, setMfaStatus] = useState<MfaStatus>('unknown');
  // En mémoire seulement (jamais persisté) : se réinitialise à chaque
  // lancement de l'app, donc le défi MFA est revalidé une fois par session
  // app — comportement voulu, équivalent à ce que faisait l'AAL Supabase.
  const mfaChallengeSatisfiedRef = useRef(false);

  const refreshMfaStatus = async () => {
    const { data, error } = await supabase.rpc('mfa_totp_status');
    if (error || !data?.enabled) {
      setMfaStatus('not_enrolled');
      return;
    }
    setMfaStatus(mfaChallengeSatisfiedRef.current ? 'satisfied' : 'challenge_required');
  };

  const confirmMfaChallengePassed = () => {
    mfaChallengeSatisfiedRef.current = true;
    setMfaStatus('satisfied');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      refreshMfaStatus();
    } else {
      setMfaStatus('unknown');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const onboardingComplete = session?.user?.user_metadata?.onboarding_complete === true;

  const value = useMemo<AuthState>(
    () => ({
      session,
      onboardingComplete,
      mfaStatus,
      refreshMfaStatus,
      confirmMfaChallengePassed,
      async signUpWithPhone({ phone, password, prenom, pays }) {
        if (!isLikelyValidE164(phone)) {
          return { error: 'Numéro de téléphone invalide. Vérifie le pays et le numéro saisis.' };
        }
        const { data, error } = await supabase.auth.signUp({
          phone,
          password,
          options: { data: { prenom, pays } },
        });
        if (error) return { error: translateAuthError(error.message) };
        if (!data.session) {
          // Le compte est créé côté Supabase mais aucune session n'a été ouverte :
          // le provider Phone attend probablement une confirmation SMS (auto-confirm
          // désactivé côté dashboard). Voir la note en tête de fichier.
          return {
            error:
              "Compte créé, mais aucune session n'a été ouverte automatiquement. Vérifie que la confirmation automatique du téléphone est activée dans Supabase (Authentication → Providers → Phone).",
          };
        }
        return { error: null };
      },
      async signInWithPhone({ phone, password }) {
        if (!isLikelyValidE164(phone)) {
          return { error: 'Numéro de téléphone invalide. Vérifie le pays et le numéro saisis.' };
        }
        // Protection brute force (lot cybersécurité du 2026-09-25) : verrou
        // appliqué côté application, voir la limite documentée en tête de
        // supabase/schema-security-auth.sql (n'empêche pas un appel direct à
        // l'API Supabase en contournant l'app, seulement un brute force fait
        // à travers l'app elle-même — la cible réaliste ici).
        const { data: lockout } = await supabase.rpc('check_login_lockout', { p_phone: phone });
        if (lockout?.locked) {
          const until = new Date(lockout.locked_until as string);
          return {
            error: `Trop de tentatives échouées. Réessaie après ${until.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}.`,
          };
        }
        const { error } = await supabase.auth.signInWithPassword({ phone, password });
        await supabase.rpc('record_login_attempt', { p_phone: phone, p_success: !error });
        if (!error) await refreshMfaStatus();
        return { error: error ? translateAuthError(error.message) : null };
      },
      async completeOnboarding(choices) {
        const { error } = await supabase.auth.updateUser({
          data: {
            onboarding_complete: true,
            langue_interface: choices.langueInterface,
            usages: choices.usages,
            forfait: choices.forfait,
            billing: choices.billing ?? null,
            payment_status: choices.paymentStatus ?? 'none',
          },
        });
        return { error: error ? translateAuthError(error.message) : null };
      },
      async signOut() {
        // scope 'global' explicite (gestion de session, lot cybersécurité du
        // 2026-09-25) : révoque la session sur TOUS les appareils connectés
        // avec ce compte, pas seulement celui-ci — comportement déjà celui
        // par défaut du SDK, rendu explicite plutôt qu'implicite.
        mfaChallengeSatisfiedRef.current = false;
        await supabase.auth.signOut({ scope: 'global' });
      },
    }),
    [session, onboardingComplete, mfaStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Format E.164 attendu par Supabase : + suivi de 8 à 15 chiffres, sans espace. */
function isLikelyValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

/** Messages Supabase Auth traduits pour l'UI, sans changer le comportement (mêmes cas d'erreur). */
function translateAuthError(message: string): string {
  const known: Record<string, string> = {
    'Invalid login credentials': 'Numéro de téléphone ou mot de passe incorrect.',
    'User already registered': 'Un compte existe déjà avec ce numéro de téléphone.',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
    'Phone not confirmed': "Ce numéro n'est pas confirmé. Vérifie la configuration du provider Phone dans Supabase.",
    'Unsupported phone provider': "L'authentification par téléphone n'est pas encore activée côté Supabase.",
    'Signups not allowed for this instance': 'Les inscriptions ne sont pas autorisées pour le moment.',
  };
  return known[message] ?? message;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>.');
  return ctx;
}
