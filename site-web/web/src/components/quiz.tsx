'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMember } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';
import { TYPE_PATH } from '@/lib/catalogue';
import type { ContentType } from '@/lib/types';
import { etatQuiz, isQuizType, maProgression, niveauNom, niveauRatio, type EtatQuiz, type Niveau, type Progression } from '@/lib/quiz';
import { AccountGate } from './ContentActions';

/**
 * Points d'entrée du quiz (cdc-quiz-progression.md, 4.1) : tuile sur la
 * fiche, carte dorée en fin de récit / audio / vidéo, résumé « Ma
 * progression » sur la page compte. Rien ne s'affiche tant qu'aucun quiz
 * n'existe pour ce contenu (ou si le script serveur n'est pas installé).
 */

export const quizHref = (type: ContentType, slug: string) => `/${TYPE_PATH[type]}/${slug}/quiz`;

/** État du quiz d'un contenu (disponible ? meilleur score ?), rafraîchi à la connexion. */
export function useEtatQuiz(type: ContentType, slug: string): EtatQuiz | null {
  const { session } = useMember();
  const [etat, setEtat] = useState<EtatQuiz | null>(null);
  const uid = session?.user?.id;
  useEffect(() => {
    if (!isQuizType(type)) return;
    let alive = true;
    etatQuiz(type, slug).then((e) => alive && setEtat(e));
    return () => {
      alive = false;
    };
  }, [type, slug, uid]);
  return isQuizType(type) ? etat : null;
}

export function Trophy({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
    </svg>
  );
}

/** Lien vers le quiz ; en invité, ouvre l'invitation à créer un compte. */
function QuizLink({ type, slug, className, children, label }: { type: ContentType; slug: string; className: string; children: React.ReactNode; label?: string }) {
  const { ready, session } = useMember();
  const { tr } = useLang();
  const [gate, setGate] = useState(false);
  if (ready && !session) {
    return (
      <>
        <button type="button" onClick={() => setGate(true)} className={className} aria-label={label}>
          {children}
        </button>
        {gate && <AccountGate reason={tr('tester tes connaissances', 'test your knowledge')} onClose={() => setGate(false)} />}
      </>
    );
  }
  return (
    <Link href={quizHref(type, slug)} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

/** Tuile « Quiz » à côté de Lire / Écouter / Regarder. */
export function QuizTile({ type, slug }: { type: ContentType; slug: string }) {
  const etat = useEtatQuiz(type, slug);
  const { tr } = useLang();
  if (!etat?.disponible) return null;
  const sub =
    etat.meilleur_score !== null && etat.meilleur_score !== undefined
      ? tr(`Meilleur score ${etat.meilleur_score}/${etat.nb_questions}`, `Best score ${etat.meilleur_score}/${etat.nb_questions}`)
      : tr(`${etat.nb_questions} questions`, `${etat.nb_questions} questions`);
  return (
    <QuizLink
      type={type}
      slug={slug}
      label={`Quiz · ${sub}`}
      className="inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-gold/10 py-2.5 pl-4 pr-6 font-bold text-ivory backdrop-blur transition hover:border-gold hover:bg-gold/20 focus-visible:outline-2 focus-visible:outline-gold"
    >
      <span className="text-gold">
        <Trophy />
      </span>
      <span className="flex flex-col text-left leading-tight">
        <span>Quiz</span>
        <span className="text-[11px] font-semibold text-gold-pale/80">{sub}</span>
      </span>
    </QuizLink>
  );
}

/** Carte dorée de fin de contenu : « Teste ce que tu as retenu ». */
export function QuizEndCard({ type, slug, className = '' }: { type: ContentType; slug: string; className?: string }) {
  const etat = useEtatQuiz(type, slug);
  const { tr } = useLang();
  if (!etat?.disponible) return null;
  const n = etat.nb_questions;
  const minutes = Math.max(1, Math.round(n / 5));
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold/25 via-gold-deep/15 to-surface p-6 text-left ring-1 ring-gold/50 md:p-7 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_0%,rgba(240,195,107,0.25),transparent_60%)]" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold text-2xl text-ink shadow-[0_0_30px_rgba(240,195,107,0.45)]" aria-hidden>
          🏆
        </span>
        <div className="flex-1">
          <p className="font-display text-xl font-bold text-ivory">{tr('Teste ce que tu as retenu', 'Test what you remember')}</p>
          <p className="mt-1 text-sm font-semibold text-gold-pale">
            {n} questions · {minutes} min
            {etat.meilleur_score !== null && etat.meilleur_score !== undefined && (
              <span className="text-body"> · {tr(`Meilleur score ${etat.meilleur_score}/${n}`, `Best score ${etat.meilleur_score}/${n}`)}</span>
            )}
          </p>
        </div>
        <QuizLink
          type={type}
          slug={slug}
          className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 font-extrabold text-ink shadow-[0_10px_30px_rgba(240,195,107,0.3)] transition hover:bg-gold-pale focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
        >
          {etat.meilleur_score !== null && etat.meilleur_score !== undefined ? tr('Refaire le quiz', 'Retake the quiz') : tr('Faire le quiz', 'Take the quiz')}
        </QuizLink>
      </div>
    </motion.div>
  );
}

