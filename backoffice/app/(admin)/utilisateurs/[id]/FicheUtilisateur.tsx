'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { FicheUtilisateur as Fiche } from '@/lib/utilisateurs';
import { EVENEMENTS, FORFAITS, STATUTS, dateCourte, dateHeure, drapeau, fcfa, initiale, nomPays, relatif } from '@/lib/utilisateursFormat';
import * as A from '../actions';
import styles from '../utilisateurs.module.css';

/**
 * Fiche d'un compte (cdc-module-utilisateurs.md, § 4 et 5) : en-tête avec
 * actions rapides, onglets, fenêtres de confirmation, message de résultat.
 * Chaque action est revérifiée par le serveur (actions.ts).
 */

type Onglet = 'profil' | 'abonnement' | 'securite' | 'famille' | 'communaute' | 'journal';

const ONGLETS: { id: Onglet; titre: string }[] = [
  { id: 'profil', titre: 'Profil' },
  { id: 'abonnement', titre: 'Abonnement & paiements' },
  { id: 'securite', titre: 'Sécurité' },
  { id: 'famille', titre: 'Famille' },
  { id: 'communaute', titre: 'Communauté & activité' },
  { id: 'journal', titre: 'Journal' },
];

type Modale =
  | { type: 'confirmer'; titre: string; texte: string; bouton: string; danger?: boolean; action: () => Promise<A.Resultat> }
  | { type: 'suspendre' }
  | { type: 'bannir' }
  | { type: 'offrir' }
  | { type: 'supprimer' }
  | null;

const STATUT_PAIEMENT: Record<string, string> = {
  en_attente: 'En attente',
  reussi: 'Réussi',
  echoue: 'Échoué',
  annule: 'Annulé',
  expire: 'Expiré',
  rembourse: 'Remboursé',
};

const COULEUR_ENFANT: Record<string, string> = { terracotta: '#c0643a', bleu: '#3d7ab8', violet: '#7b5ab8', or: '#d4a24a' };

