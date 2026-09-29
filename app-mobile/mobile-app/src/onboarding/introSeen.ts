import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * "Intro déjà vue sur cet appareil" (cdc-onboarding.md, 5.1) : un simple
 * indicateur, aucune donnée personnelle. Une fois posé, l'app saute les
 * écrans de présentation et ouvre directement "Bienvenue dans ton voyage"
 * (ex. après une déconnexion). Réinstaller l'app le remet à zéro.
 */
const KEY = 'afroback:intro-seen:v1';

export async function hasSeenIntro(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    // Stockage indisponible : on remontre l'intro plutôt que de bloquer.
    return false;
  }
}

export async function markIntroSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, '1');
  } catch {
    // Best-effort : au pire, l'intro sera montrée une fois de plus.
  }
}
