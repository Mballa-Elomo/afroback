import { NextResponse, type NextRequest } from 'next/server';
import { isVideoLang, performChapterVideoUpload } from '@/lib/uploadMedia';

/** Route Handler pour l'upload réel d'une vidéo de chapitre — voir lib/uploadMedia.ts. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Requête invalide (formulaire illisible).' }, { status: 400 });
  }

  const chapterNumRaw = formData.get('chapterNum');
  const lang = formData.get('lang');
  const file = formData.get('file');

  const chapterNum = Number(chapterNumRaw);
  if (!Number.isInteger(chapterNum)) {
    return NextResponse.json({ error: 'Chapitre invalide.' }, { status: 400 });
  }
  if (!isVideoLang(lang)) {
    return NextResponse.json({ error: 'Langue invalide.' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }

  const result = await performChapterVideoUpload(slug, chapterNum, lang, file);
  return NextResponse.json(result, { status: result.error ? 400 : 200 });
}
