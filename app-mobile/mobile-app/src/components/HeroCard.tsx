import { Pressable, StyleSheet, Text } from 'react-native';
import type { Heros } from '../data/types';
import { colors, typography } from '../theme/tokens';
import { HeroPlaceholder, EraBadge, TagBadge } from './HeroVisual';

/** Extrait un libellé court de `epoque` (ex. "Colonial (Kamerun allemand, 1884-1916)" → "Colonial") pour le badge de la maquette, sans inventer de donnée. */
function shortEra(epoque: string) {
  return epoque.split(/[,(]/)[0].trim();
}

/** Tuile de la grille 2 colonnes du catalogue héros — fidèle à la maquette. */
export function HeroCard({ heros, onPress }: { heros: Heros; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <HeroPlaceholder style={styles.visual} imageUrl={heros.image_carte_catalogue}>
        <EraBadge label={shortEra(heros.epoque)} />
        {heros.theme[0] && <TagBadge label={heros.theme[0]} />}
      </HeroPlaceholder>
      <Text style={styles.name} numberOfLines={2}>
        {heros.nom_affiche}
      </Text>
      <Text style={styles.region} numberOfLines={1}>
        {heros.region}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  cardPressed: {
    opacity: 0.85,
  },
  visual: {
    height: 150,
  },
  name: {
    fontFamily: typography.displaySemiBold,
    fontSize: 14,
    lineHeight: 15.4,
    color: colors.textPrimary,
    marginTop: 8,
  },
  region: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
  },
});
