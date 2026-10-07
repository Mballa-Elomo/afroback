'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { KidButton, KidShell } from '@/components/kids';
import { niveaux, type Niveau } from '@/lib/kids';
import { loc } from '@/lib/lang';
import { useLang } from '@/lib/lang-client';

/** Passage de niveau, ou fin de l'École des Héros après le niveau 4. */
export default function NiveauSuivantPage() {
  return (
    <Suspense fallback={null}>
      <NiveauSuivant />
    </Suspense>
  );
}

function NiveauSuivant() {
  const sp = useSearchParams();
  const { tr, lang } = useLang();
  const n = Number(sp.get('niveau') ?? 1);
  const complete = sp.get('complete') === '1';
  const [info, setInfo] = useState<Niveau | undefined>();
  useEffect(() => {
    if (!complete) niveaux().then((l) => setInfo(l.find((x) => x.niveau === n)));
  }, [n, complete]);

  return (
    <KidShell title={tr('École des Héros', 'School of Heroes')}>
      <div className="mx-auto max-w-md text-center">
        <motion.p initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }} className="text-8xl">
          🎊
        </motion.p>
        <p className="mt-4 text-sm font-black tracking-[0.25em] text-gold">{complete ? tr('ÉCOLE DES HÉROS TERMINÉE', 'SCHOOL OF HEROES COMPLETED') : tr('NIVEAU TERMINÉ', 'LEVEL COMPLETED')}</p>
        <p className="mt-2 text-4xl font-black text-white">{complete
            ? tr('Tu as terminé tous les niveaux !', 'You finished every level!')
            : `${tr('Niveau suivant :', 'Next level:')} ${info ? loc(info as never, 'nom', lang) : `${tr('Niveau', 'Level')} ${n}`}`}</p>
        {!complete && (
          <div className="mt-8 flex justify-center gap-4">
            {[0, 1, 2].map((k) => (
              <motion.span key={k} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + k * 0.15 }} className="grid h-20 w-20 place-items-center rounded-full bg-white/10 text-3xl grayscale">
                👤
              </motion.span>
            ))}
          </div>
        )}
        <div className="mt-10">
          <KidButton href={complete ? '/enfant' : '/enfant/ecole'}>{complete ? tr('Retour à l’accueil', 'Back to home') : tr('Continuer', 'Continue')}</KidButton>
        </div>
      </div>
    </KidShell>
  );
}
