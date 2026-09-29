import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Icônes au trait des boutons (2026-09-29, demande de Yannick : "des boutons
 * modernes avec des icônes"). Dessinées en SVG, cohérentes entre iOS,
 * Android et web (pas de dépendance à une police d'icônes).
 */
export type IconName =
  | 'arrowRight'
  | 'chevronRight'
  | 'check'
  | 'login'
  | 'userPlus'
  | 'shield'
  | 'compass'
  | 'sparkle'
  | 'play'
  | 'heart'
  | 'camera'
  | 'plus'
  | 'lock';

export function Icon({ name, size = 18, color = '#F7D98B', strokeWidth = 2 }: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const common = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'arrowRight' && <Path d="M5 12h13M13 6l6 6-6 6" {...common} />}
      {name === 'chevronRight' && <Path d="M9 5l7 7-7 7" {...common} />}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...common} />}
      {name === 'login' && (
        <>
          <Path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" {...common} />
          <Path d="M3 12h11M10 8l4 4-4 4" {...common} />
        </>
      )}
      {name === 'userPlus' && (
        <>
          <Circle cx={10} cy={8} r={3.6} {...common} />
          <Path d="M3.5 20c.8-3.6 3.3-5.6 6.5-5.6 1.4 0 2.6.4 3.6 1M18.5 13v6M15.5 16h6" {...common} />
        </>
      )}
      {name === 'shield' && (
        <>
          <Path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6L12 3z" {...common} />
          <Path d="M8.8 12l2.2 2.2 4.2-4.4" {...common} />
        </>
      )}
      {name === 'compass' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" {...common} />
        </>
      )}
      {name === 'sparkle' && (
        <Path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3zM18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" {...common} />
      )}
      {name === 'play' && <Path d="M8 5.5v13l10.5-6.5L8 5.5z" {...common} />}
      {name === 'camera' && (
        <>
          <Path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9z" {...common} />
          <Circle cx={12} cy={13} r={3.4} {...common} />
        </>
      )}
      {name === 'lock' && (
        <>
          <Path d="M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5z" {...common} />
          <Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...common} />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...common} />}
      {name === 'heart' && (
        <Path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" {...common} />
      )}
    </Svg>
  );
}
