import { chargerListe } from '@/lib/utilisateurs';
import { requireAdmin } from '@/lib/auth';
import { UtilisateursListe } from './UtilisateursListe';
import styles from './utilisateurs.module.css';

export const dynamic = 'force-dynamic';

/**
 * Module Utilisateurs (cdc-module-utilisateurs.md, § 3) : chargement côté
 * serveur (clé service_role), recherche/filtres/tri/export dans le navigateur.
 */
export default async function UtilisateursPage() {
  const admin = await requireAdmin();
  try {
    const comptes = await chargerListe();
    return <UtilisateursListe comptes={comptes} adminEmail={admin?.email ?? ''} />;
  } catch (e) {
    return (
      <div className={styles.module}>
        <div className={styles.carte}>
          <h1 className={styles.titre}>Utilisateurs</h1>
          <p className={styles.erreur}>Lecture des comptes impossible : {e instanceof Error ? e.message : 'erreur inconnue'}.</p>
        </div>
      </div>
    );
  }
}
