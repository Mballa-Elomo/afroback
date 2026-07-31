import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DecouverteItem } from '../data/decouverteTypes';
import { DECOUVERTE_TYPE_LABEL } from '../data/decouverteDisplay';
import { colors, radii, typography } from '../theme/tokens';
import { HeroPlaceholder } from './HeroVisual';

/** Ligne de liste (catalogue Découverte, hub pays) — fidèle à la maquette : photo 60x60, catégorie·région, nom, résumé tronqué. */
export function DecouverteItemRow({ item, onPress }: { item: DecouverteItem; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <HeroPlaceholder style={styles.visual} radius={12} imageUrl={item.image_url} />
      <View style={styles.body}>
        <Text style={styles.meta} numberOfLines={1}>
          {DECOUVERTE_TYPE_LABEL[item.type].toUpperCase()} · {item.region_ethnie}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.titre}
        </Text>
        <Text style={styles.blurb} numberOfLines={1}>
          {item.resume_liste}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: 11,
  },
  rowPressed: {
    opacity: 0.85,
  },
  visual: {
    width: 60,
    height: 60,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    fontFamily: typography.mono,
    fontSize: 8.5,
    letterSpacing: 0.7,
    color: colors.terracottaTextAlt,
  },
  name: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
  },
  blurb: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  chevron: {
    color: colors.accentGold,
    fontSize: 18,
    flexShrink: 0,
  },
});
