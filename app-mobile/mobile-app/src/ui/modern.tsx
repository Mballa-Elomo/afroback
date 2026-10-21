import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, typography } from '../theme/tokens';
import { Icon, type IconName } from '../components/Icons';
import { useMotionAllowed } from '../onboarding/useReduceMotion';
import { useI18n } from '../i18n';
import { useRetour } from '../navigation/retour';

/**
 * Briques du design "moderne" (refonte du 2026-09-30, demande de Yannick :
 * écrans plus fluides et modernes, dans le style du nouveau Profil). Partagées
 * par tous les écrans pour garder un style cohérent.
 */

const USE_NATIVE = Platform.OS !== 'web';

/** Carte qui s'enfonce légèrement au toucher (retour tactile, pilote natif). */
export function PressableScale({
  onPress,
  style,
  wrapperStyle,
  children,
  accessibilityLabel,
}: {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  /** Style de l'enveloppe tactile (ex. `{ flex: 1 }` pour partager une rangée). */
  wrapperStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
  accessibilityLabel?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: USE_NATIVE, speed: 50, bounciness: 3 }).start();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      style={wrapperStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Bouton retour rond (en-têtes d'écran et en surimpression sur une photo). */
/**
 * Bouton retour (refonte du 2026-10-17, retour de test Yannick : « trop petit
 * et pas moderne ») : pastille ronde de 46 px, verre sombre, liseré doré,
 * ombre portée, léger enfoncement au toucher. Sans `onPress`, il fait un
 * retour qui ne bloque jamais (voir `useRetour`). `floating` : posé sur une
 * image (verre plus transparent, ombre plus marquée).
 */
export function BackButton({ onPress, floating = false }: { onPress?: () => void; floating?: boolean }) {
  const { t } = useI18n();
  const retour = useRetour();
  return (
    <Pressable
      onPress={onPress ?? retour}
      hitSlop={12}
      style={({ pressed }) => [styles.back, floating && styles.backFloating, pressed && styles.backPressed]}
      accessibilityRole="button"
      accessibilityLabel={t('ui.back')}
    >
      <Icon name="chevronLeft" size={24} color={colors.accentGoldPale} strokeWidth={2.6} />
    </Pressable>
  );
}

/** En-tête d'écran : retour, grand titre, sous-titre facultatif. */
export function ScreenHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderRow}>
        {onBack ? <BackButton onPress={onBack} /> : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
        </View>
        {right}
      </View>
    </View>
  );
}

/** Filtres en pastilles défilant horizontalement. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ flexGrow: 0 }}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Tuile d'action secondaire (ex. Écouter / Regarder) : icône ronde, libellé, petite mention. */
export function ActionTile({ icon, label, hint, onPress }: { icon: IconName; label: string; hint?: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} wrapperStyle={{ flex: 1 }} style={styles.tile} accessibilityLabel={label}>
      <View style={styles.tileIcon}>
        <Icon name={icon} size={18} color={colors.accentGoldBright} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tileLabel}>{label}</Text>
        {!!hint && <Text style={styles.tileHint}>{hint}</Text>}
      </View>
    </PressableScale>
  );
}

/**
 * Section repliable (fiches de contenu, cdc-commentaires.md §2) : pastille
 * d'icône, titre, compteur, aperçu d'une ligne ; le contenu s'ouvre au
 * toucher, avec une flèche qui pivote et un fondu.
 */
export function Collapsible({
  icon,
  title,
  count,
  preview,
  defaultOpen = false,
  children,
}: {
  icon: IconName;
  title: string;
  count?: string;
  preview?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const rot = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const fade = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const toggle = () => {
    const next = !open;
    setOpen(next);
    Animated.timing(rot, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: USE_NATIVE }).start();
    if (next) {
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: USE_NATIVE }).start();
    }
  };
  return (
    <View style={styles.collapse}>
      <Pressable onPress={toggle} style={styles.collapseHead} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <View style={styles.collapseIcon}>
          <Icon name={icon} size={17} color={colors.accentGoldBright} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.collapseTitle}>
            {title}
            {!!count && <Text style={styles.collapseCount}>{`  ·  ${count}`}</Text>}
          </Text>
          {!open && !!preview && (
            <Text style={styles.collapsePreview} numberOfLines={1}>
              {preview}
            </Text>
          )}
        </View>
        <Animated.View style={{ transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ['90deg', '270deg'] }) }] }}>
          <Icon name="chevronRight" size={16} color={colors.accentGold} strokeWidth={2.4} />
        </Animated.View>
      </Pressable>
      {open && <Animated.View style={[styles.collapseBody, { opacity: fade }]}>{children}</Animated.View>}
    </View>
  );
}

