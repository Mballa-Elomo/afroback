import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { useActiveProfile } from '../../src/profils/ActiveProfileProvider';
import { PinGate } from '../../src/profils/PinGate';
import { AVATAR_GRADIENTS } from '../../src/profils/enfantPalette';
import { colors, radii, spacing, typography } from '../../src/theme/tokens';

/**
 * "Qui est-ce ?" — sélecteur de profil façon Netflix, fidèle à
 * design-reference-parent-enfant.dc.excerpt.html (PROFILE SELECTOR).
 * N'apparaît que si le parent a au moins un profil enfant (voir
 * ActiveProfileProvider) : sinon l'app va directement en mode adulte,
 * comme avant ce chantier.
 */
export default function ProfileSelectorScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { children, chooseAdult, chooseChild } = useActiveProfile();
  const [pinVisible, setPinVisible] = useState(false);

  const prenom = (session?.user?.user_metadata?.prenom as string | undefined) || 'Toi';
  const initiale = prenom.charAt(0).toUpperCase();

  const openParentSpace = () => setPinVisible(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoLetter}>A</Text>
        </View>
        <Text style={styles.title}>QUI EST-CE ?</Text>
        <Text style={styles.subtitle}>Un seul compte, plusieurs profils. Choisis le tien pour retrouver ton fil.</Text>

        <View style={styles.grid}>
          <Pressable style={styles.tile} onPress={chooseAdult}>
            <View style={[styles.avatar, styles.avatarAdult]}>
              <Text style={styles.avatarLetter}>{initiale}</Text>
            </View>
            <Text style={styles.tileName}>{prenom}</Text>
            <Text style={styles.tileMeta}>Adulte</Text>
          </Pressable>

          {children.map((c) => (
            <Pressable key={c.id} style={styles.tile} onPress={() => chooseChild(c)}>
              <View style={[styles.avatar, { backgroundColor: undefined }, gradientStyle(c.avatar_couleur)]}>
                <Text style={styles.avatarLetterChild}>{c.prenom.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.tileName}>
                {c.prenom} <Text style={styles.tileNameTag}>· enfant</Text>
              </Text>
              <Text style={styles.tileMeta}>{c.age} ans</Text>
            </Pressable>
          ))}

          <Pressable style={styles.tile} onPress={() => router.push('/profils/ajouter')}>
            <View style={styles.addTile}>
              <Text style={styles.addPlus}>+</Text>
            </View>
            <Text style={styles.addLabel}>Ajouter un{'\n'}profil enfant</Text>
          </Pressable>
        </View>

        <Pressable onPress={openParentSpace}>
          <Text style={styles.parentLink}>Gérer les profils (Espace Parent)</Text>
        </Pressable>
      </View>

      <PinGate
        visible={pinVisible}
        onCancel={() => setPinVisible(false)}
        onSuccess={() => {
          setPinVisible(false);
          router.push('/profils/parent');
        }}
      />
    </SafeAreaView>
  );
}

function gradientStyle(couleur: keyof typeof AVATAR_GRADIENTS) {
  const [from] = AVATAR_GRADIENTS[couleur];
  // Pas de vrai dégradé ici pour rester simple (Pressable + View, pas de
  // LinearGradient supplémentaire) : couleur de départ du dégradé en fond uni,
  // suffisant pour distinguer visuellement chaque enfant.
  return { backgroundColor: from };
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.placeholderStripeDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoLetter: {
    fontFamily: typography.display,
    fontSize: 26,
    color: colors.accentGold,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.accentGoldSoft,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMutedAlt,
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 19,
    marginBottom: 26,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 280,
    gap: 16,
  },
  tile: {
    width: '45%',
  },
  avatar: {
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAdult: {
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  avatarLetter: {
    fontFamily: typography.display,
    fontSize: 32,
    color: colors.accentGold,
  },
  avatarLetterChild: {
    fontFamily: typography.display,
    fontSize: 32,
    color: '#fff',
  },
  tileName: {
    marginTop: 8,
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  tileNameTag: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.terracottaTextAlt,
  },
  tileMeta: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  addTile: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.placeholderLabel,
  },
  addLabel: {
    marginTop: 8,
    fontSize: 11.5,
    color: colors.textMuted,
    textAlign: 'center',
  },
  parentLink: {
    marginTop: 30,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMutedAlt,
    textDecorationLine: 'underline',
  },
});
