import Link from 'next/link';
import { getMythesAdmin, mytheHasMedia } from '@/lib/data/mythologie';
import { getMytheEngagementByMythe, mytheEngagementFor, type MytheEngagement } from '@/lib/data/mythologieEngagement';
import { StatusBadge } from '@/components/StatusBadge';
import { MytheFeaturedStar } from '@/components/MytheFeaturedStar';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

// Même grille que /heros (heros/page.tsx) : vignette+titre, méta, médias, statut, à la une, engagement, chevron.
const GRID_COLUMNS = '2fr 1.2fr 1.1fr 0.85fr 0.7fr 1.2fr 40px';

const MEDIA_BADGES: { key: keyof ReturnType<typeof mytheHasMedia>; label: string }[] = [
  { key: 'photo', label: 'IMG' },
  { key: 'audioFr', label: '🔊FR' },
  { key: 'audioEn', label: '🔊EN' },
  { key: 'video', label: '🎬' },
];

function EngagementCell({ engagement }: { engagement: MytheEngagement }) {
  return (
    <div style={{ display: 'flex', gap: 9, fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted }} title="Lectures récit · Écoutes audio · Visionnages vidéo">
      <span>📖 {engagement.lectures_recit}</span>
      <span>🎧 {engagement.ecoutes_audio}</span>
      <span>👁 {engagement.visionnages_video}</span>
    </div>
  );
}

export default async function MythologiePage() {
  const [mythes, engagementByMythe] = await Promise.all([getMythesAdmin(), getMytheEngagementByMythe()]);

  return (
    <div>
      <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Mythologie</h1>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 20px' }}>
        {mythes.length} mythes réels — cliquez un mythe pour consulter et corriger ses métadonnées, son récit et ses
        médias par langue.
      </p>

      <div style={{ background: colors.panelDeep, border: `1px solid ${colors.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID_COLUMNS,
            gap: 12,
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
          <span>PEUPLE / ZONE</span>
          <span>MÉDIAS</span>
          <span>STATUT</span>
          <span>À LA UNE</span>
          <span>ENGAGEMENT</span>
          <span />
        </div>

        {mythes.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>Aucun mythe pour l&apos;instant.</div>}

        {mythes.map((m) => {
          const media = mytheHasMedia(m);
          const engagement = mytheEngagementFor(engagementByMythe, m.id);
          return (
            <div
              key={m.slug}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLUMNS,
                gap: 12,
                padding: '12px 18px',
                borderBottom: `1px solid ${colors.borderHairline}`,
                alignItems: 'center',
              }}
            >
              <Link href={`/mythologie/${m.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, color: 'inherit' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    flex: 'none',
                    borderRadius: 9,
                    overflow: 'hidden',
                    position: 'relative',
                    background: colors.panel,
                    border: `1px solid ${m.image_url ? colors.borderStrong : 'rgba(139,58,47,.4)'}`,
                  }}
                >
                  {m.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image_url} alt={m.titre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontFamily: fonts.mono, color: colors.textFaint }}>
                      ∅
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.titre}</div>
              </Link>
              <div style={{ fontSize: 11.5, color: colors.textBody }}>
                {m.peuple.split(/[,(]/)[0].trim()} · {m.zone}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {MEDIA_BADGES.map((b) => (
                  <StatusBadge key={b.key} label={b.label} tone={media[b.key] ? 'positive' : 'warning'} />
                ))}
              </div>
              <div>
                <StatusBadge label={m.statut_publication === 'publie' ? 'Publié' : 'Dépublié'} tone={m.statut_publication === 'publie' ? 'positive' : 'neutral'} />
              </div>
              <MytheFeaturedStar slug={m.slug} on={m.a_la_une} publie={m.statut_publication === 'publie'} />
              <EngagementCell engagement={engagement} />
              <div style={{ textAlign: 'right' }}>
                <Link href={`/mythologie/${m.slug}`} style={{ color: colors.accentGold }}>
                  ›
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
