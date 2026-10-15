'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { DonneesEcole, Lecon, Planche } from '@/lib/ecole';
import { relatif } from '@/lib/utilisateursFormat';
import { Icone } from '@/components/Icone';
import { LienVideoCellule } from '@/components/LienVideoCellule';
import * as A from './actions';
import u from '../utilisateurs/utilisateurs.module.css';
import s from './ecole.module.css';

/**
 * École des Héros (finitions du 2026-10-15) : matrice héros × niveaux, puis
 * éditeur de la leçon choisie (texte FR/EN, narration, vidéo, BD, quiz).
 */

type Onglet = 'lire' | 'ecouter' | 'regarder' | 'bd';

const FORMATS: { id: Onglet; label: string; icone: string; pret: (l: Lecon) => boolean }[] = [
  { id: 'lire', label: 'Lire', icone: 'dash', pret: (l) => !!l.texte_fr },
  { id: 'ecouter', label: 'Écouter', icone: 'eye', pret: (l) => !!l.audio_fr },
  { id: 'regarder', label: 'Regarder', icone: 'media', pret: (l) => !!l.video },
  { id: 'bd', label: 'BD', icone: 'gift', pret: (l) => l.planches.length > 0 },
];

function Portail({ children }: { children: ReactNode }) {
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);
  return monte ? createPortal(children, document.body) : null;
}

async function envoyer(leconId: string, type: string, file: File): Promise<{ error: string | null; url?: string }> {
  const fd = new FormData();
  fd.set('type', type);
  fd.set('file', file);
  return fetch(`/api/ecole/${leconId}/fichier`, { method: 'POST', body: fd })
    .then((r) => r.json())
    .catch(() => ({ error: 'Envoi interrompu (connexion).' }));
}

