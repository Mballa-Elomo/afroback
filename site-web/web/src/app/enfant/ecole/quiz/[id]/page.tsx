'use client';

import { Suspense, use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { KidButton, KidShell, Soon } from '@/components/kids';
import { useKid } from '@/lib/kid';
import { enregistrerLecon, enregistrerNiveau, lecon, PASS_RATIO, questionLocale, questionsLecon, questionsNiveau, type Question } from '@/lib/kids';
import { useLang } from '@/lib/lang-client';

/**
 * Quiz (comme app/enfant/ecole/quiz/[leconId].tsx) : quiz d'une leçon, ou
 * Grand Quiz du niveau quand l'identifiant vaut « final ». Réussite à 60 %.
 * Aucune question n'est encore rédigée : état « pas encore prêt » honnête.
 */
export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <Quiz id={id} />
    </Suspense>
  );
}

function Quiz({ id }: { id: string }) {
  const { kid } = useKid();
  const { tr, lang } = useLang();
  const router = useRouter();
  const sp = useSearchParams();
  const isFinal = id === 'final';
  const niveau = Number(sp.get('niveau') ?? 1);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [good, setGood] = useState(0);
  const [saving, setSaving] = useState(false);
  // Niveau 1 (3-5 ans) : quiz à faire avec un parent (décision de Yannick, 2026-10-07).
  const [niveauLecon, setNiveauLecon] = useState<number | null>(null);

  useEffect(() => {
    (isFinal ? questionsNiveau(niveau) : questionsLecon(id)).then(setQs);
    if (!isFinal) lecon(id).then((l) => setNiveauLecon(l?.niveau ?? null));
  }, [id, isFinal, niveau]);
  const niveauQuiz = isFinal ? niveau : niveauLecon;

  const back = isFinal ? '/enfant/ecole' : `/enfant/ecole/lecon/${id}`;
  if (qs === null)
    return (
      <KidShell back={back} title="Quiz">
        <p className="text-center text-xl font-bold text-white/60">{tr('Le quiz se prépare…', 'The quiz is getting ready…')}</p>
      </KidShell>
    );
  if (qs.length === 0)
    return (
      <KidShell back={back} title="Quiz">
        <Soon icon="📝" text={tr('Ce quiz n’est pas encore prêt, reviens un peu plus tard !', 'This quiz is not ready yet, come back a bit later!')} />
      </KidShell>
    );

  const lq = questionLocale(qs[i], lang);
  const q = { question: lq.question, choix: lq.choix, reponse_correcte_index: lq.bonne };
  const last = i === qs.length - 1;
  const correct = picked === q.reponse_correcte_index;

  const next = async () => {
    if (!last) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    if (!kid) return;
    const reussi = good / qs.length >= PASS_RATIO;
    setSaving(true);
    if (isFinal) {
      await enregistrerNiveau(kid.id, niveau, good, reussi);
      if (reussi) {
        const max = niveau >= 4;
        router.replace(`/enfant/ecole/niveau-suivant?niveau=${max ? niveau : niveau + 1}&complete=${max ? 1 : 0}`);
        return;
      }
    } else {
      await enregistrerLecon(kid.id, id, good, reussi);
    }
    router.replace(`/enfant/ecole/resultat?score=${good}&total=${qs.length}&reussi=${reussi ? 1 : 0}&mode=${isFinal ? 'final' : 'lecon'}&lecon=${isFinal ? '' : id}`);
  };

  return (
    <KidShell back={back} title={isFinal ? tr('Grand Quiz', 'Big Quiz') : 'Quiz'}>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div animate={{ width: `${((i + (picked !== null ? 1 : 0)) / qs.length) * 100}%` }} className="h-full rounded-full bg-gradient-to-r from-gold to-[#ff9d5c]" />
          </div>
          <span className="font-black text-white/70">
            {i + 1}/{qs.length}
          </span>
        </div>
        {niveauQuiz === 1 && (
          <p className="mt-6 inline-block rounded-full bg-gold/15 px-4 py-2 font-bold text-gold">👨‍👩‍👧 {tr('À faire avec un parent', 'Do it with a parent')}</p>
        )}
        <AnimatePresence mode="wait">
          {picked === null ? (
            <motion.div key={`q${i}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <h1 className="mt-10 text-3xl font-black leading-tight text-white md:text-4xl">{q.question}</h1>
              <div className="mt-8 grid gap-4">
                {q.choix.map((c, k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setPicked(k);
                      if (k === q.reponse_correcte_index) setGood((g) => g + 1);
                    }}
                    className="rounded-[24px] bg-white/10 px-6 py-5 text-left text-xl font-bold text-white ring-2 ring-white/10 transition hover:bg-white/15 hover:ring-gold"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key={`f${i}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 text-center">
              <p className="text-7xl">{correct ? '🎉' : '💡'}</p>
              <p className="mt-4 text-4xl font-black text-white">{correct ? tr('Bravo !', 'Well done!') : tr('Presque !', 'Almost!')}</p>
              <p className="mt-3 text-xl text-white/80">{correct ? tr('Bonne réponse !', 'Right answer!') : tr(`La bonne réponse était : ${q.choix[q.reponse_correcte_index]}`, `The right answer was: ${q.choix[q.reponse_correcte_index]}`)}</p>
              {lq.explication && (
                <div className="mx-auto mt-6 max-w-lg rounded-[24px] bg-gold/10 p-5 text-left ring-2 ring-gold/30">
                  <p className="font-black text-gold">💡 {tr('Le savais-tu ?', 'Did you know?')}</p>
                  <p className="mt-1 text-lg leading-relaxed text-white/90">{lq.explication}</p>
                </div>
              )}
              <div className="mx-auto mt-8 max-w-sm">
                <KidButton onClick={next} disabled={saving}>
                  {saving ? tr('Un instant…', 'One moment…') : last ? tr('Voir mon score', 'See my score') : tr('Continuer', 'Continue')}
                </KidButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </KidShell>
  );
}
