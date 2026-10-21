import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { BackButton } from '../ui/modern';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthProvider';
import { useRequireAccount } from '../auth/AccountWall';
import { PremiumButton } from '../components/Buttons';
import { Icon } from '../components/Icons';
import { clearContentDetailCache, type ContentType } from '../data/contentAccess';
import { supabase } from '../data/supabaseClient';
import { useI18n } from '../i18n';
import type { Translation } from '../i18n/fr';
import { colors, typography } from '../theme/tokens';
import { usePaymentPolicy } from '../settings/SettingsProvider';

/**
 * Accès gratuit / abonné côté app (cdc-acces-gratuit-abonnement.md, lot A).
 *
 * - Liste des contenus gratuits : table `contenus_gratuits` (modifiable
 *   depuis le back-office, sans toucher au code).
 * - Abonnement : fonction serveur `mon_abonnement()` — jamais le forfait
 *   stocké dans le compte, que l'utilisateur pourrait modifier lui-même.
 *
 * Sert à AFFICHER les cadenas et à ouvrir la fenêtre d'abonnement. La vraie
 * barrière est côté serveur (`get_*_detail`) : même en trafiquant l'app, le
 * contenu réservé n'est jamais transmis.
 *
 * Transition : tant que supabase/schema-acces-abonnement.sql n'est pas
 * exécuté, la table n'existe pas → `systemActive = false` → aucun cadenas.
 */

export interface Subscription {
  plan: 'racines' | 'heritage';
  ends_at: string | null;
  source: 'offert' | 'paiement' | 'test';
  /** Date de résiliation (accès conservé jusqu'à ends_at) ; absent tant que schema-paiement-sans-sortie.sql n'est pas exécuté. */
  resilie_le?: string | null;
  /** Abonnement payé, donc résiliable (un abonnement offert ne se résilie pas). */
  resiliable?: boolean;
}

export type PaywallReason = keyof Translation['paywall']['reasons'];

interface AccessValue {
  ready: boolean;
  systemActive: boolean;
  subscription: Subscription | null;
  isSubscribed: boolean;
  isFree: (type: ContentType, slug: string) => boolean;
  canAccess: (type: ContentType, slug: string) => boolean;
  refresh: () => Promise<void>;
  /** Exécute `action` si la personne est abonnée ; sinon ouvre la fenêtre (ou "Crée ton compte" pour un invité). */
  requireSubscription: (action?: () => void, reason?: PaywallReason) => boolean;
}

const AccessContext = createContext<AccessValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { session, isGuest } = useAuth();
  const requireAccount = useRequireAccount();
  const [ready, setReady] = useState(false);
  const [systemActive, setSystemActive] = useState(false);
  const [free, setFree] = useState<Set<string>>(new Set());
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [reason, setReason] = useState<PaywallReason | null>(null);
  const userId = session?.user?.id ?? null;

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('contenus_gratuits').select('type,slug');
    if (error) {
      // Table absente (script pas encore exécuté) ou réseau : aucun cadenas, comportement d'avant.
      setSystemActive(false);
      setFree(new Set());
    } else {
      setSystemActive(true);
      setFree(new Set((data ?? []).map((r: { type: string; slug: string }) => `${r.type}:${r.slug}`)));
    }
    if (userId) {
      const res = await supabase.rpc('mon_abonnement');
      setSubscription(!res.error && res.data ? (res.data as Subscription) : null);
    } else {
      setSubscription(null);
    }
    setReady(true);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    clearContentDetailCache();
    await load();
  }, [load]);

  const isSubscribed = !!subscription;
  const isFree = useCallback((type: ContentType, slug: string) => free.has(`${type}:${slug}`), [free]);
  const canAccess = useCallback(
    (type: ContentType, slug: string) => !systemActive || isSubscribed || free.has(`${type}:${slug}`),
    [systemActive, isSubscribed, free]
  );

  const requireSubscription = useCallback(
    (action?: () => void, why?: PaywallReason) => {
      if (!systemActive || isSubscribed) {
        action?.();
        return true;
      }
      if (isGuest) {
        requireAccount(undefined, 'premium');
        return false;
      }
      setReason(why ?? 'default');
      return false;
    },
    [systemActive, isSubscribed, isGuest, requireAccount]
  );

  const value = useMemo<AccessValue>(
    () => ({ ready, systemActive, subscription, isSubscribed, isFree, canAccess, refresh, requireSubscription }),
    [ready, systemActive, subscription, isSubscribed, isFree, canAccess, refresh, requireSubscription]
  );

  return (
    <AccessContext.Provider value={value}>
      {children}
      <Modal visible={reason !== null} transparent animationType="slide" onRequestClose={() => setReason(null)} statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={() => setReason(null)} />
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <View style={styles.sheet}>
            <PaywallContent reason={reason ?? 'default'} onDone={() => setReason(null)} />
          </View>
        </View>
      </Modal>
    </AccessContext.Provider>
  );
}

