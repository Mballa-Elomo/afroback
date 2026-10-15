'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { FORMATS, type Format } from '@/lib/sponsorsCommun';

/** Module Sponsors (cdc-module-sponsors.md, § 3 et § 6). Tout est revalidé ici et journalisé. */

export type Resultat = { ok: boolean; message: string; id?: string };

export interface SaisieSponsor {
  nom: string;
  site_url: string;
  description_fr: string;
  description_en: string;
  contact_nom: string;
  contact_email: string;
  contact_telephone: string;
  montant_fcfa: string;
  date_debut: string;
  date_fin: string;
  notes: string;
}

export interface SaisieEmplacement {
  format: Format;
  cible: string; // « heros:slug », « mythe:slug », « decouverte:slug » ou '' (tous)
  accroche_fr: string;
  accroche_en: string;
  /** « Présenté par » : '' = fiche, ou lecture / ecoute / video. */
  cible_format?: string;
  /** '' = tous les chapitres, sinon le numéro. */
  cible_chapitre?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const t = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

function nettoyerSponsor(s: SaisieSponsor): { valeurs: Record<string, unknown> } | { erreur: string } {
  const nom = t(s.nom, 80);
  if (nom.length < 2) return { erreur: 'Le nom du sponsor est obligatoire.' };
  const site = t(s.site_url, 300);
  if (site && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(site)) return { erreur: 'Site web : adresse complète, commençant par https://' };
  const email = t(s.contact_email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erreur: 'E-mail du contact invalide.' };
  const montantBrut = t(s.montant_fcfa, 12).replace(/\s/g, '');
  const montant = montantBrut ? Number(montantBrut) : null;
  if (montant !== null && (!Number.isInteger(montant) || montant < 0)) return { erreur: 'Montant : nombre entier de FCFA.' };
  const debut = t(s.date_debut, 10) || null;
  const fin = t(s.date_fin, 10) || null;
  if ((debut && !DATE.test(debut)) || (fin && !DATE.test(fin))) return { erreur: 'Dates invalides.' };
  if (debut && fin && fin < debut) return { erreur: 'La date de fin doit suivre la date de début.' };
  return {
    valeurs: {
      nom,
      site_url: site || null,
      description_fr: t(s.description_fr, 600) || null,
      description_en: t(s.description_en, 600) || null,
      contact_nom: t(s.contact_nom, 120) || null,
      contact_email: email || null,
      contact_telephone: t(s.contact_telephone, 40) || null,
      montant_fcfa: montant,
      date_debut: debut,
      date_fin: fin,
      notes: t(s.notes, 2000) || null,
      updated_at: new Date().toISOString(),
    },
  };
}

function fini(chemin: string | null): void {
  revalidatePath('/sponsors');
  if (chemin) revalidatePath(chemin);
}

export async function enregistrerSponsor(id: string | null, saisie: SaisieSponsor): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  const n = nettoyerSponsor(saisie);
  if ('erreur' in n) return { ok: false, message: n.erreur };
  const supabase = getSupabaseAdmin();
  if (id) {
    if (!UUID.test(id)) return { ok: false, message: 'Sponsor invalide.' };
    const { error } = await supabase.from('sponsors').update(n.valeurs).eq('id', id);
    if (error) return { ok: false, message: `Échec : ${error.message}` };
    await logActivity(admin.email, `Sponsors : « ${n.valeurs.nom} » modifié`);
    fini(`/sponsors/${id}`);
    return { ok: true, message: 'Sponsor enregistré.', id };
  }
  const { data, error } = await supabase.from('sponsors').insert(n.valeurs).select('id').single();
  if (error) return { ok: false, message: /sponsors/.test(error.message) && /exist/.test(error.message) ? 'Exécutez d’abord schema-sponsors.sql dans Supabase.' : `Échec : ${error.message}` };
  await logActivity(admin.email, `Sponsors : « ${n.valeurs.nom} » créé (brouillon)`);
  fini(null);
  return { ok: true, message: 'Sponsor créé (brouillon).', id: String(data.id) };
}

export async function basculerSponsor(id: string, actif: boolean): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id)) return { ok: false, message: 'Sponsor invalide.' };
  const supabase = getSupabaseAdmin();
  if (actif) {
    const { data: s } = await supabase.from('sponsors').select('date_debut, date_fin, logo_url').eq('id', id).maybeSingle();
    if (!s?.date_debut || !s?.date_fin) return { ok: false, message: 'Renseignez les dates de début et de fin du contrat avant d’activer.' };
    if (!s.logo_url) return { ok: false, message: 'Ajoutez le logo du sponsor avant d’activer.' };
    const { count } = await supabase.from('sponsor_emplacements').select('id', { count: 'exact', head: true }).eq('sponsor_id', id).eq('actif', true);
    if (!count) return { ok: false, message: 'Ajoutez au moins un emplacement actif avant d’activer.' };
  }
  const { data, error } = await supabase.from('sponsors').update({ actif, updated_at: new Date().toISOString() }).eq('id', id).select('nom');
  if (error || !data?.length) return { ok: false, message: `Échec : ${error?.message ?? 'sponsor introuvable'}` };
  await logActivity(admin.email, `Sponsors : « ${data[0].nom} » ${actif ? 'activé' : 'suspendu'}`);
  fini(`/sponsors/${id}`);
  return { ok: true, message: actif ? 'Sponsor activé : il s’affichera pendant les dates du contrat.' : 'Sponsor suspendu : il n’apparaît plus nulle part.' };
}