/** Barre de niveau (animée de « from » vers la valeur actuelle). */
export function LevelBar({ points, niveau, from }: { points: number; niveau: Niveau; from?: number }) {
  const { lang, tr } = useLang();
  const ratio = niveauRatio(points, niveau);
  const max = niveau.suivant_seuil === null || niveau.suivant_seuil === undefined;
  const reste = max ? 0 : Math.max(0, (niveau.suivant_seuil as number) - points);
  return (
    <div>
      <div
        className="h-3 overflow-hidden rounded-full bg-ivory/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        aria-label={tr('Progression vers le niveau suivant', 'Progress to the next level')}
      >
        <motion.div
          initial={{ width: `${(from ?? ratio) * 100}%` }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}
          className="h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-pale"
        />
      </div>
      <p className="mt-2 text-sm text-body">
        {max ? (
          <span className="font-bold text-gold">{tr('Niveau maximum atteint', 'Maximum level reached')}</span>
        ) : (
          <>
            {tr(`encore ${reste} pts pour `, `${reste} more pts to reach `)}
            <span className="font-bold text-gold">{niveauNom(niveau.suivant_code, lang)}</span>
          </>
        )}
      </p>
    </div>
  );
}

/** Bloc résumé « Ma progression » de la page compte (cliquable). */
export function ProgressSummary() {
  const { member } = useMember();
  const { lang, tr } = useLang();
  const [p, setP] = useState<Progression | null | undefined>(undefined);
  useEffect(() => {
    if (!member) return;
    let alive = true;
    maProgression().then((r) => alive && setP(r));
    return () => {
      alive = false;
    };
  }, [member]);
  // Script serveur absent ou aucun quiz publié : on n'affiche rien.
  if (!p || p.quiz_total === 0) return null;
  return (
    <Link
      href="/compte/progression"
      className="group mt-8 block rounded-3xl bg-surface p-6 ring-1 ring-gold/30 transition hover:-translate-y-1 hover:ring-gold/60 focus-visible:outline-2 focus-visible:outline-gold md:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-xs font-bold tracking-[0.25em] text-gold">{tr('MA PROGRESSION', 'MY PROGRESS')}</p>
        <p className="text-sm font-bold text-gold transition group-hover:translate-x-1">{tr('Voir le détail →', 'See details →')}</p>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-ivory">
        {tr('Niveau', 'Level')} <span className="text-gold">{niveauNom(p.niveau.code, lang)}</span>
        <span className="text-body"> · {p.points} pts</span>
      </p>
      <div className="mt-4 max-w-xl">
        <LevelBar points={p.points} niveau={p.niveau} />
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-text">
        <span className="text-gold">
          <Trophy size={16} />
        </span>
        {tr(
          `${p.maitrises} histoire${p.maitrises > 1 ? 's' : ''} maîtrisée${p.maitrises > 1 ? 's' : ''} sur ${p.quiz_total} · ${p.quiz_faits} quiz fait${p.quiz_faits > 1 ? 's' : ''}`,
          `${p.maitrises} ${p.maitrises === 1 ? 'story' : 'stories'} mastered out of ${p.quiz_total} · ${p.quiz_faits} ${p.quiz_faits === 1 ? 'quiz' : 'quizzes'} taken`,
        )}
      </p>
    </Link>
  );
}
