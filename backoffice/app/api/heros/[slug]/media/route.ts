import { NextResponse, type NextRequest } from 'next/server';
import { isMediaSlot, performMediaUpload } from '@/lib/uploadMedia';

/**
 * Route Handler (pas une Server Action) pour l'upload réel d'un média héros
 * — voir lib/uploadMedia.ts pour la raison de ce choix. `request.formData()`
 * utilise le parseur multipart standard de la Fetch API, indépendant du
 * mécanisme spécifique aux Server Actions.
 */
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

  if (!isMediaSlot(kind)) {
    return NextResponse.json({ error: 'Type de média invalide.' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }

  const result = await performMediaUpload(slug, kind, file);
  return NextResponse.json(result, { status: result.error ? 400 : 200 });
}
