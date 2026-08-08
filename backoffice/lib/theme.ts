/**
 * Design tokens du back-office — repris verbatim des styles inline de
 * `design-reference-admin-backoffice.dc.excerpt.html`, cohérents avec
 * `mobile-app/src/theme/tokens.ts` (même identité AFROBACK). Thème sombre
 * uniquement, pas de mode clair prévu — outil interne.
 */
export const colors = {
  background: '#0F0B08',
  sidebarFrom: '#160f09',
  sidebarTo: '#0d0805',
  panel: '#150e09',
  panelDeep: '#140d08',
  row: '#1A130D',
  tableHeader: '#1a130d',

  textPrimary: '#EDE3D4',
  textHeading: '#F7E7C8',
  textBody: '#c9b8a4',
  textMuted: '#8C7B67',
  textMutedAlt: '#9A8870',
  textFaint: '#6f5f4d',
  textVeryFaint: '#5f5140',

  accentGold: '#E9BE77',
  accentGoldBright: '#F0C36B',
  accentGoldSoft: '#C99A5B',
  accentGoldAlt: '#E9A15C',
  ctaGradient: ['#F0C36B', '#8B5A2B'] as const,
  ctaTextOnGold: '#1a1109',

  terracotta: '#A0522D',
  terracottaAlt: '#8B3A2F',
  terracottaText: '#E3A277',
  terracottaTextAlt: '#B06A4A',

  positive: '#8fbf8f',
  positiveBg: 'rgba(90,150,90,.15)',
  warning: '#E3A277',
  warningBg: 'rgba(139,58,47,.14)',

  border: 'rgba(240,195,107,.12)',
  borderStrong: 'rgba(240,195,107,.3)',
  borderHairline: 'rgba(240,195,107,.06)',
} as const;

export const fonts = {
  display: "'Cinzel', serif",
  body: "'Manrope', sans-serif",
  mono: "'Space Mono', monospace",
} as const;
