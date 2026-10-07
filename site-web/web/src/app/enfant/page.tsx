'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { KidShell } from '@/components/kids';
import { useKid } from '@/lib/kid';
import { heroDuJour, heroesList } from '@/lib/kids';
import type { HerosCard } from '@/lib/types';
import { useLang } from '@/lib/lang-client';
import { loc } from '@/lib/lang';

/**
 * Accueil enfant, comme dans l'app (app/enfant/accueil.tsx) : École des
 * Héros, Histoire du jour (un vrai héros du catalogue), Carnet
 * d'explorateur si le parent l'a activé. « Apprendre une langue » reste
 * annoncé comme bientôt disponible : aucune leçon n'existe encore.
 */
export default function AccueilEnfant() {
  const { kid } = useKid();
  const { tr, lang } = useLang();
  const [hero, setHero] = useState<HerosCard | undefined>();
  const [soon, setSoon] = useState(false);
  useEffect(() => {
    heroesList().then((l) => setHero(heroDuJour(l)));
  }, []);

  return (
    <KidShell>
      {kid && (
        <>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-bold text-white/70">
            {tr('Salut,', 'Hi,')}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-5xl font-black text-white md:text-6xl">
            {kid.prenom} ! 👋
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.015, rotate: -0.4 }}>
            <Link
              href="/enfant/ecole"
              className="relative mt-8 block overflow-hidden rounded-[36px] bg-gradient-to-br from-[#D9A441] to-[#B06A1E] p-8 shadow-[0_10px_0_#7a4512] md:p-10"
            >
              <span className="absolute -right-6 -top-6 text-[150px] opacity-25 md:text-[200px]">🏅</span>
              <p className="text-sm font-black tracking-[0.25em] text-[#3a1d05]/70">{tr('ÉCOLE DES HÉROS', 'SCHOOL OF HEROES')}</p>
              <p className="mt-2 max-w-md text-4xl font-black leading-tight text-[#2a1503] md:text-5xl">{tr('Découvre tes héros africains', 'Meet your African heroes')}</p>
              <span className="mt-6 inline-block rounded-full bg-[#2a1503] px-6 py-3 text-lg font-black text-gold">{tr('Jouer ▶', 'Play ▶')}</span>
            </Link>
          </motion.div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              whileHover={{ scale: 1.02, rotate: 0.6 }}
              onClick={() => setSoon(true)}
              className="rounded-[32px] bg-gradient-to-br from-[#3E6B8B] to-[#274a63] p-7 text-left shadow-[0_8px_0_#1a3346]"
            >
              <p className="text-5xl">🗣️</p>
              <p className="mt-4 text-2xl font-black text-white">{tr('Apprendre une langue', 'Learn a language')}</p>
              <p className="mt-1 text-sm font-semibold text-white/70">{soon ? tr('Pas encore disponible, reviens bientôt !', 'Not available yet, come back soon!') : 'Ewondo, douala, bassa, bamiléké'}</p>
            </motion.button>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} whileHover={{ scale: 1.02, rotate: -0.6 }}>
              <Link
                href={hero ? `/enfant/histoire/${hero.slug}` : '#'}
                className="relative block h-full overflow-hidden rounded-[32px] bg-gradient-to-br from-[#C25E2E] to-[#8B3A2F] p-7 shadow-[0_8px_0_#5a2219]"
              >
                {hero?.image_carte_catalogue && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hero.image_carte_catalogue} alt="" className="absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-40 [mask-image:linear-gradient(to_left,black,transparent)]" />
                )}
                <p className="relative text-5xl">📖</p>
                <p className="relative mt-4 text-sm font-black tracking-[0.2em] text-white/70">{tr('HISTOIRE DU JOUR', 'STORY OF THE DAY')}</p>
                <p className="relative mt-1 text-2xl font-black text-white">{hero ? loc(hero as never, 'nom_affiche', lang) : '…'}</p>
              </Link>
            </motion.div>
          </div>

          {kid.decouverte_activee && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.015 }}>
              <Link href="/enfant/carnet" className="mt-6 flex items-center gap-5 rounded-[32px] bg-gradient-to-br from-[#5B4B8A] to-[#3A2E63] p-7 shadow-[0_8px_0_#241b40]">
                <span className="text-5xl">🧭</span>
                <span>
                  <span className="block text-2xl font-black text-white">{tr("Carnet d'explorateur", "Explorer's notebook")}</span>
                  <span className="block text-sm font-semibold text-white/70">{tr('Découvre un village africain !', 'Discover an African village!')}</span>
                </span>
                <span className="ml-auto text-3xl text-white/60">›</span>
              </Link>
            </motion.div>
          )}
        </>
      )}
    </KidShell>
  );
}
