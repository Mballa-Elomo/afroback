import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DecouverteItem } from '../data/decouverteTypes';
import { DECOUVERTE_TYPE_LABEL } from '../data/decouverteDisplay';
import { colors, typography } from '../theme/tokens';
import { HeroPlaceholder } from './HeroVisual';
import { AccessBadge } from '../access/Access';
import { Icon } from './Icons';
import { useI18n } from '../i18n';

/** Ligne de liste (catalogue Découverte, hub pays) — fidèle à la maquette : photo 60x60, catégorie·région, nom, résumé tronqué. */
export function DecouverteItemRow({ item, onPress }: { item: DecouverteItem; onPress: () => void }) {
  const { t } = useI18n();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <HeroPlaceholder style={styles.visual} radius={14} imageUrl={item.image_url} fallbackIcon="compass" />
      <View style={styles.body}>
        <Text style={styles.meta} numberOfLines={1}>
          {t(`decouverteType.${item.type}`).toUpperCase()} · {item.region_ethnie}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.titre}
        </Text>
        <Text style={styles.blurb} numberOfLines={1}>
          {item.resume_liste}
        </Text>
      </View>
      <AccessBadge type="decouverte" slug={item.slug} inline />
      <Icon name="chevronRight" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: 'rgba(26,19,13,.95)',
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    borderRadius: 18,
    padding: 12,
  },
  rowPressed: {
    opacity: 0.85,
  },
  visual: {
    width: 68,
    height: 68,
    borderWidth: 0,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    fontFamily: typography.mono,
    fontSize: 9.5,
    letterSpacing: 0.7,
    color: colors.accentGoldSoft,
  },
  name: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 3,
  },
  blurb: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    color: colors.accentGold,
    fontSize: 18,
    flexShrink: 0,
  },
});
