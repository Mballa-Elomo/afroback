import { chargerMarketplace } from '@/lib/marketplace';
import { MarketplaceModule } from './MarketplaceModule';

export const dynamic = 'force-dynamic';

/** Module Marketplace (cdc-module-marketplace.md). */
export default async function MarketplacePage() {
  const d = await chargerMarketplace();
  if (d.erreur) return <p style={{ color: '#e07a5f' }}>Lecture du Marché impossible : {d.erreur}</p>;
  return <MarketplaceModule d={d} />;
}
