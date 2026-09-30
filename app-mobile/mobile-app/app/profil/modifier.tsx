import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { PremiumButton } from '../../src/components/Buttons';
import { COUNTRIES, CountryPicker, type Country } from '../../src/components/CountryPicker';
import { Icon } from '../../src/components/Icons';
import { PRESET_AVATARS, PresetArt, ProfileAvatar, presetKey } from '../../src/components/ProfileAvatar';
import { createOwnProfile, getOwnProfile, isPseudoAvailable, updateOwnProfile } from '../../src/data/communityRepository';
import { pickAndUploadImage } from '../../src/data/uploadImage';
import { refreshOwnProfile } from '../../src/profile/ownProfile';
import { useI18n } from '../../src/i18n';
import { FormField } from '../../src/onboarding/FormField';
import { BrandMark } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';

/**
 * "Modifier le profil" (cdc-edition-profil.md, décisions du 2026-09-30) :
 * photo ou avatar et pseudo (profil communautaire, les mêmes qu'à
 * l'inscription), prénom, pays et usages (métadonnées du compte). Un seul
 * bouton Enregistrer. Email et téléphone : hors de cet écran (décision de
 * Yannick, chantier à part).
 */
const PSEUDO_RULE = /^[A-Za-zÀ-ÿ0-9_.-]{2,30}$/;
const USAGES = ['decouverte', 'enfants', 'vendeur'] as const;

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function ModifierProfilScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { session, updateAccountInfo } = useAuth();
  const meta = session?.user?.user_metadata ?? {};

  const [prenom, setPrenom] = useState<string>((meta.prenom as string | undefined) ?? '');
  // Pays jamais renseigné (non demandé à l'inscription) : Cameroun proposé, visible avant d'enregistrer.
  const [country, setCountry] = useState<Country>(
    () => COUNTRIES.find((c) => c.code === meta.pays || c.name === meta.pays) ?? COUNTRIES[0]
  );
  const [usages, setUsages] = useState<string[]>(() => {
    const list = (meta.usages as string[] | undefined) ?? [];
    return list.includes('decouverte') ? list : ['decouverte', ...list];
  });
  const [pseudo, setPseudo] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability>('idle');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prenomError, setPrenomError] = useState<string | null>(null);
  const existingPseudo = useRef<string | null>(null);

  useEffect(() => {
    getOwnProfile()
      .then((p) => {
        if (!p) return;
        existingPseudo.current = p.pseudo;
        setPseudo(p.pseudo);
        setAvatar(p.avatar_url ?? null);
      })
      .catch(() => setError(t('editProfile.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  // Disponibilité du pseudo en direct, 450 ms après la dernière frappe (même règle qu'à l'inscription).
  useEffect(() => {
    const value = pseudo.trim();
    if (!value) return setAvailability('idle');
    if (!PSEUDO_RULE.test(value)) return setAvailability('invalid');
    if (existingPseudo.current && value.toLowerCase() === existingPseudo.current.toLowerCase()) {
      return setAvailability('available');
    }
    setAvailability('checking');
    let alive = true;
    const timer = setTimeout(async () => {
      const ok = await isPseudoAvailable(value);
      if (alive) setAvailability(ok === false ? 'taken' : 'available');
    }, 450);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [pseudo]);

  const addPhoto = async () => {
    if (uploading) return;
    setUploading(true);
    const { url, error: uploadError, cancelled } = await pickAndUploadImage('avatars-communaute', { square: true });
    setUploading(false);
    if (cancelled) return;
    if (uploadError) {
      Alert.alert(t('profile.photoErrorTitle'), uploadError);
      return;
    }
    if (url) setAvatar(url);
  };

  const toggleUsage = (id: string) => {
    // "Découvrir mes racines" reste toujours actif (même règle qu'à l'inscription).
    if (id === 'decouverte') return;
    setUsages((list) => (list.includes(id) ? list.filter((u) => u !== id) : [...list, id]));
  };

  const canSave = availability === 'available' && !uploading && !saving && !loading;

  const save = async () => {
    if (!canSave) return;
    if (!prenom.trim()) {
      setPrenomError(t('editProfile.firstNameRequired'));
      return;
    }
    setPrenomError(null);
    setSaving(true);
    setError(null);
    const value = pseudo.trim();
    const res = existingPseudo.current
      ? await updateOwnProfile({ pseudo: value, avatarUrl: avatar })
      : await createOwnProfile({ pseudo: value, avatarUrl: avatar });
    if (res.error) {
      setSaving(false);
      const taken = res.error.includes('pseudo');
      if (taken) setAvailability('taken');
      setError(taken ? t('profile.taken') : t('editProfile.saveError'));
      return;
    }
    existingPseudo.current = value;
    const { error: infoError } = await updateAccountInfo({ prenom, pays: country.code, usages });
    setSaving(false);
    if (infoError) {
      setError(t('editProfile.saveError'));
      return;
    }
    // Accueil, Profil… affichent tout de suite la nouvelle photo et le nouveau pseudo.
    await refreshOwnProfile();
    Alert.alert(t('editProfile.saved'));
    router.back();
  };

  const statusText =
    availability === 'checking'
      ? t('profile.checking')
      : availability === 'available'
        ? t('profile.available')
        : availability === 'taken'
          ? t('profile.taken')
          : availability === 'invalid'
            ? t('profile.invalid')
            : t('profile.pseudoHint');
  const statusColor =
    availability === 'available' ? '#7FB069' : availability === 'taken' || availability === 'invalid' ? colors.terracottaText : colors.textMutedAlt;
  const isPhoto = !!avatar && !presetKey(avatar);

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={14} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.back')}>
            <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
          </Pressable>
          <BrandMark layout="inline" />
          <View style={styles.back} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accentGoldBright} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.title} accessibilityRole="header">
              {t('editProfile.title')}
            </Text>
            <Text style={styles.subtitle}>{t('editProfile.subtitle')}</Text>

            {/* Photo */}
            <View style={styles.previewWrap}>
              <Pressable onPress={addPhoto} accessibilityRole="button" accessibilityLabel={isPhoto ? t('profile.changePhoto') : t('profile.addPhoto')}>
                <ProfileAvatar value={avatar} size={104} name={pseudo || prenom} />
                <View style={styles.cameraBadge}>
                  {uploading ? (
                    <ActivityIndicator size="small" color={colors.ctaTextOnGold} />
                  ) : (
                    <Icon name="camera" size={16} color={colors.ctaTextOnGold} strokeWidth={2.2} />
                  )}
                </View>
              </Pressable>
              <Pressable onPress={addPhoto} hitSlop={8} style={styles.photoLink} accessibilityRole="button">
                <Text style={styles.photoLinkText}>
                  {uploading ? t('profile.uploading') : isPhoto ? t('profile.changePhoto') : t('profile.addPhoto')}
                </Text>
              </Pressable>
            </View>

            {/* Avatars prédéfinis */}
            <Text style={styles.sectionLabel}>{t('profile.orAvatar')}</Text>
            <View style={styles.grid}>
              {PRESET_AVATARS.map((key, i) => {
                const value = `avatar:${key}`;
                const selected = avatar === value;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setAvatar(value)}
                    style={[styles.gridItem, selected && styles.gridItemSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t('profile.avatarA11y', { n: i + 1 })}
                  >
                    <View style={styles.gridArt}>
                      <PresetArt name={key} size={52} />
                    </View>
                    {selected && (
                      <View style={styles.tick}>
                        <Icon name="check" size={12} color={colors.ctaTextOnGold} strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Pseudo */}
            <View style={styles.field}>
              <FormField
                icon="user"
                placeholder={t('profile.pseudo')}
                value={pseudo}
                onChangeText={setPseudo}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
              />
              <Text style={[styles.status, { color: statusColor }]} accessibilityLiveRegion="polite">
                {availability === 'available' ? '✓ ' : availability === 'taken' ? '✗ ' : ''}
                {statusText}
              </Text>
            </View>

            {/* Prénom */}
            <View style={styles.field}>
              <FormField
                icon="user"
                placeholder={t('editProfile.firstName')}
                value={prenom}
                onChangeText={(v) => {
                  setPrenom(v);
                  if (prenomError) setPrenomError(null);
                }}
                autoCapitalize="words"
                maxLength={60}
                error={prenomError}
              />
            </View>

            {/* Pays */}
            <Text style={styles.sectionLabel}>{t('editProfile.countryLabel')}</Text>
            <CountryPicker value={country} onChange={setCountry} />

            {/* Usages */}
            <Text style={styles.sectionLabel}>{t('editProfile.usagesLabel')}</Text>
            <View style={styles.usages}>
              {USAGES.map((id) => {
                const selected = usages.includes(id);
                const locked = id === 'decouverte';
                return (
                  <Pressable
                    key={id}
                    onPress={() => toggleUsage(id)}
                    style={[styles.usage, selected && styles.usageSelected]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected, disabled: locked }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.usageTitle}>{t(`usage.${id}.title`)}</Text>
                      <Text style={styles.usageSub}>{t(`usage.${id}.subtitle`)}</Text>
                    </View>
                    <View style={[styles.box, selected && styles.boxOn]}>
                      {selected && <Icon name="check" size={12} color={colors.ctaTextOnGold} strokeWidth={3} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.cta}>
              <PremiumButton label={t('editProfile.save')} icon="check" onPress={save} loading={saving} disabled={!canSave} />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0B0906' },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 10 },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { fontSize: 30, color: colors.accentGold },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 40 },
  title: { fontFamily: typography.display, fontSize: 28, color: colors.textHeading, marginTop: 8 },
  subtitle: { fontFamily: typography.body, fontSize: 14.5, lineHeight: 21, color: colors.textBody, marginTop: 6 },
  previewWrap: { alignItems: 'center', marginTop: 22 },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentGoldBright,
    borderWidth: 3,
    borderColor: '#0B0906',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLink: { marginTop: 10, paddingVertical: 4 },
  photoLinkText: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.accentGoldPale },
  sectionLabel: {
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 10,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  gridItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 999,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemSelected: { borderColor: colors.accentGoldBright },
  gridArt: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden' },
  tick: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentGoldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: { marginTop: 18 },
  status: { fontFamily: typography.body, fontSize: 12.5, marginTop: 6, marginLeft: 4 },
  usages: { gap: 10 },
  usage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.14)',
    backgroundColor: 'rgba(26,19,13,.9)',
  },
  usageSelected: { borderColor: colors.accentGoldBright, backgroundColor: 'rgba(240,195,107,.07)' },
  usageTitle: { fontFamily: typography.bodySemiBold, fontSize: 14.5, color: colors.textPrimary },
  usageSub: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.accentGoldBright, borderColor: colors.accentGoldBright },
  error: { fontFamily: typography.body, fontSize: 13, color: colors.terracottaText, marginTop: 16, textAlign: 'center' },
  cta: { marginTop: 26 },
});
