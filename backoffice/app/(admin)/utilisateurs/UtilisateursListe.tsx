'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icone } from '@/components/Icone';
import { annoncerNavigation } from '@/components/Ambiance';
import type { Forfait, LigneUtilisateur, Statut } from '@/lib/utilisateurs';
import { FORFAITS, STATUTS, drapeau, initiale, nomPays, relatif, dateCourte } from '@/lib/utilisateursFormat';
import { journaliserExport, supprimerCompte, type Resultat } from './actions';
import styles from './utilisateurs.module.css';

/**
 * Liste des comptes (cdc-module-utilisateurs.md, § 3) : chiffres clés,
 * inscriptions par semaine, recherche instantanée, filtres cumulables, tri,
 * pagination et export CSV de la sélection.
 */

const PAR_PAGE = 25;
const JOUR = 86400000;

type Tri = 'recent' | 'ancien' | 'connexion' | 'prenom';
type OuiNon = 'oui' | 'non' | null;

interface Filtres {
  statuts: Set<Statut>;
  forfaits: Set<Forfait>;
  mfa: OuiNon;
  enfants: OuiNon;
  demo: boolean;
  admin: boolean;
}

const VIDE: Filtres = { statuts: new Set(), forfaits: new Set(), mfa: null, enfants: null, demo: false, admin: false };

