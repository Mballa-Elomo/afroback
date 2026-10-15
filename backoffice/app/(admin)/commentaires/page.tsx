import { getSupabaseAdmin } from '@/lib/supabase/server';
import { colors, fonts } from '@/lib/theme';
import { masquerCommentaire, retablirCommentaire } from './actions';

export const dynamic = 'force-dynamic';

/**
 * Modération des commentaires (cdc-commentaires.md, D4, 2026-09-30) :
 * commentaires signalés ou masqués par le filtre en premier, puis les plus
 * récents. Masquer / rétablir. Si le script SQL n'est pas exécuté, la page
 * l'indique au lieu de planter.
 */

interface Row {
  id: string;
  content_type: 'heros' | 'mythe' | 'decouverte';
  content_slug: string;
  parent_id: string | null;
  texte: string;
  statut: string;
  like_count: number;
  reply_count: number;
  nb_signalements: number;
  created_at: string;
  edited_at: string | null;
  author: { pseudo: string } | null;
}

const TYPE_LABEL: Record<string, string> = { heros: 'Héros', mythe: 'Mythe', decouverte: 'Découverte' };
const STATUT: Record<string, { label: string; color: string }> = {
  publie: { label: 'Publié', color: colors.positive },
  masque_filtre_auto: { label: 'Masqué (filtre)', color: colors.warning },
  masque_signalements: { label: 'Masqué (3 signalements)', color: colors.warning },
  masque_moderation: { label: 'Masqué (équipe)', color: colors.textMuted },
  supprime: { label: "Supprimé par l'auteur", color: colors.textFaint },
};

const card: React.CSSProperties = {
  background: colors.panel,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 20,
  marginBottom: 22,
};

const btn: React.CSSProperties = {
  background: 'none',
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: 999,
  padding: '5px 12px',
  cursor: 'pointer',
  fontSize: 12,
};

function fmt(date: string) {
  return new Date(date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default async function CommentairesPage() {
  const supabase = getSupabaseAdmin();
  const [aTraiterRes, recentsRes] = await Promise.all([
    supabase
      .from('content_comments')
      .select('*, author:community_profiles(pseudo)')
      .or('nb_signalements.gt.0,statut.eq.masque_filtre_auto,statut.eq.masque_signalements')
      .neq('statut', 'supprime')
      .order('nb_signalements', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('content_comments')
      .select('*, author:community_profiles(pseudo)')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  if (aTraiterRes.error || recentsRes.error) {
    return (
      <div style={card}>
        <h1 style={{ fontFamily: fonts.display, fontSize: 26, margin: '0 0 10px' }}>Commentaires</h1>
        <p style={{ color: colors.warning, margin: 0 }}>
          Les commentaires ne sont pas encore installés en base. Exécute
          <code style={{ margin: '0 4px' }}>app-mobile/mobile-app/supabase/schema-commentaires.sql</code>
          dans le SQL Editor de Supabase, puis recharge cette page.
        </p>
      </div>
    );
  }

  const aTraiter = (aTraiterRes.data ?? []) as Row[];
  const recents = (recentsRes.data ?? []) as Row[];

  return (
    <div>
      <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Commentaires</h1>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 22px' }}>
        Commentaires laissés sous les héros, mythes et fiches Découverte, dans l&apos;app et sur le site. Les publications de la Communauté se modèrent dans le module Communauté. Un commentaire est masqué
        automatiquement s&apos;il contient un terme interdit ou reçoit 3 signalements. Masquer le retire de l&apos;app ;
        rétablir le republie et remet ses signalements à zéro.
      </p>

      <section style={card}>
        <h2 style={{ fontFamily: fonts.display, fontSize: 18, margin: '0 0 12px', color: colors.textHeading }}>
          À traiter <span style={{ color: colors.textMuted, fontSize: 14 }}>({aTraiter.length})</span>
        </h2>
        {aTraiter.length === 0 ? (
          <p style={{ color: colors.textMuted, margin: 0, fontSize: 13 }}>Aucun commentaire signalé ou masqué. 👌</p>
        ) : (
          <Table rows={aTraiter} />
        )}
      </section>

      <section style={card}>
        <h2 style={{ fontFamily: fonts.display, fontSize: 18, margin: '0 0 12px', color: colors.textHeading }}>
          Les plus récents <span style={{ color: colors.textMuted, fontSize: 14 }}>({recents.length})</span>
        </h2>
        {recents.length === 0 ? (
          <p style={{ color: colors.textMuted, margin: 0, fontSize: 13 }}>Aucun commentaire pour l&apos;instant.</p>
        ) : (
          <Table rows={recents} />
        )}
      </section>
    </div>
  );
}

function Table({ rows }: { rows: Row[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ color: colors.textMuted, textAlign: 'left' }}>
          <th style={{ padding: '8px 6px' }}>Date</th>
          <th style={{ padding: '8px 6px' }}>Contenu</th>
          <th style={{ padding: '8px 6px' }}>Auteur</th>
          <th style={{ padding: '8px 6px', width: '40%' }}>Commentaire</th>
          <th style={{ padding: '8px 6px' }}>👍 / ⚑</th>
          <th style={{ padding: '8px 6px' }}>Statut</th>
          <th style={{ padding: '8px 6px' }} />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const st = STATUT[r.statut] ?? { label: r.statut, color: colors.textMuted };
          const visible = r.statut === 'publie';
          return (
            <tr key={r.id} style={{ borderTop: `1px solid ${colors.border}`, verticalAlign: 'top' }}>
              <td style={{ padding: '10px 6px', color: colors.textMuted, whiteSpace: 'nowrap' }}>{fmt(r.created_at)}</td>
              <td style={{ padding: '10px 6px' }}>
                {TYPE_LABEL[r.content_type]}
                <div style={{ color: colors.textMuted, fontSize: 12 }}>{r.content_slug}</div>
              </td>
              <td style={{ padding: '10px 6px' }}>@{r.author?.pseudo ?? '—'}</td>
              <td style={{ padding: '10px 6px', color: colors.textBody, whiteSpace: 'pre-wrap' }}>
                {r.parent_id && <span style={{ color: colors.textMuted }}>↳ réponse · </span>}
                {r.texte}
                {r.edited_at && <span style={{ color: colors.textMuted }}> (modifié)</span>}
              </td>
              <td style={{ padding: '10px 6px', whiteSpace: 'nowrap' }}>
                {r.like_count} / <span style={{ color: r.nb_signalements > 0 ? colors.warning : undefined }}>{r.nb_signalements}</span>
              </td>
              <td style={{ padding: '10px 6px', color: st.color, whiteSpace: 'nowrap' }}>{st.label}</td>
              <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                {r.statut !== 'supprime' &&
                  (visible ? (
                    <form action={masquerCommentaire.bind(null, r.id)}>
                      <button type="submit" style={{ ...btn, color: colors.terracottaText }}>
                        Masquer
                      </button>
                    </form>
                  ) : (
                    <form action={retablirCommentaire.bind(null, r.id)}>
                      <button type="submit" style={{ ...btn, color: colors.positive }}>
                        Rétablir
                      </button>
                    </form>
                  ))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
