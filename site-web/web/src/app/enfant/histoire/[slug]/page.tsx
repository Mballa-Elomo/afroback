'use client';

import { use, useEffect, useState } from 'react';
import { KidShell } from '@/components/kids';
import { heroesList, shortEra } from '@/lib/kids';
import { loc } from '@/lib/lang';
import { supabase } from '@/lib/supabase';
import type { Detail, HerosCard } from '@/lib/types';
import { useLang } from '@/lib/lang-client';

/**
 * Histoire du jour, version enfant (comme app/enfant/histoire.tsx) : nom,
 * époque, région et le résumé du catalogue seulement. Les récits complets
 * contiennent des passages durs (violence coloniale, exécutions, traite) qui
 * ne sont pas écrits pour un jeune public : pas de lien vers le récit adulte.
 */
export default function HistoireEnfant({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { tr, lang } = useLang();
  const [hero, setHero] = useState<HerosCard | null | undefined>(undefined);
  const [locked, setLocked] = useState<string | null>(null);

  useEffect(() => {
    heroesList().then((l) => setHero(l.find((h) => h.slug === slug) ?? null));
    supabase.rpc('get_heros_detail', { p_slug: slug }).then(({ data }) => {
      const d = data as Detail | null;
      if (d?.verrouille) setLocked((lang === 'en' && d.apercu_en) || d.apercu_fr || '');
    });
  }, [slug, lang]);

  return (
    <KidShell back="/enfant" title={tr('Histoire du jour', 'Story of the day')}>
      {hero === undefined && <p className="text-center text-white/60">{tr('Un instant…', 'One moment…')}</p>}
      {hero === null && <p className="text-center text-white/80">{tr("Cette histoire n'existe pas.", "This story doesn't exist.")}</p>}
      {hero && (
        <article className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[32px] bg-white/5 ring-4 ring-gold/40">
            {hero.image_carte_catalogue && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero.image_carte_catalogue} alt={loc(hero as never, 'nom_affiche', lang)} className="aspect-[4/3] w-full object-cover object-top" />
            )}
          </div>
          <p className="mt-6 text-sm font-black tracking-[0.2em] text-gold">
            {shortEra(loc(hero as never, 'epoque', lang)).toUpperCase()} · {shortEra(loc(hero as never, 'region', lang)).toUpperCase()}
          </p>
          <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">{loc(hero as never, 'nom_affiche', lang)}</h1>
          {locked !== null ? (
            <>
              {locked && <p className="mt-5 text-xl leading-relaxed text-white/85">{locked}</p>}
              <p className="mt-6 rounded-[24px] bg-gold/15 p-5 text-lg font-bold text-gold">🔒 {tr("Cette histoire fait partie de l'abonnement. Demande à un parent !", 'This story is part of the subscription. Ask a parent!')}</p>
            </>
          ) : (
            <>
              <p className="mt-5 text-xl leading-relaxed text-white/85">{loc(hero as never, 'resume_catalogue', lang)}</p>
              <p className="mt-6 rounded-[24px] bg-white/10 p-5 text-lg font-bold text-white">💬 {tr("Demande à un parent de te raconter l'histoire complète !", 'Ask a parent to tell you the whole story!')}</p>
            </>
          )}
        </article>
      )}
    </KidShell>
  );
}
