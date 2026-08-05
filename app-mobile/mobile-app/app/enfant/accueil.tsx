import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { useActiveProfile } from '../../src/profils/ActiveProfileProvider';
import { PinGate } from '../../src/profils/PinGate';
import { AVATAR_GRADIENTS } from '../../src/profils/enfantPalette';
import { pickHeroDuJour } from '../../src/profils/heroDuJour';
import { useHeroesList } from '../../src/data/useHeroesData';
import { colors, radii, typography } from '../../src/theme/tokens';

/**
 * Accueil enfant — fidèle à design-reference-parent-enfant.dc.excerpt.html
 * (KID HOME), avec un traitement honnête carte par carte (décidé par le
 * chef de projet, voir mobile-app/README.md) :
 * - "Jeu du jour" est remplacé par "École des Héros" (2026-08-05, voir
 *   context/AFROBACK.md) : premier vrai mécanisme gamifié de l'app. "Apprendre
 *   une langue" reste "bientôt disponible" (pilier langues toujours bloqué).
 * - "Histoire du jour" : un vrai héros du catalogue (jamais "Mansa Moussa",
 *   qui n'existe pas dans les 9 héros réels), traitement simplifié — voir
 *   enfant/histoire.tsx.
 * - "Carnet d'explorateur" : vrai contenu Découverte, seulement si le
 *   parent a laissé le réglage "Découverte activée" sur ce profil.
 */
export default function AccueilEnfantScreen() {
  const router = useRouter();
  const { state, returnToSelector } = useActiveProfile();
  const [pinVisible, setPinVisible] = useState(false);
  const heroesState = useHeroesList();

  if (state.status !== 'child') return <Redirect href="/profils/selection" />;
  const { profil } = state;

  const heroDuJour = heroesState.status === 'ready' ? pickHeroDuJour(heroesState.data) : undefined;

  const bientotDisponible = (titre: string) =>
    Alert.alert(titre, "Ce contenu n'est pas encore disponible — reviens bientôt !");

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: AVATAR_GRADIENTS[profil.avatar_couleur][0] }]}>
            <Text style={styles.avatarLetter}>{profil.prenom.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.headerBody}>
            <Text style={styles.hello}>Salut,</Text>
            <Text style={styles.name}>{profil.prenom} !</Text>
          </View>
          <Pressable onPress={() => setPinVisible(true)} hitSlop={10}>
            <Text style={styles.returnIcon}>↩</Text>
          </Pressable>
        </View>

        <Pressable style={styles.gameCard} onPress={() => router.push('/enfant/ecole')}>
          <Text style={styles.gameEmoji}>🏅</Text>
          <Text style={styles.gameKicker}>ÉCOLE DES HÉROS</Text>
          <Text style={styles.gameTitle}>Découvre tes{'\n'}héros africains</Text>
          <View style={styles.gamePill}>
            <Text style={styles.gamePillLabel}>Jouer ▶</Text>
          </View>
        </Pressable>

        <View style={styles.grid}>
          <Pressable style={[styles.tile, styles.tileBlue]} onPress={() => bientotDisponible('Apprendre une langue')}>
            <Text style={styles.tileEmoji}>🗣️</Text>
            <Text style={styles.tileTitle}>Apprendre{'\n'}une langue</Text>
          </Pressable>
          <Pressable
            style={[styles.tile, styles.tileGold]}
            onPress={() => (heroDuJour ? router.push({ pathname: '/enfant/histoire', params: { slug: heroDuJour.slug } }) : undefined)}
            disabled={!heroDuJour}
          >
            <Text style={styles.tileEmoji}>📖</Text>
            <Text style={styles.tileTitle}>Histoire :{'\n'}{heroDuJour?.nom_affiche ?? '…'}</Text>
          </Pressable>
        </View>

        {profil.decouverte_activee && (
          <Pressable style={styles.carnetCard} onPress={() => router.push('/enfant/carnet')}>
            <Text style={styles.carnetEmoji}>🧭</Text>
            <View style={styles.carnetBody}>
              <Text style={styles.carnetTitle}>Carnet d'explorateur</Text>
              <Text style={styles.carnetSubtitle}>Découvre un village africain !</Text>
            </View>
          </Pressable>
        )}
      </ScrollView>

      <PinGate
        visible={pinVisible}
        onCancel={() => setPinVisible(false)}
        onSuccess={() => {
          setPinVisible(false);
          returnToSelector();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 18,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.accentGoldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: typography.display,
    fontSize: 20,
    color: '#fff',
  },
  headerBody: {
    flex: 1,
  },
  hello: {
    fontSize: 12,
    color: colors.terracottaTextAlt,
  },
  name: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.textHeading,
  },
  returnIcon: {
    fontSize: 22,
    color: colors.accentGold,
  },
  gameCard: {
    borderRadius: 26,
    padding: 22,
    backgroundColor: '#A0392C',
    marginBottom: 16,
    overflow: 'hidden',
  },
  gameEmoji: {
    position: 'absolute',
    right: -6,
    bottom: -10,
    fontSize: 80,
    opacity: 0.25,
  },
  gameKicker: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: '#FFE6C9',
  },
  gameTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: '#fff',
    marginVertical: 6,
  },
  gamePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  gamePillLabel: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 13,
    color: '#A0392C',
  },
  grid: {
    flexDirection: 'row',
    gap: 14,
  },
  tile: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  tileBlue: {
    backgroundColor: '#274a63',
  },
  tileGold: {
    backgroundColor: '#B06A1E',
  },
  tileEmoji: {
    fontSize: 34,
  },
  tileTitle: {
    fontFamily: typography.display,
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  carnetCard: {
    marginTop: 16,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#3A2E63',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  carnetEmoji: {
    fontSize: 34,
  },
  carnetBody: {
    flex: 1,
  },
  carnetTitle: {
    fontFamily: typography.display,
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  carnetSubtitle: {
    fontSize: 12,
    color: '#D6CBEF',
    marginTop: 2,
  },
});