export function EcoleModule({ d }: { d: DonneesEcole }) {
  const router = useRouter();
  const [selection, setSelection] = useState<string | null>(d.lecons[0]?.id ?? null);
  const [toast, setToast] = useState<A.Resultat | null>(null);
  const [enCours, demarrer] = useTransition();
  const courante = d.lecons.find((l) => l.id === selection) ?? null;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

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

  const total = d.lecons.length;
  const compte = (f: (l: Lecon) => boolean) => d.lecons.filter(f).length;

  return (
    <div className={u.module}>
      <header className={u.entete}>
        <div>
          <h1 className={u.titre}>École des Héros</h1>
          <p className={u.sousTitre}>
            Leçons pour les enfants, par héros et par niveau. Les textes sont rédigés par /afroback_pedagogue ; ici vous les relisez et ajoutez narration, vidéo et BD.
          </p>
        </div>
      </header>

      <section className={s.chiffres}>
        <span>
          <strong>{total}</strong> leçons
        </span>
        {FORMATS.map((f) => (
          <span key={f.id}>
            <strong>
              {compte(f.pret)}/{total}
            </strong>{' '}
            {f.label.toLowerCase()}
          </span>
        ))}
        <span>
          <strong>
            {compte((l) => l.nb_questions > 0)}/{total}
          </strong>{' '}
          quiz
        </span>
      </section>

      {!d.audioEnDisponible && (
        <div className={s.bandeau}>
          <Icone nom="bolt" taille={16} /> Exécutez <code>schema-ecole-medias.sql</code> dans Supabase pour pouvoir envoyer la narration en anglais.
        </div>
      )}

      <section className={`${u.carte} ${s.matriceCarte}`}>
        <div className={s.matrice}>
          <div className={s.entetes}>
            <span>Héros</span>
            {[1, 2, 3, 4].map((n) => (
              <span key={n}>
                Niveau {n}
                <em>{d.niveaux.find((x) => x.niveau === n)?.tranche}</em>
              </span>
            ))}
          </div>
          {d.heros.map((h) => (
            <div key={h.id} className={s.rangee}>
              <span className={s.nomHeros}>{h.nom}</span>
              {[1, 2, 3, 4].map((n) => {
                const l = d.lecons.find((x) => x.heros_id === h.id && x.niveau === n);
                if (!l) {
                  return (
                    <button key={n} type="button" className={s.caseVide} disabled={enCours} onClick={() => lancer(() => A.creerLecon(h.id, n), (r) => r.id && setSelection(r.id))} title="Créer cette leçon">
                      +
                    </button>
                  );
                }
                return (
                  <button key={n} type="button" className={`${s.case} ${selection === l.id ? s.caseOn : ''}`} onClick={() => setSelection(l.id)}>
                    {FORMATS.map((f) => (
                      <span key={f.id} className={f.pret(l) ? s.pointOk : s.point} title={`${f.label} : ${f.pret(l) ? 'prêt' : 'à produire'}`} />
                    ))}
                    <span className={l.nb_questions ? s.pointQuiz : s.point} title={`Quiz : ${l.nb_questions} question(s)`} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p className={u.aide}>Points : Lire · Écouter · Regarder · BD · Quiz. Doré = prêt. « + » crée une leçon pour ce héros et ce niveau.</p>
      </section>

      {courante ? <Editeur key={courante.id} l={courante} d={d} enCours={enCours} lancer={lancer} setToast={setToast} /> : <p className={u.discret}>Choisissez une leçon dans la matrice.</p>}

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

function Editeur({
  l,
  d,
  enCours,
  lancer,
  setToast,
}: {
  l: Lecon;
  d: DonneesEcole;
  enCours: boolean;
  lancer: (a: () => Promise<A.Resultat>, apres?: (r: A.Resultat) => void) => void;
  setToast: (r: A.Resultat) => void;
}) {
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>('lire');
  const [fr, setFr] = useState(l.texte_fr);
  const [en, setEn] = useState(l.texte_en);
  const [planches, setPlanches] = useState<Planche[]>(l.planches);
  const [envoi, setEnvoi] = useState<string | null>(null);
  const niveau = d.niveaux.find((x) => x.niveau === l.niveau);
  const modifie = fr !== l.texte_fr || en !== l.texte_en;
  const bdModifiee = JSON.stringify(planches) !== JSON.stringify(l.planches);

  async function envoyerAudio(langue: 'fr' | 'en', file: File | undefined) {
    if (!file) return;
    setEnvoi(`audio_${langue}`);
    const r = await envoyer(l.id, `audio_${langue}`, file);
    setEnvoi(null);
    setToast(r.error ? { ok: false, message: r.error } : { ok: true, message: `Narration ${langue.toUpperCase()} envoyée.` });
    if (!r.error) router.refresh();
  }

  async function ajouterPlanches(files: FileList | null) {
    if (!files?.length) return;
    setEnvoi('planche');
    const nouvelles: Planche[] = [];
    for (const f of Array.from(files)) {
      const r = await envoyer(l.id, 'planche', f);
      if (r.error || !r.url) {
        setToast({ ok: false, message: `${f.name} : ${r.error ?? 'échec'}` });
        break;
      }
      nouvelles.push({ image_url: r.url, texte: '', ordre: 0 });
    }
    setEnvoi(null);
    if (nouvelles.length) setPlanches((p) => [...p, ...nouvelles]);
  }

  const deplacer = (i: number, delta: number) =>
    setPlanches((p) => {
      const n = [...p];
      const j = i + delta;
      if (j < 0 || j >= n.length) return p;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <section className={u.carte}>
      <div className={s.editeurTete}>
        <div>
          <span className={s.niveau}>
            Niveau {l.niveau} · {niveau?.nom} · {niveau?.tranche}
          </span>
          <h2 className={s.titreLecon}>{l.heros}</h2>
          <span className={u.discret}>Modifiée {relatif(l.maj)}</span>
        </div>
        <Link href="/quiz" className={u.boutonSecondaire}>
          Quiz de la leçon ({l.nb_questions}) →
        </Link>
      </div>
      {niveau?.ton && <p className={s.ton}>Consigne du niveau : {niveau.ton}</p>}

      <nav className={u.onglets}>
        {FORMATS.map((f) => (
          <button key={f.id} type="button" className={`${u.onglet} ${onglet === f.id ? u.ongletOn : ''}`} onClick={() => setOnglet(f.id)}>
            <span className={f.pret(l) ? s.pointOk : s.point} /> {f.label}
          </button>
        ))}
      </nav>

      {onglet === 'lire' && (
        <form
          className={s.textes}
          onSubmit={(e) => {
            e.preventDefault();
            lancer(() => A.enregistrerTextes(l.id, fr, en));
          }}
        >
          <label>
            Texte adapté (FR) · {fr.trim() ? fr.trim().split(/\s+/).length : 0} mots
            <textarea className={u.zoneTexte} rows={14} value={fr} onChange={(e) => setFr(e.target.value)} />
          </label>
          <label>
            Adapted text (EN) · {en.trim() ? en.trim().split(/\s+/).length : 0} mots
            <textarea className={u.zoneTexte} rows={14} value={en} onChange={(e) => setEn(e.target.value)} />
          </label>
          <div className={u.formActions}>
            <span className={u.discret}>Jamais le récit adulte tel quel : un texte adapté à l’âge, sans détail violent, légendes présentées comme légendes.</span>
            <button type="submit" className={u.boutonPrincipal} disabled={enCours || !modifie}>
              Enregistrer le texte
            </button>
          </div>
        </form>
      )}

      {onglet === 'ecouter' && (
        <div className={s.audios}>
          {(['fr', 'en'] as const).map((langue) => {
            const url = langue === 'fr' ? l.audio_fr : l.audio_en;
            const desactive = langue === 'en' && !d.audioEnDisponible;
            return (
              <div key={langue} className={s.audio}>
                <strong>Narration {langue.toUpperCase()}</strong>
                {url ? <audio controls src={url} preload="none" className={s.lecteurAudio} /> : <span className={u.discret}>Pas encore de narration.</span>}
                <div className={s.audioActions}>
                  <label className={`${u.boutonSecondaire} ${desactive ? s.inactif : ''}`}>
                    {envoi === `audio_${langue}` ? 'Envoi…' : url ? 'Remplacer (MP3)' : 'Envoyer un MP3'}
                    <input type="file" accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a" hidden disabled={desactive || !!envoi} onChange={(e) => envoyerAudio(langue, e.target.files?.[0])} />
                  </label>
                  {url && (
                    <button type="button" className={u.lienDanger} disabled={enCours} onClick={() => window.confirm('Retirer cette narration ?') && lancer(() => A.retirerAudioLecon(l.id, langue))}>
                      Retirer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <p className={u.aide}>Voix douce et lente pour les plus petits. MP3 ou M4A, 40 Mo maximum.</p>
        </div>
      )}

      {onglet === 'regarder' && (
        <div className={s.video}>
          <LienVideoCellule
            label="de la leçon"
            url={l.video ?? undefined}
            visionnages={0}
            enregistrer={(lien) => A.definirVideoLecon(l.id, lien)}
            retirer={() => A.retirerVideoLecon(l.id)}
          />
          <p className={u.aide}>
            Pour l’espace enfant : vidéo YouTube <strong>non répertoriée</strong>, réglée « conçue pour les enfants » dans YouTube Studio (elle n’affiche alors ni publicité personnalisée ni commentaires).
          </p>
        </div>
      )}

      {onglet === 'bd' && (
        <div>
          <div className={s.planches}>
            {planches.map((p, i) => (
              <div key={p.image_url + i} className={s.planche}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url} alt={`Planche ${i + 1}`} />
                <span className={s.numero}>{i + 1}</span>
                <textarea
                  rows={3}
                  placeholder="Texte de la bulle (FR)"
                  value={p.texte}
                  onChange={(e) => setPlanches((x) => x.map((y, k) => (k === i ? { ...y, texte: e.target.value } : y)))}
                />
                <textarea
                  rows={2}
                  placeholder="Bubble text (EN)"
                  value={p.texte_en ?? ''}
                  onChange={(e) => setPlanches((x) => x.map((y, k) => (k === i ? { ...y, texte_en: e.target.value } : y)))}
                />
                <div className={s.plancheOutils}>
                  <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0} title="Avancer">
                    ←
                  </button>
                  <button type="button" onClick={() => deplacer(i, 1)} disabled={i === planches.length - 1} title="Reculer">
                    →
                  </button>
                  <button type="button" className={s.retirer} onClick={() => setPlanches((x) => x.filter((_, k) => k !== i))} title="Retirer">
                    <Icone nom="trash" taille={14} />
                  </button>
                </div>
              </div>
            ))}
            <label className={s.ajoutPlanche}>
              {envoi === 'planche' ? 'Envoi…' : '+ Ajouter des planches'}
              <span>PNG, JPG ou WebP · plusieurs à la fois</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" multiple hidden disabled={!!envoi} onChange={(e) => ajouterPlanches(e.target.files)} />
            </label>
          </div>
          <div className={u.formActions}>
            {bdModifiee && <span className={u.attention}>Modifications non enregistrées</span>}
            <button type="button" className={u.boutonSecondaire} disabled={!bdModifiee || enCours} onClick={() => setPlanches(l.planches)}>
              Annuler
            </button>
            <button type="button" className={u.boutonPrincipal} disabled={!bdModifiee || enCours} onClick={() => lancer(() => A.enregistrerPlanches(l.id, planches))}>
              Enregistrer la BD
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
