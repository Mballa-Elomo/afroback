import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { supabase } from '../data/supabaseClient';
import { getDeviceId, getDeviceName } from '../security/device';
import i18n, { currentLanguage } from '../i18n';
import { LEGAL_VERSION } from '../legal/documents';

/**
 * Authentification — revue le 2026-09-29 (Module 1, `app-mobile/cdc-onboarding.md`) :
 * - **Inscription par email** (prénom + email + mot de passe, identique à la
 *   maquette de Yannick). La confirmation d'email est activée côté Supabase
 *   (`mailer_autoconfirm: false`, vérifié le 2026-09-29) : `signUpWithEmail`
 *   ne renvoie donc pas de session, l'écran `verification-email.tsx` valide
 *   le code à 6 chiffres reçu (`verifySignupCode`). Le modèle d'email
 *   Supabase doit contenir `{{ .Token }}` pour que ce code soit envoyé (voir
 *   Module 2 : fournisseur SMTP + modèle aux couleurs AFROBACK).
 * - **Connexion par email ou téléphone** : les comptes créés avant le
 *   2026-09-29 (téléphone + mot de passe, provider "Phone" en confirmation
 *   automatique, pas de SMS) doivent pouvoir continuer à se connecter.
 * - **Mode invité** ("Explorer sans compte") : état local uniquement, aucun
 *   compte créé côté serveur. Lecture seule des contenus déjà publics (RLS
 *   vérifiée le 2026-09-29) ; toute action personnelle passe par
 *   `AccountWall`. Jamais persisté : relancer l'app ramène à l'écran d'entrée.
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
  /** Forfait payant choisi pendant l'inscription alors que le paiement n'existe pas encore : indicateur d'intérêt pour Yannick, n'ouvre aucun droit. */
  forfaitSouhaite?: 'racines' | 'heritage' | null;
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

/**
 * Appareil (cdc-appareil-unique.md) : un compte = un appareil actif, et un
 * appareil inconnu doit prouver l'identité avant d'accéder à l'app.
 */
export type DeviceStatus =
  | 'unknown' // vérification en cours
  | 'ok' // appareil de confiance et actif (ou fonction serveur pas encore installée)
  | 'a_verifier'; // appareil inconnu : écran "Nouvel appareil détecté"

