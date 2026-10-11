'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase';
import { createClient } from '@supabase/supabase-js';
import { clientLang, localeOf, tc } from './lang';

/**
 * Compte AFROBACK sur le site (lot 3, cdc-site-web-afroback.md). Même compte
 * et mêmes protections que l'application :
 * - connexion par email ou téléphone, blocage après tentatives répétées
 *   (check_login_lockout / record_login_attempt) ;
 * - navigateur inconnu à vérifier (code email ou code de vérification en
 *   2 étapes) ; un seul navigateur actif à la fois, à côté du téléphone
 *   (fonctions *_web de site-web/supabase/appareil-web.sql) ;
 * - vérification en 2 étapes (TOTP maison de l'app) si elle est activée ;
 * - forfait lu côté serveur (mon_abonnement), jamais dans le compte.
 * Tant que appareil-web.sql n'est pas installé, la connexion reste bloquée
 * (jamais de contournement de la vérification d'appareil).
 */

export type DeviceStatus = 'unknown' | 'ok' | 'a_verifier' | 'remplace' | 'indisponible';
export type MfaStatus = 'unknown' | 'none' | 'required' | 'ok';
/**
 * `resilie_le` et `resiliable` n'existent qu'une fois schema-paiement-sans-sortie.sql
 * exécuté : absents, le site garde le comportement d'avant (pas de bouton Résilier).
 */
export type Subscription = { plan: 'racines' | 'heritage'; ends_at: string | null; source: string; resilie_le?: string | null; resiliable?: boolean } | null;
export type OwnProfile = { id: string; pseudo: string; avatar_url: string | null } | null;

const DEVICE_KEY = 'afroback-web:device-id';

export function getDeviceId(): string {
  try {
    const stored = localStorage.getItem(DEVICE_KEY);
    if (stored && stored.startsWith('web') && stored.length >= 32) return stored;
  } catch {
    /* stockage indisponible */
  }
  const id = `web${crypto.randomUUID().replace(/-/g, '')}`;
  try {
    localStorage.setItem(DEVICE_KEY, id);
  } catch {
    /* best-effort */
  }
  return id;
}

export function getDeviceName(): string {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : tc('Navigateur', 'Browser');
  const os = /Windows/.test(ua) ? 'Windows' : /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'web';
  return tc(`Site web · ${browser} · ${os}`, `Website · ${browser} · ${os}`);
}

export function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain || local.length < 2) return email;
  return `${local[0]}${'•'.repeat(Math.max(3, local.length - 2))}${local[local.length - 1]}@${domain}`;
}

