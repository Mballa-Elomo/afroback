import { colors } from '@/lib/theme';

type Tone = 'positive' | 'warning' | 'neutral' | 'gold';

const TONE_STYLE: Record<Tone, React.CSSProperties> = {
  positive: { color: colors.positive, background: colors.positiveBg },
  warning: { color: colors.terracottaTextAlt, background: 'rgba(139,58,47,.16)' },
  neutral: { color: colors.textFaint, background: 'rgba(240,195,107,.06)' },
  gold: { color: colors.ctaTextOnGold, background: `linear-gradient(135deg, ${colors.accentGoldBright}, #C98A3D)` },
};

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 9,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 999,
        display: 'inline-block',
        ...TONE_STYLE[tone],
      }}
    >
      {label}
    </span>
  );
}
