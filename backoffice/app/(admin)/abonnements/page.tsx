import { redirect } from 'next/navigation';

/** L'écran Abonnements fait désormais partie du module Paiements & revenus (cdc-module-paiements.md, § 3.3). */
export default function AbonnementsPage() {
  redirect('/paiements?onglet=abonnements');
}
