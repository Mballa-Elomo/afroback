'use client';

import { analyserLienVideo, miniature } from '@/lib/lienVideo';
import { pageLecteur } from '@/lib/pageLecteur';
import { FinVideoSponsor, PresenteParSponsor } from '@/components/Sponsor';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContentType, Detail, Tile } from '@/lib/types';
import { chaptersOf, contentId, videosOf, type Lang } from '@/lib/content';
import { recordWatchChapter, recordWatchOpen } from '@/lib/engagement';
import { TYPE_PATH, tileHref } from '@/lib/catalogue';
import { useLiveDetail } from '@/lib/useLiveDetail';
import { loc } from '@/lib/lang';
import { Locked } from './Reader';
import { useLang } from '@/lib/lang-client';
import { QuizEndCard, QuizTile } from './quiz';
import { ContentActions } from './ContentActions';
import { Comments } from './Comments';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/**
 * Page vidéo façon YouTube (demande de Yannick du 2026-10-07).
 * - Ordinateur : à gauche le lecteur, le titre, les actions (J'aime,
 *   commentaires, partager), la description dépliable et les commentaires ;
 *   à droite la playlist de l'histoire (tous les chapitres, celui en cours en
 *   surbrillance, les chapitres pas encore tournés grisés) puis « À suivre ».
 * - Téléphone (comme l'appli YouTube) : lecteur en haut, titre, actions,
 *   description, playlist, commentaires, puis « À suivre ».
 * Conservé de l'ancien lecteur : comptage des vues comme dans l'app, chapitre
 * suivant après 5 s, bouton lecture tant que la vidéo n'a pas démarré (les
 * téléphones bloquent la lecture automatique avec le son).
 */
