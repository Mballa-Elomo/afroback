import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';
import { Sankofa } from '@/components/Sankofa';
import { colors, fonts } from '@/lib/theme';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [admin, jar] = await Promise.all([requireAdmin(), cookies()]);

  if (!admin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          textAlign: 'center',
          padding: 24,
        }}
      >
        <Sankofa size={72} anime />
        <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 800, color: colors.textHeading, letterSpacing: '.04em' }}>Accès refusé</div>
        <p style={{ fontSize: 13.5, color: colors.textMutedAlt, maxWidth: 380, lineHeight: 1.6 }}>
          Ce compte est connecté mais n&apos;est pas enregistré comme administrateur AFROBACK. Contacte Yannick pour être ajouté à{' '}
          <code>admin_users</code>.
        </p>
        <form action="/logout" method="post">
          <button
            type="submit"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: colors.accentGold,
              background: 'none',
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: 999,
              padding: '9px 18px',
              cursor: 'pointer',
            }}
          >
            Se déconnecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <AdminShell admin={admin} replieInitial={jar.get('afa-sb')?.value === '1'}>
      {children}
    </AdminShell>
  );
}
