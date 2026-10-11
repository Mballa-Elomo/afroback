'use server';

import { requireAdmin } from './auth';
import { getSupabaseAdmin } from './supabase/server';
import { tousLesComptes } from './utilisateurs';

/**
 * Recherche globale de la palette de commandes (Ctrl+K) : comptes, héros,
 * mythes, lieux Découverte. Réservée aux administrateurs, 6 résultats max
 * par famille, rien d'autre que ce qu'il faut pour afficher et ouvrir.
 */
export interface ResultatRecherche {
  type: 'utilisateur' | 'heros' | 'mythe' | 'decouverte';
  titre: string;
  detail: string;
  href: string;
}

function normaliser(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export async function rechercheGlobale(saisie: string): Promise<ResultatRecherche[]> {
  const admin = await requireAdmin();
  if (!admin) return [];
  const q = normaliser(String(saisie ?? '').trim()).slice(0, 80);
  if (q.length < 2) return [];
  const chiffres = q.replace(/\D/g, '');
  const motif = `%${String(saisie).trim().slice(0, 80).replace(/[%_,()]/g, '')}%`;
  const supabase = getSupabaseAdmin();

  const [comptes, heros, mythes, lieux] = await Promise.all([
    tousLesComptes().catch(() => []),
    supabase.from('heros').select('slug, nom_affiche').ilike('nom_affiche', motif).limit(6),
    supabase.from('mythes').select('slug, titre').ilike('titre', motif).limit(6),
    supabase.from('decouverte_items').select('slug, titre').ilike('titre', motif).limit(6),
  ]);

  const utilisateurs = comptes
    .filter((u) => {
      const prenom = typeof u.user_metadata?.prenom === 'string' ? u.user_metadata.prenom : '';
      if (chiffres.length >= 4 && (u.phone ?? '').includes(chiffres)) return true;
      return normaliser(`${u.email ?? ''} ${prenom}`).includes(q);
    })
    .slice(0, 6)
    .map((u) => ({
      type: 'utilisateur' as const,
      titre: (typeof u.user_metadata?.prenom === 'string' && u.user_metadata.prenom) || u.email || 'Compte',
      detail: [u.email, u.phone ? `+${u.phone}` : ''].filter(Boolean).join(' · '),
      href: `/utilisateurs/${u.id}`,
    }));

  return [
    ...utilisateurs,
    ...(heros.data ?? []).map((h) => ({ type: 'heros' as const, titre: h.nom_affiche as string, detail: 'Héros', href: `/heros/${h.slug}` })),
    ...(mythes.data ?? []).map((m) => ({ type: 'mythe' as const, titre: m.titre as string, detail: 'Mythe', href: `/mythologie/${m.slug}` })),
    ...(lieux.data ?? []).map((d) => ({ type: 'decouverte' as const, titre: d.titre as string, detail: 'Découverte', href: `/decouverte/${d.slug}` })),
  ];
}
