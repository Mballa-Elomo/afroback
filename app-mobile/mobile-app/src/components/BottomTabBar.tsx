import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, StackActions } from '@react-navigation/native';
import { signalerOngletReappuye } from '../navigation/ongletEvents';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../theme/tokens';
import { Icon, type IconName } from './Icons';
import { useI18n } from '../i18n';
import { useModules } from '../settings/SettingsProvider';

/**
 * Barre de navigation basse. Refonte moderne du 2026-09-30 (demande de
 * Yannick) : vraies icônes au lieu des lettres de la maquette d'origine,
 * onglet actif signalé par une pastille dorée derrière l'icône.
 */
const TAB_META: Record<string, { icon: IconName; label: string }> = {
  accueil: { icon: 'home', label: 'tabs.accueil' },
  decouverte: { icon: 'compass', label: 'tabs.decouverte' },
  marche: { icon: 'store', label: 'tabs.marche' },
  communaute: { icon: 'users', label: 'tabs.communaute' },
  profil: { icon: 'user', label: 'tabs.profil' },
};

/**
 * Écrans où la barre reste volontairement masquée : lecteurs plein écran
 * immersifs (retour de test Yannick du 2026-07-31). Nom de route tel
 * qu'enregistré dans `app/(tabs)/accueil/_layout.tsx`.
 */
const ROUTES_SANS_BARRE = new Set(['heros/[slug]/audio', 'heros/[slug]/video']);

export function BottomTabBar(props: BottomTabBarProps) {
  const { t } = useI18n();
  const { state, navigation } = props;
  // Onglets des modules coupés dans le back-office (Paramètres → Modules).
  const modules = useModules();
  const hidden = (name: string) => (name === 'marche' && !modules.marche) || (name === 'communaute' && !modules.communaute);
  const focusedTabRoute = state.routes[state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(focusedTabRoute);
  if (focusedRouteName && ROUTES_SANS_BARRE.has(focusedRouteName)) {
    return null;
  }
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          if (hidden(route.name)) return null;
          const meta = TAB_META[route.name] ?? { icon: 'compass' as IconName, label: route.name };
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (event.defaultPrevented) return;
            if (!focused) {
              navigation.navigate(route.name);
              return;
            }
            // Onglet déjà actif : on revient à son écran principal, ou, si on y
            // est déjà, on lui demande de remonter en haut et de se recharger.
            const pile = route.state as { key?: string; index?: number } | undefined;
            if (pile?.key && (pile.index ?? 0) > 0) {
              navigation.dispatch({ ...StackActions.popToTop(), target: pile.key });
            } else {
              signalerOngletReappuye(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={t(meta.label)}
            >
              <View style={[styles.pill, focused && styles.pillActive]}>
                <Icon name={meta.icon} size={22} color={focused ? colors.accentGoldBright : colors.textMuted} strokeWidth={focused ? 2.2 : 1.8} />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
                {t(meta.label)}
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
    backgroundColor: '#0E0B08',
    borderTopWidth: 1,
    borderTopColor: 'rgba(240,195,107,.14)',
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    width: 54,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: 'rgba(240,195,107,.16)',
  },
  label: {
    fontFamily: typography.bodySemiBold,
    fontSize: 10.5,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.accentGoldBright,
  },
});
