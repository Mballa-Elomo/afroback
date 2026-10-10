'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ContentType, Detail, Tile } from '@/lib/types';
import { audioOf, contentId, type Lang } from '@/lib/content';
import { recordListen } from '@/lib/engagement';
import { TYPE_PATH } from '@/lib/catalogue';
import { useLiveDetail } from '@/lib/useLiveDetail';
import { Locked } from './Reader';
import { useLang } from '@/lib/lang-client';
import { QuizEndCard } from './quiz';

/**
 * Lecteur audio immersif : pochette, grand bouton lecture, barre de
 * progression, ±15 s, vitesse, FR / EN. L'écoute est comptée à la première
 * lecture (même fonction serveur que l'app). Espace = lecture / pause.
 */
const fmt = (s: number) => {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};
const SPEEDS = [1, 1.25, 1.5, 0.75];

export function ListenPlayer({ type, tile, detail: initial }: { type: ContentType; tile: Tile; detail: Detail | null }) {
  const detail = useLiveDetail(type, tile.slug, initial);
  const audio = useRef<HTMLAudioElement>(null);
  const { lang: siteLang, tr } = useLang();
  const [lang, setLang] = useState<Lang>(siteLang);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [ended, setEnded] = useState(false);
  const counted = useRef(false);
  const base = `/${TYPE_PATH[type]}/${tile.slug}`;
  const src = audioOf(detail, type, lang);
  const hasEn = !!audioOf(detail, type, 'en') && audioOf(detail, type, 'en') !== audioOf(detail, type, 'fr');

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (audio.current) audio.current.playbackRate = speed;
  }, [speed, src]);

  if (detail?.verrouille) return <Locked tile={tile} apercu={(lang === 'en' && detail.apercu_en) || detail.apercu_fr} base={base} />;
  if (!src) return <p className="px-4 pt-32 text-center text-body">{tr("La narration de ce récit n'est pas encore disponible.", 'The narration of this story is not available yet.')}</p>;

  const onPlay = () => {
    setPlaying(true);
    setEnded(false);
    const id = contentId(detail);
    if (!counted.current && id) {
      counted.current = true;
      recordListen(type, id, lang);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {tile.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tile.image} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />

      <div className="relative mx-auto flex max-w-xl flex-col items-center px-4 pb-16 pt-28 text-center">
        <Link href={base} className="self-start text-sm font-semibold text-gold hover:underline">
          ‹ {tile.title}
        </Link>
        <div className="mt-8 aspect-square w-64 overflow-hidden rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.7)] ring-1 ring-gold/30 md:w-80">
          {tile.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tile.image} alt="" className="h-full w-full object-cover object-[50%_25%]" />
          )}
        </div>
        <p className="mt-8 text-xs font-bold tracking-[0.18em] text-gold">{tr('NARRATION · CONTÉE PAR LE GRIOT', 'NARRATION · TOLD BY THE GRIOT')}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ivory md:text-4xl">{tile.title}</h1>

        <audio
          ref={audio}
          src={src}
          preload="metadata"
          controlsList="nodownload"
          onPlay={onPlay}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => {
            setPlaying(false);
            setEnded(true);
          }}
        />

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={1}
          value={time}
          onChange={(e) => {
            if (audio.current) audio.current.currentTime = Number(e.target.value);
          }}
          className="mt-10 w-full accent-[#f0c36b]"
          aria-label={tr('Position', 'Position')}
        />
        <div className="mt-1 flex w-full justify-between text-xs text-muted">
          <span>{fmt(time)}</span>
          <span>{fmt(duration)}</span>
        </div>

        <div className="mt-6 flex items-center gap-8">
          <button onClick={() => audio.current && (audio.current.currentTime -= 15)} className="text-sm font-bold text-body hover:text-ivory" aria-label={tr('Reculer de 15 secondes', 'Back 15 seconds')}>
            −15 s
          </button>
          <button
            onClick={toggle}
            className="grid h-20 w-20 place-items-center rounded-full bg-gold text-ink shadow-[0_0_40px_rgba(240,195,107,0.35)] transition hover:scale-105"
            aria-label={playing ? 'Pause' : tr('Lecture', 'Play')}
          >
            {playing ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button onClick={() => audio.current && (audio.current.currentTime += 15)} className="text-sm font-bold text-body hover:text-ivory" aria-label={tr('Avancer de 15 secondes', 'Forward 15 seconds')}>
            +15 s
          </button>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
            className="rounded-full border border-gold/30 px-4 py-1.5 text-sm font-bold text-gold"
            aria-label={tr('Vitesse de lecture', 'Playback speed')}
          >
            {lang === 'en' ? String(speed) : String(speed).replace('.', ',')}×
          </button>
          {hasEn && (
            <div className="inline-flex rounded-full border border-gold/25 p-1">
              {(['fr', 'en'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setPlaying(false);
                    setTime(0);
                    counted.current = false;
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${lang === l ? 'bg-gold/20 text-gold' : 'text-muted'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        {ended && <QuizEndCard type={type} slug={tile.slug} className="mt-10 w-full" />}
      </div>
    </div>
  );
}
