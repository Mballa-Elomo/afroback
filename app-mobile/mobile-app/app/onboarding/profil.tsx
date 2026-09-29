import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { Icon } from '../../src/components/Icons';
import { PRESET_AVATARS, PresetArt, ProfileAvatar, presetKey } from '../../src/components/ProfileAvatar';
import { createOwnProfile, getOwnProfile, isPseudoAvailable, updateOwnProfile } from '../../src/data/communityRepository';
import { pickAndUploadImage } from '../../src/data/uploadImage';
import { useI18n } from '../../src/i18n';
import { FormField } from '../../src/onboarding/FormField';
import { BrandMark, ONBOARDING_BG, PillButton } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';

/**
 * "Ton profil" — pseudo + photo ou avatar (demande de Yannick du
 * 2026-09-29, cdc-inscription.md). Première étape après la confirmation de
 * l'email : l'envoi d'une photo exige un compte confirmé (dossier personnel
 * du bucket `user-uploads`), et le formulaire d'inscription reste aussi
 * léger que la maquette.
 *
 * Réutilise le profil communautaire existant (`community_profiles` : pseudo
 * unique, avatar, jamais l'email ni le téléphone en public) : le pseudo
 * choisi ici est celui de la Communauté, plus besoin de le redemander.
 * Pseudo obligatoire, photo/avatar facultatif (repli : initiale).
 */
const PSEUDO_RULE = /^[A-Za-zÀ-ÿ0-9_.-]{2,30}$/;

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function ProfilStepScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { session } = useAuth();
  const prenom = (session?.user?.user_metadata?.prenom as string | undefined) ?? '';

  const [pseudo, setPseudo] = useState(prenom.replace(/\s+/g, ''));
  const [avatar, setAvatar] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability>('idle');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Profil déjà créé (ex. retour sur cet écran) : on le met à jour au lieu d'en créer un second.
  const existingPseudo = useRef<string | null>(null);

  useEffect(() => {
    getOwnProfile()
      .then((p) => {
        if (!p) return;
        existingPseudo.current = p.pseudo;
        setPseudo(p.pseudo);
        setAvatar(p.avatar_url ?? null);
      })
      .catch(() => {});
  }, []);

  // Vérification de disponibilité en direct, 450 ms après la dernière frappe.
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
      if (!alive) return;
      // null = vérification impossible (réseau) : la base tranchera à l'enregistrement.
      setAvailability(ok === false ? 'taken' : 'available');
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

  const canContinue = availability === 'available' && !uploading && !saving;

  const onContinue = async () => {
    if (!canContinue) return;
    setSaving(true);
    setError(null);
    const value = pseudo.trim();
    const res = existingPseudo.current
      ? await updateOwnProfile({ pseudo: value, avatarUrl: avatar })
      : await createOwnProfile({ pseudo: value, avatarUrl: avatar });
    setSaving(false);
    if (res.error) {
      // Cas le plus probable : pseudo pris entre la vérification et l'enregistrement.
      setAvailability(res.error.includes('pseudo') ? 'taken' : availability);
      setError(res.error.includes('pseudo') ? t('profile.taken') : t('profile.saveError'));
      return;
    }
    router.replace('/onboarding/usage');
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <BrandMark layout="inline" />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {t('profile.title')}
          </Text>
          <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>

          {/* Aperçu + photo */}
          <View style={styles.previewWrap}>
            <Pressable onPress={addPhoto} accessibilityRole="button" accessibilityLabel={isPhoto ? t('profile.changePhoto') : t('profile.addPhoto')}>
              <ProfileAvatar value={avatar} size={116} name={pseudo || prenom} />
              <View style={styles.cameraBadge}>
                {uploading ? <ActivityIndicator size="small" color={colors.ctaTextOnGold} /> : <CameraGlyph />}
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
                    <PresetArt name={key} size={56} />
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
          <View style={styles.pseudo}>
            <FormField
              icon="user"
              placeholder={t('profile.pseudo')}
              value={pseudo}
              onChangeText={setPseudo}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={onContinue}
            />
            <Text style={[styles.status, { color: statusColor }]} accessibilityLiveRegion="polite">
              {availability === 'available' ? '✓ ' : availability === 'taken' ? '✗ ' : ''}
              {statusText}
            </Text>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>

        <View style={styles.bottom}>
          <PillButton label={t('common.continue')} onPress={onContinue} disabled={!canContinue && !saving} loading={saving} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function CameraGlyph() {
  return <Icon name="camera" size={16} color={colors.ctaTextOnGold} strokeWidth={2.2} />;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: ONBOARDING_BG },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  logo: { marginBottom: 22 },
  title: { fontFamily: typography.display, fontSize: 28, color: colors.textHeading },
  subtitle: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.textBody, marginTop: 6 },
  previewWrap: { alignItems: 'center', marginTop: 24 },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentGoldBright,
    borderWidth: 3,
    borderColor: ONBOARDING_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLink: { marginTop: 12, paddingVertical: 4 },
  photoLinkText: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.accentGoldPale },
  sectionLabel: {
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 26,
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
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
  gridArt: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
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
  pseudo: { marginTop: 26 },
  status: { fontFamily: typography.body, fontSize: 12.5, marginTop: 6, marginLeft: 4 },
  error: { fontFamily: typography.body, fontSize: 13, color: colors.terracottaText, marginTop: 12 },
  bottom: { paddingHorizontal: 24, paddingBottom: 18, paddingTop: 8 },
});
