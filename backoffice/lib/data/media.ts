import { getSupabaseAdmin } from '../supabase/server';
import { getHeroesAdmin } from './heros';

const BUCKET = 'heroes-media';
const FOLDERS = ['images', 'audio', 'video'] as const;

export interface MediaFile {
  path: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'autre';
  sizeLabel: string;
  attachedTo: string; // nom du héros, ou "Non rattaché"
}

function typeFromFolder(folder: string): MediaFile['type'] {
  if (folder === 'images') return 'image';
  if (folder === 'audio') return 'audio';
  if (folder === 'video') return 'video';
  return 'autre';
}

function formatSize(bytes: number | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Liste réelle des fichiers du bucket `heroes-media` (dossiers images/audio/
 * video). Le rattachement "attaché à" est calculé par correspondance
 * d'URL avec les colonnes média de `heros` — pas un vrai champ de metadata
 * dédié (aurait demandé une table de plus pour ce seul usage). Un fichier
 * présent dans le bucket mais qu'aucun héros ne référence apparaît "Non
 * rattaché" (ex. un ancien fichier remplacé depuis).
 */
export async function listMediaFiles(): Promise<MediaFile[]> {
  const admin = getSupabaseAdmin();
  const heroes = await getHeroesAdmin();

  const urlToHero = new Map<string, string>();
  for (const h of heroes) {
    if (h.image_carte_catalogue) urlToHero.set(h.image_carte_catalogue, h.nom_affiche);
    if (h.narration_audio_fr_url) urlToHero.set(h.narration_audio_fr_url, h.nom_affiche);
    if (h.narration_audio_en_url) urlToHero.set(h.narration_audio_en_url, h.nom_affiche);
    if (h.video_url) urlToHero.set(h.video_url, h.nom_affiche);
  }

  const files: MediaFile[] = [];
  for (const folder of FOLDERS) {
    const { data, error } = await admin.storage.from(BUCKET).list(folder, { limit: 200 });
    if (error) {
      console.warn(`Listage du dossier ${folder} impossible :`, error.message);
      continue;
    }
    for (const entry of data ?? []) {
      if (!entry.id) continue; // dossiers/entrées vides
      const path = `${folder}/${entry.name}`;
      const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
      files.push({
        path,
        name: entry.name,
        type: typeFromFolder(folder),
        sizeLabel: formatSize(entry.metadata?.size as number | undefined),
        attachedTo: urlToHero.get(pub.publicUrl) ?? 'Non rattaché',
      });
    }
  }
  return files;
}
