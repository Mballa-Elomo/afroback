import { getMythesAdmin } from '@/lib/data/mythologie';
import { StatusBadge } from '@/components/StatusBadge';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

const GRID_COLUMNS = '1.6fr 1.2fr 1fr 0.7fr 0.7fr 0.7fr';

export default async function MythologiePage() {
  const mythes = await getMythesAdmin();

  return (
    <div>
      <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Mythologie</h1>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 20px' }}>
        {mythes.length} mythes réels — aucun n&apos;a de narration audio à ce jour, les images ont été retrouvées et
        restent à uploader dans Supabase Storage pour celles encore manquantes.
      </p>

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
          <span>MYTHE</span>
          <span>PEUPLE</span>
          <span>ZONE</span>
          <span>RÉCIT</span>
          <span>IMAGE</span>
          <span>AUDIO</span>
        </div>

        {mythes.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>Aucun mythe pour l&apos;instant.</div>}

        {mythes.map((m) => (
          <div
            key={m.slug}
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
            <span style={{ fontWeight: 700 }}>{m.titre}</span>
            <span style={{ color: colors.textMuted, fontSize: 11 }}>{m.peuple}</span>
            <span style={{ color: colors.textMuted, fontSize: 11 }}>{m.zone}</span>
            <span>
              <StatusBadge label={m.aRecit ? 'Oui' : 'Absent'} tone={m.aRecit ? 'positive' : 'warning'} />
            </span>
            <span>
              <StatusBadge label={m.image_url ? 'Oui' : 'Absente'} tone={m.image_url ? 'positive' : 'warning'} />
            </span>
            <span>
              <StatusBadge label={m.narration_audio_url ? 'Oui' : 'Absente'} tone={m.narration_audio_url ? 'positive' : 'warning'} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
