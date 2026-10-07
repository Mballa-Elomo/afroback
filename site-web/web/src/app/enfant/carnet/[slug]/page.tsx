'use client';

import { use, useEffect, useState } from 'react';
import { KidShell, Soon } from '@/components/kids';
import { useKid } from '@/lib/kid';
import { supabase } from '@/lib/supabase';
import { decouverteLabel } from '@/lib/catalogue';
import { loc } from '@/lib/lang';
import type { DecouverteKind, Detail } from '@/lib/types';
import { useLang } from '@/lib/lang-client';

type Fait = { statut: string; affirmation: string };
const FAIT: Record<string, { label: string; en: string; cls: string }> = {
  atteste: { label: 'C’est prouvé', en: 'It’s proven', cls: 'bg-free/25 text-free' },
  tradition_orale: { label: 'On le raconte', en: 'People tell it', cls: 'bg-gold/20 text-gold' },
  debattu: { label: 'On en discute', en: 'People debate it', cls: 'bg-terra/25 text-terra' },
};

/** Fiche du carnet (comme app/enfant/carnet/[slug].tsx) : résumé, faits/légendes étiquetés, sources. */
export default function CarnetFiche({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { kid } = useKid();
  const { tr, lang } = useLang();
  const [d, setD] = useState<Detail | null | undefined>(undefined);
  useEffect(() => {
    supabase.rpc('get_decouverte_detail', { p_slug: slug }).then(({ data }) => setD((data as Detail) ?? null));
  }, [slug]);

  const item = d && !d.verrouille ? (d as Record<string, unknown>) : null;
  const faitsRaw = loc<unknown>(item, 'statut_fait_legende', lang);
  const faits = (Array.isArray(faitsRaw) ? faitsRaw : []) as Fait[];
  const sources = (Array.isArray(item?.sources) ? item.sources : []) as string[];

  return (
    <KidShell back="/enfant/carnet" title={tr('Carnet d’explorateur', 'Explorer’s notebook')}>
      {kid && !kid.decouverte_activee && <Soon icon="🧭" text={tr('Le carnet d’explorateur n’est pas activé. Demande à un parent !', 'The explorer’s notebook is not turned on. Ask a parent!')} />}
      {kid?.decouverte_activee && d === undefined && <p className="text-white/60">{tr('Un instant…', 'One moment…')}</p>}
      {kid?.decouverte_activee && d === null && <p className="text-white/80">{tr("Cette fiche n'existe pas.", "This sheet doesn't exist.")}</p>}
      {kid?.decouverte_activee && d?.verrouille && (
        <div className="mx-auto max-w-2xl">
          {d.apercu_fr && <p className="text-xl leading-relaxed text-white/85">{(lang === 'en' && d.apercu_en) || d.apercu_fr}</p>}
          <p className="mt-6 rounded-[24px] bg-gold/15 p-5 text-lg font-bold text-gold">🔒 {tr("Cette fiche fait partie de l'abonnement. Demande à un parent !", 'This sheet is part of the subscription. Ask a parent!')}</p>
        </div>
      )}
      {kid?.decouverte_activee && item && (
        <article className="mx-auto max-w-2xl">
          {typeof item.image_url === 'string' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt="" className="aspect-[4/3] w-full rounded-[32px] object-cover ring-4 ring-gold/40" />
          )}
          <p className="mt-6 text-sm font-black tracking-[0.2em] text-gold">
            {decouverteLabel(item.type as DecouverteKind, lang).toUpperCase()} · {String(loc(item, 'region_ethnie', lang) ?? '')}
          </p>
          <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">{String(loc(item, 'titre', lang) ?? '')}</h1>
          <p className="mt-5 text-xl leading-relaxed text-white/85">{String(loc(item, 'resume_liste', lang) ?? '')}</p>
          {faits.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-black text-white">{tr('Vrai ou raconté ?', 'True or told?')}</h2>
              <ul className="mt-4 space-y-3">
                {faits.map((f, i) => (
                  <li key={i} className="flex gap-3 rounded-[22px] bg-white/8 p-4 ring-1 ring-white/10">
                    <span className={`h-fit shrink-0 rounded-full px-3 py-1 text-xs font-black ${FAIT[f.statut]?.cls ?? 'bg-white/15 text-white'}`}>{FAIT[f.statut] ? tr(FAIT[f.statut].label, FAIT[f.statut].en) : f.statut}</span>
                    <span className="text-white/85">{f.affirmation}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {sources.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-black text-white/70">Sources</h2>
              <ul className="mt-2 space-y-1 text-sm text-white/55">
                {sources.map((s, i) => (
                  <li key={i}>· {s}</li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}
    </KidShell>
  );
}
