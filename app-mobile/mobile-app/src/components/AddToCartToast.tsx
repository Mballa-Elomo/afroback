import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, typography } from '../theme/tokens';

/** Toast "ajouté au panier" — fidèle à design-reference-marketplace.dc.excerpt.html. */
export function AddToCartToast({ message, onViewCart }: { message: string; onViewCart: () => void }) {
  return (
    <View style={styles.toast}>
      <View style={styles.check}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      <Pressable onPress={onViewCart}>
        <Text style={styles.link}>Voir le panier</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.cardSmall,
    paddingHorizontal: 15,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentGoldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ctaTextOnGold,
  },
  message: {
    flex: 1,
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textHeading,
  },
  link: {
    fontFamily: typography.bodyBold,
    fontSize: 12,
    color: colors.accentGold,
    textDecorationLine: 'underline',
  },
});
