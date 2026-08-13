import { NextResponse, type NextRequest } from 'next/server';
import { performDecouvertePhotoUpload } from '@/lib/uploadDecouverteMedia';

/** Route Handler pour l'upload de la photo d'une fiche Découverte — voir lib/uploadMedia.ts pour la raison (pas une Server Action). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Requête invalide (formulaire illisible).' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }

  const result = await performDecouvertePhotoUpload(slug, file);
  return NextResponse.json(result, { status: result.error ? 400 : 200 });
}
