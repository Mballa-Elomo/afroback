/**
 * Design tokens — extraits directement de la maquette Claude Design
 * (AFROBACK Mobile.dc.html, projet claude.ai/design a6ac90b2-…), pas
 * inventés. Couleurs et tailles copiées des styles inline du prototype
 * pour les écrans Catalogue héros, Fiche héros, Lecteur, Player, Vidéo.
 * Thème sombre uniquement, pas de mode clair prévu.
 */

export const colors = {
  background: '#0F0B08',
  backgroundReader: '#0c0906',
  backgroundPlayerFrom: '#3a1d0a',
  backgroundPlayerVia: '#1a1006',
  backgroundPlayerTo: '#0c0805',
  backgroundVideo: '#000000',

  textPrimary: '#EDE3D4',
  textHeading: '#F7E7C8',
  textQuote: '#E3C79A',
  textBody: '#D6C6B2',
  textBodyAlt: '#c9b8a4',
  textMuted: '#8C7B67',
  textMutedAlt: '#9A8870',
  textSource: '#a99a86',

  accentGold: '#E9BE77',
  accentGoldBright: '#F0C36B',
  accentGoldSoft: '#C99A5B',
  accentGoldPale: '#F7D98B',

  ctaGradient: ['#F0C36B', '#8B5A2B'] as const,
  tagGradient: ['#F0C36B', '#C98A3D'] as const,
  ctaTextOnGold: '#1a1109',

  terracotta: '#A0522D',
  terracottaText: '#E3A277',
  terracottaTextAlt: '#E9A15C',

  placeholderStripeLight: '#2a1f14',
  placeholderStripeDark: '#1f1710',

  border: 'rgba(240, 195, 107, 0.16)',
  borderStrong: 'rgba(240, 195, 107, 0.3)',
  borderHairline: 'rgba(240, 195, 107, 0.1)',
  cardBg: 'rgba(240, 195, 107, 0.06)',
  terracottaBg: 'rgba(160, 82, 45, 0.12)',
  terracottaBgStrong: 'rgba(160, 82, 45, 0.14)',
  terracottaBorder: 'rgba(160, 82, 45, 0.4)',

  headerScrim: 'rgba(12, 9, 6, 0.94)',
  tabBarBg: 'rgba(12, 9, 6, 0.92)',
} as const;

export const typography = {
  display: 'Cinzel_700Bold',
  displaySemiBold: 'Cinzel_600SemiBold',
  displayExtraBold: 'Cinzel_800ExtraBold',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyExtraBold: 'Manrope_800ExtraBold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export const fontSizes = {
  h1: 30,
  h2: 23,
  body: 16,
  bodySmall: 15,
  caption: 12,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  card: 16,
  cardSmall: 14,
  button: 12,
  circle: 999,
  badge: 999,
} as const;