export function useAccess(): AccessValue {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error('useAccess doit être utilisé à l’intérieur de <AccessProvider>.');
  return ctx;
}

function PaywallContent({ reason, onDone, inline = false }: { reason: PaywallReason; onDone?: () => void; inline?: boolean }) {
  const pay = usePaymentPolicy();
  const { t } = useI18n();
  const router = useRouter();
  const { isGuest } = useAuth();
  const requireAccount = useRequireAccount();
  const benefits = [t('paywall.b1'), t('paywall.b2'), t('paywall.b3'), t('paywall.b4')];
  return (
    <View style={styles.content}>
      {!inline && <View style={styles.handle} />}
      <View style={styles.lockDisc}>
        <Icon name="lock" size={26} color={colors.accentGoldBright} strokeWidth={1.8} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {t('paywall.title')}
      </Text>
      <Text style={styles.reason}>{t(`paywall.reasons.${reason}`)}</Text>
      <View style={styles.benefits}>
        <Text style={styles.benefitsTitle}>{t('paywall.benefitsTitle')}</Text>
        {benefits.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <Icon name="check" size={16} color={colors.accentGoldBright} strokeWidth={2.4} />
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}
      </View>
      {/* Version Play Store : aucun chemin d'achat (storePolicy.ts). */}
      {pay.abonnements && (
      <PremiumButton
        label={t('paywall.see')}
        icon="sparkle"
        onPress={() => {
          onDone?.();
          // Invité : il faut d'abord un compte (l'écran Abonnements est réservé aux comptes).
          if (isGuest) requireAccount(undefined, 'premium');
          else router.push('/abonnement');
        }}
      />
      )}
      {!inline && (
        <Pressable onPress={onDone} style={styles.later} hitSlop={8} accessibilityRole="button">
          <Text style={styles.laterText}>{t('paywall.later')}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** Écran entier réservé aux abonnés (ex. vendre, publier) : sinon, présentation de l'abonnement à la place. */
export function withSubscription<P extends object>(Screen: ComponentType<P>, reason: PaywallReason) {
  function Gated(props: P) {
    const { systemActive, isSubscribed } = useAccess();
    if (!systemActive || isSubscribed) return <Screen {...props} />;
    return (
      <SafeAreaView style={styles.fullScreen} edges={['top', 'bottom']}>
        <PaywallContent reason={reason} inline />
      </SafeAreaView>
    );
  }
  Gated.displayName = `withSubscription(${Screen.displayName ?? Screen.name ?? 'Screen'})`;
  return Gated;
}

/**
 * Bloc affiché à la place d'un contenu réservé : aperçu qui s'estompe, puis
 * présentation de l'abonnement. `child` : message adapté à l'espace enfant.
 */
export function LockedContent({
  apercu,
  reason,
  child = false,
  style,
}: {
  apercu?: string;
  reason: PaywallReason;
  child?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useI18n();
  return (
    <View style={style}>
      {!!apercu && (
        <View style={styles.teaserWrap}>
          <Text style={styles.teaser} numberOfLines={6}>
            {apercu.trim()}…
          </Text>
          <View style={styles.teaserFade} pointerEvents="none" />
        </View>
      )}
      {child ? (
        <View style={styles.childBox}>
          <Icon name="lock" size={22} color={colors.accentGoldBright} />
          <Text style={styles.childText}>{t('paywall.childLocked')}</Text>
        </View>
      ) : (
        <View style={styles.inlineCard}>
          <PaywallContent reason={reason} inline />
        </View>
      )}
    </View>
  );
}

/**
 * Écran de détail d'un contenu réservé (récit, audio, vidéo, mythe, lieu) :
 * image, titre, aperçu qui s'estompe, puis présentation de l'abonnement.
 */
export function LockedDetailScreen({
  title,
  subtitle,
  imageUrl,
  apercu,
  reason,
  child = false,
  footer,
  teaser,
}: {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  apercu?: string;
  reason: PaywallReason;
  child?: boolean;
  /** Contenu affiché sous la présentation de l'abonnement (ex. commentaires en lecture). */
  footer?: ReactNode;
  /** Bande-annonce (teaser), visible même sans abonnement. */
  teaser?: ReactNode;
}) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <SafeAreaView style={styles.detailSafe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.detailCover}>
          {imageUrl ? <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} cachePolicy="memory-disk" /> : null}
          <View style={styles.detailCoverShade} />
          <View style={styles.detailBack}>
            <BackButton floating />
          </View>
          <View style={styles.detailLock}>
            <Icon name="lock" size={15} color={colors.ctaTextOnGold} strokeWidth={2.4} />
          </View>
        </View>
        <View style={styles.detailBody}>
          <Text style={styles.detailTitle} accessibilityRole="header">
            {title}
          </Text>
          {!!subtitle && <Text style={styles.detailSubtitle}>{subtitle}</Text>}
          {teaser ? <View style={{ marginTop: 16 }}>{teaser}</View> : null}
          <LockedContent apercu={apercu} reason={reason} child={child} style={{ marginTop: 16 }} />
          {footer ? <View style={{ marginTop: 20 }}>{footer}</View> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Bandeau de l'accueil pour un compte gratuit : "Débloque tous les récits". */
export function UpgradeBanner() {
  const pay = usePaymentPolicy();
  const { t } = useI18n();
  const router = useRouter();
  const { session } = useAuth();
  const { systemActive, isSubscribed } = useAccess();
  if (!session || !systemActive || isSubscribed || !pay.abonnements) return null;
  return (
    <Pressable
      onPress={() => router.push('/abonnement')}
      style={({ pressed }) => [styles.upgrade, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={`${t('abonnement.banner')}. ${t('abonnement.bannerCta')}`}
    >
      <Icon name="sparkle" size={22} color={colors.accentGoldBright} />
      <View style={{ flex: 1 }}>
        <Text style={styles.upgradeTitle}>{t('abonnement.banner')}</Text>
        <Text style={styles.upgradeCta}>{t('abonnement.bannerCta')} ›</Text>
      </View>
    </Pressable>
  );
}

/** Carte à la place d'une action réservée aux abonnés (ex. commenter) : ouvre la fenêtre d'abonnement. */
export function PremiumActionCard({ reason, style }: { reason: PaywallReason; style?: StyleProp<ViewStyle> }) {
  const { t } = useI18n();
  const { requireSubscription } = useAccess();
  return (
    <Pressable
      onPress={() => requireSubscription(undefined, reason)}
      style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.8 }, style]}
      accessibilityRole="button"
      accessibilityLabel={`${t(`paywall.reasons.${reason}`)} ${t('paywall.see')}`}
    >
      <View style={styles.actionLock}>
        <Icon name="lock" size={15} color={colors.ctaTextOnGold} strokeWidth={2.4} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionText}>{t(`paywall.reasons.${reason}`)}</Text>
        <Text style={styles.actionLink}>{t('paywall.see')} ›</Text>
      </View>
    </Pressable>
  );
}

/** Petit badge sur les cartes : cadenas si réservé, "Gratuit" si offert aux comptes gratuits. */
export function AccessBadge({
  type,
  slug,
  style,
  inline = false,
}: {
  type: ContentType;
  slug: string;
  style?: StyleProp<ViewStyle>;
  /** `inline` : dans le flux (ex. ligne de liste) plutôt qu'en surimpression sur l'image. */
  inline?: boolean;
}) {
  const { t } = useI18n();
  const { systemActive, isSubscribed, isFree } = useAccess();
  if (!systemActive || isSubscribed) return null;
  if (isFree(type, slug)) {
    return (
      <View style={[styles.freeBadge, inline && styles.inlineBadge, style]}>
        <Text style={styles.freeBadgeText}>{t('access.free')}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.lockBadge, inline && styles.inlineBadge, style]} accessible accessibilityLabel={t('access.lockedA11y')}>
      <Icon name="lock" size={13} color={colors.ctaTextOnGold} strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.6)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0B0906',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.25)',
    paddingBottom: 28,
  },
  content: { paddingHorizontal: 22, paddingTop: 10 },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(237,227,212,.25)',
    marginBottom: 16,
  },
  lockDisc: {
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.1)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.45)',
  },
  title: { fontFamily: typography.display, fontSize: 22, color: colors.textHeading, textAlign: 'center', marginTop: 14 },
  reason: {
    fontFamily: typography.body,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.textBody,
    textAlign: 'center',
    marginTop: 8,
  },
  benefits: {
    marginTop: 18,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(240,195,107,.06)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.18)',
    gap: 10,
  },
  benefitsTitle: {
    fontFamily: typography.mono,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 2,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitText: { flex: 1, fontFamily: typography.bodyMedium, fontSize: 14, color: colors.textPrimary },
  later: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  laterText: { fontFamily: typography.body, fontSize: 13.5, color: colors.textMutedAlt },
  fullScreen: { flex: 1, backgroundColor: '#0B0906', justifyContent: 'center' },
  teaserWrap: { position: 'relative' },
  teaser: { fontFamily: typography.body, fontSize: 15.5, lineHeight: 25, color: colors.textBody },
  teaserFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: 'rgba(15,11,8,0.75)',
  },
  inlineCard: {
    marginTop: 18,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
    backgroundColor: 'rgba(26,19,13,.9)',
  },
  childBox: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(240,195,107,.08)',
  },
  childText: { flex: 1, fontFamily: typography.bodySemiBold, fontSize: 15, lineHeight: 22, color: colors.textPrimary },
  detailSafe: { flex: 1, backgroundColor: colors.background },
  detailScroll: { paddingBottom: 40 },
  detailCover: { height: 230, backgroundColor: colors.placeholderStripeDark, overflow: 'hidden' },
  detailCoverShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,11,8,0.45)' },
  detailBack: {
    position: 'absolute',
    top: 12,
    left: 14,
  },
  detailBackIcon: { fontSize: 26, color: colors.accentGold, marginTop: -2 },
  detailLock: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentGoldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBody: { paddingHorizontal: 20, marginTop: -30 },
  detailTitle: { fontFamily: typography.display, fontSize: 28, lineHeight: 34, color: colors.textHeading },
  detailSubtitle: { fontFamily: typography.body, fontSize: 14.5, lineHeight: 21, color: colors.textBodyAlt, marginTop: 6 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
    backgroundColor: 'rgba(240,195,107,.06)',
  },
  actionLock: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentGoldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontFamily: typography.bodySemiBold, fontSize: 13.5, lineHeight: 19, color: colors.textPrimary },
  actionLink: { fontFamily: typography.bodyBold, fontSize: 13, color: colors.accentGoldPale, marginTop: 3 },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentGoldBright,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  freeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(127,176,105,.92)',
  },
  inlineBadge: { position: 'relative', top: 0, right: 0 },
  upgrade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
    backgroundColor: 'rgba(240,195,107,.1)',
  },
  upgradeTitle: { fontFamily: typography.bodyBold, fontSize: 14.5, color: colors.textPrimary },
  upgradeCta: { fontFamily: typography.bodySemiBold, fontSize: 13, color: colors.accentGoldPale, marginTop: 2 },
  freeBadgeText: { fontFamily: typography.bodyBold, fontSize: 11, color: '#0B0906', letterSpacing: 0.3 },
});
