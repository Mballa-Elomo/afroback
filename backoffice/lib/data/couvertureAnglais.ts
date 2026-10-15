import { getSupabaseAdmin } from '../supabase/server';

/**
 * Couverture de l'anglais dans les contenus (finitions du 2026-10-15) : pour
 * chaque héros, mythe, lieu Découverte et leçon de l'École, on compare chaque
 * champ français rempli à sa version anglaise (colonne `<champ>_en`). Aucune
 * liste de champs codée en dur : toute nouvelle colonne `_en` est prise en
 * compte automatiquement.
 */

export interface ElementCouverture {
  type: 'Héros' | 'Mythe' | 'Découverte' | 'École';
  titre: string;
  lien: string | null;
  requis: number;
  traduits: number;
  manquants: string[];
}

const LIBELLES: Record<string, string> = {
  nom_affiche: 'nom',
  titre: 'titre',
  sous_titre: 'sous-titre',
  resume_catalogue: 'résumé',
  recit_chapitres: 'récit',
  recit_fr: 'récit',
  texte_adapte: 'texte de la leçon',
  epoque: 'époque',
  region: 'région',
  avertissement_lecture: 'avertissement',
};

function rempli(v: unknown) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v as object).length > 0;
  return true;
}

function analyser(ligne: Record<string, unknown>) {
  const manquants: string[] = [];
  let requis = 0;
  for (const cle of Object.keys(ligne)) {
    if (!cle.endsWith('_en')) continue;
    const base = cle.slice(0, -3);
    const fr = base in ligne ? ligne[base] : ligne[`${base}_fr`];
    if (!rempli(fr)) continue;
    requis++;
    if (!rempli(ligne[cle])) manquants.push(LIBELLES[base] ?? base.replace(/_/g, ' '));
  }
  return { requis, traduits: requis - manquants.length, manquants };
}

export async function couvertureAnglais(): Promise<ElementCouverture[]> {
  const supabase = getSupabaseAdmin();
  const [he, my, de, ec] = await Promise.all([
    supabase.from('heros').select('*').order('ordre_affichage'),
    supabase.from('mythes').select('*').order('ordre_affichage'),
    supabase.from('decouverte_items').select('*').order('ordre_affichage'),
    supabase.from('ecole_lecons').select('*, heros:heros_id(nom_affiche)'),
  ]);
  const liste: ElementCouverture[] = [];
  for (const h of (he.data ?? []) as Record<string, unknown>[]) liste.push({ type: 'Héros', titre: String(h.nom_affiche), lien: `/heros/${h.slug}`, ...analyser(h) });
  for (const m of (my.data ?? []) as Record<string, unknown>[]) liste.push({ type: 'Mythe', titre: String(m.titre), lien: `/mythologie/${m.slug}`, ...analyser(m) });
  for (const d of (de.data ?? []) as Record<string, unknown>[]) liste.push({ type: 'Découverte', titre: String(d.titre), lien: `/decouverte/${d.slug}`, ...analyser(d) });
  for (const l of (ec.data ?? []) as Record<string, unknown>[]) {
    const nom = (l.heros as { nom_affiche?: string } | null)?.nom_affiche ?? 'Leçon';
    const { heros: _h, ...reste } = l;
    void _h;
    liste.push({ type: 'École', titre: `${nom} · niveau ${l.niveau}`, lien: '/ecole-heros', ...analyser(reste) });
  }
  return liste;
}
