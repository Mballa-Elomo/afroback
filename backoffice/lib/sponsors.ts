import { getSupabaseAdmin } from './supabase/server';

/** Module Sponsors (cdc-module-sponsors.md) : lecture côté serveur (clé service_role). */

import type { CibleContenu, DonneesSponsors, Emplacement, Stat } from './sponsorsCommun';

export * from './sponsorsCommun';

export async function chargerSponsors(): Promise<DonneesSponsors> {
  const supabase = getSupabaseAdmin();
  const depuis = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
  const [s, e, st, he, my, de] = await Promise.all([
    supabase.from('sponsors').select('*').order('created_at', { ascending: false }),
    supabase.from('sponsor_emplacements').select('*').order('created_at'),
    supabase.from('sponsor_stats').select('*').gte('jour', depuis),
    supabase.from('heros').select('slug, nom_affiche').order('ordre_affichage'),
    supabase.from('mythes').select('slug, titre').order('ordre_affichage'),
    supabase.from('decouverte_items').select('slug, titre').order('ordre_affichage'),
  ]);
  if (s.error) return { sponsors: [], emplacements: [], stats: [], cibles: [], installe: false };
  return {
    sponsors: ((s.data ?? []) as Record<string, unknown>[]).map((x) => ({
      id: String(x.id),
      nom: String(x.nom),
      logo_url: (x.logo_url as string) ?? null,
      site_url: (x.site_url as string) ?? null,
      description_fr: (x.description_fr as string) ?? null,
      description_en: (x.description_en as string) ?? null,
      contact_nom: (x.contact_nom as string) ?? null,
      contact_email: (x.contact_email as string) ?? null,
      contact_telephone: (x.contact_telephone as string) ?? null,
      montant_fcfa: x.montant_fcfa === null || x.montant_fcfa === undefined ? null : Number(x.montant_fcfa),
      date_debut: (x.date_debut as string) ?? null,
      date_fin: (x.date_fin as string) ?? null,
      actif: !!x.actif,
      notes: (x.notes as string) ?? null,
      cree_le: String(x.created_at),
    })),
    emplacements: (e.data ?? []) as Emplacement[],
    stats: ((st.data ?? []) as Record<string, unknown>[]).map((x) => ({
      emplacement_id: String(x.emplacement_id),
      jour: String(x.jour),
      affichages: Number(x.affichages ?? 0),
      clics: Number(x.clics ?? 0),
    })),
    cibles: [
      ...((he.data ?? []) as { slug: string; nom_affiche: string }[]).map((h) => ({ type: 'heros' as const, slug: h.slug, titre: h.nom_affiche })),
      ...((my.data ?? []) as { slug: string; titre: string }[]).map((m) => ({ type: 'mythe' as const, slug: m.slug, titre: m.titre })),
      ...((de.data ?? []) as { slug: string; titre: string }[]).map((d) => ({ type: 'decouverte' as const, slug: d.slug, titre: d.titre })),
    ],
    installe: true,
  };
}
