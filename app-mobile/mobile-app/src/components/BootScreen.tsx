import { ActivityIndicator, StyleSheet, View } from 'react-native';
import i18n from '../i18n';
import { colors } from '../theme/tokens';

/**
 * Affiché pendant les courts chargements de démarrage ou de connexion (session,
 * vérification en 2 étapes, profils enfants) à la place d'un écran vide :
 * un écran noir sans rien donnait l'impression d'un plantage (retour de test
 * de Yannick du 2026-09-29, après un changement de mot de passe).
 */
export function BootScreen() {
  return (
    <View style={styles.wrap} accessibilityLabel={i18n.t('ui.loading')}>
      <ActivityIndicator size="large" color={colors.accentGoldBright} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0906' },
});
