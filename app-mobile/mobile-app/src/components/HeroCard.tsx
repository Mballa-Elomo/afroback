import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Heros } from '../data/types';
import { colors, typography } from '../theme/tokens';
import { HeroPlaceholder } from './HeroVisual';
import { AccessBadge } from '../access/Access';
import { LikeBadge, PressableScale } from '../ui/modern';

/** Libellé court de `epoque` (ex. "Colonial (Kamerun allemand, 1884-1916)" → "Colonial"), sans inventer de donnée. */
function shortEra(epoque: string) {
  return epoque.split(/[,(]/)[0].trim();
}

/**
 * Tuile de la grille 2 colonnes du catalogue héros. Refonte moderne du
 * 2026-09-30 : photo sur toute la hauteur, nom et région en surimpression
 * sur un dégradé, époque en pastille, cadenas/Gratuit en haut à droite.
 */
export function HeroCard({ heros, onPress, likes }: { heros: Heros; onPress: () => void; likes?: number }) {
  return (
    <PressableScale onPress={onPress} wrapperStyle={styles.wrap} accessibilityLabel={heros.nom_affiche}>
      <HeroPlaceholder style={styles.visual} radius={20} imageUrl={heros.image_carte_catalogue} fallbackIcon="crown">
        <LinearGradient colors={['rgba(8,6,4,0)', 'rgba(8,6,4,0.92)']} locations={[0.4, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.era}>
          <Text style={styles.eraText} numberOfLines={1}>
            {shortEra(heros.epoque)}
          </Text>
        </View>
        <AccessBadge type="heros" slug={heros.slug} style={{ top: 8, right: 8 }} />
        <LikeBadge count={likes} />
        <View style={[styles.text, !!likes && { right: 56 }]}>
          <Text style={styles.name} numberOfLines={2}>
            {heros.nom_affiche}
          </Text>
          <Text style={styles.region} numberOfLines={1}>
            {heros.region}
          </Text>
        </View>
      </HeroPlaceholder>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  visual: { height: 230, borderWidth: 0 },
  era: {
    position: 'absolute',
    top: 10,
    left: 10,
    maxWidth: '62%',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(8,6,4,.55)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.35)',
  },
  eraText: { fontFamily: typography.bodySemiBold, fontSize: 10.5, color: colors.accentGoldPale },
  text: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  name: { fontFamily: typography.bodyBold, fontSize: 15.5, lineHeight: 19, color: '#FFF4E0' },
  region: { fontFamily: typography.body, fontSize: 11.5, color: 'rgba(255,244,224,.7)', marginTop: 3 },
});
