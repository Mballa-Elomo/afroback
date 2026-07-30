import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../theme/tokens';

/** Barre de navigation basse — fidèle à la maquette : 5 badges circulaires (lettre + libellé court), actif = rempli or. */
const TAB_META: Record<string, { letter: string; label: string }> = {
  accueil: { letter: 'A', label: 'Accueil' },
  decouverte: { letter: 'D', label: 'Découverte' },
  marche: { letter: 'M', label: 'Marché' },
  communaute: { letter: 'C', label: 'Commu.' },
  profil: { letter: 'P', label: 'Profil' },
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name] ?? { letter: '?', label: route.name };
          const focused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="button">
              <View style={[styles.badge, focused && styles.badgeActive]}>
                <Text style={[styles.letter, focused && styles.letterActive]}>{meta.letter}</Text>
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderHairline,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeActive: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  letter: {
    fontFamily: typography.displayExtraBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  letterActive: {
    color: colors.ctaTextOnGold,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 0.3,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.accentGold,
  },
});
