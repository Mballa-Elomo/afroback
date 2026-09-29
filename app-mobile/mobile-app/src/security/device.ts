import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

/**
 * Identité de l'appareil (cdc-appareil-unique.md) : un identifiant aléatoire
 * créé à la première ouverture et gardé sur l'appareil. Il sert de "badge de
 * confiance" côté serveur : il doit donc être impossible à deviner
 * (générateur cryptographique d'expo-crypto, jamais Math.random).
 *
 * Vider les données du navigateur ou réinstaller l'app en crée un nouveau :
 * l'appareil redevient inconnu et le code est redemandé (comportement voulu).
 */
const KEY = 'afroback:device-id';
let cached: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored && stored.length >= 32) {
      cached = stored;
      return stored;
    }
  } catch {
    // Stockage indisponible : un identifiant de session suffira (l'appareil sera redemandé au prochain lancement).
  }
  const id = Crypto.randomUUID().replace(/-/g, '');
  cached = id;
  try {
    await AsyncStorage.setItem(KEY, id);
  } catch {
    // Best-effort.
  }
  return id;
}

/** Nom lisible pour l'email d'alerte ("Chrome sur Windows", "iPhone"…). */
export function getDeviceName(): string {
  if (Platform.OS === 'ios') return 'iPhone ou iPad';
  if (Platform.OS === 'android') return 'Téléphone Android';
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Navigateur';
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /iPhone|iPad/.test(ua)
      ? 'iPhone'
      : /Android/.test(ua)
        ? 'Android'
        : /Mac OS X/.test(ua)
          ? 'Mac'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'web';
  return `${browser} sur ${os}`;
}

/** "yannick@gmail.com" → "y•••••k@gmail.com" : montre à qui le code part, sans exposer l'adresse. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || local.length < 2) return email;
  return `${local[0]}${'•'.repeat(Math.max(3, local.length - 2))}${local[local.length - 1]}@${domain}`;
}
