import i18n, { currentLanguage } from '../i18n';

/** Source unique des tarifs des forfaits — évite que plan.tsx et payment.tsx divergent sur un montant. */
export const PLAN_PRICES_FCFA_MONTHLY = {
  racines: 1500,
  heritage: 3000,
} as const;

export const PLAN_NAMES = {
  decouverte: 'Découverte',
  racines: 'Racines',
  heritage: 'Héritage',
} as const;

export type PaidPlan = keyof typeof PLAN_PRICES_FCFA_MONTHLY;
export type Billing = 'monthly' | 'yearly';

/** Réduction annuelle de la maquette ("Annuel · −17%"). */
const YEARLY_DISCOUNT = 0.83;

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
