'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { mesurer, useSponsors, type EmplacementSponsor } from '@/lib/sponsors';
import { useLang } from '@/lib/lang-client';
import type { ContentType } from '@/lib/types';

/**
 * Encarts sponsors (backoffice/cdc-module-sponsors.md, étape 2) : bannière
 * d'accueil, « Présenté par », fin de vidéo, page Partenaires. Chaque encart
 * est marqué « Sponsorisé » et ses liens sont déclarés rel="sponsored".
 * À ne jamais placer dans l'espace enfant.
 */

/** Compte un affichage quand l'encart est réellement visible (au moins à moitié). */
function useVisible(emplacementId: string | undefined) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !emplacementId) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) {
          mesurer(emplacementId, 'affichage');
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [emplacementId]);
  return ref;
}

function Logo({ e, taille }: { e: EmplacementSponsor; taille: string }) {
  if (!e.sponsor.logo_url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={e.sponsor.logo_url} alt={e.sponsor.nom} className={`${taille} shrink-0 rounded-xl bg-white object-contain p-1.5`} />;
}

function Lien({ e, children, className }: { e: EmplacementSponsor; children: React.ReactNode; className: string }) {
  if (!e.sponsor.site_url) return null;
  return (
    <a href={e.sponsor.site_url} target="_blank" rel="sponsored noopener noreferrer" onClick={() => mesurer(e.emplacement_id, 'clic')} className={className}>
      {children}
    </a>
  );
}

function Etiquette() {
  const { tr } = useLang();
  return <span className="rounded-full border border-ivory/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{tr('Sponsorisé', 'Sponsored')}</span>;
}

/** Bannière d'accueil : une bannière active au hasard (rotation à chaque visite). */
export function BanniereSponsor({ className = '' }: { className?: string }) {
  const { lang, tr } = useLang();
  const liste = useSponsors();
  const [tirage] = useState(() => Math.random());
  const bannieres = liste.filter((e) => e.format === 'banniere_accueil');
  const e = bannieres.length ? bannieres[Math.floor(tirage * bannieres.length)] : undefined;
  const ref = useVisible(e?.emplacement_id);
  if (!e) return null;
  const accroche = (lang === 'en' ? e.accroche_en || e.accroche_fr : e.accroche_fr || e.accroche_en) || e.sponsor.nom;
  return (
    <div ref={ref} className={`flex flex-wrap items-center gap-4 rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/[0.08] to-transparent px-5 py-4 ${className}`}>
      <Logo e={e} taille="h-14 w-14" />
      <div className="min-w-0 flex-1">
        <Etiquette />
        <p className="mt-1 font-bold text-ivory">{accroche}</p>
        <p className="text-xs text-muted">{e.sponsor.nom}</p>
      </div>
      <Lien e={e} className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-ink transition hover:scale-105">
        {tr('Découvrir', 'Discover')}
      </Lien>
    </div>
  );
}

/** « Présenté par » sur la fiche d'un contenu. */
export function PresenteParSponsor({ type, slug, className = '' }: { type: ContentType; slug: string; className?: string }) {
  const { lang, tr } = useLang();
  const liste = useSponsors();
  const e = liste.find((x) => x.format === 'presente_par' && x.cible_type === type && x.cible_slug === slug);
  const ref = useVisible(e?.emplacement_id);
  if (!e) return null;
  const accroche = (lang === 'en' ? e.accroche_en || e.accroche_fr : e.accroche_fr || e.accroche_en) || tr('Cette histoire vous est offerte par', 'This story is brought to you by');
  return (
    <div ref={ref} className={`flex items-center gap-3 rounded-xl border border-ivory/10 bg-ivory/[0.03] px-4 py-3 ${className}`}>
      <Logo e={e} taille="h-10 w-10" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-body">{accroche}</p>
        <p className="text-sm font-bold text-ivory">{e.sponsor.nom}</p>
      </div>
      <Etiquette />
      <Lien e={e} className="text-sm font-bold text-gold hover:underline">
        {tr('Visiter', 'Visit')} ↗
      </Lien>
    </div>
  );
}

/** Carte de fin de vidéo : sponsor du contenu, sinon sponsor de toutes les vidéos. */
export function FinVideoSponsor({ type, slug, className = '' }: { type: ContentType; slug: string; className?: string }) {
  const { lang, tr } = useLang();
  const liste = useSponsors();
  const fins = liste.filter((x) => x.format === 'fin_video');
  const e = fins.find((x) => x.cible_type === type && x.cible_slug === slug) ?? fins.find((x) => !x.cible_slug);
  const ref = useVisible(e?.emplacement_id);
  if (!e) return null;
  const accroche = (lang === 'en' ? e.accroche_en || e.accroche_fr : e.accroche_fr || e.accroche_en) || tr('Avec le soutien de', 'With the support of');
  return (
    <div ref={ref} className={`flex items-center gap-4 rounded-xl bg-gradient-to-r from-gold/15 to-gold/[0.03] px-4 py-3 ring-1 ring-gold/25 ${className}`}>
      <Logo e={e} taille="h-12 w-12" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold tracking-[0.12em] text-gold">{accroche.toUpperCase()}</p>
        <p className="font-bold text-ivory">{e.sponsor.nom}</p>
      </div>
      <Etiquette />
      <Lien e={e} className="rounded-full border border-gold/40 px-4 py-1.5 text-sm font-bold text-gold hover:bg-gold hover:text-ink">
        {tr('Visiter', 'Visit')}
      </Lien>
    </div>
  );
}

/** Page Partenaires : chaque sponsor actif ayant cet emplacement, une seule fois. */
export function ListePartenaires() {
  const { lang, tr } = useLang();
  const liste = useSponsors();
  const partenaires = useMemo(() => {
    const vus = new Set<string>();
    return liste.filter((e) => e.format === 'page_partenaires' && !vus.has(e.sponsor.id) && vus.add(e.sponsor.id));
  }, [liste]);
  if (!partenaires.length) {
    return <p className="text-body">{tr('Nos partenaires seront bientôt présentés ici.', 'Our partners will be presented here soon.')}</p>;
  }
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {partenaires.map((e) => (
        <Partenaire key={e.emplacement_id} e={e} description={(lang === 'en' ? e.sponsor.description_en || e.sponsor.description_fr : e.sponsor.description_fr || e.sponsor.description_en) ?? ''} />
      ))}
    </div>
  );
}

function Partenaire({ e, description }: { e: EmplacementSponsor; description: string }) {
  const { tr } = useLang();
  const ref = useVisible(e.emplacement_id);
  return (
    <div ref={ref} className="flex gap-4 rounded-2xl border border-gold/15 bg-surface p-5">
      <Logo e={e} taille="h-20 w-20" />
      <div className="min-w-0">
        <p className="font-display text-xl font-bold text-ivory">{e.sponsor.nom}</p>
        {description && <p className="mt-2 text-sm leading-relaxed text-body">{description}</p>}
        <Lien e={e} className="mt-3 inline-block text-sm font-bold text-gold hover:underline">
          {tr('Visiter le site', 'Visit the website')} ↗
        </Lien>
      </div>
    </div>
  );
}
