import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors, typography } from '../theme/tokens';

/**
 * Avatar de profil (2026-09-29, demande de Yannick : "la possibilité
 * d'ajouter une photo pour image de profil ou un avatar"). Trois cas, dans
 * la même colonne `community_profiles.avatar_url` :
 * - une vraie photo (URL publique du bucket `user-uploads`) ;
 * - un avatar prédéfini, stocké sous la forme `avatar:<clé>` — 8 médaillons
 *   à motifs géométriques d'inspiration africaine, dessinés pour AFROBACK
 *   (aucun motif sacré ni œuvre existante copiés), sans visage pour ne
 *   représenter personne ;
 * - rien : initiale du pseudo sur fond doré.
 */

export const PRESET_AVATARS = ['soleil', 'losanges', 'zigzag', 'cercles', 'bandes', 'baobab', 'crepuscule', 'ndop'] as const;
export type PresetAvatar = (typeof PRESET_AVATARS)[number];

export function presetKey(value: string | null | undefined): PresetAvatar | null {
  if (!value?.startsWith('avatar:')) return null;
  const key = value.slice('avatar:'.length) as PresetAvatar;
  return (PRESET_AVATARS as readonly string[]).includes(key) ? key : null;
}

export function ProfileAvatar({
  value,
  size = 44,
  name,
}: {
  value: string | null | undefined;
  size?: number;
  /** Pseudo ou prénom : son initiale sert de repli quand il n'y a ni photo ni avatar. */
  name?: string | null;
}) {
  const preset = presetKey(value);
  const round = { width: size, height: size, borderRadius: size / 2 };
  if (preset) {
    return (
      <View style={[styles.frame, round]}>
        <PresetArt name={preset} size={size} />
      </View>
    );
  }
  if (value) {
    return <Image source={{ uri: value }} style={[styles.frame, round]} cachePolicy="memory-disk" />;
  }
  return (
    <View style={[styles.frame, styles.initialBg, round]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{(name?.trim()[0] ?? '?').toUpperCase()}</Text>
    </View>
  );
}

const GOLD = '#F0C36B';
const INK = '#1A1109';

export function PresetArt({ name, size }: { name: PresetAvatar; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {name === 'soleil' && (
        <>
          <Rect width={100} height={100} fill="#A0522D" />
          <G stroke={GOLD} strokeWidth={4} strokeLinecap="round">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * Math.PI) / 6;
              return <Path key={i} d={`M${50 + Math.cos(a) * 24} ${50 + Math.sin(a) * 24} L${50 + Math.cos(a) * 40} ${50 + Math.sin(a) * 40}`} />;
            })}
          </G>
          <Circle cx={50} cy={50} r={16} fill={GOLD} />
          <Circle cx={50} cy={50} r={8} fill="#A0522D" />
        </>
      )}
      {name === 'losanges' && (
        <>
          <Rect width={100} height={100} fill="#1F2A5C" />
          <G fill="none" stroke={GOLD} strokeWidth={3}>
            {[20, 50, 80].map((x) =>
              [20, 50, 80].map((y) => <Path key={`${x}-${y}`} d={`M${x} ${y - 13} L${x + 13} ${y} L${x} ${y + 13} L${x - 13} ${y} Z`} />)
            )}
          </G>
          <Path d="M50 40 L60 50 L50 60 L40 50 Z" fill={GOLD} />
        </>
      )}
      {name === 'zigzag' && (
        <>
          <Rect width={100} height={100} fill="#23422F" />
          <G fill="none" stroke={GOLD} strokeWidth={4} strokeLinejoin="round">
            {[22, 42, 62, 82].map((y) => (
              <Path key={y} d={`M0 ${y} L12.5 ${y - 10} L25 ${y} L37.5 ${y - 10} L50 ${y} L62.5 ${y - 10} L75 ${y} L87.5 ${y - 10} L100 ${y}`} />
            ))}
          </G>
        </>
      )}
      {name === 'cercles' && (
        <>
          <Rect width={100} height={100} fill="#8B5A2B" />
          {[42, 32, 22, 12].map((r, i) => (
            <Circle key={r} cx={50} cy={50} r={r} fill={i % 2 === 0 ? INK : GOLD} />
          ))}
          <Circle cx={50} cy={50} r={4} fill={INK} />
        </>
      )}
      {name === 'bandes' && (
        <>
          <Rect width={100} height={100} fill={INK} />
          {[0, 1, 2, 3, 4].map((i) => (
            <G key={i}>
              <Rect x={0} y={i * 20} width={100} height={10} fill={i % 2 ? '#C8553D' : GOLD} />
              {[0, 1, 2, 3, 4].map((j) => (
                <Rect key={j} x={j * 20 + (i % 2) * 10} y={i * 20 + 10} width={10} height={10} fill="#23422F" />
              ))}
            </G>
          ))}
        </>
      )}
      {name === 'baobab' && (
        <>
          <Defs>
            <LinearGradient id="sky-baobab" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F7B267" />
              <Stop offset="1" stopColor="#A0522D" />
            </LinearGradient>
          </Defs>
          <Rect width={100} height={100} fill="url(#sky-baobab)" />
          <Circle cx={68} cy={36} r={11} fill="#FBE3A4" />
          <Path
            d="M44 90 L46 58 C38 56 28 50 24 42 C32 44 38 46 44 50 C40 40 38 32 40 26 C44 34 46 42 48 50 C50 40 54 32 60 28 C58 38 54 46 52 52 C58 48 66 46 74 46 C68 52 60 56 54 58 L56 90 Z"
            fill={INK}
          />
          <Rect x={0} y={88} width={100} height={12} fill={INK} />
        </>
      )}
      {name === 'crepuscule' && (
        <>
          <Defs>
            <LinearGradient id="sky-crepuscule" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#3A1D0A" />
              <Stop offset="1" stopColor="#E0A24A" />
            </LinearGradient>
          </Defs>
          <Rect width={100} height={100} fill="url(#sky-crepuscule)" />
          <Circle cx={50} cy={62} r={16} fill="#FBE3A4" />
          <Path d="M0 78 L22 52 L38 68 L56 44 L78 70 L100 56 L100 100 L0 100 Z" fill={INK} />
        </>
      )}
      {name === 'ndop' && (
        <>
          <Rect width={100} height={100} fill="#1F2A5C" />
          <G stroke="#EDE3D4" strokeWidth={3} fill="none">
            {[25, 50, 75].map((v) => (
              <G key={v}>
                <Path d={`M${v} 0 V100`} />
                <Path d={`M0 ${v} H100`} />
              </G>
            ))}
            {[12.5, 37.5, 62.5, 87.5].map((x) =>
              [12.5, 37.5, 62.5, 87.5].map((y) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={4} />)
            )}
          </G>
        </>
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(240,195,107,.55)',
    backgroundColor: colors.placeholderStripeDark,
  },
  initialBg: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A2A14',
  },
  initial: {
    fontFamily: typography.display,
    color: colors.accentGoldPale,
  },
});
