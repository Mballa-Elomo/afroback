import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMytheBySlugAdmin, mytheHasMedia } from '@/lib/data/mythologie';
import { getMytheEngagement, getMytheVideoChapterEngagement } from '@/lib/data/mythologieEngagement';
import { StatusBadge } from '@/components/StatusBadge';
import { MythologieMediaSlot } from '@/components/MythologieMediaSlot';
import { MytheMetadataForm } from '@/components/MytheMetadataForm';
import { MythologieLanguageContent } from '@/components/MythologieLanguageContent';
import { MytheTopActions } from '@/components/MytheTopActions';
import { IntegrityPanel } from '@/components/IntegrityPanel';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

const panelStyle: React.CSSProperties = { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18 };
const panelTitleStyle: React.CSSProperties = { fontFamily: fonts.display, fontSize: 12, letterSpacing: '.1em', color: colors.accentGoldSoft, marginBottom: 14 };

export default async function MytheDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mythe = await getMytheBySlugAdmin(slug);
  if (!mythe) notFound();

  const media = mytheHasMedia(mythe);
  const [engagement, videoChapterEngagement] = await Promise.all([getMytheEngagement(mythe.id), getMytheVideoChapterEngagement(mythe.id)]);

  return (
    <div>
      <Link href="/mythologie" style={{ fontSize: 13, color: colors.accentGold, display: 'inline-block', marginBottom: 14 }}>
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
          {mythe.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mythe.image_url} alt={mythe.titre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: fonts.mono, color: colors.textFaint }}>
              ∅ aucune image
            </span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: 0 }}>{mythe.titre}</h1>
            <StatusBadge label={mythe.statut_publication === 'publie' ? 'Publié' : 'Dépublié'} tone={mythe.statut_publication === 'publie' ? 'positive' : 'neutral'} />
          </div>
          <div style={{ fontSize: 12.5, color: colors.textMuted, margin: '6px 0 14px' }}>
            {mythe.peuple} · {mythe.zone} · {mythe.epoque}
          </div>
          <MytheTopActions slug={mythe.slug} aLaUne={mythe.a_la_une} publie={mythe.statut_publication === 'publie'} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={panelStyle}>
          <div style={panelTitleStyle}>MÉDIAS</div>
          <MythologieMediaSlot slug={mythe.slug} kind="photo" label="Photo" hint="JPG / PNG / WEBP" present={media.photo} />
        </div>
        <div style={panelStyle}>
          <div style={panelTitleStyle}>MÉTADONNÉES ÉDITORIALES</div>
          <MytheMetadataForm
            slug={mythe.slug}
            titre={mythe.titre}
            sousTitre={mythe.sous_titre}
            peuple={mythe.peuple}
            region={mythe.region}
            zone={mythe.zone}
            epoque={mythe.epoque}
            typeContenu={mythe.type_contenu}
            theme={mythe.theme}
            ordreAffichage={mythe.ordre_affichage}
          />
        </div>
      </div>

      <div style={{ ...panelStyle, marginBottom: 16 }}>
        <div style={panelTitleStyle}>CONTENU PAR LANGUE</div>
        <p style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.5, margin: '0 0 18px' }}>
          Choisis une langue : l&apos;audio, la vidéo des 4 chapitres et le récit de cette langue apparaissent
          ensemble. Le récit est produit par le pipeline éditorial (agent griot) — le corriger ici ne touche jamais
          les fichiers sources du pipeline.
        </p>
        <MythologieLanguageContent
          slug={mythe.slug}
          audio={{
            fr: { present: media.audioFr },
            en: { present: media.audioEn },
          }}
          videoChapitres={mythe.video_chapitres}
          videoEngagementRows={videoChapterEngagement}
          recitChapitresFr={mythe.recit_chapitres_fr}
          recitChapitresEn={mythe.recit_chapitres_en}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={panelStyle}>
          <div style={panelTitleStyle}>ENGAGEMENT GLOBAL</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <EngagementStat icon="📖" value={engagement.lectures_recit} label="lectures récit" />
            <EngagementStat icon="🎧" value={engagement.ecoutes_audio} label="écoutes audio" />
            <EngagementStat icon="👁" value={engagement.visionnages_video} label="visionnages vidéo" />
          </div>
          <p style={{ fontSize: 10.5, color: colors.textFaint, marginTop: 12, lineHeight: 1.5 }}>
            Chiffres réels, comptés à l&apos;ouverture de l&apos;écran côté app mobile.
          </p>
        </div>
        {mythe.sources.length > 0 && (
          <div style={panelStyle}>
            <div style={panelTitleStyle}>SOURCES</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: colors.textMuted, lineHeight: 1.7 }}>
              {mythe.sources.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ ...panelStyle, marginTop: 16 }}>
        <div style={panelTitleStyle}>INTÉGRITÉ DU CONTENU</div>
        <IntegrityPanel
          tableName="mythes"
          rowId={mythe.id}
          contenuHash={mythe.contenu_hash}
          contenuSignature={mythe.contenu_signature}
          integriteCalculeeLe={mythe.integrite_calculee_le}
        />
      </div>
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
