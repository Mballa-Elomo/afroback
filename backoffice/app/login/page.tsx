'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { login } from './actions';
import { Sankofa } from '@/components/Sankofa';
import { Icone } from '@/components/Icone';
import s from './login.module.css';

/**
 * Écran de connexion (refonte « Sankofa », 2026-10-10) : à gauche, le symbole
 * Sankofa se dessine au milieu de poussières d'or, avec des proverbes qui se
 * succèdent ; à droite, le formulaire. Même logique qu'avant (actions.ts).
 */

const PROVERBES = [
  { texte: 'Il n’est jamais interdit de revenir chercher ce que l’on a oublié.', source: 'Proverbe akan, sens du symbole Sankofa' },
  { texte: 'En Afrique, un vieillard qui meurt est une bibliothèque qui brûle.', source: 'Amadou Hampâté Bâ, UNESCO, 1960' },
  { texte: 'Tant que les lions n’auront pas leurs propres historiens, les histoires de chasse glorifieront le chasseur.', source: 'Proverbe africain' },
  { texte: 'Quand tu ne sais pas où tu vas, regarde d’où tu viens.', source: 'Proverbe africain' },
];

// Positions fixes (pas de hasard au rendu) : pas d'écart entre serveur et navigateur.
const POUSSIERES = Array.from({ length: 34 }, (_, i) => ({
  left: (i * 37) % 100,
  delai: (i * 0.73) % 9,
  duree: 9 + ((i * 1.7) % 8),
  taille: 2 + (i % 3),
  derive: ((i % 5) - 2) * 18,
}));

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, { error: null });
  const [voir, setVoir] = useState(false);
  const [majuscules, setMajuscules] = useState(false);
  const [indice, setIndice] = useState(0);
  const [email, setEmail] = useState('');
  const carteRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const t = setInterval(() => setIndice((i) => (i + 1) % PROVERBES.length), 7000);
    return () => clearInterval(t);
  }, []);

  // Secousse de la carte à chaque erreur (l'e-mail saisi est conservé).
  useEffect(() => {
    if (!state.error) return;
    carteRef.current?.animate(
      [{ transform: 'none' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(9px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }],
      { duration: 460, easing: 'ease-out' }
    );
  }, [state]);

  const proverbe = PROVERBES[indice];

  return (
    <div className={s.page}>
      <section className={s.scene} aria-hidden>
        <div className={s.poussieres}>
          {POUSSIERES.map((p, i) => (
            <span
              key={i}
              style={
                {
                  left: `${p.left}%`,
                  width: p.taille,
                  height: p.taille,
                  animationDelay: `${p.delai}s`,
                  animationDuration: `${p.duree}s`,
                  '--derive': `${p.derive}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className={s.embleme}>
          <div className={`${s.anneau} ${s.anneau1}`} />
          <div className={`${s.anneau} ${s.anneau2}`} />
          <div className={`${s.anneau} ${s.anneau3}`} />
          <div className={s.halo} />
          <Sankofa size={190} anime epaisseur={5} className={s.symbole} />
        </div>

        <div className={s.marque}>AFROBACK</div>
        <div className={s.sousMarque}>Sankofa · retourne chercher ce qui t’appartient</div>

        <figure key={indice} className={s.proverbe}>
          <blockquote>« {proverbe.texte} »</blockquote>
          <figcaption>{proverbe.source}</figcaption>
        </figure>
        <div className={s.points}>
          {PROVERBES.map((_, i) => (
            <span key={i} className={i === indice ? s.pointActif : ''} />
          ))}
        </div>

        <div className={`${s.kente} afa-kente`} />
      </section>

      <section className={s.cote}>
        <form ref={carteRef} action={formAction} className={s.carte}>
          <div className={s.enteteMobile}>
            <Sankofa size={44} />
            <span>AFROBACK</span>
          </div>
          <span className={s.badge}>
            <span className={s.badgePoint} /> Back-office
          </span>
          <h1 className={s.titre}>Bon retour</h1>
          <p className={s.intro}>Connectez-vous à la salle de contrôle d’AFROBACK.</p>

          <label className={s.champ}>
            <Icone nom="mail" taille={17} />
            <input name="email" type="email" required autoComplete="username" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} />
            <span className={s.etiquette}>Adresse e-mail</span>
          </label>

          <label className={s.champ}>
            <Icone nom="lock" taille={17} />
            <input
              name="password"
              type={voir ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder=" "
              onKeyUp={(e) => setMajuscules(e.getModifierState('CapsLock'))}
            />
            <span className={s.etiquette}>Mot de passe</span>
            <button type="button" className={s.oeil} onClick={() => setVoir((v) => !v)} aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
              <Icone nom={voir ? 'eyeOff' : 'eye'} taille={17} />
            </button>
          </label>
          {majuscules && <div className={s.avertissement}>Majuscules activées</div>}

          {state.error && (
            <div className={s.erreur} role="alert">
              {state.error}
            </div>
          )}

          <button type="submit" disabled={pending} className={s.bouton}>
            <span className={s.reflet} />
            {pending ? (
              <>
                <span className={s.rouage} /> Connexion…
              </>
            ) : (
              <>
                Entrer <Icone nom="arrow" taille={17} />
              </>
            )}
          </button>

          <p className={s.mention}>
            <Icone nom="shield" taille={14} /> Accès réservé aux administrateurs d’AFROBACK, distinct du compte de l’application.
          </p>
        </form>
      </section>
    </div>
  );
}
