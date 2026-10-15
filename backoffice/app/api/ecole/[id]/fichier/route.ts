import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { BUCKET } from '@/lib/uploadMedia';

/**
 * Envoi d'un fichier pour une leçon de l'École des Héros (Route Handler,
 * exclu du proxy comme les autres envois : voir proxy.ts) :
 * - `type=audio_fr` / `audio_en` : narration MP3, enregistrée sur la leçon ;
 * - `type=planche` : image d'une planche de BD, renvoie juste son adresse
 *   (la liste des planches est enregistrée ensuite par l'éditeur).
 */
const AUDIO: Record<string, string> = { 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a' };
const IMAGE: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Leçon invalide.' }, { status: 400 });

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Requête invalide (formulaire illisible).' }, { status: 400 });
  }
  const type = String(fd.get('type') ?? '');
  const file = fd.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });

  const estAudio = type === 'audio_fr' || type === 'audio_en';
  const ext = estAudio ? AUDIO[file.type] : type === 'planche' ? IMAGE[file.type] : undefined;
  if (!ext) return NextResponse.json({ error: estAudio ? 'Narration au format MP3 ou M4A.' : 'Image au format PNG, JPG ou WebP.' }, { status: 400 });
  const max = estAudio ? 40 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > max) return NextResponse.json({ error: estAudio ? 'Fichier audio trop lourd (40 Mo maximum).' : 'Image trop lourde (5 Mo maximum).' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const chemin = `ecole/${id}/${type}-${Date.now()}.${ext}`;
  const { error: e1 } = await supabase.storage.from(BUCKET).upload(chemin, file, { upsert: true, contentType: file.type });
  if (e1) return NextResponse.json({ error: `Envoi impossible : ${e1.message}` }, { status: 400 });
  const url = supabase.storage.from(BUCKET).getPublicUrl(chemin).data.publicUrl;

  if (estAudio) {
    const colonne = type === 'audio_en' ? 'narration_audio_url_en' : 'narration_audio_url';
    const { error: e2 } = await supabase.from('ecole_lecons').update({ [colonne]: url, updated_at: new Date().toISOString() }).eq('id', id);
    if (e2) {
      const msg = /narration_audio_url_en/.test(e2.message) ? 'Exécutez d’abord schema-ecole-medias.sql dans Supabase.' : `Enregistrement impossible : ${e2.message}`;
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    await logActivity(admin.email, `École des Héros : narration ${type === 'audio_en' ? 'EN' : 'FR'} envoyée (leçon ${id.slice(0, 8)})`);
    revalidatePath('/ecole-heros');
  }
  return NextResponse.json({ error: null, url });
}
