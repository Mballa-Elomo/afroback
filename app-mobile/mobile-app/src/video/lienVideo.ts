/**
 * Liens vidéo YouTube / Vimeo (décision de Yannick le 2026-10-11 : on colle
 * le lien de la vidéo au lieu d'envoyer le fichier). Copie identique dans
 * l'app (src/video/lienVideo.ts) et le site (src/lib/lienVideo.ts) : trois
 * projets séparés, garder les trois fichiers alignés.
 *
 * Les anciennes vidéos envoyées en fichier (adresse Supabase) restent
 * reconnues comme « fichier » et lues par le lecteur classique.
 */

export type LienVideo =
  | { type: 'youtube'; id: string; debut: number }
  | { type: 'vimeo'; id: string; hash: string | null }
  | { type: 'fichier'; url: string };

const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

function secondes(t: string | null): number {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
}

export function analyserLienVideo(brut: string | null | undefined): LienVideo | null {
  const texte = String(brut ?? '').trim();
  if (!texte) return null;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(texte) ? texte : `https://${texte}`);
  } catch {
    return null;
  }
  const hote = u.hostname.toLowerCase().replace(/^(www\.|m\.|music\.)/, '');
  const morceaux = u.pathname.split('/').filter(Boolean);

  if (hote === 'youtu.be' || hote === 'youtube.com' || hote === 'youtube-nocookie.com') {
    let id: string | null = null;
    if (hote === 'youtu.be') id = morceaux[0] ?? null;
    else if (morceaux[0] === 'watch') id = u.searchParams.get('v');
    else if (['embed', 'shorts', 'live', 'v'].includes(morceaux[0] ?? '')) id = morceaux[1] ?? null;
    if (!id || !ID_YOUTUBE.test(id)) return null;
    return { type: 'youtube', id, debut: secondes(u.searchParams.get('t') ?? u.searchParams.get('start')) };
  }

  if (hote === 'vimeo.com' || hote === 'player.vimeo.com') {
    const nums = morceaux.filter((m) => /^\d{5,}$/.test(m));
    const id = nums[0];
    if (!id) return null;
    const apres = morceaux[morceaux.indexOf(id) + 1];
    const hash = u.searchParams.get('h') ?? (apres && /^[a-f0-9]{6,}$/i.test(apres) ? apres : null);
    return { type: 'vimeo', id, hash };
  }

  if (u.protocol === 'https:' || u.protocol === 'http:') return { type: 'fichier', url: u.toString() };
  return null;
}

/** Adresse propre à enregistrer en base. */
export function lienCanonique(l: LienVideo): string {
  if (l.type === 'youtube') return `https://www.youtube.com/watch?v=${l.id}${l.debut ? `&t=${l.debut}s` : ''}`;
  if (l.type === 'vimeo') return `https://vimeo.com/${l.id}${l.hash ? `/${l.hash}` : ''}`;
  return l.url;
}

/** Adresse du lecteur intégré (YouTube sans cookies publicitaires, Vimeo sans titre ni auteur). */
export function urlIntegration(l: LienVideo, autoplay = false): string | null {
  if (l.type === 'youtube') {
    const p = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1', iv_load_policy: '3' });
    if (l.debut) p.set('start', String(l.debut));
    if (autoplay) p.set('autoplay', '1');
    return `https://www.youtube-nocookie.com/embed/${l.id}?${p}`;
  }
  if (l.type === 'vimeo') {
    const p = new URLSearchParams({ title: '0', byline: '0', portrait: '0', dnt: '1' });
    if (l.hash) p.set('h', l.hash);
    if (autoplay) p.set('autoplay', '1');
    return `https://player.vimeo.com/video/${l.id}?${p}`;
  }
  return null;
}

/** Miniature (YouTube uniquement ; Vimeo n'en fournit pas sans appel à son API). */
export function miniature(l: LienVideo): string | null {
  return l.type === 'youtube' ? `https://i.ytimg.com/vi/${l.id}/hqdefault.jpg` : null;
}
