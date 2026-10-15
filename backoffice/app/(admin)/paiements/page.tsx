import { chargerPaiements } from '@/lib/paiements';
import { PaiementsModule } from './PaiementsModule';

export const dynamic = 'force-dynamic';

/** Module Paiements & revenus (cdc-module-paiements.md). */
export default async function PaiementsPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const [{ onglet }, donnees] = await Promise.all([searchParams, chargerPaiements()]);
  return <PaiementsModule donnees={donnees} ongletInitial={onglet} />;
}
