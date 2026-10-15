import Link from 'next/link';
import { chargerSponsors } from '@/lib/sponsors';
import { FicheSponsor } from '../SponsorsModule';

export const dynamic = 'force-dynamic';

/** Fiche d'un sponsor, ou création (« nouveau »). cdc-module-sponsors.md, § 3.2. */
export default async function FicheSponsorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await chargerSponsors();
  if (!d.installe) return <p>Exécutez schema-sponsors.sql dans Supabase pour activer ce module.</p>;
  const sponsor = id === 'nouveau' ? null : (d.sponsors.find((x) => x.id === id) ?? undefined);
  if (sponsor === undefined) {
    return (
      <p>
        Sponsor introuvable. <Link href="/sponsors">Retour aux sponsors</Link>
      </p>
    );
  }
  return <FicheSponsor sponsor={sponsor} emplacements={d.emplacements} stats={d.stats} cibles={d.cibles} />;
}
