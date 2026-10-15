'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Abonnement, DonneesPaiements, Environnement, Paiement } from '@/lib/paiements';
import { dateCourte, dateHeure, fcfa, relatif } from '@/lib/utilisateursFormat';
import { Icone } from '@/components/Icone';
import { GratuitForm, OffrirForm } from '../abonnements/Forms';
import { retirerAbonnement, retirerContenuGratuit } from '../abonnements/actions';
import { journaliserExportPaiements, offrirAccesLitige, reverifierPaiement, type Resultat } from './actions';
import u from '../utilisateurs/utilisateurs.module.css';
import s from './paiements.module.css';

/**
 * Module Paiements & revenus (cdc-module-paiements.md) : aperçu, transactions,
 * abonnements, dons. Les chiffres sont calculés ici à partir des listes
 * chargées côté serveur, pour l'environnement choisi (réel ou démo).
 */

type Onglet = 'apercu' | 'transactions' | 'abonnements' | 'dons';
type Env = Environnement | 'tout';

const ONGLETS: { id: Onglet; titre: string; icone: string }[] = [
  { id: 'apercu', titre: 'Aperçu', icone: 'dash' },
  { id: 'transactions', titre: 'Transactions', icone: 'revenue' },
  { id: 'abonnements', titre: 'Abonnements', icone: 'gift' },
  { id: 'dons', titre: 'Dons', icone: 'dons' },
];

const STATUTS: Record<Paiement['statut'], { label: string; ton: string }> = {
  reussi: { label: 'Réussi', ton: 's_vert' },
  echoue: { label: 'Échoué', ton: 's_rouge' },
  en_attente: { label: 'En attente', ton: 's_orange' },
  annule: { label: 'Annulé', ton: 's_gris' },
  expire: { label: 'Expiré', ton: 's_gris' },
  rembourse: { label: 'Remboursé', ton: 's_gris' },
};

const JOUR = 86400000;
const PLAN = (p: string | null) => (p === 'heritage' ? 'Héritage' : p === 'racines' ? 'Racines' : '—');
const PERIODE = (p: string | null) => (p === 'yearly' ? 'annuel' : p === 'monthly' ? 'mensuel' : '');
const dateEncaissement = (p: Paiement) => p.confirme_le ?? p.cree_le;

function libelleType(p: Paiement) {
  return p.type === 'don' ? 'Don' : `${PLAN(p.plan)}${p.periode ? ` · ${PERIODE(p.periode)}` : ''}`;
}

function statutAbonnement(a: Abonnement, now: number) {
  const fini = a.ends_at && new Date(a.ends_at).getTime() <= now;
  if (a.status === 'cancelled') return { label: 'Retiré', ton: 's_gris', actif: false };
  if (a.status === 'expired' || fini) return { label: 'Terminé', ton: 's_gris', actif: false };
  if (a.resilie_le) return { label: 'Résilié (actif jusqu’à la fin)', ton: 's_orange', actif: true };
  return { label: 'Actif', ton: 's_vert', actif: true };
}

