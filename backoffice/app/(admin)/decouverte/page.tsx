import { getDecouverteItemsAdmin } from '@/lib/data/decouverte';
import { StatusBadge } from '@/components/StatusBadge';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

const GRID_COLUMNS = '2fr 1fr 1fr 0.8fr 0.8fr';

const TYPE_LABELS: Record<string, string> = {
  village: 'Village',
  coutume: 'Coutume',
  objet: 'Objet',
  personnage: 'Personnage',
  fait: 'Fait',
};

export default async function DecouvertePage() {
  const items = await getDecouverteItemsAdmin();

  return (
    <div>
      <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Découverte</h1>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 20px' }}>
        {items.length} fiches — villages, coutumes, objets et rôles traditionnels. Contenu produit par l&apos;agent
        Découverte à partir de sources croisées, lecture seule ici. Chaque affirmation sensible porte un statut
        (attesté / tradition orale / débattu) consultable dans la fiche source, pas encore affiché dans ce tableau.
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
          <span>TITRE</span>
          <span>TYPE</span>
          <span>PEUPLE / RÉGION</span>
          <span>IMAGE</span>
          <span>STATUT</span>
        </div>

        {items.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>Aucune fiche pour l&apos;instant.</div>}

        {items.map((it) => (
          <div
            key={it.slug}
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
            <div>
              <div style={{ fontWeight: 700 }}>{it.titre}</div>
              <div style={{ fontSize: 10.5, color: colors.textMuted }}>{it.sous_titre}</div>
            </div>
            <span style={{ color: colors.textBody, fontSize: 11 }}>{TYPE_LABELS[it.type] ?? it.type}</span>
            <span style={{ color: colors.textMuted, fontSize: 11 }}>
              {it.pays} · {it.region_ethnie}
            </span>
            <span>
              <StatusBadge label={it.image_url ? 'Oui' : 'Absente'} tone={it.image_url ? 'positive' : 'warning'} />
            </span>
            <span>
              <StatusBadge label={it.statut_contenu} tone="neutral" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
