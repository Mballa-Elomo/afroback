import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldButton } from '../../src/components/Buttons';
import { createDon } from '../../src/data/donRepository';
import type { DonPaymentMethod } from '../../src/data/donTypes';
import { colors, radii, spacing, typography } from '../../src/theme/tokens';

const PRESETS = [500, 1000, 2000, 5000];

const PAYMENT_METHODS: { id: DonPaymentMethod; icon: string; name: string; sub: string }[] = [
  { id: 'mtn_momo', icon: '📱', name: 'MTN Mobile Money', sub: 'Confirmation manuelle par Yannick' },
  { id: 'orange_money', icon: '📱', name: 'Orange Money', sub: 'Confirmation manuelle par Yannick' },
];

function formatFcfa(n: number): string {
  return `${n.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Montant + paiement + confirmation, fidèle dans l'esprit à
 * design-reference-don.dc.excerpt.html (section DON AMOUNT+PAYMENT), avec la
 * simplification décidée par Yannick le 2026-08-05 : une seule cause
 * ("Soutenir AFROBACK") au lieu d'une carte de cause sélectionnée, pas de
 * bouton "partager" (aucune intégration de partage réelle, jamais un bouton
 * mort). Même règle que le checkout Marketplace : le don est réellement
 * enregistré en base (`statut = 'en_attente_paiement'`), jamais un faux
 * succès de paiement — Mobile Money n'est pas intégré à AFROBACK à ce jour.
 */
export default function DonMontantScreen() {
  const router = useRouter();
  const [preset, setPreset] = useState<number | null>(1000);
  const [custom, setCustom] = useState('');
  const [recurrent, setRecurrent] = useState(false);
  const [anonyme, setAnonyme] = useState(false);
  const [methode, setMethode] = useState<DonPaymentMethod>('mtn_momo');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [doneAmount, setDoneAmount] = useState(0);

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
    if (submitting || montant <= 0) return;
    setSubmitting(true);
    setError(null);
    const { don, error: apiError } = await createDon({
      montantFcfa: montant,
      recurrent,
      anonyme,
      methodePaiement: methode,
    });
    setSubmitting(false);
    if (apiError || !don) {
      setError(apiError ?? "Impossible d'enregistrer ton don pour le moment.");
      return;
    }
    setDoneAmount(montant);
    setDone(true);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.thanks}>
          <Text style={styles.thanksIcon}>🙏</Text>
          <Text style={styles.thanksTitle}>Merci pour ton soutien</Text>
          <Text style={styles.thanksText}>
            Ton don de {formatFcfa(doneAmount)}
            {recurrent ? ' par mois' : ''} pour AFROBACK a bien été enregistré. Le paiement Mobile Money n'est pas
            encore intégré : Yannick te contactera pour confirmer le règlement.
          </Text>
          <GoldButton label="Retour à l'accueil" onPress={() => router.replace('/accueil')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
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
          placeholder="Autre montant (FCFA)"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          style={styles.input}
        />

        <Pressable style={styles.toggleRow} onPress={() => setRecurrent((v) => !v)}>
          <View style={styles.toggleBody}>
            <Text style={styles.toggleLabel}>Don mensuel</Text>
            <Text style={styles.toggleSub}>Plutôt qu'un don ponctuel</Text>
          </View>
          <View style={[styles.switchTrack, recurrent && styles.switchTrackActive]}>
            <View style={[styles.switchKnob, recurrent && styles.switchKnobActive]} />
          </View>
        </Pressable>

        <Pressable style={styles.toggleRow} onPress={() => setAnonyme((v) => !v)}>
          <View style={[styles.checkbox, anonyme && styles.checkboxActive]}>
            {anonyme && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={styles.toggleLabel}>Faire un don anonyme</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>MODE DE PAIEMENT</Text>
        <View style={styles.methods}>
          {PAYMENT_METHODS.map((m) => {
            const active = methode === m.id;
            return (
              <Pressable key={m.id} onPress={() => setMethode(m.id)} style={[styles.method, active && styles.methodActive]}>
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <View style={styles.methodBody}>
                  <Text style={styles.methodName}>{m.name}</Text>
                  <Text style={styles.methodSub}>{m.sub}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>ℹ</Text>
          <Text style={styles.noticeText}>
            Le paiement en ligne n'est pas encore actif sur AFROBACK. Ton don sera enregistré, et Yannick te
            contactera pour confirmer le règlement.
          </Text>
        </View>

        <View style={styles.recapCard}>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>Cause</Text>
            <Text style={styles.recapValue}>Soutenir AFROBACK</Text>
          </View>
          <View style={[styles.recapRow, styles.recapTotalRow]}>
            <Text style={styles.recapTotalLabel}>Total</Text>
            <Text style={styles.recapTotalValue}>
              {formatFcfa(montant)}
              {recurrent ? ' /mois' : ''}
            </Text>
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <GoldButton
          label={submitting ? 'Enregistrement...' : 'Confirmer mon don'}
          onPress={submit}
          disabled={submitting || montant <= 0}
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
  toggleBody: {
    flex: 1,
  },
  toggleLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  toggleSub: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  switchTrack: {
    width: 40,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.placeholderStripeLight,
    padding: 2,
  },
  switchTrackActive: {
    backgroundColor: colors.accentGold,
  },
  switchKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  switchKnobActive: {
    marginLeft: 18,
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
  methods: {
    gap: 10,
    marginBottom: 18,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  methodActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.cardBg,
  },
  methodIcon: {
    fontSize: 18,
  },
  methodBody: {
    flex: 1,
  },
  methodName: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  methodSub: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  radioActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.accentGold,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    padding: 13,
    marginBottom: 18,
  },
  noticeIcon: {
    color: colors.accentGoldSoft,
    fontSize: 13,
  },
  noticeText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textMuted,
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
  thanks: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: 8,
  },
  thanksIcon: {
    fontSize: 56,
  },
  thanksTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textHeading,
    marginTop: 8,
  },
  thanksText: {
    fontFamily: typography.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textMutedAlt,
    textAlign: 'center',
    marginBottom: 24,
  },
});
