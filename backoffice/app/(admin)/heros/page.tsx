import Link from 'next/link';
import { getHeroesAdmin, heroHasMedia, heroIsComplete, type HerosListItem } from '@/lib/data/heros';
import { engagementFor, getEngagementByHero, type HeroEngagement } from '@/lib/data/engagement';
import { StatusBadge } from '@/components/StatusBadge';
import { FeaturedStar } from '@/components/FeaturedStar';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

type Filtre = 'tous' | 'incomplets' | 'a-la-une';

function matchesFilter(h: HerosListItem, filtre: Filtre): boolean {
  if (filtre === 'incomplets') return !heroIsComplete(h);
  if (filtre === 'a-la-une') return h.a_la_une;
  return true;
}

function matchesQuery(h: HerosListItem, q: string): boolean {
  const needle = q.toLowerCase();
  return h.nom_affiche.toLowerCase().includes(needle) || h.region.toLowerCase().includes(needle) || h.epoque.toLowerCase().includes(needle);
}

const MEDIA_BADGES: { key: keyof ReturnType<typeof heroHasMedia>; label: string }[] = [
  { key: 'recitFr', label: 'FR' },
  { key: 'recitEn', label: 'EN' },
  { key: 'storyboard', label: 'SB' },
  { key: 'audioFr', label: '🔊FR' },
  { key: 'video', label: '🎬' },
];

// Réutilisée pour l'en-tête et chaque ligne — une seule source de vérité pour
// les colonnes, ajoutée pour la colonne ENGAGEMENT (2026-08-06).
const GRID_COLUMNS = '2fr 0.9fr 1.2fr 0.85fr 0.7fr 1.2fr 40px';

/**
 * Indicateurs compacts d'engagement pour une ligne de liste — 3 chiffres,
 * pas le panneau complet de la fiche détail (voir ENGAGEMENT GLOBAL sur
 * `/heros/[slug]`). 0 réel affiché comme les autres chiffres, jamais masqué.
 */
function EngagementCell({ engagement }: { engagement: HeroEngagement }) {
  return (
    <div style={{ display: 'flex', gap: 9, fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted }} title="Lectures récit · Écoutes audio · Visionnages vidéo">
      <span>📖 {engagement.lectures_recit}</span>
      <span>🎧 {engagement.ecoutes_audio}</span>
      <span>👁 {engagement.visionnages_video}</span>
    </div>
  );
}

export default async function HerosListPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const filtre = (sp.filtre === 'incomplets' || sp.filtre === 'a-la-une' ? sp.filtre : 'tous') as Filtre;
  const q = sp.q ?? '';

  // Les deux requêtes sont indépendantes (aucune ne dépend du résultat de
  // l'autre) — lancées en parallèle plutôt que séquentiellement, comme le
  // reste des optimisations de ce même chantier (voir "Lenteur — deuxième
  // passe" dans le README).
  const [heroes, engagementByHero] = await Promise.all([getHeroesAdmin(), getEngagementByHero()]);
  const filtered = heroes.filter((h) => matchesFilter(h, filtre) && (!q || matchesQuery(h, q)));

  const filters: { id: Filtre; label: string }[] = [
    { id: 'tous', label: 'Tous' },
    { id: 'incomplets', label: 'Incomplets' },
    { id: 'a-la-une', label: 'À la une' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Histoires &amp; Héros</h1>
          <p style={{ color: colors.textMuted, fontSize: 13, margin: 0 }}>
            {heroes.length} figures · pilotez publication, médias et mise en avant.
            {q && ` Recherche : « ${q} ».`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted, alignSelf: 'center', marginRight: 4 }}>Filtrer :</span>
          {filters.map((f) => (
            <Link
              key={f.id}
              href={f.id === 'tous' ? '/heros' : `/heros?filtre=${f.id}`}
              style={{
                fontSize: 11.5,
                padding: '7px 12px',
                borderRadius: 8,
                ...(filtre === f.id
                  ? { background: `linear-gradient(135deg, ${colors.accentGoldBright}, ${colors.terracotta})`, color: colors.ctaTextOnGold, fontWeight: 700 }
                  : { border: `1px solid ${colors.border}`, color: colors.textBody }),
              }}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

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
          <span>HÉROS</span>
          <span>ÉPOQUE</span>
          <span>MÉDIAS</span>
          <span>STATUT</span>
          <span>À LA UNE</span>
          <span>ENGAGEMENT</span>
          <span />
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>Aucun héros ne correspond.</div>
        )}

        {filtered.map((h) => {
          const media = heroHasMedia(h);
          const engagement = engagementFor(engagementByHero, h.id);
          return (
            <div
              key={h.slug}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLUMNS,
                gap: 12,
                padding: '12px 18px',
                borderBottom: `1px solid ${colors.borderHairline}`,
                alignItems: 'center',
              }}
            >
              <Link href={`/heros/${h.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, color: 'inherit' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    flex: 'none',
                    borderRadius: 9,
                    overflow: 'hidden',
                    position: 'relative',
                    background: colors.panel,
                    border: `1px solid ${h.image_carte_catalogue ? colors.borderStrong : 'rgba(139,58,47,.4)'}`,
                  }}
                >
                  {h.image_carte_catalogue ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.image_carte_catalogue} alt={h.nom_affiche} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontFamily: fonts.mono, color: colors.textFaint }}>
                      ∅
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.nom_affiche}</div>
                  <div style={{ fontSize: 10.5, color: colors.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.region}</div>
                </div>
              </Link>
              <div style={{ fontSize: 11.5, color: colors.textBody }}>{h.epoque}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {MEDIA_BADGES.map((m) => (
                  <StatusBadge key={m.key} label={m.label} tone={media[m.key] ? 'positive' : 'warning'} />
                ))}
              </div>
              <div>
                <StatusBadge label={h.statut_publication === 'publie' ? 'Publié' : 'Dépublié'} tone={h.statut_publication === 'publie' ? 'positive' : 'neutral'} />
              </div>
              <FeaturedStar slug={h.slug} on={h.a_la_une} publie={h.statut_publication === 'publie'} />
              <EngagementCell engagement={engagement} />
              <div style={{ textAlign: 'right' }}>
                <Link href={`/heros/${h.slug}`} style={{ color: colors.accentGold }}>
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
