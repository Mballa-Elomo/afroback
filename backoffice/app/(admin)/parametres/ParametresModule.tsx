'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DEFAUTS, SECTIONS, champsDe, type Champ, type Parametres, type Section, type Valeur, type Valeurs } from '@/lib/parametres';
import { enregistrerSection, reinitialiserSection } from './actions';
import styles from './parametres.module.css';

/**
 * Module Paramètres (cdc-module-parametres.md) : vue d'ensemble, une page par
 * section, recherche, barre d'enregistrement, confirmations des changements
 * sensibles, journal d'activité et événements de sécurité.
 * Rien n'est enregistré sans clic sur « Enregistrer ».
 */

export interface LigneJournal {
  id: string;
  admin_email: string;
  action: string;
  created_at: string;
}
export interface EvenementSecurite {
  id: number;
  event_type: string;
  detail: Record<string, unknown> | null;
  created_at: string;
}

type Vue = Section | 'apercu' | 'journal';

const NAV: { id: Vue; titre: string; icone: string }[] = [
  { id: 'apercu', titre: 'Vue d’ensemble', icone: '◉' },
  ...SECTIONS.map((s) => ({ id: s.id as Vue, titre: s.titre, icone: s.icone })),
  { id: 'journal', titre: 'Journal', icone: '☰' },
];

const EVENEMENTS: Record<string, string> = {
  login_failed: 'Mot de passe faux',
  login_lockout: 'Compte bloqué (trop d’essais)',
  login_success: 'Connexion réussie',
  account_deleted: 'Compte supprimé',
};

