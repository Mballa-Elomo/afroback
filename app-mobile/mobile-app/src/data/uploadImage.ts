import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabaseClient';

/**
 * Upload d'image générique, réutilisé par le pilier Communauté (photo de
 * post, avatar de profil) et le pilier Marketplace (photo de produit,
 * avatar de boutique). Bucket Supabase Storage `user-uploads` (contenu
 * généré par les utilisateurs, distinct de `heroes-media` qui est du
 * contenu éditorial contrôlé) — voir supabase/schema-storage-user-uploads.sql.
 *
 * `expo-file-system` n'est volontairement pas utilisé : `expo-image-picker`
 * peut renvoyer directement le contenu en base64 (`base64: true`), ce qui
 * suffit pour l'upload — pas besoin de relire le fichier depuis le disque.
 */

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Décodeur base64 → octets écrit à la main plutôt qu'une dépendance de plus : `atob` n'est pas garanti disponible sur le runtime Hermes utilisé par Expo. */
function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

export type UploadFolder = 'posts' | 'products' | 'avatars-communaute' | 'avatars-marche';

export interface PickAndUploadResult {
  /** URL publique de l'image, `null` si l'utilisateur a annulé (pas une erreur) ou en cas d'échec. */
  url: string | null;
  /** `null` si tout s'est bien passé OU si l'utilisateur a simplement annulé ; sinon un message à afficher. */
  error: string | null;
  /** Distingue une annulation volontaire d'un vrai échec, pour ne pas afficher d'alerte d'erreur inutile. */
  cancelled: boolean;
}

/**
 * Ouvre la pellicule, demande la permission si nécessaire, et upload
 * l'image choisie vers `user-uploads/{uid}/{folder}/...`. `square: true`
 * force un cadrage carré (avatars) ; sinon l'utilisateur cadre librement.
 */
export async function pickAndUploadImage(folder: UploadFolder, options?: { square?: boolean }): Promise<PickAndUploadResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      url: null,
      cancelled: false,
      error: "Accès à tes photos refusé. Autorise AFROBACK dans les réglages de ton téléphone pour ajouter une image.",
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    base64: true,
    quality: 0.6,
    allowsEditing: true,
    aspect: options?.square ? [1, 1] : undefined,
  });

  if (result.canceled) {
    return { url: null, cancelled: true, error: null };
  }

  const asset = result.assets[0];
  if (!asset?.base64) {
    return { url: null, cancelled: false, error: "Impossible de lire cette image, réessaie avec une autre." };
  }

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    return { url: null, cancelled: false, error: 'Aucune session active.' };
  }

  const bytes = base64ToUint8Array(asset.base64);
  const isPng = asset.mimeType === 'image/png';
  const ext = isPng ? 'png' : 'jpg';
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('user-uploads').upload(path, bytes, {
    contentType: asset.mimeType ?? 'image/jpeg',
    upsert: false,
  });
  if (uploadError) {
    return { url: null, cancelled: false, error: `Échec de l'envoi de l'image : ${uploadError.message}` };
  }

  const { data: publicUrlData } = supabase.storage.from('user-uploads').getPublicUrl(path);
  return { url: publicUrlData.publicUrl, cancelled: false, error: null };
}
