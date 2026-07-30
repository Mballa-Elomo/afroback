import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { GhostButton } from '../../src/components/Buttons';
import { HeroPlaceholder } from '../../src/components/HeroVisual';
import { colors, spacing, typography } from '../../src/theme/tokens';

const FORFAIT_LABELS: Record<string, string> = {
  decouverte: 'Découverte (gratuit)',
  racines: 'Racines',
  heritage: 'Héritage',
};

const USAGE_LABELS: Record<string, string> = {
  decouverte: 'Découvrir mes racines',
  enfants: 'Profils enfants',
  vendeur: 'Vendeur Marketplace',
};

/** Profil — vraies données du compte (Supabase Auth), pas une maquette figée. */
export default function ProfilScreen() {
  const { session, signOut } = useAuth();
  const meta = session?.user?.user_metadata ?? {};
  const prenom = (meta.prenom as string | undefined) ?? '';
  const pays = (meta.pays as string | undefined) ?? '—';
  const forfait = (meta.forfait as string | undefined) ?? 'decouverte';
  const usages = (meta.usages as string[] | undefined) ?? [];
  const langue = (meta.langue_interface as string | undefined) === 'en' ? 'English' : 'Français';
  const phone = session?.user?.phone ? `+${session.user.phone}` : '—';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <HeroPlaceholder style={styles.avatar} radius={40} />
          <Text style={styles.name}>{prenom || 'Ton profil'}</Text>
          <Text style={styles.phone}>{phone}</Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="PAYS" value={pays} />
          <Separator />
          <InfoRow label="FORFAIT" value={FORFAIT_LABELS[forfait] ?? forfait} />
          <Separator />
          <InfoRow label="LANGUE DE L'INTERFACE" value={langue} />
          <Separator />
          <InfoRow
            label="USAGES"
            value={usages.length > 0 ? usages.map((u) => USAGE_LABELS[u] ?? u).join(' · ') : '—'}
          />
        </View>

        <View style={styles.cta}>
          <GhostButton label="Déconnexion" onPress={() => signOut()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.md + 2,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 26,
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: 14,
  },
  name: {
    fontFamily: typography.display,
    fontSize: 21,
    color: colors.textHeading,
  },
  phone: {
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    paddingHorizontal: 18,
    paddingVertical: 4,
    marginBottom: 30,
  },
  row: {
    paddingVertical: 14,
  },
  rowLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 5,
  },
  rowValue: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14.5,
    color: colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderHairline,
  },
  cta: {},
});
