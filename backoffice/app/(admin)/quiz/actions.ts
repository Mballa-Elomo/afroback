'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import type { Famille } from '@/lib/quiz';

/**
 * Module Quiz (cdc-module-quiz.md, § 2.3 et § 3). Chaque question est
 * revalidée ici, quoi qu'ait envoyé le navigateur, puis écrite dans la
 * table de sa famille.
 */

export type Resultat = { ok: boolean; message: string; id?: string };

export interface Saisie {
  question_fr: string;
  question_en: string;
  choix_fr: string[];
  choix_en: string[];
  bonne: number;
  explication_fr: string;
  explication_en: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TABLE: Record<Famille, string> = { contenu: 'quiz_questions', lecon: 'ecole_quiz_questions', niveau: 'ecole_quiz_niveau' };
const MAX_CONTENU = 10;

function nettoyer(s: Saisie, famille: Famille): { valeurs: Record<string, unknown> } | { erreur: string } {
  const t = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const qfr = t(s.question_fr, 500);
  const qen = t(s.question_en, 500);
  const cfr = (Array.isArray(s.choix_fr) ? s.choix_fr : []).map((c) => t(c, 200));
  const cen = (Array.isArray(s.choix_en) ? s.choix_en : []).map((c) => t(c, 200));
  const efr = t(s.explication_fr, 1000);
  const een = t(s.explication_en, 1000);
  const bonne = Math.floor(Number(s.bonne));

  if (!qfr) return { erreur: 'La question en français est obligatoire.' };
  if (cfr.length < 2 || cfr.length > 5) return { erreur: 'Il faut entre 2 et 5 choix.' };
  if (cfr.some((c) => !c)) return { erreur: 'Un choix en français est vide.' };
  if (!Number.isInteger(bonne) || bonne < 0 || bonne >= cfr.length) return { erreur: 'Désignez la bonne réponse.' };
  const avecEn = cen.some((c) => c);
  if (avecEn && (cen.length !== cfr.length || cen.some((c) => !c))) return { erreur: 'En anglais, il faut autant de choix qu’en français (ou aucun).' };
  if (famille === 'contenu' && !efr) return { erreur: 'L’explication en français est obligatoire pour ce quiz.' };

  if (famille === 'contenu') {
    return {
      valeurs: {
        question_fr: qfr,
        question_en: qen || null,
        choix_fr: cfr,
        choix_en: avecEn ? cen : null,
        bonne_reponse: bonne,
        explication_fr: efr,
        explication_en: een || null,
        updated_at: new Date().toISOString(),
      },
    };
  }
  return {
    valeurs: {
      question: qfr,
      question_en: qen || null,
      choix: cfr,
      choix_en: avecEn ? cen : null,
      reponse_correcte_index: bonne,
      explication: efr || null,
      explication_en: een || null,
    },
  };
}

/** Colonnes qui rattachent une nouvelle question à son contenu, sa leçon ou son niveau. */
function rattachement(famille: Famille, groupe: string): Record<string, unknown> | null {
  if (famille === 'contenu') {
    const [type, slug] = groupe.split(':');
    return (type === 'heros' || type === 'mythe') && slug ? { type_contenu: type, slug } : null;
  }
  if (famille === 'lecon') return UUID.test(groupe) ? { lecon_id: groupe } : null;
  const n = Number(groupe);
  return Number.isInteger(n) && n >= 1 && n <= 4 ? { niveau: n } : null;
}

export async function enregistrerQuestion(famille: Famille, groupe: string, id: string | null, saisie: Saisie): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!(famille in TABLE)) return { ok: false, message: 'Type de quiz invalide.' };
  const n = nettoyer(saisie, famille);
  if ('erreur' in n) return { ok: false, message: n.erreur };
  const filtre = rattachement(famille, groupe);
  if (!filtre) return { ok: false, message: 'Quiz introuvable.' };
  const supabase = getSupabaseAdmin();

  if (id) {
    if (!UUID.test(id)) return { ok: false, message: 'Question invalide.' };
    const { error } = await supabase.from(TABLE[famille]).update(n.valeurs).eq('id', id);
    if (error) return { ok: false, message: `Échec : ${error.message}` };
    await logActivity(admin.email, `Quiz (${famille} ${groupe}) : question modifiée « ${String(saisie.question_fr).slice(0, 60)} »`);
    revalidatePath('/quiz');
    return { ok: true, message: 'Question enregistrée.', id };
  }

  // Nouvelle question : à la suite des autres.
  let q = supabase.from(TABLE[famille]).select('ordre');
  for (const [k, v] of Object.entries(filtre)) q = q.eq(k, v as string);
  const { data: existantes } = await q;
  const ordres = ((existantes ?? []) as { ordre: number }[]).map((r) => Number(r.ordre));
  if (famille === 'contenu' && ordres.length >= MAX_CONTENU) return { ok: false, message: `${MAX_CONTENU} questions maximum par contenu.` };
  const ordre = famille === 'contenu' ? [...Array(MAX_CONTENU)].map((_, i) => i + 1).find((o) => !ordres.includes(o))! : (ordres.length ? Math.max(...ordres) : 0) + 1;

  const { data, error } = await supabase.from(TABLE[famille]).insert({ ...filtre, ...n.valeurs, ordre }).select('id').single();
  if (error) return { ok: false, message: `Échec : ${error.message}` };
  await logActivity(admin.email, `Quiz (${famille} ${groupe}) : question ajoutée « ${String(saisie.question_fr).slice(0, 60)} »`);
  revalidatePath('/quiz');
  return { ok: true, message: 'Question ajoutée.', id: String(data.id) };
}

