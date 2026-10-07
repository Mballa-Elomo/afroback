import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { createOwnProfile } from '../data/communityRepository';
import type { CommunityProfileOwn } from '../data/communityTypes';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { GoldButton } from './Buttons';
import { AvatarPicker } from './AvatarPicker';
import { useI18n } from '../i18n';

/**
 * Formulaire de création du profil communautaire (pseudo + bio optionnelle),
 * affiché avant toute publication/commentaire si le compte n'en a pas
 * encore — un seul flux, pas un aller-retour entre deux écrans séparés
 * (specs-phase3-communaute.md §3). Le numéro de téléphone n'est jamais
 * demandé ici : le compte réel est déjà lié via l'authentification,
 * conforme au pseudonymat structuré.
 */
export function CreateProfileForm({ onCreated }: { onCreated: (profile: CommunityProfileOwn) => void }) {
  const { t } = useI18n();
  const [pseudo, setPseudo] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (pseudo.trim().length < 2) {
      setError(t('createProfile.short'));
      return;
    }
    setError(null);
    setLoading(true);
    const { profile, error: apiError } = await createOwnProfile({
      pseudo: pseudo.trim(),
      bio: bio.trim() || null,
      avatarUrl,
    });
    setLoading(false);
    if (apiError || !profile) {
      setError(apiError ?? t('createProfile.failed'));
      return;
    }
    onCreated(profile);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('createProfile.title')}</Text>
      <Text style={styles.subtitle}>
        {t('createProfile.subtitle')}
      </Text>
      <AvatarPicker folder="avatars-communaute" value={avatarUrl} onChange={setAvatarUrl} />
      <Text style={styles.label}>{t('createProfile.pseudo')}</Text>
      <TextInput
        value={pseudo}
        onChangeText={setPseudo}
        placeholder={t('createProfile.pseudoPh')}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        maxLength={30}
        autoCapitalize="none"
      />
      <Text style={styles.label}>{t('createProfile.bio')}</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder={t('createProfile.bioPh')}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        maxLength={200}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.cta}>
        <GoldButton label={loading ? t('createProfile.creating') : t('createProfile.create')} onPress={submit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  title: {
    fontFamily: typography.displaySemiBold,
    fontSize: 16,
    color: colors.textHeading,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginBottom: 16,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    fontFamily: typography.body,
    fontSize: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.terracottaText,
    marginBottom: 10,
  },
  cta: {
    marginTop: 2,
  },
});