export function PaiementsModule({ donnees, ongletInitial }: { donnees: DonneesPaiements; ongletInitial?: string }) {
  const router = useRouter();
  const aDuReel = donnees.paiements.some((p) => p.environnement === 'live');
  const dernierEnDemo = donnees.paiements[0]?.environnement === 'demo';
  const [env, setEnv] = useState<Env>(aDuReel ? 'live' : 'demo');
  const [onglet, setOnglet] = useState<Onglet>(ONGLETS.some((o) => o.id === ongletInitial) ? (ongletInitial as Onglet) : 'apercu');
  const [selection, setSelection] = useState<Paiement | null>(null);
  const [toast, setToast] = useState<Resultat | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const P = useMemo(() => donnees.paiements.filter((p) => env === 'tout' || p.environnement === env), [donnees.paiements, env]);

  function changerOnglet(o: Onglet) {
    setOnglet(o);
    router.replace(`/paiements?onglet=${o}`, { scroll: false });
  }

  return (
    <div className={u.module}>
      <header className={u.entete}>
        <div>
          <h1 className={u.titre}>Paiements & revenus</h1>
          <p className={u.sousTitre}>Encaissements Mobile Money (Campay), abonnements et dons. Chiffres réels, calculés à partir des paiements enregistrés.</p>
        </div>
        <div className={s.envSwitch} role="group" aria-label="Environnement">
          {(
            [
              ['live', 'Argent réel'],
              ['demo', 'Démo'],
              ['tout', 'Tout'],
            ] as [Env, string][]
          ).map(([v, l]) => (
            <button key={v} type="button" className={`${s.envBouton} ${env === v ? s.envOn : ''}`} onClick={() => setEnv(v)}>
              {l}
            </button>
          ))}
        </div>
      </header>

      {dernierEnDemo && (
        <div className={s.bandeauDemo}>
          <Icone nom="bolt" taille={18} />
          <div>
            <strong>Campay est en mode démo : aucun argent réel n’est encaissé.</strong>
            <span>
              {aDuReel ? 'Le dernier paiement enregistré est un test.' : `Les ${donnees.paiements.length} paiements enregistrés sont tous des tests.`} Pour encaisser,
              passez le secret <code>CAMPAY_ENV</code> à <code>live</code> (Supabase → Edge Functions → Secrets) avec la clé Campay de production.
            </span>
          </div>
        </div>
      )}
      {!aDuReel && env === 'live' && <p className={s.info}>Aucun paiement réel pour l’instant : passez sur « Démo » pour voir les tests.</p>}

      <nav className={u.onglets}>
        {ONGLETS.map((o) => (
          <button key={o.id} type="button" className={`${u.onglet} ${onglet === o.id ? u.ongletOn : ''}`} onClick={() => changerOnglet(o.id)}>
            <Icone nom={o.icone} taille={15} /> {o.titre}
          </button>
        ))}
      </nav>

      {onglet === 'apercu' && <Apercu P={P} abonnements={donnees.abonnements} tous={donnees.paiements} env={env} ouvrir={setSelection} />}
      {onglet === 'transactions' && <Transactions P={P} ouvrir={setSelection} />}
      {onglet === 'abonnements' && <Abonnements abonnements={donnees.abonnements} gratuits={donnees.gratuits} paiements={donnees.paiements} />}
      {onglet === 'dons' && <Dons P={P} ouvrir={setSelection} />}

      {selection && (
        <Portail>
          <FicheTransaction
            p={selection}
            fermer={() => setSelection(null)}
            resultat={(r) => {
              setToast(r);
              if (r.ok) {
                setSelection(null);
                router.refresh();
              }
            }}
          />
        </Portail>
      )}
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

// ---------------------------------------------------------------------
// Aperçu
// ---------------------------------------------------------------------

function Apercu({ P, abonnements, tous, env, ouvrir }: { P: Paiement[]; abonnements: Abonnement[]; tous: Paiement[]; env: Env; ouvrir: (p: Paiement) => void }) {
  const st = useMemo(() => {
    const now = Date.now();
    const d = new Date();
    const debutMois = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const debutMoisPrec = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime();
    const reussis = P.filter((p) => p.statut === 'reussi');
    const somme = (l: Paiement[]) => l.reduce((n, p) => n + p.montant, 0);
    const t = (p: Paiement) => new Date(dateEncaissement(p)).getTime();
    const ceMois = somme(reussis.filter((p) => t(p) >= debutMois));
    const moisPrec = somme(reussis.filter((p) => t(p) >= debutMoisPrec && t(p) < debutMois));
    const recents = P.filter((p) => now - new Date(p.cree_le).getTime() < 30 * JOUR && p.statut !== 'en_attente');
    const taux = recents.length ? Math.round((recents.filter((p) => p.statut === 'reussi').length / recents.length) * 100) : null;

    // Revenu mensuel récurrent : abonnements payants actifs, au prix réellement payé.
    const parSub = new Map(tous.filter((p) => p.subscription_id).map((p) => [p.subscription_id!, p]));
    const actifsPayes = abonnements.filter((a) => {
      if (a.source !== 'paiement' || a.status !== 'active') return false;
      if (new Date(a.starts_at).getTime() > now || (a.ends_at && new Date(a.ends_at).getTime() <= now)) return false;
      const p = parSub.get(a.id);
      return !!p && (env === 'tout' || p.environnement === env);
    });
    const mrr = actifsPayes.reduce((n, a) => {
      const p = parSub.get(a.id)!;
      return n + (p.periode === 'yearly' ? p.montant / 12 : p.montant);
    }, 0);

    const jours = Array.from({ length: 30 }, (_, i) => {
      const jour = new Date(now - (29 - i) * JOUR);
      const cle = jour.toISOString().slice(0, 10);
      return { cle, label: jour.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), total: somme(reussis.filter((p) => dateEncaissement(p).slice(0, 10) === cle)) };
    });

    const repartir = (cle: (p: Paiement) => string) => {
      const m = new Map<string, number>();
      for (const p of reussis) m.set(cle(p), (m.get(cle(p)) ?? 0) + p.montant);
      return [...m.entries()].sort((a, b) => b[1] - a[1]);
    };

    const attente = P.filter((p) => p.statut === 'en_attente' && now - new Date(p.cree_le).getTime() > 30 * 60000);
    const echecsParCompte = new Map<string, Paiement[]>();
    for (const p of P) if (p.statut === 'echoue' && p.user_id && now - new Date(p.cree_le).getTime() < JOUR) echecsParCompte.set(p.user_id, [...(echecsParCompte.get(p.user_id) ?? []), p]);
    const echecsRepetes = [...echecsParCompte.values()].filter((l) => l.length >= 3);
    const finProche = abonnements.filter((a) => a.source === 'paiement' && a.status === 'active' && a.ends_at && new Date(a.ends_at).getTime() > now && new Date(a.ends_at).getTime() - now < 7 * JOUR);

    return {
      ceMois,
      moisPrec,
      total: somme(reussis),
      nbReussis: reussis.length,
      panier: reussis.length ? Math.round(somme(reussis) / reussis.length) : 0,
      taux,
      mrr: Math.round(mrr),
      abonnesPayants: new Set(actifsPayes.map((a) => a.user_id)).size,
      jours,
      operateurs: repartir((p) => p.operateur ?? 'Inconnu'),
      types: repartir((p) => (p.type === 'don' ? 'Dons' : 'Abonnements')),
      forfaits: repartir((p) => (p.type === 'don' ? 'Dons' : `${PLAN(p.plan)} ${PERIODE(p.periode)}`.trim())),
      attente,
      echecsRepetes,
      finProche,
    };
  }, [P, abonnements, tous, env]);

  const evolution = st.moisPrec ? Math.round(((st.ceMois - st.moisPrec) / st.moisPrec) * 100) : null;
  const max = Math.max(1, ...st.jours.map((j) => j.total));
  const alertes = st.attente.length + st.echecsRepetes.length + st.finProche.length;

  return (
    <>
      <section className={s.kpis}>
        <Kpi label="Encaissé ce mois" valeur={fcfa(st.ceMois)} detail={evolution === null ? `mois précédent : ${fcfa(st.moisPrec)}` : `${evolution >= 0 ? '+' : ''}${evolution} % vs mois précédent`} ton={evolution !== null && evolution < 0 ? 'rouge' : 'or'} />
        <Kpi label="Revenu mensuel récurrent" valeur={fcfa(st.mrr)} detail={`${st.abonnesPayants} abonné${st.abonnesPayants > 1 ? 's' : ''} payant${st.abonnesPayants > 1 ? 's' : ''} actif${st.abonnesPayants > 1 ? 's' : ''}`} />
        <Kpi label="Total encaissé" valeur={fcfa(st.total)} detail={`${st.nbReussis} paiement${st.nbReussis > 1 ? 's' : ''} réussi${st.nbReussis > 1 ? 's' : ''} · panier moyen ${fcfa(st.panier)}`} />
        <Kpi label="Taux de réussite (30 j)" valeur={st.taux === null ? '—' : `${st.taux} %`} detail="réussis / tentatives terminées" ton={st.taux !== null && st.taux < 50 ? 'rouge' : 'vert'} />
      </section>

      <section className={s.grille}>
        <div className={u.carte}>
          <h2 className={u.carteTitre}>Encaissements, 30 derniers jours</h2>
          <div className={s.graphe}>
            {st.jours.map((j, i) => (
              <div key={j.cle} className={s.colonne} title={`${j.label} : ${fcfa(j.total)}`}>
                <span className={s.barre} style={{ height: `${Math.max(2, (j.total / max) * 100)}%`, animationDelay: `${i * 18}ms` }} />
              </div>
            ))}
          </div>
          <div className={s.grapheAxe}>
            <span>{st.jours[0].label}</span>
            <span>{st.jours[29].label}</span>
          </div>
        </div>
        <div className={u.carte}>
          <h2 className={u.carteTitre}>Répartition des encaissements</h2>
          <Repartition titre="Opérateur" lignes={st.operateurs} />
          <Repartition titre="Type" lignes={st.types} />
          <Repartition titre="Forfait" lignes={st.forfaits} />
        </div>
      </section>

      <section className={u.carte}>
        <h2 className={u.carteTitre}>Points d’attention {alertes > 0 && <span className={u.ongletNb}>{alertes}</span>}</h2>
        {alertes === 0 ? (
          <p className={u.discret}>Rien à signaler.</p>
        ) : (
          <ul className={s.alertes}>
            {st.attente.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => ouvrir(p)}>
                  <span className={`${u.statut} ${u.s_orange}`}>En attente</span>
                  <span>
                    {fcfa(p.montant)} · {libelleType(p)} · {p.email ?? 'compte supprimé'} · depuis {relatif(p.cree_le).replace('il y a ', '')}
                  </span>
                  <span className={s.alerteAction}>Revérifier →</span>
                </button>
              </li>
            ))}
            {st.echecsRepetes.map((l) => (
              <li key={l[0].user_id}>
                <Link href={`/utilisateurs/${l[0].user_id}`}>
                  <span className={`${u.statut} ${u.s_rouge}`}>{l.length} échecs</span>
                  <span>{l[0].email ?? 'Compte'} a échoué {l.length} fois en 24 h : souci de solde, de code ou d’opérateur ?</span>
                  <span className={s.alerteAction}>Voir le compte →</span>
                </Link>
              </li>
            ))}
            {st.finProche.map((a) => (
              <li key={a.id}>
                <Link href={`/utilisateurs/${a.user_id}`}>
                  <span className={`${u.statut} ${u.s_gris}`}>Fin proche</span>
                  <span>
                    Abonnement {PLAN(a.plan)} de {a.email ?? 'compte'} : fin le {dateCourte(a.ends_at)}
                    {a.resilie_le ? ' (résilié)' : ''}
                  </span>
                  <span className={s.alerteAction}>Voir le compte →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Kpi({ label, valeur, detail, ton = 'or' }: { label: string; valeur: string; detail: string; ton?: string }) {
  return (
    <div className={`${s.kpi} ${s['kpi_' + ton]}`} data-tilt>
      <span className={s.kpiLabel}>{label}</span>
      <span className={s.kpiValeur}>{valeur}</span>
      <span className={s.kpiDetail}>{detail}</span>
    </div>
  );
}

function Repartition({ titre, lignes }: { titre: string; lignes: [string, number][] }) {
  const total = lignes.reduce((n, [, v]) => n + v, 0);
  return (
    <div className={s.repartition}>
      <div className={s.repartitionTitre}>{titre}</div>
      {lignes.length === 0 ? (
        <div className={u.discret}>Aucun encaissement.</div>
      ) : (
        lignes.map(([k, v]) => (
          <div key={k} className={s.repLigne}>
            <span className={s.repNom}>{k}</span>
            <span className={s.repPiste}>
              <span style={{ width: `${(v / total) * 100}%` }} />
            </span>
            <span className={s.repValeur}>{fcfa(v)}</span>
          </div>
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------

function Transactions({ P, ouvrir }: { P: Paiement[]; ouvrir: (p: Paiement) => void }) {
  const [q, setQ] = useState('');
  const [statut, setStatut] = useState<Paiement['statut'] | ''>('');
  const [type, setType] = useState<'' | 'abonnement' | 'don'>('');
  const [operateur, setOperateur] = useState<'' | 'MTN' | 'Orange'>('');
  const [jours, setJours] = useState(0);

  const liste = useMemo(() => {
    const n = q.trim().toLowerCase();
    const now = Date.now();
    return P.filter(
      (p) =>
        (!n || [p.email, p.prenom, p.reference, p.telephone, p.id].some((v) => (v ?? '').toLowerCase().includes(n))) &&
        (!statut || p.statut === statut) &&
        (!type || p.type === type) &&
        (!operateur || p.operateur === operateur) &&
        (!jours || now - new Date(p.cree_le).getTime() < jours * JOUR)
    );
  }, [P, q, statut, type, operateur, jours]);

  function exporter() {
    const echap = (v: unknown) => {
      const t = v === null || v === undefined ? '' : String(v);
      return /[",;\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };
    const tete = ['Date', 'Compte', 'Type', 'Forfait', 'Période', 'Montant FCFA', 'Opérateur', 'Numéro', 'Statut', 'Référence', 'Environnement'];
    const lignes = liste.map((p) =>
      [p.cree_le.slice(0, 16).replace('T', ' '), p.email ?? 'compte supprimé', p.type, PLAN(p.plan), PERIODE(p.periode), p.montant, p.operateur, p.telephone, STATUTS[p.statut].label, p.reference, p.environnement]
        .map(echap)
        .join(';')
    );
    const blob = new Blob(['﻿' + [tete.join(';'), ...lignes].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afroback-paiements-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    void journaliserExportPaiements(liste.length, [q && `recherche « ${q} »`, statut, type, operateur, jours ? `${jours} j` : ''].filter(Boolean).join(', '));
  }

  return (
    <section className={u.carte}>
      <div className={u.barreOutils}>
        <div className={u.recherche}>
          <span className={u.rechercheIcone}>⌕</span>
          <input className={u.rechercheChamp} placeholder="Rechercher : e-mail, référence, numéro…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="button" className={u.boutonSecondaire} onClick={exporter} disabled={!liste.length}>
          ⤓ Exporter ({liste.length})
        </button>
      </div>
      <div className={u.filtres}>
        {(['reussi', 'echoue', 'en_attente', 'annule'] as const).map((v) => (
          <Puce key={v} actif={statut === v} onClick={() => setStatut(statut === v ? '' : v)}>
            {STATUTS[v].label}
          </Puce>
        ))}
        <span className={u.separateur} />
        <Puce actif={type === 'abonnement'} onClick={() => setType(type === 'abonnement' ? '' : 'abonnement')}>
          Abonnements
        </Puce>
        <Puce actif={type === 'don'} onClick={() => setType(type === 'don' ? '' : 'don')}>
          Dons
        </Puce>
        <span className={u.separateur} />
        {(['MTN', 'Orange'] as const).map((v) => (
          <Puce key={v} actif={operateur === v} onClick={() => setOperateur(operateur === v ? '' : v)}>
            {v}
          </Puce>
        ))}
        <span className={u.separateur} />
        {[7, 30, 90].map((j) => (
          <Puce key={j} actif={jours === j} onClick={() => setJours(jours === j ? 0 : j)}>
            {j} j
          </Puce>
        ))}
      </div>
      <div className={u.compteur}>
        {liste.length} transaction{liste.length > 1 ? 's' : ''} · {fcfa(liste.filter((p) => p.statut === 'reussi').reduce((n, p) => n + p.montant, 0))} encaissés
      </div>
      {liste.length === 0 ? (
        <div className={u.vide}>
          <div className={u.videIcone}>💳</div>
          Aucune transaction.
        </div>
      ) : (
        <div className={u.tableau}>
          <div className={`${s.ligne} ${u.ligneTete}`}>
            <span>Date</span>
            <span>Compte</span>
            <span>Type</span>
            <span className={s.droite}>Montant</span>
            <span className={s.colOperateur}>Opérateur</span>
            <span>Statut</span>
          </div>
          {liste.map((p) => (
            <button key={p.id} type="button" className={`${s.ligne} ${s.ligneCliquable}`} onClick={() => ouvrir(p)}>
              <span className={u.discret}>{dateHeure(p.cree_le)}</span>
              <span className={s.compte}>
                <span className={s.compteNom}>{p.prenom || p.email || <em>Compte supprimé</em>}</span>
                {p.prenom && p.email && <span className={u.discret}>{p.email}</span>}
              </span>
              <span>{libelleType(p)}</span>
              <span className={`${s.droite} ${s.montant}`}>{fcfa(p.montant)}</span>
              <span className={`${s.colOperateur} ${u.discret}`}>
                {p.operateur ?? '—'}
                {p.telephone ? ` · ${p.telephone}` : ''}
              </span>
              <span>
                <span className={`${u.statut} ${u[STATUTS[p.statut].ton]}`}>{STATUTS[p.statut].label}</span>
                {p.environnement === 'demo' && <span className={s.demo}>démo</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function Puce({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`${u.puce} ${actif ? u.puceOn : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function FicheTransaction({ p, fermer, resultat }: { p: Paiement; fermer: () => void; resultat: (r: Resultat) => void }) {
  const [enCours, demarrer] = useTransition();
  const lancer = (a: () => Promise<Resultat>) => demarrer(async () => resultat(await a()));
  // Seulement si l'argent a pu être débité : réussi chez Campay ou resté en attente.
  const peutOffrir = p.type === 'abonnement' && !p.subscription_id && !!p.user_id && (p.statut === 'reussi' || p.statut === 'en_attente');

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && fermer();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [fermer]);

  return (
    <div className={`${u.voile} ${s.voileTiroir}`} onClick={() => !enCours && fermer()}>
      <aside className={s.tiroir} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Détail de la transaction">
        <div className={s.tiroirTete}>
          <div>
            <div className={s.tiroirMontant}>{fcfa(p.montant)}</div>
            <div className={u.discret}>
              {libelleType(p)} · {dateHeure(p.cree_le)}
            </div>
          </div>
          <button type="button" className={s.fermer} onClick={fermer} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className={s.tiroirStatut}>
          <span className={`${u.statut} ${u[STATUTS[p.statut].ton]}`}>{STATUTS[p.statut].label}</span>
          {p.environnement === 'demo' && <span className={s.demo}>paiement de test (démo)</span>}
        </div>

        <div className={u.infos}>
          <Ligne label="Compte">
            {p.user_id ? (
              <Link href={`/utilisateurs/${p.user_id}`} onClick={fermer}>
                {p.prenom ? `${p.prenom} · ` : ''}
                {p.email ?? 'voir la fiche'}
              </Link>
            ) : (
              'Compte supprimé (paiement conservé, anonymisé)'
            )}
          </Ligne>
          {p.type === 'don' && <Ligne label="Don anonyme">{p.anonyme ? 'Oui (masqué dans la liste des dons)' : 'Non'}</Ligne>}
          <Ligne label="Opérateur">{p.operateur ?? '—'}</Ligne>
          <Ligne label="Numéro">{p.telephone ?? '—'}</Ligne>
          <Ligne label="Référence Campay">
            <code className={u.code}>{p.reference ?? '—'}</code>
          </Ligne>
          <Ligne label="Créé le">{dateHeure(p.cree_le)}</Ligne>
          <Ligne label="Confirmé le">{p.confirme_le ? dateHeure(p.confirme_le) : '—'}</Ligne>
          {p.type === 'abonnement' && <Ligne label="Abonnement crédité">{p.subscription_id ? 'Oui' : 'Non'}</Ligne>}
          <Ligne label="Identifiant">
            <code className={u.code}>{p.id}</code>
          </Ligne>
        </div>

        <div className={s.tiroirActions}>
          <button type="button" className={u.boutonPrincipal} disabled={enCours || !p.reference} onClick={() => lancer(() => reverifierPaiement(p.id))}>
            {enCours ? 'Vérification…' : '↻ Revérifier auprès de Campay'}
          </button>
          <p className={u.aide}>Campay redonne le vrai statut. Si le paiement est réussi, l’abonnement est crédité automatiquement.</p>
          {peutOffrir && (
            <>
              <button type="button" className={u.boutonSecondaire} disabled={enCours} onClick={() => lancer(() => offrirAccesLitige(p.id))}>
                🎁 Offrir l’accès correspondant
              </button>
              <p className={u.aide}>
                À utiliser si la personne a bien été débitée (preuve SMS de l’opérateur) mais que rien n’a été crédité : {PLAN(p.plan)} pendant {p.periode === 'yearly' ? '365' : '30'} jours.
              </p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function Ligne({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={u.info}>
      <span className={u.infoLabel}>{label}</span>
      <span className={u.infoValeur}>{children}</span>
    </div>
  );
}

// ---------------------------------------------------------------------
// Abonnements
// ---------------------------------------------------------------------

function Abonnements({ abonnements, gratuits, paiements }: { abonnements: Abonnement[]; gratuits: { type: string; slug: string }[]; paiements: Paiement[] }) {
  const router = useRouter();
  const [filtre, setFiltre] = useState<'' | 'actifs' | 'payants' | 'offerts' | 'resilies' | 'fin7'>('actifs');
  const [enCours, demarrer] = useTransition();
  const now = Date.now();
  const demoSubs = new Set(paiements.filter((p) => p.environnement === 'demo' && p.subscription_id).map((p) => p.subscription_id));

  const liste = abonnements.filter((a) => {
    const st = statutAbonnement(a, now);
    if (filtre === 'actifs') return st.actif;
    if (filtre === 'payants') return a.source === 'paiement';
    if (filtre === 'offerts') return a.source === 'offert';
    if (filtre === 'resilies') return !!a.resilie_le;
    if (filtre === 'fin7') return st.actif && !!a.ends_at && new Date(a.ends_at).getTime() - now < 7 * JOUR;
    return true;
  });

  const TYPE_LABEL: Record<string, string> = { heros: 'Héros', mythe: 'Mythe', decouverte: 'Découverte' };

  return (
    <>
      <section className={u.carte}>
        <h2 className={u.carteTitre}>Offrir un abonnement</h2>
        <p className={u.aide}>La personne doit déjà avoir un compte. Effet immédiat à sa prochaine ouverture de l’app ou du site.</p>
        <OffrirForm />
      </section>

      <section className={u.carte}>
        <div className={u.filtres}>
          {(
            [
              ['actifs', 'Actifs'],
              ['payants', 'Payants'],
              ['offerts', 'Offerts'],
              ['resilies', 'Résiliés'],
              ['fin7', 'Fin sous 7 jours'],
              ['', 'Tous'],
            ] as const
          ).map(([v, l]) => (
            <button key={l} type="button" className={`${u.puce} ${filtre === v ? u.puceOn : ''}`} onClick={() => setFiltre(v)}>
              {l}
            </button>
          ))}
        </div>
        <div className={u.compteur}>
          {liste.length} abonnement{liste.length > 1 ? 's' : ''}
        </div>
        {liste.length === 0 ? (
          <p className={u.discret}>Aucun abonnement dans cette catégorie.</p>
        ) : (
          <table className={u.table}>
            <thead>
              <tr>
                <th>Compte</th>
                <th>Forfait</th>
                <th>Origine</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {liste.map((a) => {
                const st = statutAbonnement(a, now);
                return (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/utilisateurs/${a.user_id}`}>{a.prenom || a.email || a.user_id.slice(0, 8)}</Link>
                      {a.note && <div className={u.discret}>{a.note}</div>}
                    </td>
                    <td>{PLAN(a.plan)}</td>
                    <td>
                      {a.source === 'paiement' ? 'Paiement' : a.source === 'offert' ? 'Offert' : 'Test'}
                      {demoSubs.has(a.id) && <span className={s.demo}>démo</span>}
                    </td>
                    <td>{dateCourte(a.starts_at)}</td>
                    <td>{a.ends_at ? dateCourte(a.ends_at) : 'Sans fin'}</td>
                    <td>
                      <span className={`${u.statut} ${u[st.ton]}`}>{st.label}</span>
                    </td>
                    <td className={u.droite}>
                      {st.actif && (
                        <button
                          type="button"
                          className={u.lienDanger}
                          disabled={enCours}
                          onClick={() => {
                            if (!window.confirm('Retirer cet abonnement ? L’accès payant s’arrête immédiatement, sans remboursement automatique.')) return;
                            demarrer(async () => {
                              await retirerAbonnement(a.id);
                              router.refresh();
                            });
                          }}
                        >
                          Retirer
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className={u.carte}>
        <h2 className={u.carteTitre}>Contenus gratuits</h2>
        <p className={u.aide}>Accessibles aux comptes gratuits et aux invités. Tout le reste porte un cadenas dans l’app et sur le site.</p>
        <div className={s.puces}>
          {gratuits.map((g) => (
            <span key={`${g.type}:${g.slug}`} className={s.puceGratuit}>
              <span className={u.discret}>{TYPE_LABEL[g.type] ?? g.type} · </span>
              {g.slug}
              <button
                type="button"
                title="Retirer de la liste gratuite"
                disabled={enCours}
                onClick={() =>
                  demarrer(async () => {
                    await retirerContenuGratuit(g.type, g.slug);
                    router.refresh();
                  })
                }
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <GratuitForm />
      </section>
    </>
  );
}

// ---------------------------------------------------------------------
// Dons
// ---------------------------------------------------------------------

function Dons({ P, ouvrir }: { P: Paiement[]; ouvrir: (p: Paiement) => void }) {
  const dons = P.filter((p) => p.type === 'don');
  const reussis = dons.filter((p) => p.statut === 'reussi');
  const total = reussis.reduce((n, p) => n + p.montant, 0);
  const donateurs = new Set(reussis.map((p) => p.user_id ?? p.id)).size;
  return (
    <>
      <section className={s.kpis}>
        <Kpi label="Total des dons" valeur={fcfa(total)} detail={`${reussis.length} don${reussis.length > 1 ? 's' : ''} réussi${reussis.length > 1 ? 's' : ''}`} />
        <Kpi label="Donateurs" valeur={String(donateurs)} detail="comptes distincts" />
        <Kpi label="Don moyen" valeur={fcfa(reussis.length ? Math.round(total / reussis.length) : 0)} detail="sur les dons réussis" />
        <Kpi label="Tentatives" valeur={String(dons.length)} detail={`${dons.length - reussis.length} non abouties`} ton="vert" />
      </section>
      <section className={u.carte}>
        <h2 className={u.carteTitre}>Tous les dons</h2>
        {dons.length === 0 ? (
          <p className={u.discret}>Aucun don pour l’instant.</p>
        ) : (
          <table className={u.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Donateur</th>
                <th>Montant</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {dons.map((p) => (
                <tr key={p.id}>
                  <td>{dateHeure(p.cree_le)}</td>
                  <td>{p.anonyme ? <em className={u.discret}>Anonyme</em> : p.prenom || p.email || <em className={u.discret}>Compte supprimé</em>}</td>
                  <td>{fcfa(p.montant)}</td>
                  <td>
                    <span className={`${u.statut} ${u[STATUTS[p.statut].ton]}`}>{STATUTS[p.statut].label}</span>
                    {p.environnement === 'demo' && <span className={s.demo}>démo</span>}
                  </td>
                  <td className={u.droite}>
                    <button type="button" className={u.lien} onClick={() => ouvrir(p)}>
                      Détail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
