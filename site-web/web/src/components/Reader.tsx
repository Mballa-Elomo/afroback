'use client';

import { PresenteParSponsor } from './Sponsor';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContentType, Detail, Tile } from '@/lib/types';
import { chaptersOf, contentId, hasEnglish, type Lang } from '@/lib/content';
import { recordRead } from '@/lib/engagement';
import { TYPE_PATH } from '@/lib/catalogue';
import { useLiveDetail } from '@/lib/useLiveDetail';
import { useLang } from '@/lib/lang-client';
import { QuizEndCard } from './quiz';

/**
 * Lecteur du récit : colonne de lecture confortable, chapitres dans une
 * colonne à gauche (ordinateur), barre de progression, chapitre précédent /
 * suivant, FR / EN quand la traduction existe. La position de lecture est
 * gardée dans le navigateur. Une lecture est comptée à l'ouverture, comme
 * dans l'application.
 */
export function Reader({ type, tile, detail: initial, initialChapter }: { type: ContentType; tile: Tile; detail: Detail | null; initialChapter: number }) {
  const detail = useLiveDetail(type, tile.slug, initial);
  const { lang: siteLang, tr } = useLang();
  const [lang, setLang] = useState<Lang>(siteLang);
  useEffect(() => setLang(siteLang), [siteLang]);
  const chapters = useMemo(() => chaptersOf(detail, lang), [detail, lang]);
  const [index, setIndex] = useState(Math.min(Math.max(initialChapter - 1, 0), Math.max(chapters.length - 1, 0)));
  const [progress, setProgress] = useState(0);
  const counted = useRef(false);
  const storeKey = `afroback-lecture:${type}:${tile.slug}`;
  const base = `/${TYPE_PATH[type]}/${tile.slug}`;

  useEffect(() => {
    const id = contentId(detail);
    if (!counted.current && id) {
      counted.current = true;
      recordRead(type, id);
    }
  }, [detail, type]);

  // Reprise de lecture (même navigateur).
  useEffect(() => {
    if (initialChapter > 1) return;
    try {
      const saved = Number(localStorage.getItem(storeKey));
      if (saved > 0 && saved < chapters.length) setIndex(saved);
    } catch {
      /* stockage indisponible */
    }
  }, [storeKey, chapters.length, initialChapter]);

  useEffect(() => {
    try {
      localStorage.setItem(storeKey, String(index));
    } catch {
      /* stockage indisponible */
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [index, storeKey]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [index]);

  if (detail?.verrouille) {
    return <Locked tile={tile} apercu={(lang === 'en' && detail.apercu_en) || detail.apercu_fr} base={base} />;
  }
  if (chapters.length === 0) {
    return <p className="px-4 pt-32 text-center text-body">{tr("Le récit n'est pas encore disponible.", 'This story is not available yet.')}</p>;
  }

  const chap = chapters[index];
  return (
    <div className="pt-16 md:pt-[72px]">
      <div className="fixed inset-x-0 top-16 z-40 h-[3px] bg-gold/10 md:top-[72px]">
        <div className="h-full bg-gold transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 pb-16 pt-10 md:px-10 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Link href={base} className="text-sm font-semibold text-gold hover:underline">
            ‹ {tile.title}
          </Link>
          <p className="mt-6 text-xs font-bold tracking-[0.16em] text-muted">{tr('CHAPITRES', 'CHAPTERS')}</p>
          <ol className="mt-3 space-y-1">
            {chapters.map((c, i) => (
              <li key={i}>
                <button
                  onClick={() => setIndex(i)}
                  className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition ${
                    i === index ? 'bg-gold/15 font-bold text-gold' : 'text-body hover:bg-text/5'
                  }`}
                >
                  <span className="mr-2 text-muted">{i + 1}.</span>
                  {c.titre || `${tr('Chapitre', 'Chapter')} ${i + 1}`}
                </button>
              </li>
            ))}
          </ol>
          {hasEnglish(detail) && (
            <div className="mt-6 inline-flex rounded-full border border-gold/25 p-1">
              {(['fr', 'en'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${lang === l ? 'bg-gold/20 text-gold' : 'text-muted'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </aside>

        <article className="max-w-[720px]">
          <p className="text-xs font-bold tracking-[0.16em] text-gold">
            {tr('CHAPITRE', 'CHAPTER')} {index + 1} / {chapters.length}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-heading md:text-4xl">{chap.titre}</h1>
          <PresenteParSponsor type={type} slug={tile.slug} format="lecture" chapitre={index + 1} className="mt-6" />
          <div className="mt-8 whitespace-pre-line text-[19px] leading-[1.85] text-text">{chap.texte}</div>
          {index === chapters.length - 1 && <QuizEndCard type={type} slug={tile.slug} className="mt-12" />}

          <div className="mt-14 flex items-center justify-between gap-4 border-t border-gold/10 pt-8">
            <button
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
              className="rounded-md px-4 py-2.5 text-sm font-bold text-body transition hover:text-ivory disabled:opacity-30"
            >
              ‹ {tr('Chapitre précédent', 'Previous chapter')}
            </button>
            {index < chapters.length - 1 ? (
              <button onClick={() => setIndex(index + 1)} className="rounded-md bg-gold px-5 py-2.5 text-sm font-bold text-ink hover:bg-gold-pale">
                {tr('Chapitre suivant ›', 'Next chapter ›')}
              </button>
            ) : (
              <Link href={`${base}#commentaires`} className="rounded-md bg-gold px-5 py-2.5 text-sm font-bold text-ink hover:bg-gold-pale">
                {tr('Fin du récit · Donner ton avis', 'End of the story · Share your thoughts')}
              </Link>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

export function Locked({ tile, apercu, base }: { tile: Tile; apercu: string; base: string }) {
  const { tr } = useLang();
  return (
    <div className="mx-auto max-w-[720px] px-4 pb-16 pt-32">
      <Link href={base} className="text-sm font-semibold text-gold hover:underline">
        ‹ {tile.title}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-heading">{tile.title}</h1>
      <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-body">{apercu}</p>
      <div className="mt-10 rounded-xl border border-gold/25 bg-surface p-6 text-center">
        <p className="font-display text-xl font-bold text-ivory">{tr('La suite est réservée aux abonnés', 'The rest is for members only')}</p>
        <p className="mt-2 text-sm text-body">{tr("Abonne-toi pour lire, écouter et regarder toute l'histoire.", 'Subscribe to read, listen to and watch the whole story.')}</p>
        <Link href="/abonnement" className="mt-5 inline-block rounded-md bg-gold px-6 py-3 font-bold text-ink hover:bg-gold-pale">
          {tr('Voir les abonnements', 'See subscriptions')}
        </Link>
      </div>
    </div>
  );
}