interface AuthState {
  /** undefined tant que la session initiale n'a pas été lue depuis le stockage local. */
  session: Session | null | undefined;
  /** true une fois l'assistant post-inscription (langue/usage/forfait) terminé — voir completeOnboarding. */
  onboardingComplete: boolean;
  mfaStatus: MfaStatus;
  refreshMfaStatus: () => Promise<void>;
  /** Appelée par l'écran de défi (`app/onboarding/mfa-challenge.tsx`) après un code validé — fait passer `mfaStatus` à 'satisfied' pour le reste de cette session app. */
  confirmMfaChallengePassed: () => void;
  /** Crée le compte ; `needsVerification` = un code a été envoyé par email, aucune session ouverte pour l'instant. */
  signUpWithEmail: (params: {
    email: string;
    password: string;
    prenom: string;
    /** Format E.164 (+2376…) : recopié côté serveur comme identifiant de connexion (schema-telephone-inscription.sql). */
    telephone: string;
  }) => Promise<{ error: string | null; needsVerification: boolean; emailExists?: boolean; phoneTaken?: boolean }>;
  /** Mot de passe oublié : envoie un code par e-mail (réponse neutre, qu'un compte existe ou non). */
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  /** Valide le code reçu et enregistre le nouveau mot de passe ; la personne est ensuite connectée. */
  resetPasswordWithCode: (params: { email: string; code: string; password: string }) => Promise<{ error: string | null }>;
  verifySignupCode: (params: { email: string; code: string }) => Promise<{ error: string | null }>;
  resendSignupCode: (email: string) => Promise<{ error: string | null }>;
  /** `unconfirmed` : mot de passe correct mais email jamais confirmé — un nouveau code vient d'être envoyé. */
  signInWithEmail: (params: { email: string; password: string }) => Promise<{ error: string | null; unconfirmed?: boolean }>;
  signInWithPhone: (params: { phone: string; password: string }) => Promise<{ error: string | null }>;
  /** true quand la personne explore sans compte (jamais en même temps qu'une session). */
  isGuest: boolean;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  completeOnboarding: (choices: OnboardingChoices) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  deviceStatus: DeviceStatus;
  /** 'autre_appareil' : cet appareil vient d'être déconnecté parce que le compte a été validé ailleurs. */
  sessionEndedReason: 'autre_appareil' | null;
  clearSessionEndedReason: () => void;
  /** Envoie le code "nouvel appareil" à l'email du compte. */
  requestDeviceCode: () => Promise<{ error: string | null }>;
  /** Valide l'appareil avec le code reçu par email. */
  verifyDeviceWithEmailCode: (code: string) => Promise<{ error: string | null }>;
  /** Valide l'appareil avec le code de l'application d'authentification (vérifié côté serveur). */
  verifyDeviceWithTotp: (code: string) => Promise<{ error: string | null; locked?: boolean }>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [mfaStatus, setMfaStatus] = useState<MfaStatus>('unknown');
  const [guestMode, setGuestMode] = useState(false);
  // En mémoire seulement (jamais persisté) : se réinitialise à chaque
  // lancement de l'app, donc le défi MFA est revalidé une fois par session
  // app — comportement voulu, équivalent à ce que faisait l'AAL Supabase.
  const mfaChallengeSatisfiedRef = useRef(false);
  // Pendant "mot de passe oublié" : la validation du code ouvre une session
  // AVANT que le nouveau mot de passe soit enregistré. On ne la publie pas
  // tout de suite, sinon la navigation quitterait l'écran en plein milieu.
  const recoveringRef = useRef(false);
  // Appareil : "connexion fraîche" (mot de passe ou code juste saisi ici) →
  // cet appareil peut prendre la main ; sinon (app rouverte avec une session
  // mémorisée) on se contente de vérifier qu'il est toujours l'actif.
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>('unknown');
  const [sessionEndedReason, setSessionEndedReason] = useState<'autre_appareil' | null>(null);
  const freshLoginRef = useRef(false);
  const revokeOthersAfterActivationRef = useRef(false);

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
      if (recoveringRef.current) return;
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

  /** Fin de session parce qu'un autre appareil a pris la main : déconnexion locale + message. */
  const endSessionReplaced = async () => {
    mfaChallengeSatisfiedRef.current = false;
    setSessionEndedReason('autre_appareil');
    await supabase.auth.signOut({ scope: 'local' });
  };

  /** Réponse serveur "appareil actif" : déconnecte les autres sessions et prévient par email si nouvel appareil. */
  const onDeviceActivated = async (res: { nouveau?: boolean; alerte?: boolean; autre_appareil_deconnecte?: boolean }) => {
    setDeviceStatus('ok');
    setSessionEndedReason(null);
    if (res.nouveau || res.autre_appareil_deconnecte) {
      await supabase.auth.signOut({ scope: 'others' }).catch(() => {});
    }
    if (revokeOthersAfterActivationRef.current) {
      revokeOthersAfterActivationRef.current = false;
      await supabase.rpc('revoquer_autres_appareils', { p_device_id: await getDeviceId() });
    }
    if (res.alerte) {
      // Email d'alerte (seulement si le compte avait déjà un autre appareil) (fonction serveur "alerte-connexion") : best-effort, ne bloque jamais.
      supabase.functions
        .invoke('alerte-connexion', { body: { appareil: getDeviceName(), langue: currentLanguage() } })
        .catch(() => {});
    }
  };

