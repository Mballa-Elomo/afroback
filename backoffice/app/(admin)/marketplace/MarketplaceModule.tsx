'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Boutique, Commande, DonneesMarketplace, StatutValidation } from '@/lib/marketplace';
import { dateCourte, dateHeure, fcfa } from '@/lib/utilisateursFormat';
import { Icone } from '@/components/Icone';
import * as A from './actions';
import u from '../utilisateurs/utilisateurs.module.css';
import s from './marketplace.module.css';

/** Module Marketplace (cdc-module-marketplace.md) : boutiques, produits, commandes, avis. */

type Onglet = 'apercu' | 'boutiques' | 'produits' | 'commandes' | 'avis';

const STATUT_BOUTIQUE: Record<StatutValidation, { label: string; ton: string }> = {
  en_attente: { label: 'En attente', ton: 's_orange' },
  valide: { label: 'Validée', ton: 's_vert' },
  refuse: { label: 'Refusée', ton: 's_rouge' },
  suspendu: { label: 'Suspendue', ton: 's_rouge' },
};
const STATUT_COMMANDE: Record<Commande['statut'], { label: string; ton: string }> = {
  en_attente_paiement: { label: 'En attente de paiement', ton: 's_orange' },
  expediee: { label: 'Expédiée', ton: 's_vert' },
  livree: { label: 'Livrée', ton: 's_vert' },
  annulee: { label: 'Annulée', ton: 's_gris' },
};
const CATEGORIES: Record<string, string> = {
  sculpture: 'Sculpture',
  bijoux: 'Bijoux',
  textile: 'Textile',
  poterie: 'Poterie',
  peinture: 'Peinture',
  instrument: 'Instrument',
  autre: 'Autre',
};

type DemandeMotif = { titre: string; texte: string; bouton: string; action: (motif: string) => Promise<A.Resultat> } | null;

