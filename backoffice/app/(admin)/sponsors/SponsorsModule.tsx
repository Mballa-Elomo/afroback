'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FORMATS, FORMATS_CIBLES, statutSponsor, type CibleContenu, type CibleFormat, type Emplacement, type Format, type Sponsor, type Stat, type StatutSponsor } from '@/lib/sponsorsCommun';
import { dateCourte, fcfa } from '@/lib/utilisateursFormat';
import { Icone } from '@/components/Icone';
import * as A from './actions';
import u from '../utilisateurs/utilisateurs.module.css';
import s from './sponsors.module.css';

/** Module Sponsors (cdc-module-sponsors.md, § 3) : liste et fiche d'un sponsor. */

const STATUTS: Record<StatutSponsor, { label: string; ton: string }> = {
  brouillon: { label: 'Brouillon', ton: 's_gris' },
  programme: { label: 'Programmé', ton: 's_orange' },
  en_cours: { label: 'En cours', ton: 's_vert' },
  termine: { label: 'Terminé', ton: 's_gris' },
  suspendu: { label: 'Suspendu', ton: 's_rouge' },
};

const total = (l: Stat[]) => l.reduce((n, x) => ({ affichages: n.affichages + x.affichages, clics: n.clics + x.clics }), { affichages: 0, clics: 0 });
const taux = (a: number, c: number) => (a ? `${((c / a) * 100).toFixed(1)} %` : '—');

function Portail({ children }: { children: ReactNode }) {
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);
  return monte ? createPortal(children, document.body) : null;
}

function useToast() {
  const [toast, setToast] = useState<A.Resultat | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  const rendu = toast && (
    <Portail>
      <div className={`${u.toast} ${toast.ok ? u.toastOk : u.toastErreur}`} role="status">
        {toast.ok ? '✓' : '⚠'} {toast.message}
      </div>
    </Portail>
  );
  return { setToast, rendu };
}

// ---------------------------------------------------------------------
// Liste
// ---------------------------------------------------------------------