  const checkDevice = async () => {
    const fresh = freshLoginRef.current;
    freshLoginRef.current = false;
    const deviceId = await getDeviceId();
    const { data, error } = await supabase.rpc(fresh ? 'ouvrir_session_appareil' : 'etat_appareil', {
      p_device_id: deviceId,
      p_nom: getDeviceName(),
    });
    if (error) {
      // Script serveur pas encore exécuté (ou réseau) : fonctionnalité inactive, on ne bloque jamais l'accès.
      setDeviceStatus('ok');
      return;
    }
    const etat = (data as { etat?: string })?.etat;
    if (etat === 'actif') return onDeviceActivated(data as { nouveau?: boolean; autre_appareil_deconnecte?: boolean });
    if (etat === 'remplace') return endSessionReplaced();
    setDeviceStatus(etat === 'a_verifier' ? 'a_verifier' : 'ok');
  };

  useEffect(() => {
    if (session) {
      checkDevice();
    } else {
      setDeviceStatus('unknown');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // L'ancien appareil découvre qu'il a été remplacé : toutes les 60 s et à chaque retour sur l'app (D2).
  useEffect(() => {
    if (!session || deviceStatus !== 'ok') return;
    const poll = async () => {
      const { data, error } = await supabase.rpc('etat_appareil', { p_device_id: await getDeviceId() });
      if (!error && (data as { etat?: string })?.etat === 'remplace') endSessionReplaced();
    };
    const id = setInterval(poll, 60_000);
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') poll();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, deviceStatus]);

  const onboardingComplete = session?.user?.user_metadata?.onboarding_complete === true;
  // Une session ouverte (inscription ou connexion depuis le mode invité) met fin au mode invité.
  const isGuest = guestMode && !session;

  /**
   * Connexion commune email/téléphone, avec la protection brute force du lot
   * cybersécurité (2026-09-25). `identifier` est la clé de verrouillage : le
   * numéro E.164 ou l'email en minuscules — `login_attempts.phone` est un
   * simple texte, aucune migration nécessaire. Limite documentée en tête de
   * supabase/schema-security-auth.sql (n'empêche pas un appel direct à l'API
   * Supabase, seulement un brute force fait à travers l'app elle-même).
   */
  const signInWithPassword = async (
    identifier: string,
    credentials: { email: string; password: string } | { phone: string; password: string }
  ) => {
    const { data: lockout } = await supabase.rpc('check_login_lockout', { p_phone: identifier });
    if (lockout?.locked) {
      const until = new Date(lockout.locked_until as string);
      return {
        error: i18n.t('authErrors.lockout', {
          time: until.toLocaleTimeString(currentLanguage() === 'en' ? 'en-GB' : 'fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }),
      };
    }
    freshLoginRef.current = true;
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) freshLoginRef.current = false;
    // Email non confirmé : Supabase ne le signale qu'après un mot de passe correct,
    // ce n'est donc pas un échec de connexion au sens du verrouillage.
    const unconfirmed = !!error && (error.code === 'email_not_confirmed' || error.message === 'Email not confirmed');
    await supabase.rpc('record_login_attempt', { p_phone: identifier, p_success: !error || unconfirmed });
    if (unconfirmed) return { error: null, unconfirmed: true };
    if (!error) await refreshMfaStatus();
    return { error: error ? translateAuthError(error.message) : null, unconfirmed: false };
  };

  const value = useMemo<AuthState>(
    () => ({
      session,
      onboardingComplete,
      mfaStatus,
      refreshMfaStatus,
      confirmMfaChallengePassed,
      isGuest,
      deviceStatus,
      sessionEndedReason,
      clearSessionEndedReason: () => setSessionEndedReason(null),
      async requestDeviceCode() {
        const email = session?.user?.email;
        if (!email) return { error: i18n.t('device.noEmail') };
        const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
        return { error: error ? translateAuthError(error.message) : null };
      },
      async verifyDeviceWithEmailCode(code) {
        const email = session?.user?.email;
        if (!email) return { error: i18n.t('device.noEmail') };
        // Le code ouvre une session dont le jeton porte la preuve "otp", que le serveur vérifie.
        const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
        if (error) return { error: translateAuthError(error.message) };
        const { data, error: rpcError } = await supabase.rpc('valider_appareil', {
          p_device_id: await getDeviceId(),
          p_nom: getDeviceName(),
        });
        if (rpcError || (data as { etat?: string })?.etat !== 'actif') return { error: i18n.t('device.failed') };
        await onDeviceActivated(data as { nouveau?: boolean; autre_appareil_deconnecte?: boolean });
        return { error: null };
      },
      async verifyDeviceWithTotp(code) {
        const { data, error } = await supabase.rpc('valider_appareil', {
          p_device_id: await getDeviceId(),
          p_nom: getDeviceName(),
          p_code_totp: code,
        });
        const res = data as { etat?: string; erreur?: string } | null;
        if (error || res?.etat !== 'actif') {
          const locked = res?.erreur === 'verrouille';
          return { error: locked ? i18n.t('mfa.errors.locked') : i18n.t('mfa.errors.codeWrong'), locked };
        }
        // Le même code vaut aussi pour la vérification en 2 étapes de cette session.
        confirmMfaChallengePassed();
        await onDeviceActivated(res as { nouveau?: boolean; autre_appareil_deconnecte?: boolean });
        return { error: null };
      },
      enterGuestMode: () => setGuestMode(true),
      exitGuestMode: () => setGuestMode(false),
      async signUpWithEmail({ email, password, prenom, telephone }) {
        const normalized = email.trim().toLowerCase();
        if (!isLikelyValidEmail(normalized)) {
          return { error: i18n.t('authErrors.invalidEmail'), needsVerification: false };
        }
        if (!isLikelyValidE164(telephone)) {
          return { error: i18n.t('signup.errors.phone'), needsVerification: false };
        }
        // Numéro déjà utilisé ? Message clair plutôt qu'une erreur technique de la base.
        // Fonction absente (script pas encore exécuté) : on laisse la base trancher.
        const dispo = await supabase.rpc('telephone_disponible', { p_telephone: telephone });
        if (!dispo.error && dispo.data === false) {
          return { error: i18n.t('signup.errors.phoneTaken'), needsVerification: false, phoneTaken: true };
        }
        const { data, error } = await supabase.auth.signUp({
          email: normalized,
          password,
          options: {
            data: {
              prenom,
              telephone,
              // Langue de l'email de confirmation (modèle bilingue côté Supabase) et de l'app.
              langue: currentLanguage(),
              // Preuve du consentement (cdc-inscription.md, section 3).
              consent_at: new Date().toISOString(),
              consent_version: CONSENT_VERSION,
            },
          },
        });
        if (error) {
          // Filet de sécurité : numéro pris entre la vérification et l'inscription.
          if (/database error saving new user/i.test(error.message)) {
            return { error: i18n.t('signup.errors.phoneTaken'), needsVerification: false, phoneTaken: true };
          }
          return { error: translateAuthError(error.message), needsVerification: false };
        }
        // Supabase ne renvoie pas d'erreur pour un email déjà inscrit (protection
        // contre l'énumération de comptes) : il renvoie un utilisateur sans
        // identité. On le dit honnêtement plutôt que de faire attendre un code
        // qui n'arrivera jamais.
        if (data.user?.identities && data.user.identities.length === 0) {
          return { error: i18n.t('authErrors.emailExists'), needsVerification: false, emailExists: true };
        }
        return { error: null, needsVerification: !data.session };
      },
      async verifySignupCode({ email, code }) {
        freshLoginRef.current = true;
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: code,
          type: 'email',
        });
        if (error) freshLoginRef.current = false;
        return { error: error ? translateAuthError(error.message) : null };
      },
      async resendSignupCode(email) {
        const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
        return { error: error ? translateAuthError(error.message) : null };
      },
      async requestPasswordReset(email) {
        const normalized = email.trim().toLowerCase();
        if (!isLikelyValidEmail(normalized)) return { error: i18n.t('authErrors.invalidEmail') };
        // Supabase répond sans erreur même si aucun compte n'existe : l'écran reste
        // volontairement neutre pour ne pas révéler qui est inscrit.
        const { error } = await supabase.auth.resetPasswordForEmail(normalized);
        return { error: error ? translateAuthError(error.message) : null };
      },
      async resetPasswordWithCode({ email, code, password }) {
        recoveringRef.current = true;
        // Nouveau mot de passe : cet appareil devient l'actif et les autres perdent la confiance (règle D3).
        freshLoginRef.current = true;
        revokeOthersAfterActivationRef.current = true;
        try {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token: code,
            type: 'recovery',
          });
          if (verifyError) {
            freshLoginRef.current = false;
            revokeOthersAfterActivationRef.current = false;
            return { error: translateAuthError(verifyError.message) };
          }
          const { error: updateError } = await supabase.auth.updateUser({ password });
          if (updateError) {
            // Code valide mais mot de passe refusé : on referme la session ouverte par le code.
            await supabase.auth.signOut({ scope: 'local' });
            return { error: translateAuthError(updateError.message) };
          }
          return { error: null };
        } finally {
          recoveringRef.current = false;
          // Publie enfin la session (connecté avec le nouveau mot de passe, ou aucune en cas d'échec).
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
        }
      },
      async signInWithEmail({ email, password }) {
        const normalized = email.trim().toLowerCase();
        if (!isLikelyValidEmail(normalized)) return { error: i18n.t('authErrors.invalidEmail') };
        const res = await signInWithPassword(normalized, { email: normalized, password });
        if (res.unconfirmed) {
          // Inscription jamais terminée (app fermée avant le code) : on renvoie un
          // code et l'écran de saisie prend le relais, au lieu d'un message d'erreur.
          await supabase.auth.resend({ type: 'signup', email: normalized });
          return { error: null, unconfirmed: true };
        }
        return { error: res.error };
      },
      async signInWithPhone({ phone, password }) {
        if (!isLikelyValidE164(phone)) {
          return { error: i18n.t('authErrors.invalidPhone') };
        }
        return signInWithPassword(phone, { phone, password });
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
            forfait_souhaite: choices.forfaitSouhaite ?? null,
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
    [session, onboardingComplete, mfaStatus, isGuest, deviceStatus, sessionEndedReason]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Format E.164 attendu par Supabase : + suivi de 8 à 15 chiffres, sans espace. */
function isLikelyValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

/** Version des conditions acceptées à l'inscription (src/legal/documents.ts). */
const CONSENT_VERSION = LEGAL_VERSION;

function isLikelyValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Messages Supabase Auth traduits pour l'UI (langue courante), sans changer le comportement (mêmes cas d'erreur). */
const AUTH_ERROR_KEYS: Record<string, string> = {
  'Invalid login credentials': 'authErrors.invalidCredentials',
  'User already registered': 'authErrors.alreadyRegistered',
  'Email not confirmed': 'authErrors.emailNotConfirmed',
  'Token has expired or is invalid': 'authErrors.tokenInvalid',
  'Email rate limit exceeded': 'authErrors.rateLimit',
  'email rate limit exceeded': 'authErrors.rateLimit',
  'Unable to validate email address: invalid format': 'authErrors.invalidEmail',
  'Password should be at least 6 characters': 'authErrors.passwordShort',
  'Phone not confirmed': 'authErrors.phoneNotConfirmed',
  'Unsupported phone provider': 'authErrors.phoneProvider',
  'Signups not allowed for this instance': 'authErrors.signupsDisabled',
  'New password should be different from the old password.': 'authErrors.samePassword',
  'For security purposes, you can only request this once every 60 seconds': 'authErrors.rateLimit',
};

function translateAuthError(message: string): string {
  const key = AUTH_ERROR_KEYS[message];
  return key ? i18n.t(key) : message;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>.');
  return ctx;
}
