import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { Icon } from '../components/Icons';
import { useI18n } from '../i18n';
import { colors, typography } from '../theme/tokens';

/**
 * Message affiché sur l'appareil qui vient d'être déconnecté parce que le
 * compte a été validé sur un autre appareil (cdc-appareil-unique.md).
 * Visible sur "Bienvenue dans ton voyage" et la connexion, jusqu'à "J'ai compris".
 */
export function SessionEndedNotice() {
  const { t } = useI18n();
  const { sessionEndedReason, clearSessionEndedReason } = useAuth();
  if (sessionEndedReason !== 'autre_appareil') return null;
  return (
    <View style={styles.card} accessibilityRole="alert">
      <View style={styles.row}>
        <Icon name="shield" size={20} color={colors.terracottaText} />
        <Text style={styles.title}>{t('device.replacedTitle')}</Text>
      </View>
      <Text style={styles.text}>{t('device.replaced')}</Text>
      <Pressable onPress={clearSessionEndedReason} hitSlop={8} accessibilityRole="button" style={styles.btn}>
        <Text style={styles.btnText}>{t('device.dismiss')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(160,82,45,.6)',
    backgroundColor: 'rgba(20,12,8,.92)',
    marginBottom: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: typography.bodyBold, fontSize: 14.5, color: colors.textPrimary },
  text: { fontFamily: typography.body, fontSize: 13.5, lineHeight: 20, color: colors.textBody, marginTop: 6 },
  btn: { alignSelf: 'flex-end', marginTop: 8, paddingVertical: 4 },
  btnText: { fontFamily: typography.bodySemiBold, fontSize: 13.5, color: colors.accentGoldPale },
});
