import Link from 'next/link';
import { getHeroesAdmin, heroHasMedia } from '@/lib/data/heros';
import { getPendingReportsCount, getUsersOverview } from '@/lib/data/overview';
import { getTotalEngagement } from '@/lib/data/engagement';
import { colors, fonts } from '@/lib/theme';

export const dynamic = 'force-dynamic';

const FORFAIT_LABELS: Record<string, string> = { decouverte: 'Découverte', racines: 'Racines', heritage: 'Héritage', inconnu: 'Non renseigné' };
const FORFAIT_COLORS: Record<string, string> = { decouverte: '#6f5f4d', racines: '#C98A3D', heritage: '#F0C36B', inconnu: '#5f5140' };

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: `linear-gradient(160deg, ${colors.row}, ${colors.panelDeep})`, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 18 }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '.1em', color: colors.accentGoldAlt }}>{label}</div>
      <div style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 700, color: colors.textHeading, margin: '8px 0 2px' }}>{value}</div>
      <div style={{ fontSize: 11, color: colors.textMuted }}>{sub}</div>
    </div>
  );
}

export default async function DashboardPage() {
  // 4 lectures indépendantes (aucune ne dépend du résultat d'une autre) —
  // lancées en parallèle plutôt que séquentiellement. Retour de lenteur de
  // Yannick le 2026-08-06 (Dashboard à 5,5s) : ces 4 appels s'additionnaient
  // avant, chacun un aller-retour réseau Supabase/API admin distinct.
  const [heroes, usersOverview, pendingReports, engagement] = await Promise.all([
    getHeroesAdmin(),
    getUsersOverview(),
    getPendingReportsCount(),
    getTotalEngagement(),
  ]);

  const total = heroes.length;
  const pubCount = heroes.filter((h) => h.statut_publication === 'publie').length;
  const incompleteHeroes = heroes.filter((h) => {
    const m = heroHasMedia(h);
    return !(m.recitFr && m.photo && (m.audioFr || m.video));
  });

  const mediaKeys: { key: keyof ReturnType<typeof heroHasMedia>; label: string }[] = [
    { key: 'recitFr', label: 'Récit FR' },
    { key: 'recitEn', label: 'Récit EN' },
    { key: 'audioFr', label: 'Audio FR' },
    { key: 'video', label: 'Vidéo' },
    { key: 'photo', label: 'Photo' },
  ];
  const prodBars = mediaKeys.map(({ key, label }) => {
    const count = heroes.filter((h) => heroHasMedia(h)[key]).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { label, count, pct };
  });

  const forfaitEntries = usersOverview ? Object.entries(usersOverview.parForfait).sort((a, b) => b[1] - a[1]) : [];

  const abonnesPayants = usersOverview
    ? (usersOverview.parForfait.racines ?? 0) + (usersOverview.parForfait.heritage ?? 0)
    : null;

  return (
    <div>
      <h1 style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, margin: '0 0 4px' }}>Tableau de bord</h1>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: '0 0 24px' }}>Salle de contrôle d&apos;AFROBACK — vue d&apos;ensemble et actions prioritaires.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <Kpi label="HÉROS PUBLIÉS" value={`${pubCount}/${total}`} sub="catalogue visible" />
        <Kpi label="UTILISATEURS" value={usersOverview ? String(usersOverview.total) : '—'} sub="comptes app mobile" />
        <Kpi label="ABONNÉS PAYANTS" value={abonnesPayants !== null ? String(abonnesPayants) : '—'} sub="Racines + Héritage" />
        <Kpi label="SIGNALEMENTS" value={pendingReports !== null ? String(pendingReports) : '—'} sub="en attente de revue" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontFamily: fonts.display, fontSize: 13, letterSpacing: '.1em', color: colors.accentGoldSoft, marginBottom: 16 }}>
            ÉTAT DE PRODUCTION DES HÉROS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {prodBars.map((b) => (
              <div key={b.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: colors.textBody }}>{b.label}</span>
                  <span style={{ fontFamily: fonts.mono, color: colors.accentGold }}>
                    {b.count}/{total}
                  </span>
                </div>
                <div style={{ height: 7, borderRadius: 9, background: '#2a1f14' }}>
                  <div style={{ height: '100%', borderRadius: 9, background: `linear-gradient(90deg, ${colors.accentGoldBright}, #8B5A2B)`, width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontFamily: fonts.display, fontSize: 13, letterSpacing: '.1em', color: colors.accentGoldSoft, marginBottom: 16 }}>
            RÉPARTITION PAR FORFAIT
          </div>
          {forfaitEntries.length === 0 ? (
            <div style={{ fontSize: 12.5, color: colors.textFaint }}>Indisponible pour l&apos;instant.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {forfaitEntries.map(([key, count]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: FORFAIT_COLORS[key] ?? '#6f5f4d', flex: 'none' }} />
                  <span style={{ flex: 1, fontSize: 13, color: colors.textBody }}>{FORFAIT_LABELS[key] ?? key}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.textHeading }}>{count}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted, width: 40, textAlign: 'right' }}>
                    {usersOverview && usersOverview.total > 0 ? `${Math.round((count / usersOverview.total) * 100)}%` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: fonts.display, fontSize: 13, letterSpacing: '.1em', color: colors.accentGoldSoft, marginBottom: 16 }}>
          ENGAGEMENT GLOBAL — TOUS HÉROS CONFONDUS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Kpi label="LECTURES RÉCIT" value={engagement.lectures_recit.toLocaleString('fr-FR')} sub="ouvertures réelles, tous héros" />
          <Kpi label="ÉCOUTES AUDIO" value={engagement.ecoutes_audio.toLocaleString('fr-FR')} sub="ouvertures réelles, tous héros" />
          <Kpi label="VISIONNAGES VIDÉO" value={engagement.visionnages_video.toLocaleString('fr-FR')} sub="ouvertures réelles, tous héros" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: colors.panel, border: '1px solid rgba(160,82,45,.35)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontFamily: fonts.display, fontSize: 13, letterSpacing: '.1em', color: colors.terracottaText, marginBottom: 14 }}>⚠ ACTIONS REQUISES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {incompleteHeroes.length > 0 && (
              <AlertRow count={incompleteHeroes.length} label="Héros avec un média manquant" href="/heros?filtre=incomplets" />
            )}
            {pendingReports !== null && pendingReports > 0 && (
              <AlertRow count={pendingReports} label="Signalements communauté à modérer" href="/heros" disabled note="Écran Communauté prévu au lot 3" />
            )}
            {incompleteHeroes.length === 0 && (pendingReports === null || pendingReports === 0) && (
              <div style={{ fontSize: 12.5, color: colors.textFaint }}>Rien à traiter pour l&apos;instant.</div>
            )}
          </div>
        </div>
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontFamily: fonts.display, fontSize: 13, letterSpacing: '.1em', color: colors.accentGoldSoft, marginBottom: 14 }}>RACCOURCIS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ShortcutRow icon="⭐" label="Mettre une histoire à la une" href="/heros" highlighted />
            <ShortcutRow icon="⬆" label="Uploader un média" href="/media" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertRow({ count, label, href, disabled, note }: { count: number; label: string; href: string; disabled?: boolean; note?: string }) {
  const content = (
    <div
      style={{
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        background: colors.row,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: '11px 13px',
      }}
      title={note}
    >
      <span
        style={{
          width: 26,
          height: 26,
          flex: 'none',
          borderRadius: 8,
          background: 'rgba(139,58,47,.25)',
          color: colors.terracottaText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fonts.mono,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {count}
      </span>
      <span style={{ flex: 1, fontSize: 12.5, color: colors.textBody }}>{label}</span>
      {!disabled && <span style={{ color: colors.accentGold }}>›</span>}
    </div>
  );
  return disabled ? content : <Link href={href}>{content}</Link>;
}

function ShortcutRow({ icon, label, href, highlighted }: { icon: string; label: string; href: string; highlighted?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        background: highlighted ? `linear-gradient(135deg, #241a11, #160f09)` : colors.row,
        border: `1px solid ${highlighted ? colors.borderStrong : colors.border}`,
        borderRadius: 10,
        padding: '12px 13px',
      }}
    >
      <span>{icon}</span>
      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: colors.textPrimary }}>{label}</span>
      <span style={{ color: colors.accentGold }}>›</span>
    </Link>
  );
}
