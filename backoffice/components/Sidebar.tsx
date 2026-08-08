'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_GROUPS } from '@/lib/navItems';
import { colors, fonts } from '@/lib/theme';
import type { AdminUser } from '@/lib/auth';

export function Sidebar({ admin }: { admin: AdminUser }) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        flex: 'none',
        width: 236,
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${colors.sidebarFrom}, ${colors.sidebarTo})`,
        borderRight: `1px solid ${colors.border}`,
        padding: '22px 14px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '0 8px 20px',
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.accentGoldBright}, ${colors.terracotta})`,
            flex: 'none',
          }}
        />
        <div style={{ lineHeight: 1.1 }}>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 800,
              letterSpacing: '.16em',
              fontSize: 14,
              background: `linear-gradient(135deg, #F7D98B, #C98A3D)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            AFROBACK
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: '.14em', color: colors.textMuted, marginTop: 3 }}>
            BACK-OFFICE
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {NAV_GROUPS.map((g) => (
          <div key={g.group || 'root'}>
            {g.group && (
              <div style={{ fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: '.14em', color: colors.textFaint, padding: '12px 12px 4px' }}>
                {g.group}
              </div>
            )}
            {g.items.map((n) => {
              const active = n.href && (pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href)));
              const rowStyle: React.CSSProperties = {
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                ...(active
                  ? {
                      background: 'linear-gradient(135deg, rgba(240,195,107,.16), rgba(139,90,43,.1))',
                      color: colors.textHeading,
                      border: `1px solid ${colors.borderStrong}`,
                    }
                  : { color: colors.textMutedAlt, border: '1px solid transparent' }),
              };
              if (!n.enabled) {
                return (
                  <div key={n.id} style={{ ...rowStyle, opacity: 0.4, cursor: 'default' }} title={`Prévu au lot ${n.lot}`}>
                    <span style={{ width: 20, textAlign: 'center', fontSize: 15 }}>{n.icon}</span>
                    <span style={{ flex: 1 }}>{n.label}</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.textFaint }}>LOT {n.lot}</span>
                  </div>
                );
              }
              return (
                <Link key={n.id} href={n.href!} style={rowStyle}>
                  <span style={{ width: 20, textAlign: 'center', fontSize: 15 }}>{n.icon}</span>
                  <span style={{ flex: 1 }}>{n.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div
        style={{
          flex: 'none',
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 12,
          background: colors.row,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
        }}
      >
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: colors.panelDeep, border: `1px solid ${colors.borderStrong}` }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.nom}</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textMuted }}>ADMIN COMPLET</div>
        </div>
        <Link href="/logout" title="Se déconnecter" style={{ fontSize: 14, color: colors.textMuted }}>
          ⏻
        </Link>
      </div>
    </aside>
  );
}
