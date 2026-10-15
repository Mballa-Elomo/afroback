import { chargerCommunaute } from '@/lib/communaute';
import { CommunauteModule } from './CommunauteModule';

export const dynamic = 'force-dynamic';

/** Module Communauté (cdc-module-communaute.md). */
export default async function CommunautePage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const [{ onglet }, donnees] = await Promise.all([searchParams, chargerCommunaute()]);
  return <CommunauteModule donnees={donnees} ongletInitial={onglet} />;
}
