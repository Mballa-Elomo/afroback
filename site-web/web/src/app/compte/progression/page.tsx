'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMember } from '@/lib/auth';
import { useLang } from '@/lib/lang-client';
import { TextLink } from '@/components/auth-ui';
import { LevelBar, quizHref, Trophy } from '@/components/quiz';
import { maProgression, niveauNom, type Progression, type QuizType } from '@/lib/quiz';

/**
 * « Ma progression » (cdc-quiz-progression.md, 4.4) : niveau, points, barre
 * vers le niveau suivant, 3 chiffres, et la liste « Mes quiz » (Héros /
 * Mythes). Réservée aux comptes ; mêmes chiffres que l'application
 * (ma_progression, calculée côté serveur).
 */
export default function ProgressionPage() {
  const { ready, session, member } = useMember();
  const { lang, tr } = useLang();
  const router = useRouter();
  const [p, setP] = useState<Progression | null | undefined>(undefined);
  const [onglet, setOnglet] = useState<QuizType>('heros');

  useEffect(() => {
    if (ready && !session) router.replace('/connexion?suite=/compte/progression');
  }, [ready, session, router]);
  useEffect(() => {
    if (!member) return;
    let alive = true;
    maProgression().then((r) => alive && setP(r));
    return () => {
      alive = false;
    };
  }, [member]);

  if (!member) return <div className="min-h-screen" />;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-28 md:px-10 md:pt-32">
      <TextLink href="/compte">‹ {tr('Mon compte', 'My account')}</TextLink>
      <h1 className="text-gold-gradient mt-4 font-display text-4xl font-black md:text-5xl">{tr('Ma progression', 'My progress')}</h1>

      {p === undefined && <p className="mt-10 text-body">{tr('Chargement…', 'Loading…')}</p>}
      {p === null && (
        <div className="mt-10 rounded-3xl bg-surface p-8 text-center ring-1 ring-gold/20">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/10 text-gold">
            <Trophy size={26} />
          </span>
          <p className="mt-4 font-display text-xl font-bold text-ivory">{tr('Les quiz arrivent bientôt', 'Quizzes are coming soon')}</p>
          <p className="mt-2 text-sm text-body">{tr('Ta progression apparaîtra ici dès les premiers quiz en ligne.', 'Your progress will appear here as soon as the first quizzes are online.')}</p>
        </div>
      )}

      {p && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-gold/20 via-surface to-ink p-6 ring-1 ring-gold/25 md:p-10"
          >
            <div className="bg-pattern absolute inset-0 opacity-[0.06]" />
            <div className="relative">
              <p className="text-xs font-bold tracking-[0.25em] text-gold">{tr('NIVEAU', 'LEVEL')}</p>
              <p className="mt-1 font-display text-3xl font-black text-ivory md:text-4xl">{niveauNom(p.niveau.code, lang)}</p>
              <p className="mt-1 text-lg font-bold text-gold">{p.points} points</p>
              <div className="mt-5 max-w-xl">
                <LevelBar points={p.points} niveau={p.niveau} from={0} />
              </div>
            </div>
          </motion.div>

          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[
              { k: tr('Quiz faits', 'Quizzes taken'), v: String(p.quiz_faits) },
              { k: tr('Histoires maîtrisées', 'Stories mastered'), v: `${p.maitrises}/${p.quiz_total}` },
              { k: tr('Moyenne', 'Average'), v: p.moyenne !== null && p.moyenne !== undefined ? `${p.moyenne} %` : '–' },
            ].map((s) => (
              <div key={s.k} className="flex flex-col-reverse rounded-2xl bg-surface p-4 text-center ring-1 ring-ivory/10 md:p-6">
                <dt className="mt-1 text-xs font-semibold text-body md:text-sm">{s.k}</dt>
                <dd className="font-display text-2xl font-black text-gold md:text-3xl">{s.v}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-12 font-display text-2xl font-bold text-ivory">{tr('Mes quiz', 'My quizzes')}</h2>
          <div role="tablist" aria-label={tr('Type de contenu', 'Content type')} className="mt-4 inline-flex rounded-full bg-ivory/[0.06] p-1 ring-1 ring-ivory/10">
            {(
              [
                ['heros', tr('Héros', 'Heroes')],
                ['mythe', tr('Mythes', 'Myths')],
              ] as [QuizType, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                role="tab"
                aria-selected={onglet === t}
                onClick={() => setOnglet(t)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-gold ${onglet === t ? 'bg-gold text-ink' : 'text-body hover:text-ivory'}`}
              >
                {label} · {p.resultats.filter((r) => r.type === t).length}
              </button>
            ))}
          </div>

          <ul role="tabpanel" className="mt-5 space-y-3">
            {p.resultats.filter((r) => r.type === onglet).length === 0 && <li className="text-sm text-body">{tr('Aucun quiz pour le moment.', 'No quiz yet.')}</li>}
            {p.resultats
              .filter((r) => r.type === onglet)
              .map((r) => {
                const titre = (lang === 'en' && r.titre_en) || r.titre_fr || r.slug;
                const fait = r.meilleur_score !== null && r.meilleur_score !== undefined;
                const maitrise = fait && r.total ? (r.meilleur_score as number) / r.total >= 0.8 : false;
                return (
                  <li key={`${r.type}:${r.slug}`} className="flex items-center gap-4 rounded-2xl bg-surface p-3 pr-4 ring-1 ring-ivory/10">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink ring-1 ring-gold/20 md:h-20 md:w-20">
                      {r.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt="" className="h-full w-full object-cover object-[50%_25%]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-ivory">{titre}</p>
                      <p className={`mt-0.5 text-sm ${fait ? (maitrise ? 'text-free' : 'text-gold-pale') : 'text-muted'}`}>
                        {fait ? tr(`Meilleur score ${r.meilleur_score}/${r.total}`, `Best score ${r.meilleur_score}/${r.total}`) : tr('À découvrir', 'To discover')}
                        {maitrise && ` · ${tr('maîtrisée', 'mastered')}`}
                      </p>
                    </div>
                    <Link
                      href={quizHref(r.type, r.slug)}
                      aria-label={`${fait ? tr('Refaire le quiz', 'Retake the quiz') : tr('Faire le quiz', 'Take the quiz')} · ${titre}`}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-gold ${fait ? 'border border-gold/40 text-gold hover:bg-gold/10' : 'bg-gold text-ink hover:bg-gold-pale'}`}
                    >
                      {fait ? tr('Refaire', 'Retake') : tr('Faire', 'Take')}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </>
      )}
    </div>
  );
}
