'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { DonneesQuiz, Famille, GroupeQuiz, Question } from '@/lib/quiz';
import { Icone } from '@/components/Icone';
import { echangerOrdre, enregistrerQuestion, supprimerQuestion, type Resultat, type Saisie } from './actions';
import u from '../utilisateurs/utilisateurs.module.css';
import s from './quiz.module.css';

/**
 * Module Quiz (cdc-module-quiz.md) : quiz de fin de contenu (héros, mythes)
 * et quiz de l'École des Héros (leçons, niveaux), avec un seul éditeur.
 */

type Onglet = 'contenu' | 'ecole';
type Langue = 'fr' | 'en';
const LETTRES = ['A', 'B', 'C', 'D', 'E'];

function anglaisComplet(q: Question) {
  return !!q.question_en && q.choix_en.length === q.choix_fr.length && q.choix_en.every(Boolean) && (q.famille !== 'contenu' || !!q.explication_en);
}

export function QuizModule({ donnees }: { donnees: DonneesQuiz }) {
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>('contenu');
  const [langue, setLangue] = useState<Langue>('fr');
  const [toast, setToast] = useState<Resultat | null>(null);
  const premier = (o: Onglet) => donnees.groupes.find((g) => (o === 'contenu' ? g.famille === 'contenu' : g.famille !== 'contenu'))?.cle ?? '';
  const [selection, setSelection] = useState<string>(premier('contenu'));

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const parGroupe = useMemo(() => {
    const m = new Map<string, Question[]>();
    for (const q of donnees.questions) m.set(`${q.famille}|${q.groupe}`, [...(m.get(`${q.famille}|${q.groupe}`) ?? []), q]);
    for (const l of m.values()) l.sort((a, b) => a.ordre - b.ordre);
    return m;
  }, [donnees.questions]);
  const questionsDe = (g: GroupeQuiz) => parGroupe.get(`${g.famille}|${g.cle}`) ?? [];

  const groupes = donnees.groupes.filter((g) => (onglet === 'contenu' ? g.famille === 'contenu' : g.famille !== 'contenu'));
  const courant = donnees.groupes.find((g) => g.cle === selection && (onglet === 'contenu' ? g.famille === 'contenu' : g.famille !== 'contenu')) ?? groupes[0];

  const totalContenu = donnees.questions.filter((q) => q.famille === 'contenu').length;
  const totalEcole = donnees.questions.length - totalContenu;
  const sansQuiz = donnees.groupes.filter((g) => g.famille === 'contenu' && g.publie && questionsDe(g).length === 0);

  return (
    <div className={u.module}>
      <header className={u.entete}>
        <div>
          <h1 className={u.titre}>Quiz</h1>
          <p className={u.sousTitre}>Relire, corriger et compléter les quiz sans passer par SQL. Les questions restent rédigées par les agents /afroback_quiz et /afroback_pedagogue.</p>
        </div>
        <div className={s.langues} role="group" aria-label="Langue d’aperçu">
          {(['fr', 'en'] as Langue[]).map((l) => (
            <button key={l} type="button" className={`${s.langue} ${langue === l ? s.langueOn : ''}`} onClick={() => setLangue(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <nav className={u.onglets}>
        <button
          type="button"
          className={`${u.onglet} ${onglet === 'contenu' ? u.ongletOn : ''}`}
          onClick={() => {
            setOnglet('contenu');
            setSelection(premier('contenu'));
          }}
        >
          <Icone nom="heroes" taille={15} /> Fin de contenu <span className={u.ongletNb}>{totalContenu}</span>
        </button>
        <button
          type="button"
          className={`${u.onglet} ${onglet === 'ecole' ? u.ongletOn : ''}`}
          onClick={() => {
            setOnglet('ecole');
            setSelection(premier('ecole'));
          }}
        >
          <Icone nom="ecole" taille={15} /> École des Héros <span className={u.ongletNb}>{totalEcole}</span>
        </button>
      </nav>

      {onglet === 'contenu' && sansQuiz.length > 0 && (
        <div className={s.bandeau}>
          <Icone nom="bolt" taille={16} />
          <span>
            {sansQuiz.length} contenu{sansQuiz.length > 1 ? 's' : ''} publié{sansQuiz.length > 1 ? 's' : ''} sans quiz : {sansQuiz.map((g) => g.titre).join(', ')}. À rédiger avec /afroback_quiz,
            ou à la main ci-dessous.
          </span>
        </div>
      )}

      <div className={s.disposition}>
        <aside className={s.liste}>
          {groupes.map((g, i) => {
            const qs = questionsDe(g);
            const enOk = qs.length > 0 && qs.every(anglaisComplet);
            const titreNiveau = g.famille !== 'contenu' && (i === 0 || groupes[i - 1].niveau !== g.niveau) ? `Niveau ${g.niveau}` : null;
            return (
              <div key={`${g.famille}|${g.cle}`}>
                {titreNiveau && <div className={s.listeSection}>{titreNiveau}</div>}
                <button type="button" className={`${s.groupe} ${courant?.cle === g.cle && courant?.famille === g.famille ? s.groupeOn : ''}`} onClick={() => setSelection(g.cle)}>
                  <span className={s.groupeTexte}>
                    <span className={s.groupeTitre}>{g.titre}</span>
                    <span className={u.discret}>
                      {g.sousTitre}
                      {!g.publie && ' · dépublié'}
                    </span>
                  </span>
                  <span className={s.groupeInfos}>
                    <span className={qs.length ? s.nb : s.nbVide}>{qs.length}</span>
                    {qs.length > 0 && !enOk && <span className={s.drapeau} title="Traduction anglaise incomplète">EN</span>}
                  </span>
                </button>
              </div>
            );
          })}
        </aside>

        <section className={s.detail}>
          {courant ? (
            <Detail
              key={`${courant.famille}|${courant.cle}`}
              groupe={courant}
              questions={questionsDe(courant)}
              langue={langue}
              resultat={(r) => {
                setToast(r);
                if (r.ok) router.refresh();
              }}
            />
          ) : (
            <p className={u.discret}>Aucun quiz.</p>
          )}
        </section>
      </div>

      {toast && (
        <Portail>
          <div className={`${u.toast} ${toast.ok ? u.toastOk : u.toastErreur}`} role="status">
            {toast.ok ? '✓' : '⚠'} {toast.message}
          </div>
        </Portail>
      )}
    </div>
  );
}

function Portail({ children }: { children: ReactNode }) {
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);
  return monte ? createPortal(children, document.body) : null;
}

function Detail({ groupe, questions, langue, resultat }: { groupe: GroupeQuiz; questions: Question[]; langue: Langue; resultat: (r: Resultat) => void }) {
  const [edition, setEdition] = useState<string | 'nouvelle' | null>(null);
  const [enCours, demarrer] = useTransition();
  const lancer = (a: () => Promise<Resultat>, apres?: () => void) =>
    demarrer(async () => {
      const r = await a();
      resultat(r);
      if (r.ok) apres?.();
    });

  const famille: Famille = groupe.famille;
  const max = famille === 'contenu' ? 10 : 99;

  return (
    <>
      <div className={s.detailTete}>
        <div>
          <span className={s.detailType}>{groupe.sousTitre}</span>
          <h2 className={s.detailTitre}>{groupe.titre}</h2>
        </div>
        {famille === 'contenu' && (
          <div className={s.statsGroupe}>
            <span>
              <strong>{groupe.tentatives}</strong> tentative{groupe.tentatives > 1 ? 's' : ''}
            </span>
            <span>
              <strong>{groupe.scoreMoyen === null ? '—' : `${groupe.scoreMoyen} %`}</strong> score moyen
            </span>
            <span>
              <strong>{groupe.maitrise === null ? '—' : `${groupe.maitrise} %`}</strong> maîtrisé (80 %+)
            </span>
          </div>
        )}
      </div>

      {questions.length === 0 && edition !== 'nouvelle' && (
        <div className={u.vide}>
          <div className={u.videIcone}>❓</div>
          Pas encore de question pour ce quiz.
        </div>
      )}

      <ol className={s.questions}>
        {questions.map((q, i) =>
          edition === q.id ? (
            <li key={q.id}>
              <Editeur
                q={q}
                famille={famille}
                enCours={enCours}
                annuler={() => setEdition(null)}
                valider={(saisie) => lancer(() => enregistrerQuestion(famille, groupe.cle, q.id, saisie), () => setEdition(null))}
              />
            </li>
          ) : (
            <li key={q.id}>
              <Carte
                q={q}
                n={i + 1}
                langue={langue}
                enCours={enCours}
                modifier={() => setEdition(q.id)}
                monter={i > 0 ? () => lancer(() => echangerOrdre(famille, q.id, questions[i - 1].id)) : undefined}
                descendre={i < questions.length - 1 ? () => lancer(() => echangerOrdre(famille, q.id, questions[i + 1].id)) : undefined}
                supprimer={() => {
                  const dernier = questions.length === 1;
                  if (window.confirm(dernier ? 'C’est la dernière question : le quiz disparaîtra de l’app et du site. Supprimer ?' : 'Supprimer cette question ?')) lancer(() => supprimerQuestion(famille, q.id));
                }}
              />
            </li>
          )
        )}
        {edition === 'nouvelle' && (
          <li>
            <Editeur famille={famille} enCours={enCours} annuler={() => setEdition(null)} valider={(saisie) => lancer(() => enregistrerQuestion(famille, groupe.cle, null, saisie), () => setEdition(null))} />
          </li>
        )}
      </ol>

      {edition === null && questions.length < max && (
        <button type="button" className={s.ajouter} onClick={() => setEdition('nouvelle')}>
          + Ajouter une question
        </button>
      )}
    </>
  );
}

function Carte({
  q,
  n,
  langue,
  enCours,
  modifier,
  monter,
  descendre,
  supprimer,
}: {
  q: Question;
  n: number;
  langue: Langue;
  enCours: boolean;
  modifier: () => void;
  monter?: () => void;
  descendre?: () => void;
  supprimer: () => void;
}) {
  const en = langue === 'en';
  const texte = en ? q.question_en || q.question_fr : q.question_fr;
  const choix = en && q.choix_en.length === q.choix_fr.length && q.choix_en.every(Boolean) ? q.choix_en : q.choix_fr;
  const explication = en ? q.explication_en || q.explication_fr : q.explication_fr;
  const manqueEn = en && !anglaisComplet(q);
  const taux = q.repondu ? Math.round((q.juste / q.repondu) * 100) : null;
  const alerte = taux !== null && q.repondu >= 5 && (taux < 30 || taux > 98);

  return (
    <article className={`${u.carte} ${s.carte}`}>
      <div className={s.carteTete}>
        <span className={s.numero}>{n}</span>
        <p className={s.question}>{texte}</p>
        <div className={s.outils}>
          <button type="button" title="Monter" disabled={!monter || enCours} onClick={monter}>
            ↑
          </button>
          <button type="button" title="Descendre" disabled={!descendre || enCours} onClick={descendre}>
            ↓
          </button>
          <button type="button" title="Modifier" disabled={enCours} onClick={modifier}>
            ✎
          </button>
          <button type="button" title="Supprimer" className={s.outilDanger} disabled={enCours} onClick={supprimer}>
            <Icone nom="trash" taille={14} />
          </button>
        </div>
      </div>
      <ul className={s.choix}>
        {choix.map((c, i) => (
          <li key={i} className={i === q.bonne ? s.choixBon : ''}>
            <span className={s.lettre}>{LETTRES[i]}</span>
            {c}
            {i === q.bonne && <span className={s.coche}>✓</span>}
          </li>
        ))}
      </ul>
      {explication && <p className={s.explication}>{explication}</p>}
      <div className={s.pied}>
        {manqueEn && <span className={s.drapeau}>Traduction anglaise incomplète</span>}
        {q.famille === 'contenu' && (
          <span className={`${s.taux} ${alerte ? s.tauxAlerte : ''}`}>
            {taux === null ? 'Pas encore de réponse' : `${taux} % de bonnes réponses (${q.repondu} réponse${q.repondu > 1 ? 's' : ''})`}
            {alerte && (taux! < 30 ? ' · peut-être mal posée' : ' · peut-être trop facile')}
          </span>
        )}
      </div>
    </article>
  );
}

function Editeur({ q, famille, enCours, annuler, valider }: { q?: Question; famille: Famille; enCours: boolean; annuler: () => void; valider: (s: Saisie) => void }) {
  const [f, setF] = useState<Saisie>({
    question_fr: q?.question_fr ?? '',
    question_en: q?.question_en ?? '',
    choix_fr: q?.choix_fr.length ? q.choix_fr : ['', '', '', ''],
    choix_en: q?.choix_fr.length ? q.choix_fr.map((_, i) => q.choix_en[i] ?? '') : ['', '', '', ''],
    bonne: q?.bonne ?? 0,
    explication_fr: q?.explication_fr ?? '',
    explication_en: q?.explication_en ?? '',
  });
  const maj = (p: Partial<Saisie>) => setF((x) => ({ ...x, ...p }));
  const ajouterChoix = () => maj({ choix_fr: [...f.choix_fr, ''], choix_en: [...f.choix_en, ''] });
  const retirerChoix = (i: number) =>
    maj({
      choix_fr: f.choix_fr.filter((_, k) => k !== i),
      choix_en: f.choix_en.filter((_, k) => k !== i),
      bonne: f.bonne === i ? 0 : f.bonne > i ? f.bonne - 1 : f.bonne,
    });

  return (
    <form
      className={`${u.carte} ${s.editeur}`}
      onSubmit={(e) => {
        e.preventDefault();
        valider(f);
      }}
    >
      <div className={s.colonnes}>
        <label>
          Question (FR)
          <textarea rows={2} value={f.question_fr} onChange={(e) => maj({ question_fr: e.target.value })} maxLength={500} required autoFocus />
        </label>
        <label>
          Question (EN)
          <textarea rows={2} value={f.question_en} onChange={(e) => maj({ question_en: e.target.value })} maxLength={500} />
        </label>
      </div>

      <div className={s.choixTete}>
        <span>Choix · cochez la bonne réponse</span>
        {f.choix_fr.length < 5 && (
          <button type="button" className={u.lien} onClick={ajouterChoix}>
            + Ajouter un choix
          </button>
        )}
      </div>
      {f.choix_fr.map((c, i) => (
        <div key={i} className={`${s.ligneChoix} ${f.bonne === i ? s.ligneChoixBonne : ''}`}>
          <label className={s.radio} title="Bonne réponse">
            <input type="radio" name="bonne" checked={f.bonne === i} onChange={() => maj({ bonne: i })} />
            <span>{LETTRES[i]}</span>
          </label>
          <input value={c} placeholder="Choix (FR)" maxLength={200} onChange={(e) => maj({ choix_fr: f.choix_fr.map((x, k) => (k === i ? e.target.value : x)) })} />
          <input value={f.choix_en[i] ?? ''} placeholder="Choice (EN)" maxLength={200} onChange={(e) => maj({ choix_en: f.choix_en.map((x, k) => (k === i ? e.target.value : x)) })} />
          {f.choix_fr.length > 2 && (
            <button type="button" className={s.retirer} onClick={() => retirerChoix(i)} title="Retirer ce choix">
              ✕
            </button>
          )}
        </div>
      ))}

      <div className={s.colonnes}>
        <label>
          Explication (FR){famille === 'contenu' ? '' : ' · facultative'}
          <textarea rows={3} value={f.explication_fr} onChange={(e) => maj({ explication_fr: e.target.value })} maxLength={1000} />
        </label>
        <label>
          Explication (EN)
          <textarea rows={3} value={f.explication_en} onChange={(e) => maj({ explication_en: e.target.value })} maxLength={1000} />
        </label>
      </div>
      <p className={u.aide}>L’explication s’affiche après la réponse : rappelez le passage du récit qui la justifie, sans rien ajouter au récit.</p>

      <div className={u.formActions}>
        <button type="button" className={u.boutonSecondaire} onClick={annuler} disabled={enCours}>
          Annuler
        </button>
        <button type="submit" className={u.boutonPrincipal} disabled={enCours}>
          {enCours ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
