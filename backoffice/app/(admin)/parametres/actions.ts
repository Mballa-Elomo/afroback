'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { DEFAUTS, SECTIONS, affiche, champsDe, fusionner, valider, type Section, type Valeurs } from '@/lib/parametres';

/**
 * Module Paramètres (cdc-module-parametres.md). Seul ce serveur écrit la table
 * `app_settings` (clé service_role) ; chaque section est revalidée ici (bornes,
 * cohérence) quoi qu'ait envoyé le navigateur, et chaque changement réel est
 * inscrit au journal d'activité (avant → après).
 */

export type Resultat = { ok: true; message: string; valeurs: Valeurs; maj: string } | { ok: false; message: string };

const SECTIONS_VALIDES = new Set<Section>(SECTIONS.map((s) => s.id));

async function ecrire(section: Section, saisie: Record<string, unknown>, libelleAction: string): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!SECTIONS_VALIDES.has(section)) return { ok: false, message: 'Section inconnue.' };

  const res = valider(section, saisie);
  if ('erreur' in res) return { ok: false, message: res.erreur };

  const supabase = getSupabaseAdmin();
  const { data: ligne, error: lectureErreur } = await supabase.from('app_settings').select('data').eq('id', 1).maybeSingle();
  if (lectureErreur) return { ok: false, message: `Lecture impossible : ${lectureErreur.message}` };

  const avant = fusionner(ligne?.data)[section];
  const data = { ...((ligne?.data as Record<string, unknown>) ?? {}), [section]: res.valeurs };
  const maj = new Date().toISOString();
  const { error } = await supabase.from('app_settings').upsert({ id: 1, data, updated_at: maj, updated_by: admin.email });
  if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };

  const titre = SECTIONS.find((s) => s.id === section)?.titre ?? section;
  const changements = champsDe(section)
    .filter((c) => avant[c.cle] !== res.valeurs[c.cle])
    .map((c) => `${c.label} : ${affiche(avant[c.cle])} → ${affiche(res.valeurs[c.cle])}`);
  if (changements.length) await logActivity(admin.email, `Paramètres · ${titre}${libelleAction} : ${changements.join(' ; ')}`);

  revalidatePath('/parametres');
  return {
    ok: true,
    message: changements.length ? `${titre} : ${changements.length} réglage${changements.length > 1 ? 's' : ''} enregistré${changements.length > 1 ? 's' : ''}.` : 'Aucun changement.',
    valeurs: res.valeurs,
    maj,
  };
}

export async function enregistrerSection(section: Section, saisie: Record<string, unknown>): Promise<Resultat> {
  return ecrire(section, saisie, '');
}

export async function reinitialiserSection(section: Section): Promise<Resultat> {
  return ecrire(section, DEFAUTS[section], ' (réinitialisation)');
}