export async function supprimerQuestion(famille: Famille, id: string): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!(famille in TABLE) || !UUID.test(id)) return { ok: false, message: 'Question invalide.' };
  const supabase = getSupabaseAdmin();
  const col = famille === 'contenu' ? 'question_fr' : 'question';
  const { data } = await supabase.from(TABLE[famille]).select(col).eq('id', id).maybeSingle();
  const { error } = await supabase.from(TABLE[famille]).delete().eq('id', id);
  if (error) return { ok: false, message: `Échec : ${error.message}` };
  await logActivity(admin.email, `Quiz (${famille}) : question supprimée « ${String((data as Record<string, unknown> | null)?.[col] ?? '').slice(0, 60)} »`);
  revalidatePath('/quiz');
  return { ok: true, message: 'Question supprimée.' };
}

/** Échange la place de deux questions du même quiz. */
export async function echangerOrdre(famille: Famille, idA: string, idB: string): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!(famille in TABLE) || !UUID.test(idA) || !UUID.test(idB)) return { ok: false, message: 'Question invalide.' };
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from(TABLE[famille]).select('*').in('id', [idA, idB]);
  const rows = (data ?? []) as Record<string, unknown>[];
  const a = rows.find((r) => r.id === idA);
  const b = rows.find((r) => r.id === idB);
  if (!a || !b) return { ok: false, message: 'Question introuvable.' };
  const oa = Number(a.ordre);
  const ob = Number(b.ordre);

  if (famille === 'contenu') {
    // Ordre unique par contenu (1 à 10) : passage par une place libre.
    const { data: autres } = await supabase.from('quiz_questions').select('ordre').eq('type_contenu', String(a.type_contenu)).eq('slug', String(a.slug));
    const pris = ((autres ?? []) as { ordre: number }[]).map((r) => Number(r.ordre));
    const libre = [...Array(MAX_CONTENU)].map((_, i) => i + 1).find((o) => !pris.includes(o));
    if (!libre) return { ok: false, message: '10 questions : supprimez-en une pour pouvoir réordonner.' };
    const e1 = await supabase.from('quiz_questions').update({ ordre: libre }).eq('id', idA);
    const e2 = await supabase.from('quiz_questions').update({ ordre: oa }).eq('id', idB);
    const e3 = await supabase.from('quiz_questions').update({ ordre: ob }).eq('id', idA);
    const err = e1.error ?? e2.error ?? e3.error;
    if (err) return { ok: false, message: `Échec : ${err.message}` };
  } else {
    // Ordres identiques possibles dans l'École : on les rend distincts.
    const na = oa === ob ? ob + 1 : ob;
    const e1 = await supabase.from(TABLE[famille]).update({ ordre: na }).eq('id', idA);
    const e2 = await supabase.from(TABLE[famille]).update({ ordre: oa }).eq('id', idB);
    const err = e1.error ?? e2.error;
    if (err) return { ok: false, message: `Échec : ${err.message}` };
  }
  revalidatePath('/quiz');
  return { ok: true, message: 'Ordre modifié.' };
}
