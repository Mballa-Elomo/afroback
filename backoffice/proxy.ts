import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf les assets statiques Next.js, les favicons, et
     * les Route Handlers d'upload de fichier (api/heros/.../media,
     * .../chapter-video ; api/decouverte/.../media, .../video ;
     * api/mythologie/.../media, .../chapter-video — mêmes routes ajoutées le
     * 2026-08-12 pour Découverte/Mythologie, même raison). Ces routes ne
     * sont pas des pages naviguées (pas besoin du rafraîchissement de
     * session / redirect vers /login géré ici) et font déjà leur propre
     * vérification complète via `requireAdmin()` dans lib/uploadMedia.ts
     * (et ses équivalents uploadDecouverteMedia.ts/uploadMythologieMedia.ts).
     * Les laisser passer par ce proxy reproduirait exactement le bug corrigé
     * le 2026-08-06 sur les Server Actions : le middleware touche/attend sur
     * la requête (cookies, appel réseau Supabase Auth) pendant qu'un corps
     * multipart volumineux est encore en train d'arriver, ce qui corrompt le
     * flux avant que `request.formData()` ne puisse le lire ("Requête
     * invalide (formulaire illisible)").
     */
    '/((?!_next/static|_next/image|favicon.ico|api/heros|api/decouverte|api/mythologie|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
