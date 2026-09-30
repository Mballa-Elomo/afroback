import { useState } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, typography } from '../theme/tokens';
import { Icon, type IconName } from './Icons';

/**
 * Carte photo héros. Le dégradé de substitution est toujours dessous : il
 * s'affiche tant qu'aucune image n'existe pour ce héros, et pendant le
 * chargement d'une vraie image (Heros.image_carte_catalogue), qui apparaît
 * ensuite en fondu. `expo-image` garde les photos en cache (mémoire +
 * disque) : elles ne se rechargent plus à chaque écran (fluidité, 2026-09-30).
 */
export function HeroPlaceholder({
  style,
  radius = radii.card,
  imageUrl,
  fallbackIcon,
  children,
}: {
  style?: ViewStyle;
  radius?: number;
  imageUrl?: string | null;
  /** Icône en filigrane quand il n'y a pas de photo, ou qu'elle ne se charge pas (fichier pas encore mis en ligne). */
  fallbackIcon?: IconName;
  children?: React.ReactNode;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = !!imageUrl && failedUrl !== imageUrl;
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }, style]}>
      <LinearGradient
        colors={[colors.placeholderStripeLight, colors.placeholderStripeDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {!showImage && !!fallbackIcon && (
        <View style={styles.watermark} pointerEvents="none">
          <Icon name={fallbackIcon} size={60} color="rgba(240,195,107,.2)" strokeWidth={1.4} />
        </View>
      )}
      {showImage && (
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={220}
          cachePolicy="memory-disk"
          recyclingKey={imageUrl}
          onError={() => setFailedUrl(imageUrl)}
        />
      )}
      {children}
    </View>
  );
}

export function EraBadge({ label }: { label: string }) {
  return (
    <View style={styles.eraBadge}>
      <Text style={styles.eraBadgeLabel}>{label}</Text>
    </View>
  );
}

export function TagBadge({ label }: { label: string }) {
  return (
    <LinearGradient
      colors={[...colors.tagGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.tagBadge}
    >
      <Text style={styles.tagBadgeLabel}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  watermark: { ...StyleSheet.absoluteFillObject, alignItems: 'center', paddingTop: 22 },
  eraBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  eraBadgeLabel: {
    fontFamily: typography.mono,
    fontSize: 8,
    color: '#f0dcbf',
  },
  tagBadge: {
    position: 'absolute',
    bottom: 9,
    left: 9,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagBadgeLabel: {
    fontFamily: typography.monoBold,
    fontSize: 8.5,
    color: colors.ctaTextOnGold,
  },
});
