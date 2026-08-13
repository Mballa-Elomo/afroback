import { NextResponse, type NextRequest } from 'next/server';
import { isMythologieMediaSlot, performMythologieMediaUpload } from '@/lib/uploadMythologieMedia';

/** Route Handler pour l'upload d'un média (photo/audioFr/audioEn) d'un mythe — voir lib/uploadMedia.ts pour la raison (pas une Server Action). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Requête invalide (formulaire illisible).' }, { status: 400 });
  }

  const kind = formData.get('kind');
  const file = formData.get('file');

  if (!isMythologieMediaSlot(kind)) {
    return NextResponse.json({ error: 'Type de média invalide.' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }

  const result = await performMythologieMediaUpload(slug, kind, file);
  return NextResponse.json(result, { status: result.error ? 400 : 200 });
}
