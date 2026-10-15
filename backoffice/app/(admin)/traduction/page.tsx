import Link from 'next/link';
import { coverageByLanguage, getTranslationEntriesAdmin, LANGUES_TRADUCTION } from '@/lib/data/translation';
import { StatusBadge } from '@/components/StatusBadge';
import { couvertureAnglais } from '@/lib/data/couvertureAnglais';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

const GRID_COLUMNS = '1.4fr 1.6fr 1fr';

const STATUT_LABEL: Record<string, string> = { vide: 'Vide', brouillon: 'Brouillon', valide: 'Validé' };

export default async function TraductionPage({ searchParams }: { searchParams: Promise<{ langue?: string }> }) {
  const sp = await searchParams;
  const langue = LANGUES_TRADUCTION.some((l) => l.code === sp.langue) ? sp.langue! : 'ewo';

  const [entries, anglais] = await Promise.all([getTranslationEntriesAdmin(), couvertureAnglais()]);
  const totalEn = anglais.reduce((a, x) => ({ requis: a.requis + x.requis, traduits: a.traduits + x.traduits }), { requis: 0, traduits: 0 });
  const incomplets = anglais.filter((x) => x.manquants.length > 0);
  const coverage = coverageByLanguage(entries);
  const rows = entries.filter((e) => e.langue === langue);
  const langueNom = LANGUES_TRADUCTION.find((l) => l.code === langue)!.nom;

  return (
    <div>
      <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Traduction</h1>

      {/* Anglais : deuxième langue de l'app et du site (finitions du 2026-10-15). */}
      <section style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20, margin: '18px 0 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: 17, color: colors.textHeading, margin: 0 }}>Anglais (app et site)</h2>
          <span style={{ fontFamily: fonts.display, fontSize: 22, color: colors.accentGold }}>
            {totalEn.requis ? Math.round((totalEn.traduits / totalEn.requis) * 100) : 100} %
            <span style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted }}> · {totalEn.traduits}/{totalEn.requis} champs</span>
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 8, background: '#241910', margin: '12px 0 14px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totalEn.requis ? (totalEn.traduits / totalEn.requis) * 100 : 100}%`, background: 'linear-gradient(90deg, #a0522d, #f0c36b)' }} />
        </div>
        {incomplets.length === 0 ? (
          <p style={{ color: colors.positive, fontSize: 13, margin: 0 }}>Tous les contenus remplis en français existent aussi en anglais.</p>
        ) : (
          <>
            <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 10px' }}>
              Champs à traduire (lancer /afroback_traduction_FR_EN, puis exécuter son SQL dans Supabase) :
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {incomplets.map((x) => (
                <li key={x.type + x.titre} style={{ fontSize: 13, color: colors.textBody }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.accentGold, marginRight: 8 }}>{x.type.toUpperCase()}</span>
                  {x.lien ? <Link href={x.lien}>{x.titre}</Link> : x.titre}
                  <span style={{ color: colors.textMuted }}> · manque : {x.manquants.join(', ')}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <h2 style={{ fontFamily: fonts.display, fontSize: 17, color: colors.textHeading, margin: '0 0 4px' }}>Langues camerounaises</h2>
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
