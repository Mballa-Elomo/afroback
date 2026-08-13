import Link from 'next/link';
import { getDecouverteItemsAdmin, decouverteHasMedia, TYPE_LABELS } from '@/lib/data/decouverte';
import { decouverteEngagementFor, getDecouverteEngagementByItem, type DecouverteEngagement } from '@/lib/data/decouverteEngagement';
import { StatusBadge } from '@/components/StatusBadge';
import { DecouverteFeaturedStar } from '@/components/DecouverteFeaturedStar';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

// Même grille que /heros (heros/page.tsx) : vignette+titre, méta, médias, statut, à la une, engagement, chevron.
const GRID_COLUMNS = '2fr 1.2fr 0.9fr 0.85fr 0.7fr 1fr 40px';

function EngagementCell({ engagement }: { engagement: DecouverteEngagement }) {
  return (
    <div style={{ display: 'flex', gap: 9, fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted }} title="Consultations · Visionnages vidéo">
      <span>📖 {engagement.consultations}</span>
      <span>👁 {engagement.visionnages_video}</span>
    </div>
  );
}

export default async function DecouvertePage() {
  const [items, engagementByItem] = await Promise.all([getDecouverteItemsAdmin(), getDecouverteEngagementByItem()]);

  return (
    <div>
      <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Découverte</h1>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 20px' }}>
        {items.length} fiches — villages, coutumes, objets et rôles traditionnels. Contenu produit par l&apos;agent
        Découverte à partir de sources croisées ; cliquez une fiche pour la consulter et corriger son texte publié.
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
          <span>FICHE</span>
          <span>TYPE / PEUPLE</span>
          <span>MÉDIAS</span>
          <span>STATUT</span>
          <span>À LA UNE</span>
          <span>ENGAGEMENT</span>
          <span />
        </div>

        {items.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>Aucune fiche pour l&apos;instant.</div>}

        {items.map((it) => {
          const media = decouverteHasMedia(it);
          const engagement = decouverteEngagementFor(engagementByItem, it.id);
          return (
            <div
              key={it.slug}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLUMNS,
                gap: 12,
                padding: '12px 18px',
                borderBottom: `1px solid ${colors.borderHairline}`,
                alignItems: 'center',
              }}
            >
              <Link href={`/decouverte/${it.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, color: 'inherit' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    flex: 'none',
                    borderRadius: 9,
                    overflow: 'hidden',
                    position: 'relative',
                    background: colors.panel,
                    border: `1px solid ${it.image_url ? colors.borderStrong : 'rgba(139,58,47,.4)'}`,
                  }}
                >
                  {it.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image_url} alt={it.titre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontFamily: fonts.mono, color: colors.textFaint }}>
                      ∅
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.titre}</div>
                  <div style={{ fontSize: 10.5, color: colors.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.sous_titre}</div>
                </div>
              </Link>
              <div style={{ fontSize: 11.5, color: colors.textBody }}>
                {TYPE_LABELS[it.type] ?? it.type} · {it.region_ethnie}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <StatusBadge label="PHOTO" tone={media.photo ? 'positive' : 'warning'} />
                <StatusBadge label="VIDÉO" tone={media.video ? 'positive' : 'warning'} />
              </div>
              <div>
                <StatusBadge label={it.statut_publication === 'publie' ? 'Publiée' : 'Dépubliée'} tone={it.statut_publication === 'publie' ? 'positive' : 'neutral'} />
              </div>
              <DecouverteFeaturedStar slug={it.slug} on={it.a_la_une} publie={it.statut_publication === 'publie'} />
              <EngagementCell engagement={engagement} />
              <div style={{ textAlign: 'right' }}>
                <Link href={`/decouverte/${it.slug}`} style={{ color: colors.accentGold }}>
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
