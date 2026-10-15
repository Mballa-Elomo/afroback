import { getSupabaseAdmin } from './supabase/server';

/**
 * École des Héros (back-office, finitions du 2026-10-15) : leçons par héros
 * et par niveau, avec leurs contenus (texte FR/EN, narration, vidéo, BD).
 * Lecture côté serveur (clé service_role).
 */

export interface Planche {
  image_url: string;
  texte: string;
  texte_en?: string;
  ordre: number;
}

export interface Lecon {
  id: string;
  heros_id: string;
  heros: string;
  heros_slug: string;
  niveau: number;
  texte_fr: string;
  texte_en: string;
  audio_fr: string | null;
  audio_en: string | null;
  video: string | null;
  planches: Planche[];
  nb_questions: number;
  maj: string;
}

export interface Niveau {
  niveau: number;
  nom: string;
  tranche: string;
  ton: string;
}

export interface DonneesEcole {
  lecons: Lecon[];
  niveaux: Niveau[];
  heros: { id: string; slug: string; nom: string }[];
  audioEnDisponible: boolean;
}

export async function chargerEcole(): Promise<DonneesEcole> {
  const supabase = getSupabaseAdmin();
  const [le, he, ni, qu] = await Promise.all([
    supabase.from('ecole_lecons').select('*'),
    supabase.from('heros').select('id, slug, nom_affiche').order('ordre_affichage'),
    supabase.from('ecole_niveaux').select('niveau, nom, tranche_age, ton_contenu').order('niveau'),
    supabase.from('ecole_quiz_questions').select('lecon_id'),
  ]);
  const heros = ((he.data ?? []) as { id: string; slug: string; nom_affiche: string }[]).map((h) => ({ id: h.id, slug: h.slug, nom: h.nom_affiche }));
  const parId = new Map(heros.map((h) => [h.id, h]));
  const nbQ = new Map<string, number>();
  for (const q of (qu.data ?? []) as { lecon_id: string }[]) nbQ.set(q.lecon_id, (nbQ.get(q.lecon_id) ?? 0) + 1);
  const lignes = (le.data ?? []) as Record<string, unknown>[];

  return {
    lecons: lignes
      .map((l) => ({
        id: String(l.id),
        heros_id: String(l.heros_id),
        heros: parId.get(String(l.heros_id))?.nom ?? 'Héros',
        heros_slug: parId.get(String(l.heros_id))?.slug ?? '',
        niveau: Number(l.niveau),
        texte_fr: String(l.texte_adapte ?? ''),
        texte_en: String(l.texte_adapte_en ?? ''),
        audio_fr: (l.narration_audio_url as string) ?? null,
        audio_en: (l.narration_audio_url_en as string) ?? null,
        video: (l.video_url as string) ?? null,
        planches: Array.isArray(l.bd_planches) ? (l.bd_planches as Planche[]).slice().sort((a, b) => a.ordre - b.ordre) : [],
        nb_questions: nbQ.get(String(l.id)) ?? 0,
        maj: String(l.updated_at ?? l.created_at),
      }))
      .sort((a, b) => a.niveau - b.niveau || a.heros.localeCompare(b.heros)),
    niveaux: ((ni.data ?? []) as { niveau: number; nom: string; tranche_age: string; ton_contenu: string }[]).map((n) => ({
      niveau: n.niveau,
      nom: n.nom,
      tranche: n.tranche_age,
      ton: n.ton_contenu,
    })),
    heros,
    audioEnDisponible: lignes.length === 0 || 'narration_audio_url_en' in lignes[0],
  };
}
