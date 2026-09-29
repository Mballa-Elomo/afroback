import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useWizardState } from '../../src/onboarding/WizardState';
import { BrandMark, MotifFrieze, ONBOARDING_BG, PillButton } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';

/**
 * Écran 8 — style de la maquette "Je suis :" (cartes, bordure et pastille
 * dorées à la sélection), mais contenu de l'écran d'usage existant (décision
 * D1 du 2026-09-29) : un enfant ne crée jamais de compte et il n'y a pas de
 * rôle Enseignant. Multi-sélection, mêmes conséquences qu'avant sur la suite
 * (profils enfants, espace vendeur). Les 3 portraits de la maquette n'ont pas
 * encore été fournis : icônes dorées en attendant (cdc-onboarding.md, section 7).
 */
const USAGE_OPTIONS = [
  {
    id: 'decouverte',
    icon: 'compass' as const,
    title: 'Découvrir mes racines',
    subtitle: 'Histoires, héros, traditions · toujours actif',
  },
  {
    id: 'enfants',
    icon: 'family' as const,
    title: 'Créer des profils pour mes enfants',
    subtitle: 'Un espace enfant sécurisé, géré par toi',
  },
  {
    id: 'vendeur',
    icon: 'craft' as const,
    title: 'Vendre mes créations',
    subtitle: 'Espace vendeur sur la Marketplace',
  },
];

function OptionIcon({ name }: { name: 'compass' | 'family' | 'craft' }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={colors.accentGoldPale} strokeWidth={1.5}>
      {name === 'compass' && (
        <>
          <Circle cx={12} cy={12} r={9} />
          <Path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" strokeLinejoin="round" />
        </>
      )}
      {name === 'family' && (
        <>
          <Circle cx={8} cy={7} r={2.6} />
          <Circle cx={16.5} cy={9.5} r={2} />
          <Path d="M3.5 20c.6-3.8 2.3-6 4.5-6s3.9 2.2 4.5 6M13 20c.4-2.8 1.7-4.4 3.5-4.4S19.6 17.2 20 20" strokeLinecap="round" />
        </>
      )}
      {name === 'craft' && (
        <>
          <Path d="M5 10h14l-1.5 9.5h-11L5 10Z" strokeLinejoin="round" />
          <Path d="M8.5 10 12 4.5l3.5 5.5M5 13.5h14" strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

export default function UsageStepScreen() {
  const router = useRouter();
  const { usages, toggleUsage } = useWizardState();
  const { t } = useI18n();

  const goNext = () => router.replace('/onboarding/compte-cree');

  return (
    <View style={styles.wrap}>
      <View style={styles.frieze}>
        <MotifFrieze width={150} height={16} opacity={0.4} />
      </View>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.logo}>
            <BrandMark layout="inline" />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {t('usage.title')}
          </Text>
          <Text style={styles.subtitle}>{t('usage.subtitle')}</Text>

          <View style={styles.list}>
            {USAGE_OPTIONS.map((opt) => {
              // "decouverte" est l'usage de base, toujours actif (non désélectionnable).
              const isFixed = opt.id === 'decouverte';
              const selected = isFixed || usages.includes(opt.id);
              const title = t(`usage.${opt.id}.title`);
              const subtitle = t(`usage.${opt.id}.subtitle`);
              return (
                <Pressable
                  key={opt.id}
                  onPress={isFixed ? undefined : () => toggleUsage(opt.id)}
                  style={[styles.card, selected && styles.cardSelected]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected, disabled: isFixed }}
                  accessibilityLabel={`${title}. ${subtitle}`}
                >
                  <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
                    <OptionIcon name={opt.icon} />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardSubtitle}>{subtitle}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.note}>{t('usage.note')}</Text>
        </ScrollView>

        <View style={styles.bottom}>
          <PillButton label={t('common.continue')} onPress={goNext} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: ONBOARDING_BG },
  frieze: { position: 'absolute', bottom: 18, right: -20, transform: [{ rotate: '-8deg' }] },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  logo: { marginBottom: 26 },
  title: { fontFamily: typography.display, fontSize: 26, lineHeight: 32, color: colors.textHeading },
  subtitle: { fontFamily: typography.body, fontSize: 14.5, lineHeight: 21, color: colors.textBody, marginTop: 10 },
  list: { gap: 14, marginTop: 28 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 84,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.14)',
    backgroundColor: 'rgba(26,19,13,.85)',
  },
  cardSelected: {
    borderColor: colors.accentGoldBright,
    backgroundColor: 'rgba(240,195,107,.07)',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.08)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.25)',
  },
  iconCircleSelected: { borderColor: 'rgba(240,195,107,.6)' },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: typography.bodyBold, fontSize: 15, lineHeight: 20, color: colors.textPrimary },
  cardSubtitle: { fontFamily: typography.body, fontSize: 12.5, lineHeight: 17, color: colors.textMutedAlt, marginTop: 3 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(237,227,212,.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.accentGoldBright },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accentGoldBright },
  note: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textMutedAlt,
    marginTop: 18,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 18, paddingTop: 8 },
});
