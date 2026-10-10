import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccess } from '../access/Access';
import { Icon } from '../components/Icons';
import { colors, typography } from '../theme/tokens';
import { currentLanguage, useI18n } from '../i18n';
import { IN_APP_DIGITAL_PAYMENTS } from './storePolicy';

const THREE_DAYS = 3 * 24 * 3600 * 1000;

/**
 * Rappel de renouvellement (cdc-paiement-sans-sortie.md §4.4, D6) : 3 jours
 * avant la fin d'un abonnement payé et non résilié. Un toucher ouvre
 * directement le paiement du forfait en cours (Mobile Money ne permet pas de
 * débiter sans validation : pas de renouvellement automatique).
 */
export function RenewBanner({ style }: { style?: object }) {
  const router = useRouter();
  const { t } = useI18n();
  const { subscription } = useAccess();
  if (!IN_APP_DIGITAL_PAYMENTS) return null;
  if (!subscription?.ends_at || !subscription.resiliable || subscription.resilie_le) return null;
  const end = new Date(subscription.ends_at);
  if (end.getTime() - Date.now() > THREE_DAYS) return null;
  const date = end.toLocaleDateString(currentLanguage() === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long' });
  const plan = subscription.plan === 'heritage' ? 'Héritage' : 'Racines';
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/abonnement', params: { renouveler: '1' } })}
      style={({ pressed }) => [styles.banner, style, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
    >
      <Icon name="crown" size={18} color={colors.accentGoldBright} />
      <Text style={styles.text}>{t('abonnement.renewBanner', { plan, date })}</Text>
      <View style={styles.cta}>
        <Text style={styles.ctaText}>{t('abonnement.renew')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
    backgroundColor: 'rgba(240,195,107,.10)',
  },
  text: { flex: 1, fontFamily: typography.bodySemiBold, fontSize: 13, lineHeight: 18, color: colors.textPrimary },
  cta: { backgroundColor: colors.accentGoldBright, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  ctaText: { fontFamily: typography.bodyExtraBold, fontSize: 12.5, color: colors.ctaTextOnGold },
});
