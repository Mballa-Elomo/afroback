import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Suivi minimal de lecture ("Reprendre" sur l'Accueil) : un seul récit en
 * cours à la fois (le dernier consulté), pas un historique complet — c'est
 * ce que la maquette affiche (une seule carte "Reprendre"). Stocké en local
 * (AsyncStorage), pas en base : c'est une commodité d'UI, pas une donnée
 * produit à synchroniser entre appareils pour l'instant.
 */
const STORAGE_KEY = 'afroback:reading-progress';

export interface ReadingProgress {
  slug: string;
  progress: number;
  updatedAt: number;
}

export async function saveReadingProgress(slug: string, progress: number): Promise<void> {
  // Pas la peine de retenir un début de lecture à peine entamé, ni un récit terminé.
  if (progress < 0.03 || progress > 0.97) return;
  const entry: ReadingProgress = { slug, progress, updatedAt: Date.now() };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Best-effort : une écriture ratée ne doit jamais casser la lecture.
  }
}

export async function getReadingProgress(): Promise<ReadingProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReadingProgress) : null;
  } catch {
    return null;
  }
}