/** Petit compteur de J'aime en surimpression sur une carte (masqué à zéro). */
export function LikeBadge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <View style={styles.likeBadge}>
      <Icon name="thumbUp" size={11} color={colors.accentGoldPale} strokeWidth={2.4} />
      <Text style={styles.likeBadgeText}>{count >= 1000 ? `${(count / 1000).toFixed(1).replace('.', ',')} k` : count}</Text>
    </View>
  );
}

/** Titre de section + lien "Voir tout". */
export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {!!actionLabel && !!onAction && (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text style={styles.sectionAction}>{actionLabel} ›</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Section avec carrousel horizontal : titre, lien "Voir tout" et, sur
 * ordinateur (web), deux flèches pour défiler à la souris ; sur téléphone,
 * on glisse au doigt.
 */
export function RailSection({
  title,
  actionLabel,
  onAction,
  step = 300,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  step?: number;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const ref = useRef<ScrollView>(null);
  const offset = useRef(0);
  const by = (d: number) => {
    offset.current = Math.max(0, offset.current + d);
    ref.current?.scrollTo({ x: offset.current, animated: true });
  };
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
        <View style={styles.headerRight}>
          {Platform.OS === 'web' && (
            <>
              <Pressable onPress={() => by(-step)} style={styles.railArrow} accessibilityLabel={t('ui.prev')}>
                <Icon name="chevronLeft" size={16} color={colors.accentGold} strokeWidth={2.2} />
              </Pressable>
              <Pressable onPress={() => by(step)} style={styles.railArrow} accessibilityLabel={t('ui.next')}>
                <Icon name="chevronRight" size={16} color={colors.accentGold} strokeWidth={2.2} />
              </Pressable>
            </>
          )}
          {!!actionLabel && !!onAction && (
            <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
              <Text style={styles.sectionAction}>{actionLabel} ›</Text>
            </Pressable>
          )}
        </View>
      </View>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        onScroll={(e) => {
          offset.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={64}
        decelerationRate="fast"
      >
        {children}
      </ScrollView>
    </View>
  );
}

/**
 * Squelette de chargement : formes grises qui "respirent" pendant que le
 * contenu arrive (une seule animation pour tout l'écran, pas une par forme).
 */
export function SkeletonScreen({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const motion = useMotionAllowed();
  const pulse = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    if (!motion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: USE_NATIVE }),
        Animated.timing(pulse, { toValue: 0.55, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: USE_NATIVE }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [motion, pulse]);
  return (
    <Animated.View style={{ opacity: pulse }} accessibilityLabel={t('ui.loading')} accessibilityRole="progressbar">
      {children}
    </Animated.View>
  );
}

export function Bone({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.bone, style]} />;
}

const styles = StyleSheet.create({
  likeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(8,6,4,.6)',
  },
  likeBadgeText: { fontFamily: typography.bodySemiBold, fontSize: 11, color: colors.accentGoldPale },
  collapse: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    backgroundColor: 'rgba(26,19,13,.95)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  collapseHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  collapseIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.12)',
  },
  collapseTitle: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textPrimary },
  collapseCount: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
  collapsePreview: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  collapseBody: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2 },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.12)',
    backgroundColor: 'rgba(26,19,13,.95)',
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.12)',
  },
  tileLabel: { fontFamily: typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  tileHint: { fontFamily: typography.body, fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
  back: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 2,
    backgroundColor: 'rgba(22,16,11,.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(240,195,107,.45)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  backFloating: { backgroundColor: 'rgba(8,6,4,.6)', borderColor: 'rgba(247,217,139,.6)', shadowOpacity: 0.6 },
  backPressed: { transform: [{ scale: 0.92 }], backgroundColor: 'rgba(240,195,107,.22)' },
  screenHeader: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14 },
  screenHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  screenTitle: { fontFamily: typography.display, fontSize: 24, color: colors.textHeading },
  screenSubtitle: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  chips: { gap: 8, paddingHorizontal: 18, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.14)',
    backgroundColor: 'rgba(26,19,13,.95)',
  },
  chipActive: { backgroundColor: colors.accentGoldBright, borderColor: colors.accentGoldBright },
  chipText: { fontFamily: typography.bodySemiBold, fontSize: 13, color: colors.textBody },
  chipTextActive: { color: colors.ctaTextOnGold },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 28,
  },
  sectionTitle: { fontFamily: typography.display, fontSize: 19, color: colors.textHeading },
  sectionAction: { fontFamily: typography.bodySemiBold, fontSize: 13, color: colors.accentGoldBright },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rail: { gap: 14, paddingRight: 18 },
  railArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.35)',
  },
  railArrowText: { color: colors.accentGold, fontSize: 16, lineHeight: 18 },
  bone: { backgroundColor: 'rgba(237,227,212,.08)', borderRadius: 14 },
});
