import { supabase } from './supabaseClient';

export type EngagementEvent = 'recit' | 'video';
/**
 * Code de langue (ex. `"fr"`, `"en"`). Reste un type générique plutôt qu'un
 * enum fixe : `recordVideoChapterEngagement` doit accepter tout code
 * configuré côté back-office (`lib/langues.ts`, LANGUES_VIDEO), pas
 * seulement FR/EN. `recordAudioEngagement` reste FR/EN dans les faits (seule
 * la vidéo par chapitre a été étendue à plusieurs langues au 2026-08-09),
 * mais partage le même type par simplicité — la fonction RPC Supabase
 * `increment_audio_engagement` continue de rejeter tout code hors FR/EN
 * côté serveur.
 */
export type EngagementLangue = string;

/**
 * Enregistre un vrai événement d'engagement agrégé : lecture du récit
 * (`'recit'`, un seul compteur par héros — pas de notion de langue qui ait
 * du sens à isoler, vérifié dans recit.tsx) ou visionnage vidéo/storyboard
 * (`'video'`, TOUT contenu vidéo réel confondu — documentaire unique,
 * diaporama storyboard, ou chapitre produit). Alimente le total agrégé du
 * panneau "ENGAGEMENT GLOBAL" (voir `hero_engagement`,
 * `supabase/schema-engagement.sql`). Appelé une seule fois par ouverture
 * d'écran, uniquement quand du vrai contenu est effectivement montré (voir
 * les gardes dans recit.tsx/video.tsx — jamais compté quand l'écran affiche
 * seulement un état "bientôt disponible").
 *
 * **L'écoute audio n'utilise plus cette fonction** depuis le 2026-08-06
 * (voir `recordAudioEngagement` ci-dessous) : Yannick veut distinguer
 * FR/EN, un simple `'audio'` générique ne suffit plus. Le type `'audio'` a
 * donc été retiré de `EngagementEvent` pour qu'aucun futur appel ne
 * reparte par erreur sur l'ancien chemin non détaillé.
 *
 * Best-effort, comme `logActivity` côté back-office : un échec réseau ne
 * doit jamais gêner la lecture/écoute/visionnage en cours, donc l'erreur est
 * avalée silencieusement plutôt que remontée à l'UI. Passe par la fonction
 * SQL `increment_hero_engagement` (incrément atomique côté serveur), jamais
 * une écriture directe sur la table (RLS ne l'autorise pas pour `anon` de
 * toute façon).
 */
export async function recordHeroEngagement(heroId: string, event: EngagementEvent): Promise<void> {
  try {
    await supabase.rpc('increment_hero_engagement', { p_hero_id: heroId, p_event: event });
  } catch {
    // Best-effort : une stat d'engagement manquée n'est jamais une raison
    // de perturber l'expérience de lecture/écoute/visionnage.
  }
}

/**
 * Écoute de narration audio, avec la langue RÉELLEMENT jouée (pas juste le
 * réglage FR/EN affiché — voir le calcul de `actualLang` dans audio.tsx,
 * qui gère le cas où une seule langue existe et où le lecteur bascule dessus
 * automatiquement). Demande de Yannick le 2026-08-06 : savoir quel audio
 * (FR ou EN) est le plus écouté. Incrémente à la fois le compteur de la
 * langue précise et le total agrégé `ecoutes_audio`, de façon atomique côté
 * serveur (`increment_audio_engagement`, `schema-engagement-detail.sql`).
 */
export async function recordAudioEngagement(heroId: string, langue: EngagementLangue): Promise<void> {
  try {
    await supabase.rpc('increment_audio_engagement', { p_hero_id: heroId, p_langue: langue });
  } catch {
    // Best-effort, même raison que recordHeroEngagement ci-dessus.
  }
}

/**
 * Visionnage d'un chapitre vidéo RÉELLEMENT produit (jamais pour le
 * diaporama storyboard ni le documentaire unique legacy, qui n'ont pas de
 * notion de chapitre × langue) — demande de Yannick le 2026-08-06 : savoir
 * quel chapitre est le plus regardé. Vient EN PLUS de `recordHeroEngagement`
 * (event `'video'`), pas à la place : le total agrégé `visionnages_video`
 * continue de compter tout visionnage vidéo réel, ce détail par
 * chapitre × langue est un signal complémentaire, pas un remplacement (voir
 * le commentaire en tête de `schema-engagement-detail.sql`).
 */
export async function recordVideoChapterEngagement(heroId: string, chapitreNumero: number, langue: EngagementLangue): Promise<void> {
  try {
    await supabase.rpc('increment_video_chapter_engagement', { p_hero_id: heroId, p_chapitre: chapitreNumero, p_langue: langue });
  } catch {
    // Best-effort, même raison que recordHeroEngagement ci-dessus.
  }
}