export function FicheUtilisateur({ fiche, soiMeme, ongletInitial }: { fiche: Fiche; soiMeme: boolean; ongletInitial?: string }) {
  const router = useRouter();
  const u = fiche.ligne;
  const [onglet, setOnglet] = useState<Onglet>(ONGLETS.some((o) => o.id === ongletInitial) ? (ongletInitial as Onglet) : 'profil');
  const [modale, setModale] = useState<Modale>(null);
  const [toast, setToast] = useState<A.Resultat | null>(null);
  const [enCours, demarrer] = useTransition();
  const intouchable = u.admin || soiMeme;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  function lancer(action: () => Promise<A.Resultat>, apres?: (r: A.Resultat) => void) {
    demarrer(async () => {
      const r = await action();
      setToast(r);
      if (r.ok) {
        setModale(null);
        apres?.(r);
        router.refresh();
      }
    });
  }

  function confirmer(titre: string, texte: string, bouton: string, action: () => Promise<A.Resultat>, danger = false) {
    setModale({ type: 'confirmer', titre, texte, bouton, action, danger });
  }

  return (
    <div className={styles.module}>
      <Link href="/utilisateurs" className={styles.retour}>
        ← Tous les utilisateurs
      </Link>

      {/* En-tête */}
      <section className={`${styles.carte} ${styles.ficheEntete}`}>
        <div className={styles.ficheIdentite}>
          <span className={`${styles.avatar} ${styles.avatarGrand} ${styles['av_' + FORFAITS[u.forfait].ton]}`}>{initiale(u.prenom, u.email)}</span>
          <div>
            <h1 className={styles.ficheNom}>
              {u.prenom || <em className={styles.sansNom}>Sans prénom</em>}
            </h1>
            <div className={styles.ficheContact}>
              <span>{u.email || '—'}</span>
              {u.telephone && <span>{u.telephone}</span>}
            </div>
            <div className={styles.ficheBadges}>
              <span className={`${styles.statut} ${styles['s_' + STATUTS[u.statut].ton]}`}>{STATUTS[u.statut].label}</span>
              <span className={`${styles.pastille} ${styles['p_' + FORFAITS[u.forfait].ton]}`}>
                {FORFAITS[u.forfait].label}
                {u.forfait !== 'decouverte' && ` · ${u.forfait_fin ? `jusqu’au ${dateCourte(u.forfait_fin)}` : 'sans fin'}`}
              </span>
              {u.mfa && <span className={styles.etiquette}>🔒 2 étapes</span>}
              {u.admin && <span className={styles.etiquette}>Admin</span>}
              {u.demo_store && <span className={styles.etiquette}>Démo store</span>}
              {u.banni_communaute && <span className={`${styles.etiquette} ${styles.etiquetteRouge}`}>Banni de la communauté</span>}
            </div>
          </div>
        </div>
        <div className={styles.ficheActions}>
          <button type="button" className={styles.boutonPrincipal} onClick={() => setModale({ type: 'offrir' })}>
            🎁 Offrir un abonnement
          </button>
          <button
            type="button"
            className={styles.boutonSecondaire}
            disabled={!u.email || enCours}
            onClick={() => lancer(() => A.envoyerReinitialisation(u.id))}
          >
            ✉ Réinitialiser le mot de passe
          </button>
          {u.statut === 'suspendu' ? (
            <button type="button" className={styles.boutonSecondaire} disabled={enCours} onClick={() => lancer(() => A.reactiver(u.id))}>
              ↺ Réactiver
            </button>
          ) : (
            <button
              type="button"
              className={styles.boutonDanger}
              disabled={intouchable}
              title={intouchable ? 'Impossible sur un administrateur ou votre propre compte' : undefined}
              onClick={() => setModale({ type: 'suspendre' })}
            >
              ⛔ Suspendre
            </button>
          )}
        </div>
      </section>

      {fiche.suspension && (
        <div className={styles.bandeauRouge}>
          <strong>Compte suspendu</strong>
          {fiche.suspension.motif && <> · Motif : {fiche.suspension.motif}</>}
          {fiche.suspension.le && <> · le {dateHeure(fiche.suspension.le)}</>}
          {fiche.suspension.par && <> par {fiche.suspension.par}</>}
          {' · '}
          {fiche.suspension.jusqu_au && new Date(fiche.suspension.jusqu_au).getFullYear() < 2100 ? `jusqu’au ${dateHeure(fiche.suspension.jusqu_au)}` : 'jusqu’à réactivation'}
        </div>
      )}

      <nav className={styles.onglets}>
        {ONGLETS.map((o) => (
          <button key={o.id} type="button" className={`${styles.onglet} ${onglet === o.id ? styles.ongletOn : ''}`} onClick={() => setOnglet(o.id)}>
            {o.titre}
            {o.id === 'famille' && u.enfants > 0 && <span className={styles.ongletNb}>{u.enfants}</span>}
            {o.id === 'journal' && fiche.journal.length > 0 && <span className={styles.ongletNb}>{fiche.journal.length}</span>}
          </button>
        ))}
      </nav>

      {onglet === 'profil' && <OngletProfil fiche={fiche} enCours={enCours} lancer={lancer} confirmer={confirmer} />}
      {onglet === 'abonnement' && <OngletAbonnement fiche={fiche} ouvrirOffre={() => setModale({ type: 'offrir' })} confirmer={confirmer} />}
      {onglet === 'securite' && <OngletSecurite fiche={fiche} intouchable={intouchable} enCours={enCours} lancer={lancer} confirmer={confirmer} />}
      {onglet === 'famille' && <OngletFamille fiche={fiche} />}
      {onglet === 'communaute' && <OngletCommunaute fiche={fiche} ouvrirBan={() => setModale({ type: 'bannir' })} enCours={enCours} lancer={lancer} />}
      {onglet === 'journal' && <OngletJournal fiche={fiche} />}

      {onglet === 'profil' && (
        <section className={`${styles.carte} ${styles.zoneDanger}`}>
          <div>
            <h2 className={styles.carteTitre}>Supprimer définitivement le compte</h2>
            <p className={styles.aide}>
              Efface le compte et toutes ses données (profil, enfants, communauté, boutique, quiz, abonnements, photos). Les paiements sont conservés
              anonymisés pour la comptabilité. Irréversible.
            </p>
          </div>
          <button
            type="button"
            className={styles.boutonDanger}
            disabled={intouchable}
            title={intouchable ? 'Impossible sur un administrateur ou votre propre compte' : undefined}
            onClick={() => setModale({ type: 'supprimer' })}
          >
            Supprimer le compte
          </button>
        </section>
      )}

      {modale && (
        <Portail>
          <div className={styles.voile} onClick={() => !enCours && setModale(null)}>
            <div className={styles.modale} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
              {modale.type === 'confirmer' && (
                <ModaleConfirmer
                  titre={modale.titre}
                  texte={modale.texte}
                  bouton={modale.bouton}
                  danger={modale.danger}
                  enCours={enCours}
                  annuler={() => setModale(null)}
                  valider={() => lancer(modale.action)}
                />
              )}
              {modale.type === 'suspendre' && <ModaleSuspendre enCours={enCours} annuler={() => setModale(null)} valider={(m, d) => lancer(() => A.suspendre(u.id, m, d))} />}
              {modale.type === 'bannir' && <ModaleBannir enCours={enCours} annuler={() => setModale(null)} valider={(m) => lancer(() => A.bannirCommunaute(u.id, true, m))} />}
              {modale.type === 'offrir' && (
                <ModaleOffrir enCours={enCours} annuler={() => setModale(null)} valider={(p, d, n) => lancer(() => A.offrir(u.id, p, d, n))} />
              )}
              {modale.type === 'supprimer' && (
                <ModaleSupprimer
                  attendu={u.email || u.telephone || ''}
                  enCours={enCours}
                  annuler={() => setModale(null)}
                  valider={(c) => lancer(() => A.supprimerCompte(u.id, c), () => router.push('/utilisateurs'))}
                />
              )}
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

/** Le layout anime son contenu (transform), ce qui casse position:fixed : on rend les fenêtres dans <body>. */
function Portail({ children }: { children: ReactNode }) {
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);
  return monte ? createPortal(children, document.body) : null;
}

type Lancer = (action: () => Promise<A.Resultat>, apres?: (r: A.Resultat) => void) => void;
type Confirmer = (titre: string, texte: string, bouton: string, action: () => Promise<A.Resultat>, danger?: boolean) => void;

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.info}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValeur}>{children}</span>
    </div>
  );
}

