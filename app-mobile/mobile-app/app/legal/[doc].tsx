import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '../../src/i18n';
import { LEGAL_DOCS, type LegalDocId } from '../../src/legal/documents';
import { BrandMark, ONBOARDING_BG } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';
import { Icon } from '../../src/components/Icons';

/**
 * Lecture des conditions d'utilisation (`/legal/cgu`) et de la politique de
 * confidentialité (`/legal/confidentialite`), dans la langue de l'app.
 * Accessible sans compte (depuis l'inscription) comme une fois connecté :
 * déclaré hors de tout groupe protégé dans app/_layout.tsx.
 */
export default function LegalScreen() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const entry = LEGAL_DOCS[doc as LegalDocId];
  if (!entry) return <Redirect href="/" />;
  const d = entry[lang] ?? entry.fr;

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={14} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.back')}>
            <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
          </Pressable>
          <BrandMark layout="inline" />
          <View style={styles.back} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title} accessibilityRole="header">
            {d.title}
          </Text>
          <Text style={styles.updated}>{d.updated}</Text>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{d.draftNotice}</Text>
          </View>
          {d.sections.map((s) => (
            <View key={s.title} style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {s.title}
              </Text>
              {s.paragraphs.map((p, i) => (
                <Text key={i} style={styles.paragraph}>
                  {p}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: ONBOARDING_BG },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 4 },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { fontSize: 30, color: colors.accentGold },
  scroll: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 48 },
  title: { fontFamily: typography.display, fontSize: 26, lineHeight: 32, color: colors.textHeading },
  updated: { fontFamily: typography.body, fontSize: 13, color: colors.textMutedAlt, marginTop: 6 },
  notice: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(224,162,74,.45)',
    backgroundColor: 'rgba(224,162,74,.08)',
  },
  noticeText: { fontFamily: typography.bodySemiBold, fontSize: 13.5, lineHeight: 20, color: colors.textPrimary },
  section: { marginTop: 24 },
  sectionTitle: { fontFamily: typography.bodyBold, fontSize: 16.5, color: colors.accentGoldPale, marginBottom: 8 },
  paragraph: { fontFamily: typography.body, fontSize: 15, lineHeight: 24, color: colors.textBody, marginBottom: 10 },
});
