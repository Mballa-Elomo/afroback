import { getSupabaseAdmin } from '../supabase/server';

/**
 * Type miroir de la table `heros` (voir mobile-app/src/data/types.ts et
 * supabase/seed.sql, complété par les 2 colonnes ajoutées pour le
 * back-office dans backoffice/supabase/schema-admin-heros.sql).
 * Dupliqué volontairement plutôt que partagé avec l'app mobile : ce sont
 * deux projets déployés séparément (Expo vs Next.js), pas un monorepo avec
 * un package partagé — dupliquer un type qui bouge rarement est plus simple
 * que d'introduire un package partagé pour ce seul usage.
 */
export interface RecitChapitre {
  numero: number;
  titre: string;
  texte: string;
}

export interface ChapitreStoryboard {
  numero: number;
  titre_chapitre: string;
  nb_planches: number;
  statut: string;
}

/**
 * Miroir de `HeroVideoChapitreMedia` (mobile-app/src/data/heroes.media.ts) et
 * de la colonne jsonb `heros.video_chapitres` (déjà en base, voir
 * supabase/seed.sql). Un héros peut n'avoir aucune entrée (tableau vide,
 * cas de 8 des 9 héros à ce jour) ou une entrée par chapitre réellement
 * produit — pas forcément les 4. `video_url_fr`/`video_url_en` sont
 * indépendants : un chapitre peut avoir la FR sans l'EN.
 */
export interface VideoChapitreAdmin {
  numero: number;
  titre_chapitre: string;
  video_url_fr?: string;
  video_url_en?: string;
}

export interface HerosAdmin {
  id: string;
  slug: string;
  nom_affiche: string;
  nom_complet: string;
  sous_titre: string;
  epoque: string;
  region: string;
  theme: string[];
  resume_catalogue: string;
  recit_fr_texte: string;
  recit_chapitres_fr: RecitChapitre[];
  recit_en_texte: string | null;
  recit_chapitres_en: RecitChapitre[] | null;
  chapitres_storyboard: ChapitreStoryboard[];
  image_carte_catalogue: string | null;
  narration_audio_fr_url: string | null;
  narration_audio_en_url: string | null;
  video_url: string | null;
  video_chapitres: VideoChapitreAdmin[];
  avertissement_lecture: string | null;
  ordre_affichage: number;
  statut_publication: 'publie' | 'depublie';
  a_la_une: boolean;
}

/**
 * Sous-ensemble de `HerosAdmin` utilisé par la liste et le Tableau de bord —
 * sans `recit_chapitres_fr`/`recit_chapitres_en` (texte intégral découpé par
 * chapitre, uniquement consulté sur la fiche détail) ni `avertissement_lecture`
 * (idem). Optimisation ajoutée le 2026-08-06 (retour de lenteur de Yannick) :
 * `getHeroesAdmin()` faisait `select('*')` pour les 9 héros — y compris le
 * texte intégral des récits FR/EN, leur découpage par chapitre (doublon du
 * texte intégral) et le storyboard complet (96 planches avec voix off/cadrage
 * par héros, dans `chapitres_storyboard`) — pour au final n'afficher qu'un nom,
 * une région et des pastilles "présent/absent". `HerosAdmin` reste un
 * sur-ensemble compatible : toute valeur `HerosAdmin` (fiche détail) satisfait
 * structurellement `HerosListItem`, donc `heroHasMedia`/`heroIsComplete`
 * fonctionnent à l'identique des deux côtés.
 */
export type HerosListItem = Omit<HerosAdmin, 'recit_chapitres_fr' | 'recit_chapitres_en' | 'avertissement_lecture'>;

const LIST_COLUMNS =
  'id, slug, nom_affiche, nom_complet, sous_titre, epoque, region, theme, resume_catalogue, recit_fr_texte, recit_en_texte, chapitres_storyboard, image_carte_catalogue, narration_audio_fr_url, narration_audio_en_url, video_url, video_chapitres, ordre_affichage, statut_publication, a_la_une';

export async function getHeroesAdmin(): Promise<HerosListItem[]> {
  const { data, error } = await getSupabaseAdmin().from('heros').select(LIST_COLUMNS).order('ordre_affichage', { ascending: true });
  if (error) throw new Error(`Impossible de charger les héros : ${error.message}`);
  return (data ?? []) as unknown as HerosListItem[];
}

export async function getHeroBySlugAdmin(slug: string): Promise<HerosAdmin | null> {
  const { data, error } = await getSupabaseAdmin().from('heros').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`Impossible de charger ce héros : ${error.message}`);
  return (data as HerosAdmin | null) ?? null;
}

/**
 * Lecture minimale pour les actions de bascule (`toggleFeatured`,
 * `togglePublication`, `archiveHero`) : ces actions n'ont besoin que du nom
 * (message du journal d'activité) et du statut actuel à inverser — jamais du
 * texte intégral des récits ni du storyboard. Avant le 2026-08-06, ces 3
 * actions appelaient `getHeroBySlugAdmin(slug)` (`select('*')`) juste pour lire
 * un booléen, retour de lenteur de Yannick sur `POST /heros` (1,7 à 2,5s).
 */
export interface HeroToggleFields {
  nom_affiche: string;
  statut_publication: 'publie' | 'depublie';
  a_la_une: boolean;
}

export async function getHeroToggleFields(slug: string): Promise<HeroToggleFields | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('heros')
    .select('nom_affiche, statut_publication, a_la_une')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(`Impossible de charger ce héros : ${error.message}`);
  return (data as HeroToggleFields | null) ?? null;
}

export function heroHasMedia(h: HerosListItem) {
  // "video" = vrai dès qu'il existe une vidéo utilisable par l'app, que ce
  // soit le champ unique (mode "documentaire") ou au moins un chapitre (mode
  // "chapitres") — les deux modèles s'excluent côté app (voir video.tsx),
  // mais côté statut de production, les deux comptent comme "il y a une
  // vidéo à voir".
  const hasChapterVideo = (h.video_chapitres ?? []).some((c) => c.video_url_fr || c.video_url_en);
  return {
    recitFr: !!h.recit_fr_texte,
    recitEn: !!h.recit_en_texte,
    storyboard: (h.chapitres_storyboard ?? []).length > 0,
    photo: !!h.image_carte_catalogue,
    audioFr: !!h.narration_audio_fr_url,
    audioEn: !!h.narration_audio_en_url,
    video: !!h.video_url || hasChapterVideo,
  };
}

/** "Complet" = a minima un récit, une photo, et au moins un des deux médias narratifs (audio ou vidéo) — même critère que la maquette. */
export function heroIsComplete(h: HerosListItem) {
  const m = heroHasMedia(h);
  return m.recitFr && m.photo && (m.audioFr || m.video);
}
