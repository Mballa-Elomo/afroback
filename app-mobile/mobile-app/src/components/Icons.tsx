import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Icônes au trait des boutons (2026-09-29, demande de Yannick : "des boutons
 * modernes avec des icônes"). Dessinées en SVG, cohérentes entre iOS,
 * Android et web (pas de dépendance à une police d'icônes).
 */
export type IconName =
  | 'arrowRight'
  | 'chevronRight'
  | 'chevronLeft'
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
  | 'lock'
  | 'pencil'
  | 'globe'
  | 'key'
  | 'crown'
  | 'users'
  | 'logout'
  | 'phone'
  | 'mapPin'
  | 'search'
  | 'book'
  | 'store'
  | 'home'
  | 'user'
  | 'chat'
  | 'share'
  | 'cart'
  | 'thumbUp'
  | 'dots'
  | 'send'
  | 'close'
  | 'flag'
  | 'trash';

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
      {name === 'chevronLeft' && <Path d="M15 5l-7 7 7 7" {...common} />}
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
      {name === 'pencil' && (
        <>
          <Path d="M15.5 5.5l3 3L8 19H5v-3L15.5 5.5z" {...common} />
          <Path d="M13.5 7.5l3 3" {...common} />
        </>
      )}
      {name === 'globe' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z" {...common} />
        </>
      )}
      {name === 'key' && (
        <>
          <Circle cx={8} cy={15} r={4} {...common} />
          <Path d="M11 12l8.5-8.5M16.5 6.5l2.5 2.5M14.5 8.5l2 2" {...common} />
        </>
      )}
      {name === 'crown' && <Path d="M4 17.5h16M5 17.5L3.5 7.5l5 4 3.5-6 3.5 6 5-4-1.5 10" {...common} />}
      {name === 'users' && (
        <>
          <Circle cx={9} cy={8} r={3.4} {...common} />
          <Path d="M3 19.5c.7-3.4 3-5.3 6-5.3s5.3 1.9 6 5.3M15.5 4.9a3.2 3.2 0 0 1 0 6.2M17.5 14.5c1.9.6 3.1 2.2 3.5 5" {...common} />
        </>
      )}
      {name === 'logout' && (
        <>
          <Path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" {...common} />
          <Path d="M20 12H9M16 8l4 4-4 4" {...common} />
        </>
      )}
      {name === 'phone' && (
        <Path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" {...common} />
      )}
      {name === 'mapPin' && (
        <>
          <Path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" {...common} />
          <Circle cx={12} cy={10} r={2.4} {...common} />
        </>
      )}
      {name === 'search' && (
        <>
          <Circle cx={11} cy={11} r={6.5} {...common} />
          <Path d="M16 16l4.5 4.5" {...common} />
        </>
      )}
      {name === 'book' && (
        <>
          <Path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13z" {...common} />
          <Path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13z" {...common} />
        </>
      )}
      {name === 'store' && (
        <>
          <Path d="M4 9.5L5.5 4.5h13L20 9.5M4 9.5h16M4 9.5c0 1.4 1.1 2.5 2.5 2.5S9 10.9 9 9.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.1 2.5 2.5 2.5S20 10.9 20 9.5" {...common} />
          <Path d="M5.5 12v7.5h13V12M10 19.5v-4.5h4v4.5" {...common} />
        </>
      )}
      {name === 'home' && (
        <>
          <Path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6h-6v6H5.5A1.5 1.5 0 0 1 4 19v-8.5z" {...common} />
        </>
      )}
      {name === 'user' && (
        <>
          <Circle cx={12} cy={8} r={4} {...common} />
          <Path d="M4.5 20.5c.9-4 3.8-6.3 7.5-6.3s6.6 2.3 7.5 6.3" {...common} />
        </>
      )}
      {name === 'chat' && (
        <Path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8.5A1.5 1.5 0 0 1 19 17h-8l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z" {...common} />
      )}
      {name === 'share' && (
        <>
          <Path d="M12 15V4M8 8l4-4 4 4" {...common} />
          <Path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" {...common} />
        </>
      )}
      {name === 'cart' && (
        <>
          <Path d="M3.5 4.5h2.2l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.2L20 8H6.4" {...common} />
          <Circle cx={10} cy={19.5} r={1.3} {...common} />
          <Circle cx={17} cy={19.5} r={1.3} {...common} />
        </>
      )}
      {name === 'thumbUp' && (
        <>
          <Path d="M7.5 10.5v9.5H4.5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1h3z" {...common} />
          <Path d="M7.5 10.5l3.6-6.2a1.6 1.6 0 0 1 2.9 1.2l-.8 3.7h5a1.8 1.8 0 0 1 1.8 2.1l-1.2 6.8a2 2 0 0 1-2 1.7H7.5" {...common} />
        </>
      )}
      {name === 'dots' && (
        <>
          <Circle cx={12} cy={5.5} r={1.3} {...common} />
          <Circle cx={12} cy={12} r={1.3} {...common} />
          <Circle cx={12} cy={18.5} r={1.3} {...common} />
        </>
      )}
      {name === 'send' && <Path d="M4 12L20 4.5 14.5 20l-2.8-6.2L4 12zM11.7 13.8L20 4.5" {...common} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...common} />}
      {name === 'flag' && (
        <>
          <Path d="M5.5 21V4" {...common} />
          <Path d="M5.5 4.5h11l-2 4 2 4h-11" {...common} />
        </>
      )}
      {name === 'trash' && (
        <>
          <Path d="M4.5 7h15M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12" {...common} />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...common} />}
      {name === 'heart' && (
        <Path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" {...common} />
      )}
    </Svg>
  );
}
