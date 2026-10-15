'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Contenu, DonneesCommunaute, Membre, Motif, Signalement, StatutContenu } from '@/lib/communaute';
import { dateHeure, relatif } from '@/lib/utilisateursFormat';
import { Icone } from '@/components/Icone';
import * as A from './actions';
import u from '../utilisateurs/utilisateurs.module.css';
import s from './communaute.module.css';

/**
 * Module Communauté (cdc-module-communaute.md) : file de modération,
 * publications, membres, mots interdits, réglages. Toutes les actions
 * passent par actions.ts (serveur) et sont journalisées.
 */

type Onglet = 'moderer' | 'publications' | 'membres' | 'mots' | 'reglages';

const MOTIFS: Record<Motif, string> = {
  contenu_inapproprie: 'Contenu inapproprié',
  harcelement: 'Harcèlement',
  desinformation: 'Désinformation',
  spam: 'Spam',
  autre: 'Autre',
};

const STATUTS: Record<StatutContenu, { label: string; ton: string }> = {
  publie: { label: 'Publié', ton: 's_vert' },
  masque_filtre_auto: { label: 'Masqué (mot interdit)', ton: 's_orange' },
  masque_signalement: { label: 'Masqué (signalements)', ton: 's_orange' },
  supprime: { label: 'Supprimé', ton: 's_rouge' },
};

type Bannissement = { profil: Membre; contenu?: { type: 'post' | 'commentaire'; id: string } } | null;