export function MarketplaceModule({ d }: { d: DonneesMarketplace }) {
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>(d.boutiques.some((b) => b.statut === 'en_attente') ? 'boutiques' : 'apercu');
  const [toast, setToast] = useState<A.Resultat | null>(null);
  const [motif, setMotif] = useState<DemandeMotif>(null);
  const [commande, setCommande] = useState<Commande | null>(null);
  const [enCours, demarrer] = useTransition();
  const boutique = (id: string) => d.boutiques.find((b) => b.id === id);
  const produit = (id: string) => d.produits.find((p) => p.id === id);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  function lancer(action: () => Promise<A.Resultat>, apres?: () => void) {
    demarrer(async () => {
      const r = await action();
      setToast(r);
      if (r.ok) {
        apres?.();
        router.refresh();
      }
    });
  }

  const enAttente = d.boutiques.filter((b) => b.statut === 'en_attente').length;

  return (
    <div className={u.module}>
      <header className={u.entete}>
        <div>
          <h1 className={u.titre}>Marketplace</h1>
          <p className={u.sousTitre}>Boutiques des artisans, produits, commandes et avis du Marché AFROBACK.</p>
        </div>
      </header>

      <div className={s.bandeau}>
        <Icone nom="bolt" taille={17} />
        <span>
          <strong>Paiement des commandes non branché :</strong> aucune commande n’est encaissée. Gardez le Marché désactivé pour le public (Paramètres → Modules) tant que le paiement, la commission et le
          reversement aux artisans ne sont pas définis.
        </span>
      </div>
      {!d.moderationInstallee && (
        <div className={s.bandeau}>
          <Icone nom="shield" taille={17} />
          <span>
            Exécutez <code>schema-marketplace-moderation.sql</code> dans Supabase : sans lui, toute nouvelle boutique est visible aussitôt, sans validation.
          </span>
        </div>
      )}

      <nav className={u.onglets}>
        {(
          [
            ['apercu', 'Aperçu', 'dash', 0],
            ['boutiques', 'Boutiques', 'market', enAttente],
            ['produits', 'Produits', 'gift', 0],
            ['commandes', 'Commandes', 'revenue', 0],
            ['avis', 'Avis', 'comments', 0],
          ] as [Onglet, string, string, number][]
        ).map(([id, titre, icone, nb]) => (
          <button key={id} type="button" className={`${u.onglet} ${onglet === id ? u.ongletOn : ''}`} onClick={() => setOnglet(id)}>
            <Icone nom={icone} taille={15} /> {titre}
            {nb > 0 && <span className={s.badge}>{nb}</span>}
          </button>
        ))}
      </nav>

      {onglet === 'apercu' && (
        <div className={s.kpis}>
          <Kpi label="Boutiques" valeur={d.boutiques.length} detail={`${enAttente} en attente · ${d.boutiques.filter((b) => b.statut === 'valide').length} validées`} />
          <Kpi label="Produits en ligne" valeur={d.produits.filter((p) => !p.masque && p.statut === 'en_ligne').length} detail={`${d.produits.filter((p) => p.masque).length} masqués`} />
          <Kpi label="Commandes" valeur={d.commandes.length} detail={`${fcfa(d.commandes.filter((c) => c.statut !== 'annulee').reduce((n, c) => n + c.montant, 0))} commandés`} />
          <Kpi label="Avis" valeur={d.avis.length} detail={d.avis.length ? `note moyenne ${(d.avis.reduce((n, a) => n + a.note, 0) / d.avis.length).toFixed(1)} / 5` : 'aucun avis'} />
        </div>
      )}

      {onglet === 'boutiques' && (
        <section className={u.carte}>
          {d.boutiques.length === 0 ? (
            <Vide icone="🛍" texte="Aucune boutique pour l’instant." />
          ) : (
            <table className={u.table}>
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th>Artisan</th>
                  <th>Produits</th>
                  <th>Commandes</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {d.boutiques.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.nom}</strong>
                      <div className={u.discret}>
                        {b.artisanat} · {b.region} · depuis le {dateCourte(b.cree_le)}
                      </div>
                      {b.bio && <div className={s.bio}>{b.bio}</div>}
                    </td>
                    <td>
                      <Link href={`/utilisateurs/${b.user_id}`}>{b.email ?? 'voir le compte'}</Link>
                    </td>
                    <td>{d.produits.filter((p) => p.boutique_id === b.id).length}</td>
                    <td>{d.commandes.filter((c) => c.boutique_id === b.id).length}</td>
                    <td>
                      <span className={`${u.statut} ${u[STATUT_BOUTIQUE[b.statut].ton]}`}>{STATUT_BOUTIQUE[b.statut].label}</span>
                      {!b.actif && <div className={u.discret}>fermée par l’artisan</div>}
                      {b.motif && <div className={u.discret}>{b.motif}</div>}
                    </td>
                    <td className={s.actions}>
                      <ActionsBoutique b={b} enCours={enCours} lancer={lancer} demanderMotif={setMotif} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {onglet === 'produits' && (
        <section className={u.carte}>
          {d.produits.length === 0 ? (
            <Vide icone="🏺" texte="Aucun produit pour l’instant." />
          ) : (
            <div className={s.produits}>
              {d.produits.map((p) => (
                <article key={p.id} className={`${s.produit} ${p.masque ? s.produitMasque : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image_url ? <img src={p.image_url} alt="" className={s.image} /> : <div className={s.image} />}
                  <div className={s.produitCorps}>
                    <strong>{p.nom}</strong>
                    <span className={u.discret}>
                      {boutique(p.boutique_id)?.nom ?? 'Boutique ?'} · {CATEGORIES[p.categorie] ?? p.categorie}
                    </span>
                    <span className={s.prix}>{fcfa(p.prix)}</span>
                    <span className={u.discret}>
                      Stock {p.stock} · {p.vues} vue{p.vues > 1 ? 's' : ''} · {p.masque ? `masqué (${p.motif ?? 'sans motif'})` : p.statut === 'rupture' ? 'rupture' : 'en ligne'}
                    </span>
                    {p.masque ? (
                      <button type="button" className={u.boutonPetit} disabled={enCours} onClick={() => lancer(() => A.masquerProduit(p.id, false))}>
                        Réafficher
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={u.boutonDangerPetit}
                        disabled={enCours}
                        onClick={() =>
                          setMotif({ titre: `Masquer « ${p.nom} » ?`, texte: 'Le produit disparaît du Marché public. L’artisan le voit encore dans sa boutique.', bouton: 'Masquer', action: (m) => A.masquerProduit(p.id, true, m) })
                        }
                      >
                        Masquer
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {onglet === 'commandes' && (
        <section className={u.carte}>
          {d.commandes.length === 0 ? (
            <Vide icone="📦" texte="Aucune commande pour l’instant." />
          ) : (
            <table className={u.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Acheteur</th>
                  <th>Boutique</th>
                  <th>Montant</th>
                  <th>Ville</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {d.commandes.map((c) => (
                  <tr key={c.id}>
                    <td>{dateHeure(c.cree_le)}</td>
                    <td>
                      <Link href={`/utilisateurs/${c.acheteur_id}`}>{c.acheteur_email ?? 'compte'}</Link>
                    </td>
                    <td>{boutique(c.boutique_id)?.nom ?? '—'}</td>
                    <td>{fcfa(c.montant)}</td>
                    <td>{c.livraison.ville}</td>
                    <td>
                      <span className={`${u.statut} ${u[STATUT_COMMANDE[c.statut].ton]}`}>{STATUT_COMMANDE[c.statut].label}</span>
                    </td>
                    <td className={u.droite}>
                      <button type="button" className={u.lien} onClick={() => setCommande(c)}>
                        Détail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {onglet === 'avis' && (
        <section className={u.carte}>
          {d.avis.length === 0 ? (
            <Vide icone="⭐" texte="Aucun avis pour l’instant." />
          ) : (
            <ul className={s.avis}>
              {d.avis.map((a) => (
                <li key={a.id} className={a.masque ? s.produitMasque : ''}>
                  <div className={s.avisTete}>
                    <span className={s.etoiles}>{'★'.repeat(a.note)}{'☆'.repeat(5 - a.note)}</span>
                    <strong>{a.auteur}</strong>
                    <span className={u.discret}>
                      sur « {produit(a.produit_id)?.nom ?? 'produit'} » · {dateCourte(a.cree_le)}
                    </span>
                    <button type="button" className={a.masque ? u.boutonPetit : u.boutonDangerPetit} disabled={enCours} onClick={() => lancer(() => A.masquerAvis(a.id, !a.masque))}>
                      {a.masque ? 'Réafficher' : 'Masquer'}
                    </button>
                  </div>
                  <p>{a.commentaire}</p>
                  {a.reponse && <p className={s.reponse}>Réponse de l’artisan : {a.reponse}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {motif && (
        <Portail>
          <ModaleMotif demande={motif} enCours={enCours} annuler={() => setMotif(null)} valider={(m) => lancer(() => motif.action(m), () => setMotif(null))} />
        </Portail>
      )}
      {commande && (
        <Portail>
          <div className={u.voile} onClick={() => setCommande(null)}>
            <div className={u.modale} onClick={(e) => e.stopPropagation()}>
              <h2 className={u.modaleTitre}>Commande du {dateCourte(commande.cree_le)}</h2>
              <ul className={s.articles}>
                {commande.articles.map((a, i) => (
                  <li key={i}>
                    {a.quantite} × {a.nom} <span>{fcfa(a.prix_unitaire_fcfa * a.quantite)}</span>
                  </li>
                ))}
                <li className={s.total}>
                  Total <span>{fcfa(commande.montant)}</span>
                </li>
              </ul>
              <p className={u.modaleTexte}>
                Livraison : {commande.livraison.nom}, {commande.livraison.adresse}, {commande.livraison.ville} · {commande.livraison.telephone}
                <br />
                Paiement prévu : {commande.paiement === 'mtn_momo' ? 'MTN Mobile Money' : 'Orange Money'} (non encaissé)
              </p>
              <div className={u.formActions}>
                {commande.statut !== 'annulee' && commande.statut !== 'livree' && (
                  <button
                    type="button"
                    className={u.boutonDanger}
                    onClick={() => {
                      const c = commande;
                      setCommande(null);
                      setMotif({ titre: 'Annuler cette commande ?', texte: 'L’acheteur et l’artisan la verront annulée.', bouton: 'Annuler la commande', action: (m) => A.annulerCommande(c.id, m) });
                    }}
                  >
                    Annuler la commande
                  </button>
                )}
                <button type="button" className={u.boutonSecondaire} onClick={() => setCommande(null)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
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

function ActionsBoutique({
  b,
  enCours,
  lancer,
  demanderMotif,
}: {
  b: Boutique;
  enCours: boolean;
  lancer: (a: () => Promise<A.Resultat>) => void;
  demanderMotif: (d: DemandeMotif) => void;
}) {
  const refuser = () => demanderMotif({ titre: `Refuser « ${b.nom} » ?`, texte: 'La boutique reste invisible du public. Le motif aide à expliquer la décision à l’artisan.', bouton: 'Refuser', action: (m) => A.deciderBoutique(b.id, 'refuser', m) });
  const suspendre = () => demanderMotif({ titre: `Suspendre « ${b.nom} » ?`, texte: 'La boutique et tous ses produits disparaissent du Marché public.', bouton: 'Suspendre', action: (m) => A.deciderBoutique(b.id, 'suspendre', m) });
  return (
    <>
      {(b.statut === 'en_attente' || b.statut === 'refuse') && (
        <button type="button" className={u.boutonPetit} disabled={enCours} onClick={() => lancer(() => A.deciderBoutique(b.id, 'valider'))}>
          Valider
        </button>
      )}
      {b.statut === 'en_attente' && (
        <button type="button" className={u.boutonDangerPetit} disabled={enCours} onClick={refuser}>
          Refuser
        </button>
      )}
      {b.statut === 'valide' && (
        <button type="button" className={u.boutonDangerPetit} disabled={enCours} onClick={suspendre}>
          Suspendre
        </button>
      )}
      {b.statut === 'suspendu' && (
        <button type="button" className={u.boutonPetit} disabled={enCours} onClick={() => lancer(() => A.deciderBoutique(b.id, 'reactiver'))}>
          Réactiver
        </button>
      )}
    </>
  );
}

function Kpi({ label, valeur, detail }: { label: string; valeur: number; detail: string }) {
  return (
    <div className={s.kpi} data-tilt>
      <span className={s.kpiLabel}>{label}</span>
      <span className={s.kpiValeur}>{valeur}</span>
      <span className={s.kpiDetail}>{detail}</span>
    </div>
  );
}

function Vide({ icone, texte }: { icone: string; texte: string }) {
  return (
    <div className={u.vide}>
      <div className={u.videIcone}>{icone}</div>
      {texte}
    </div>
  );
}

function Portail({ children }: { children: ReactNode }) {
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);
  return monte ? createPortal(children, document.body) : null;
}

function ModaleMotif({ demande, enCours, annuler, valider }: { demande: NonNullable<DemandeMotif>; enCours: boolean; annuler: () => void; valider: (m: string) => void }) {
  const [m, setM] = useState('');
  return (
    <div className={u.voile} onClick={() => !enCours && annuler()}>
      <form
        className={`${u.modale} ${u.formulaire}`}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          valider(m);
        }}
      >
        <h2 className={u.modaleTitre}>{demande.titre}</h2>
        <p className={u.modaleTexte}>{demande.texte}</p>
        <label>
          Motif
          <textarea className={u.zoneTexte} rows={3} maxLength={300} value={m} onChange={(e) => setM(e.target.value)} autoFocus />
        </label>
        <div className={u.formActions}>
          <button type="button" className={u.boutonSecondaire} onClick={annuler} disabled={enCours}>
            Retour
          </button>
          <button type="submit" className={u.boutonDanger} disabled={enCours || m.trim().length < 3}>
            {enCours ? 'En cours…' : demande.bouton}
          </button>
        </div>
      </form>
    </div>
  );
}
