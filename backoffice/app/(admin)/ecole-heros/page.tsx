import { chargerEcole } from '@/lib/ecole';
import { EcoleModule } from './EcoleModule';

export const dynamic = 'force-dynamic';

/** École des Héros : matrice et éditeur des leçons (finitions du 2026-10-15). */
export default async function EcoleHerosPage() {
  const d = await chargerEcole();
  return <EcoleModule d={d} />;
}
