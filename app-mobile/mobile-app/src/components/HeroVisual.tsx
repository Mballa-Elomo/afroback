import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, typography } from '../theme/tokens';

/**
 * Carte photo héros. Si `imageUrl` est fourni (voir Heros.image_carte_catalogue),
 * affiche la vraie image ; sinon retombe sur le substitut visuel (dégradé
 * diagonal deux tons) tant qu'aucune image n'est produite pour ce héros —
 * la maquette utilise un motif de rayures diagonales répétées
 * (`repeating-linear-gradient`) sans équivalent direct en React Native.
 */
export function HeroPlaceholder({
  style,
  radius = radii.card,
  imageUrl,
  children,
}: {
  style?: ViewStyle;
  radius?: number;
  imageUrl?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }, style]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={[colors.placeholderStripeLight, colors.placeholderStripeDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
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
