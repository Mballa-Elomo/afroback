import { NextResponse, type NextRequest } from 'next/server';
import { performMythologieChapterVideoUpload } from '@/lib/uploadMythologieMedia';

/** Route Handler pour l'upload de la vidéo d'un chapitre de mythe — mêmes raisons que app/api/heros/[slug]/chapter-video/route.ts. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Requête invalide (formulaire illisible).' }, { status: 400 });
  }

  const chapterNum = Number(formData.get('chapterNum'));
  const lang = String(formData.get('lang') ?? '');
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }

  const result = await performMythologieChapterVideoUpload(slug, chapterNum, lang, file);
  return NextResponse.json(result, { status: result.error ? 400 : 200 });
}
