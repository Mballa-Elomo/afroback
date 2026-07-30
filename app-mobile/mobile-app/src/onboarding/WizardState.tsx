import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * État volatile de l'assistant post-inscription (langue/usage/forfait/
 * facturation), partagé entre les écrans `app/onboarding/language.tsx`,
 * `usage.tsx`, `plan.tsx` et `payment.tsx`. Rien n'est persisté ici : la
 * persistance réelle (Supabase, via `completeOnboarding`) n'a lieu qu'à la
 * toute fin, sur l'écran Bienvenue, une fois le forfait (et le paiement
 * simulé pour Racines/Héritage) confirmés.
 */
interface WizardStateValue {
  langueInterface: 'fr' | 'en';
  setLangueInterface: (v: 'fr' | 'en') => void;
  usages: string[];
  toggleUsage: (id: string) => void;
  forfait: 'decouverte' | 'racines' | 'heritage';
  setForfait: (v: 'decouverte' | 'racines' | 'heritage') => void;
  billing: 'monthly' | 'yearly';
  setBilling: (v: 'monthly' | 'yearly') => void;
}

const WizardContext = createContext<WizardStateValue | null>(null);

export function WizardStateProvider({ children }: { children: ReactNode }) {
  const [langueInterface, setLangueInterface] = useState<'fr' | 'en'>('fr');
  const [usages, setUsages] = useState<string[]>(['decouverte']);
  const [forfait, setForfait] = useState<'decouverte' | 'racines' | 'heritage'>('decouverte');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const toggleUsage = (id: string) => {
    setUsages((prev) => (prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]));
  };

  return (
    <WizardContext.Provider
      value={{
        langueInterface,
        setLangueInterface,
        usages,
        toggleUsage,
        forfait,
        setForfait,
        billing,
        setBilling,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizardState(): WizardStateValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizardState doit être utilisé à l’intérieur de <WizardStateProvider>.');
  return ctx;
}
