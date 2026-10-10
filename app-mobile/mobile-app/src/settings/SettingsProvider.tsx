import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../data/supabaseClient';
import { setPricing } from '../onboarding/pricing';
import { IN_APP_DIGITAL_PAYMENTS } from '../payments/storePolicy';

/**
 * Paramètres globaux réglés depuis le back-office (onglet Paramètres,
 * backoffice/cdc-parametres-administration.md), lus via `parametres_publics()`
 * au démarrage et à chaque retour sur l'app. Tant qu'ils ne sont pas lus (ou
 * si le script SQL n'est pas encore exécuté), on garde les valeurs par
 * défaut, identiques au comportement d'avant : rien ne casse.
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

const Ctx = createContext<{ settings: Settings; refresh: () => Promise<void> }>({
  settings: DEFAULT_SETTINGS,
  refresh: async () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.rpc('parametres_publics');
    if (error || !data) return; // script absent ou réseau : on garde les réglages courants
    const next = merge(data);
    setPricing(next.paiements.prix_racines, next.paiements.prix_heritage, next.paiements.reduction_annuelle_pct);
    setSettings(next);
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const value = useMemo(() => ({ settings, refresh }), [settings, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  return useContext(Ctx);
}

/**
 * Ce que cette version de l'app peut vendre. La version Google Play
 * (storePolicy.ts) n'achète jamais d'abonnement ni de don, quoi qu'indiquent
 * les Paramètres ; ailleurs, l'administration décide.
 */
export function usePaymentPolicy() {
  const { paiements } = useSettings().settings;
  const on = IN_APP_DIGITAL_PAYMENTS && paiements.actifs;
  return {
    abonnements: on && paiements.abonnements_app,
    dons: on && paiements.dons,
    mtn: paiements.mtn,
    orange: paiements.orange,
  };
}

/** Modules activés depuis le back-office (Paramètres → Modules). */
export function useModules() {
  return useSettings().settings.modules;
}

/** Vérification en 2 étapes : proposée, disponible, obligatoire (Paramètres → Sécurité). */
export function useMfaPolicy() {
  const { securite } = useSettings().settings;
  return {
    disponible: securite.mfa_disponible || securite.mfa_obligatoire,
    proposee: (securite.mfa_disponible && securite.proposer_2fa) || securite.mfa_obligatoire,
    obligatoire: securite.mfa_obligatoire,
  };
}

