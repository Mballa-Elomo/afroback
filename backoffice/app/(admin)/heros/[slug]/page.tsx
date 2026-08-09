import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHeroBySlugAdmin, heroHasMedia } from '@/lib/data/heros';
import { getAudioEngagementDetail, getHeroEngagement, getVideoChapterEngagement } from '@/lib/data/engagement';
import { StatusBadge } from '@/components/StatusBadge';
import { MediaUploadSlot } from '@/components/MediaUploadSlot';
import { HeroLanguageContent } from '@/components/HeroLanguageContent';
import { MetadataForm } from '@/components/MetadataForm';
import { HeroTopActions, ArchiveHeroButton } from '@/components/HeroDetailActions';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

const panelStyle: React.CSSProperties = { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18 };
const panelTitleStyle: React.CSSProperties = { fontFamily: fonts.display, fontSize: 12, letterSpacing: '.1em', color: colors.accentGoldSoft, marginBottom: 14 };

export default async function HeroDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hero = await getHeroBySlugAdmin(slug);
  if (!hero) notFound();

  const media = heroHasMedia(hero);
  // 3 lectures indépendantes (aucune ne dépend d'une autre) — en parallèle,
  // même principe que le reste des optimisations du 2026-08-06.
  const [engagement, audioDetail, videoChapterEngagement] = await Promise.all([
    getHeroEngagement(hero.id),
    getAudioEngagementDetail(hero.id),
    getVideoChapterEngagement(hero.id),
  ]);

  return (
    <div>
      <Link href="/heros" style={{ fontSize: 13, color: colors.accentGold, display: 'inline-block', marginBottom: 14 }}>
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
          {hero.image_carte_catalogue ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero.image_carte_catalogue} alt={hero.nom_affiche} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: fonts.mono, color: colors.textFaint }}>
              ∅ aucune photo
            </span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: 0 }}>{hero.nom_affiche}</h1>
            <StatusBadge label={hero.statut_publication === 'publie' ? 'Publié' : 'Dépublié'} tone={hero.statut_publication === 'publie' ? 'positive' : 'neutral'} />
          </div>
          <div style={{ fontSize: 12.5, color: colors.textMuted, margin: '6px 0 14px' }}>
            {hero.region} · {hero.epoque}
          </div>
          <HeroTopActions slug={hero.slug} aLaUne={hero.a_la_une} publie={hero.statut_publication === 'publie'} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={panelStyle}>
          <div style={panelTitleStyle}>MÉDIAS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MediaUploadSlot slug={hero.slug} kind="photo" label="Photo catalogue" hint="JPG / PNG / WEBP" present={media.photo} />
          </div>
          {/*
            Audio, vidéo par chapitre et récit ont déménagé dans le panneau
            "CONTENU PAR LANGUE" ci-dessous (HeroLanguageContent, ajouté le
            2026-08-09) : seule la photo catalogue n'est pas liée à une
            langue, elle reste ici. Slot "Vidéo (documentaire unique)" retiré
            le 2026-08-06 (demande de Yannick). Vérifié avant retrait : Martin
            Paul Samba était le seul héros encore dépendant de `video_url`
            (video_chapitres vide) — converti au système chapitres
            (video_url mis à null dans supabase/seed.sql, voir
            mobile-app/README.md). La colonne `video_url` et le MediaSlot
            `'video'` (lib/uploadMedia.ts) restent en base et dans le code —
            pas retirés, juste plus exposés dans cette UI — au cas où un
            futur héros ait un jour un documentaire unique non découpé en
            chapitres.
          */}
        </div>
        <div style={panelStyle}>
          <div style={panelTitleStyle}>MÉTADONNÉES ÉDITORIALES</div>
          <MetadataForm slug={hero.slug} theme={hero.theme} region={hero.region} ordreAffichage={hero.ordre_affichage} avertissement={hero.avertissement_lecture} />
        </div>
      </div>

      <div style={{ ...panelStyle, marginBottom: 16 }}>
        <div style={panelTitleStyle}>CONTENU PAR LANGUE</div>
        <p style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.5, margin: '0 0 18px' }}>
          Choisis une langue : l&apos;audio, la vidéo des 4 chapitres et le récit de cette langue apparaissent
          ensemble. Les récits sont produits par le pipeline éditorial (agents griot/storyboard) — les corriger ici
          ne touche jamais les fichiers sources du pipeline.
        </p>
        <HeroLanguageContent
          slug={hero.slug}
          audio={{
            fr: { present: media.audioFr, engagementCount: audioDetail.fr },
            en: { present: media.audioEn, engagementCount: audioDetail.en },
          }}
          videoChapitres={hero.video_chapitres ?? []}
          videoEngagementRows={videoChapterEngagement}
          chapitresStoryboard={hero.chapitres_storyboard ?? []}
          recitChapitresEn={hero.recit_chapitres_en}
          recitFr={hero.recit_fr_texte}
          recitEn={hero.recit_en_texte}
        />
      </div>

      <div style={{ ...panelStyle, marginBottom: 16 }}>
        <div style={panelTitleStyle}>ENGAGEMENT GLOBAL</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <EngagementStat icon="📖" value={engagement.lectures_recit} label="lectures récit" />
          <EngagementStat icon="🎧" value={engagement.ecoutes_audio} label="écoutes audio" />
          <EngagementStat icon="👁" value={engagement.visionnages_video} label="visionnages vidéo" />
        </div>
        <p style={{ fontSize: 10.5, color: colors.textFaint, marginTop: 12, lineHeight: 1.5 }}>
          Chiffres réels, comptés à l&apos;ouverture de l&apos;écran côté app mobile — uniquement quand du vrai
          contenu est montré (jamais un atterrissage sur un état &quot;bientôt disponible&quot;). Pas de compteur
          &quot;likes&quot; : aucun système de réaction n&apos;existe dans le modèle de données. Détail par média :
          par langue dans le panneau ci-dessus.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 20 }}>
        <ArchiveHeroButton slug={hero.slug} nom={hero.nom_affiche} />
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
