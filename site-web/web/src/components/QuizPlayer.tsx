'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMember } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';
import { TYPE_PATH } from '@/lib/catalogue';
import {
  explication,
  getQuiz,
  melanger,
  messageScore,
  niveauNom,
  niveauRatio,
  questionTexte,
  terminerQuiz,
  verifierReponse,
  type Correction,
  type FinQuiz,
  type QuizQuestion,
  type QuizStatut,
  type QuizType,
} from '@/lib/quiz';
import { LevelBar, Trophy } from './quiz';

/**
 * Écran du quiz (cdc-quiz-progression.md, 4.2 et 4.3) : une question à la
 * fois, réponses mélangées à chaque tentative, correction immédiate par le
 * serveur (verifier_reponse_quiz) avec l'explication, pas de chronomètre.
 * Fin : score recalculé côté serveur (terminer_quiz), points, niveau.
 * Les index envoyés au serveur sont toujours ceux du tableau d'origine.
 */

type Etape = { ordre: number[]; choix: number | null; correction: Correction | null };
type Phase = 'question' | 'envoi' | 'resultat' | 'recap';

export function QuizPlayer({ type, slug, title, image }: { type: QuizType; slug: string; title: string; image: string | null }) {
  const { ready, session, member } = useMember();
  const { lang, tr } = useLang();
  const base = `/${TYPE_PATH[type]}/${slug}`;
  const [statut, setStatut] = useState<QuizStatut | 'chargement'>('chargement');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>('question');
  const [verif, setVerif] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [fin, setFin] = useState<FinQuiz | null>(null);
  const suivantRef = useRef<HTMLButtonElement>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);

  const demarrer = useCallback((qs: QuizQuestion[]) => {
    setEtapes(qs.map((q) => ({ ordre: melanger(q.choix_fr.length), choix: null, correction: null })));
    setI(0);
    setPhase('question');
    setFin(null);
    setErreur(null);
  }, []);

  // Session prête (invité, ou compte vérifié) avant de demander les questions.
  const uid = session?.user?.id;
  const pret = ready && (!session || member);
  useEffect(() => {
    if (!pret) return;
    let alive = true;
    getQuiz(type, slug).then((r) => {
      if (!alive) return;
      if (r.statut === 'ok' && r.questions) {
        const qs = [...r.questions].sort((a, b) => a.ordre - b.ordre);
        setQuestions(qs);
        demarrer(qs);
      }
      setStatut(r.statut);
    });
    return () => {
      alive = false;
    };
  }, [pret, uid, type, slug, demarrer]);

  const etape = etapes[i];
  useEffect(() => {
    if (etape?.correction) suivantRef.current?.focus();
  }, [etape?.correction]);
  useEffect(() => {
    if (phase === 'question') titreRef.current?.focus();
  }, [i, phase]);

  if (statut === 'chargement') return <Frame base={base} title={title}><p className="py-20 text-center text-body">{tr('Le quiz se prépare…', 'The quiz is getting ready…')}</p></Frame>;
  if (statut === 'indisponible') return <Frame base={base} title={title}><Indisponible base={base} /></Frame>;
  if (statut === 'compte_requis') return <Frame base={base} title={title}><CompteRequis suite={`${base}/quiz`} /></Frame>;
  if (statut === 'verrouille') return <Frame base={base} title={title}><Verrouille base={base} /></Frame>;

  const total = questions.length;
  const q = questions[i];

  const choisir = async (original: number) => {
    if (!etape || etape.choix !== null || verif) return;
    setErreur(null);
    setVerif(true);
    setEtapes((es) => es.map((e, k) => (k === i ? { ...e, choix: original } : e)));
    const c = await verifierReponse(q.id, original);
    setVerif(false);
    if (!c) {
      setEtapes((es) => es.map((e, k) => (k === i ? { ...e, choix: null } : e)));
      setErreur(tr("La correction n'a pas pu être chargée. Vérifie ta connexion et réessaie.", 'The answer could not be checked. Check your connection and try again.'));
      return;
    }
    setEtapes((es) => es.map((e, k) => (k === i ? { ...e, correction: c } : e)));
  };

  const terminer = async () => {
    setPhase('envoi');
    setErreur(null);
    const res = await terminerQuiz(
      type,
      slug,
      questions.map((qq, k) => ({ question_id: qq.id, choix: etapes[k]?.choix ?? -1 })),
    );
    if (!res) {
      setPhase('question');
      setErreur(tr("Ton résultat n'a pas pu être enregistré. Vérifie ta connexion et réessaie.", 'Your result could not be saved. Check your connection and try again.'));
      return;
    }
    setFin(res);
    setPhase('resultat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const suivant = () => {
    if (i < total - 1) {
      setI(i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else terminer();
  };

  if (phase === 'resultat' && fin) {
    return (
      <Frame base={base} title={title}>
        <Resultat fin={fin} base={base} onRecap={() => setPhase('recap')} onRetry={() => demarrer(questions)} />
      </Frame>
    );
  }
  if (phase === 'recap') {
    return (
      <Frame base={base} title={title}>
        <Recap questions={questions} etapes={etapes} onBack={() => setPhase('resultat')} />
      </Frame>
    );
  }

  const { question, choix } = questionTexte(q, lang);
  const avance = (i + (etape?.correction ? 1 : 0)) / total;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-2xl" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/90 to-ink" />
      <div className="relative mx-auto max-w-2xl px-4 pb-16 pt-24 md:pt-32">
        {/* En-tête : quitter, progression, 2/5 */}
        <div className="flex items-center gap-4">
          <Link
            href={base}
            aria-label={tr('Quitter le quiz', 'Leave the quiz')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ivory/10 text-lg text-ivory transition hover:bg-ivory/20 focus-visible:outline-2 focus-visible:outline-gold"
          >
            ✕
          </Link>
          <div
            className="h-2.5 flex-1 overflow-hidden rounded-full bg-ivory/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={i + (etape?.correction ? 1 : 0)}
            aria-label={tr('Avancement du quiz', 'Quiz progress')}
          >
            <motion.div animate={{ width: `${avance * 100}%` }} transition={{ duration: 0.4 }} className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold" />
          </div>
          <span className="shrink-0 font-display text-lg font-bold text-gold">
            {i + 1}/{total}
          </span>
        </div>
        <p className="mt-6 text-xs font-bold tracking-[0.2em] text-gold">QUIZ · {title.toUpperCase()}</p>

        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <h1 ref={titreRef} tabIndex={-1} className="mt-3 font-display text-2xl font-bold leading-snug text-ivory outline-none md:text-3xl">
              {question}
            </h1>
            <div className="mt-7 grid gap-3" role="group" aria-label={tr('Réponses', 'Answers')}>
              {etape?.ordre.map((original) => {
                const c = etape.correction;
                const pris = etape.choix === original;
                const bonne = c && c.bonne_reponse === original;
                const fausse = c && pris && !c.correct;
                const tone = bonne
                  ? 'bg-free/15 ring-free text-ivory'
                  : fausse
                    ? 'bg-terra-deep/25 ring-terra text-ivory'
                    : pris
                      ? 'bg-gold/15 ring-gold text-ivory'
                      : c
                        ? 'bg-ivory/[0.04] ring-ivory/10 text-muted'
                        : 'bg-ivory/[0.06] ring-ivory/15 text-text hover:bg-ivory/10 hover:ring-gold/60';
                return (
                  <button
                    key={original}
                    type="button"
                    onClick={() => choisir(original)}
                    disabled={etape.choix !== null}
                    aria-pressed={pris}
                    className={`flex min-h-[60px] items-center gap-3 rounded-2xl px-5 py-4 text-left text-[17px] font-semibold ring-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-default ${tone}`}
                  >
                    <span className="flex-1">{choix[original]}</span>
                    {bonne && (
                      <span className="shrink-0 text-free" aria-label={tr('Bonne réponse', 'Right answer')}>
                        ✓
                      </span>
                    )}
                    {fausse && (
                      <span className="shrink-0 text-terra" aria-label={tr('Mauvaise réponse', 'Wrong answer')}>
                        ✕
                      </span>
                    )}
                    {pris && !c && <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gold border-t-transparent" aria-hidden />}
                  </button>
                );
              })}
            </div>

            <div aria-live="polite">
              {etape?.correction && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 rounded-2xl p-5 ring-1 ${etape.correction.correct ? 'bg-free/10 ring-free/40' : 'bg-terra-deep/15 ring-terra/40'}`}>
                  <p className={`font-display text-lg font-bold ${etape.correction.correct ? 'text-free' : 'text-terra'}`}>
                    {etape.correction.correct ? tr('Bonne réponse !', 'Right answer!') : tr('Pas tout à fait…', 'Not quite…')}
                  </p>
                  <p className="mt-1 leading-relaxed text-text">{explication(etape.correction, lang)}</p>
                </motion.div>
              )}
              {erreur && <p className="mt-5 rounded-xl bg-terra-deep/20 p-4 text-sm text-text ring-1 ring-terra/40">{erreur}</p>}
            </div>

            {etape?.correction && (
              <button
                ref={suivantRef}
                type="button"
                onClick={suivant}
                disabled={phase === 'envoi'}
                className="mt-6 w-full rounded-full bg-gold py-4 font-extrabold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.3)] transition hover:bg-gold-pale focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory disabled:opacity-60"
              >
                {phase === 'envoi' ? tr('Un instant…', 'One moment…') : i < total - 1 ? tr('Question suivante', 'Next question') : tr('Voir mon résultat', 'See my result')}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Frame({ base, title, children }: { base: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 pb-16 pt-24 md:pt-32">
      <Link href={base} className="text-sm font-semibold text-gold hover:underline">
        ‹ {title}
      </Link>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Resultat({ fin, base, onRecap, onRetry }: { fin: FinQuiz; base: string; onRecap: () => void; onRetry: () => void }) {
  const { lang, tr } = useLang();
  const monte = fin.niveau.rang > fin.niveau_avant.rang;
  const from = monte ? 0 : niveauRatio(fin.points - fin.points_gagnes, fin.niveau);
  const meilleurGarde = fin.points_gagnes === 0 && fin.meilleur_avant !== null && fin.meilleur_avant >= fin.score;
  const btn = 'rounded-full py-3.5 font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/40">
        <Trophy size={30} />
      </span>
      <p className="mt-5 text-xs font-bold tracking-[0.25em] text-gold">{tr('TON SCORE', 'YOUR SCORE')}</p>
      <h1 className="text-gold-gradient mt-1 font-display text-7xl font-black md:text-8xl">
        {fin.score}/{fin.total}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-lg text-text">{messageScore(fin.score, fin.total, lang)}</p>

      <div className="mx-auto mt-8 max-w-md rounded-3xl bg-surface p-6 text-left ring-1 ring-gold/25">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-2xl font-black text-gold">
            {fin.points_gagnes > 0
              ? `+${fin.points_gagnes} ${fin.points_gagnes > 1 ? 'points' : 'point'}`
              : tr('Aucun point cette fois', 'No points this time')}
          </p>
          <p className="text-sm text-body">
            {fin.points} pts · {niveauNom(fin.niveau.code, lang)}
          </p>
        </div>
        {meilleurGarde && <p className="mt-1 text-xs text-muted">{tr(`Seul ton meilleur score compte (${fin.meilleur_avant}/${fin.total}).`, `Only your best score counts (${fin.meilleur_avant}/${fin.total}).`)}</p>}
        <div className="mt-4">
          <LevelBar points={fin.points} niveau={fin.niveau} from={from} />
        </div>
        {monte && (
          <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }} className="mt-4 rounded-xl bg-gold/15 px-4 py-3 text-center font-bold text-gold ring-1 ring-gold/40" role="status">
            ✨ {tr('Nouveau niveau :', 'New level:')} {niveauNom(fin.niveau.code, lang)}
          </motion.p>
        )}
      </div>

      <div className="mx-auto mt-8 grid max-w-md gap-3">
        <button type="button" onClick={onRecap} className={`${btn} bg-gold text-ink hover:bg-gold-pale`}>
          {tr('Revoir mes réponses', 'Review my answers')}
        </button>
        <button type="button" onClick={onRetry} className={`${btn} border border-gold/40 text-gold hover:bg-gold/10`}>
          {tr('Refaire le quiz', 'Retake the quiz')}
        </button>
        <Link href={base} className={`${btn} text-body hover:text-ivory`}>
          {tr("Retour à l'histoire", 'Back to the story')}
        </Link>
        <Link href="/compte/progression" className="text-sm font-semibold text-gold hover:underline">
          {tr('Voir ma progression', 'See my progress')}
        </Link>
      </div>
    </motion.div>
  );
}

function Recap({ questions, etapes, onBack }: { questions: QuizQuestion[]; etapes: Etape[]; onBack: () => void }) {
  const { lang, tr } = useLang();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ivory">{tr('Mes réponses', 'My answers')}</h1>
      <ol className="mt-6 space-y-4">
        {questions.map((q, k) => {
          const e = etapes[k];
          const c = e?.correction;
          const { question, choix } = questionTexte(q, lang);
          return (
            <li key={q.id} className={`rounded-2xl bg-surface p-5 ring-1 ${c?.correct ? 'ring-free/35' : 'ring-terra/35'}`}>
              <p className="text-xs font-bold tracking-[0.18em] text-gold">QUESTION {k + 1}</p>
              <p className="mt-1 font-bold text-ivory">{question}</p>
              {e?.choix !== null && e?.choix !== undefined && (
                <p className={`mt-3 text-sm ${c?.correct ? 'text-free' : 'text-terra'}`}>
                  {c?.correct ? '✓' : '✕'} {tr('Ta réponse :', 'Your answer:')} {choix[e.choix]}
                </p>
              )}
              {c && !c.correct && (
                <p className="mt-1 text-sm text-free">
                  ✓ {tr('Bonne réponse :', 'Right answer:')} {choix[c.bonne_reponse]}
                </p>
              )}
              {c && <p className="mt-3 text-sm leading-relaxed text-body">{explication(c, lang)}</p>}
            </li>
          );
        })}
      </ol>
      <button type="button" onClick={onBack} className="mt-8 w-full rounded-full bg-gold py-3.5 font-bold text-ink hover:bg-gold-pale focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory">
        ‹ {tr('Retour au résultat', 'Back to the result')}
      </button>
    </div>
  );
}

function Indisponible({ base }: { base: string }) {
  const { tr } = useLang();
  return (
    <div className="rounded-3xl bg-surface p-8 text-center ring-1 ring-gold/20">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/10 text-gold">
        <Trophy size={26} />
      </span>
      <p className="mt-4 font-display text-xl font-bold text-ivory">{tr('Le quiz de cette histoire arrive bientôt', 'The quiz for this story is coming soon')}</p>
      <p className="mt-2 text-sm text-body">{tr('Le griot prépare ses questions. Reviens un peu plus tard !', 'The griot is preparing the questions. Come back a little later!')}</p>
      <Link href={base} className="mt-6 inline-block rounded-full bg-gold px-6 py-3 font-bold text-ink hover:bg-gold-pale">
        {tr("Retour à l'histoire", 'Back to the story')}
      </Link>
    </div>
  );
}

function CompteRequis({ suite }: { suite: string }) {
  const { tr } = useLang();
  return (
    <div className="rounded-3xl bg-surface p-8 text-center ring-1 ring-gold/25">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-medaillon.jpg" alt="" className="mx-auto h-16 w-16 rounded-full ring-2 ring-gold" />
      <p className="mt-4 font-display text-xl font-bold text-ivory">{tr('Crée ton compte pour tester tes connaissances', 'Create your account to test your knowledge')}</p>
      <p className="mt-2 text-sm text-body">{tr('Ton score et ta progression sont gardés sur ton compte, le même sur l’application et sur le site.', 'Your score and progress are saved to your account, the same in the app and on the site.')}</p>
      <div className="mx-auto mt-6 grid max-w-xs gap-3">
        <Link href={`/connexion?suite=${encodeURIComponent(suite)}`} className="rounded-full bg-gold px-5 py-3 font-bold text-ink hover:bg-gold-pale">
          {tr('Se connecter', 'Sign in')}
        </Link>
        <Link href="/inscription" className="rounded-full border border-gold/40 px-5 py-3 font-bold text-gold hover:bg-gold/10">
          {tr('Créer un compte', 'Create an account')}
        </Link>
      </div>
    </div>
  );
}

function Verrouille({ base }: { base: string }) {
  const { tr } = useLang();
  return (
    <div className="rounded-3xl border border-gold/25 bg-surface p-8 text-center">
      <p className="font-display text-xl font-bold text-ivory">{tr('Ce quiz est réservé aux abonnés', 'This quiz is for members only')}</p>
      <p className="mt-2 text-sm text-body">{tr("Comme l'histoire elle-même : abonne-toi pour lire, écouter, regarder et tester tes connaissances sur tous les récits.", 'Just like the story itself: subscribe to read, listen, watch and test your knowledge on every story.')}</p>
      <Link href="/abonnement" className="mt-6 inline-block rounded-full bg-gold px-6 py-3 font-bold text-ink hover:bg-gold-pale">
        {tr('Voir les abonnements', 'See subscriptions')}
      </Link>
      <div className="mt-3">
        <Link href={base} className="text-sm text-muted hover:text-text">
          {tr("Retour à l'histoire", 'Back to the story')}
        </Link>
      </div>
    </div>
  );
}