function normaliser(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function correspond(u: LigneUtilisateur, q: string) {
  if (!q) return true;
  const chiffresQ = q.replace(/\D/g, '');
  if (chiffresQ.length >= 4 && u.telephone) {
    const t = u.telephone.replace(/\D/g, '');
    if (t.includes(chiffresQ) || t.endsWith(chiffresQ)) return true;
  }
  const texte = normaliser([u.email, u.prenom, u.pseudo ?? '', u.id, nomPays(u.pays)].join(' '));
  return normaliser(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((mot) => texte.includes(mot));
}

function activite(u: LigneUtilisateur) {
  const a = u.derniere_connexion ? new Date(u.derniere_connexion).getTime() : 0;
  const b = u.derniere_activite ? new Date(u.derniere_activite).getTime() : 0;
  return Math.max(a, b);
}

function csv(lignes: LigneUtilisateur[]) {
  const echap = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const tete = ['E-mail', 'Téléphone', 'Prénom', 'Pays', 'Langue', 'Forfait', 'Fin du forfait', 'Statut', '2 étapes', 'Enfants', 'Pseudo', 'Inscription', 'Dernière connexion'];
  const corps = lignes.map((u) =>
    [
      u.email,
      u.telephone,
      u.prenom,
      u.pays,
      u.langue,
      FORFAITS[u.forfait].label,
      u.forfait_fin ? u.forfait_fin.slice(0, 10) : '',
      STATUTS[u.statut].label,
      u.mfa ? 'oui' : 'non',
      u.enfants,
      u.pseudo,
      u.inscrit_le.slice(0, 10),
      u.derniere_connexion ? u.derniere_connexion.slice(0, 10) : '',
    ]
      .map(echap)
      .join(';')
  );
  return '﻿' + [tete.join(';'), ...corps].join('\r\n');
}

export function UtilisateursListe({ comptes, adminEmail }: { comptes: LigneUtilisateur[]; adminEmail: string }) {
  const router = useRouter();
  const [aSupprimer, setASupprimer] = useState<LigneUtilisateur | null>(null);
  const [toast, setToast] = useState<Resultat | null>(null);
  const [enCours, demarrer] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  function supprimer(u: LigneUtilisateur, confirmation: string) {
    demarrer(async () => {
      const r = await supprimerCompte(u.id, confirmation);
      setToast(r.ok ? { ok: true, message: `Compte ${u.email || u.telephone} supprimé.` } : r);
      if (r.ok) {
        setASupprimer(null);
        router.refresh();
      }
    });
  }
  const [q, setQ] = useState('');
  const [f, setF] = useState<Filtres>(VIDE);
  const [tri, setTri] = useState<Tri>('recent');
  const [page, setPage] = useState(0);

  const stats = useMemo(() => {
    const now = Date.now();
    const total = comptes.length;
    const nouveaux7 = comptes.filter((u) => now - new Date(u.inscrit_le).getTime() < 7 * JOUR).length;
    const actifs30 = comptes.filter((u) => now - activite(u) < 30 * JOUR).length;
    const racines = comptes.filter((u) => u.forfait === 'racines').length;
    const heritage = comptes.filter((u) => u.forfait === 'heritage').length;
    const mfa = comptes.filter((u) => u.mfa).length;
    const suspendus = comptes.filter((u) => u.statut === 'suspendu').length;
    const nonConfirmes = comptes.filter((u) => u.statut === 'non_confirme').length;
    // Inscriptions des 12 dernières semaines (la plus ancienne à gauche).
    const semaines = Array.from({ length: 12 }, () => 0);
    for (const u of comptes) {
      const idx = Math.floor((now - new Date(u.inscrit_le).getTime()) / (7 * JOUR));
      if (idx >= 0 && idx < 12) semaines[11 - idx]++;
    }
    return { total, nouveaux7, actifs30, racines, heritage, mfa, suspendus, nonConfirmes, semaines };
  }, [comptes]);

  const filtres = useMemo(() => {
    const res = comptes.filter(
      (u) =>
        correspond(u, q.trim()) &&
        (!f.statuts.size || f.statuts.has(u.statut)) &&
        (!f.forfaits.size || f.forfaits.has(u.forfait)) &&
        (f.mfa === null || (f.mfa === 'oui') === u.mfa) &&
        (f.enfants === null || (f.enfants === 'oui') === u.enfants > 0) &&
        (!f.demo || u.demo_store) &&
        (!f.admin || u.admin)
    );
    const cmp: Record<Tri, (a: LigneUtilisateur, b: LigneUtilisateur) => number> = {
      recent: (a, b) => b.inscrit_le.localeCompare(a.inscrit_le),
      ancien: (a, b) => a.inscrit_le.localeCompare(b.inscrit_le),
      connexion: (a, b) => activite(b) - activite(a),
      prenom: (a, b) => (a.prenom || a.email).localeCompare(b.prenom || b.email, 'fr'),
    };
    return res.sort(cmp[tri]);
  }, [comptes, q, f, tri]);

  const pages = Math.max(1, Math.ceil(filtres.length / PAR_PAGE));
  const pageCourante = Math.min(page, pages - 1);
  const visibles = filtres.slice(pageCourante * PAR_PAGE, (pageCourante + 1) * PAR_PAGE);
  const nbFiltres = f.statuts.size + f.forfaits.size + (f.mfa ? 1 : 0) + (f.enfants ? 1 : 0) + (f.demo ? 1 : 0) + (f.admin ? 1 : 0);

  function maj(next: Partial<Filtres>) {
    setF((prev) => ({ ...prev, ...next }));
    setPage(0);
  }
  function bascule<T>(set: Set<T>, v: T) {
    const n = new Set(set);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    return n;
  }
  function filtrerSur(next: Partial<Filtres>) {
    setF({ ...VIDE, ...next });
    setQ('');
    setPage(0);
  }

  function exporter() {
    const blob = new Blob([csv(filtres)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afroback-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    const desc = [q && `recherche « ${q} »`, nbFiltres && `${nbFiltres} filtre${nbFiltres > 1 ? 's' : ''}`].filter(Boolean).join(', ');
    void journaliserExport(filtres.length, desc);
  }

  const maxSemaine = Math.max(1, ...stats.semaines);
  const abonnes = stats.racines + stats.heritage;

  return (
    <div className={styles.module}>
      <header className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Utilisateurs</h1>
          <p className={styles.sousTitre}>Tous les comptes AFROBACK, app et site. Cliquez sur un compte pour voir sa fiche et agir.</p>
        </div>
        <button type="button" className={styles.boutonSecondaire} onClick={exporter} disabled={!filtres.length}>
          ⤓ Exporter {filtres.length !== comptes.length ? `la sélection (${filtres.length})` : 'en CSV'}
        </button>
      </header>

      <section className={styles.stats}>
        <button type="button" className={styles.stat} data-tilt onClick={() => filtrerSur({})}>
          <span className={styles.statValeur}>{stats.total}</span>
          <span className={styles.statLabel}>comptes</span>
          <span className={styles.statDetail}>+{stats.nouveaux7} cette semaine</span>
        </button>
        <div className={styles.stat}>
          <span className={styles.statValeur}>{stats.actifs30}</span>
          <span className={styles.statLabel}>actifs sur 30 jours</span>
          <span className={styles.statDetail}>{stats.total ? Math.round((stats.actifs30 / stats.total) * 100) : 0} % des comptes</span>
        </div>
        <button type="button" className={styles.stat} data-tilt onClick={() => filtrerSur({ forfaits: new Set<Forfait>(['racines', 'heritage']) })}>
          <span className={styles.statValeur}>{abonnes}</span>
          <span className={styles.statLabel}>abonnés</span>
          <span className={styles.statDetail}>
            {stats.racines} Racines · {stats.heritage} Héritage
          </span>
        </button>
        <button type="button" className={styles.stat} data-tilt onClick={() => filtrerSur({ mfa: 'oui' })}>
          <span className={styles.statValeur}>{stats.total ? Math.round((stats.mfa / stats.total) * 100) : 0} %</span>
          <span className={styles.statLabel}>vérification en 2 étapes</span>
          <span className={styles.statDetail}>{stats.mfa} comptes protégés</span>
        </button>
        <div className={`${styles.stat} ${styles.statGraphe}`} data-tilt>
          <span className={styles.statLabel}>Inscriptions par semaine (12 sem.)</span>
          <div className={styles.graphe} aria-hidden>
            {stats.semaines.map((n, i) => (
              <span key={i} className={styles.barre} style={{ height: `${Math.max(4, (n / maxSemaine) * 100)}%` }} title={`${n} inscription${n > 1 ? 's' : ''}`} />
            ))}
          </div>
        </div>
      </section>

      {(stats.suspendus > 0 || stats.nonConfirmes > 0) && (
        <div className={styles.alertes}>
          {stats.suspendus > 0 && (
            <button type="button" className={`${styles.alerte} ${styles.alerteRouge}`} onClick={() => filtrerSur({ statuts: new Set<Statut>(['suspendu']) })}>
              ⛔ {stats.suspendus} compte{stats.suspendus > 1 ? 's' : ''} suspendu{stats.suspendus > 1 ? 's' : ''}
            </button>
          )}
          {stats.nonConfirmes > 0 && (
            <button type="button" className={`${styles.alerte} ${styles.alerteOrange}`} onClick={() => filtrerSur({ statuts: new Set<Statut>(['non_confirme']) })}>
              ✉ {stats.nonConfirmes} e-mail{stats.nonConfirmes > 1 ? 's' : ''} non confirmé{stats.nonConfirmes > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      <section className={styles.carte}>
        <div className={styles.barreOutils}>
          <div className={styles.recherche}>
            <span className={styles.rechercheIcone}>⌕</span>
            <input
              className={styles.rechercheChamp}
              placeholder="Rechercher : e-mail, téléphone, prénom, pseudo…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              autoFocus
            />
            {q && (
              <button type="button" className={styles.rechercheEffacer} onClick={() => setQ('')} aria-label="Effacer">
                ✕
              </button>
            )}
          </div>
          <label className={styles.tri}>
            Trier
            <select value={tri} onChange={(e) => setTri(e.target.value as Tri)}>
              <option value="recent">Inscription récente</option>
              <option value="ancien">Inscription ancienne</option>
              <option value="connexion">Dernière activité</option>
              <option value="prenom">Prénom (A → Z)</option>
            </select>
          </label>
        </div>

        <div className={styles.filtres}>
          {(Object.keys(STATUTS) as Statut[]).map((s) => (
            <button key={s} type="button" className={`${styles.puce} ${f.statuts.has(s) ? styles.puceOn : ''}`} onClick={() => maj({ statuts: bascule(f.statuts, s) })}>
              {STATUTS[s].label}
            </button>
          ))}
          <span className={styles.separateur} />
          {(Object.keys(FORFAITS) as Forfait[]).map((p) => (
            <button key={p} type="button" className={`${styles.puce} ${f.forfaits.has(p) ? styles.puceOn : ''}`} onClick={() => maj({ forfaits: bascule(f.forfaits, p) })}>
              {FORFAITS[p].label}
            </button>
          ))}
          <span className={styles.separateur} />
          <button type="button" className={`${styles.puce} ${f.mfa ? styles.puceOn : ''}`} onClick={() => maj({ mfa: f.mfa === null ? 'oui' : f.mfa === 'oui' ? 'non' : null })}>
            🔒 2 étapes{f.mfa === 'oui' ? ' : activée' : f.mfa === 'non' ? ' : non' : ''}
          </button>
          <button type="button" className={`${styles.puce} ${f.enfants ? styles.puceOn : ''}`} onClick={() => maj({ enfants: f.enfants === null ? 'oui' : f.enfants === 'oui' ? 'non' : null })}>
            👧 Enfants{f.enfants === 'oui' ? ' : oui' : f.enfants === 'non' ? ' : non' : ''}
          </button>
          <button type="button" className={`${styles.puce} ${f.demo ? styles.puceOn : ''}`} onClick={() => maj({ demo: !f.demo })}>
            Démo store
          </button>
          <button type="button" className={`${styles.puce} ${f.admin ? styles.puceOn : ''}`} onClick={() => maj({ admin: !f.admin })}>
            Admins
          </button>
          {(nbFiltres > 0 || q) && (
            <button type="button" className={styles.reinit} onClick={() => filtrerSur({})}>
              Tout effacer
            </button>
          )}
        </div>

        <div className={styles.compteur}>
          {filtres.length === comptes.length ? `${comptes.length} comptes` : `${filtres.length} compte${filtres.length > 1 ? 's' : ''} sur ${comptes.length}`}
        </div>

        {visibles.length === 0 ? (
          <div className={styles.vide}>
            <div className={styles.videIcone}>👥</div>
            Aucun compte ne correspond.
          </div>
        ) : (
          <div className={styles.tableau} role="table">
            <div className={`${styles.ligne} ${styles.ligneTete}`} role="row">
              <span>Compte</span>
              <span className={styles.colTel}>Téléphone</span>
              <span>Forfait</span>
              <span>Statut</span>
              <span className={styles.colSecondaire}>Inscription</span>
              <span className={styles.colSecondaire}>Activité</span>
              <span />
            </div>
            {visibles.map((u) => (
              <div key={u.id} className={`${styles.ligne} ${styles.ligneCliquable}`} role="row" onClick={() => {
                annoncerNavigation();
                router.push(`/utilisateurs/${u.id}`);
              }}>
                <span className={styles.compte}>
                  <span className={`${styles.avatar} ${styles['av_' + FORFAITS[u.forfait].ton]}`}>{initiale(u.prenom, u.email)}</span>
                  <span className={styles.compteTexte}>
                    <span className={styles.nom}>
                      <Link href={`/utilisateurs/${u.id}`} prefetch={false} className={styles.nomLien} onClick={(e) => e.stopPropagation()}>
                        {u.prenom || <em className={styles.sansNom}>Sans prénom</em>}
                      </Link>
                      {u.pays && <span title={nomPays(u.pays)}> {drapeau(u.pays)}</span>}
                      {u.mfa && (
                        <span className={styles.icone} title="Vérification en 2 étapes activée">
                          🔒
                        </span>
                      )}
                      {u.enfants > 0 && (
                        <span className={styles.icone} title={`${u.enfants} profil${u.enfants > 1 ? 's' : ''} enfant`}>
                          👧{u.enfants > 1 ? u.enfants : ''}
                        </span>
                      )}
                      {u.admin && <span className={styles.etiquette}>Admin</span>}
                      {u.demo_store && <span className={styles.etiquette}>Démo store</span>}
                    </span>
                    <span className={styles.email}>{u.email || '—'}</span>
                  </span>
                </span>
                <span className={`${styles.colTel} ${styles.tel}`}>{u.telephone ?? '—'}</span>
                <span>
                  <span className={`${styles.pastille} ${styles['p_' + FORFAITS[u.forfait].ton]}`}>{FORFAITS[u.forfait].label}</span>
                </span>
                <span>
                  <span className={`${styles.statut} ${styles['s_' + STATUTS[u.statut].ton]}`}>{STATUTS[u.statut].label}</span>
                </span>
                <span className={`${styles.colSecondaire} ${styles.discret}`}>{dateCourte(u.inscrit_le)}</span>
                <span className={`${styles.colSecondaire} ${styles.discret}`}>{relatif(activite(u) ? new Date(activite(u)).toISOString() : null)}</span>
                <span className={styles.ligneActions}>
                  {!u.admin && u.email.toLowerCase() !== adminEmail.toLowerCase() && (
                    <button
                      type="button"
                      className={styles.corbeille}
                      title="Supprimer ce compte"
                      aria-label={`Supprimer le compte ${u.email}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setASupprimer(u);
                      }}
                    >
                      <Icone nom="trash" taille={16} />
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className={styles.pagination}>
            <button type="button" disabled={pageCourante === 0} onClick={() => setPage(pageCourante - 1)}>
              ← Précédent
            </button>
            <span>
              Page {pageCourante + 1} / {pages}
            </span>
            <button type="button" disabled={pageCourante >= pages - 1} onClick={() => setPage(pageCourante + 1)}>
              Suivant →
            </button>
          </div>
        )}
      </section>

      {aSupprimer && (
        <Portail>
          <div className={styles.voile} onClick={() => !enCours && setASupprimer(null)}>
            <div className={styles.modale} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
              <ConfirmerSuppression compte={aSupprimer} enCours={enCours} annuler={() => setASupprimer(null)} valider={(c) => supprimer(aSupprimer, c)} />
            </div>
          </div>
        </Portail>
      )}
      {toast && (
        <Portail>
          <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErreur}`} role="status">
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

function ConfirmerSuppression({ compte, enCours, annuler, valider }: { compte: LigneUtilisateur; enCours: boolean; annuler: () => void; valider: (c: string) => void }) {
  const attendu = compte.email || compte.telephone || '';
  const [saisie, setSaisie] = useState('');
  const ok = saisie.trim().toLowerCase() === attendu.toLowerCase();
  return (
    <form
      className={styles.formulaire}
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) valider(saisie);
      }}
    >
      <div className={styles.modaleDanger}>
        <Icone nom="trash" taille={22} />
      </div>
      <h2 className={styles.modaleTitre}>Supprimer {compte.prenom || 'ce compte'} ?</h2>
      <p className={styles.modaleTexte}>
        Le compte et toutes ses données (profil, enfants, communauté, boutique, quiz, abonnements, photos) sont effacés définitivement. Les paiements
        restent, anonymisés. Pour confirmer, tapez <strong>{attendu}</strong>.
      </p>
      <input value={saisie} onChange={(e) => setSaisie(e.target.value)} placeholder={attendu} autoFocus />
      <div className={styles.formActions}>
        <button type="button" className={styles.boutonSecondaire} onClick={annuler} disabled={enCours}>
          Annuler
        </button>
        <button type="submit" className={styles.boutonDanger} disabled={enCours || !ok}>
          {enCours ? 'Suppression…' : 'Supprimer définitivement'}
        </button>
      </div>
    </form>
  );
}
