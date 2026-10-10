import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useOwnProfile } from '../../src/profile/ownProfile';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/auth/AuthProvider';
import { useActiveProfile } from '../../src/profils/ActiveProfileProvider';
import { PinGate } from '../../src/profils/PinGate';
import { COUNTRIES } from '../../src/components/CountryPicker';
import { Icon, type IconName } from '../../src/components/Icons';
import { ProfileAvatar } from '../../src/components/ProfileAvatar';
import { colors, typography } from '../../src/theme/tokens';
import { withAccount } from '../../src/auth/AccountWall';
import { useAccess } from '../../src/access/Access';
import { APP_LANGUAGES, currentLanguage, useI18n, type AppLanguage } from '../../src/i18n';
import { Flag } from '../../src/i18n/LanguageDropdown';
import { ProgressCard } from '../../src/quiz/QuizUI';
import { RenewBanner } from '../../src/payments/RenewBanner';
import { useMfaPolicy, useModules, usePaymentPolicy } from '../../src/settings/SettingsProvider';

const PLAN_LABELS: Record<string, string> = { racines: 'Racines', heritage: 'Héritage' };
const BG = '#0B0906';
const GOLD = colors.accentGoldBright;

/**
 * Profil (refonte du 2026-09-30, demande de Yannick : "moderne, avec des
 * icônes") : carte d'identité en dégradé (photo/avatar à anneau doré, pseudo,
 * forfait), 3 raccourcis, puis réglages groupés par thème avec pastilles
 * d'icône. La langue de l'app se change ici (feuille FR/EN), mémorisée sur
 * l'appareil et dans le compte. Données réelles : profil communautaire,
 * métadonnées du compte, forfait serveur (mon_abonnement).
 */
