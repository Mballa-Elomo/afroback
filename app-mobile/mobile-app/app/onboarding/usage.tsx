import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldButton } from '../../src/components/Buttons';
import { StepHeader } from '../../src/onboarding/StepHeader';
import { useWizardState } from '../../src/onboarding/WizardState';
import { colors, typography } from '../../src/theme/tokens';

const USAGE_OPTIONS = [
  {
    id: 'decouverte',
    icon: '🌍',
    title: 'Découvrir, apprendre et faire vivre mes racines',
    subtitle: 'Usage grand public · toujours actif',
  },
  {
    id: 'enfants',
    icon: '👦',
    title: 'Créer des profils pour mes enfants',
    subtitle: 'Espace enfant sécurisé, façon Netflix',
  },
  {
    id: 'vendeur',
    icon: '🏆',
    title: 'Vendre mes créations sur la Marketplace',
    subtitle: 'Espace vendeur · abonnement séparé',
  },
];

/** Étape 3/5 — fidèle à la maquette "COMMENT VAS-TU UTILISER AFROBACK ?" (multi-sélection). */
export default function UsageStepScreen() {
  const router = useRouter();
  const { usages, toggleUsage } = useWizardState();

  const goNext = () => router.push('/onboarding/plan');

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <StepHeader step={3} onBack={() => router.back()} />

          <Text style={styles.title}>Comment vas-tu utiliser AFROBACK&nbsp;?</Text>
          <Text style={styles.subtitle}>Plusieurs choix possibles — on adapte ton parcours et ton tarif.</Text>

          <View style={styles.list}>
            {USAGE_OPTIONS.map((opt) => {
              const selected = usages.includes(opt.id);
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => toggleUsage(opt.id)}
                  style={[styles.card, selected && styles.cardSelected]}
                >
                  <Text style={styles.cardIcon}>{opt.icon}</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{opt.title}</Text>
                    <Text style={styles.cardSubtitle}>{opt.subtitle}</Text>
                  </View>
                  <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                    {selected && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.cta}>
            <GoldButton label="Continuer" onPress={goNext} />
          </View>
          <Pressable onPress={goNext} style={styles.skip}>
            <Text style={styles.skipLabel}>Je ne sais pas encore, j'explore d'abord</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 26,
    paddingTop: 14,
    paddingBottom: 40,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 24,
    lineHeight: 29,
    color: colors.textHeading,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 22,
  },
  list: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    padding: 16,
  },
  cardSelected: {
    borderColor: colors.accentGold,
  },
  cardIcon: {
    fontSize: 20,
    marginTop: 1,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14.5,
    lineHeight: 19,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  checkboxTick: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ctaTextOnGold,
  },
  cta: {
    marginTop: 6,
  },
  skip: {
    marginTop: 16,
    alignItems: 'center',
  },
  skipLabel: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
  },
});
