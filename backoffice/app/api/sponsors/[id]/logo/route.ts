import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { BUCKET } from '@/lib/uploadMedia';

/** Envoi du logo d'un sponsor (Route Handler, comme les autres envois de médias : voir lib/uploadMedia.ts). */
// Pas de SVG : un SVG peut contenir du script.
const TYPES: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
const MAX = 2 * 1024 * 1024;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Sponsor invalide.' }, { status: 400 });

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get('file');
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Logo au format PNG, JPG ou WebP.' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'Logo trop lourd (2 Mo maximum).' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const chemin = `sponsors/${id}-${Date.now()}.${ext}`;
  const { error: e1 } = await supabase.storage.from(BUCKET).upload(chemin, file, { upsert: true, contentType: file.type });
  if (e1) return NextResponse.json({ error: `Envoi impossible : ${e1.message}` }, { status: 400 });
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(chemin);
  const { data, error: e2 } = await supabase.from('sponsors').update({ logo_url: pub.publicUrl }).eq('id', id).select('nom');
  if (e2 || !data?.length) return NextResponse.json({ error: `Enregistrement impossible : ${e2?.message ?? 'sponsor introuvable'}` }, { status: 400 });

  await logActivity(admin.email, `Sponsors : logo de « ${data[0].nom} » mis à jour`);
  revalidatePath(`/sponsors/${id}`);
  revalidatePath('/sponsors');
  return NextResponse.json({ error: null, url: pub.publicUrl });
}
