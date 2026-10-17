'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ImageGalerie } from '@/lib/galerie';
import type { Lang } from '@/lib/content';
import { useLang } from '@/lib/lang-client';

/**
 * Galerie du récit, à côté du texte.
 * - Ordinateur large : colonne fixe à droite, défilement lent et continu du
 *   haut vers le bas, arrêté au survol ; immobile (et défilable à la main)
 *   si l'utilisateur a demandé moins d'animations.
 * - Écrans plus étroits : bandeau horizontal à faire glisser, sans animation.
 * Un clic ouvre l'image en grand avec sa légende et son crédit.
 */
export function Galerie({ images, lang, variante }: { images: ImageGalerie[]; lang: Lang; variante: 'colonne' | 'bande' }) {
  const [ouverte, setOuverte] = useState<number | null>(null);
  if (images.length === 0) return null;

  const legende = (img: ImageGalerie) => (lang === 'en' && img.legende_en) || img.legende_fr;

  if (variante === 'bande') {
    return (
      <>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {images.map((img, i) => (
            <button key={img.id} onClick={() => setOuverte(i)} className="w-40 shrink-0 snap-start text-left">
              <Vignette img={img} legende={legende(img)} cadre="aspect-[4/5]" />
            </button>
          ))}
        </div>
        {ouverte !== null && <Visionneuse images={images} index={ouverte} lang={lang} onIndex={setOuverte} />}
      </>
    );
  }

  // Liste doublée : la piste descend de la moitié de sa hauteur puis reboucle sans saut.
  const anime = images.length >= 3;
  const piste = anime ? [...images, ...images] : images;
  return (
    <>
      <div className="galerie-masque relative h-[calc(100vh-9rem)] overflow-hidden motion-reduce:overflow-y-auto">
        <ul
          className={`flex flex-col gap-5 hover:[animation-play-state:paused] ${anime ? 'animate-galerie' : ''}`}
          style={anime ? { animationDuration: `${images.length * 9}s` } : undefined}
        >
          {piste.map((img, i) => {
            const copie = i >= images.length;
            return (
              <li key={`${i}-${img.id}`} aria-hidden={copie || undefined} className={copie ? 'motion-reduce:hidden' : ''}>
                <button onClick={() => setOuverte(i % images.length)} tabIndex={copie ? -1 : 0} className="block w-full text-left">
                  <Vignette img={img} legende={legende(img)} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {ouverte !== null && <Visionneuse images={images} index={ouverte} lang={lang} onIndex={setOuverte} />}
    </>
  );
}

function Vignette({ img, legende, cadre = '' }: { img: ImageGalerie; legende: string; cadre?: string }) {
  return (
    <figure className="group">
      <div className="relative overflow-hidden rounded-lg border border-gold/15 bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt={legende} loading="lazy" className={`w-full object-cover transition duration-500 group-hover:scale-[1.04] ${cadre}`} />
        <Badge nature={img.nature} className="absolute left-2 top-2" />
      </div>
      <figcaption className="mt-2 line-clamp-2 text-xs leading-snug text-body">{legende}</figcaption>
    </figure>
  );
}

function Badge({ nature, className = '' }: { nature: ImageGalerie['nature']; className?: string }) {
  const { tr } = useLang();
  return (
    <span className={`rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-gold backdrop-blur ${className}`}>
      {nature === 'archive' ? tr('ARCHIVE', 'ARCHIVE') : tr('ILLUSTRATION', 'ILLUSTRATION')}
    </span>
  );
}

function Visionneuse({ images, index, lang, onIndex }: { images: ImageGalerie[]; index: number; lang: Lang; onIndex: (i: number | null) => void }) {
  const { tr } = useLang();
  const img = images[index];
  const n = images.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onIndex(null);
      if (e.key === 'ArrowRight') onIndex((index + 1) % n);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + n) % n);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, n, onIndex]);

  // Rendue dans <body> : la colonne collante crée son propre empilement, sous la barre du haut.
  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/95 p-4" onClick={() => onIndex(null)}>
      <figure className="flex max-h-full max-w-4xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt={(lang === 'en' && img.legende_en) || img.legende_fr} className="max-h-[75vh] w-auto rounded-lg object-contain" />
        <figcaption className="mt-4 max-w-2xl text-center">
          <Badge nature={img.nature} />
          <p className="mt-2 text-sm text-text">{(lang === 'en' && img.legende_en) || img.legende_fr}</p>
          <p className="mt-1 text-xs text-muted">
            {img.nature === 'illustration' ? tr('Illustration créée pour AFROBACK', 'Illustration made for AFROBACK') : img.credit}
            {img.source_url && (
              <>
                {' · '}
                <a href={img.source_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                  {tr('Source', 'Source')}
                </a>
              </>
            )}
          </p>
        </figcaption>
      </figure>
      {n > 1 && (
        <>
          <button aria-label={tr('Image précédente', 'Previous image')} onClick={(e) => (e.stopPropagation(), onIndex((index - 1 + n) % n))} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-surface/80 px-4 py-3 text-xl text-gold">
            ‹
          </button>
          <button aria-label={tr('Image suivante', 'Next image')} onClick={(e) => (e.stopPropagation(), onIndex((index + 1) % n))} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-surface/80 px-4 py-3 text-xl text-gold">
            ›
          </button>
        </>
      )}
      <button aria-label={tr('Fermer', 'Close')} onClick={() => onIndex(null)} className="absolute right-4 top-4 rounded-full bg-surface/80 px-3 py-1.5 text-sm font-bold text-gold">
        ✕
      </button>
    </div>,
    document.body,
  );
}
