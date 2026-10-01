// =====================================================================
// AFROBACK — Lien court de partage : /s/<code>  (2026-09-30)
//
// Pour WhatsApp, Facebook, Messenger… (qui lisent la page sans exécuter
// l'app) : renvoie une carte d'aperçu (titre, description, image générée
// avec la photo + le logo AFROBACK). Pour la personne qui clique :
// redirection immédiate vers la fiche du contenu dans l'app.
// =====================================================================
import { escapeHtml, loadContent } from './_content.js';


export async function GET(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get('code') || url.pathname.split('/').pop();
  const c = await loadContent(code).catch(() => null);

  if (!c) {
    return Response.redirect(`${origin}/`, 302);
  }

  const target = `${origin}${c.path}`;
  const shareUrl = `${origin}/s/${c.code}`;
  const image = `${origin}/api/og?code=${encodeURIComponent(c.code)}`;
  const title = `${c.titre} · AFROBACK`;
  const e = escapeHtml;

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${e(c.description)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="AFROBACK">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${e(c.accroche)}">
<meta property="og:description" content="${e(c.description)}">
<meta property="og:url" content="${e(shareUrl)}">
<meta property="og:image" content="${e(image)}">
<meta property="og:image:width" content="900">
<meta property="og:image:height" content="473">
<meta property="og:image:alt" content="${e(c.titre)} sur AFROBACK">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(c.accroche)}">
<meta name="twitter:description" content="${e(c.description)}">
<meta name="twitter:image" content="${e(image)}">
<meta name="theme-color" content="#0B0906">
<link rel="icon" href="/favicon.ico">
<meta http-equiv="refresh" content="0; url=${e(target)}">
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0B0906;color:#EDE3D4;font-family:Arial,Helvetica,sans-serif;text-align:center;padding:24px;box-sizing:border-box}
  img{width:84px;height:84px}
  h1{font-family:Georgia,serif;color:#F7D98B;font-size:24px;margin:16px 0 8px}
  a{display:inline-block;margin-top:18px;padding:13px 22px;border-radius:999px;background:#F0C36B;color:#1a1109;font-weight:bold;text-decoration:none}
</style>
</head>
<body>
<div>
  <img src="/email/afroback-logo.png" alt="AFROBACK">
  <h1>${e(c.titre)}</h1>
  <p>${e(c.description)}</p>
  <a href="${e(target)}">Ouvrir sur AFROBACK</a>
</div>
<script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
