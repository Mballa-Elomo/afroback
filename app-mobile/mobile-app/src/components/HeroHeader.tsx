import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Heros } from '../data/types';
import { colors, typography } from '../theme/tokens';

function heroYears(heros: Heros) {
  const from = heros.annee_naissance_indicative;
  const to = heros.annee_mort_indicative;
  if (from && to) return `${from} – ${to}`;
  if (from) return from;
  return heros.epoque;
}

function shortEra(epoque: string) {
  return epoque.split(/[,(]/)[0].trim();
}

/** En-tête immersif de la fiche héros — 340px, vraie photo si produite (sinon placeholder) + dégradé de fondu, fidèle à la maquette. */
export function HeroHeader({ heros, onBack }: { heros: Heros; onBack: () => void }) {
  return (
    <View style={styles.wrap}>
      {heros.image_carte_catalogue ? (
        <Image source={{ uri: heros.image_carte_catalogue }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={[colors.placeholderStripeLight, colors.placeholderStripeDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <LinearGradient
        colors={['rgba(15,11,8,0.2)', 'rgba(15,11,8,0.1)', colors.background]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>
      <View style={styles.bottom}>
        <View style={styles.eraPill}>
          <Text style={styles.eraPillLabel}>{shortEra(heros.epoque).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{heros.nom_affiche}</Text>
        <Text style={styles.meta}>
          {heroYears(heros)} · {heros.region}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 340,
    overflow: 'hidden',
    backgroundColor: colors.placeholderStripeDark,
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.accentGold,
    marginTop: -2,
  },
  bottom: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    right: 18,
  },
  eraPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(233,161,92,0.4)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  eraPillLabel: {
    fontFamily: typography.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.terracottaTextAlt,
  },
  name: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.textHeading,
    lineHeight: 30,
  },
  meta: {
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.textBodyAlt,
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