// ---------------------------------------------------------------------
// Onglets
// ---------------------------------------------------------------------

function OngletProfil({ fiche, enCours, lancer, confirmer }: { fiche: Fiche; enCours: boolean; lancer: Lancer; confirmer: Confirmer }) {
  const u = fiche.ligne;
  const [edition, setEdition] = useState(false);
  const [form, setForm] = useState({ prenom: u.prenom, telephone: u.telephone ?? '', pays: u.pays ?? '', langue: u.langue ?? '' });
  const [note, setNote] = useState(fiche.note?.texte ?? '');

  return (
    <div className={styles.grille2}>
      <section className={styles.carte}>
        <div className={styles.carteTete}>
          <h2 className={styles.carteTitre}>Identité</h2>
          {!edition && (
            <button type="button" className={styles.lien} onClick={() => setEdition(true)}>
              ✎ Modifier
            </button>
          )}
        </div>
        {edition ? (
          <form
            className={styles.formulaire}
            onSubmit={(e) => {
              e.preventDefault();
              lancer(() => A.modifierProfil(u.id, form), () => {
                setEdition(false);
              });
            }}
          >
            <label>
              Prénom
              <input value={form.prenom} maxLength={40} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
            </label>
            <label>
              Téléphone (avec indicatif)
              <input value={form.telephone} placeholder="+237…" onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </label>
            <div className={styles.formLigne}>
              <label>
                Pays (code)
                <input value={form.pays} maxLength={2} placeholder="CM" onChange={(e) => setForm({ ...form, pays: e.target.value.toUpperCase() })} />
              </label>
              <label>
                Langue
                <select value={form.langue} onChange={(e) => setForm({ ...form, langue: e.target.value })}>
                  <option value="">—</option>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.boutonSecondaire} onClick={() => setEdition(false)} disabled={enCours}>
                Annuler
              </button>
              <button type="submit" className={styles.boutonPrincipal} disabled={enCours}>
                {enCours ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.infos}>
            <Info label="Prénom">{u.prenom || '—'}</Info>
            <Info label="E-mail">
              {u.email || '—'}{' '}
              {fiche.email_confirme_le ? (
                <span className={styles.ok}>✓ confirmé</span>
              ) : (
                <>
                  <span className={styles.attention}>non confirmé</span>{' '}
                  <button
                    type="button"
                    className={styles.lien}
                    onClick={() =>
                      confirmer('Confirmer l’e-mail ?', 'À faire seulement si vous êtes sûr que cette adresse appartient bien à la personne (elle ne reçoit pas le code).', 'Confirmer', () => A.confirmerEmail(u.id))
                    }
                  >
                    Confirmer manuellement
                  </button>
                </>
              )}
            </Info>
            <Info label="Téléphone">{u.telephone ?? '—'}</Info>
            <Info label="Pays">
              {drapeau(u.pays)} {nomPays(u.pays)}
            </Info>
            <Info label="Langue">{u.langue === 'en' ? 'English' : u.langue === 'fr' ? 'Français' : '—'}</Info>
            <Info label="Centres d’intérêt">{fiche.usages.length ? fiche.usages.join(', ') : '—'}</Info>
          </div>
        )}
      </section>

      <section className={styles.carte}>
        <h2 className={styles.carteTitre}>Compte</h2>
        <div className={styles.infos}>
          <Info label="Inscription">{dateHeure(u.inscrit_le)}</Info>
          <Info label="Dernière connexion">
            {dateHeure(u.derniere_connexion)} <span className={styles.discret}>({relatif(u.derniere_connexion)})</span>
          </Info>
          <Info label="Dernière activité appareil">{u.derniere_activite ? relatif(u.derniere_activite) : '—'}</Info>
          <Info label="Conditions acceptées">
            {fiche.consentement.le ? `${dateCourte(fiche.consentement.le)} · version ${fiche.consentement.version ?? '?'}` : 'non enregistré (compte ancien)'}
          </Info>
          <Info label="Identifiant">
            <code className={styles.code}>{u.id}</code>
          </Info>
        </div>

        <h3 className={styles.sousTitreCarte}>Note interne</h3>
        <p className={styles.aide}>Visible uniquement par les administrateurs.</p>
        {fiche.notesDisponibles ? (
          <>
            <textarea className={styles.zoneTexte} rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. : testeur Google Play, a signalé un bug de paiement le 10/10…" />
            <div className={styles.formActions}>
              {fiche.note && <span className={styles.discret}>Modifiée par {fiche.note.auteur}, {relatif(fiche.note.le)}</span>}
              <button type="button" className={styles.boutonSecondaire} disabled={enCours || note.trim() === (fiche.note?.texte ?? '')} onClick={() => lancer(() => A.enregistrerNote(u.id, note))}>
                Enregistrer la note
              </button>
            </div>
          </>
        ) : (
          <p className={styles.attention}>Exécutez schema-utilisateurs-admin.sql dans Supabase pour activer les notes.</p>
        )}
      </section>
    </div>
  );
}

