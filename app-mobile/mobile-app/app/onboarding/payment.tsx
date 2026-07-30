import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StepHeader } from '../../src/onboarding/StepHeader';
import { WarningBanner } from '../../src/components/WarningBanner';
import { useWizardState } from '../../src/onboarding/WizardState';
import { formatPlanPrice, PLAN_NAMES, type PaidPlan } from '../../src/onboarding/pricing';
import { colors, typography } from '../../src/theme/tokens';

type Method = 'orange' | 'mtn' | 'card';

/**
 * Étape 4/5 (suite de plan.tsx) — fidèle à la maquette "PAIEMENT" (Orange
 * Money présélectionné, MTN MoMo, carte bancaire, récap, bouton "Payer").
 *
 * Aucun agrégateur Mobile Money n'est encore branché (Yannick n'a pas de
 * compte marchand à ce jour, voir context/AFROBACK.md) : ce paiement est
 * donc simulé plutôt que réel, mais annoncé explicitement comme tel — même
 * règle que partout ailleurs dans l'app ("jamais un bouton mort" caché
 * derrière un état trompeur). Le forfait choisi est bien persisté à la fin
 * de l'assistant (voir welcome.tsx), avec un statut `payment_status:
 * 'simulated'` distinct d'un vrai paiement pour ne pas polluer les futures
 * données de facturation réelles.
 */
export default function PaymentStepScreen() {
  const router = useRouter();
  const { forfait, billing } = useWizardState();
  const [method, setMethod] = useState<Method>('orange');
  const [loading, setLoading] = useState(false);

  // Cet écran n'est atteint que depuis plan.tsx pour Racines/Héritage.
  const plan = (forfait === 'decouverte' ? 'racines' : forfait) as PaidPlan;
  const planLabel = PLAN_NAMES[plan];
  const total = formatPlanPrice(plan, billing);

  const pay = () => {
    setLoading(true);
    // Simulation : pas d'appel réseau réel tant qu'aucun agrégateur n'est branché.
    setTimeout(() => {
      setLoading(false);
      router.push('/onboarding/welcome');
    }, 900);
  };

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <StepHeader step={4} onBack={() => router.back()} />

          <Text style={styles.title}>Paiement</Text>
          <Text style={styles.subtitle}>Vérifie ton récapitulatif avant de confirmer.</Text>

          <WarningBanner
            title="Mode démonstration"
            text="Aucun paiement réel n'est débité. L'intégration Mobile Money réelle sera activée dès qu'un compte agrégateur sera ouvert."
          />

          <View style={styles.recap}>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Forfait {planLabel}</Text>
              <Text style={styles.recapValue}>{total}</Text>
            </View>
            <View style={[styles.recapRow, styles.recapTotalRow]}>
              <Text style={styles.recapTotalLabel}>Total</Text>
              <Text style={styles.recapTotalValue}>{total}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>MOYEN DE PAIEMENT</Text>
          <View style={styles.methods}>
            <MethodRow
              badge="OM"
              badgeBg="#F60"
              badgeColor="#fff"
              label="Orange Money"
              selected={method === 'orange'}
              onPress={() => setMethod('orange')}
            />
            <MethodRow
              badge="MoMo"
              badgeBg="#FC0"
              badgeColor="#1a1109"
              label="MTN Mobile Money"
              selected={method === 'mtn'}
              onPress={() => setMethod('mtn')}
            />
            <MethodRow
              badge="💳"
              badgeBg="#223"
              badgeColor="#fff"
              label="Carte bancaire"
              selected={method === 'card'}
              onPress={() => setMethod('card')}
            />
          </View>

          <Pressable onPress={pay} disabled={loading} style={styles.payBtnWrap}>
            <LinearGradient
              colors={[...colors.ctaGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.payBtn}
            >
              {loading ? (
                <ActivityIndicator color={colors.ctaTextOnGold} />
              ) : (
                <Text style={styles.payBtnLabel}>Payer {total}</Text>
              )}
            </LinearGradient>
          </Pressable>
          <Text style={styles.disclaimer}>🔒 Paiement sécurisé · résiliable à tout moment</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MethodRow({
  badge,
  badgeBg,
  badgeColor,
  label,
  selected,
  onPress,
}: {
  badge: string;
  badgeBg: string;
  badgeColor: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.methodRow, selected && styles.methodRowSelected]}>
      <View style={[styles.methodBadge, { backgroundColor: badgeBg }]}>
        <Text style={[styles.methodBadgeLabel, { color: badgeColor }]}>{badge}</Text>
      </View>
      <Text style={[styles.methodLabel, selected && styles.methodLabelSelected]}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <Text style={styles.radioTick}>✓</Text>}
      </View>
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
    marginTop: 6,
    marginBottom: 16,
  },
  recap: {
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  recapLabel: {
    fontFamily: typography.body,
    fontSize: 13.5,
    color: colors.textBodyAlt,
  },
  recapValue: {
    fontFamily: typography.mono,
    fontSize: 13.5,
    color: colors.accentGold,
  },
  recapTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    marginTop: 6,
    paddingTop: 12,
  },
  recapTotalLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  recapTotalValue: {
    fontFamily: typography.monoBold,
    fontSize: 15,
    color: colors.textHeading,
  },
  sectionLabel: {
    fontFamily: typography.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 12,
  },
  methods: {
    gap: 10,
    marginBottom: 24,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    padding: 14,
  },
  methodRowSelected: {
    borderWidth: 1.5,
    borderColor: colors.accentGoldBright,
    backgroundColor: colors.cardBg,
  },
  methodBadge: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodBadgeLabel: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10,
  },
  methodLabel: {
    flex: 1,
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.textBodyAlt,
  },
  methodLabelSelected: {
    fontFamily: typography.bodyBold,
    color: colors.textPrimary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.accentGoldBright,
    borderColor: colors.accentGoldBright,
  },
  radioTick: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ctaTextOnGold,
  },
  payBtnWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  payBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.ctaTextOnGold,
  },
  disclaimer: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
