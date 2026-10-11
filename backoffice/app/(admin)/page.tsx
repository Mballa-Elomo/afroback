import Link from 'next/link';
import { getHeroesAdmin, heroHasMedia } from '@/lib/data/heros';
import { getPendingReportsCount } from '@/lib/data/overview';
import { getTotalEngagement } from '@/lib/data/engagement';
import { chargerListe, type LigneUtilisateur } from '@/lib/utilisateurs';
import { requireAdmin } from '@/lib/auth';
import { relatif } from '@/lib/utilisateursFormat';
import { Compteur } from '@/components/Compteur';
import { Icone } from '@/components/Icone';
import { Sankofa } from '@/components/Sankofa';
import s from './dashboard.module.css';

export const dynamic = 'force-dynamic';

/**
 * Tableau de bord (refonte « Sankofa », 2026-10-10). Les chiffres
 * utilisateurs viennent désormais des vrais abonnements (lib/utilisateurs.ts),
 * et non plus du forfait choisi à l'inscription.
 */

const FUSEAU = 'Africa/Douala';

function salutation() {
  const h = Number(new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: FUSEAU }).format(new Date()));
  return h < 5 ? 'Bonne nuit' : h < 18 ? 'Bonjour' : 'Bonsoir';
}

export default async function DashboardPage() {
  const [heroes, comptes, pendingReports, engagement, admin] = await Promise.all([
    getHeroesAdmin(),
    chargerListe().catch(() => [] as LigneUtilisateur[]),
    getPendingReportsCount(),
    getTotalEngagement(),
    requireAdmin(),
  ]);

  const total = heroes.length;
  const publies = heroes.filter((h) => h.statut_publication === 'publie').length;
  const incomplets = heroes.filter((h) => {
    const m = heroHasMedia(h);
    return !(m.recitFr && m.photo && (m.audioFr || m.video));
  });

  const production = (
    [
      ['recitFr', 'Récit FR'],
      ['recitEn', 'Récit EN'],
      ['audioFr', 'Audio FR'],
      ['video', 'Vidéo'],
      ['photo', 'Photo'],
    ] as const
  ).map(([cle, label]) => {
    const n = heroes.filter((h) => heroHasMedia(h)[cle]).length;
    return { label, n, pct: total ? Math.round((n / total) * 100) : 0 };
  });

  const now = Date.now();
  const nouveaux7 = comptes.filter((u) => now - new Date(u.inscrit_le).getTime() < 7 * 86400000).length;
  const racines = comptes.filter((u) => u.forfait === 'racines').length;
  const heritage = comptes.filter((u) => u.forfait === 'heritage').length;
  const decouverte = comptes.length - racines - heritage;
  const abonnes = racines + heritage;
  const derniers = [...comptes].sort((a, b) => b.inscrit_le.localeCompare(a.inscrit_le)).slice(0, 5);
  const pct = (n: number) => (comptes.length ? (n / comptes.length) * 100 : 0);
  const anneau = `conic-gradient(#f0c36b 0 ${pct(racines)}%, #e3a277 ${pct(racines)}% ${pct(racines) + pct(heritage)}%, #3a2c1f ${pct(racines) + pct(heritage)}% 100%)`;

  const prenom = (admin?.nom || '').split(/\s+/)[0];
  const date = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: FUSEAU }).format(new Date());

  return (
    <div className={s.page}>
      {/* Bandeau d'accueil */}
      <section className={s.accueil}>
        <div className={s.accueilTexte}>
          <span className={s.date}>{date}</span>
          <h1 className={s.titre}>
            {salutation()}
            {prenom ? `, ${prenom}` : ''}
          </h1>
          <p className={s.resume}>
            AFROBACK compte <strong>{comptes.length}</strong> membre{comptes.length > 1 ? 's' : ''}, dont <strong>{abonnes}</strong> abonné
            {abonnes > 1 ? 's' : ''}, et <strong>{publies}</strong> héros publié{publies > 1 ? 's' : ''}.
            {nouveaux7 > 0 ? ` ${nouveaux7} nouvelle${nouveaux7 > 1 ? 's' : ''} inscription${nouveaux7 > 1 ? 's' : ''} cette semaine.` : ''}
          </p>
          <div className={s.raccourcisRapides}>
            <Link href="/utilisateurs" className={s.puce}>
              <Icone nom="users" taille={15} /> Utilisateurs
            </Link>
            <Link href="/abonnements" className={s.puce}>
              <Icone nom="gift" taille={15} /> Offrir un abonnement
            </Link>
            <Link href="/heros" className={s.puce}>
              <Icone nom="heroes" taille={15} /> Héros
            </Link>
            <Link href="/parametres" className={s.puce}>
              <Icone nom="settings" taille={15} /> Paramètres
            </Link>
          </div>
        </div>
        <div className={s.accueilEmbleme} aria-hidden>
          <span className={s.cercle1} />
          <span className={s.cercle2} />
          <Sankofa size={120} epaisseur={5} className={s.accueilSankofa} />
        </div>
      </section>

      {/* Chiffres clés */}
      <section className={s.kpis}>
        <Kpi icone="users" label="Comptes" valeur={comptes.length} detail={`+${nouveaux7} cette semaine`} href="/utilisateurs" />
        <Kpi icone="revenue" label="Abonnés payants" valeur={abonnes} detail={`${racines} Racines · ${heritage} Héritage`} href="/abonnements" ton="terra" />
        <Kpi icone="heroes" label="Héros publiés" valeur={publies} detail={`sur ${total} au catalogue`} href="/heros" />
        <Kpi
          icone="comments"
          label="Signalements"
          valeur={pendingReports ?? 0}
          detail={pendingReports === null ? 'indisponible' : pendingReports > 0 ? 'en attente de revue' : 'rien à modérer'}
          href="/commentaires"
          ton={pendingReports ? 'rouge' : 'vert'}
        />
      </section>

      <section className={s.grille2}>
        <div className={s.carte}>
          <h2 className={s.carteTitre}>Production des héros</h2>
          <div className={s.barres}>
            {production.map((b, i) => (
              <div key={b.label}>
                <div className={s.barreTete}>
                  <span>{b.label}</span>
                  <span className={s.mono}>
                    {b.n}/{total} · {b.pct}%
                  </span>
                </div>
                <div className={s.piste}>
                  <div className={s.remplissage} style={{ width: `${b.pct}%`, animationDelay: `${0.2 + i * 0.08}s` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={s.carte}>
          <h2 className={s.carteTitre}>Forfaits réels</h2>
          <div className={s.forfaits}>
            <div className={s.anneau} style={{ background: anneau }}>
              <div className={s.anneauCentre}>
                <span className={s.anneauValeur}>{comptes.length ? Math.round(pct(abonnes)) : 0}%</span>
                <span className={s.anneauLabel}>abonnés</span>
              </div>
            </div>
            <ul className={s.legende}>
              <li>
                <span className={s.pastille} style={{ background: '#f0c36b' }} /> Racines <strong>{racines}</strong>
              </li>
              <li>
                <span className={s.pastille} style={{ background: '#e3a277' }} /> Héritage <strong>{heritage}</strong>
              </li>
              <li>
                <span className={s.pastille} style={{ background: '#3a2c1f', border: '1px solid #5f5140' }} /> Découverte <strong>{decouverte}</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className={s.carte}>
        <h2 className={s.carteTitre}>Engagement, tous héros confondus</h2>
        <div className={s.engagement}>
          <Mini icone="dash" label="Lectures de récit" valeur={engagement.lectures_recit} />
          <Mini icone="eye" label="Écoutes audio" valeur={engagement.ecoutes_audio} />
          <Mini icone="media" label="Visionnages vidéo" valeur={engagement.visionnages_video} />
        </div>
      </section>

      <section className={s.grille3}>
        <div className={`${s.carte} ${s.carteAlerte}`}>
          <h2 className={s.carteTitre}>À traiter</h2>
          <div className={s.liste}>
            {incomplets.length > 0 && <Ligne href="/heros?filtre=incomplets" nombre={incomplets.length} label="Héros avec un média manquant" />}
            {!!pendingReports && <Ligne href="/commentaires" nombre={pendingReports} label="Signalements à modérer" />}
            {comptes.filter((u) => u.statut === 'non_confirme').length > 0 && (
              <Ligne href="/utilisateurs" nombre={comptes.filter((u) => u.statut === 'non_confirme').length} label="E-mails non confirmés" />
            )}
            {incomplets.length === 0 && !pendingReports && <p className={s.vide}>Rien à traiter. Tout est en ordre.</p>}
          </div>
        </div>

        <div className={s.carte}>
          <div className={s.carteTete}>
            <h2 className={s.carteTitre}>Derniers inscrits</h2>
            <Link href="/utilisateurs" className={s.voirTout}>
              Tout voir
            </Link>
          </div>
          <div className={s.liste}>
            {derniers.length === 0 && <p className={s.vide}>Aucun compte pour l’instant.</p>}
            {derniers.map((u) => (
              <Link key={u.id} href={`/utilisateurs/${u.id}`} className={s.membre}>
                <span className={s.membreAvatar}>{(u.prenom || u.email || '?').charAt(0).toUpperCase()}</span>
                <span className={s.membreTexte}>
                  <span>{u.prenom || u.email}</span>
                  <span className={s.discret}>{relatif(u.inscrit_le)}</span>
                </span>
                {u.forfait !== 'decouverte' && <span className={s.membreForfait}>{u.forfait === 'heritage' ? 'Héritage' : 'Racines'}</span>}
              </Link>
            ))}
          </div>
        </div>

        <div className={s.carte}>
          <h2 className={s.carteTitre}>Raccourcis</h2>
          <div className={s.liste}>
            <Raccourci icone="heroes" label="Mettre une histoire à la une" href="/heros" />
            <Raccourci icone="media" label="Ajouter un média" href="/media" />
            <Raccourci icone="translation" label="Suivre les traductions" href="/traduction" />
            <Raccourci icone="shield" label="Réglages de sécurité" href="/parametres?section=securite" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({ icone, label, valeur, detail, href, ton = 'or' }: { icone: string; label: string; valeur: number; detail: string; href: string; ton?: 'or' | 'terra' | 'rouge' | 'vert' }) {
  return (
    <Link href={href} className={`${s.kpi} ${s['kpi_' + ton]}`} data-tilt>
      <span className={s.kpiIcone}>
        <Icone nom={icone} taille={18} />
      </span>
      <span className={s.kpiValeur}>
        <Compteur valeur={valeur} />
      </span>
      <span className={s.kpiLabel}>{label}</span>
      <span className={s.kpiDetail}>{detail}</span>
      <span className={s.kpiFleche}>
        <Icone nom="arrow" taille={15} />
      </span>
    </Link>
  );
}

function Mini({ icone, label, valeur }: { icone: string; label: string; valeur: number }) {
  return (
    <div className={s.mini} data-tilt>
      <span className={s.kpiIcone}>
        <Icone nom={icone} taille={17} />
      </span>
      <span>
        <span className={s.miniValeur}>
          <Compteur valeur={valeur} />
        </span>
        <span className={s.kpiDetail}>{label}</span>
      </span>
    </div>
  );
}

function Ligne({ href, nombre, label }: { href: string; nombre: number; label: string }) {
  return (
    <Link href={href} className={s.ligne}>
      <span className={s.ligneNombre}>{nombre}</span>
      <span className={s.ligneLabel}>{label}</span>
      <Icone nom="arrow" taille={15} />
    </Link>
  );
}

function Raccourci({ icone, label, href }: { icone: string; label: string; href: string }) {
  return (
    <Link href={href} className={s.ligne}>
      <span className={s.raccourciIcone}>
        <Icone nom={icone} taille={16} />
      </span>
      <span className={s.ligneLabel}>{label}</span>
      <Icone nom="arrow" taille={15} />
    </Link>
  );
}
