import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';
import { Icon } from '../../../src/components/Icons';
import { useI18n } from '../../../src/i18n';

/**
 * Charte communautaire — contenu statique (voir data-model-communaute.md
 * §5 : brouillon rédigé par le chef de projet, pas encore un texte
 * définitif validé par Yannick). Versionné dans le code plutôt qu'en base,
 * conformément à la décision documentée dans le data model.
 */
const RULES = [
  {
    icon: '🤝',
    title: 'charter.r1t',
    text: 'charter.r1',
  },
  {
    icon: '🔎',
    title: 'charter.r2t',
    text: 'charter.r2',
  },
  {
    icon: '🚫',
    title: 'charter.r3t',
    text: 'charter.r3',
  },
  {
    icon: '📢',
    title: 'charter.r4t',
    text: 'charter.r4',
  },
  {
    icon: '🔒',
    title: 'charter.r5t',
    text: 'charter.r5',
  },
  {
    icon: '⚑',
    title: 'charter.r6t',
    text: 'charter.r6',
  },
];

export default function CharterScreen() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
          </Pressable>
          <Text style={styles.title}>{t('charter.title')}</Text>
        </View>

        <Text style={styles.intro}>
          {t('charter.intro')}
        </Text>

        <View style={styles.rules}>
          {RULES.map((r) => (
            <View key={r.title} style={styles.rule}>
              <Text style={styles.ruleIcon}>{r.icon}</Text>
              <View style={styles.ruleBody}>
                <Text style={styles.ruleTitle}>{t(r.title)}</Text>
                <Text style={styles.ruleText}>{t(r.text)}</Text>
              </View>
            </View>
          ))}
        </View>
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
  intro: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textBody,
    marginBottom: 20,
  },
  rules: {
    gap: 12,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: radii.button,
    padding: 14,
  },
  ruleIcon: {
    fontSize: 18,
  },
  ruleBody: {
    flex: 1,
  },
  ruleTitle: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.textHeading,
    marginBottom: 3,
  },
  ruleText: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
