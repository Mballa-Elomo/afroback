import type { ContentType, Detail, RecitChapitre, VideoChapitre } from './types';

/**
 * Extraction des médias d'un contenu (récit, audio, vidéos), selon le type.
 * Même logique que l'application : vidéos par chapitre et par langue
 * (`videos.fr` / `videos.en`, avec repli sur les anciennes clés
 * `video_url_fr` / `video_url_en`).
 */

export type Lang = 'fr' | 'en';

const open = (d: Detail | null): Record<string, unknown> => (d && !d.verrouille ? (d as Record<string, unknown>) : {});
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const str = (v: unknown) => (typeof v === 'string' && v ? v : null);

export function contentId(d: Detail | null): string | null {
  return str(open(d).id);
}

export function chaptersOf(d: Detail | null, lang: Lang): RecitChapitre[] {
  const o = open(d);
  const en = arr<RecitChapitre>(o.recit_chapitres_en);
  const fr = arr<RecitChapitre>(o.recit_chapitres_fr);
  return lang === 'en' && en.length > 0 ? en : fr;
}

export function hasEnglish(d: Detail | null): boolean {
  return arr(open(d).recit_chapitres_en).length > 0;
}

export function audioOf(d: Detail | null, type: ContentType, lang: Lang): string | null {
  const o = open(d);
  if (type === 'heros') return lang === 'en' ? str(o.narration_audio_en_url) ?? str(o.narration_audio_fr_url) : str(o.narration_audio_fr_url);
  if (type === 'mythe') return lang === 'en' ? str(o.narration_audio_url_en) ?? str(o.narration_audio_url) : str(o.narration_audio_url);
  return null;
}

export interface VideoChapter {
  numero: number;
  titre: string;
  src: string;
  lang: Lang;
}

export function videosOf(d: Detail | null, type: ContentType, lang: Lang, fallbackTitle: string): VideoChapter[] {
  const o = open(d);
  const pick = (v: Record<string, string>, fr?: string | null, en?: string | null): { src: string; lang: Lang } | null => {
    const sFr = v.fr || fr || '';
    const sEn = v.en || en || '';
    if (lang === 'en' && sEn) return { src: sEn, lang: 'en' };
    if (sFr) return { src: sFr, lang: 'fr' };
    if (sEn) return { src: sEn, lang: 'en' };
    return null;
  };
  if (type === 'decouverte') {
    const p = pick((o.videos as Record<string, string>) ?? {});
    return p ? [{ numero: 1, titre: fallbackTitle, ...p }] : [];
  }
  const enTitles = lang === 'en' ? arr<RecitChapitre>(o.recit_chapitres_en) : [];
  return arr<VideoChapitre>(o.video_chapitres)
    .map((c) => {
      const p = pick(c.videos ?? {}, c.video_url_fr, c.video_url_en);
      const titre = enTitles.find((e) => e.numero === c.numero)?.titre || c.titre_chapitre || `${lang === 'en' ? 'Chapter' : 'Chapitre'} ${c.numero}`;
      return p ? { numero: c.numero, titre, ...p } : null;
    })
    .filter((c): c is VideoChapter => c !== null)
    .sort((a, b) => a.numero - b.numero);
}
