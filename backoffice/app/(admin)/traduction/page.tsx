import Link from 'next/link';
import { coverageByLanguage, getTranslationEntriesAdmin, LANGUES_TRADUCTION } from '@/lib/data/translation';
import { StatusBadge } from '@/components/StatusBadge';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

const GRID_COLUMNS = '1.4fr 1.6fr 1fr';

const STATUT_LABEL: Record<string, string> = { vide: 'Vide', brouillon: 'Brouillon', valide: 'Validé' };

export default async function TraductionPage({ searchParams }: { searchParams: Promise<{ langue?: string }> }) {
  const sp = await searchParams;
  const langue = LANGUES_TRADUCTION.some((l) => l.code === sp.langue) ? sp.langue! : 'ewo';

  const entries = await getTranslationEntriesAdmin();
  const coverage = coverageByLanguage(entries);
  const rows = entries.filter((e) => e.langue === langue);
  const langueNom = LANGUES_TRADUCTION.find((l) => l.code === langue)!.nom;

  return (
    <div>
      <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Traduction</h1>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 20px' }}>
        4 langues camerounaises. Statut à 3 états : vide / brouillon (non relu) / validé par un locuteur natif —
        jamais une coche « traduit » avant validation humaine. Ce tableau reflète le code du site (
        <code style={{ fontFamily: fonts.mono }}>DICT</code>), il ne remplace pas le travail de traduction fait dans
        la base de connaissances éwondo.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {coverage.map((l) => (
          <Link
            key={l.code}
            href={`/traduction?langue=${l.code}`}
            style={{
              background: colors.panel,
              border: `1px solid ${l.code === langue ? colors.borderStrong : colors.border}`,
              borderRadius: 14,
              padding: 16,
              color: 'inherit',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: colors.textHeading }}>{l.nom}</div>
            <div style={{ fontFamily: fonts.display, fontSize: 22, color: colors.accentGold, margin: '6px 0 2px' }}>{l.validated}</div>
            <div style={{ fontSize: 10.5, color: colors.textMuted }}>
              clés validées / {l.total} · {l.brouillon} en brouillon
            </div>
          </Link>
        ))}
      </div>

      <div style={{ background: colors.panelDeep, border: `1px solid ${colors.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID_COLUMNS,
            gap: 10,
            padding: '13px 18px',
            background: colors.tableHeader,
            borderBottom: `1px solid ${colors.border}`,
            fontFamily: fonts.mono,
            fontSize: 9.5,
            letterSpacing: '.08em',
            color: colors.textMuted,
          }}
        >
          <span>CLÉ (FR)</span>
          <span>BROUILLON {langueNom.toUpperCase()}</span>
          <span>STATUT</span>
        </div>

        {rows.map((r) => (
          <div
            key={r.cle}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID_COLUMNS,
              gap: 10,
              padding: '12px 18px',
              borderBottom: `1px solid ${colors.borderHairline}`,
              alignItems: 'center',
              fontSize: 12.5,
            }}
          >
            <span style={{ color: colors.textBody }}>{r.source_fr.length > 60 ? r.source_fr.slice(0, 60) + '…' : r.source_fr}</span>
            <span style={{ fontStyle: 'italic', color: r.brouillon ? colors.textHeading : colors.textFaint }}>{r.brouillon ?? '—'}</span>
            <span>
              <StatusBadge label={STATUT_LABEL[r.statut]} tone={r.statut === 'valide' ? 'positive' : r.statut === 'brouillon' ? 'gold' : 'neutral'} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
