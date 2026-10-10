'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';
import { setPricing } from './payment';
import { useLang } from './lang-client';
import Link from 'next/link';

/**
 * Paramètres globaux réglés depuis le back-office (onglet Paramètres,
 * backoffice/cdc-parametres-administration.md), lus via `parametres_publics()`
 * au chargement et quand on revient sur l'onglet. Valeurs par défaut =
 * comportement d'avant : si la lecture échoue, rien ne change.
 */

export interface Settings {
  paiements: {
    actifs: boolean;
    mtn: boolean;
    orange: boolean;
    abonnements_site: boolean;
    abonnements_app: boolean;
    dons: boolean;
    prix_racines: number;
    prix_heritage: number;
    reduction_annuelle_pct: number;
  };
  securite: {
    anti_capture_app: boolean;
    protection_web: boolean;
    voile_web: boolean;
    proposer_2fa: boolean;
    mfa_disponible: boolean;
    mfa_obligatoire: boolean;
  };
  general: { inscriptions_ouvertes: boolean; maintenance: boolean; message_maintenance: string; mode_invite: boolean };
  modules: { communaute: boolean; marche: boolean; espace_enfant: boolean; quiz: boolean; commentaires: boolean };
}

export const DEFAULT_SETTINGS: Settings = {
  paiements: {
    actifs: true,
    mtn: true,
    orange: true,
    abonnements_site: true,
    abonnements_app: true,
    dons: true,
    prix_racines: 1500,
    prix_heritage: 3000,
    reduction_annuelle_pct: 17,
  },
  securite: { anti_capture_app: true, protection_web: true, voile_web: true, proposer_2fa: true, mfa_disponible: true, mfa_obligatoire: false },
  general: { inscriptions_ouvertes: true, maintenance: false, message_maintenance: '', mode_invite: true },
  modules: { communaute: true, marche: true, espace_enfant: true, quiz: true, commentaires: true },
};

function merge(raw: unknown): Settings {
  const r = (raw ?? {}) as Partial<Record<keyof Settings, Record<string, unknown>>>;
  return {
    paiements: { ...DEFAULT_SETTINGS.paiements, ...(r.paiements ?? {}) } as Settings['paiements'],
    securite: { ...DEFAULT_SETTINGS.securite, ...(r.securite ?? {}) } as Settings['securite'],
    general: { ...DEFAULT_SETTINGS.general, ...(r.general ?? {}) } as Settings['general'],
    modules: { ...DEFAULT_SETTINGS.modules, ...(r.modules ?? {}) } as Settings['modules'],
  };
}

const Ctx = createContext<{ settings: Settings; loaded: boolean }>({ settings: DEFAULT_SETTINGS, loaded: false });

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.rpc('parametres_publics');
    setLoaded(true);
    if (error || !data) return;
    const next = merge(data);
    setPricing(next.paiements.prix_racines, next.paiements.prix_heritage, next.paiements.reduction_annuelle_pct);
    setSettings(next);
  }, []);

  useEffect(() => {
    refresh();
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  const value = useMemo(() => ({ settings, loaded }), [settings, loaded]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  return useContext(Ctx).settings;
}

/** Ce que le site peut vendre, selon le back-office. */
export function usePaymentPolicy() {
  const { paiements } = useSettings();
  return {
    abonnements: paiements.actifs && paiements.abonnements_site,
    dons: paiements.actifs && paiements.dons,
    mtn: paiements.mtn,
    orange: paiements.orange,
  };
}

/** Mode maintenance : message à la place du site (le back-office reste accessible). */
export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { general } = useSettings();
  const { tr } = useLang();
  if (!general.maintenance) return <>{children}</>;
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-lg">
        <p className="text-gold-gradient font-display text-4xl font-black tracking-[0.2em]">AFROBACK</p>
        <h1 className="mt-6 text-xl font-bold text-heading">{tr('AFROBACK est en maintenance', 'AFROBACK is under maintenance')}</h1>
        <p className="mt-3 text-body">
          {general.message_maintenance || tr('Nous revenons très vite. Merci de ta patience.', 'We will be back very soon. Thank you for your patience.')}
        </p>
      </div>
    </div>
  );
}

/** Modules activés depuis le back-office (Paramètres → Modules). */
export function useModules() {
  return useSettings().modules;
}

/** Vérification en 2 étapes : disponible, obligatoire (Paramètres → Sécurité). */
export function useMfaPolicy() {
  const { securite } = useSettings();
  return { disponible: securite.mfa_disponible || securite.mfa_obligatoire, obligatoire: securite.mfa_obligatoire };
}

/** Affiche la page si le module est actif, sinon « momentanément indisponible ». */
export function ModuleGate({ module, children }: { module: keyof Settings['modules']; children: React.ReactNode }) {
  const modules = useModules();
  const { tr } = useLang();
  if (modules[module]) return <>{children}</>;
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 pt-24 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-3xl font-bold text-heading">{tr('Momentanément indisponible', 'Temporarily unavailable')}</h1>
        <p className="mt-3 text-body">{tr('Cette partie d’AFROBACK revient très bientôt.', 'This part of AFROBACK will be back very soon.')}</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-gold px-6 py-3 font-bold text-ink">
          {tr('Retour à l’accueil', 'Back to home')}
        </Link>
      </div>
    </div>
  );
}

