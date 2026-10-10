import { NextResponse, type NextRequest } from 'next/server';
import { createSessionClient } from '@/lib/supabase/server';

/**
 * Déconnexion. POST : bouton du menu (formulaire). GET : lien simple de la page
 * « Accès refusé ». Une requête de préchargement de Next.js (en-têtes RSC /
 * prefetch) ne doit JAMAIS déconnecter : c'était la cause du renvoi vers
 * /login à chaque clic d'onglet (bug trouvé le 2026-10-10).
 */
async function deconnecter(request: NextRequest) {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', request.url), 303);
}

export async function POST(request: NextRequest) {
  return deconnecter(request);
}

export async function GET(request: NextRequest) {
  const prechargement =
    request.headers.has('next-router-prefetch') ||
    request.headers.get('rsc') === '1' ||
    request.headers.get('purpose') === 'prefetch' ||
    request.nextUrl.searchParams.has('_rsc');
  if (prechargement) return new NextResponse(null, { status: 204 });
  return deconnecter(request);
}
