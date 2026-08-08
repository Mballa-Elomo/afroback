import { getHeroesAdmin } from '@/lib/data/heros';
import { listMediaFiles } from '@/lib/data/media';
import { GenericMediaUpload } from '@/components/GenericMediaUpload';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

export default async function MediaLibraryPage() {
  const [heroes, files] = await Promise.all([getHeroesAdmin(), listMediaFiles()]);

  return (
    <div>
      <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Bibliothèque médias</h1>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 20px' }}>
        Dépose un fichier, il se rattache directement à une fiche héros — sans passer par le code.
      </p>

      <GenericMediaUpload heroes={heroes.map((h) => ({ slug: h.slug, nom_affiche: h.nom_affiche }))} />

      <div style={{ background: colors.panelDeep, border: `1px solid ${colors.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 0.8fr 1.4fr 0.8fr',
            gap: 10,
            padding: '11px 18px',
            background: colors.tableHeader,
            fontFamily: fonts.mono,
            fontSize: 9,
            letterSpacing: '.08em',
            color: colors.textMuted,
          }}
        >
          <span>FICHIER</span>
          <span>TYPE</span>
          <span>RATTACHÉ À</span>
          <span>TAILLE</span>
        </div>
        {files.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>Aucun fichier dans le bucket pour l&apos;instant.</div>}
        {files.map((f) => (
          <div
            key={f.path}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 0.8fr 1.4fr 0.8fr',
              gap: 10,
              padding: '12px 18px',
              borderBottom: `1px solid ${colors.borderHairline}`,
              alignItems: 'center',
              fontSize: 12,
            }}
          >
            <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
            <span style={{ color: colors.textBody, fontSize: 11 }}>{f.type}</span>
            <span style={{ color: f.attachedTo === 'Non rattaché' ? colors.terracottaTextAlt : colors.textMuted, fontSize: 11 }}>{f.attachedTo}</span>
            <span style={{ color: colors.textMuted, fontSize: 11 }}>{f.sizeLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
