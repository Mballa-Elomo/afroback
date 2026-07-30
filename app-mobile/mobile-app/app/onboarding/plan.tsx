import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StepHeader } from '../../src/onboarding/StepHeader';
import { useWizardState } from '../../src/onboarding/WizardState';
import { formatPlanPrice } from '../../src/onboarding/pricing';
import { colors, typography } from '../../src/theme/tokens';

/**
 * Étape 4/5 — fidèle à la maquette "CHOISIS TON FORFAIT". Racines et
 * Héritage mènent maintenant au vrai écran de paiement (`payment.tsx`) :
 * en l'absence de compte agrégateur Mobile Money (décision de Yannick du
 * 2026-07-30, voir context/AFROBACK.md), ce paiement reste simulé — voir
 * le bandeau explicite sur payment.tsx — mais le forfait choisi est
 * persisté normalement, prêt à basculer sur un vrai paiement le jour où
 * l'intégration existe.
 */
export default function PlanStepScreen() {
  const router = useRouter();
  const { billing, setBilling, setForfait } = useWizardState();

  const priceLabel = (plan: 'racines' | 'heritage') => formatPlanPrice(plan, billing);

  const choosePaid = (plan: 'racines' | 'heritage') => {
    setForfait(plan);
    router.push('/onboarding/payment');
  };

  const startFree = () => {
    setForfait('decouverte');
    router.push('/onboarding/welcome');
  };

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <StepHeader step={4} onBack={() => router.back()} />

          <Text style={styles.title}>Choisis ton forfait</Text>
          <Text style={styles.subtitle}>
            Pour ton usage personnel — tu pourras ajouter des profils enfants plus tard.
          </Text>

          <View style={styles.toggle}>
            <Pressable
              onPress={() => setBilling('monthly')}
              style={[styles.togglePill, billing === 'monthly' && styles.togglePillActive]}
            >
              <Text style={[styles.toggleLabel, billing === 'monthly' && styles.toggleLabelActive]}>Mensuel</Text>
            </Pressable>
            <Pressable
              onPress={() => setBilling('yearly')}
              style={[styles.togglePill, billing === 'yearly' && styles.togglePillActive]}
            >
              <Text style={[styles.toggleLabel, billing === 'yearly' && styles.toggleLabelActive]}>
                Annuel · -17%
              </Text>
            </Pressable>
          </View>

          <View style={styles.plans}>
            <View style={[styles.card, styles.cardHighlight]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.planName}>Découverte</Text>
                <Text style={styles.planPrice}>Gratuit</Text>
              </View>
              <Text style={styles.planDesc}>
                Héros en accès limité · Découverte complète · 1 langue · Communauté en lecture · 1 profil enfant
              </Text>
              <Pressable style={styles.outlineBtn} onPress={startFree}>
                <Text style={styles.outlineBtnLabel}>Commencer gratuitement</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.planName}>Racines</Text>
                <Text style={styles.planPrice}>{priceLabel('racines')}</Text>
              </View>
              <Text style={styles.planDesc}>
                Héros en accès complet · 4 langues camerounaises · -5% Marketplace · Publication + badge membre
              </Text>
              <GradientBtn label="Choisir Racines" onPress={() => choosePaid('racines')} />
            </View>

            <View style={[styles.card, styles.cardHighlight]}>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedLabel}>RECOMMANDÉ</Text>
              </View>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.planName}>Héritage</Text>
                <Text style={styles.planPrice}>{priceLabel('heritage')}</Text>
              </View>
              <Text style={styles.planDesc}>
                Tout Racines + contenus exclusifs · avant-première musées 360° · suivi langues avancé · -10%
                Marketplace · badge premium + accès prioritaire
              </Text>
              <GradientBtn label="Choisir Héritage" onPress={() => choosePaid('heritage')} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function GradientBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.gradientBtnWrap}>
      <LinearGradient
        colors={[...colors.ctaGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBtn}
      >
        <Text style={styles.gradientBtnLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
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
    fontSize: 25,
    color: colors.textHeading,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 20,
  },
  toggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  togglePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  togglePillActive: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  toggleLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  toggleLabelActive: {
    color: colors.ctaTextOnGold,
  },
  plans: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    padding: 18,
    position: 'relative',
  },
  cardHighlight: {
    borderColor: colors.accentGold,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    left: 18,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: colors.accentGold,
  },
  recommendedLabel: {
    fontFamily: typography.monoBold,
    fontSize: 9,
    letterSpacing: 0.6,
    color: colors.ctaTextOnGold,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planName: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.textHeading,
  },
  planPrice: {
    fontFamily: typography.monoBold,
    fontSize: 13,
    color: colors.accentGold,
  },
  planDesc: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: 16,
  },
  outlineBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accentGold,
    paddingVertical: 13,
    alignItems: 'center',
  },
  outlineBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13.5,
    color: colors.accentGold,
  },
  gradientBtnWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 13,
    alignItems: 'center',
  },
  gradientBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13.5,
    color: colors.ctaTextOnGold,
  },
});