export async function supprimerSponsor(id: string): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id)) return { ok: false, message: 'Sponsor invalide.' };
  const supabase = getSupabaseAdmin();
  const { data: s } = await supabase.from('sponsors').select('nom, actif').eq('id', id).maybeSingle();
  if (!s) return { ok: false, message: 'Sponsor introuvable.' };
  if (s.actif) return { ok: false, message: 'Suspendez le sponsor avant de le supprimer.' };
  const { data: emps } = await supabase.from('sponsor_emplacements').select('id').eq('sponsor_id', id);
  const ids = ((emps ?? []) as { id: string }[]).map((e) => e.id);
  if (ids.length) {
    const { count } = await supabase.from('sponsor_stats').select('emplacement_id', { count: 'exact', head: true }).in('emplacement_id', ids);
    if (count) return { ok: false, message: 'Ce sponsor a des statistiques : gardez-le (suspendu) pour l’historique.' };
  }
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) return { ok: false, message: `Échec : ${error.message}` };
  await logActivity(admin.email, `Sponsors : « ${s.nom} » supprimé (brouillon sans statistiques)`);
  fini(null);
  return { ok: true, message: 'Sponsor supprimé.' };
}

export async function enregistrerEmplacement(sponsorId: string, id: string | null, saisie: SaisieEmplacement): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(sponsorId) || (id && !UUID.test(id))) return { ok: false, message: 'Emplacement invalide.' };
  const format = saisie.format;
  if (!(format in FORMATS)) return { ok: false, message: 'Format invalide.' };
  const regle = FORMATS[format].cible;
  let cible_type: string | null = null;
  let cible_slug: string | null = null;
  if (regle !== 'aucune' && saisie.cible) {
    const [type, slug] = saisie.cible.split(':');
    if (!['heros', 'mythe', 'decouverte'].includes(type) || !slug) return { ok: false, message: 'Contenu ciblé invalide.' };
    cible_type = type;
    cible_slug = slug;
  }
  if (regle === 'obligatoire' && !cible_slug) return { ok: false, message: 'Choisissez le contenu présenté par ce sponsor.' };
  // Ciblage fin (schema-sponsors-ciblage.sql) : format pour « Présenté par », chapitre pour la lecture, la vidéo et la fin de vidéo.
  const cibleFormat = format === 'presente_par' && ['lecture', 'ecoute', 'video'].includes(String(saisie.cible_format)) ? String(saisie.cible_format) : null;
  const chapitreBrut = String(saisie.cible_chapitre ?? '').trim();
  const chapitreAutorise = cible_slug && ((format === 'presente_par' && (cibleFormat === 'lecture' || cibleFormat === 'video')) || format === 'fin_video');
  let cibleChapitre: number | null = null;
  if (chapitreBrut && chapitreAutorise) {
    cibleChapitre = Number(chapitreBrut);
    if (!Number.isInteger(cibleChapitre) || cibleChapitre < 1 || cibleChapitre > 20) return { ok: false, message: 'Chapitre invalide.' };
  }
  const valeurs: Record<string, unknown> = { sponsor_id: sponsorId, format, cible_type, cible_slug, accroche_fr: t(saisie.accroche_fr, 160) || null, accroche_en: t(saisie.accroche_en, 160) || null };
  // N'écrire ces colonnes que si elles servent (le module reste utilisable avant le script SQL).
  if (cibleFormat || cibleChapitre || id) {
    valeurs.cible_format = cibleFormat;
    valeurs.cible_chapitre = cibleChapitre;
  }
  const supabase = getSupabaseAdmin();
  const { error } = id ? await supabase.from('sponsor_emplacements').update(valeurs).eq('id', id).eq('sponsor_id', sponsorId) : await supabase.from('sponsor_emplacements').insert(valeurs);
  if (error) {
    if (/cible_format|cible_chapitre/.test(error.message)) {
      if (!cibleFormat && !cibleChapitre && id) {
        // Script de ciblage pas encore exécuté : on réessaie sans ces colonnes.
        delete valeurs.cible_format;
        delete valeurs.cible_chapitre;
        const r = await supabase.from('sponsor_emplacements').update(valeurs).eq('id', id).eq('sponsor_id', sponsorId);
        if (r.error) return { ok: false, message: `Échec : ${r.error.message}` };
      } else {
        return { ok: false, message: 'Exécutez d’abord schema-sponsors-ciblage.sql dans Supabase pour cibler un format ou un chapitre.' };
      }
    } else {
      return { ok: false, message: `Échec : ${error.message}` };
    }
  }
  await logActivity(admin.email, `Sponsors : emplacement ${FORMATS[format].label} ${id ? 'modifié' : 'ajouté'}${cible_slug ? ` (${cible_type}/${cible_slug})` : ''}`);
  fini(`/sponsors/${sponsorId}`);
  return { ok: true, message: id ? 'Emplacement modifié.' : 'Emplacement ajouté.' };
}

export async function basculerEmplacement(sponsorId: string, id: string, actif: boolean): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(sponsorId) || !UUID.test(id)) return { ok: false, message: 'Emplacement invalide.' };
  const { error } = await getSupabaseAdmin().from('sponsor_emplacements').update({ actif }).eq('id', id).eq('sponsor_id', sponsorId);
  if (error) return { ok: false, message: `Échec : ${error.message}` };
  await logActivity(admin.email, `Sponsors : emplacement ${id.slice(0, 8)} ${actif ? 'réactivé' : 'désactivé'}`);
  fini(`/sponsors/${sponsorId}`);
  return { ok: true, message: actif ? 'Emplacement réactivé.' : 'Emplacement désactivé.' };
}

export async function journaliserExportBilan(sponsorNom: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  await logActivity(admin.email, `Sponsors : bilan exporté pour « ${String(sponsorNom).slice(0, 80)} »`);
}