export function WatchPlayer({
  type,
  tile,
  detail: initial,
  initialChapter,
  related = [],
}: {
  type: ContentType;
  tile: Tile;
  detail: Detail | null;
  initialChapter: number;
  related?: Tile[];
}) {
  const detail = useLiveDetail(type, tile.slug, initial);
  const { lang: siteLang, tr } = useLang();
  const [lang, setLang] = useState<Lang>(siteLang);
  const chapters = useMemo(() => videosOf(detail, type, lang, tile.title), [detail, type, lang, tile.title]);
  const hasEn = useMemo(() => videosOf(detail, type, 'en', tile.title).some((c) => c.lang === 'en'), [detail, type, tile.title]);
  const recit = chaptersOf(detail, lang);
  const [index, setIndex] = useState(Math.max(0, chapters.findIndex((c) => c.numero === initialChapter)));
  const [countdown, setCountdown] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);
  // Vidéo (chapitre et langue) réellement démarrée : changer de chapitre réaffiche le bouton lecture si besoin.
  const [startedSrc, setStartedSrc] = useState<string | null>(null);
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
    const t = setTimeout(() => {
      if (countdown <= 1) {
        setCountdown(null);
        setIndex((i) => i + 1);
      } else setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Lecteur AFROBACK des vidéos YouTube / Vimeo (src/lib/pageLecteur.ts) : il prévient
  // de la fin de la vidéo, ce qui enchaîne le chapitre suivant comme avec un fichier.
  const cadreRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (!cadreRef.current || ev.source !== cadreRef.current.contentWindow) return;
      const m = ev.data as { afroback?: string; type?: string } | null;
      if (m?.afroback !== 'lecteur' || m.type !== 'fin') return;
      if (index + 1 < chapters.length) setCountdown(5);
      else setEnded(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [index, chapters.length]);

  if (detail?.verrouille) return <Locked tile={tile} apercu={(lang === 'en' && detail.apercu_en) || detail.apercu_fr} base={base} />;
  if (chapters.length === 0) return <p className="px-4 pt-32 text-center text-body">{tr("La vidéo de ce récit n'est pas encore disponible.", 'The video of this story is not available yet.')}</p>;

  const chap = chapters[Math.min(index, chapters.length - 1)];
  const next = chapters[index + 1];
  const d = (detail && !detail.verrouille ? detail : {}) as Record<string, unknown>;
  const description = str(loc(d, 'resume_catalogue', lang)) || tile.summary;
  const meta = [str(loc(d, 'epoque', lang)) || tile.meta, str(loc(d, 'region', lang)) || str(loc(d, 'peuple', lang))].filter(Boolean);
  const withQuiz = type === 'heros' || type === 'mythe';

  // Playlist : tous les chapitres du récit (pas seulement ceux déjà tournés), comme une playlist YouTube.
  // Un mythe n'a qu'une vidéo : pas de playlist de chapitres.
  const source = recit.length > 0 && type !== 'mythe' ? recit.map((c) => ({ numero: c.numero, titre: c.titre })) : chapters.map((c) => ({ numero: c.numero, titre: c.titre }));
  const playlist = source.map((c) => ({
    numero: c.numero,
    titre: chapters.find((v) => v.numero === c.numero)?.titre || c.titre || `${tr('Chapitre', 'Chapter')} ${c.numero}`,
    videoIndex: chapters.findIndex((v) => v.numero === c.numero),
  }));

  const goTo = (i: number) => {
    setCountdown(null);
    setEnded(false);
    setIndex(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Vidéo par lien YouTube / Vimeo (2026-10-11) : lecteur intégré, lancé au clic.
  const lienChap = analyserLienVideo(chap.src);
  const integration = lienChap && lienChap.type !== 'fichier' ? lienChap : null;
  const vignette = lienChap ? miniature(lienChap) : null;

  const onPlay = () => {
    setStartedSrc(chap.src);
    setEnded(false);
    const key = `${chap.numero}:${chap.lang}`;
    if (id && !counted.current.has(key)) {
      counted.current.add(key);
      recordWatchChapter(type, id, chap.numero, chap.lang);
    }
  };

  const playlistPanel = (
    <section className="overflow-hidden rounded-xl bg-surface ring-1 ring-ivory/10" aria-label={tr('Playlist du récit', 'Story playlist')}>
      <div className="flex items-start justify-between gap-3 border-b border-ivory/10 bg-gold/[0.06] px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold text-ivory">{tile.title}</p>
          <p className="text-xs text-body">
            AFROBACK · {chap.numero}/{playlist.length}
          </p>
        </div>
        {hasEn && (
          <div className="inline-flex shrink-0 rounded-full border border-gold/25 p-0.5" role="group" aria-label={tr('Langue de la vidéo', 'Video language')}>
            {(['fr', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${lang === l ? 'bg-gold/20 text-gold' : 'text-muted hover:text-ivory'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
      <ol className="max-h-[420px] overflow-y-auto py-1">
        {playlist.map((c) => {
          const active = c.videoIndex === index;
          const available = c.videoIndex >= 0;
          return (
            <li key={c.numero}>
              <button
                type="button"
                disabled={!available}
                onClick={() => goTo(c.videoIndex)}
                aria-current={active ? 'true' : undefined}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${active ? 'bg-gold/15' : available ? 'hover:bg-ivory/5' : 'cursor-not-allowed opacity-50'}`}
              >
                <span className={`w-4 shrink-0 text-center text-xs font-bold ${active ? 'text-gold' : 'text-muted'}`}>{active ? '▶' : c.numero}</span>
                <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-ink">
                  {tile.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tile.image} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${15 + c.numero * 18}% ${15 + c.numero * 6}%` }} />
                  )}
                  {!available && <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-0.5 text-center text-[10px] font-bold text-gold">{tr('BIENTÔT', 'SOON')}</span>}
                  {active && <span className="absolute inset-0 rounded-lg ring-2 ring-inset ring-gold" />}
                </span>
                <span className="min-w-0">
                  <span className={`line-clamp-2 text-sm leading-snug ${active ? 'font-bold text-ivory' : 'font-semibold text-text'}`}>{c.titre}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {tr('Chapitre', 'Chapter')} {c.numero}
                    {!available ? ` · ${tr('pas encore tourné', 'not filmed yet')}` : ''}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );

  const upNext =
    related.length > 0 ? (
      <section aria-label={tr('À suivre', 'Up next')}>
        <p className="mb-3 text-sm font-bold text-ivory">{tr('À suivre', 'Up next')}</p>
        <ul className="space-y-3">
          {related.map((r) => (
            <li key={r.slug}>
              <Link href={tileHref(r)} className="group flex gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-gold">
                <span className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-ink">
                  {r.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  )}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="line-clamp-2 text-sm font-semibold leading-snug text-text group-hover:text-ivory">{r.title}</span>
                  <span className="mt-1 block text-xs text-muted">AFROBACK</span>
                  <span className="block truncate text-xs text-muted">{r.kicker}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  return (
    <div className="min-h-screen bg-ink pt-24 md:pt-[88px]">
      <div className="mx-auto grid max-w-[1700px] gap-6 pb-14 md:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
        {/* Colonne principale : lecteur, titre, actions, description, commentaires */}
        <div className="min-w-0">
          <div className="relative aspect-video w-full overflow-hidden bg-black md:rounded-xl">
            {integration ? (
              startedSrc === chap.src ? (
                <iframe
                  ref={cadreRef}
                  key={chap.src}
                  srcDoc={pageLecteur(integration, { origine: window.location.origin, titre: chap.titre, autoplay: true }) ?? ''}
                  title={chap.titre}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full border-0"
                />
              ) : (
                <>
                  {(tile.image || vignette) && <img src={tile.image ?? vignette!} alt="" className="h-full w-full object-cover opacity-80" />}
                  <button
                    type="button"
                    onClick={onPlay}
                    className="group absolute inset-0 grid place-items-center bg-ink/40 focus-visible:outline-2 focus-visible:outline-gold"
                    aria-label={tr(`Lire la vidéo : ${chap.titre}`, `Play the video: ${chap.titre}`)}
                  >
                    <span className="grid h-20 w-20 place-items-center rounded-full bg-gold text-ink shadow-[0_10px_40px_rgba(240,195,107,0.45)] transition group-hover:scale-105 group-active:scale-95">
                      <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                      </svg>
                    </span>
                  </button>
                </>
              )
            ) : (
            <>
            <video
              ref={video}
              key={chap.src}
              src={chap.src}
              controls
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
              autoPlay
              playsInline
              preload="metadata"
              poster={tile.image ?? undefined}
              onPlay={onPlay}
              onEnded={() => (next ? setCountdown(5) : setEnded(true))}
              className="h-full w-full"
            />
            {startedSrc !== chap.src && (
              <button
                type="button"
                onClick={() => video.current?.play().catch(() => {})}
                className="group absolute inset-0 grid place-items-center bg-ink/40 focus-visible:outline-2 focus-visible:outline-gold"
                aria-label={tr(`Lire la vidéo : ${chap.titre}`, `Play the video: ${chap.titre}`)}
              >
                <span className="grid h-20 w-20 place-items-center rounded-full bg-gold text-ink shadow-[0_10px_40px_rgba(240,195,107,0.45)] transition group-hover:scale-105 group-active:scale-95">
                  <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                  </svg>
                </span>
              </button>
            )}
            </>
            )}
            {countdown !== null && next && (
              <div className="absolute bottom-4 right-4 max-w-xs rounded-lg bg-ink/90 p-4 ring-1 ring-gold/30">
                <p className="text-xs font-bold tracking-[0.14em] text-gold">{tr(`CHAPITRE SUIVANT DANS ${countdown} S`, `NEXT CHAPTER IN ${countdown} S`)}</p>
                <p className="mt-1 font-bold text-ivory">{next.titre}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => goTo(index + 1)} className="rounded bg-gold px-3 py-1.5 text-sm font-bold text-ink">
                    {tr('Regarder maintenant', 'Watch now')}
                  </button>
                  <button type="button" onClick={() => setCountdown(null)} className="rounded px-3 py-1.5 text-sm text-body hover:text-ivory">
                    {tr('Annuler', 'Cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 px-4 pt-4 md:px-0">
            <h1 className="font-display text-xl font-bold leading-snug text-ivory md:text-2xl">
              {tile.title}
              {playlist.length > 1 ? ` · ${tr('Chapitre', 'Chapter')} ${chap.numero} : ${chap.titre}` : ''}
            </h1>
            <PresenteParSponsor type={type} slug={tile.slug} format="video" chapitre={chap.numero} />

            {/* Ligne « chaîne », comme sous une vidéo YouTube */}
            <Link href={base} className="flex w-fit items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-medaillon.jpg" alt="" className="h-10 w-10 rounded-full ring-1 ring-gold" />
              <span>
                <span className="block font-bold text-ivory">AFROBACK</span>
                <span className="block text-xs text-muted">{tr("Voir la fiche de l'histoire", 'See the story page')}</span>
              </span>
            </Link>
            <ContentActions type={type} tile={tile} />

            {/* Description dépliable */}
            <details className="group rounded-xl bg-surface p-4 ring-1 ring-ivory/10 open:ring-gold/25">
              <summary className="cursor-pointer list-none">
                {meta.length > 0 && <p className="text-sm font-bold text-ivory">{meta.join('  ·  ')}</p>}
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text group-open:line-clamp-none">{description}</p>
                <span className="mt-1 inline-block text-sm font-bold text-gold group-open:hidden">{tr('…plus', '…more')}</span>
                <span className="mt-1 hidden text-sm font-bold text-gold group-open:inline-block">{tr('Moins', 'Less')}</span>
              </summary>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href={`${base}/lire?chapitre=${chap.numero}`} className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-ink hover:bg-gold-pale">
                  {tr('Lire ce chapitre', 'Read this chapter')}
                </Link>
                {type !== 'decouverte' && (
                  <Link href={`${base}/ecouter`} className="rounded-full border border-gold/40 px-4 py-2 text-sm font-bold text-gold hover:bg-gold/10">
                    {tr('Écouter le récit', 'Listen to the story')}
                  </Link>
                )}
              </div>
            </details>

            {(ended || countdown !== null) && <FinVideoSponsor type={type} slug={tile.slug} chapitre={chap.numero} />}

            {withQuiz && (ended && !next ? <QuizEndCard type={type} slug={tile.slug} /> : <QuizTile type={type} slug={tile.slug} />)}

            {/* Téléphone : la playlist vient avant les commentaires, comme dans l'appli YouTube */}
            <div className="lg:hidden">{playlistPanel}</div>

            <div id="commentaires" className="pt-2">
              <Comments type={type} slug={tile.slug} />
            </div>

            {upNext && <div className="lg:hidden">{upNext}</div>}
          </div>
        </div>

        {/* Colonne de droite (ordinateur) : playlist puis « À suivre » */}
        <aside className="hidden space-y-6 lg:block">
          {playlistPanel}
          {upNext}
        </aside>
      </div>
    </div>
  );
}