export function ListeSponsors({ sponsors, emplacements, stats, installe }: { sponsors: Sponsor[]; emplacements: Emplacement[]; stats: Stat[]; installe: boolean }) {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const dans15 = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  const enCours = sponsors.filter((x) => statutSponsor(x) === 'en_cours');
  const finProche = enCours.filter((x) => x.date_fin && x.date_fin <= dans15);
  const statsDe = (id: string) => {
    const ids = new Set(emplacements.filter((e) => e.sponsor_id === id).map((e) => e.id));
    return total(stats.filter((x) => ids.has(x.emplacement_id)));
  };

  return (
    <div className={u.module}>
      <header className={u.entete}>
        <div>
          <h1 className={u.titre}>Sponsors</h1>
          <p className={u.sousTitre}>Contrats, emplacements et bilans des sponsors. Jamais d’affichage dans l’espace enfant.</p>
        </div>
        {installe && (
          <Link href="/sponsors/nouveau" className={u.boutonPrincipal}>
            + Nouveau sponsor
          </Link>
        )}
      </header>

      {!installe ? (
        <div className={s.bandeau}>
          <Icone nom="bolt" taille={17} /> Exécutez <code>schema-sponsors.sql</code> dans Supabase pour activer ce module.
        </div>
      ) : (
        <>
          <section className={s.kpis}>
            <Kpi label="Sponsors en cours" valeur={String(enCours.length)} detail={`${sponsors.length} au total`} />
            <Kpi label="Contrats en cours" valeur={fcfa(enCours.reduce((n, x) => n + (x.montant_fcfa ?? 0), 0))} detail="montant convenu" />
            <Kpi label="Fin sous 15 jours" valeur={String(finProche.length)} detail={finProche.map((x) => x.nom).join(', ') || 'aucun renouvellement à préparer'} />
          </section>

          <section className={u.carte}>
            {sponsors.length === 0 ? (
              <div className={u.vide}>
                <div className={u.videIcone}>🤝</div>
                Aucun sponsor pour l’instant. Créez le premier avec « Nouveau sponsor ».
              </div>
            ) : (
              <div className={s.liste}>
                {sponsors.map((x) => {
                  const st = statutSponsor(x, aujourdhui);
                  const t = statsDe(x.id);
                  return (
                    <Link key={x.id} href={`/sponsors/${x.id}`} className={s.ligne}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {x.logo_url ? <img src={x.logo_url} alt="" className={s.logo} /> : <span className={s.logoVide}>{x.nom.charAt(0)}</span>}
                      <span className={s.ligneTexte}>
                        <strong>{x.nom}</strong>
                        <span className={u.discret}>
                          {x.date_debut ? `${dateCourte(x.date_debut)} → ${dateCourte(x.date_fin)}` : 'Dates à définir'} · {x.montant_fcfa !== null ? fcfa(x.montant_fcfa) : 'montant à définir'}
                        </span>
                      </span>
                      <span className={s.ligneStats}>
                        {t.affichages.toLocaleString('fr-FR')} affichages · {t.clics.toLocaleString('fr-FR')} clics
                      </span>
                      <span className={`${u.statut} ${u[STATUTS[st].ton]}`}>{STATUTS[st].label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({ label, valeur, detail }: { label: string; valeur: string; detail: string }) {
  return (
    <div className={s.kpi} data-tilt>
      <span className={s.kpiLabel}>{label}</span>
      <span className={s.kpiValeur}>{valeur}</span>
      <span className={s.kpiDetail}>{detail}</span>
    </div>
  );
}

// ---------------------------------------------------------------------
// Fiche
// ---------------------------------------------------------------------

export function FicheSponsor({ sponsor, emplacements, stats, cibles }: { sponsor: Sponsor | null; emplacements: Emplacement[]; stats: Stat[]; cibles: CibleContenu[] }) {
  const router = useRouter();
  const { setToast, rendu } = useToast();
  const [enCours, demarrer] = useTransition();
  const [f, setF] = useState<A.SaisieSponsor>({
    nom: sponsor?.nom ?? '',
    site_url: sponsor?.site_url ?? '',
    description_fr: sponsor?.description_fr ?? '',
    description_en: sponsor?.description_en ?? '',
    contact_nom: sponsor?.contact_nom ?? '',
    contact_email: sponsor?.contact_email ?? '',
    contact_telephone: sponsor?.contact_telephone ?? '',
    montant_fcfa: sponsor?.montant_fcfa !== null && sponsor?.montant_fcfa !== undefined ? String(sponsor.montant_fcfa) : '',
    date_debut: sponsor?.date_debut ?? '',
    date_fin: sponsor?.date_fin ?? '',
    notes: sponsor?.notes ?? '',
  });
  const maj = (p: Partial<A.SaisieSponsor>) => setF((x) => ({ ...x, ...p }));
  const [logoEnAttente, setLogoEnAttente] = useState<File | null>(null);
  const statut = sponsor ? statutSponsor(sponsor) : 'brouillon';

  function lancer(a: () => Promise<A.Resultat>, apres?: (r: A.Resultat) => void) {
    demarrer(async () => {
      const r = await a();
      setToast(r);
      if (r.ok) {
        apres?.(r);
        router.refresh();
      }
    });
  }

  return (
    <div className={u.module}>
      <Link href="/sponsors" className={u.retour}>
        ← Tous les sponsors
      </Link>

      <section className={`${u.carte} ${s.entete}`}>
        <Logo sponsor={sponsor} enAttente={logoEnAttente} choisirEnAttente={setLogoEnAttente} />
        <div className={s.enteteTexte}>
          <h1 className={u.ficheNom}>{sponsor?.nom ?? 'Nouveau sponsor'}</h1>
          {sponsor && <span className={`${u.statut} ${u[STATUTS[statut].ton]}`}>{STATUTS[statut].label}</span>}
        </div>
        {sponsor && (
          <div className={s.enteteActions}>
            {sponsor.actif ? (
              <button type="button" className={u.boutonDanger} disabled={enCours} onClick={() => lancer(() => A.basculerSponsor(sponsor.id, false))}>
                Suspendre
              </button>
            ) : (
              <>
                <button type="button" className={u.boutonPrincipal} disabled={enCours} onClick={() => lancer(() => A.basculerSponsor(sponsor.id, true))}>
                  Activer
                </button>
                <button
                  type="button"
                  className={u.boutonSecondaire}
                  disabled={enCours}
                  onClick={() => window.confirm('Supprimer ce sponsor ?') && lancer(() => A.supprimerSponsor(sponsor.id), () => router.push('/sponsors'))}
                >
                  Supprimer
                </button>
              </>
            )}
          </div>
        )}
      </section>

      <form
        className={s.grille}
        onSubmit={(e) => {
          e.preventDefault();
          lancer(
            async () => {
              const r = await A.enregistrerSponsor(sponsor?.id ?? null, f);
              // Création : le logo choisi d'avance est envoyé dès que le sponsor existe.
              if (r.ok && !sponsor && r.id && logoEnAttente) {
                const envoi = await envoyerLogo(r.id, logoEnAttente);
                if (envoi) return { ok: true, message: `Sponsor créé, mais le logo n’a pas pu être envoyé : ${envoi}`, id: r.id };
              }
              return r;
            },
            (r) => {
              if (!sponsor && r.id) router.push(`/sponsors/${r.id}`);
            }
          );
        }}
      >
        <section className={`${u.carte} ${u.formulaire}`}>
          <h2 className={u.carteTitre}>Présentation publique</h2>
          <label>
            Nom
            <input value={f.nom} onChange={(e) => maj({ nom: e.target.value })} maxLength={80} required />
          </label>
          <label>
            Site web
            <input value={f.site_url} onChange={(e) => maj({ site_url: e.target.value })} placeholder="https://…" />
          </label>
          <label>
            Présentation (FR) · page Partenaires
            <textarea className={u.zoneTexte} rows={3} maxLength={600} value={f.description_fr} onChange={(e) => maj({ description_fr: e.target.value })} />
          </label>
          <label>
            Présentation (EN)
            <textarea className={u.zoneTexte} rows={3} maxLength={600} value={f.description_en} onChange={(e) => maj({ description_en: e.target.value })} />
          </label>
        </section>

        <section className={`${u.carte} ${u.formulaire}`}>
          <h2 className={u.carteTitre}>Contrat (privé)</h2>
          <p className={u.aide}>Jamais affiché dans l’app ni sur le site.</p>
          <div className={u.formLigne}>
            <label>
              Début
              <input type="date" value={f.date_debut} onChange={(e) => maj({ date_debut: e.target.value })} />
            </label>
            <label>
              Fin
              <input type="date" value={f.date_fin} onChange={(e) => maj({ date_fin: e.target.value })} />
            </label>
          </div>
          <label>
            Montant convenu (FCFA)
            <input inputMode="numeric" value={f.montant_fcfa} onChange={(e) => maj({ montant_fcfa: e.target.value })} placeholder="Ex. 150000" />
          </label>
          <div className={u.formLigne}>
            <label>
              Contact
              <input value={f.contact_nom} onChange={(e) => maj({ contact_nom: e.target.value })} />
            </label>
            <label>
              Téléphone
              <input value={f.contact_telephone} onChange={(e) => maj({ contact_telephone: e.target.value })} />
            </label>
          </div>
          <label>
            E-mail
            <input value={f.contact_email} onChange={(e) => maj({ contact_email: e.target.value })} />
          </label>
          <label>
            Notes
            <textarea className={u.zoneTexte} rows={2} maxLength={2000} value={f.notes} onChange={(e) => maj({ notes: e.target.value })} />
          </label>
        </section>

        <div className={s.enregistrer}>
          <button type="submit" className={u.boutonPrincipal} disabled={enCours}>
            {enCours ? 'Enregistrement…' : sponsor ? 'Enregistrer' : 'Créer le sponsor'}
          </button>
        </div>
      </form>

      {sponsor && (
        <>
          <Emplacements sponsorId={sponsor.id} emplacements={emplacements} stats={stats} cibles={cibles} enCours={enCours} lancer={lancer} />
          <Bilan sponsor={sponsor} emplacements={emplacements} stats={stats} cibles={cibles} />
        </>
      )}
      {!sponsor && <p className={u.aide}>Après la création : logo, emplacements et statistiques.</p>}
      {rendu}
    </div>
  );
}

const TYPES_LOGO = ['image/png', 'image/jpeg', 'image/webp'];

/** Envoie le logo ; renvoie un message d'erreur, ou null si tout s'est bien passé. */
async function envoyerLogo(id: string, file: File): Promise<string | null> {
  const fd = new FormData();
  fd.set('file', file);
  const r = await fetch(`/api/sponsors/${id}/logo`, { method: 'POST', body: fd })
    .then((x) => x.json())
    .catch(() => ({ error: 'envoi interrompu (connexion).' }));
  return r?.error ?? null;
}

function Logo({ sponsor, enAttente, choisirEnAttente }: { sponsor: Sponsor | null; enAttente: File | null; choisirEnAttente: (f: File | null) => void }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);

  useEffect(() => {
    if (!enAttente) {
      setApercu(null);
      return;
    }
    const url = URL.createObjectURL(enAttente);
    setApercu(url);
    return () => URL.revokeObjectURL(url);
  }, [enAttente]);

  const image = apercu ?? sponsor?.logo_url ?? null;
  return (
    <div className={s.logoBloc}>
      <button type="button" className={s.logoBouton} disabled={envoi} onClick={() => ref.current?.click()} title="Choisir le logo (PNG, JPG ou WebP, 2 Mo maximum)">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {image ? <img src={image} alt="" /> : <span>{envoi ? '…' : '+ Logo'}</span>}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          setErreur(null);
          if (!TYPES_LOGO.includes(file.type)) return setErreur('Format accepté : PNG, JPG ou WebP.');
          if (file.size > 2 * 1024 * 1024) return setErreur('Logo trop lourd (2 Mo maximum).');
          if (!sponsor) {
            // Pas encore créé : envoi automatique juste après « Créer le sponsor ».
            choisirEnAttente(file);
            return;
          }
          setEnvoi(true);
          const err = await envoyerLogo(sponsor.id, file);
          setEnvoi(false);
          if (err) setErreur(err);
          else router.refresh();
        }}
      />
      {!sponsor && enAttente && <span className={s.info}>Envoyé à la création</span>}
      {erreur && <span className={s.erreur}>{erreur}</span>}
    </div>
  );
}

function libelleCible(e: Emplacement, cibles: CibleContenu[]) {
  if (!e.cible_slug) return FORMATS[e.format].cible === 'facultative' ? 'Tous les contenus' : '';
  const c = cibles.find((x) => x.type === e.cible_type && x.slug === e.cible_slug);
  const morceaux = [`${e.cible_type === 'heros' ? 'Héros' : e.cible_type === 'mythe' ? 'Mythe' : 'Découverte'} · ${c?.titre ?? e.cible_slug}`];
  if (e.format === 'presente_par') morceaux.push(e.cible_format ? FORMATS_CIBLES[e.cible_format] : 'fiche (tous formats)');
  if (e.cible_chapitre) morceaux.push(`chapitre ${e.cible_chapitre}`);
  return morceaux.join(' · ');
}

function Emplacements({
  sponsorId,
  emplacements,
  stats,
  cibles,
  enCours,
  lancer,
}: {
  sponsorId: string;
  emplacements: Emplacement[];
  stats: Stat[];
  cibles: CibleContenu[];
  enCours: boolean;
  lancer: (a: () => Promise<A.Resultat>, apres?: (r: A.Resultat) => void) => void;
}) {
  const [edition, setEdition] = useState<Emplacement | 'nouveau' | null>(null);
  const liste = emplacements.filter((e) => e.sponsor_id === sponsorId);
  return (
    <section className={u.carte}>
      <div className={u.carteTete}>
        <h2 className={u.carteTitre}>Emplacements</h2>
        {edition === null && (
          <button type="button" className={u.boutonSecondaire} onClick={() => setEdition('nouveau')}>
            + Ajouter un emplacement
          </button>
        )}
      </div>
      {liste.length === 0 && edition === null && <p className={u.discret}>Aucun emplacement : le sponsor n’apparaîtra nulle part.</p>}
      <div className={s.emplacements}>
        {liste.map((e) => {
          const t = total(stats.filter((x) => x.emplacement_id === e.id));
          return edition !== 'nouveau' && edition?.id === e.id ? (
            <FormEmplacement key={e.id} e={e} cibles={cibles} enCours={enCours} annuler={() => setEdition(null)} valider={(v) => lancer(() => A.enregistrerEmplacement(sponsorId, e.id, v), () => setEdition(null))} />
          ) : (
            <div key={e.id} className={`${s.emplacement} ${e.actif ? '' : s.inactif}`}>
              <div>
                <strong>{FORMATS[e.format].label}</strong>
                <span className={u.discret}> {libelleCible(e, cibles)}</span>
                {(e.accroche_fr || e.accroche_en) && <div className={s.accroche}>« {e.accroche_fr || e.accroche_en} »</div>}
                <div className={u.discret}>
                  {t.affichages.toLocaleString('fr-FR')} affichages · {t.clics.toLocaleString('fr-FR')} clics · taux de clic {taux(t.affichages, t.clics)}
                </div>
              </div>
              <div className={s.emplacementActions}>
                <button type="button" className={u.lien} onClick={() => setEdition(e)}>
                  Modifier
                </button>
                <button type="button" className={e.actif ? u.lienDanger : u.lien} disabled={enCours} onClick={() => lancer(() => A.basculerEmplacement(sponsorId, e.id, !e.actif))}>
                  {e.actif ? 'Désactiver' : 'Réactiver'}
                </button>
              </div>
            </div>
          );
        })}
        {edition === 'nouveau' && (
          <FormEmplacement cibles={cibles} enCours={enCours} annuler={() => setEdition(null)} valider={(v) => lancer(() => A.enregistrerEmplacement(sponsorId, null, v), () => setEdition(null))} />
        )}
      </div>
    </section>
  );
}

function FormEmplacement({ e, cibles, enCours, annuler, valider }: { e?: Emplacement; cibles: CibleContenu[]; enCours: boolean; annuler: () => void; valider: (v: A.SaisieEmplacement) => void }) {
  const [v, setV] = useState<A.SaisieEmplacement>({
    format: e?.format ?? 'banniere_accueil',
    cible: e?.cible_slug ? `${e.cible_type}:${e.cible_slug}` : '',
    accroche_fr: e?.accroche_fr ?? '',
    accroche_en: e?.accroche_en ?? '',
    cible_format: e?.cible_format ?? '',
    cible_chapitre: e?.cible_chapitre ? String(e.cible_chapitre) : '',
  });
  const regle = FORMATS[v.format].cible;
  // Chapitre : pour la lecture ou la vidéo d'un contenu, et pour la fin de vidéo d'un contenu choisi (pas pour un mythe, qui n'a qu'une vidéo).
  const estMythe = v.cible.startsWith('mythe:');
  const avecChapitre =
    !!v.cible && !v.cible.startsWith('decouverte:') && ((v.format === 'presente_par' && (v.cible_format === 'lecture' || (v.cible_format === 'video' && !estMythe))) || (v.format === 'fin_video' && !estMythe));
  return (
    <form
      className={`${s.emplacementForm} ${u.formulaire}`}
      onSubmit={(ev) => {
        ev.preventDefault();
        valider(v);
      }}
    >
      <div className={s.formats}>
        {(Object.keys(FORMATS) as Format[]).map((k) => (
          <button key={k} type="button" className={`${s.format} ${v.format === k ? s.formatOn : ''}`} onClick={() => setV({ ...v, format: k, cible: FORMATS[k].cible === 'aucune' ? '' : v.cible })}>
            <strong>{FORMATS[k].label}</strong>
            <span>{FORMATS[k].aide}</span>
          </button>
        ))}
      </div>
      {regle !== 'aucune' && (
        <label>
          {regle === 'obligatoire' ? 'Contenu présenté' : 'Contenu (laisser vide pour toutes les vidéos)'}
          <select value={v.cible} onChange={(ev) => setV({ ...v, cible: ev.target.value })}>
            <option value="">{regle === 'obligatoire' ? 'Choisir…' : 'Toutes les vidéos'}</option>
            {(['heros', 'mythe', 'decouverte'] as const).map((type) => (
              <optgroup key={type} label={type === 'heros' ? 'Héros' : type === 'mythe' ? 'Mythes' : 'Découverte'}>
                {cibles
                  .filter((c) => c.type === type)
                  .map((c) => (
                    <option key={c.slug} value={`${c.type}:${c.slug}`}>
                      {c.titre}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
      )}
      {v.format === 'presente_par' && (
        <label>
          Où s’affiche le sponsor
          <select value={v.cible_format} onChange={(ev) => setV({ ...v, cible_format: ev.target.value, cible_chapitre: '' })}>
            <option value="">Fiche du contenu (tous formats)</option>
            {(Object.keys(FORMATS_CIBLES) as CibleFormat[]).map((k) => (
              <option key={k} value={k}>
                {FORMATS_CIBLES[k]} uniquement
              </option>
            ))}
          </select>
        </label>
      )}
      {avecChapitre && (
        <label>
          Chapitre
          <select value={v.cible_chapitre} onChange={(ev) => setV({ ...v, cible_chapitre: ev.target.value })}>
            <option value="">Tous les chapitres</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={String(n)}>
                Chapitre {n}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className={u.formLigne}>
        <label>
          Accroche (FR)
          <input value={v.accroche_fr} maxLength={160} onChange={(ev) => setV({ ...v, accroche_fr: ev.target.value })} placeholder="Ex. : Fier partenaire de la mémoire africaine" />
        </label>
        <label>
          Accroche (EN)
          <input value={v.accroche_en} maxLength={160} onChange={(ev) => setV({ ...v, accroche_en: ev.target.value })} />
        </label>
      </div>
      <div className={u.formActions}>
        <button type="button" className={u.boutonSecondaire} onClick={annuler} disabled={enCours}>
          Annuler
        </button>
        <button type="submit" className={u.boutonPrincipal} disabled={enCours}>
          {e ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}

function Bilan({ sponsor, emplacements, stats, cibles }: { sponsor: Sponsor; emplacements: Emplacement[]; stats: Stat[]; cibles: CibleContenu[] }) {
  const ids = useMemo(() => new Set(emplacements.filter((e) => e.sponsor_id === sponsor.id).map((e) => e.id)), [emplacements, sponsor.id]);
  const lignes = stats.filter((x) => ids.has(x.emplacement_id));
  const t = total(lignes);
  const jours = Array.from({ length: 30 }, (_, i) => {
    const j = new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10);
    return { j, ...total(lignes.filter((x) => x.jour === j)) };
  });
  const max = Math.max(1, ...jours.map((x) => x.affichages));

  function exporter() {
    const parId = new Map(emplacements.map((e) => [e.id, e]));
    const tete = ['Jour', 'Emplacement', 'Contenu', 'Affichages', 'Clics', 'Taux de clic'];
    const corps = [...lignes]
      .sort((a, b) => a.jour.localeCompare(b.jour))
      .map((x) => {
        const e = parId.get(x.emplacement_id)!;
        return [x.jour, FORMATS[e.format].label, libelleCible(e, cibles), x.affichages, x.clics, taux(x.affichages, x.clics)].join(';');
      });
    corps.push(['Total', '', '', t.affichages, t.clics, taux(t.affichages, t.clics)].join(';'));
    const blob = new Blob(['﻿' + [tete.join(';'), ...corps].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bilan-afroback-${sponsor.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    void A.journaliserExportBilan(sponsor.nom);
  }

  return (
    <section className={u.carte}>
      <div className={u.carteTete}>
        <h2 className={u.carteTitre}>Bilan</h2>
        <button type="button" className={u.boutonSecondaire} onClick={exporter} disabled={!lignes.length}>
          ⤓ Exporter le bilan (CSV)
        </button>
      </div>
      <div className={s.bilanChiffres}>
        <span>
          <strong>{t.affichages.toLocaleString('fr-FR')}</strong> affichages
        </span>
        <span>
          <strong>{t.clics.toLocaleString('fr-FR')}</strong> clics
        </span>
        <span>
          <strong>{taux(t.affichages, t.clics)}</strong> taux de clic
        </span>
      </div>
      <div className={s.graphe} aria-label="Affichages des 30 derniers jours">
        {jours.map((x) => (
          <span key={x.j} title={`${x.j} : ${x.affichages} affichages, ${x.clics} clics`} style={{ height: `${Math.max(2, (x.affichages / max) * 100)}%` }} />
        ))}
      </div>
      <p className={u.aide}>Affichages des 30 derniers jours. Les chiffres apparaîtront quand l’app et le site afficheront les sponsors (étape 2).</p>
    </section>
  );
}