function dateCourte(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Points d'attention affichés dans la vue d'ensemble et sur la navigation. */
function alertes(p: Parametres): { section: Section; niveau: 'rouge' | 'orange'; texte: string }[] {
  const a: { section: Section; niveau: 'rouge' | 'orange'; texte: string }[] = [];
  if (p.general.maintenance) a.push({ section: 'general', niveau: 'rouge', texte: 'Maintenance active : le site et l’app sont fermés au public.' });
  if (!p.general.inscriptions_ouvertes) a.push({ section: 'general', niveau: 'orange', texte: 'Les inscriptions sont fermées.' });
  if (!p.paiements.actifs) a.push({ section: 'paiements', niveau: 'rouge', texte: 'Les paiements sont coupés.' });
  else if (!p.paiements.mtn || !p.paiements.orange) a.push({ section: 'paiements', niveau: 'orange', texte: `${!p.paiements.mtn ? 'MTN' : 'Orange'} Money est désactivé.` });
  if (!p.securite.verification_appareil) a.push({ section: 'securite', niveau: 'rouge', texte: 'La vérification des nouveaux appareils est désactivée.' });
  if (!p.securite.appareil_unique) a.push({ section: 'securite', niveau: 'orange', texte: 'Un compte peut être utilisé sur plusieurs appareils à la fois.' });
  if (!p.securite.anti_capture_app) a.push({ section: 'securite', niveau: 'orange', texte: 'L’anti-capture de l’application est désactivé.' });
  const off = SECTIONS.find((s) => s.id === 'modules')!.groupes[0].champs.filter((c) => p.modules[c.cle] === false);
  if (off.length) a.push({ section: 'modules', niveau: 'orange', texte: `Module${off.length > 1 ? 's' : ''} masqué${off.length > 1 ? 's' : ''} : ${off.map((c) => c.label).join(', ')}.` });
  return a;
}

function niveauSecurite(p: Parametres): { label: string; ton: 'vert' | 'or' | 'rouge' } {
  const s = p.securite;
  if (!s.verification_appareil) return { label: 'Affaiblie', ton: 'rouge' };
  const points = [s.appareil_unique, s.anti_capture_app, s.protection_web, s.mfa_obligatoire || s.proposer_2fa, s.alerte_connexion].filter(Boolean).length;
  return points >= 5 ? { label: 'Renforcée', ton: 'vert' } : { label: 'Standard', ton: 'or' };
}

export function ParametresModule({
  initial,
  majInitiale,
  auteurInitial,
  journal,
  evenements,
  sectionInitiale,
}: {
  initial: Parametres;
  majInitiale: string | null;
  auteurInitial: string | null;
  journal: LigneJournal[];
  evenements: EvenementSecurite[];
  sectionInitiale: Vue;
}) {
  const [enregistre, setEnregistre] = useState<Parametres>(initial);
  const [brouillon, setBrouillon] = useState<Parametres>(initial);
  const [vue, setVue] = useState<Vue>(sectionInitiale);
  const [maj, setMaj] = useState({ quand: majInitiale, qui: auteurInitial });
  const [toast, setToast] = useState<{ ok: boolean; texte: string } | null>(null);
  const [confirmation, setConfirmation] = useState<{ titre: string; lignes: string[]; action: () => void } | null>(null);
  const [recherche, setRecherche] = useState('');
  const [surligne, setSurligne] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sectionCourante = vue !== 'apercu' && vue !== 'journal' ? vue : null;
  const modifs = useMemo(() => {
    if (!sectionCourante) return [] as Champ[];
    return champsDe(sectionCourante).filter((c) => brouillon[sectionCourante][c.cle] !== enregistre[sectionCourante][c.cle]);
  }, [brouillon, enregistre, sectionCourante]);

  // Toast éphémère.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  // Quitter la page avec des modifications non enregistrées : avertissement du navigateur.
  useEffect(() => {
    const avant = (e: BeforeUnloadEvent) => {
      if (modifs.length) e.preventDefault();
    };
    window.addEventListener('beforeunload', avant);
    return () => window.removeEventListener('beforeunload', avant);
  }, [modifs.length]);

  const aller = (cible: Vue, champ?: string) => {
    const changer = () => {
      if (sectionCourante) setBrouillon((b) => ({ ...b, [sectionCourante]: enregistre[sectionCourante] }));
      setVue(cible);
      window.history.replaceState(null, '', `/parametres?section=${cible}`);
      if (champ) {
        setSurligne(champ);
        setTimeout(() => document.getElementById(`champ-${champ}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
        setTimeout(() => setSurligne(null), 2400);
      } else {
        document.getElementById('afa-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    if (modifs.length && cible !== vue) {
      setConfirmation({
        titre: 'Abandonner les modifications ?',
        lignes: [`${modifs.length} modification${modifs.length > 1 ? 's' : ''} de « ${SECTIONS.find((s) => s.id === sectionCourante)?.titre} » ne seront pas enregistrées.`],
        action: changer,
      });
    } else {
      changer();
    }
  };

  const modifier = (cle: string, valeur: Valeur) => {
    if (!sectionCourante) return;
    setBrouillon((b) => ({ ...b, [sectionCourante]: { ...b[sectionCourante], [cle]: valeur } }));
  };

  const appliquer = (section: Section, valeurs: Valeurs, quand: string) => {
    setEnregistre((e) => ({ ...e, [section]: valeurs }));
    setBrouillon((b) => ({ ...b, [section]: valeurs }));
    setMaj({ quand, qui: 'vous' });
  };

  const envoyer = (section: Section) => {
    startTransition(async () => {
      const r = await enregistrerSection(section, brouillon[section]);
      if (r.ok) appliquer(section, r.valeurs, r.maj);
      setToast({ ok: r.ok, texte: r.message });
    });
  };

  const enregistrer = () => {
    if (!sectionCourante) return;
    const impacts = modifs
      .map((c) => c.confirmer?.(enregistre[sectionCourante][c.cle], brouillon[sectionCourante][c.cle]) ?? null)
      .filter((m): m is string => !!m);
    if (impacts.length) {
      setConfirmation({ titre: 'Confirmer ces changements sensibles', lignes: impacts, action: () => envoyer(sectionCourante) });
    } else {
      envoyer(sectionCourante);
    }
  };

  const reinitialiser = (section: Section) => {
    setConfirmation({
      titre: 'Revenir aux valeurs par défaut ?',
      lignes: [`Tous les réglages « ${SECTIONS.find((s) => s.id === section)?.titre} » reprendront leur valeur d’origine.`],
      action: () =>
        startTransition(async () => {
          const r = await reinitialiserSection(section);
          if (r.ok) appliquer(section, r.valeurs, r.maj);
          setToast({ ok: r.ok, texte: r.ok ? 'Valeurs par défaut rétablies.' : r.message });
        }),
    });
  };

  const listeAlertes = alertes(enregistre);
  const resultats = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (q.length < 2) return [];
    return SECTIONS.flatMap((s) =>
      s.groupes.flatMap((g) => g.champs.filter((c) => `${c.label} ${c.aide} ${g.titre}`.toLowerCase().includes(q)).map((c) => ({ section: s, champ: c })))
    ).slice(0, 8);
  }, [recherche]);

  return (
    <div className={styles.module}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Paramètres</h1>
          <p className={styles.subtitle}>
            Tout AFROBACK se règle ici, sans nouvelle version de l’app.
            {maj.quand && (
              <>
                {' '}Dernière modification le {new Date(maj.quand).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                {maj.qui ? ` par ${maj.qui}` : ''}.
              </>
            )}
          </p>
        </div>
        <div className={styles.search}>
          <span className={styles.searchIcon} aria-hidden>
            ⌕
          </span>
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un réglage (ex. capture, Orange, prix)"
            aria-label="Rechercher un réglage"
            className={styles.searchInput}
          />
          {resultats.length > 0 && (
            <ul className={styles.searchResults} role="listbox">
              {resultats.map(({ section, champ }) => (
                <li key={`${section.id}-${champ.cle}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setRecherche('');
                      aller(section.id, `${section.id}-${champ.cle}`);
                    }}
                  >
                    <strong>{champ.label}</strong>
                    <span>{section.titre}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className={styles.layout}>
        <nav className={styles.nav} aria-label="Sections des paramètres">
          {NAV.map((n) => {
            const nb = n.id === 'apercu' ? listeAlertes.length : listeAlertes.filter((a) => a.section === n.id).length;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => aller(n.id)}
                className={`${styles.navItem} ${vue === n.id ? styles.navItemActive : ''}`}
                aria-current={vue === n.id ? 'page' : undefined}
              >
                <span className={styles.navIcon} aria-hidden>
                  {n.icone}
                </span>
                <span className={styles.navLabel}>{n.titre}</span>
                {nb > 0 && n.id !== 'journal' && <span className={styles.navBadge}>{nb}</span>}
              </button>
            );
          })}
          <div className={styles.navFooter}>
            <Link href="/abonnements">Contenus gratuits et abonnements offerts →</Link>
          </div>
        </nav>

        <main className={styles.content}>
          {vue === 'apercu' && <Apercu p={enregistre} alertes={listeAlertes} aller={aller} />}
          {sectionCourante && (
            <SectionEditeur
              section={sectionCourante}
              valeurs={brouillon[sectionCourante]}
              enregistres={enregistre[sectionCourante]}
              surligne={surligne}
              modifier={modifier}
              reinitialiser={() => reinitialiser(sectionCourante)}
              occupe={pending}
            />
          )}
          {vue === 'journal' && <Journal journal={journal} evenements={evenements} />}
        </main>
      </div>

      <Portail>
      {sectionCourante && modifs.length > 0 && (
        <div className={styles.saveBar} role="region" aria-label="Modifications non enregistrées">
          <span className={styles.saveDot} aria-hidden />
          <span>
            <strong>{modifs.length}</strong> modification{modifs.length > 1 ? 's' : ''} non enregistrée{modifs.length > 1 ? 's' : ''}
          </span>
          <div className={styles.saveActions}>
            <button type="button" className={styles.btnGhost} disabled={pending} onClick={() => setBrouillon((b) => ({ ...b, [sectionCourante]: enregistre[sectionCourante] }))}>
              Annuler
            </button>
            <button type="button" className={styles.btnPrimary} disabled={pending} onClick={enregistrer}>
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {confirmation && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setConfirmation(null)}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="confirm-titre" onClick={(e) => e.stopPropagation()}>
            <h2 id="confirm-titre" className={styles.modalTitle}>
              {confirmation.titre}
            </h2>
            <ul className={styles.modalList}>
              {confirmation.lignes.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnGhost} onClick={() => setConfirmation(null)} autoFocus>
                Annuler
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => {
                  const a = confirmation.action;
                  setConfirmation(null);
                  a();
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`} role="status">
          {toast.ok ? '✓' : '!'} {toast.texte}
        </div>
      )}
      </Portail>
    </div>
  );
}

/** Barre d'enregistrement, confirmation et toast rendus sous <body> : le gabarit anime ses enfants avec une
 *  transformation CSS, qui empêcherait sinon `position: fixed` de se caler sur l'écran. */
function Portail({ children }: { children: ReactNode }) {
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);
  return monte ? createPortal(children, document.body) : null;
}

/* ------------------------------------------------------------------ */

function Apercu({ p, alertes: liste, aller }: { p: Parametres; alertes: ReturnType<typeof alertes>; aller: (v: Vue, champ?: string) => void }) {
  const secu = niveauSecurite(p);
  const modulesChamps = SECTIONS.find((s) => s.id === 'modules')!.groupes[0].champs;
  const modulesActifs = modulesChamps.filter((c) => p.modules[c.cle] !== false).length;
  const operateurs = [p.paiements.mtn && 'MTN', p.paiements.orange && 'Orange'].filter(Boolean).join(' · ') || 'aucun';
  // Espace normale à la place de l'espace fine insécable de fr-FR (absente de la police des titres).
  const fcfa = (n: Valeur) => `${Number(n).toLocaleString('fr-FR').replace(/\s/g, ' ')} FCFA`;

  const tuiles = [
    { titre: 'Service', valeur: p.general.maintenance ? 'Maintenance' : 'En ligne', ton: p.general.maintenance ? 'rouge' : 'vert', detail: p.general.inscriptions_ouvertes ? 'Inscriptions ouvertes' : 'Inscriptions fermées', cible: 'general' as Vue },
    { titre: 'Paiements', valeur: p.paiements.actifs ? 'Actifs' : 'Coupés', ton: p.paiements.actifs ? 'vert' : 'rouge', detail: p.paiements.actifs ? operateurs : 'Aucun paiement accepté', cible: 'paiements' as Vue },
    { titre: 'Tarifs', valeur: `${fcfa(p.paiements.prix_racines)}`, ton: 'or', detail: `Racines · Héritage ${fcfa(p.paiements.prix_heritage)} · −${p.paiements.reduction_annuelle_pct} % à l’année`, cible: 'paiements' as Vue },
    { titre: 'Modules', valeur: `${modulesActifs} / ${modulesChamps.length}`, ton: modulesActifs === modulesChamps.length ? 'vert' : 'or', detail: 'fonctionnalités actives', cible: 'modules' as Vue },
    { titre: 'Sécurité', valeur: secu.label, ton: secu.ton, detail: p.securite.mfa_obligatoire ? '2 étapes obligatoire' : p.securite.mfa_disponible ? '2 étapes proposée' : '2 étapes non proposée', cible: 'securite' as Vue },
  ];

  return (
    <div>
      <div className={styles.tiles}>
        {tuiles.map((t) => (
          <button key={t.titre} type="button" className={styles.tile} onClick={() => aller(t.cible)}>
            <span className={styles.tileLabel}>{t.titre}</span>
            <span className={`${styles.tileValue} ${styles[`ton_${t.ton}`]}`}>{t.valeur}</span>
            <span className={styles.tileDetail}>{t.detail}</span>
          </button>
        ))}
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Points d’attention</h2>
        {liste.length === 0 ? (
          <p className={styles.empty}>Tout est en ordre : configuration par défaut ou renforcée.</p>
        ) : (
          <ul className={styles.alertList}>
            {liste.map((a) => (
              <li key={a.texte} className={styles.alertItem}>
                <span className={`${styles.alertDot} ${a.niveau === 'rouge' ? styles.dotRouge : styles.dotOrange}`} aria-hidden />
                <span className={styles.alertText}>{a.texte}</span>
                <button type="button" className={styles.linkBtn} onClick={() => aller(a.section)}>
                  Régler →
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Sections</h2>
        <div className={styles.sectionLinks}>
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" className={styles.sectionLink} onClick={() => aller(s.id)}>
              <span className={styles.sectionLinkIcon} aria-hidden>
                {s.icone}
              </span>
              <span>
                <strong>{s.titre}</strong>
                <span>{s.resume}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SectionEditeur({
  section,
  valeurs,
  enregistres,
  surligne,
  modifier,
  reinitialiser,
  occupe,
}: {
  section: Section;
  valeurs: Valeurs;
  enregistres: Valeurs;
  surligne: string | null;
  modifier: (cle: string, v: Valeur) => void;
  reinitialiser: () => void;
  occupe: boolean;
}) {
  const def = SECTIONS.find((s) => s.id === section)!;
  const auxDefauts = champsDe(section).every((c) => enregistres[c.cle] === DEFAUTS[section][c.cle]);

  return (
    <div>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon} aria-hidden>
              {def.icone}
            </span>
            {def.titre}
          </h2>
          <p className={styles.sectionResume}>{def.resume}</p>
        </div>
        <button type="button" className={styles.btnGhost} onClick={reinitialiser} disabled={occupe || auxDefauts} title={auxDefauts ? 'Déjà aux valeurs par défaut' : undefined}>
          Valeurs par défaut
        </button>
      </div>

      {def.groupes.map((g) => (
        <section key={g.titre} className={styles.card}>
          <h3 className={styles.cardTitle}>{g.titre}</h3>
          {g.description && <p className={styles.cardDesc}>{g.description}</p>}
          <div className={styles.rows}>
            {g.champs.map((c) => {
              const id = `${section}-${c.cle}`;
              const parentOff = c.dependDe ? valeurs[c.dependDe] === false : false;
              const change = valeurs[c.cle] !== enregistres[c.cle];
              const horsDefaut = enregistres[c.cle] !== DEFAUTS[section][c.cle];
              const parent = c.dependDe ? def.groupes.flatMap((x) => x.champs).find((x) => x.cle === c.dependDe) : null;
              return (
                <div key={c.cle} id={`champ-${id}`} className={`${styles.row} ${surligne === id ? styles.rowFlash : ''} ${parentOff ? styles.rowDisabled : ''}`}>
                  <div className={styles.rowText}>
                    <label htmlFor={id} className={styles.rowLabel}>
                      {change && <span className={styles.changedDot} title="Modifié, non enregistré" aria-label="Modifié, non enregistré" />}
                      {c.label}
                      <span className={`${styles.badge} ${c.portee === 'serveur' ? styles.badgeServeur : styles.badgeInterface}`}>
                        {c.portee === 'serveur' ? 'Serveur' : 'App / site'}
                      </span>
                      {horsDefaut && !change && <span className={styles.badgeCustom}>personnalisé</span>}
                    </label>
                    <p className={styles.rowHelp}>{parentOff && parent ? `Activez d’abord « ${parent.label} ».` : c.aide}</p>
                  </div>
                  <div className={styles.rowControl}>
                    <Controle id={id} champ={c} valeur={valeurs[c.cle]} disabled={parentOff || occupe} onChange={(v) => modifier(c.cle, v)} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function Controle({ id, champ, valeur, disabled, onChange }: { id: string; champ: Champ; valeur: Valeur; disabled: boolean; onChange: (v: Valeur) => void }) {
  if (champ.type === 'switch') {
    const on = valeur === true;
    return (
      <button id={id} type="button" role="switch" aria-checked={on} disabled={disabled} onClick={() => onChange(!on)} className={`${styles.switch} ${on ? styles.switchOn : ''}`}>
        <span className={styles.switchKnob} />
        <span className={styles.srOnly}>{on ? 'Activé' : 'Désactivé'}</span>
      </button>
    );
  }
  if (champ.type === 'int') {
    const n = Number(valeur);
    const hors = !Number.isInteger(n) || n < champ.min || n > champ.max;
    return (
      <div className={styles.numberWrap}>
        <div className={`${styles.number} ${hors ? styles.numberError : ''}`}>
          <button type="button" aria-label="Diminuer" disabled={disabled || n <= champ.min} onClick={() => onChange(Math.max(champ.min, n - (champ.max > 1000 ? 100 : 1)))}>
            −
          </button>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={champ.min}
            max={champ.max}
            value={Number.isFinite(n) ? n : ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
          />
          <button type="button" aria-label="Augmenter" disabled={disabled || n >= champ.max} onClick={() => onChange(Math.min(champ.max, n + (champ.max > 1000 ? 100 : 1)))}>
            +
          </button>
        </div>
        <span className={styles.unit}>{champ.unite}</span>
        {hors && <span className={styles.fieldError}>Entre {champ.min.toLocaleString('fr-FR')} et {champ.max.toLocaleString('fr-FR')}</span>}
      </div>
    );
  }
  const texte = String(valeur ?? '');
  return (
    <div className={styles.textWrap}>
      <textarea id={id} rows={2} maxLength={champ.max} value={texte} placeholder={champ.placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={styles.textarea} />
      <span className={styles.counter}>
        {texte.length} / {champ.max}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Journal({ journal, evenements }: { journal: LigneJournal[]; evenements: EvenementSecurite[] }) {
  const [onglet, setOnglet] = useState<'admin' | 'securite'>('admin');
  const [filtre, setFiltre] = useState('');
  const [type, setType] = useState<string>('tous');
  const champ = useRef<HTMLInputElement>(null);

  const lignes = journal.filter((l) => !filtre || `${l.action} ${l.admin_email}`.toLowerCase().includes(filtre.toLowerCase()));
  const evts = evenements.filter((e) => type === 'tous' || e.event_type === type);
  const types = Array.from(new Set(evenements.map((e) => e.event_type)));

  return (
    <div>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon} aria-hidden>
              ☰
            </span>
            Journal
          </h2>
          <p className={styles.sectionResume}>Qui a changé quoi, et ce qui se passe côté sécurité.</p>
        </div>
      </div>
      <div className={styles.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={onglet === 'admin'} className={onglet === 'admin' ? styles.tabActive : styles.tab} onClick={() => setOnglet('admin')}>
          Administration <span className={styles.tabCount}>{journal.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={onglet === 'securite'} className={onglet === 'securite' ? styles.tabActive : styles.tab} onClick={() => setOnglet('securite')}>
          Sécurité <span className={styles.tabCount}>{evenements.length}</span>
        </button>
      </div>

      {onglet === 'admin' ? (
        <section className={styles.card}>
          <input ref={champ} value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="Filtrer (ex. prix, maintenance, une adresse e-mail)" className={styles.filterInput} aria-label="Filtrer le journal" />
          {lignes.length === 0 ? (
            <p className={styles.empty}>Aucune action.</p>
          ) : (
            <ul className={styles.logList}>
              {lignes.map((l) => (
                <li key={l.id} className={styles.logItem}>
                  <span className={styles.logDate}>{dateCourte(l.created_at)}</span>
                  <span className={styles.logText}>{l.action}</span>
                  <span className={styles.logWho}>{l.admin_email}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className={styles.card}>
          <div className={styles.chips}>
            {['tous', ...types].map((t) => (
              <button key={t} type="button" className={type === t ? styles.chipActive : styles.chip} onClick={() => setType(t)}>
                {t === 'tous' ? 'Tous' : (EVENEMENTS[t] ?? t)}
              </button>
            ))}
          </div>
          {evts.length === 0 ? (
            <p className={styles.empty}>Aucun événement de sécurité enregistré.</p>
          ) : (
            <ul className={styles.logList}>
              {evts.map((e) => (
                <li key={e.id} className={styles.logItem}>
                  <span className={styles.logDate}>{dateCourte(e.created_at)}</span>
                  <span className={styles.logText}>
                    <span className={`${styles.evtDot} ${e.event_type === 'login_lockout' ? styles.dotRouge : e.event_type === 'login_failed' ? styles.dotOrange : styles.dotVert}`} aria-hidden />
                    {EVENEMENTS[e.event_type] ?? e.event_type}
                    {typeof e.detail?.failed_count === 'number' ? ` · ${e.detail.failed_count} essai${Number(e.detail.failed_count) > 1 ? 's' : ''}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.cardDesc}>Les numéros de téléphone ne sont pas affichés ici, pour limiter les données personnelles visibles.</p>
        </section>
      )}
    </div>
  );
}
