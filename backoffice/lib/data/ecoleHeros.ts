import { getSupabaseAdmin } from '../supabase/server';

/**
 * Matrice de production du module École des Héros (mode enfant) : 9 héros ×
 * 4 niveaux × 4 formats (lire/écouter/regarder/BD). Miroir de
 * `mobile-app/supabase/schema-ecole-heros.sql` — table `ecole_lecons`, une
 * ligne par (héros, niveau) réellement mappé (pas systématiquement les 4
 * niveaux pour chaque héros, voir le mapping du 2026-08-05). Aucun contenu
 * n'existe à ce jour (`texte_adapte`/`narration_audio_url`/`video_url`/
 * `bd_planches` tous NULL/vides) : cette page est un tableau de bord de
 * production honnête, pas un éditeur — rien n'est modifiable ici.
 */
export type FormatStatus = 'pret' | 'vide' | 'non_mappe';

export interface EcoleCell {
  niveau: number;
  formats: { key: 'lire' | 'ecouter' | 'regarder' | 'bd'; label: string; status: FormatStatus }[];
}

export interface EcoleHeroRow {
  slug: string;
  nom_affiche: string;
  cells: EcoleCell[];
}

interface RawLecon {
  heros_id: string;
  niveau: number;
  texte_adapte: string | null;
  narration_audio_url: string | null;
  video_url: string | null;
  bd_planches: unknown[];
}

const FORMAT_DEFS: { key: EcoleCell['formats'][number]['key']; label: string }[] = [
  { key: 'lire', label: 'Lire' },
  { key: 'ecouter', label: 'Écouter' },
  { key: 'regarder', label: 'Regarder' },
  { key: 'bd', label: 'BD' },
];

export async function getEcoleHerosMatrix(): Promise<EcoleHeroRow[]> {
  const admin = getSupabaseAdmin();
  const [{ data: heroes, error: heroesError }, { data: lecons, error: leconsError }] = await Promise.all([
    admin.from('heros').select('id, slug, nom_affiche').order('ordre_affichage', { ascending: true }),
    admin.from('ecole_lecons').select('heros_id, niveau, texte_adapte, narration_audio_url, video_url, bd_planches'),
  ]);
  if (heroesError) throw new Error(`Impossible de charger les héros : ${heroesError.message}`);
  // Table éventuellement absente si schema-ecole-heros.sql n'a pas encore
  // tourné : dégrade vers "non mappé partout" plutôt que de faire planter la
  // page, cohérent avec le reste du projet (voir lib/data/engagement.ts).
  const leconRows = (leconsError ? [] : ((lecons ?? []) as unknown as RawLecon[]));

  const leconByHeroNiveau = new Map<string, RawLecon>();
  for (const l of leconRows) leconByHeroNiveau.set(`${l.heros_id}-${l.niveau}`, l);

  return ((heroes ?? []) as { id: string; slug: string; nom_affiche: string }[]).map((h) => ({
    slug: h.slug,
    nom_affiche: h.nom_affiche,
    cells: [1, 2, 3, 4].map((niveau) => {
      const lecon = leconByHeroNiveau.get(`${h.id}-${niveau}`);
      return {
        niveau,
        formats: FORMAT_DEFS.map((f) => ({
          key: f.key,
          label: f.label,
          status: statusFor(f.key, lecon),
        })),
      };
    }),
  }));
}

function statusFor(format: EcoleCell['formats'][number]['key'], lecon: RawLecon | undefined): FormatStatus {
  if (!lecon) return 'non_mappe';
  const present =
    format === 'lire' ? !!lecon.texte_adapte
    : format === 'ecouter' ? !!lecon.narration_audio_url
    : format === 'regarder' ? !!lecon.video_url
    : (lecon.bd_planches ?? []).length > 0;
  return present ? 'pret' : 'vide';
}
