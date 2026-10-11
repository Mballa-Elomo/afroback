/** Libellés et formats du module Utilisateurs, utilisables côté client et serveur. */

export const FORFAITS = {
  decouverte: { label: 'Découverte', ton: 'gris' },
  racines: { label: 'Racines', ton: 'or' },
  heritage: { label: 'Héritage', ton: 'terra' },
} as const;

export const STATUTS = {
  actif: { label: 'Actif', ton: 'vert' },
  non_confirme: { label: 'Non confirmé', ton: 'orange' },
  suspendu: { label: 'Suspendu', ton: 'rouge' },
} as const;

export const EVENEMENTS: Record<string, string> = {
  login_failed: 'Mot de passe faux',
  login_lockout: 'Connexion bloquée (trop d’essais)',
  login_success: 'Connexion réussie',
  account_deleted: 'Compte supprimé',
};

export function dateCourte(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function dateHeure(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** « il y a 3 h », « il y a 2 j »… */
export function relatif(iso: string | null | undefined) {
  if (!iso) return 'jamais';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'à l’instant';
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 30) return `il y a ${Math.floor(s / 86400)} j`;
  if (s < 86400 * 365) return `il y a ${Math.floor(s / (86400 * 30))} mois`;
  return `il y a ${Math.floor(s / (86400 * 365))} an${s >= 86400 * 730 ? 's' : ''}`;
}

let noms: Intl.DisplayNames | null = null;
export function nomPays(code: string | null | undefined) {
  if (!code) return '—';
  try {
    noms ??= new Intl.DisplayNames(['fr'], { type: 'region' });
    return noms.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

export function drapeau(code: string | null | undefined) {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function initiale(prenom: string, email: string) {
  return (prenom || email || '?').trim().charAt(0).toUpperCase();
}

export function fcfa(n: number) {
  return `${n.toLocaleString('fr-FR')} FCFA`;
}
