import { getSupabaseAdmin } from '../supabase/server';

/**
 * Miroir de `mythes` (mobile-app/supabase/schema-mythologie.sql +
 * schema-mythologie-extended.sql, 2026-08-12 — parité Héros : publication,
 * mise en avant, récit EN, audio EN, vidéo par chapitre × langue). Contenu
 * produit par l'agent griot ; comme pour `decouverte.ts`, le back-office
 * permet de corriger la version publiée en base (métadonnées, texte par
 * chapitre) sans toucher aux fichiers du pipeline.
 */
export interface VideoChapitreAdmin {
  numero: number;
  titre_chapitre: string;
  videos?: Record<string, string>;
}

interface RawVideoChapitreAdmin {
  numero: number;
  titre_chapitre: string;
  videos?: Record<string, string> | null;
}

function normalizeMytheVideoChapitres<T extends { video_chapitres?: unknown }>(row: T): T {
  return {
    ...row,
    video_chapitres: ((row.video_chapitres ?? []) as RawVideoChapitreAdmin[]).map((c) => ({
      numero: c.numero,
      titre_chapitre: c.titre_chapitre,
      videos: c.videos ?? {},
    })),
  };
}

export interface MytheAdmin {
  id: string;
  slug: string;
  titre: string;
  peuple: string;
  zone: string;
  /** Toujours peuplé par le pipeline actuel (recit_chapitres_fr jamais vide) — gardé en booléen calculé plutôt qu'affiché brut. */
  aRecit: boolean;
  image_url: string | null;
  narration_audio_url: string | null;
  narration_audio_url_en: string | null;
  video_chapitres: VideoChapitreAdmin[];
  ordre_affichage: number;
  statut_publication: 'publie' | 'depublie';
  a_la_une: boolean;
}

const LIST_COLUMNS =
  'id, slug, titre, peuple, zone, recit_chapitres_fr, image_url, narration_audio_url, narration_audio_url_en, video_chapitres, ordre_affichage, statut_publication, a_la_une';

interface RawMytheListRow {
  id: string;
  slug: string;
  titre: string;
  peuple: string;
  zone: string;
  recit_chapitres_fr: unknown[];
  image_url: string | null;
  narration_audio_url: string | null;
  narration_audio_url_en: string | null;
  video_chapitres: RawVideoChapitreAdmin[];
  ordre_affichage: number;
  statut_publication: 'publie' | 'depublie';
  a_la_une: boolean;
}

export async function getMythesAdmin(): Promise<MytheAdmin[]> {
  const { data, error } = await getSupabaseAdmin().from('mythes').select(LIST_COLUMNS).order('ordre_affichage', { ascending: true });
  if (error) throw new Error(`Impossible de charger les mythes : ${error.message}`);
  return ((data ?? []) as unknown as RawMytheListRow[]).map((m) => ({
    id: m.id,
    slug: m.slug,
    titre: m.titre,
    peuple: m.peuple,
    zone: m.zone,
    aRecit: (m.recit_chapitres_fr ?? []).length > 0,
    image_url: m.image_url,
    narration_audio_url: m.narration_audio_url,
    narration_audio_url_en: m.narration_audio_url_en ?? null,
    video_chapitres: (m.video_chapitres ?? []).map((c) => ({ numero: c.numero, titre_chapitre: c.titre_chapitre, videos: c.videos ?? {} })),
    ordre_affichage: m.ordre_affichage,
    statut_publication: m.statut_publication ?? 'publie',
    a_la_une: m.a_la_une ?? false,
  }));
}

/** Lecture minimale pour les actions de bascule — même raison que `getHeroToggleFields()` (voir heros.ts) : éviter de charger le récit complet + storyboard juste pour lire un booléen. */
export interface MytheToggleFields {
  titre: string;
  statut_publication: 'publie' | 'depublie';
  a_la_une: boolean;
}

export async function getMytheToggleFields(slug: string): Promise<MytheToggleFields | null> {
  const { data, error } = await getSupabaseAdmin().from('mythes').select('titre, statut_publication, a_la_une').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`Impossible de charger ce mythe : ${error.message}`);
  return (data as MytheToggleFields | null) ?? null;
}

export interface MytheChapitre {
  numero: number;
  titre: string;
  texte: string;
}

export interface MytheDetailAdmin {
  id: string;
  slug: string;
  titre: string;
  sous_titre: string;
  peuple: string;
  region: string;
  zone: string;
  epoque: string;
  type_contenu: string;
  theme: string;
  recit_chapitres_fr: MytheChapitre[];
  recit_chapitres_en: MytheChapitre[];
  sources: string[];
  couleur: string;
  image_url: string | null;
  narration_audio_url: string | null;
  narration_audio_url_en: string | null;
  video_chapitres: VideoChapitreAdmin[];
  ordre_affichage: number;
  fichier_source: string | null;
  statut_publication: 'publie' | 'depublie';
  a_la_une: boolean;
}

export async function getMytheBySlugAdmin(slug: string): Promise<MytheDetailAdmin | null> {
  const { data, error } = await getSupabaseAdmin().from('mythes').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`Impossible de charger ce mythe : ${error.message}`);
  if (!data) return null;
  const normalized = normalizeMytheVideoChapitres(data as MytheDetailAdmin);
  return {
    ...normalized,
    recit_chapitres_en: normalized.recit_chapitres_en ?? [],
    narration_audio_url_en: normalized.narration_audio_url_en ?? null,
    statut_publication: normalized.statut_publication ?? 'publie',
    a_la_une: normalized.a_la_une ?? false,
  };
}

export function mytheHasMedia(m: { image_url: string | null; narration_audio_url: string | null; narration_audio_url_en: string | null; video_chapitres: VideoChapitreAdmin[] }) {
  const hasChapterVideo = (m.video_chapitres ?? []).some((c) => Object.values(c.videos ?? {}).some(Boolean));
  return {
    photo: !!m.image_url,
    audioFr: !!m.narration_audio_url,
    audioEn: !!m.narration_audio_url_en,
    video: hasChapterVideo,
  };
}
