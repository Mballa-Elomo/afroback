import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme/tokens';
import { useI18n } from '../i18n';

/** Clé de traduction du message à afficher pour une erreur renvoyée par la fonction "campay". */
function errorKey(code?: string): string {
  switch (code) {
    case 'non_configure':
      return 'paiement.errors.notConfigured';
    case 'paiements_desactives':
    case 'dons_desactives':
    case 'abonnements_desactives':
      return 'paiement.errors.disabled';
    case 'operateur_indisponible':
      return 'paiement.errors.operator';
    case 'montant_invalide':
      return 'paiement.errors.amount';
    case 'non_authentifie':
      return 'paiement.errors.session';
    case 'reseau':
      return 'paiement.errors.network';
    default:
      return 'paiement.errors.generic';
  }
}

/**
 * Message traduit pour une erreur de startPayment(), suivi du détail technique
 * éventuel ("code|détail") entre parenthèses.
 */
export function paymentErrorMessage(t: (k: string) => string, raw?: string): string {
  const [code, detail] = (raw ?? '').split('|');
  const msg = t(errorKey(code));
  const generic = !!code && errorKey(code) === 'paiement.errors.generic';
  const extra = [generic ? code : null, detail].filter(Boolean).join(' · ');
  return extra ? `${msg} (${extra})` : msg;
}

/**
 * Moyens acceptés, affichés à titre d'information : le choix se fait sur la
 * page sécurisée Campay (cdc-paiement-geniuspay.md, D3).
 */
export function MobileMoneyBadges() {
  const { t } = useI18n();
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: '#FC0' }]}>
          <Text style={[styles.badgeLabel, { color: '#1a1109' }]}>MoMo</Text>
        </View>
        <Text style={styles.name}>{t('payment.mtn')}</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: '#F60' }]}>
          <Text style={[styles.badgeLabel, { color: '#fff' }]}>OM</Text>
        </View>
        <Text style={styles.name}>{t('payment.orange')}</Text>
      </View>
      <Text style={styles.hint}>{t('paiement.methodsHint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    padding: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeLabel: { fontFamily: typography.bodyExtraBold, fontSize: 10 },
  name: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.textPrimary },
  hint: { fontFamily: typography.body, fontSize: 12, lineHeight: 18, color: colors.textMuted, marginTop: 2 },
});
