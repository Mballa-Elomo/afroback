import { createContext, useCallback, useContext, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthProvider';
import { BrandMark, ONBOARDING_BG, PillButton } from '../onboarding/ui';
import { colors, typography } from '../theme/tokens';
import i18n, { useI18n } from '../i18n';
import type { Translation } from '../i18n/fr';

/**
 * Mode invité "Explorer sans compte" (cdc-onboarding.md, section 4) : un
 * invité lit librement les contenus publics (Héros, Découverte, Mythologie,
 * Marketplace, Communauté), mais toute action personnelle ou coûteuse
 * (narrations audio, vidéos, publier, commenter, acheter, donner, profil)
 * ouvre cette fenêtre au lieu de s'exécuter.
 *
 * - `useRequireAccount()` : pour un bouton — `requireAccount(action, raison)`
 *   exécute l'action si la personne a un compte, sinon ouvre la fenêtre.
 * - `withAccount(Écran, raison)` : pour une route entière — un invité voit
 *   un écran d'invitation à la place (filet de sécurité si un lien direct
 *   mène quand même à l'écran).
 */
/** Raison affichée dans la fenêtre : clé de `wall.reasons` (src/i18n), traduite à l'affichage. */
export type WallReason = keyof Translation['wall']['reasons'];

interface AccountWallValue {
  /** Exécute `action` si un compte est connecté ; sinon ouvre la fenêtre et renvoie false. */
  requireAccount: (action?: () => void, reason?: WallReason) => boolean;
}

const AccountWallContext = createContext<AccountWallValue | null>(null);


export function AccountWallProvider({ children }: { children: ReactNode }) {
  const { isGuest } = useAuth();
  const [reason, setReason] = useState<WallReason | null>(null);

  const requireAccount = useCallback(
    (action?: () => void, why?: WallReason) => {
      if (!isGuest) {
        action?.();
        return true;
      }
      setReason(why ?? 'default');
      return false;
    },
    [isGuest]
  );

  const value = useMemo(() => ({ requireAccount }), [requireAccount]);

  return (
    <AccountWallContext.Provider value={value}>
      {children}
      <Modal
        visible={reason !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setReason(null)}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={() => setReason(null)} accessibilityLabel={i18n.t('wall.close')} />
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <View style={styles.sheet}>
            <WallContent reason={reason ?? 'default'} onDone={() => setReason(null)} />
          </View>
        </View>
      </Modal>
    </AccountWallContext.Provider>
  );
}

function WallContent({ reason, onDone, inline = false }: { reason: WallReason; onDone?: () => void; inline?: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const go = (path: '/onboarding/signup' | '/onboarding/login') => {
    onDone?.();
    router.push(path);
  };
  return (
    <View style={styles.content}>
      {!inline && <View style={styles.handle} />}
      <BrandMark size="sm" />
      <Text style={styles.title} accessibilityRole="header">
        {t('wall.title')}
      </Text>
      <Text style={styles.reason}>{t(`wall.reasons.${reason}`)}</Text>
      <View style={styles.actions}>
        <PillButton label={t('wall.createAccount')} icon="userPlus" onPress={() => go('/onboarding/signup')} />
        <PillButton label={t('wall.login')} variant="outline" icon="login" onPress={() => go('/onboarding/login')} />
      </View>
      {!inline && (
        <Pressable onPress={onDone} style={styles.later} hitSlop={8} accessibilityRole="button">
          <Text style={styles.laterText}>{t('wall.later')}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function useRequireAccount(): AccountWallValue['requireAccount'] {
  const ctx = useContext(AccountWallContext);
  if (!ctx) throw new Error('useRequireAccount doit être utilisé à l’intérieur de <AccountWallProvider>.');
  return ctx.requireAccount;
}

/** Écran entier réservé aux comptes : un invité voit une invitation à la place. */
export function withAccount<P extends object>(Screen: ComponentType<P>, reason: WallReason) {
  function Gated(props: P) {
    const { isGuest } = useAuth();
    if (!isGuest) return <Screen {...props} />;
    return (
      <SafeAreaView style={styles.fullScreen} edges={['top', 'bottom']}>
        <WallContent reason={reason} inline />
      </SafeAreaView>
    );
  }
  Gated.displayName = `withAccount(${Screen.displayName ?? Screen.name ?? 'Screen'})`;
  return Gated;
}

/** Carte à la place d'un lecteur ou d'un formulaire réservé (vidéo, commentaire…) pour un invité. */
export function LockedActionCard({ label, reason }: { label: keyof Translation['wall']['locked']; reason: WallReason }) {
  const requireAccount = useRequireAccount();
  const { t } = useI18n();
  return (
    <Pressable
      onPress={() => requireAccount(undefined, reason)}
      style={styles.locked}
      accessibilityRole="button"
      accessibilityLabel={`${t(`wall.locked.${label}`)}. ${t('wall.createAccount')}.`}
    >
      <Text style={styles.lockedLabel}>🔒 {t(`wall.locked.${label}`)}</Text>
      <Text style={styles.bannerLink}>{t('wall.createAccount')}</Text>
    </Pressable>
  );
}

/** Petit bandeau en haut de l'accueil pour un invité. */
export function GuestBanner() {
  const { isGuest } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  if (!isGuest) return null;
  return (
    <Pressable
      onPress={() => router.push('/onboarding/signup')}
      style={styles.banner}
      accessibilityRole="button"
      accessibilityLabel={`${t('wall.banner')}. ${t('wall.bannerLink')}.`}
    >
      <Text style={styles.bannerText}>
        {t('wall.banner')} · <Text style={styles.bannerLink}>{t('wall.bannerLink')}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.6)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: ONBOARDING_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.25)',
    paddingBottom: 28,
  },
  content: { paddingHorizontal: 24, paddingTop: 10, alignItems: 'stretch' },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(237,227,212,.25)',
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.textHeading,
    textAlign: 'center',
    marginTop: 16,
  },
  reason: {
    fontFamily: typography.body,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.textBody,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: { gap: 12, marginTop: 22 },
  later: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  laterText: { fontFamily: typography.body, fontSize: 13.5, color: colors.textMutedAlt },
  fullScreen: { flex: 1, backgroundColor: ONBOARDING_BG, justifyContent: 'center' },
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
    backgroundColor: 'rgba(240,195,107,.08)',
    alignItems: 'center',
  },
  locked: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
    backgroundColor: 'rgba(240,195,107,.06)',
    alignItems: 'center',
    gap: 6,
  },
  lockedLabel: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.textPrimary, textAlign: 'center' },
  bannerText: { fontFamily: typography.body, fontSize: 13, color: colors.textBody },
  bannerLink: { fontFamily: typography.bodySemiBold, color: colors.accentGoldPale, textDecorationLine: 'underline' },
});
