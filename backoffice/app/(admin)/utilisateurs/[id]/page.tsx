import Link from 'next/link';
import { chargerFiche } from '@/lib/utilisateurs';
import { requireAdmin } from '@/lib/auth';
import { FicheUtilisateur } from './FicheUtilisateur';
import styles from '../utilisateurs.module.css';

export const dynamic = 'force-dynamic';

/** Fiche d'un compte (cdc-module-utilisateurs.md, § 4). */
export default async function FichePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ onglet?: string }> }) {
  const { id } = await params;
  const { onglet } = await searchParams;
  const [fiche, admin] = await Promise.all([/^[0-9a-f-]{36}$/i.test(id) ? chargerFiche(id) : Promise.resolve(null), requireAdmin()]);

  if (!fiche) {
    return (
      <div className={styles.module}>
        <Link href="/utilisateurs" className={styles.retour}>
          ← Tous les utilisateurs
        </Link>
        <div className={styles.carte}>
          <h1 className={styles.titre}>Compte introuvable</h1>
          <p className={styles.sousTitre}>Ce compte n’existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  const soiMeme = !!admin && admin.email.toLowerCase() === fiche.ligne.email.toLowerCase();
  return <FicheUtilisateur fiche={fiche} soiMeme={soiMeme} ongletInitial={onglet} />;
}