export function CommunauteModule({ donnees, ongletInitial }: { donnees: DonneesCommunaute; ongletInitial?: string }) {
  const router = useRouter();
  const membres = useMemo(() => new Map(donnees.membres.map((m) => [m.id, m])), [donnees.membres]);
  const contenus = useMemo(() => new Map(donnees.contenus.map((c) => [c.id, c])), [donnees.contenus]);
  const enAttente = donnees.signalements.filter((r) => r.statut === 'en_attente');
  const nbCibles = new Set(enAttente.map((r) => `${r.cible_type}:${r.cible_id}`)).size;

  const [onglet, setOnglet] = useState<Onglet>(
    ['moderer', 'publications', 'membres', 'mots', 'reglages'].includes(ongletInitial ?? '') ? (ongletInitial as Onglet) : 'moderer'
  );
  const [toast, setToast] = useState<A.Resultat | null>(null);
  const [ban, setBan] = useState<Bannissement>(null);
  const [enCours, demarrer] = useTransition();

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

  function changerOnglet(o: Onglet) {
    setOnglet(o);
    router.replace(`/communaute?onglet=${o}`, { scroll: false });
  }

  const ctx: Ctx = { membres, contenus, enCours, lancer, bannir: (profil, contenu) => setBan({ profil, contenu }) };

  return (
    <div className={u.module}>
      <header className={u.entete}>
        <div>
          <h1 className={u.titre}>Communauté</h1>
          <p className={u.sousTitre}>Modération des publications, commentaires et membres. Rien n’est effacé : chaque décision change un statut et reste tracée.</p>
        </div>
      </header>

      {!donnees.moderationInstallee && (
        <div className={s.bandeau}>
          <Icone nom="shield" taille={18} />
          <span>
            Exécutez <code>schema-communaute-moderation.sql</code> dans Supabase pour activer le masquage automatique après signalements et le filtre de mots interdits au mot entier.
          </span>
        </div>
      )}

      <nav className={u.onglets}>
        {(
          [
            ['moderer', 'À modérer', 'shield', nbCibles],
            ['publications', 'Publications', 'comments', 0],
            ['membres', 'Membres', 'community', 0],
            ['mots', 'Mots interdits', 'lock', 0],
            ['reglages', 'Réglages', 'settings', 0],
          ] as [Onglet, string, string, number][]
        ).map(([id, titre, icone, nb]) => (
          <button key={id} type="button" className={`${u.onglet} ${onglet === id ? u.ongletOn : ''}`} onClick={() => changerOnglet(id)}>
            <Icone nom={icone} taille={15} /> {titre}
            {nb > 0 && <span className={s.badgeRouge}>{nb}</span>}
          </button>
        ))}
      </nav>

      {onglet === 'moderer' && <AModerer enAttente={enAttente} ctx={ctx} />}
      {onglet === 'publications' && <Publications donnees={donnees} ctx={ctx} />}
      {onglet === 'membres' && <Membres donnees={donnees} ctx={ctx} />}
      {onglet === 'mots' && <Mots termes={donnees.termes} contenus={donnees.contenus} ctx={ctx} />}
      {onglet === 'reglages' && <Reglages donnees={donnees} ctx={ctx} />}

      {ban && (
        <Portail>
          <ModaleBan
            ban={ban}
            enCours={enCours}
            annuler={() => setBan(null)}
            valider={(motif) => lancer(() => A.bannirMembre(ban.profil.id, motif, ban.contenu), () => setBan(null))}
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

interface Ctx {
  membres: Map<string, Membre>;
  contenus: Map<string, Contenu>;
  enCours: boolean;
  lancer: (action: () => Promise<A.Resultat>, apres?: () => void) => void;
  bannir: (profil: Membre, contenu?: { type: 'post' | 'commentaire'; id: string }) => void;
}

function Portail({ children }: { children: ReactNode }) {
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);
  return monte ? createPortal(children, document.body) : null;
}

function Auteur({ m }: { m: Membre | undefined }) {
  if (!m) return <span className={u.discret}>Auteur inconnu</span>;
  return (
    <span className={s.auteur}>
      <span className={s.avatar}>{m.pseudo.charAt(0).toUpperCase()}</span>
      <span>
        <strong>@{m.pseudo}</strong>
        {m.banni && <span className={`${u.etiquette} ${u.etiquetteRouge}`}>Banni</span>}
        <span className={u.discret}>
          {' '}
          · <Link href={`/utilisateurs/${m.user_id}`}>{m.email ?? 'voir le compte'}</Link>
        </span>
      </span>
    </span>
  );
}

function BoutonsContenu({ c, ctx, avecBan = true }: { c: Contenu; ctx: Ctx; avecBan?: boolean }) {
  const auteur = ctx.membres.get(c.auteur_id);
  const visible = c.statut === 'publie';
  return (
    <div className={s.actions}>
      {visible ? (
        <button type="button" className={u.boutonPetit} disabled={ctx.enCours} onClick={() => ctx.lancer(() => A.moderer(c.type, c.id, 'masquer'))}>
          Masquer
        </button>
      ) : (
        <button type="button" className={u.boutonPetit} disabled={ctx.enCours} onClick={() => ctx.lancer(() => A.moderer(c.type, c.id, 'republier'))}>
          Republier
        </button>
      )}
      {c.statut !== 'supprime' && (
        <button
          type="button"
          className={u.boutonDangerPetit}
          disabled={ctx.enCours}
          onClick={() => window.confirm('Supprimer ce contenu ? Il disparaît définitivement pour le public (gardé pour l’historique).') && ctx.lancer(() => A.moderer(c.type, c.id, 'supprimer'))}
        >
          Supprimer
        </button>
      )}
      {avecBan && auteur && !auteur.banni && (
        <button type="button" className={u.boutonDangerPetit} disabled={ctx.enCours} onClick={() => ctx.bannir(auteur, { type: c.type, id: c.id })}>
          Bannir l’auteur
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// À modérer
// ---------------------------------------------------------------------

function AModerer({ enAttente, ctx }: { enAttente: Signalement[]; ctx: Ctx }) {
  const groupes = useMemo(() => {
    const m = new Map<string, Signalement[]>();
    for (const r of enAttente) m.set(`${r.cible_type}:${r.cible_id}`, [...(m.get(`${r.cible_type}:${r.cible_id}`) ?? []), r]);
    return [...m.values()].sort((a, b) => new Set(b.map((r) => r.signaleur_id)).size - new Set(a.map((r) => r.signaleur_id)).size);
  }, [enAttente]);

  if (groupes.length === 0) {
    return (
      <section className={u.carte}>
        <div className={u.vide}>
          <div className={u.videIcone}>🕊</div>
          Aucun signalement en attente. La communauté est calme.
        </div>
      </section>
    );
  }

  return (
    <div className={s.file}>
      {groupes.map((rs) => {
        const r0 = rs[0];
        const signaleurs = new Set(rs.map((r) => r.signaleur_id)).size;
        const motifs = new Map<Motif, number>();
        for (const r of rs) motifs.set(r.motif, (motifs.get(r.motif) ?? 0) + 1);
        const contenu = r0.cible_type !== 'profil' ? ctx.contenus.get(r0.cible_id) : undefined;
        const profil = r0.cible_type === 'profil' ? ctx.membres.get(r0.cible_id) : contenu ? ctx.membres.get(contenu.auteur_id) : undefined;
        return (
          <article key={`${r0.cible_type}:${r0.cible_id}`} className={`${u.carte} ${s.signalement}`}>
            <div className={s.signalementTete}>
              <span className={s.typeCible}>{r0.cible_type === 'post' ? 'Publication' : r0.cible_type === 'commentaire' ? 'Commentaire' : 'Profil'}</span>
              <span className={s.signaleurs}>
                {signaleurs} signaleur{signaleurs > 1 ? 's' : ''}
              </span>
              {[...motifs.entries()].map(([m, n]) => (
                <span key={m} className={s.motif}>
                  {MOTIFS[m]}
                  {n > 1 ? ` ×${n}` : ''}
                </span>
              ))}
              {contenu && <span className={`${u.statut} ${u[STATUTS[contenu.statut].ton]}`}>{STATUTS[contenu.statut].label}</span>}
              <span className={s.date}>{relatif(rs[rs.length - 1].cree_le)}</span>
            </div>

            {contenu ? (
              <div className={s.citation}>
                <p>{contenu.texte}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {contenu.image_url && <img src={contenu.image_url} alt="" className={s.image} />}
              </div>
            ) : r0.cible_type === 'profil' && profil ? (
              <div className={s.citation}>
                <p>
                  <strong>@{profil.pseudo}</strong> {profil.bio ? `· ${profil.bio}` : ''}
                </p>
              </div>
            ) : (
              <p className={u.discret}>Contenu introuvable (supprimé avec le compte de son auteur).</p>
            )}

            <Auteur m={profil} />

            {rs.some((r) => r.description) && (
              <ul className={s.descriptions}>
                {rs
                  .filter((r) => r.description)
                  .map((r) => (
                    <li key={r.id}>
                      « {r.description} » <span className={u.discret}>· {MOTIFS[r.motif]}, {dateHeure(r.cree_le)}</span>
                    </li>
                  ))}
              </ul>
            )}

            {contenu ? (
              <div className={s.actions}>
                <button type="button" className={u.boutonPetit} disabled={ctx.enCours} onClick={() => ctx.lancer(() => A.moderer(contenu.type, contenu.id, 'masquer'))}>
                  Masquer
                </button>
                <button
                  type="button"
                  className={u.boutonDangerPetit}
                  disabled={ctx.enCours}
                  onClick={() => window.confirm('Supprimer ce contenu pour le public ?') && ctx.lancer(() => A.moderer(contenu.type, contenu.id, 'supprimer'))}
                >
                  Supprimer
                </button>
                <button type="button" className={u.boutonPetit} disabled={ctx.enCours} onClick={() => ctx.lancer(() => A.moderer(contenu.type, contenu.id, 'rejeter'))}>
                  Rejeter (laisser en ligne)
                </button>
                {profil && !profil.banni && (
                  <button type="button" className={u.boutonDangerPetit} disabled={ctx.enCours} onClick={() => ctx.bannir(profil, { type: contenu.type, id: contenu.id })}>
                    Bannir l’auteur
                  </button>
                )}
              </div>
            ) : (
              profil && (
                <div className={s.actions}>
                  <button type="button" className={u.boutonPetit} disabled={ctx.enCours} onClick={() => ctx.lancer(() => A.rejeterSignalementsProfil(profil.id))}>
                    Rejeter
                  </button>
                  {!profil.banni && (
                    <button type="button" className={u.boutonDangerPetit} disabled={ctx.enCours} onClick={() => ctx.bannir(profil)}>
                      Bannir
                    </button>
                  )}
                </div>
              )
            )}
          </article>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// Publications
// ---------------------------------------------------------------------

function Publications({ donnees, ctx }: { donnees: DonneesCommunaute; ctx: Ctx }) {
  const [statut, setStatut] = useState<StatutContenu | ''>('');
  const [q, setQ] = useState('');
  const [tri, setTri] = useState<'recent' | 'signale'>('recent');
  const [ouvert, setOuvert] = useState<string | null>(null);

  const posts = useMemo(() => {
    const n = q.trim().toLowerCase();
    return donnees.contenus
      .filter((c) => c.type === 'post')
      .filter((c) => !statut || c.statut === statut)
      .filter((c) => !n || c.texte.toLowerCase().includes(n) || (ctx.membres.get(c.auteur_id)?.pseudo ?? '').toLowerCase().includes(n))
      .sort((a, b) => (tri === 'signale' ? b.nb_signalements - a.nb_signalements : b.cree_le.localeCompare(a.cree_le)));
  }, [donnees.contenus, statut, q, tri, ctx.membres]);

  return (
    <section className={u.carte}>
      <div className={u.barreOutils}>
        <div className={u.recherche}>
          <span className={u.rechercheIcone}>⌕</span>
          <input className={u.rechercheChamp} placeholder="Rechercher dans les publications ou par pseudo…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label className={u.tri}>
          Trier
          <select value={tri} onChange={(e) => setTri(e.target.value as 'recent' | 'signale')}>
            <option value="recent">Plus récentes</option>
            <option value="signale">Plus signalées</option>
          </select>
        </label>
      </div>
      <div className={u.filtres}>
        {(['publie', 'masque_filtre_auto', 'masque_signalement', 'supprime'] as StatutContenu[]).map((v) => (
          <button key={v} type="button" className={`${u.puce} ${statut === v ? u.puceOn : ''}`} onClick={() => setStatut(statut === v ? '' : v)}>
            {STATUTS[v].label}
          </button>
        ))}
      </div>
      <div className={u.compteur}>
        {posts.length} publication{posts.length > 1 ? 's' : ''}
      </div>
      {posts.length === 0 ? (
        <div className={u.vide}>
          <div className={u.videIcone}>💬</div>
          Aucune publication{statut ? ' dans cette catégorie' : ' pour l’instant'}.
        </div>
      ) : (
        <div className={s.posts}>
          {posts.map((p) => {
            const comms = donnees.contenus.filter((c) => c.type === 'commentaire' && c.post_id === p.id);
            return (
              <article key={p.id} className={s.post}>
                <div className={s.postTete}>
                  <Auteur m={ctx.membres.get(p.auteur_id)} />
                  <span className={`${u.statut} ${u[STATUTS[p.statut].ton]}`}>{STATUTS[p.statut].label}</span>
                </div>
                <p className={s.postTexte}>{p.texte}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image_url && <img src={p.image_url} alt="" className={s.image} />}
                <div className={s.postPied}>
                  <span className={u.discret}>
                    {dateHeure(p.cree_le)} · {p.nb_signalements} signalement{p.nb_signalements > 1 ? 's' : ''}
                  </span>
                  {comms.length > 0 && (
                    <button type="button" className={u.lien} onClick={() => setOuvert(ouvert === p.id ? null : p.id)}>
                      {ouvert === p.id ? 'Masquer' : 'Voir'} les {comms.length} commentaire{comms.length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
                <BoutonsContenu c={p} ctx={ctx} />
                {ouvert === p.id && (
                  <ul className={s.commentaires}>
                    {comms.map((c) => (
                      <li key={c.id}>
                        <div className={s.postTete}>
                          <Auteur m={ctx.membres.get(c.auteur_id)} />
                          <span className={`${u.statut} ${u[STATUTS[c.statut].ton]}`}>{STATUTS[c.statut].label}</span>
                        </div>
                        <p className={s.postTexte}>{c.texte}</p>
                        <BoutonsContenu c={c} ctx={ctx} />
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------
// Membres
// ---------------------------------------------------------------------

function Membres({ donnees, ctx }: { donnees: DonneesCommunaute; ctx: Ctx }) {
  const [q, setQ] = useState('');
  const [bannis, setBannis] = useState(false);
  const liste = donnees.membres
    .filter((m) => !bannis || m.banni)
    .filter((m) => !q.trim() || `${m.pseudo} ${m.email ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.signalements_recus - a.signalements_recus || b.publications - a.publications || a.pseudo.localeCompare(b.pseudo));
  return (
    <section className={u.carte}>
      <div className={u.barreOutils}>
        <div className={u.recherche}>
          <span className={u.rechercheIcone}>⌕</span>
          <input className={u.rechercheChamp} placeholder="Rechercher un pseudo ou un e-mail…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="button" className={`${u.puce} ${bannis ? u.puceOn : ''}`} onClick={() => setBannis(!bannis)}>
          Bannis seulement
        </button>
      </div>
      <div className={u.compteur}>
        {liste.length} membre{liste.length > 1 ? 's' : ''}
      </div>
      <table className={u.table}>
        <thead>
          <tr>
            <th>Membre</th>
            <th>Publications</th>
            <th>Commentaires</th>
            <th>Signalements reçus</th>
            <th>Statut</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {liste.map((m) => (
            <tr key={m.id}>
              <td>
                <strong>@{m.pseudo}</strong>
                <div className={u.discret}>
                  <Link href={`/utilisateurs/${m.user_id}`}>{m.email ?? 'voir le compte'}</Link> · membre depuis {relatif(m.cree_le).replace('il y a ', '')}
                </div>
              </td>
              <td>{m.publications}</td>
              <td>{m.commentaires}</td>
              <td className={m.signalements_recus ? s.alerte : ''}>{m.signalements_recus}</td>
              <td>
                {m.banni ? (
                  <span className={`${u.statut} ${u.s_rouge}`} title={m.motif_ban ?? ''}>
                    Banni
                  </span>
                ) : (
                  <span className={`${u.statut} ${u.s_vert}`}>Actif</span>
                )}
                {m.banni && m.motif_ban && <div className={u.discret}>{m.motif_ban}</div>}
              </td>
              <td className={u.droite}>
                {m.banni ? (
                  <button type="button" className={u.lien} disabled={ctx.enCours} onClick={() => ctx.lancer(() => A.leverBannissement(m.id))}>
                    Lever le bannissement
                  </button>
                ) : (
                  <button type="button" className={u.lienDanger} disabled={ctx.enCours} onClick={() => ctx.bannir(m)}>
                    Bannir
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// ---------------------------------------------------------------------
// Mots interdits
// ---------------------------------------------------------------------

function Mots({ termes, contenus, ctx }: { termes: string[]; contenus: Contenu[]; ctx: Ctx }) {
  const [nouveau, setNouveau] = useState('');
  const [phrase, setPhrase] = useState('');
  const [test, setTest] = useState<{ ok: boolean; terme: string | null; message: string } | null>(null);
  const [voir, setVoir] = useState(false);
  const [testEnCours, demarrerTest] = useTransition();
  const filtres = contenus.filter((c) => c.statut === 'masque_filtre_auto');

  return (
    <div className={s.grille2}>
      <section className={u.carte}>
        <div className={u.carteTete}>
          <h2 className={u.carteTitre}>Mots interdits ({termes.length})</h2>
          <button type="button" className={u.lien} onClick={() => setVoir(!voir)}>
            {voir ? 'Cacher la liste' : 'Afficher la liste'}
          </button>
        </div>
        <p className={u.aide}>Une publication ou un commentaire contenant l’un de ces mots (mot entier, majuscules ignorées) est masqué automatiquement, puis visible ci-contre pour vérification.</p>
        <form
          className={s.ajout}
          onSubmit={(e) => {
            e.preventDefault();
            ctx.lancer(() => A.ajouterTerme(nouveau), () => setNouveau(''));
          }}
        >
          <input value={nouveau} onChange={(e) => setNouveau(e.target.value)} placeholder="Ajouter un mot ou une expression" maxLength={60} />
          <button type="submit" className={u.boutonPrincipal} disabled={ctx.enCours || nouveau.trim().length < 2}>
            Ajouter
          </button>
        </form>
        {voir &&
          (termes.length === 0 ? (
            <p className={u.discret}>La liste est vide : le filtre ne bloque rien pour l’instant.</p>
          ) : (
            <div className={s.termes}>
              {termes.map((t) => (
                <span key={t} className={s.terme}>
                  {t}
                  <button type="button" disabled={ctx.enCours} onClick={() => ctx.lancer(() => A.retirerTerme(t))} aria-label={`Retirer ${t}`}>
                    ✕
                  </button>
                </span>
              ))}
            </div>
          ))}

        <h3 className={u.sousTitreCarte}>Tester une phrase</h3>
        <form
          className={s.ajout}
          onSubmit={(e) => {
            e.preventDefault();
            demarrerTest(async () => setTest(await A.testerPhrase(phrase)));
          }}
        >
          <input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="Ex. : un conte bamoun" maxLength={500} />
          <button type="submit" className={u.boutonSecondaire} disabled={testEnCours || !phrase.trim()}>
            {testEnCours ? '…' : 'Tester'}
          </button>
        </form>
        {test && <p className={test.terme ? u.attention : test.ok ? u.ok : u.attention}>{test.message}</p>}
      </section>

      <section className={u.carte}>
        <h2 className={u.carteTitre}>Masqués par le filtre ({filtres.length})</h2>
        <p className={u.aide}>Vérifiez les faux positifs : « Republier » remet le contenu en ligne.</p>
        {filtres.length === 0 ? (
          <p className={u.discret}>Aucun contenu masqué par le filtre.</p>
        ) : (
          <ul className={s.commentaires}>
            {filtres.map((c) => (
              <li key={c.id}>
                <Auteur m={ctx.membres.get(c.auteur_id)} />
                <p className={s.postTexte}>{c.texte}</p>
                <BoutonsContenu c={c} ctx={ctx} avecBan={false} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------
// Réglages et statistiques
// ---------------------------------------------------------------------

function Reglages({ donnees, ctx }: { donnees: DonneesCommunaute; ctx: Ctx }) {
  const [seuil, setSeuil] = useState(String(donnees.seuil));
  const now = Date.now();
  const depuis = (j: number, type: 'post' | 'commentaire') => donnees.contenus.filter((c) => c.type === type && now - new Date(c.cree_le).getTime() < j * 86400000).length;
  const traites = donnees.signalements.filter((r) => r.resolu_le);
  const delai = traites.length ? traites.reduce((n, r) => n + (new Date(r.resolu_le!).getTime() - new Date(r.cree_le).getTime()), 0) / traites.length / 3600000 : null;
  const actifs = new Set(donnees.contenus.filter((c) => now - new Date(c.cree_le).getTime() < 30 * 86400000).map((c) => c.auteur_id)).size;

  return (
    <div className={s.grille2}>
      <section className={u.carte}>
        <h2 className={u.carteTitre}>Masquage automatique</h2>
        <p className={u.aide}>
          Quand ce nombre de membres <strong>différents</strong> signale le même contenu, il est retiré du fil public en attendant votre décision. 0 = jamais de masquage automatique.
        </p>
        <form
          className={s.ajout}
          onSubmit={(e) => {
            e.preventDefault();
            ctx.lancer(() => A.enregistrerSeuil(Number(seuil)));
          }}
        >
          <input type="number" min={0} max={50} value={seuil} onChange={(e) => setSeuil(e.target.value)} style={{ maxWidth: 110 }} />
          <span className={u.discret}>signaleurs différents</span>
          <button type="submit" className={u.boutonPrincipal} disabled={ctx.enCours || String(donnees.seuil) === seuil}>
            Enregistrer
          </button>
        </form>
        {!donnees.moderationInstallee && <p className={u.attention}>Le réglage ne s’appliquera qu’après l’exécution de schema-communaute-moderation.sql.</p>}
      </section>
      <section className={u.carte}>
        <h2 className={u.carteTitre}>Activité</h2>
        <div className={u.infos}>
          <div className={u.info}>
            <span className={u.infoLabel}>Publications</span>
            <span className={u.infoValeur}>
              {depuis(7, 'post')} sur 7 j · {depuis(30, 'post')} sur 30 j
            </span>
          </div>
          <div className={u.info}>
            <span className={u.infoLabel}>Commentaires</span>
            <span className={u.infoValeur}>
              {depuis(7, 'commentaire')} sur 7 j · {depuis(30, 'commentaire')} sur 30 j
            </span>
          </div>
          <div className={u.info}>
            <span className={u.infoLabel}>Membres</span>
            <span className={u.infoValeur}>
              {donnees.membres.length} profils · {actifs} actifs sur 30 j · {donnees.membres.filter((m) => m.banni).length} bannis
            </span>
          </div>
          <div className={u.info}>
            <span className={u.infoLabel}>Signalements</span>
            <span className={u.infoValeur}>
              {donnees.signalements.filter((r) => r.statut === 'en_attente').length} en attente · {traites.length} traités
            </span>
          </div>
          <div className={u.info}>
            <span className={u.infoLabel}>Délai moyen de traitement</span>
            <span className={u.infoValeur}>{delai === null ? '—' : delai < 1 ? `${Math.round(delai * 60)} min` : `${Math.round(delai)} h`}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ModaleBan({ ban, enCours, annuler, valider }: { ban: NonNullable<Bannissement>; enCours: boolean; annuler: () => void; valider: (motif: string) => void }) {
  const [motif, setMotif] = useState('');
  return (
    <div className={u.voile} onClick={() => !enCours && annuler()}>
      <form
        className={`${u.modale} ${u.formulaire}`}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          valider(motif);
        }}
      >
        <h2 className={u.modaleTitre}>Bannir @{ban.profil.pseudo} ?</h2>
        <p className={u.modaleTexte}>
          Son profil et toutes ses publications disparaissent du fil public. Son compte AFROBACK (lecture, abonnement) n’est pas touché.
          {ban.contenu ? ' Le contenu signalé est aussi masqué.' : ''}
        </p>
        <label>
          Motif (visible des seuls admins)
          <textarea className={u.zoneTexte} rows={3} maxLength={300} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex. : propos haineux répétés" autoFocus />
        </label>
        <div className={u.formActions}>
          <button type="button" className={u.boutonSecondaire} onClick={annuler} disabled={enCours}>
            Annuler
          </button>
          <button type="submit" className={u.boutonDanger} disabled={enCours || motif.trim().length < 3}>
            {enCours ? 'En cours…' : 'Bannir'}
          </button>
        </div>
      </form>
    </div>
  );
}
