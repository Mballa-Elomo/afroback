import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n';
import { colors, typography } from '../theme/tokens';
import { useSettings } from './SettingsProvider';

/** Mode maintenance (back-office → Paramètres → Général) : message plein écran à la place de l'app. */
export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { general } = useSettings().settings;
  if (!general.maintenance) return <>{children}</>;
  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>AFROBACK</Text>
      <Text style={styles.title}>{t('maintenance.title')}</Text>
      <Text style={styles.body}>{general.message_maintenance || t('maintenance.body')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.background },
  brand: { fontFamily: typography.display, fontSize: 28, letterSpacing: 4, color: colors.accentGoldBright },
  title: { fontFamily: typography.bodyBold, fontSize: 18, color: colors.textHeading, marginTop: 24, textAlign: 'center' },
  body: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.textBody, marginTop: 10, textAlign: 'center' },
});
