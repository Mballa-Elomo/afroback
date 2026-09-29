import { getSupabaseAdmin } from '@/lib/supabase/server';
import { colors, fonts } from '@/lib/theme';
import { GratuitForm, OffrirForm } from './Forms';
import { retirerAbonnement, retirerContenuGratuit } from './actions';

export const dynamic = 'force-dynamic';

/**
 * Abonnements & contenus gratuits (cdc-acces-gratuit-abonnement.md, lot A).
 * - Offrir un abonnement à un compte existant (testeurs, partenaires), en
 *   attendant le paiement Mobile Money (Module 4).
 * - Liste des contenus gratuits pour les comptes Découverte, modifiable sans
 *   toucher au code (décision D7).
 * Si le script SQL n'a pas encore été exécuté, la page l'indique au lieu de planter.
 */

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: 'racines' | 'heritage';
  status: 'active' | 'cancelled' | 'expired';
  source: string;
  starts_at: string;
  ends_at: string | null;
  note: string | null;
}

function fmt(date: string | null) {
  if (!date) return 'Sans fin';
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const card: React.CSSProperties = {
  background: colors.panel,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 20,
  marginBottom: 22,
};

const h2: React.CSSProperties = { fontFamily: fonts.display, fontSize: 18, margin: '0 0 6px', color: colors.textHeading };

const TYPE_LABEL: Record<string, string> = { heros: 'Héros', mythe: 'Mythe', decouverte: 'Découverte' };

export default async function AbonnementsPage() {
  const supabase = getSupabaseAdmin();
  const [subsRes, gratuitsRes, usersRes] = await Promise.all([
    supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
    supabase.from('contenus_gratuits').select('type, slug').order('type'),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (subsRes.error || gratuitsRes.error) {
    return (
      <div style={card}>
        <h1 style={{ fontFamily: fonts.display, fontSize: 26, margin: '0 0 10px' }}>Abonnements</h1>
        <p style={{ color: colors.warning, margin: 0 }}>
          Le système d&apos;abonnement n&apos;est pas encore installé en base. Exécute
          <code style={{ margin: '0 4px' }}>app-mobile/mobile-app/supabase/schema-acces-abonnement.sql</code>
          dans le SQL Editor de Supabase, puis recharge cette page.
        </p>
      </div>
    );
  }

  const emails = new Map((usersRes.data?.users ?? []).map((u) => [u.id, u.email ?? '—']));
  const subs = (subsRes.data ?? []) as SubscriptionRow[];
  const now = Date.now();
  const isActive = (s: SubscriptionRow) => s.status === 'active' && (!s.ends_at || new Date(s.ends_at).getTime() > now);

  return (
    <div>
      <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Abonnements</h1>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 22px' }}>
        Le paiement Mobile Money n&apos;est pas encore branché : les abonnements sont offerts d&apos;ici. Un abonnement
        débloque tous les héros, mythes et lieux, ainsi que publier, commenter et vendre dans l&apos;app.
      </p>

      <section style={card}>
        <h2 style={h2}>Offrir un abonnement</h2>
        <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 14px' }}>
          La personne doit déjà avoir un compte dans l&apos;app. Effet immédiat à sa prochaine ouverture de l&apos;écran.
        </p>
        <OffrirForm />
      </section>

      <section style={card}>
        <h2 style={h2}>Abonnements ({subs.filter(isActive).length} actifs)</h2>
        {subs.length === 0 ? (
          <p style={{ color: colors.textMuted, fontSize: 13, margin: 0 }}>Aucun abonnement pour l&apos;instant.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: colors.textMuted, textAlign: 'left' }}>
                <th style={{ padding: '8px 6px' }}>Compte</th>
                <th style={{ padding: '8px 6px' }}>Forfait</th>
                <th style={{ padding: '8px 6px' }}>Origine</th>
                <th style={{ padding: '8px 6px' }}>Fin</th>
                <th style={{ padding: '8px 6px' }}>Statut</th>
                <th style={{ padding: '8px 6px' }} />
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => {
                const active = isActive(s);
                return (
                  <tr key={s.id} style={{ borderTop: `1px solid ${colors.borderHairline}` }}>
                    <td style={{ padding: '10px 6px' }}>
                      {emails.get(s.user_id) ?? s.user_id}
                      {s.note ? <div style={{ color: colors.textFaint, fontSize: 12 }}>{s.note}</div> : null}
                    </td>
                    <td style={{ padding: '10px 6px' }}>{s.plan === 'heritage' ? 'Héritage' : 'Racines'}</td>
                    <td style={{ padding: '10px 6px' }}>{s.source}</td>
                    <td style={{ padding: '10px 6px' }}>{fmt(s.ends_at)}</td>
                    <td style={{ padding: '10px 6px', color: active ? colors.positive : colors.textFaint }}>
                      {active ? 'Actif' : s.status === 'cancelled' ? 'Retiré' : 'Expiré'}
                    </td>
                    <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                      {active && (
                        <form action={retirerAbonnement.bind(null, s.id)}>
                          <button
                            type="submit"
                            style={{ background: 'none', border: `1px solid ${colors.borderStrong}`, color: colors.terracottaText, borderRadius: 999, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}
                          >
                            Retirer
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section style={card}>
        <h2 style={h2}>Contenus gratuits</h2>
        <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 14px' }}>
          Accessibles aux comptes gratuits et aux invités. Tout le reste porte un cadenas dans l&apos;app.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(gratuitsRes.data ?? []).map((g) => (
            <form
              key={`${g.type}:${g.slug}`}
              action={retirerContenuGratuit.bind(null, g.type, g.slug)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: colors.row, border: `1px solid ${colors.border}`, borderRadius: 999, padding: '6px 8px 6px 14px' }}
            >
              <span style={{ fontSize: 13 }}>
                <span style={{ color: colors.textMuted }}>{TYPE_LABEL[g.type] ?? g.type} · </span>
                {g.slug}
              </span>
              <button type="submit" title="Retirer de la liste gratuite" style={{ background: 'none', border: 'none', color: colors.terracottaText, cursor: 'pointer', fontSize: 14 }}>
                ✕
              </button>
            </form>
          ))}
        </div>
        <GratuitForm />
      </section>
    </div>
  );
}
