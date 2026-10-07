'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContentType, Detail, Tile } from '@/lib/types';
import { contentId, videosOf, type Lang } from '@/lib/content';
import { recordWatchChapter, recordWatchOpen } from '@/lib/engagement';
import { TYPE_PATH } from '@/lib/catalogue';
import { useLiveDetail } from '@/lib/useLiveDetail';
import { Locked } from './Reader';
import { useLang } from '@/lib/lang-client';

/**
 * Lecteur vidéo façon Netflix : vidéo plein cadre sur fond noir, liste des
 * chapitres à côté, passage automatique au chapitre suivant avec un compte à
 * rebours de 5 secondes (« épisode suivant »). Chaque chapitre lu est compté
 * comme dans l'application.
 */
export function WatchPlayer({ type, tile, detail: initial, initialChapter }: { type: ContentType; tile: Tile; detail: Detail | null; initialChapter: number }) {
  const detail = useLiveDetail(type, tile.slug, initial);
  const { lang: siteLang, tr } = useLang();
  const [lang, setLang] = useState<Lang>(siteLang);
  const chapters = useMemo(() => videosOf(detail, type, lang, tile.title), [detail, type, lang, tile.title]);
  const hasEn = useMemo(() => videosOf(detail, type, 'en', tile.title).some((c) => c.lang === 'en'), [detail, type, tile.title]);
  const [index, setIndex] = useState(Math.max(0, chapters.findIndex((c) => c.numero === initialChapter)));
  const [countdown, setCountdown] = useState<number | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const opened = useRef(false);
  const counted = useRef(new Set<string>());
  const base = `/${TYPE_PATH[type]}/${tile.slug}`;
  const id = contentId(detail);

  useEffect(() => {
    if (!opened.current && id) {
      opened.current = true;
      recordWatchOpen(type, id);
    }
  }, [id, type]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      setIndex((i) => i + 1);
      return;
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  if (detail?.verrouille) return <Locked tile={tile} apercu={(lang === 'en' && detail.apercu_en) || detail.apercu_fr} base={base} />;
  if (chapters.length === 0) return <p className="px-4 pt-32 text-center text-body">{tr("La vidéo de ce récit n'est pas encore disponible.", 'The video of this story is not available yet.')}</p>;

  const chap = chapters[Math.min(index, chapters.length - 1)];
  const next = chapters[index + 1];

  const onPlay = () => {
    const key = `${chap.numero}:${chap.lang}`;
    if (id && !counted.current.has(key)) {
      counted.current.add(key);
      recordWatchChapter(type, id, chap.numero, chap.lang);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-16 md:pt-[72px]">
      <div className="mx-auto grid max-w-[1500px] gap-6 px-0 pb-12 md:px-8 md:pt-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="relative aspect-video w-full bg-black">
            <video
              ref={video}
              key={chap.src}
              src={chap.src}
              controls
              autoPlay
              playsInline
              onPlay={onPlay}
              onEnded={() => next && setCountdown(5)}
              className="h-full w-full"
            />
            {countdown !== null && next && (
              <div className="absolute bottom-6 right-6 max-w-xs rounded-lg bg-ink/90 p-4 ring-1 ring-gold/30">
                <p className="text-xs font-bold tracking-[0.14em] text-gold">{tr(`CHAPITRE SUIVANT DANS ${countdown} S`, `NEXT CHAPTER IN ${countdown} S`)}</p>
                <p className="mt-1 font-bold text-ivory">{next.titre}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setCountdown(null);
                      setIndex(index + 1);
                    }}
                    className="rounded bg-gold px-3 py-1.5 text-sm font-bold text-ink"
                  >
                    {tr('Regarder maintenant', 'Watch now')}
                  </button>
                  <button onClick={() => setCountdown(null)} className="rounded px-3 py-1.5 text-sm text-body hover:text-ivory">
                    {tr('Annuler', 'Cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="px-4 pt-5 md:px-0">
            <Link href={base} className="text-sm font-semibold text-gold hover:underline">
              ‹ {tile.title}
            </Link>
            <h1 className="mt-2 font-display text-2xl font-bold text-ivory md:text-3xl">
              {chapters.length > 1 ? `${tr('Chapitre', 'Chapter')} ${chap.numero} · ` : ''}
              {chap.titre}
            </h1>
          </div>
        </div>

        <aside className="px-4 md:px-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-[0.16em] text-muted">{tr('CHAPITRES', 'CHAPTERS')}</p>
            {hasEn && (
              <div className="inline-flex rounded-full border border-gold/25 p-1">
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
          </div>
          <ol className="mt-3 space-y-2">
            {chapters.map((c, i) => (
              <li key={`${c.numero}-${c.lang}`}>
                <button
                  onClick={() => {
                    setCountdown(null);
                    setIndex(i);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${i === index ? 'bg-gold/15 ring-1 ring-gold/40' : 'hover:bg-text/5'}`}
                >
                  <span className={`font-display text-xl font-bold ${i === index ? 'text-gold' : 'text-muted'}`}>{c.numero}</span>
                  <span className={`text-sm ${i === index ? 'font-bold text-ivory' : 'text-body'}`}>{c.titre}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
