import i18n, { currentLanguage } from '../i18n';

/** Source unique des tarifs des forfaits — évite que plan.tsx et payment.tsx divergent sur un montant. */
export const PLAN_PRICES_FCFA_MONTHLY: Record<'racines' | 'heritage', number> = {
  racines: 1500,
  heritage: 3000,
};

export const PLAN_NAMES = {
  decouverte: 'Découverte',
  racines: 'Racines',
  heritage: 'Héritage',
} as const;

export type PaidPlan = keyof typeof PLAN_PRICES_FCFA_MONTHLY;
export type Billing = 'monthly' | 'yearly';

/** Réduction annuelle (maquette : "Annuel · −17%"), réglable depuis le back-office. */
let YEARLY_DISCOUNT = 0.83;

/**
 * Prix réglés dans le back-office (onglet Paramètres), appliqués par
 * SettingsProvider dès leur lecture. Le serveur de paiement calcule le même
 * montant à partir des mêmes réglages : l'affichage ne décide jamais du prix.
 */
export function setPricing(racines: number, heritage: number, reductionPct: number) {
  if (racines > 0) PLAN_PRICES_FCFA_MONTHLY.racines = racines;
  if (heritage > 0) PLAN_PRICES_FCFA_MONTHLY.heritage = heritage;
  if (reductionPct >= 0 && reductionPct <= 90) YEARLY_DISCOUNT = 1 - reductionPct / 100;
}

export function planPriceFcfa(plan: PaidPlan, billing: Billing): number {
  const monthly = PLAN_PRICES_FCFA_MONTHLY[plan];
  return billing === 'monthly' ? monthly : Math.round(monthly * 12 * YEARLY_DISCOUNT);
}

/** Prix affiché dans la langue courante de l'app (ex. "1 500 FCFA/mois" / "1,500 FCFA/month"). */
export function formatPlanPrice(plan: PaidPlan, billing: Billing): string {
  const lang = currentLanguage();
  const amount = planPriceFcfa(plan, billing).toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
  return i18n.t(billing === 'monthly' ? 'pricing.perMonth' : 'pricing.perYear', { amount });
}
