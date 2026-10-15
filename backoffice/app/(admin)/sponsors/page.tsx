import { chargerSponsors } from '@/lib/sponsors';
import { ListeSponsors } from './SponsorsModule';

export const dynamic = 'force-dynamic';

/** Module Sponsors (cdc-module-sponsors.md, § 3.1). */
export default async function SponsorsPage() {
  const d = await chargerSponsors();
  return <ListeSponsors sponsors={d.sponsors} emplacements={d.emplacements} stats={d.stats} installe={d.installe} />;
}
