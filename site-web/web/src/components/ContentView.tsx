'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import type { Detail, RecitChapitre, Tile } from '@/lib/types';
import { audioOf, contentId, videosOf } from '@/lib/content';
import { recordRead } from '@/lib/engagement';
import { TYPE_PATH } from '@/lib/catalogue';
import { ContentActions } from './ContentActions';
import { Comments } from './Comments';
import { useLiveDetail } from '@/lib/useLiveDetail';
import { chaptersOf } from '@/lib/content';
import { useLang } from '@/lib/lang-client';
import { loc } from '@/lib/lang';

/**
 * Vue d'un contenu (refonte du 2026-10-02) : grand en-tête cinéma, actions
 * principales visibles d'emblée, puis onglets (Épisodes, Frise, Légendes,
 * Sources, Commentaires) au lieu d'une longue page à faire défiler.
 * Partagée par la page du contenu et la fenêtre « Plus d'infos ».
 * Contenu réservé : le serveur n'envoie qu'un aperçu, affiché comme tel.
 */

type Frise = { date: string; evenement: string };
type Citation = { texte: string; source?: string };
type Legende = { titre: string; description: string };
type FaitLegende = { statut: string; affirmation: string };

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export function ContentView({ tile, detail: initial, loading, compact }: { tile: Tile; detail: Detail | null; loading?: boolean; compact?: boolean }) {
  const detail = useLiveDetail(tile.type, tile.slug, initial);
  const locked = detail?.verrouille === true;
  const d = (detail && !detail.verrouille ? detail : {}) as Record<string, unknown>;
  const { lang, tr } = useLang();
  const chapitres = chaptersOf(detail, lang);
  const videos = videosOf(detail, tile.type, lang, tile.title);
  const audio = audioOf(detail, tile.type, lang);
  const resume = str(loc(d, 'resume_catalogue', lang)) || tile.summary;
  const texteDecouverte = (lang === 'en' && str(d.contenu_en_texte)) || str(d.contenu_fr_texte);
  const frise = arr<Frise>(loc(d, 'frise_chronologique', lang));
  const citations = arr<Citation>(loc(d, 'citations', lang));
  const legendes = arr<Legende>(loc(d, 'legendes_associees', lang));
  const faits = arr<FaitLegende>(loc(d, 'statut_fait_legende', lang));
  const sources = arr<string>(d.sources);
  const base = `/${TYPE_PATH[tile.type]}/${tile.slug}`;

  const counted = useRef(false);
  useEffect(() => {
    const id = contentId(detail);
    if (tile.type === 'decouverte' && id && !counted.current) {
      counted.current = true;
      recordRead('decouverte', id);
    }
  }, [detail, tile.type]);

  const tabs = useMemo(() => {
    const t: { id: string; label: string }[] = [];
    if (locked || chapitres.length > 0 || texteDecouverte)
      t.push({ id: 'recit', label: chapitres.length > 0 ? `${tr('Épisodes', 'Episodes')} · ${chapitres.length}` : tr('Le récit', 'The story') });
    if (frise.length > 0) t.push({ id: 'frise', label: tr('Frise', 'Timeline') });
    if (legendes.length + faits.length + citations.length > 0) t.push({ id: 'savoir', label: tr('Légendes & faits', 'Legends & facts') });
    if (sources.length > 0) t.push({ id: 'sources', label: 'Sources' });
    t.push({ id: 'commentaires', label: tr('Commentaires', 'Comments') });
    return t;
  }, [locked, chapitres.length, texteDecouverte, frise.length, legendes.length, faits.length, citations.length, sources.length, tr]);
  const [tab, setTab] = useState('recit');
  const current = tabs.find((t) => t.id === tab) ? tab : tabs[0].id;

  const avertissement = str(loc(d, 'avertissement_lecture', lang));
  const meta = [str(loc(d, 'epoque', lang)) || tile.meta, str(loc(d, 'region', lang)) || str(loc(d, 'region_ethnie', lang)), str(loc(d, 'peuple', lang))].filter(Boolean);

  return (
    <article>
      <Header tile={tile} compact={compact}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gold/40 bg-ink/40 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-gold backdrop-blur">{tile.kicker}</span>
          <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wider ${tile.free ? 'bg-free text-ink' : 'bg-ivory/10 text-ivory'}`}>
            {tile.free ? tr('GRATUIT', 'FREE') : tr('ABONNÉS', 'MEMBERS')}
          </span>
        </div>
        <h1 className={`text-gold-gradient mt-4 font-display font-black leading-[0.98] ${compact ? 'text-4xl md:text-5xl' : 'text-5xl md:text-7xl'}`}>{tile.title}</h1>
        {meta.length > 0 && <p className="mt-4 max-w-2xl text-sm font-medium text-gold-pale/90">{meta.join('  ·  ')}</p>}
        <p className="mt-4 line-clamp-4 max-w-2xl text-base leading-relaxed text-text/90 md:text-lg">{resume}</p>
        {avertissement && (
          <div className="mt-5 max-w-2xl rounded-2xl border border-terra/40 bg-terra-deep/15 p-4 text-sm leading-relaxed text-text">
            <p className="mb-1 text-[11px] font-extrabold tracking-[0.2em] text-terra">⚠ {tr('AVERTISSEMENT DE LECTURE', 'READING WARNING')}</p>
            {avertissement}
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {locked ? (
            <Link href="/abonnement" className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-extrabold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.35)] transition hover:-translate-y-0.5">
              {tr("S'abonner pour tout découvrir", 'Subscribe to discover everything')}
            </Link>
          ) : (
            <>
              {chapitres.length > 0 && (
                <Link href={`${base}/lire`} className="group inline-flex items-center gap-3 rounded-full bg-gold py-2 pl-2 pr-7 font-extrabold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.35)] transition hover:-translate-y-0.5">
                  <span className="grid h-10 w-10 animate-pulse-ring place-items-center rounded-full bg-ink text-gold">
                    <Play />
                  </span>
                  {tr('Lire le récit', 'Read the story')}
                </Link>
              )}
              {audio && (
                <Link href={`${base}/ecouter`} className="inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-6 py-3.5 font-bold text-ivory backdrop-blur transition hover:border-gold/60">
                  <Wave /> {tr('Écouter', 'Listen')}
                </Link>
              )}
              {videos.length > 0 && (
                <Link href={`${base}/regarder`} className="inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-6 py-3.5 font-bold text-ivory backdrop-blur transition hover:border-gold/60">
                  <Play /> {tr('Regarder', 'Watch')}
                </Link>
              )}
            </>
          )}
        </div>
        <div className="mt-6">
          <ContentActions type={tile.type} tile={tile} onComments={() => setTab('commentaires')} />
        </div>
      </Header>

      {/* Onglets */}
      <div className={`sticky z-30 border-b border-ivory/10 bg-ink/85 backdrop-blur-xl ${compact ? 'top-0' : 'top-0 md:top-[88px]'}`}>
        <div className="no-scrollbar mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-5 md:px-10">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative shrink-0 px-4 py-4 text-sm font-bold transition md:text-[15px] ${current === t.id ? 'text-ivory' : 'text-muted hover:text-text'}`}
            >
              {t.label}
              {current === t.id && <motion.span layoutId={`tab-${compact ? 'm' : 'p'}`} className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-gold" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-14">
        {loading && <p className="text-muted">{tr('Chargement…', 'Loading…')}</p>}
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {current === 'recit' && (
              <>
                {locked && detail?.verrouille && <LockedPreview apercu={(lang === 'en' && detail.apercu_en) || detail.apercu_fr} />}
                {chapitres.length > 0 && (
                  <div className="grid gap-5 md:grid-cols-2">
                    {chapitres.map((c, i) => (
                      <EpisodeCard key={i} index={i + 1} chapitre={c} base={base} tile={tile} hasVideo={videos.some((v) => v.numero === (c.numero ?? i + 1))} />
                    ))}
                  </div>
                )}
                {texteDecouverte && <div className="max-w-[760px] whitespace-pre-line text-[18px] leading-[1.85] text-text">{texteDecouverte}</div>}
              </>
            )}
            {current === 'frise' && <Timeline items={frise} />}
            {current === 'savoir' && <Knowledge legendes={legendes} faits={faits} citations={citations} />}
            {current === 'sources' && (
              <ol className="max-w-3xl space-y-4">
                {sources.map((s, i) => (
                  <li key={i} className="flex gap-4 rounded-2xl bg-ivory/[0.04] p-5 ring-1 ring-ivory/10">
                    <span className="font-display text-2xl font-black text-gold/60">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[15px] leading-relaxed text-body">{s.replace(/\*/g, '')}</span>
                  </li>
                ))}
              </ol>
            )}
            {current === 'commentaires' && (
              <div className="max-w-3xl">
                <Comments type={tile.type} slug={tile.slug} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </article>
  );
}

function Header({ tile, compact, children }: { tile: Tile; compact?: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  return (
    <div ref={ref} className={`relative flex items-end overflow-hidden ${compact ? 'min-h-[560px]' : 'min-h-[88svh]'}`}>
      {tile.image && (
        <motion.div style={compact ? undefined : { y, scale }} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tile.image} alt="" className="h-full w-full object-cover object-[60%_22%]" />
        </motion.div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/10" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_90%,rgba(240,195,107,0.16),transparent_55%)]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className={`relative w-full max-w-[1200px] px-5 pb-12 md:px-10 ${compact ? 'pt-24' : 'mx-auto pt-40'}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

function EpisodeCard({ index, chapitre, base, tile, hasVideo }: { index: number; chapitre: RecitChapitre; base: string; tile: Tile; hasVideo: boolean }) {
  const { tr } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-3xl bg-surface ring-1 ring-ivory/10 transition hover:ring-gold/50"
    >
      <Link href={`${base}/lire?chapitre=${index}`} className="block">
        <div className="relative aspect-[16/7] overflow-hidden">
          {tile.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tile.image}
              alt=""
              className="h-full w-full object-cover transition duration-[1.2s] group-hover:scale-110"
              style={{ objectPosition: `${20 + index * 18}% ${15 + index * 6}%` }}
            />
          )}
          <span className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/50 to-transparent" />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-display text-[88px] font-black leading-none text-transparent" style={{ WebkitTextStroke: '2px rgba(240,195,107,0.7)' }}>
            {index}
          </span>
          <span className="absolute right-5 top-5 grid h-12 w-12 scale-90 place-items-center rounded-full bg-gold text-ink opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
            <Play />
          </span>
        </div>
        <div className="p-6">
          <p className="text-[11px] font-bold tracking-[0.2em] text-gold">{tr('CHAPITRE', 'CHAPTER')} {index}</p>
          <h3 className="mt-1 font-display text-xl font-bold text-ivory">{chapitre.titre || `${tr('Chapitre', 'Chapter')} ${index}`}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body">{chapitre.texte}</p>
        </div>
      </Link>
      {hasVideo && (
        <Link href={`${base}/regarder?chapitre=${index}`} className="absolute bottom-6 right-6 rounded-full border border-gold/40 bg-ink/80 px-3.5 py-1.5 text-xs font-bold text-gold backdrop-blur hover:bg-gold hover:text-ink">
          ▶ {tr('Vidéo', 'Video')}
        </Link>
      )}
    </motion.div>
  );
}

function Timeline({ items }: { items: Frise[] }) {
  return (
    <div className="no-scrollbar flex gap-5 overflow-x-auto pb-6 pt-10">
      {items.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="relative w-64 shrink-0"
        >
          <span className="absolute -top-10 left-0 right-[-20px] h-[2px] bg-gradient-to-r from-gold/70 to-gold/20" />
          <span className="absolute -top-[46px] left-0 h-3.5 w-3.5 rounded-full bg-gold shadow-[0_0_18px_rgba(240,195,107,0.9)]" />
          <p className="font-display text-2xl font-black text-gold">{f.date}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-body">{f.evenement}</p>
        </motion.div>
      ))}
    </div>
  );
}

const FAIT_LABEL: Record<string, [string, string]> = { atteste: ['Attesté', 'Documented'], tradition_orale: ['Tradition orale', 'Oral tradition'], debattu: ['Débattu', 'Debated'] };

function Knowledge({ legendes, faits, citations }: { legendes: Legende[]; faits: FaitLegende[]; citations: Citation[] }) {
  const { tr } = useLang();
  return (
    <div className="space-y-10">
      {citations.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {citations.map((c, i) => (
            <blockquote key={i} className="rounded-3xl bg-gradient-to-br from-gold/12 to-transparent p-7 ring-1 ring-gold/20">
              <span className="font-display text-6xl leading-none text-gold/50">“</span>
              <p className="-mt-4 text-lg italic leading-relaxed text-ivory">{c.texte}</p>
              {c.source && <p className="mt-3 text-xs text-muted">{c.source}</p>}
            </blockquote>
          ))}
        </div>
      )}
      {legendes.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {legendes.map((l, i) => (
            <div key={i} className="rounded-3xl bg-terra-deep/10 p-7 ring-1 ring-terra/25">
              <span className="rounded-full bg-terra/20 px-3 py-1 text-[10px] font-extrabold tracking-[0.2em] text-terra">{tr('LÉGENDE', 'LEGEND')}</span>
              <p className="mt-4 font-display text-xl font-bold text-ivory">{l.titre}</p>
              <p className="mt-2 leading-relaxed text-body">{l.description}</p>
            </div>
          ))}
        </div>
      )}
      {faits.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {faits.map((f, i) => (
            <li key={i} className="flex gap-4 rounded-2xl bg-ivory/[0.04] p-5 ring-1 ring-ivory/10">
              <span className={`h-fit shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider ${f.statut === 'atteste' ? 'bg-free/20 text-free' : f.statut === 'debattu' ? 'bg-terra/20 text-terra' : 'bg-gold/15 text-gold'}`}>
                {(FAIT_LABEL[f.statut] ? tr(...FAIT_LABEL[f.statut]) : f.statut).toUpperCase()}
              </span>
              <span className="text-sm leading-relaxed text-body">{f.affirmation}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LockedPreview({ apercu }: { apercu: string }) {
  const { tr } = useLang();
  return (
    <div className="relative max-w-3xl overflow-hidden rounded-3xl bg-surface p-8 ring-1 ring-gold/20">
      <p className="text-[11px] font-bold tracking-[0.25em] text-gold">{tr('APERÇU', 'PREVIEW')}</p>
      <p className="mt-4 max-h-64 overflow-hidden whitespace-pre-line text-lg leading-relaxed text-text">{apercu}</p>
      <div className="absolute inset-x-0 bottom-0 flex h-56 flex-col items-center justify-end bg-gradient-to-t from-surface via-surface/95 to-transparent pb-8">
        <p className="font-display text-xl font-bold text-ivory">{tr('La suite est réservée aux abonnés', 'The rest is for members only')}</p>
        <Link href="/abonnement" className="mt-4 rounded-full bg-gold px-7 py-3 font-extrabold text-ink hover:bg-gold-pale">
          {tr('Voir les abonnements', 'See subscriptions')}
        </Link>
      </div>
    </div>
  );
}

function Play() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function Wave() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" />
    </svg>
  );
}
