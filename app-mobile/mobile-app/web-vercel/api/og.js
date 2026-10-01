// =====================================================================
// AFROBACK — Image d'aperçu de partage 1200×630 (2026-09-30)
// Photo du contenu en fond, logo AFROBACK, catégorie, titre doré et
// description. Utilisée par les cartes d'aperçu WhatsApp / Facebook.
// =====================================================================
import { ImageResponse } from '@vercel/og';
import { loadContent } from './_content.js';


// Élément au format attendu par le moteur de rendu (sans JSX).
const h = (type, style, ...all) => {
  const children = all.filter((c) => c !== null && c !== undefined && c !== false);
  return { type, props: { style: { display: 'flex', ...style }, children: children.length <= 1 ? children[0] : children } };
};
const img = (src, style) => ({ type: 'img', props: { src, style } });

async function reachable(src) {
  if (!src) return false;
  try {
    const r = await fetch(src, { method: 'HEAD' });
    return r.ok && (r.headers.get('content-type') || '').startsWith('image/');
  } catch {
    return false;
  }
}

// 900×473 (au lieu de 1200×630) : image plus légère, mieux acceptée par WhatsApp.
const SCALE = 0.75;
const K = (n) => Math.round(n * SCALE);

export async function GET(req) {
  const url = new URL(req.url);
  const c = await loadContent(url.searchParams.get('code')).catch(() => null);
  const logo = `${url.origin}/email/afroback-logo.png`;
  const titre = c?.titre ?? 'AFROBACK';
  const description = c?.description ?? 'Retour aux origines : les héros, mythes et trésors du patrimoine africain.';
  const photo = c && (await reachable(c.image)) ? c.image : null;
  // Titre long : police plus petite et description plus courte, pour ne jamais déborder sur le bouton.
  const long = titre.length > 26;
  const veryLong = titre.length > 44;
  const maxDesc = veryLong ? 70 : long ? 95 : 150;
  const desc = description.length > maxDesc ? `${description.slice(0, description.lastIndexOf(' ', maxDesc))}…` : description;

  const tree = h(
    'div',
    { width: '100%', height: '100%', position: 'relative', backgroundColor: '#0B0906', fontFamily: 'sans-serif' },
    photo ? img(photo, { position: 'absolute', right: K(0), top: K(0), width: K(720), height: K(630), objectFit: 'cover' }) : null,
    h('div', {
      position: 'absolute',
      left: K(0),
      top: K(0),
      width: K(1200),
      height: K(630),
      backgroundImage: photo
        ? 'linear-gradient(90deg, #0B0906 0%, #0B0906 38%, rgba(11,9,6,0.75) 58%, rgba(11,9,6,0.15) 100%)'
        : 'radial-gradient(circle at 70% 40%, #3A2410 0%, #0B0906 70%)',
    }),
    h(
      'div',
      { position: 'absolute', left: K(64), top: K(56), bottom: K(56), width: K(640), flexDirection: 'column', justifyContent: 'space-between' },
      h(
        'div',
        { alignItems: 'center' },
        img(logo, { width: K(84), height: K(84), borderRadius: K(42) }),
        h('div', { marginLeft: K(20), fontSize: K(38), fontWeight: 700, letterSpacing: K(6), color: '#F0C36B' }, 'AFROBACK')
      ),
      h(
        'div',
        { flexDirection: 'column' },
        c ? h('div', { fontSize: K(22), letterSpacing: K(3), color: '#C99A5B', marginBottom: K(14) }, c.kicker) : null,
        h('div', { fontSize: veryLong ? K(46) : long ? K(54) : K(68), fontWeight: 700, lineHeight: 1.05, color: '#FFF4E0' }, titre),
        h('div', { fontSize: K(27), lineHeight: 1.35, color: 'rgba(255,244,224,0.82)', marginTop: K(18), maxHeight: K(110), overflow: 'hidden' }, desc)
      ),
      h(
        'div',
        { alignItems: 'center' },
        h('div', { padding: `${K(12)}px ${K(26)}px`, borderRadius: K(999), backgroundColor: '#F0C36B', color: '#1a1109', fontSize: K(24), fontWeight: 700 }, 'Lire sur AFROBACK  →'),
        h('div', { marginLeft: K(22), fontSize: K(22), color: '#8C7B67' }, 'Retour aux origines')
      )
    )
  );

  return new ImageResponse(tree, {
    width: K(1200),
    height: K(630),
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
  });
}
