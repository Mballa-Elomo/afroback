import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../src/ui/modern';
import { ListePartenaires } from '../src/sponsors/Sponsor';
import { colors } from '../src/theme/tokens';
import { useI18n } from '../src/i18n';

/** Page Partenaires (backoffice/cdc-module-sponsors.md) : sponsors actifs ayant cet emplacement. */
export default function PartenairesScreen() {
  const { lang } = useI18n();
  const router = useRouter();
  const en = lang === 'en';
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.titre}>{en ? 'Our partners' : 'Nos partenaires'}</Text>
        <Text style={styles.intro}>
          {en ? 'They support AFROBACK and the passing on of African heritage. Thank you to them.' : 'Ils soutiennent AFROBACK et la transmission du patrimoine africain. Merci à eux.'}
        </Text>
        <ListePartenaires />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 60 },
  titre: { fontSize: 28, fontWeight: '900', color: colors.textHeading, marginTop: 14 },
  intro: { fontSize: 14.5, lineHeight: 21, color: colors.textBody, marginTop: 8, marginBottom: 22 },
});
