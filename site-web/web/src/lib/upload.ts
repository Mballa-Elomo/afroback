'use client';

import { supabase } from './supabase';
import { tc } from './lang';

/** Envoi d'une photo dans le même espace que l'app (bucket user-uploads, dossier par usage). */
export type UploadFolder = 'posts' | 'products' | 'avatars-communaute' | 'avatars-marche';

export async function uploadImage(file: File, folder: UploadFolder): Promise<{ url?: string; error?: string }> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return { error: tc('Image JPG, PNG ou WebP uniquement.', 'JPG, PNG or WebP images only.') };
  if (file.size > 5_000_000) return { error: tc('Image trop lourde (5 Mo maximum).', 'Image too large (5 MB maximum).') };
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid) return { error: tc('Connecte-toi pour envoyer une photo.', 'Sign in to upload a photo.') };
  const ext = file.type.split('/')[1];
  const path = `${uid}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('user-uploads').upload(path, file, { contentType: file.type });
  if (error) return { error: tc("La photo n'a pas pu être envoyée.", 'The photo could not be uploaded.') };
  return { url: supabase.storage.from('user-uploads').getPublicUrl(path).data.publicUrl };
}
