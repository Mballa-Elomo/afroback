import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Heros } from '../data/types';
import { colors, spacing, typography } from '../theme/tokens';
import { SectionTitle } from './SectionTitle';
import { HeroPlaceholder } from './HeroVisual';

export function RelatedHeroes({ heroes, title = 'Héros liés' }: { heroes: Heros[]; title?: string }) {
  const router = useRouter();
  if (heroes.length === 0) return null;
  return (
    <View style={styles.container}>
      <SectionTitle title={title} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {heroes.map((h) => (
          <Pressable key={h.slug} style={styles.item} onPress={() => router.push(`/accueil/heros/${h.slug}`)}>
            <HeroPlaceholder style={styles.visual} radius={14} imageUrl={h.image_carte_catalogue} />
            <Text style={styles.name} numberOfLines={2}>
              {h.nom_affiche}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  row: {
    gap: 12,
  },
  item: {
    width: 110,
  },
  visual: {
    height: 130,
  },
  name: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12,
    lineHeight: 15,
    color: colors.textPrimary,
    marginTop: 6,
  },
});
