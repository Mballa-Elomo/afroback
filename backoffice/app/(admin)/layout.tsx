import { requireAdmin } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { colors } from '@/lib/theme';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 14,
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div style={{ fontSize: 40 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.textHeading }}>Accès refusé</div>
        <p style={{ fontSize: 13, color: colors.textMutedAlt, maxWidth: 360 }}>
          Ce compte est connecté mais n&apos;est pas enregistré comme administrateur AFROBACK. Contacte Yannick pour
          être ajouté à <code>admin_users</code>.
        </p>
        <a href="/logout" style={{ fontSize: 13, color: colors.accentGold }}>
          Se déconnecter
        </a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.background, fontFamily: "'Manrope', sans-serif", color: colors.textPrimary, display: 'flex' }}>
      <Sidebar admin={admin} />
      <div style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <Topbar />
        <div style={{ padding: 28 }}>
          <div className="afa-fade">{children}</div>
        </div>
      </div>
    </div>
  );
}
