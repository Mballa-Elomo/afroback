import { getEcoleHerosMatrix, type FormatStatus } from '@/lib/data/ecoleHeros';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

const GRID_COLUMNS = '1.4fr repeat(4, 1fr)';

const DOT_STYLE: Record<FormatStatus, React.CSSProperties> = {
  pret: { background: 'rgba(90,150,90,.6)', border: '1px solid rgba(90,150,90,.8)' },
  vide: { background: '#2a1f14', border: `1px solid ${colors.border}` },
  // Niveau non mappé à ce héros (aucune ligne ecole_lecons) : distinct de
  // "vide" (à produire) — rien n'est même prévu à ce niveau pour ce héros.
  non_mappe: { background: 'transparent', border: '1px dashed rgba(240,195,107,.08)' },
};

export default async function EcoleHerosPage() {
  const rows = await getEcoleHerosMatrix();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: 0 }}>École des Héros — Production</h1>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 9,
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: 999,
            background: 'rgba(139,58,47,.18)',
            border: '1px solid rgba(139,58,47,.5)',
            color: colors.terracottaText,
          }}
        >
          CHANTIER VIDE
        </span>
      </div>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 20px' }}>
        {rows.length} héros × 4 niveaux × 4 formats (Lire / Écouter / Regarder / BD). Vert = prêt, case terne = à
        produire, case pointillée = niveau non prévu pour ce héros. Tableau de bord de production, rien n&apos;est
        modifiable ici — le contenu (texte adapté, narration enfant, vidéo, BD) reste à produire pour l&apos;ensemble
        de la matrice.
      </p>

      <div style={{ background: colors.panelDeep, border: `1px solid ${colors.border}`, borderRadius: 14, overflow: 'hidden', overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID_COLUMNS,
            gap: 8,
            padding: '11px 16px',
            background: colors.tableHeader,
            borderBottom: `1px solid ${colors.border}`,
            fontFamily: fonts.mono,
            fontSize: 9,
            letterSpacing: '.06em',
            color: colors.textMuted,
            minWidth: 640,
          }}
        >
          <span>HÉROS</span>
          <span>NIVEAU 1</span>
          <span>NIVEAU 2</span>
          <span>NIVEAU 3</span>
          <span>NIVEAU 4</span>
        </div>

        {rows.map((r) => (
          <div
            key={r.slug}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID_COLUMNS,
              gap: 8,
              padding: '10px 16px',
              borderBottom: `1px solid ${colors.borderHairline}`,
              alignItems: 'center',
              minWidth: 640,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 12 }}>{r.nom_affiche}</span>
            {r.cells.map((c) => (
              <div key={c.niveau} style={{ display: 'flex', gap: 3 }}>
                {c.formats.map((f) => (
                  <span key={f.key} title={`Niveau ${c.niveau} · ${f.label}`} style={{ width: 13, height: 13, borderRadius: 4, ...DOT_STYLE[f.status] }} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 11, color: colors.textMuted, flexWrap: 'wrap' }}>
        <span>📖 Lire · 🎧 Écouter · 🎬 Regarder · 🖼 BD</span>
        <Legend color="rgba(90,150,90,.6)" label="prêt" />
        <Legend color="#2a1f14" label="à produire" />
        <Legend color="transparent" dashed label="non prévu" />
      </div>
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 11, height: 11, borderRadius: 3, background: color, border: dashed ? '1px dashed rgba(240,195,107,.2)' : undefined }} />
      {label}
    </span>
  );
}
