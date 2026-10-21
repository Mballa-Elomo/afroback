import { supabase } from './supabaseClient';
import type { Mythe, VideoChapitre } from './mythologieTypes';
import { getContentDetail } from './contentAccess';
import i18n from '../i18n';
import { MYTHES_EN_COLUMNS, MYTHES_EN_FIELDS, localize } from '../i18n/content';

/**
 * Source de données réelle : table `mythes` sur Supabase (voir
 * supabase/schema-mythologie.sql et schema-mythologie-extended.sql).
 * Contenu éditorial public, lecture seule côté app — même pattern de cache
 * mémoire que heroesRepository.ts.
 */

/** Même normalisation que heroesRepository.ts (voir ce fichier pour le détail) — un chapitre vidéo peut encore porter l'ancien format `video_url_fr`/`video_url_en` selon l'ordre d'exécution des migrations. */
interface RawVideoChapitre {
  numero: number;
  titre_chapitre: string;
  videos?: Record<string, string> | null;
  video_url_fr?: string | null;
  video_url_en?: string | null;
}

function normalizeVideoChapitre(raw: RawVideoChapitre): VideoChapitre {
  const videos: Record<string, string> = { ...(raw.videos ?? {}) };
  if (raw.video_url_fr && !videos.fr) videos.fr = raw.video_url_fr;
  if (raw.video_url_en && !videos.en) videos.en = raw.video_url_en;
  return { numero: raw.numero, titre_chapitre: raw.titre_chapitre, videos };
}

/** Colonnes publiques du catalogue ; le récit et les médias passent par `get_mythe_detail` (voir heroesRepository.ts). */
const MYTHES_CATALOGUE =
  'id,slug,titre,sous_titre,peuple,region,zone,epoque,type_contenu,theme,couleur,image_url,ordre_affichage,statut_publication,a_la_une';

let cache: Mythe[] | null = null;
let inflight: Promise<Mythe[]> | null = null;
i18n.on('languageChanged', () => {
  cache = null;
});

async function fetchMythes(): Promise<Mythe[]> {
  let { data, error }: { data: unknown; error: { message: string } | null } = await supabase.from('mythes').select(MYTHES_CATALOGUE + MYTHES_EN_COLUMNS).order('ordre_affichage', { ascending: true });
  if (error) {
    ({ data, error } = await supabase.from('mythes').select(MYTHES_CATALOGUE).order('ordre_affichage', { ascending: true }));
  }
  if (error) {
    throw new Error(`Impossible de charger la mythologie depuis Supabase : ${error.message}`);
  }
  const mythes = ((data ?? []) as unknown as Record<string, unknown>[]).map((raw) => localize(raw, MYTHES_EN_FIELDS)).map((row) => ({
    recit_chapitres_fr: [],
    recit_chapitres_en: [],
    sources: [],
    narration_audio_url: null,
    narration_audio_url_en: null,
    video_chapitres: [],
    fichier_source: null,
    ...row,
    statut_publication: row.statut_publication ?? 'publie',
    a_la_une: row.a_la_une ?? false,
  })) as unknown as Mythe[];
  // Filtré côté client, pas dans la requête : reste compatible même si
  // schema-mythologie-extended.sql n'a pas encore été exécuté par Yannick
  // (colonne absente -> traité comme publié), même principe que
  // heroesRepository.ts.
  return mythes.filter((m) => (m.statut_publication ?? 'publie') !== 'depublie');
}

export async function getMythes(): Promise<Mythe[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetchMythes()
      .then((mythes) => {
        cache = mythes;
        return mythes;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Force un vrai aller-retour Supabase, en ignorant le cache — même usage que refreshHeroes() (rafraîchissement auto après une action back-office). */
export async function refreshMythes(): Promise<Mythe[]> {
  const mythes = await fetchMythes();
  cache = mythes;
  return mythes;
}

/** Mythe complet (récit, sources, médias) si autorisé, sinon catalogue + aperçu et `acces.verrouille`. */
export async function getMytheBySlug(slug: string): Promise<Mythe | undefined> {
  const mythes = await getMythes();
  const base = mythes.find((m) => m.slug === slug);
  if (!base) return undefined;
  const detail = await getContentDetail('mythe', slug);
  if (!detail) return undefined;
  if (detail.verrouille) {
    return { ...base, acces: { verrouille: true, apercu_fr: detail.apercu_fr, apercu_en: detail.apercu_en } };
  }
  const row = localize(detail.row, MYTHES_EN_FIELDS);
  return {
    ...base,
    ...(row as unknown as Mythe),
    recit_chapitres_en: (row.recit_chapitres_en as Mythe['recit_chapitres_en']) ?? [],
    narration_audio_url_en: (row.narration_audio_url_en as string | null) ?? null,
    video_chapitres: ((row.video_chapitres ?? []) as RawVideoChapitre[]).map(normalizeVideoChapitre),
    acces: { verrouille: false },
  };
}

/** Mythes groupés par zone, dans l'ordre où chaque zone apparaît en base (ordre_affichage). */
export async function getMythesGroupedByZone(frais = false): Promise<{ zone: string; items: Mythe[] }[]> {
  const mythes = frais ? await refreshMythes() : await getMythes();
  const order: string[] = [];
  const map = new Map<string, Mythe[]>();
  for (const m of mythes) {
    if (!map.has(m.zone)) {
      map.set(m.zone, []);
      order.push(m.zone);
    }
    map.get(m.zone)!.push(m);
  }
  return order.map((zone) => ({ zone, items: map.get(zone)! }));
}
