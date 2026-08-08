'use client';

import { useActionState } from 'react';
import { login } from './actions';
import { colors, fonts } from '@/lib/theme';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, { error: null });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 50% 20%, rgba(240,195,107,.08), transparent 60%), ${colors.background}`,
      }}
    >
      <form
        action={formAction}
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#150e09',
          border: `1px solid ${colors.border}`,
          borderRadius: 20,
          padding: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.accentGoldBright}, ${colors.terracotta})`,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: 800,
                letterSpacing: '.14em',
                fontSize: 16,
                background: 'linear-gradient(135deg, #F7D98B, #C98A3D)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              AFROBACK
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '.14em', color: colors.textMuted }}>BACK-OFFICE</div>
          </div>
        </div>

        <label style={{ display: 'block', fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          style={{
            width: '100%',
            marginBottom: 16,
            background: '#170f0a',
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: '11px 13px',
            color: colors.textPrimary,
            fontSize: 13.5,
            outline: 'none',
          }}
        />

        <label style={{ display: 'block', fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Mot de passe</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          style={{
            width: '100%',
            marginBottom: 20,
            background: '#170f0a',
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: '11px 13px',
            color: colors.textPrimary,
            fontSize: 13.5,
            outline: 'none',
          }}
        />

        {state.error && (
          <div style={{ fontSize: 12.5, color: colors.terracottaText, marginBottom: 16 }}>{state.error}</div>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            width: '100%',
            font: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            padding: 13,
            borderRadius: 12,
            border: 'none',
            background: `linear-gradient(135deg, ${colors.accentGoldBright}, ${colors.terracotta})`,
            color: colors.ctaTextOnGold,
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Connexion...' : 'Se connecter'}
        </button>

        <p style={{ fontSize: 10.5, color: colors.textFaint, marginTop: 18, lineHeight: 1.5 }}>
          Accès réservé aux comptes administrateurs d&apos;AFROBACK. Distinct du compte utilisateur de l&apos;app mobile.
        </p>
      </form>
    </div>
  );
}
