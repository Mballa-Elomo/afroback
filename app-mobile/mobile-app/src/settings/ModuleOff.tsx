import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '../i18n';
import { GoldButton } from '../components/Buttons';
import { colors, typography } from '../theme/tokens';
import { useModules, type Settings } from './SettingsProvider';

/** Écran affiché à la place d'un module coupé depuis le back-office (Paramètres → Modules). */
export function ModuleOff() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.inner}>
        <Text style={styles.title}>{t('moduleOff.title')}</Text>
        <Text style={styles.body}>{t('moduleOff.body')}</Text>
        <View style={{ marginTop: 22, alignSelf: 'stretch' }}>
          <GoldButton label={t('moduleOff.home')} onPress={() => router.replace('/')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

/** Affiche `children` si le module est actif, sinon l'écran « momentanément indisponible ». */
export function ModuleGate({ module, children }: { module: keyof Settings['modules']; children: ReactNode }) {
  const modules = useModules();
  return modules[module] ? <>{children}</> : <ModuleOff />;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontFamily: typography.display, fontSize: 22, color: colors.textHeading, textAlign: 'center' },
  body: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.textBody, textAlign: 'center', marginTop: 10 },
});