function OngletAbonnement({ fiche, ouvrirOffre, confirmer }: { fiche: Fiche; ouvrirOffre: () => void; confirmer: Confirmer }) {
  const u = fiche.ligne;
  return (
    <>
      <section className={styles.carte}>
        <div className={styles.carteTete}>
          <h2 className={styles.carteTitre}>Forfait actuel</h2>
          <button type="button" className={styles.boutonPrincipal} onClick={ouvrirOffre}>
            🎁 Offrir un abonnement
          </button>
        </div>
        <div className={styles.forfaitActuel}>
          <span className={`${styles.pastille} ${styles.pastilleGrande} ${styles['p_' + FORFAITS[u.forfait].ton]}`}>{FORFAITS[u.forfait].label}</span>
          <span className={styles.discret}>
            {u.forfait === 'decouverte' ? 'Gratuit : contenus gratuits uniquement.' : u.forfait_fin ? `Jusqu’au ${dateCourte(u.forfait_fin)}` : 'Sans date de fin'}
          </span>
        </div>
      </section>

      <section className={styles.carte}>
        <h2 className={styles.carteTitre}>Historique des abonnements</h2>
        {fiche.abonnements.length === 0 ? (
          <p className={styles.discret}>Aucun abonnement.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Forfait</th>
                <th>Origine</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {fiche.abonnements.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.plan === 'heritage' ? 'Héritage' : 'Racines'}
                    {s.note && <div className={styles.discret}>{s.note}</div>}
                  </td>
                  <td>{s.source === 'offert' ? 'Offert' : s.source === 'paiement' ? 'Paiement' : 'Test'}</td>
                  <td>{dateCourte(s.starts_at)}</td>
                  <td>{s.ends_at ? dateCourte(s.ends_at) : 'Sans fin'}</td>
                  <td>
                    <span className={`${styles.statut} ${s.actif ? styles.s_vert : styles.s_gris}`}>{s.actif ? 'Actif' : s.status === 'cancelled' ? 'Retiré' : 'Terminé'}</span>
                  </td>
                  <td className={styles.droite}>
                    {s.actif && (
                      <button
                        type="button"
                        className={styles.lienDanger}
                        onClick={() =>
                          confirmer('Retirer cet abonnement ?', 'L’accès payant s’arrête immédiatement. Un paiement éventuel n’est pas remboursé automatiquement.', 'Retirer', () => A.retirerAbonnement(u.id, s.id), true)
                        }
                      >
                        Retirer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.carte}>
        <h2 className={styles.carteTitre}>Paiements et dons</h2>
        {fiche.paiements.length === 0 ? (
          <p className={styles.discret}>Aucun paiement.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Opérateur</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {fiche.paiements.map((p) => (
                <tr key={p.id}>
                  <td>{dateHeure(p.created_at)}</td>
                  <td>
                    {p.type === 'don' ? 'Don' : `Abonnement ${p.plan === 'heritage' ? 'Héritage' : 'Racines'}`}
                    {p.periode && <span className={styles.discret}> · {p.periode === 'yearly' ? 'annuel' : 'mensuel'}</span>}
                  </td>
                  <td>{fcfa(p.montant_fcfa)}</td>
                  <td>{p.moyen ?? '—'}</td>
                  <td>
                    <span className={`${styles.statut} ${p.statut === 'reussi' ? styles.s_vert : p.statut === 'en_attente' ? styles.s_orange : styles.s_gris}`}>
                      {STATUT_PAIEMENT[p.statut] ?? p.statut}
                    </span>
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

function OngletSecurite({ fiche, intouchable, enCours, lancer, confirmer }: { fiche: Fiche; intouchable: boolean; enCours: boolean; lancer: Lancer; confirmer: Confirmer }) {
  const u = fiche.ligne;
  const bloque = fiche.blocage || fiche.blocage2fa;
  return (
    <>
      <div className={styles.grille2}>
        <section className={styles.carte}>
          <h2 className={styles.carteTitre}>Accès</h2>
          <div className={styles.actionsListe}>
            <Action
              titre="Vérification en 2 étapes"
              etat={u.mfa ? <span className={styles.ok}>Activée</span> : <span className={styles.discret}>Non activée</span>}
              aide="À désactiver si la personne a perdu son téléphone ou son application de codes."
              bouton={u.mfa ? 'Désactiver' : undefined}
              danger
              disabled={enCours}
              onClick={() =>
                confirmer(
                  'Désactiver la vérification en 2 étapes ?',
                  'Vérifiez d’abord l’identité de la personne (par exemple en l’appelant). Elle pourra la réactiver depuis son profil ; si elle est obligatoire, l’app la lui redemandera.',
                  'Désactiver',
                  () => A.reinitialiser2fa(u.id),
                  true
                )
              }
            />
            <Action
              titre="Blocage de connexion"
              etat={
                bloque ? (
                  <span className={styles.attention}>
                    {fiche.blocage ? `${fiche.blocage.echecs} échec(s) mot de passe` : ''}
                    {fiche.blocage && fiche.blocage2fa ? ' · ' : ''}
                    {fiche.blocage2fa ? `${fiche.blocage2fa.echecs} échec(s) code` : ''}
                  </span>
                ) : (
                  <span className={styles.ok}>Aucun</span>
                )
              }
              aide="Après trop d’essais, la connexion est bloquée quelques minutes."
              bouton={bloque ? 'Débloquer' : undefined}
              disabled={enCours}
              onClick={() => lancer(() => A.debloquerConnexion(u.id))}
            />
            <Action
              titre="Mot de passe"
              etat={<span className={styles.discret}>jamais visible</span>}
              aide="Envoie l’e-mail habituel de réinitialisation."
              bouton={u.email ? 'Envoyer l’e-mail' : undefined}
              disabled={enCours}
              onClick={() => lancer(() => A.envoyerReinitialisation(u.id))}
            />
            <Action
              titre="Sessions ouvertes"
              etat={<span className={styles.discret}>tous les appareils</span>}
              aide="Renvoie chaque appareil à la connexion (effet complet sous 1 h)."
              bouton={intouchable ? undefined : 'Déconnecter de partout'}
              danger
              disabled={enCours}
              onClick={() => confirmer('Déconnecter de partout ?', 'La personne devra se reconnecter sur tous ses appareils.', 'Déconnecter', () => A.deconnecterPartout(u.id), true)}
            />
            <Action
              titre="Compte de démonstration store"
              etat={u.demo_store ? <span className={styles.ok}>Oui</span> : <span className={styles.discret}>Non</span>}
              aide="Pour les testeurs Google : pas de vérification d’appareil."
              bouton={u.demo_store ? 'Retirer' : 'Activer'}
              disabled={enCours}
              onClick={() => lancer(() => A.basculerDemoStore(u.id, !u.demo_store))}
            />
          </div>
        </section>

        <section className={styles.carte}>
          <div className={styles.carteTete}>
            <h2 className={styles.carteTitre}>Appareils de confiance</h2>
            {fiche.appareils.length > 0 && (
              <button
                type="button"
                className={styles.lienDanger}
                disabled={enCours}
                onClick={() =>
                  confirmer('Oublier tous les appareils ?', 'À la prochaine connexion, un code sera envoyé par e-mail pour valider l’appareil. Utile en cas de téléphone perdu ou volé.', 'Oublier les appareils', () => A.oublierAppareils(u.id), true)
                }
              >
                Oublier les appareils
              </button>
            )}
          </div>
          {fiche.appareils.length === 0 ? (
            <p className={styles.discret}>Aucun appareil enregistré.</p>
          ) : (
            <ul className={styles.appareils}>
              {fiche.appareils.map((a) => (
                <li key={a.device_id}>
                  <span className={styles.appareilIcone}>📱</span>
                  <span className={styles.appareilTexte}>
                    <strong>{a.nom || 'Appareil sans nom'}</strong>
                    {a.actif && <span className={`${styles.statut} ${styles.s_vert}`}>Actif</span>}
                    <span className={styles.discret}>
                      Validé le {dateCourte(a.valide_le)} · vu {relatif(a.derniere_activite)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={styles.carte}>
        <h2 className={styles.carteTitre}>Derniers événements de sécurité</h2>
        {fiche.evenements.length === 0 ? (
          <p className={styles.discret}>Aucun événement enregistré pour cet identifiant.</p>
        ) : (
          <ul className={styles.chrono}>
            {fiche.evenements.map((e) => (
              <li key={e.id} className={e.event_type === 'login_success' ? styles.chronoOk : styles.chronoAlerte}>
                <span>{EVENEMENTS[e.event_type] ?? e.event_type}</span>
                <span className={styles.discret}>{dateHeure(e.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Action({
  titre,
  etat,
  aide,
  bouton,
  danger,
  disabled,
  onClick,
}: {
  titre: string;
  etat: ReactNode;
  aide: string;
  bouton?: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className={styles.action}>
      <div>
        <div className={styles.actionTitre}>
          {titre} · {etat}
        </div>
        <div className={styles.aide}>{aide}</div>
      </div>
      {bouton && (
        <button type="button" className={danger ? styles.boutonDangerPetit : styles.boutonPetit} disabled={disabled} onClick={onClick}>
          {bouton}
        </button>
      )}
    </div>
  );
}

function OngletFamille({ fiche }: { fiche: Fiche }) {
  return (
    <section className={styles.carte}>
      <div className={styles.carteTete}>
        <h2 className={styles.carteTitre}>Profils enfants</h2>
        <span className={styles.discret}>Code parent : {fiche.codeParent ? 'défini' : 'non défini'}</span>
      </div>
      <p className={styles.aide}>Lecture seule : le parent gère ses enfants dans l’app. Le code parent n’est jamais affiché.</p>
      {fiche.enfants.length === 0 ? (
        <p className={styles.discret}>Aucun profil enfant.</p>
      ) : (
        <div className={styles.enfants}>
          {fiche.enfants.map((e) => (
            <div key={e.id} className={styles.enfant}>
              <span className={styles.enfantAvatar} style={{ background: COULEUR_ENFANT[e.avatar_couleur] ?? '#8c7b67' }}>
                {e.prenom.charAt(0).toUpperCase()}
              </span>
              <div>
                <strong>{e.prenom}</strong>
                <div className={styles.discret}>
                  {e.age} an{e.age > 1 ? 's' : ''} · Découverte {e.decouverte_activee ? 'activée' : 'désactivée'}
                  {e.limite_ecran_minutes ? ` · ${e.limite_ecran_minutes} min/jour (indicatif)` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function OngletCommunaute({ fiche, ouvrirBan, enCours, lancer }: { fiche: Fiche; ouvrirBan: () => void; enCours: boolean; lancer: Lancer }) {
  const c = fiche.communaute;
  return (
    <div className={styles.grille2}>
      <section className={styles.carte}>
        <div className={styles.carteTete}>
          <h2 className={styles.carteTitre}>Communauté</h2>
          {c &&
            (c.is_banned ? (
              <button type="button" className={styles.boutonPetit} disabled={enCours} onClick={() => lancer(() => A.bannirCommunaute(fiche.ligne.id, false, ''))}>
                Lever le bannissement
              </button>
            ) : (
              <button type="button" className={styles.boutonDangerPetit} onClick={ouvrirBan}>
                Bannir
              </button>
            ))}
        </div>
        {!c ? (
          <p className={styles.discret}>Pas de profil communauté.</p>
        ) : (
          <div className={styles.infos}>
            <Info label="Pseudo">@{c.pseudo}</Info>
            <Info label="Bio">{c.bio || '—'}</Info>
            <Info label="Publications">{c.publications}</Info>
            <Info label="Membre depuis">{dateCourte(c.cree_le)}</Info>
            <Info label="Statut">{c.is_banned ? <span className={styles.attention}>Banni · {c.ban_reason ?? 'sans motif'}</span> : <span className={styles.ok}>Actif</span>}</Info>
          </div>
        )}
      </section>
      <section className={styles.carte}>
        <h2 className={styles.carteTitre}>Activité</h2>
        <div className={styles.infos}>
          <Info label="Boutique Marché">
            {fiche.boutique ? `${fiche.boutique.nom_boutique} · ${fiche.boutique.artisanat} · ${fiche.boutique.region}${fiche.boutique.is_active ? '' : ' (désactivée)'}` : '—'}
          </Info>
          <Info label="Quiz réalisés">{fiche.quiz.tentatives}</Info>
          <Info label="Score moyen">{fiche.quiz.moyenne === null ? '—' : `${fiche.quiz.moyenne} %`}</Info>
        </div>
      </section>
    </div>
  );
}

function OngletJournal({ fiche }: { fiche: Fiche }) {
  return (
    <section className={styles.carte}>
      <h2 className={styles.carteTitre}>Actions d’administration sur ce compte</h2>
      {fiche.journal.length === 0 ? (
        <p className={styles.discret}>Aucune action enregistrée.</p>
      ) : (
        <ul className={styles.chrono}>
          {fiche.journal.map((j) => (
            <li key={j.id}>
              <span>{j.action.replace(/^Utilisateurs · [^:]+ : /, '')}</span>
              <span className={styles.discret}>
                {j.admin_email} · {dateHeure(j.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------
// Fenêtres
// ---------------------------------------------------------------------

function Boutons({ enCours, annuler, libelle, danger, desactive }: { enCours: boolean; annuler: () => void; libelle: string; danger?: boolean; desactive?: boolean }) {
  return (
    <div className={styles.formActions}>
      <button type="button" className={styles.boutonSecondaire} onClick={annuler} disabled={enCours}>
        Annuler
      </button>
      <button type="submit" className={danger ? styles.boutonDanger : styles.boutonPrincipal} disabled={enCours || desactive}>
        {enCours ? 'En cours…' : libelle}
      </button>
    </div>
  );
}

function ModaleConfirmer({ titre, texte, bouton, danger, enCours, annuler, valider }: { titre: string; texte: string; bouton: string; danger?: boolean; enCours: boolean; annuler: () => void; valider: () => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        valider();
      }}
    >
      <h2 className={styles.modaleTitre}>{titre}</h2>
      <p className={styles.modaleTexte}>{texte}</p>
      <Boutons enCours={enCours} annuler={annuler} libelle={bouton} danger={danger} />
    </form>
  );
}

function ModaleSuspendre({ enCours, annuler, valider }: { enCours: boolean; annuler: () => void; valider: (motif: string, duree: string) => void }) {
  const [motif, setMotif] = useState('');
  const [duree, setDuree] = useState('7j');
  return (
    <form
      className={styles.formulaire}
      onSubmit={(e) => {
        e.preventDefault();
        valider(motif, duree);
      }}
    >
      <h2 className={styles.modaleTitre}>Suspendre le compte</h2>
      <p className={styles.modaleTexte}>La personne est déconnectée et ne peut plus se connecter. L’app et le site lui affichent « compte suspendu ».</p>
      <label>
        Durée
        <div className={styles.choix}>
          {[
            ['24h', '24 h'],
            ['7j', '7 jours'],
            ['30j', '30 jours'],
            ['indefini', 'Jusqu’à réactivation'],
          ].map(([v, l]) => (
            <button key={v} type="button" className={`${styles.puce} ${duree === v ? styles.puceOn : ''}`} onClick={() => setDuree(v)}>
              {l}
            </button>
          ))}
        </div>
      </label>
      <label>
        Motif (visible des seuls admins)
        <textarea className={styles.zoneTexte} rows={3} maxLength={300} value={motif} onChange={(e) => setMotif(e.target.value)} required minLength={3} placeholder="Ex. : fraude au paiement, harcèlement signalé…" />
      </label>
      <Boutons enCours={enCours} annuler={annuler} libelle="Suspendre" danger desactive={motif.trim().length < 3} />
    </form>
  );
}

function ModaleBannir({ enCours, annuler, valider }: { enCours: boolean; annuler: () => void; valider: (motif: string) => void }) {
  const [motif, setMotif] = useState('');
  return (
    <form
      className={styles.formulaire}
      onSubmit={(e) => {
        e.preventDefault();
        valider(motif);
      }}
    >
      <h2 className={styles.modaleTitre}>Bannir de la communauté</h2>
      <p className={styles.modaleTexte}>Le profil et les publications disparaissent du fil public. Le reste du compte (lecture, abonnement) n’est pas touché.</p>
      <label>
        Motif
        <textarea className={styles.zoneTexte} rows={3} maxLength={300} value={motif} onChange={(e) => setMotif(e.target.value)} required minLength={3} />
      </label>
      <Boutons enCours={enCours} annuler={annuler} libelle="Bannir" danger desactive={motif.trim().length < 3} />
    </form>
  );
}

function ModaleOffrir({ enCours, annuler, valider }: { enCours: boolean; annuler: () => void; valider: (plan: string, duree: string, note: string) => void }) {
  const [plan, setPlan] = useState('racines');
  const [duree, setDuree] = useState('30');
  const [note, setNote] = useState('');
  return (
    <form
      className={styles.formulaire}
      onSubmit={(e) => {
        e.preventDefault();
        valider(plan, duree, note);
      }}
    >
      <h2 className={styles.modaleTitre}>Offrir un abonnement</h2>
      <label>
        Forfait
        <div className={styles.choix}>
          {[
            ['racines', 'Racines'],
            ['heritage', 'Héritage'],
          ].map(([v, l]) => (
            <button key={v} type="button" className={`${styles.puce} ${plan === v ? styles.puceOn : ''}`} onClick={() => setPlan(v)}>
              {l}
            </button>
          ))}
        </div>
      </label>
      <label>
        Durée
        <div className={styles.choix}>
          {[
            ['7', '7 jours'],
            ['30', '30 jours'],
            ['90', '3 mois'],
            ['365', '1 an'],
            ['illimite', 'Sans fin'],
          ].map(([v, l]) => (
            <button key={v} type="button" className={`${styles.puce} ${duree === v ? styles.puceOn : ''}`} onClick={() => setDuree(v)}>
              {l}
            </button>
          ))}
        </div>
      </label>
      <label>
        Note (facultatif)
        <input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="Ex. : testeur, partenaire, geste commercial" />
      </label>
      <Boutons enCours={enCours} annuler={annuler} libelle="Offrir" />
    </form>
  );
}

function ModaleSupprimer({ attendu, enCours, annuler, valider }: { attendu: string; enCours: boolean; annuler: () => void; valider: (confirmation: string) => void }) {
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
      <h2 className={styles.modaleTitre}>Supprimer définitivement ce compte ?</h2>
      <p className={styles.modaleTexte}>
        Toutes les données du compte sont effacées, sans retour possible. Les paiements restent, anonymisés. Pour confirmer, tapez <strong>{attendu}</strong>.
      </p>
      <input value={saisie} onChange={(e) => setSaisie(e.target.value)} placeholder={attendu} autoFocus />
      <Boutons enCours={enCours} annuler={annuler} libelle="Supprimer définitivement" danger desactive={!ok} />
    </form>
  );
}
