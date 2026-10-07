import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GoldButton } from '../../src/components/Buttons';
import { colors, spacing, typography } from '../../src/theme/tokens';
import { Icon } from '../../src/components/Icons';
import { useI18n } from '../../src/i18n';

/**
 * Écran mission du module Don — version volontairement simplifiée par
 * rapport à design-reference-don.dc.excerpt.html (décision de Yannick,
 * 2026-08-05, voir context/AFROBACK.md) :
 * - une seule cause générique "Soutenir AFROBACK", pas de Hub à choisir
 *   parmi plusieurs causes (les deux points d'entrée — bannière accueil,
 *   menu Profil — arrivent DIRECTEMENT ici) ;
 * - pas de compteur "montant collecté / donateurs / causes financées"
 *   (Yannick : "AFROBACK est un vrai projet", pas de chiffre affiché tant
 *   qu'il n'est pas réel) ;
 * - pas de section "derniers donateurs" (aucun donateur réel à ce jour).
 *
 * Le texte de mission ci-dessous décrit des besoins réels et documentés du
 * projet (médias manquants pour 6 héros sur 9, traductions camerounaises
 * vides) — jamais un chiffre ou un donateur inventé.
 */
export default function DonMissionScreen() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cover}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
            <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
          </Pressable>
          <View style={styles.coverContent}>
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>{t('donate.platform')}</Text>
            </View>
            <Text style={styles.title}>{t('donate.title')}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.mission}>
            {t('donate.mission')}
          </Text>
          <Text style={styles.missionSecondary}>
            {t('donate.secondary')}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.ctaWrap}>
        <LinearGradient
          colors={['rgba(15,11,8,0)', colors.background]}
          locations={[0, 0.4]}
          style={StyleSheet.absoluteFill}
        />
        <GoldButton label={t('donate.cta')} onPress={() => router.push('/don/montant')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 110,
  },
  cover: {
    height: 240,
    backgroundColor: colors.placeholderStripeLight,
  },
  backButton: {
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
    zIndex: 5,
  },
  backIcon: {
    fontSize: 18,
    color: colors.accentGold,
  },
  coverContent: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    right: 18,
  },
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.terracottaTextAlt,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  tagLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.terracottaTextAlt,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 23,
    fontWeight: '700',
    color: colors.textHeading,
  },
  body: {
    paddingHorizontal: spacing.md + 2,
    paddingTop: 20,
  },
  mission: {
    fontFamily: typography.body,
    fontSize: 14.5,
    lineHeight: 23,
    color: colors.textBody,
    marginBottom: 14,
  },
  missionSecondary: {
    fontFamily: typography.bodyMedium,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textBodyAlt,
  },
  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md + 2,
    paddingBottom: 18,
  },
});
