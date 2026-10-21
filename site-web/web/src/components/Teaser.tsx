'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { analyserLienVideo, miniature, urlIntegration } from '@/lib/lienVideo';
import { useLang } from '@/lib/lang-client';
import type { ContentType } from '@/lib/types';

/**
 * Teaser d'un contenu (2026-10-17) : vidéo d'introduction de 30 s, première
 * vidéo de la fiche, visible par tous. Colonne `teaser` =
 * { fr: { paysage, vertical }, en: { … } } (supabase/schema-teasers.sql).
 * Le site préfère le paysage dans la langue choisie, puis le vertical, puis
 * le français. Rien n'est affiché tant qu'aucun teaser n'existe.
 */

type Format = 'paysage' | 'vertical';
type Teaser = Partial<Record<'fr' | 'en', Partial<Record<Format, string>>>>;
const TABLE: Record<ContentType, string> = { heros: 'heros', mythe: 'mythes', decouverte: 'decouverte_items' };

/** Nom court pour le bouton : « Ngan Medza, le serpent… » → « Ngan Medza ». */
function nomCourt(titre: string): string {
  return titre.replace(/[«»"“”]/g, '').split(/[,:!?]/)[0].trim();
}

/** « de » français avec élision et contraction : d'Abel, des Sao, du Roi, de la Reine. */
function deFr(nom: string): string {
  if (/^les\s/i.test(nom)) return `des ${nom.slice(4)}`;
  if (/^le\s/i.test(nom)) return `du ${nom.slice(3)}`;
  if (/^la\s/i.test(nom)) return `de la ${nom.slice(3)}`;
  if (/^l['’]/i.test(nom)) return `de l’${nom.slice(2)}`;
  if (/^[aeiouyàâäéèêëîïôöùûü]/i.test(nom)) return `d’${nom}`;
  return `de ${nom}`;
}

/** Libellé du bouton placé juste après le teaser : « Regarder la légende de Ngan Medza », ou « Lire… » sans vidéo. */
export function libelleCtaTeaser(type: ContentType, titre: string, aVideo: boolean, en: boolean): string {
  const nom = nomCourt(titre);
  if (type === 'decouverte') return en ? `Watch: ${nom}` : `Regarder : ${nom}`;
  const quoi = type === 'mythe' ? (en ? 'legend' : 'la légende') : en ? 'story' : 'l’histoire';
  if (en) return `${aVideo ? 'Watch' : 'Read'} the ${quoi} of ${nom}`;
  return `${aVideo ? 'Regarder' : 'Lire'} ${quoi} ${deFr(nom)}`;
}

function choisir(t: Teaser, lang: 'fr' | 'en'): { url: string; format: Format } | null {
  const ordre: ['fr' | 'en', Format][] = [
    [lang, 'paysage'],
    [lang, 'vertical'],
    ['fr', 'paysage'],
    ['fr', 'vertical'],
  ];
  for (const [l, f] of ordre) {
    const url = t[l]?.[f];
    if (url) return { url, format: f };
  }
  return null;
}

export function Teaser({
  type,
  slug,
  poster,
  cta,
}: {
  type: ContentType;
  slug: string;
  poster?: string | null;
  /** Bouton juste après le teaser, qui mène à la vidéo (ou à la lecture) du contenu. */
  cta?: { href: string; label: string; video: boolean };
}) {
  const { lang, tr } = useLang();
  const [teaser, setTeaser] = useState<Teaser | null>(null);
  const [lance, setLance] = useState<string | null>(null);

  useEffect(() => {
    let vivant = true;
    supabase
      .from(TABLE[type])
      .select('teaser')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (vivant) setTeaser(((data as { teaser?: Teaser } | null)?.teaser ?? {}) as Teaser);
      });
    return () => {
      vivant = false;
    };
  }, [type, slug]);

  const choix = teaser ? choisir(teaser, lang === 'en' ? 'en' : 'fr') : null;
  if (!choix) return null;

  const lien = analyserLienVideo(choix.url);
  if (!lien) return null;
  const integre = lien.type !== 'fichier';
  const vignette = (integre ? miniature(lien) : null) || poster || null;
  const enLecture = lance === choix.url;
  const cadre =
    choix.format === 'vertical' ? 'mx-auto aspect-[9/16] w-full max-w-[min(100%,calc(70vh*9/16))]' : 'aspect-video w-full';

  return (
    <section className="mx-auto max-w-[1200px] px-5 pt-8 md:px-10 md:pt-10">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold">{tr('Bande-annonce', 'Trailer')}</p>
      <div className={`relative overflow-hidden rounded-2xl bg-black ring-1 ring-gold/20 ${cadre}`}>
        {enLecture ? (
          integre ? (
            <iframe
              src={urlIntegration(lien, true) ?? ''}
              title={tr('Bande-annonce', 'Trailer')}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <video src={choix.url} className="absolute inset-0 h-full w-full" controls autoPlay playsInline controlsList="nodownload" />
          )
        ) : (
          <button
            type="button"
            onClick={() => setLance(choix.url)}
            className="group absolute inset-0 grid place-items-center bg-cover bg-center"
            style={vignette ? { backgroundImage: `url(${vignette})` } : undefined}
            aria-label={tr('Lire la bande-annonce', 'Play the trailer')}
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-gold text-2xl text-ink shadow-[0_10px_30px_rgba(240,195,107,0.45)] transition group-hover:scale-110">
              ▶
            </span>
            <span className="absolute bottom-4 left-5 text-sm font-bold text-ivory">{tr('30 s pour entrer dans l’histoire', '30 seconds to step into the story')}</span>
          </button>
        )}
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="group relative mt-5 flex w-full sm:inline-flex items-center gap-4 overflow-hidden rounded-full bg-gradient-to-r from-gold-pale via-gold to-[#d99a3d] py-2.5 pl-2.5 pr-6 text-ink shadow-[0_12px_36px_rgba(240,195,107,0.35)] ring-1 ring-gold-pale/60 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(240,195,107,0.5)] sm:w-auto sm:max-w-full"
        >
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/35 opacity-0 blur-md transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100" />
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-gold shadow-inner transition group-hover:scale-105">
            {cta.video ? (
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5L8 5.5z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></svg>
            )}
          </span>
          <span className="relative min-w-0 flex-1 truncate text-base font-extrabold md:text-lg">{cta.label}</span>
          <span className="relative text-xl font-black transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
        </Link>
      )}
    </section>
  );
}
