import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldButton } from '../../src/components/Buttons';
import { StepHeader } from '../../src/onboarding/StepHeader';
import { useWizardState } from '../../src/onboarding/WizardState';
import { colors, typography } from '../../src/theme/tokens';

/**
 * Étape 2/5 de l'assistant post-inscription — fidèle à la maquette
 * "LANGUE DE L'INTERFACE". FR/EN changent réellement la préférence stockée
 * (voir completeOnboarding), mais l'app elle-même reste en français partout
 * pour l'instant : aucune traduction de l'interface n'est branchée (hors
 * scope de ce chantier). Les 4 langues camerounaises restent nonsélectionnables
 * et affichées "Traduction en cours", conformément à l'état réel du contenu
 * (voir context/AFROBACK.md — ewondo/douala/bassa/bamiléké non traduits).
 */
export default function LanguageStepScreen() {
  const router = useRouter();
  const { langueInterface, setLangueInterface } = useWizardState();

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <StepHeader step={2} onBack={() => router.back()} />

          <Text style={styles.title}>Langue de l'interface</Text>
          <Text style={styles.subtitle}>Tu pourras la changer à tout moment dans les paramètres.</Text>

          <View style={styles.list}>
            <LanguageRow
              code="FR"
              label="Français"
              selected={langueInterface === 'fr'}
              onPress={() => setLangueInterface('fr')}
            />
            <LanguageRow
              code="GB"
              label="English"
              selected={langueInterface === 'en'}
              onPress={() => setLangueInterface('en')}
            />
          </View>

          <Text style={styles.sectionLabel}>LANGUES DU CAMEROUN</Text>
          <View style={styles.list}>
            {['Ewondo', 'Douala', 'Bassa', 'Bamiléké'].map((label) => (
              <View key={label} style={[styles.row, styles.rowDisabled]}>
                <Text style={styles.silhouette}>👤</Text>
                <Text style={styles.rowLabelDisabled}>{label}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeLabel}>TRADUCTION EN COURS</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.cta}>
            <GoldButton label="Continuer" onPress={() => router.push('/onboarding/usage')} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function LanguageRow({
  code,
  label,
  selected,
  onPress,
}: {
  code: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, selected && styles.rowSelected]}>
      <View style={styles.codeBadge}>
        <Text style={styles.codeLabel}>{code}</Text>
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
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
    marginTop: 8,
    marginBottom: 22,
  },
  list: {
    gap: 12,
    marginBottom: 26,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    padding: 16,
  },
  rowSelected: {
    borderColor: colors.accentGold,
  },
  rowDisabled: {
    opacity: 0.55,
  },
  codeBadge: {
    width: 30,
    alignItems: 'flex-start',
  },
  codeLabel: {
    fontFamily: typography.monoBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  rowLabel: {
    flex: 1,
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowLabelDisabled: {
    flex: 1,
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  silhouette: {
    width: 30,
    fontSize: 16,
    opacity: 0.7,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  radioTick: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ctaTextOnGold,
  },
  sectionLabel: {
    fontFamily: typography.mono,
    fontSize: 10.5,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: 12,
  },
  badge: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontFamily: typography.mono,
    fontSize: 8.5,
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  cta: {
    marginTop: 6,
  },
});