const ERRORS: [RegExp, () => string][] = [
  [/user is banned|banned/i, () => tc('Ce compte est suspendu. Contacte le support AFROBACK.', 'This account is suspended. Contact AFROBACK support.')],
  [/invalid login credentials/i, () => tc('Identifiant ou mot de passe incorrect.', 'Incorrect username or password.')],
  [/email not confirmed/i, () => tc("Ton email n'est pas encore confirmé.", 'Your email is not confirmed yet.')],
  [/token has expired|invalid.*token|otp.*(expired|invalid)/i, () => tc('Code incorrect ou expiré. Demande un nouveau code.', 'Incorrect or expired code. Request a new code.')],
  [/user already registered/i, () => tc('Un compte existe déjà avec cet email.', 'An account already exists with this email.')],
  [/password should be at least|weak password/i, () => tc('Mot de passe trop faible : au moins 8 caractères, avec lettres et chiffres.', 'Password too weak: at least 8 characters, with letters and numbers.')],
  [/rate limit|too many/i, () => tc('Trop de tentatives. Patiente quelques minutes.', 'Too many attempts. Wait a few minutes.')],
  [/same.*password|different from the old/i, () => tc("Le nouveau mot de passe doit être différent de l'ancien.", 'The new password must be different from the old one.')],
  [/network|fetch/i, () => tc('Connexion internet indisponible. Réessaie.', 'No internet connection. Try again.')],
];
export function translateError(message?: string | null): string {
  if (!message) return tc('Une erreur est survenue. Réessaie.', 'Something went wrong. Try again.');
  return ERRORS.find(([re]) => re.test(message))?.[1]() ?? tc('Une erreur est survenue. Réessaie.', 'Something went wrong. Try again.');
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isE164 = (v: string) => /^\+[1-9]\d{7,14}$/.test(v);

type Result = { error: string | null };

interface AuthValue {
  ready: boolean;
  session: Session | null;
  device: DeviceStatus;
  mfa: MfaStatus;
  profile: OwnProfile;
  subscription: Subscription;
  onboardingComplete: boolean;
  refresh: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<Result & { unconfirmed?: boolean; email?: string }>;
  signUp: (p: { email: string; password: string; prenom: string; telephone: string }) => Promise<Result>;
  verifySignupCode: (email: string, code: string) => Promise<Result>;
  resendSignupCode: (email: string) => Promise<Result>;
  requestPasswordReset: (email: string) => Promise<Result>;
  resetPasswordWithCode: (email: string, code: string, password: string) => Promise<Result>;
  requestDeviceCode: () => Promise<Result>;
  verifyDeviceWithEmailCode: (code: string) => Promise<Result>;
  verifyDeviceWithTotp: (code: string) => Promise<Result & { locked?: boolean }>;
  verifyMfa: (code: string) => Promise<Result & { locked?: boolean }>;
  completeOnboarding: (data: Record<string, unknown>) => Promise<Result>;
  changePassword: (current: string, next: string) => Promise<Result & { wrongCurrent?: boolean }>;
  /** Suppression définitive du compte (exigence Google Play, app-mobile/cdc-play-store.md). */
  deleteAccount: (password: string) => Promise<Result & { wrongPassword?: boolean }>;
  signOut: () => Promise<void>;
  /** Vérification en 2 étapes tout juste activée sur ce navigateur : le code vient d'être prouvé. */
  mfaEnrolled: () => void;
}

const Ctx = createContext<AuthValue | null>(null);
export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth hors de AuthProvider');
  return v;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [device, setDevice] = useState<DeviceStatus>('unknown');
  const [mfa, setMfa] = useState<MfaStatus>('unknown');
  const [profile, setProfile] = useState<OwnProfile>(null);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const fresh = useRef(false);
  const mfaPassed = useRef(false);
  const recovering = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (recovering.current) return;
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadAccount = useCallback(async () => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) {
      setProfile(null);
      setSubscription(null);
      return;
    }
    const [p, a] = await Promise.all([
      supabase.from('community_profiles').select('id,pseudo,avatar_url').eq('user_id', uid).maybeSingle(),
      supabase.rpc('mon_abonnement'),
    ]);
    setProfile((p.data as OwnProfile) ?? null);
    setSubscription(!a.error && a.data ? (a.data as Subscription) : null);
  }, []);

  const onActivated = useCallback(async (res: { alerte?: boolean }) => {
    setDevice('ok');
    if (res.alerte) supabase.functions.invoke('alerte-connexion', { body: { appareil: getDeviceName(), langue: clientLang() } }).catch(() => {});
  }, []);

  const checkDevice = useCallback(async () => {
    const isFresh = fresh.current;
    fresh.current = false;
    const id = getDeviceId();
    const { data, error } = isFresh
      ? await supabase.rpc('ouvrir_session_web', { p_device_id: id, p_nom: getDeviceName() })
      : await supabase.rpc('etat_appareil_web', { p_device_id: id });
    if (error) {
      // Script appareil-web.sql pas encore installé : on bloque plutôt que de contourner la vérification.
      setDevice('indisponible');
      return;
    }
    const etat = (data as { etat?: string })?.etat;
    if (etat === 'actif') return onActivated(data as { alerte?: boolean });
    if (etat === 'remplace') {
      setDevice('remplace');
      mfaPassed.current = false;
      await supabase.auth.signOut({ scope: 'local' });
      return;
    }
    setDevice('a_verifier');
  }, [onActivated]);

  const checkMfa = useCallback(async () => {
    const { data, error } = await supabase.rpc('mfa_totp_status');
    if (error || !(data as { enabled?: boolean })?.enabled) return setMfa('none');
    setMfa(mfaPassed.current ? 'ok' : 'required');
  }, []);

  useEffect(() => {
    if (!session) {
      setDevice((d) => (d === 'remplace' ? d : 'unknown'));
      setMfa('unknown');
      setProfile(null);
      setSubscription(null);
      return;
    }
    checkDevice();
    checkMfa();
    loadAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Un autre navigateur a pris la main ? Vérifié toutes les 60 s et au retour sur l'onglet.
  useEffect(() => {
    if (!session || device !== 'ok') return;
    const poll = async () => {
      const { data, error } = await supabase.rpc('etat_appareil_web', { p_device_id: getDeviceId() });
      if (!error && (data as { etat?: string })?.etat === 'remplace') {
        setDevice('remplace');
        await supabase.auth.signOut({ scope: 'local' });
      }
    };
    const t = setInterval(poll, 60_000);
    const onVis = () => !document.hidden && poll();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [session, device]);

  const signInWithPassword = useCallback(
    async (identifier: string, credentials: { email: string; password: string } | { phone: string; password: string }) => {
      const { data: lockout } = await supabase.rpc('check_login_lockout', { p_phone: identifier });
      if ((lockout as { locked?: boolean })?.locked) {
        const until = new Date((lockout as { locked_until: string }).locked_until);
        const at = until.toLocaleTimeString(localeOf(clientLang()), { hour: '2-digit', minute: '2-digit' });
        return { error: tc(`Trop de tentatives. Réessaie après ${at}.`, `Too many attempts. Try again after ${at}.`) };
      }
      fresh.current = true;
      const { error } = await supabase.auth.signInWithPassword(credentials);
      if (error) fresh.current = false;
      const unconfirmed = !!error && (error.code === 'email_not_confirmed' || /email not confirmed/i.test(error.message));
      await supabase.rpc('record_login_attempt', { p_phone: identifier, p_success: !error || unconfirmed });
      if (unconfirmed) return { error: null, unconfirmed: true };
      return { error: error ? translateError(error.message) : null };
    },
    []
  );

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      session,
      device,
      mfa,
      profile,
      subscription,
      onboardingComplete: session?.user?.user_metadata?.onboarding_complete === true,
      refresh: loadAccount,
      async signIn(identifier, password) {
        const id = identifier.trim();
        if (id.startsWith('+')) {
          const phone = id.replace(/\s/g, '');
          if (!isE164(phone)) return { error: tc('Numéro invalide : indique le format international, par exemple +237 6XX XX XX XX.', 'Invalid number: use the international format, for example +237 6XX XX XX XX.') };
          return signInWithPassword(phone, { phone, password });
        }
        const email = id.toLowerCase();
        if (!isEmail(email)) return { error: tc('Adresse email invalide.', 'Invalid email address.') };
        const res = await signInWithPassword(email, { email, password });
        if (res.unconfirmed) {
          await supabase.auth.resend({ type: 'signup', email });
          return { error: null, unconfirmed: true, email };
        }
        return res;
      },
      async signUp({ email, password, prenom, telephone }) {
        const normalized = email.trim().toLowerCase();
        if (!isEmail(normalized)) return { error: tc('Adresse email invalide.', 'Invalid email address.') };
        if (!isE164(telephone)) return { error: tc('Numéro de téléphone invalide.', 'Invalid phone number.') };
        const dispo = await supabase.rpc('telephone_disponible', { p_telephone: telephone });
        if (!dispo.error && dispo.data === false) return { error: tc('Ce numéro est déjà utilisé par un autre compte.', 'This number is already used by another account.') };
        const { data, error } = await supabase.auth.signUp({
          email: normalized,
          password,
          options: { data: { prenom: prenom.trim(), telephone, langue: 'fr', consent_at: new Date().toISOString(), consent_version: '2026-09-29', inscrit_depuis: 'site-web' } },
        });
        if (error) {
          if (/database error saving new user/i.test(error.message)) return { error: tc('Ce numéro est déjà utilisé par un autre compte.', 'This number is already used by another account.') };
          return { error: translateError(error.message) };
        }
        if (data.user?.identities && data.user.identities.length === 0) return { error: tc('Un compte existe déjà avec cet email. Connecte-toi.', 'An account already exists with this email. Sign in.') };
        return { error: null };
      },
      async verifySignupCode(email, code) {
        fresh.current = true;
        const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code, type: 'email' });
        if (error) fresh.current = false;
        return { error: error ? translateError(error.message) : null };
      },
      async resendSignupCode(email) {
        const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
        return { error: error ? translateError(error.message) : null };
      },
      async requestPasswordReset(email) {
        const normalized = email.trim().toLowerCase();
        if (!isEmail(normalized)) return { error: tc('Adresse email invalide.', 'Invalid email address.') };
        const { error } = await supabase.auth.resetPasswordForEmail(normalized);
        return { error: error ? translateError(error.message) : null };
      },
      async resetPasswordWithCode(email, code, password) {
        recovering.current = true;
        fresh.current = true;
        try {
          const { error: e1 } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code, type: 'recovery' });
          if (e1) {
            fresh.current = false;
            return { error: translateError(e1.message) };
          }
          const { error: e2 } = await supabase.auth.updateUser({ password });
          if (e2) {
            await supabase.auth.signOut({ scope: 'local' });
            return { error: translateError(e2.message) };
          }
          await supabase.rpc('revoquer_autres_appareils', { p_device_id: getDeviceId() });
          return { error: null };
        } finally {
          recovering.current = false;
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
        }
      },
      async requestDeviceCode() {
        const email = session?.user?.email;
        if (!email) return { error: tc("Aucun email n'est associé à ce compte.", 'No email is linked to this account.') };
        const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
        return { error: error ? translateError(error.message) : null };
      },
      async verifyDeviceWithEmailCode(code) {
        const email = session?.user?.email;
        if (!email) return { error: tc("Aucun email n'est associé à ce compte.", 'No email is linked to this account.') };
        const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
        if (error) return { error: translateError(error.message) };
        const { data, error: e2 } = await supabase.rpc('valider_appareil_web', { p_device_id: getDeviceId(), p_nom: getDeviceName() });
        if (e2 || (data as { etat?: string })?.etat !== 'actif') return { error: tc("La vérification n'a pas abouti. Réessaie.", 'Verification failed. Try again.') };
        await onActivated(data as { alerte?: boolean });
        return { error: null };
      },
      async verifyDeviceWithTotp(code) {
        const { data, error } = await supabase.rpc('valider_appareil_web', { p_device_id: getDeviceId(), p_nom: getDeviceName(), p_code_totp: code });
        const res = data as { etat?: string; erreur?: string } | null;
        if (error || res?.etat !== 'actif') {
          const locked = res?.erreur === 'verrouille';
          return { error: locked ? tc('Trop de codes erronés. Patiente quelques minutes.', 'Too many wrong codes. Wait a few minutes.') : tc('Code incorrect.', 'Incorrect code.'), locked };
        }
        mfaPassed.current = true;
        setMfa('ok');
        await onActivated(res as { alerte?: boolean });
        return { error: null };
      },
      async verifyMfa(code) {
        const { data, error } = await supabase.rpc('mfa_totp_verify_challenge', { p_code: code });
        const res = data as { ok?: boolean; error?: string } | null;
        if (error || !res?.ok) {
          const locked = res?.error === 'verrouille';
          return { error: locked ? tc('Trop de codes erronés. Patiente quelques minutes.', 'Too many wrong codes. Wait a few minutes.') : tc('Code incorrect.', 'Incorrect code.'), locked };
        }
        mfaPassed.current = true;
        setMfa('ok');
        return { error: null };
      },
      async completeOnboarding(data) {
        const { error } = await supabase.auth.updateUser({ data: { onboarding_complete: true, ...data } });
        if (!error) {
          const { data: s } = await supabase.auth.getSession();
          setSession(s.session);
        }
        return { error: error ? translateError(error.message) : null };
      },
      async changePassword(current, next) {
        const user = session?.user;
        const identifier = user?.email ?? (user?.phone ? `+${user.phone}` : null);
        if (!identifier) return { error: tc('Impossible de vérifier ton compte.', 'Unable to verify your account.') };
        const { data: lockout } = await supabase.rpc('check_login_lockout', { p_phone: identifier });
        if ((lockout as { locked?: boolean })?.locked) return { error: tc('Trop de tentatives. Patiente quelques minutes.', 'Too many attempts. Wait a few minutes.') };
        const verifier = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, storageKey: 'afroback-web-verif' } });
        const { error: checkError } = await verifier.auth.signInWithPassword(user?.email ? { email: user.email, password: current } : { phone: identifier, password: current });
        await supabase.rpc('record_login_attempt', { p_phone: identifier, p_success: !checkError });
        if (checkError) return { error: tc('Mot de passe actuel incorrect.', 'Current password is incorrect.'), wrongCurrent: true };
        await verifier.auth.signOut({ scope: 'local' }).catch(() => {});
        const { error } = await supabase.auth.updateUser({ password: next });
        if (error) return { error: translateError(error.message) };
        await supabase.auth.signOut({ scope: 'others' }).catch(() => {});
        await supabase.rpc('revoquer_autres_appareils', { p_device_id: getDeviceId() });
        return { error: null };
      },
      async deleteAccount(password) {
        const user = session?.user;
        const identifier = user?.email ?? (user?.phone ? `+${user.phone}` : null);
        if (!user || !identifier) return { error: tc('Impossible de vérifier ton compte.', 'Unable to verify your account.') };
        const { data: lockout } = await supabase.rpc('check_login_lockout', { p_phone: identifier });
        if ((lockout as { locked?: boolean })?.locked) return { error: tc('Trop de tentatives. Patiente quelques minutes.', 'Too many attempts. Wait a few minutes.') };
        // Mot de passe revérifié sur un client jetable : une session laissée ouverte ne suffit pas.
        const verifier = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, storageKey: 'afroback-web-verif' } });
        const { error: checkError } = await verifier.auth.signInWithPassword(user.email ? { email: user.email, password } : { phone: identifier, password });
        await supabase.rpc('record_login_attempt', { p_phone: identifier, p_success: !checkError });
        if (checkError) return { error: tc('Mot de passe incorrect.', 'Wrong password.'), wrongPassword: true };
        await verifier.auth.signOut({ scope: 'local' }).catch(() => {});
        // Photos envoyées : effacées avant le compte (le SQL ne peut pas toucher au stockage).
        await removeUserUploads(user.id).catch(() => {});
        const { error } = await supabase.rpc('delete_my_account');
        if (error) return { error: tc("Le compte n'a pas pu être supprimé. Réessaie dans un instant.", 'Your account could not be deleted. Please try again shortly.') };
        mfaPassed.current = false;
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        return { error: null };
      },
      mfaEnrolled() {
        mfaPassed.current = true;
        setMfa('ok');
      },
      async signOut() {
        mfaPassed.current = false;
        await supabase.auth.signOut({ scope: 'local' });
      },
    }),
    [ready, session, device, mfa, profile, subscription, loadAccount, signInWithPassword, onActivated]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Compte prêt à l'emploi : connecté, navigateur vérifié, 2 étapes passées. */
export function useMember() {
  const a = useAuth();
  const ok = !!a.session && a.device === 'ok' && (a.mfa === 'none' || a.mfa === 'ok');
  return { ...a, member: ok };
}

/** Efface tous les fichiers du compte dans `user-uploads/{uid}/` (sous-dossiers compris). */
async function removeUserUploads(uid: string) {
  const bucket = supabase.storage.from('user-uploads');
  const files: string[] = [];
  const walk = async (prefix: string, depth: number) => {
    const { data } = await bucket.list(prefix, { limit: 1000 });
    for (const entry of data ?? []) {
      const path = `${prefix}/${entry.name}`;
      // Les dossiers n'ont pas d'identifiant dans la liste du stockage Supabase.
      if (entry.id) files.push(path);
      else if (depth < 4) await walk(path, depth + 1);
    }
  };
  await walk(uid, 0);
  for (let i = 0; i < files.length; i += 100) await bucket.remove(files.slice(i, i + 100));
}
