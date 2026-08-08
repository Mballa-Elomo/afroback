import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Rafraîchit la session de connexion et bloque l'accès aux pages protégées
 * sans session valide — pattern standard @supabase/ssr pour Next.js App
 * Router. Ne vérifie QUE la présence d'une session Supabase Auth valide ici
 * (rapide, pas d'appel base) ; la vérification "cet email est bien dans
 * admin_users" se fait ensuite dans chaque page protégée via
 * `lib/auth.ts#requireAdmin()`, qui a besoin du client service_role — pas
 * disponible/souhaitable dans le middleware (exécuté sur beaucoup de
 * requêtes, y compris les assets).
 *
 * Bug réel corrigé le 2026-08-06 : un upload audio réel (MediaUploadSlot,
 * fiche héros) échouait systématiquement avec `TimeoutError: signal timed
 * out` côté navigateur, suivi de `Unexpected end of form` côté serveur
 * (busboy, utilisé en interne par Next.js pour parser le corps multipart
 * des Server Actions — voir node_modules/next/dist/compiled/busboy — lève
 * cette erreur quand le flux s'arrête avant la frontière de fin). Les deux
 * erreurs à la suite indiquent la même requête : la connexion d'upload a
 * été coupée avant la fin de l'envoi du fichier.
 *
 * Cause la plus probable, faute de pouvoir reproduire dans ce workspace
 * (pas de clé service_role ici, donc pas de vrai lancement possible) :
 * TOUTE requête non-statique passe par ce proxy AVANT d'atteindre le
 * handler de la Server Action — y compris la requête POST multipart d'un
 * upload, dont le corps (le fichier) est encore en train d'arriver sur le
 * réseau. `supabase.auth.getUser()` ci-dessous fait un aller-retour réseau
 * (vers Supabase Auth) qui retarde d'autant le moment où Next.js commence à
 * lire/traiter ce corps. Si ce délai est trop long, la connexion d'upload
 * (navigateur → serveur Next.js) est abandonnée avant que le fichier soit
 * entièrement reçu.
 *
 * Correctif : ne PAS faire cet aller-retour réseau pour les requêtes de
 * Server Action (détectées via l'en-tête `next-action`, présent sur TOUTE
 * requête de ce type — voir `ACTION_HEADER` dans
 * node_modules/next/dist/client/components/app-router-headers.js). Ce n'est
 * pas un trou de sécurité : chaque Server Action (`saveMetadata`,
 * `uploadMedia`, `uploadChapterVideo`...) appelle déjà `requireAdmin()` en
 * tout début d'exécution, qui refait sa propre vérification complète
 * (session + présence dans `admin_users`) — la vérification du proxy pour
 * ces requêtes était de toute façon redondante, seule la protection des
 * pages (navigation GET) a besoin du rafraîchissement/redirect ci-dessous.
 *
 * Lenteur corrigée le 2026-08-06 : Yannick a signalé un back-office lent
 * (un log réel montrait 2,1s passées dans ce seul fichier, sur une
 * navigation totale de 4,4s). Cause : `supabase.auth.getUser()` fait TOUJOURS
 * un aller-retour réseau vers le serveur Supabase Auth pour revalider le
 * jeton, à chaque navigation de page. Remplacé par `supabase.auth.getClaims()`
 * — recommandé par le SDK lui-même ("Prefer this method over getUser()",
 * voir node_modules/@supabase/auth-js/dist/module/GoTrueClient.js) : vérifie
 * la signature du JWT localement (WebCrypto) si le projet Supabase signe ses
 * jetons avec une clé asymétrique, ce qui est le cas ici (vérifié via
 * `GET https://<projet>.supabase.co/auth/v1/.well-known/jwks.json`, clé
 * ES256). La clé publique est mise en cache 10 minutes, partagée par tout le
 * process Node (donc par toutes les requêtes suivantes tant que le serveur
 * de dev tourne) — plus d'aller-retour réseau par navigation après le tout
 * premier appel. Compromis assumé (validé par Yannick le 2026-08-06) : une
 * révocation de session (déconnexion forcée, bannissement) ne serait plus
 * détectée instantanément mais seulement à l'expiration du jeton d'accès
 * (1h par défaut chez Supabase) — acceptable pour un outil interne à un seul
 * utilisateur. Voir aussi `lib/auth.ts#requireAdmin()`, qui fait le même
 * remplacement pour la même raison (deuxième aller-retour réseau en cascade,
 * lui aussi supprimé).
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (request.headers.has('next-action')) {
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Config manquante : ne bloque pas le rendu de la page d'erreur Next.js,
    // mais aucune route protégée ne sera vraiment utilisable sans ça.
    return response;
  }

  let refreshedResponse = response;
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        refreshedResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) refreshedResponse.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  if (!claims && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  if (claims && isLoginPage) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    return NextResponse.redirect(homeUrl);
  }

  return refreshedResponse;
}
