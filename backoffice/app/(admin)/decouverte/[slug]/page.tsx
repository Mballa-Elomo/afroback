import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDecouverteItemBySlugAdmin, decouverteHasMedia, TYPE_LABELS } from '@/lib/data/decouverte';
import { getDecouverteEngagement } from '@/lib/data/decouverteEngagement';
import { StatusBadge } from '@/components/StatusBadge';
import { DecouvertePhotoSlot } from '@/components/DecouvertePhotoSlot';
import { DecouverteMetadataForm } from '@/components/DecouverteMetadataForm';
import { DecouverteLanguageContent } from '@/components/DecouverteLanguageContent';
import { DecouverteTopActions } from '@/components/DecouverteTopActions';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

const panelStyle: React.CSSProperties = { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18 };
const panelTitleStyle: React.CSSProperties = { fontFamily: fonts.display, fontSize: 12, letterSpacing: '.1em', color: colors.accentGoldSoft, marginBottom: 14 };

const STATUT_LABELS: Record<string, string> = { atteste: 'Attesté', tradition_orale: 'Tradition orale', debattu: 'Débattu' };
const STATUT_TONE: Record<string, 'positive' | 'warning' | 'neutral'> = { atteste: 'positive', tradition_orale: 'neutral', debattu: 'warning' };

export default async function DecouverteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDecouverteItemBySlugAdmin(slug);
  if (!item) notFound();

  const media = decouverteHasMedia(item);
  const engagement = await getDecouverteEngagement(item.id);

  return (
    <div>
      <Link href="/decouverte" style={{ fontSize: 13, color: colors.accentGold, display: 'inline-block', marginBottom: 14 }}>
        ‹ Retour à la liste
      </Link>

      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', marginBottom: 22 }}>
        <div
          style={{
            width: 120,
            height: 120,
            flex: 'none',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            background: colors.panelDeep,
            border: `1px solid ${colors.border}`,
          }}
        >
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.titre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: fonts.mono, color: colors.textFaint }}>
              ∅ aucune image
            </span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: 0 }}>{item.titre}</h1>
            <StatusBadge label={TYPE_LABELS[item.type] ?? item.type} tone="gold" />
            <StatusBadge label={item.statut_publication === 'publie' ? 'Publiée' : 'Dépubliée'} tone={item.statut_publication === 'publie' ? 'positive' : 'neutral'} />
          </div>
          <div style={{ fontSize: 12.5, color: colors.textMuted, margin: '6px 0 4px' }}>{item.sous_titre}</div>
          <div style={{ fontSize: 11.5, color: colors.textFaint, marginBottom: 14 }}>
            {item.pays} · {item.region_ethnie}
          </div>
          <DecouverteTopActions slug={item.slug} aLaUne={item.a_la_une} publie={item.statut_publication === 'publie'} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={panelStyle}>
          <div style={panelTitleStyle}>MÉDIAS</div>
          <DecouvertePhotoSlot slug={item.slug} present={media.photo} />
        </div>
        <div style={panelStyle}>
          <div style={panelTitleStyle}>MÉTADONNÉES ÉDITORIALES</div>
          <DecouverteMetadataForm
            slug={item.slug}
            titre={item.titre}
            sousTitre={item.sous_titre}
            pays={item.pays}
            regionEthnie={item.region_ethnie}
            ordreAffichage={item.ordre_affichage}
          />
        </div>
      </div>

      <div style={{ ...panelStyle, marginBottom: 16 }}>
        <div style={panelTitleStyle}>CONTENU PAR LANGUE</div>
        <p style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.5, margin: '0 0 18px' }}>
          Le texte est produit par l&apos;agent Découverte à partir de sources croisées. Le corriger ici ne touche
          jamais la fiche source du pipeline.
        </p>
        <DecouverteLanguageContent
          slug={item.slug}
          contenuFr={item.contenu_fr_texte}
          contenuEn={item.contenu_en_texte}
          videos={item.videos}
          videoEngagement={{ fr: engagement.visionnages_video_fr, en: engagement.visionnages_video_en }}
        />
      </div>

      {item.statut_fait_legende.length > 0 && (
        <div style={{ ...panelStyle, marginBottom: 16 }}>
          <div style={panelTitleStyle}>FIABILITÉ DES AFFIRMATIONS</div>
          <p style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.5, margin: '0 0 14px' }}>
            Étiquetage fait par l&apos;agent Découverte, en lecture seule ici (hors périmètre de la correction
            éditoriale de cette fiche).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {item.statut_fait_legende.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: colors.textBody }}>
                <StatusBadge label={STATUT_LABELS[f.statut] ?? f.statut} tone={STATUT_TONE[f.statut] ?? 'neutral'} />
                <span style={{ flex: 1, lineHeight: 1.5 }}>{f.affirmation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={panelStyle}>
          <div style={panelTitleStyle}>ENGAGEMENT GLOBAL</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <EngagementStat icon="📖" value={engagement.consultations} label="consultations" />
            <EngagementStat icon="👁" value={engagement.visionnages_video} label="visionnages vidéo" />
          </div>
          <p style={{ fontSize: 10.5, color: colors.textFaint, marginTop: 12, lineHeight: 1.5 }}>
            Chiffres réels, comptés à l&apos;ouverture de l&apos;écran côté app mobile.
          </p>
        </div>
        {item.sources.length > 0 && (
          <div style={panelStyle}>
            <div style={panelTitleStyle}>SOURCES</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: colors.textMuted, lineHeight: 1.7 }}>
              {item.sources.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {(item.heros_lies.length > 0 || item.items_lies.length > 0) && (
        <div style={panelStyle}>
          <div style={panelTitleStyle}>LIENS</div>
          {item.heros_lies.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Héros liés</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {item.heros_lies.map((s) => (
                  <Link key={s} href={`/heros/${s}`} style={{ fontSize: 11 }}>
                    <StatusBadge label={s} tone="neutral" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {item.items_lies.length > 0 && (
            <div>
              <div style={{ fontSize: 10.5, color: colors.textMuted, marginBottom: 5 }}>Fiches liées</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {item.items_lies.map((s) => (
                  <Link key={s} href={`/decouverte/${s}`} style={{ fontSize: 11 }}>
                    <StatusBadge label={s} tone="neutral" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EngagementStat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div style={{ background: colors.panelDeep, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 15 }}>
      <div style={{ fontSize: 19 }}>{icon}</div>
      <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: colors.textHeading, margin: '6px 0 2px' }}>
        {value.toLocaleString('fr-FR')}
      </div>
      <div style={{ fontSize: 10, color: colors.textFaint }}>{label}</div>
    </div>
  );
}
