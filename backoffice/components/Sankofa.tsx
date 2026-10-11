/**
 * Sankofa, forme « cœur » du symbole Adinkra akan : « retourne chercher ce
 * que tu as laissé derrière toi ». Signature visuelle du back-office.
 * Dessiné au trait (moitié gauche + miroir) pour pouvoir s'animer.
 */
const MOITIE =
  'M50 84 C31 70 12 54 12 34 C12 17 33 9 45 22 C52 30 48 43 38 41 C31 39.5 32 30.5 39 31.5 ' +
  'M50 84 C46 92 36 94 33.5 88 C32 84 37 81.5 40 84.5';

export function Sankofa({
  size = 40,
  anime = false,
  epaisseur = 6,
  className,
  style,
}: {
  size?: number;
  anime?: boolean;
  epaisseur?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const id = `sk-${size}-${anime ? 'a' : 's'}`;
  const trait = {
    fill: 'none',
    stroke: `url(#${id})`,
    strokeWidth: epaisseur,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...(anime ? { strokeDasharray: 260, strokeDashoffset: 260, animation: 'sankofaTrace 2.6s cubic-bezier(.65,0,.35,1) .2s forwards' } : {}),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7D98B" />
          <stop offset=".55" stopColor="#E9A15C" />
          <stop offset="1" stopColor="#A0522D" />
        </linearGradient>
      </defs>
      <path d={MOITIE} style={trait} />
      <path d={MOITIE} style={trait} transform="matrix(-1 0 0 1 100 0)" />
      <circle cx="50" cy="52" r={epaisseur * 0.75} fill={`url(#${id})`} style={anime ? { opacity: 0, animation: 'sankofaPoint .6s ease 2.4s forwards' } : undefined} />
      {anime && (
        <style>{`@keyframes sankofaTrace{to{stroke-dashoffset:0}}@keyframes sankofaPoint{to{opacity:1}}`}</style>
      )}
    </svg>
  );
}
