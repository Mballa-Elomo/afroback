'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { KidButton, KidShell } from '@/components/kids';
import { useLang } from '@/lib/lang-client';

/** Résultat d'un quiz : toujours bienveillant, l'enfant peut toujours retenter. */
export default function ResultatPage() {
  return (
    <Suspense fallback={null}>
      <Resultat />
    </Suspense>
  );
}

function Resultat() {
  const sp = useSearchParams();
  const { tr, lang } = useLang();
  const score = Number(sp.get('score') ?? 0);
  const total = Number(sp.get('total') ?? 1);
  const reussi = sp.get('reussi') === '1';
  const lecon = sp.get('lecon');
  const ratio = total > 0 ? score / total : 0;
  const stars = ratio >= 1 ? 3 : ratio >= 0.8 ? 2 : ratio > 0 ? 1 : 0;

  return (
    <KidShell back="/enfant/ecole" title={tr('Résultat', 'Result')}>
      <div className="mx-auto max-w-md text-center">
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">
          {reussi ? '🎉' : '💪'}
        </motion.p>
        <p className="mt-4 text-5xl font-black text-white">
          {tr(`${score} sur ${total} !`, `${score} out of ${total}!`)}
        </p>
        <p className="mt-3 text-xl text-white/80">{reussi ? tr('Bravo, tu as bien retenu cette histoire !', 'Well done, you remembered this story!') : tr('Presque ! Regarde encore la leçon et réessaie, tu vas y arriver.', "Almost! Look at the lesson again and try once more, you'll get there.")}</p>
        <div className="mt-6 flex justify-center gap-3 text-5xl">
          {[1, 2, 3].map((n) => (
            <motion.span key={n} initial={{ opacity: 0, y: 20, rotate: -30 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.2 + n * 0.15 }}>
              {stars >= n ? '⭐' : '☆'}
            </motion.span>
          ))}
        </div>
        <div className="mt-10 space-y-3">
          {reussi ? (
            <KidButton href="/enfant/ecole">{tr('Continuer', 'Continue')}</KidButton>
          ) : (
            <>
              <KidButton href={lecon ? `/enfant/ecole/lecon/${lecon}` : '/enfant/ecole'}>{tr('Revoir la leçon', 'Review the lesson')}</KidButton>
              <KidButton href="/enfant/ecole" tone="ghost">
                {tr('Retour à la carte', 'Back to the map')}
              </KidButton>
            </>
          )}
        </div>
      </div>
    </KidShell>
  );
}
