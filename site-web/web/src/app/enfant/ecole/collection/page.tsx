'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { KidShell } from '@/components/kids';
import { useKid } from '@/lib/kid';
import { heroesList, resultats, toutesLecons, type Lecon, type Resultat } from '@/lib/kids';
import type { HerosCard } from '@/lib/types';
import { useLang } from '@/lib/lang-client';
import { loc } from '@/lib/lang';

/** Ma collection : un héros est débloqué dès qu'une de ses leçons est réussie (comme l'app). */
export default function Collection() {
  const { kid } = useKid();
  const { tr, lang } = useLang();
  const [lecons, setLecons] = useState<Lecon[] | null>(null);
  const [res, setRes] = useState<Map<string, Resultat>>(new Map());
  const [heroes, setHeroes] = useState<HerosCard[]>([]);

  useEffect(() => {
    if (!kid) return;
    (async () => {
      try {
        const [all, h] = await Promise.all([toutesLecons(), heroesList()]);
        setRes(await resultats(kid.id, all.map((l) => l.id)));
        setHeroes(h);
        setLecons(all);
      } catch {
        setLecons([]);
      }
    })();
  }, [kid]);

  const cards = useMemo(() => {
    const byHero = new Map<string, boolean>();
    (lecons ?? []).forEach((l) => byHero.set(l.heros_id, (byHero.get(l.heros_id) ?? false) || res.get(l.id)?.statut === 'termine'));
    return heroes.filter((h) => byHero.has(h.id)).map((h) => ({ h, ok: byHero.get(h.id)! }));
  }, [lecons, res, heroes]);

  return (
    <KidShell back="/enfant/ecole" title={tr('Ma collection', 'My collection')}>
      {lecons === null ? (
        <p className="text-center text-xl font-bold text-white/60">{tr('Ta collection se prépare…', 'Your collection is getting ready…')}</p>
      ) : cards.length === 0 ? (
        <p className="text-center text-white/70">{tr("Aucun héros pour l'instant.", 'No heroes yet.')}</p>
      ) : (
        <>
          <p className="text-lg font-bold text-white/70">
            {tr(`${cards.filter((c) => c.ok).length} héros débloqués sur ${cards.length}`, `${cards.filter((c) => c.ok).length} heroes unlocked out of ${cards.length}`)}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {cards.map(({ h, ok }, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="text-center">
                <div className={`relative mx-auto aspect-square overflow-hidden rounded-[28px] ring-4 ${ok ? 'ring-gold' : 'ring-white/10'}`}>
                  {h.image_carte_catalogue && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.image_carte_catalogue} alt="" className={`h-full w-full object-cover object-top ${ok ? '' : 'blur-md brightness-50 grayscale'}`} />
                  )}
                  <span className="absolute inset-0 grid place-items-center text-5xl">{ok ? '' : '🔒'}</span>
                  {ok && <span className="absolute right-2 top-2 text-3xl">🏅</span>}
                </div>
                <p className={`mt-3 font-black ${ok ? 'text-white' : 'text-white/40'}`}>{loc(h as never, 'nom_affiche', lang)}</p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </KidShell>
  );
}
