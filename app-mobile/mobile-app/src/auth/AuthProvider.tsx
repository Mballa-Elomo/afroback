import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
 */

export interface OnboardingChoices {
  langueInterface: 'fr' | 'en';
  usages: string[];
  forfait: 'decouverte' | 'racines' | 'heritage';
  billing?: 'monthly' | 'yearly';
  /** 'simulated' tant qu'aucun agrégateur Mobile Money n'est branché (voir payment.tsx) — jamais confondu avec un vrai paiement. */
  paymentStatus?: 'none' | 'simulated';
}

interface AuthState {
  /** undefined tant que la session initiale n'a pas été lue depuis le stockage local. */
  session: Session | null | undefined;
  /** true une fois l'assistant post-inscription (langue/usage/forfait) terminé — voir completeOnboarding. */
  onboardingComplete: boolean;
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onboardingComplete = session?.user?.user_metadata?.onboarding_complete === true;

  const value = useMemo<AuthState>(
    () => ({
      session,
      onboardingComplete,
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
        const { error } = await supabase.auth.signInWithPassword({ phone, password });
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
        await supabase.auth.signOut();
      },
    }),
    [session, onboardingComplete]
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
