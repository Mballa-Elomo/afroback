"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { KidShell, Soon } from "@/components/kids";
import { useKid } from "@/lib/kid";
import {
  heroesList,
  shortEra,
  leconsDuNiveau,
  niveaux,
  progression,
  quizNiveauReussi,
  resultats,
  type Lecon,
  type Niveau,
  type Resultat,
} from "@/lib/kids";
import type { HerosCard } from "@/lib/types";
import { useLang } from '@/lib/lang-client';
import { loc } from '@/lib/lang';

/**
 * Carte du niveau (comme app/enfant/ecole/index.tsx) : de vrais héros du
 * catalogue, déblocage dans l'ordre (une leçon s'ouvre quand la précédente
 * est réussie), puis le Grand Quiz du niveau. Tant qu'aucun contenu enfant
 * n'est produit, seule la première leçon est ouverte : c'est attendu.
 */
export default function Ecole() {
  const { kid } = useKid();
  const { tr, lang } = useLang();
  const [niveau, setNiveau] = useState<number | null>(null);
  const [info, setInfo] = useState<Niveau | undefined>();
  const [lecons, setLecons] = useState<Lecon[]>([]);
  const [res, setRes] = useState<Map<string, Resultat>>(new Map());
  const [heroes, setHeroes] = useState<HerosCard[]>([]);
  const [finalOk, setFinalOk] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!kid) return;
    (async () => {
      try {
        const n = await progression(kid.id);
        const [all, l, h] = await Promise.all([
          niveaux(),
          leconsDuNiveau(n),
          heroesList(),
        ]);
        setRes(
          await resultats(
            kid.id,
            l.map((x) => x.id),
          ),
        );
        setFinalOk(await quizNiveauReussi(kid.id, n));
        setInfo(all.find((x) => x.niveau === n));
        setLecons(l);
        setHeroes(h);
        setNiveau(n);
      } catch {
        setFailed(true);
      }
    })();
  }, [kid]);

  const byId = useMemo(() => new Map(heroes.map((h) => [h.id, h])), [heroes]);
  const rows = useMemo(() => {
    let prevDone = true;
    return lecons.map((l) => {
      const done = res.get(l.id)?.statut === "termine";
      const etat = done ? "termine" : prevDone ? "disponible" : "verrouille";
      prevDone = done;
      return { l, hero: byId.get(l.heros_id), etat };
    });
  }, [lecons, res, byId]);
  const nbDone = rows.filter((r) => r.etat === "termine").length;
  const pct = rows.length ? Math.round((nbDone / rows.length) * 100) : 0;
  const finalUnlocked = rows.length > 0 && nbDone === rows.length;

  return (
    <KidShell back="/enfant" title={tr('École des Héros', 'School of Heroes')}>
      {failed ? (
        <Soon
          icon="📡"
          text={tr('Oups, la carte n’a pas pu se charger. Réessaie dans un instant !', 'Oops, the map could not load. Try again in a moment!')}
        />
      ) : niveau === null ? (
        <p className="text-center text-xl font-bold text-white/60">
          {tr('Ta carte se prépare…', 'Your map is getting ready…')}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black tracking-[0.25em] text-gold">
                {tr('NIVEAU', 'LEVEL')} {niveau}
              </p>
              <h1 className="text-4xl font-black text-white md:text-5xl">
                {info ? loc(info as never, 'nom', lang) : `${tr('Niveau', 'Level')} ${niveau}`}
              </h1>
              {info && (
                <p className="mt-1 font-semibold text-white/60">
                  {loc(info as never, 'tranche_age', lang)}
                </p>
              )}
            </div>
            <Link
              href="/enfant/ecole/collection"
              className="rounded-[22px] bg-white/10 px-5 py-3 text-lg font-black text-white hover:bg-white/20"
            >
              🏅 {tr('Ma collection', 'My collection')}
            </Link>
          </div>
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-gold to-[#ff9d5c]"
            />
          </div>
          <p className="mt-2 font-bold text-white/70">
            {tr(`${nbDone} sur ${rows.length || '—'} héros débloqués`, `${nbDone} of ${rows.length || '—'} heroes unlocked`)}
          </p>

          <ol className="relative mx-auto mt-10 max-w-xl">
            <span className="absolute bottom-10 left-[38px] top-10 w-1.5 rounded-full bg-white/10" />
            {rows.length === 0 && (
              <p className="text-white/70">
                {tr("Ce niveau n'a pas encore de héros.", 'This level has no heroes yet.')}
              </p>
            )}
            {rows.map((r, i) => {
              const inner = (
                <>
                  <span
                    className={`relative z-[1] grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full text-3xl ring-4 ${
                      r.etat === "termine"
                        ? "bg-gold ring-gold"
                        : r.etat === "disponible"
                          ? "bg-[#C25E2E] ring-white animate-pulse"
                          : "bg-white/10 ring-white/10"
                    }`}
                  >
                    {r.etat !== "verrouille" &&
                    r.hero?.image_carte_catalogue ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.hero.image_carte_catalogue}
                        alt=""
                        className="h-full w-full object-cover object-top"
                      />
                    ) : r.etat === "verrouille" ? (
                      "🔒"
                    ) : (
                      "👤"
                    )}
                    {r.etat === "termine" && (
                      <span className="absolute -right-1 -top-1 text-2xl">
                        ⭐
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-xl font-black ${r.etat === "verrouille" ? "text-white/40" : "text-white"}`}
                    >
                      {r.hero ? loc(r.hero as never, 'nom_affiche', lang) : tr('Héros à venir', 'Hero coming soon')}
                    </span>
                    <span className="block truncate text-sm font-semibold text-white/50">
                      {r.hero ? shortEra(loc(r.hero as never, 'epoque', lang)) : '—'}
                    </span>
                  </span>
                </>
              );
              return (
                <motion.li
                  key={r.l.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="mb-5"
                >
                  {r.etat === "verrouille" ? (
                    <div className="flex items-center gap-5 rounded-[28px] p-3">
                      {inner}
                    </div>
                  ) : (
                    <Link
                      href={`/enfant/ecole/lecon/${r.l.id}`}
                      className="flex items-center gap-5 rounded-[28px] p-3 transition hover:bg-white/10"
                    >
                      {inner}
                    </Link>
                  )}
                </motion.li>
              );
            })}
            <li>
              {finalUnlocked ? (
                <Link
                  href={`/enfant/ecole/quiz/final?niveau=${niveau}`}
                  className="flex items-center gap-5 rounded-[28px] bg-gold/15 p-3 ring-2 ring-gold"
                >
                  <span className="relative z-[1] grid h-20 w-20 place-items-center rounded-full bg-gold text-4xl">
                    {finalOk ? "🏆" : "🚪"}
                  </span>
                  <span>
                    <span className="block text-xl font-black text-white">
                      {tr('Grand Quiz du niveau', 'Big level quiz')}
                    </span>
                    <span className="block text-sm font-semibold text-gold">
                      {tr('Débloque le niveau suivant', 'Unlocks the next level')}
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-5 p-3">
                  <span className="relative z-[1] grid h-20 w-20 place-items-center rounded-full bg-white/10 text-3xl">
                    🔒
                  </span>
                  <span>
                    <span className="block text-xl font-black text-white/40">
                      {tr('Grand Quiz du niveau', 'Big level quiz')}
                    </span>
                    <span className="block text-sm font-semibold text-white/40">
                      {tr('Termine tous les héros du niveau', 'Finish every hero of the level')}
                    </span>
                  </span>
                </div>
              )}
            </li>
          </ol>
        </>
      )}
    </KidShell>
  );
}