function ProfilScreen() {
  const pay = usePaymentPolicy();
  const router = useRouter();
  const { t, lang } = useI18n();
  const { session, signOut, updateLanguage, mfaStatus } = useAuth();
  const modules = useModules();
  const mfa = useMfaPolicy();
  const { children, returnToSelector } = useActiveProfile();
  const { subscription } = useAccess();
  const [pinVisible, setPinVisible] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  // Photo/avatar et pseudo partagés avec l'accueil, relus au retour sur l'onglet.
  const community = useOwnProfile();

  const meta = session?.user?.user_metadata ?? {};
  const prenom = (meta.prenom as string | undefined) ?? '';
  const country = COUNTRIES.find((c) => c.code === meta.pays || c.name === meta.pays);
  const pays = country ? `${country.flag} ${t(`country.${country.code}`)}` : ((meta.pays as string | undefined) ?? '—');
  const planName = subscription ? PLAN_LABELS[subscription.plan] ?? subscription.plan : t('profileTab.planFree');
  const planEnd = subscription?.ends_at
    ? t('profileTab.until', {
        date: new Date(subscription.ends_at).toLocaleDateString(currentLanguage() === 'en' ? 'en-GB' : 'fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      })
    : null;
  const usages = (meta.usages as string[] | undefined) ?? [];
  const identifier = session?.user?.email ?? (session?.user?.phone ? `+${session.user.phone}` : '—');
  const langLabel = APP_LANGUAGES.find((l) => l.code === lang)?.label ?? 'Français';

  const chooseLanguage = async (code: AppLanguage) => {
    setLangOpen(false);
    if (code !== lang) await updateLanguage(code);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Carte d'identité */}
        <LinearGradient
          colors={['#3A2410', '#1C130B', '#120D08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} pointerEvents="none" />
          <Pressable
            onPress={() => router.push('/profil/modifier')}
            style={styles.heroEdit}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('profileTab.edit')}
          >
            <Icon name="pencil" size={16} color={colors.accentGoldPale} />
          </Pressable>

          <Pressable onPress={() => router.push('/profil/modifier')} accessibilityRole="button" accessibilityLabel={t('profileTab.edit')}>
            <View style={styles.ring}>
              <ProfileAvatar value={community?.avatar ?? null} size={92} name={community?.pseudo || prenom} />
            </View>
          </Pressable>
          <Text style={styles.name}>{prenom || t('profileTab.fallbackName')}</Text>
          {!!community?.pseudo && <Text style={styles.pseudo}>@{community.pseudo}</Text>}

          <Pressable onPress={() => router.push('/abonnement')} style={[styles.planChip, subscription && styles.planChipPaid]} accessibilityRole="button">
            <Icon name="crown" size={15} color={subscription ? colors.ctaTextOnGold : GOLD} />
            <Text style={[styles.planText, subscription && styles.planTextPaid]}>
              {planName}
              {subscription?.resilie_le ? ` · ${t('profileTab.cancelled')}` : ''}
              {planEnd ? ` · ${planEnd}` : ''}
            </Text>
          </Pressable>
          {!subscription && (
            <Pressable onPress={() => router.push('/abonnement')} hitSlop={8} accessibilityRole="button">
              <Text style={styles.upgrade}>{t('profileTab.upgrade')} ›</Text>
            </Pressable>
          )}
        </LinearGradient>

        <RenewBanner style={{ marginTop: 16 }} />

        {/* Progression des quiz (cdc-quiz-progression.md §4.4), cachée tant que le serveur n'est pas prêt. */}
        <ProgressCard style={{ marginTop: 16 }} />

        {/* Raccourcis */}
        <View style={styles.quick}>
          <QuickAction icon="pencil" label={t('profileTab.quickEdit')} onPress={() => router.push('/profil/modifier')} />
          <QuickAction icon="crown" label={t('profileTab.quickPlan')} onPress={() => router.push('/abonnement')} />
          {pay.dons && <QuickAction icon="heart" label={t('profileTab.quickDonate')} onPress={() => router.push('/don')} />}
        </View>

        <Section title={t('profileTab.sectionAccount')}>
          <SettingRow icon="mapPin" label={t('profileTab.country')} value={pays} onPress={() => router.push('/profil/modifier')} />
          <SettingRow
            icon="compass"
            label={t('profileTab.usages')}
            value={usages.length > 0 ? usages.map((u) => t(`usage.${u}.title`)).join(' · ') : '—'}
            onPress={() => router.push('/profil/modifier')}
          />
          <SettingRow icon="phone" label={t('profileTab.identifier')} value={identifier} last />
        </Section>

        <Section title={t('profileTab.sectionPreferences')}>
          <SettingRow
            icon="globe"
            label={t('profileTab.languageRow')}
            value={langLabel}
            leading={<Flag code={lang} size={14} />}
            onPress={() => setLangOpen(true)}
            last
          />
        </Section>

        <Section title={t('profileTab.sectionSecurity')}>
          {/* Toujours visible pour un compte déjà protégé (il doit pouvoir gérer sa 2FA). */}
          {(mfa.disponible || mfaStatus !== 'not_enrolled') && <SettingRow icon="shield" label={t('profileTab.twoStep')} onPress={() => router.push('/profil/mfa')} />}
          <SettingRow icon="key" label={t('profileTab.password')} onPress={() => router.push('/profil/mot-de-passe')} />
          <SettingRow icon="trash" label={t('deleteAccount.row')} onPress={() => router.push('/profil/supprimer-compte')} last />
        </Section>

        {modules.espace_enfant && (
        <Section title={t('profileTab.sectionFamily')}>
          <SettingRow icon="users" label={t('profileTab.parent')} onPress={() => setPinVisible(true)} last={children.length === 0} />
          {children.length > 0 && <SettingRow icon="userPlus" label={t('profileTab.switchProfile')} onPress={returnToSelector} last />}
        </Section>
        )}

        <Pressable style={styles.logout} onPress={() => signOut()} accessibilityRole="button">
          <Icon name="logout" size={18} color={colors.terracottaText} />
          <Text style={styles.logoutText}>{t('profileTab.logout')}</Text>
        </Pressable>
        <Text style={styles.footer}>{t('profileTab.version')}</Text>
      </ScrollView>

      {/* Choix de la langue */}
      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setLangOpen(false)} accessibilityLabel={t('common.cancel')}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('profileTab.languageSheet')}</Text>
            {APP_LANGUAGES.map((l) => {
              const selected = l.code === lang;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => chooseLanguage(l.code)}
                  style={[styles.langOption, selected && styles.langOptionOn]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Flag code={l.code} size={20} />
                  <Text style={styles.langLabel}>{l.label}</Text>
                  {selected && <Icon name="check" size={18} color={GOLD} strokeWidth={2.6} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <PinGate
        visible={pinVisible}
        onCancel={() => setPinVisible(false)}
        onSuccess={() => {
          setPinVisible(false);
          router.push('/profils/parent');
        }}
      />
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.quickTile, pressed && styles.pressed]} onPress={onPress} accessibilityRole="button">
      <View style={styles.quickIcon}>
        <Icon name={icon} size={20} color={GOLD} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  leading,
  onPress,
  last,
}: {
  icon: IconName;
  label: string;
  value?: string;
  leading?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const content = (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={18} color={GOLD} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        {!!value && (
          <View style={styles.rowValueLine}>
            {leading}
            <Text style={styles.rowValue} numberOfLines={1}>
              {value}
            </Text>
          </View>
        )}
      </View>
      {onPress && <Icon name="chevronRight" size={16} color={colors.textMuted} />}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 36 },
  hero: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.28)',
    paddingTop: 26,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(240,195,107,.06)',
  },
  heroEdit: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,9,6,.45)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.35)',
  },
  ring: { padding: 4, borderRadius: 999, borderWidth: 2, borderColor: GOLD },
  name: { fontFamily: typography.display, fontSize: 24, color: colors.textHeading, marginTop: 14, textAlign: 'center' },
  pseudo: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.accentGoldPale, marginTop: 3 },
  planChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.5)',
    backgroundColor: 'rgba(240,195,107,.08)',
  },
  planChipPaid: { backgroundColor: GOLD, borderColor: GOLD },
  planText: { fontFamily: typography.bodyBold, fontSize: 13, color: colors.accentGoldPale },
  planTextPaid: { color: colors.ctaTextOnGold },
  upgrade: { fontFamily: typography.bodySemiBold, fontSize: 13, color: GOLD, marginTop: 10 },
  quick: { flexDirection: 'row', gap: 10, marginTop: 16 },
  quickTile: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    backgroundColor: 'rgba(26,19,13,.95)',
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.12)',
  },
  quickLabel: { fontFamily: typography.bodySemiBold, fontSize: 12.5, color: colors.textPrimary },
  pressed: { opacity: 0.7 },
  section: { marginTop: 24 },
  sectionTitle: {
    fontFamily: typography.mono,
    fontSize: 10.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
    marginLeft: 6,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    backgroundColor: 'rgba(26,19,13,.95)',
    paddingHorizontal: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(237,227,212,.07)' },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.12)',
  },
  rowBody: { flex: 1 },
  rowLabel: { fontFamily: typography.bodySemiBold, fontSize: 14.5, color: colors.textPrimary },
  rowValueLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  rowValue: { flexShrink: 1, fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(227,162,119,.35)',
    backgroundColor: 'rgba(139,58,47,.12)',
  },
  logoutText: { fontFamily: typography.bodyBold, fontSize: 14.5, color: colors.terracottaText },
  footer: { fontFamily: typography.mono, fontSize: 10.5, color: colors.textMuted, textAlign: 'center', marginTop: 18, letterSpacing: 0.6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#15100B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.25)',
    padding: 20,
    paddingBottom: 34,
    gap: 10,
  },
  sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: 'rgba(237,227,212,.25)', marginBottom: 6 },
  sheetTitle: { fontFamily: typography.display, fontSize: 20, color: colors.textHeading, marginBottom: 6 },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.12)',
    backgroundColor: 'rgba(26,19,13,.95)',
  },
  langOptionOn: { borderColor: GOLD, backgroundColor: 'rgba(240,195,107,.08)' },
  langLabel: { flex: 1, fontFamily: typography.bodySemiBold, fontSize: 15.5, color: colors.textPrimary },
});

// Réservé aux comptes : un invité voit une invitation à la place (mode invité, cdc-onboarding.md section 4).
export default withAccount(ProfilScreen, 'profile');
