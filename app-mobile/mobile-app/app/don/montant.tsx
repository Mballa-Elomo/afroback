import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PremiumButton } from '../../src/components/Buttons';
import { startPayment } from '../../src/payments/paiement';
import { MobileMoneyBadges, paymentErrorMessage } from '../../src/payments/MobileMoneyBadges';
import { colors, spacing, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';
import { Icon } from '../../src/components/Icons';

const PRESETS = [500, 1000, 2000, 5000];
/** Minimum accepté pour un don. */
const MIN_DON = 200;

function formatFcfa(n: number): string {
  return `${n.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Montant + paiement, fidèle dans l'esprit à design-reference-don.dc.excerpt.html
 * (une seule cause "Soutenir AFROBACK", décision du 2026-08-05). Paiement
 * Mobile Money réel via Campay depuis le 2026-09-29
 * (cdc-paiement-geniuspay.md) : l'écran paiement/retour confirme le don.
 * Le "don mensuel" est retiré tant qu'aucun prélèvement automatique n'existe
 * (jamais un bouton qui promet ce qu'il ne fait pas).
 */
export default function DonMontantScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [preset, setPreset] = useState<number | null>(1000);
  const [custom, setCustom] = useState('');
  const [anonyme, setAnonyme] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const montant = useMemo(() => {
    const customValue = parseInt(custom, 10);
    if (!Number.isNaN(customValue) && custom.trim().length > 0) return customValue;
    return preset ?? 0;
  }, [preset, custom]);

  const pickPreset = (amount: number) => {
    setPreset(amount);
    setCustom('');
  };

  const submit = async () => {
    if (submitting) return;
    if (montant < MIN_DON) {
      setError(t('paiement.errors.amount'));
      return;
    }
    setSubmitting(true);
    setError(null);
    const { paiementId, error: err } = await startPayment({ type: 'don', montant, anonyme });
    if (err || !paiementId) {
      setSubmitting(false);
      setError(paymentErrorMessage(t, err));
      return;
    }
    if (Platform.OS !== 'web') {
      setSubmitting(false);
      router.push({ pathname: '/paiement/retour', params: { id: paiementId } });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
          </Pressable>
          <Text style={styles.title}>Ton don</Text>
        </View>

        <View style={styles.causeCard}>
          <Text style={styles.causeTag}>PLATEFORME</Text>
          <Text style={styles.causeName}>Soutenir AFROBACK</Text>
        </View>

        <Text style={styles.sectionTitle}>MONTANT</Text>
        <View style={styles.presetsGrid}>
          {PRESETS.map((amount) => {
            const active = preset === amount && custom.trim().length === 0;
            return (
              <Pressable
                key={amount}
                onPress={() => pickPreset(amount)}
                style={[styles.preset, active && styles.presetActive]}
              >
                <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>{formatFcfa(amount)}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={custom}
          onChangeText={(v) => {
            setCustom(v.replace(/[^0-9]/g, ''));
            setPreset(null);
          }}
          placeholder="Autre montant (200 FCFA minimum)"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          style={styles.input}
        />

        <Pressable style={styles.toggleRow} onPress={() => setAnonyme((v) => !v)}>
          <View style={[styles.checkbox, anonyme && styles.checkboxActive]}>
            {anonyme && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={styles.toggleLabel}>Faire un don anonyme</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>MODE DE PAIEMENT</Text>
        <MobileMoneyBadges />
        <View style={{ height: 18 }} />

        <View style={styles.recapCard}>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>Cause</Text>
            <Text style={styles.recapValue}>Soutenir AFROBACK</Text>
          </View>
          <View style={[styles.recapRow, styles.recapTotalRow]}>
            <Text style={styles.recapTotalLabel}>Total</Text>
            <Text style={styles.recapTotalValue}>
              {formatFcfa(montant)}
            </Text>
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <PremiumButton
          label={t('paiement.donate', { amount: formatFcfa(montant) })}
          icon="heart"
          onPress={submit}
          loading={submitting}
          disabled={montant <= 0}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.md + 2,
    paddingTop: 6,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  backIcon: {
    fontSize: 20,
    color: colors.accentGold,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textHeading,
  },
  causeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  causeTag: {
    fontFamily: typography.mono,
    fontSize: 8,
    color: colors.terracottaTextAlt,
    marginRight: 8,
  },
  causeName: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  preset: {
    width: '47%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.cardBg,
  },
  presetLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  presetLabelActive: {
    color: colors.accentGold,
  },
  input: {
    fontFamily: typography.body,
    fontSize: 14,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.textPrimary,
    marginBottom: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
  },
  toggleLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.accentGold,
  },
  checkboxMark: {
    fontSize: 12,
    color: colors.ctaTextOnGold,
    fontWeight: '700',
  },
  recapCard: {
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  recapLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textBodyAlt,
  },
  recapValue: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textPrimary,
  },
  recapTotalRow: {
    marginBottom: 0,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderHairline,
  },
  recapTotalLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.textHeading,
  },
  recapTotalValue: {
    fontFamily: typography.mono,
    fontSize: 15,
    color: colors.accentGold,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.terracottaText,
    marginBottom: 14,
  },
});
