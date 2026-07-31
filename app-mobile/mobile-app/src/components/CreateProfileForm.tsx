import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { createOwnProfile } from '../data/communityRepository';
import type { CommunityProfileOwn } from '../data/communityTypes';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { GoldButton } from './Buttons';
import { AvatarPicker } from './AvatarPicker';

/**
 * Formulaire de création du profil communautaire (pseudo + bio optionnelle),
 * affiché avant toute publication/commentaire si le compte n'en a pas
 * encore — un seul flux, pas un aller-retour entre deux écrans séparés
 * (specs-phase3-communaute.md §3). Le numéro de téléphone n'est jamais
 * demandé ici : le compte réel est déjà lié via l'authentification,
 * conforme au pseudonymat structuré.
 */
export function CreateProfileForm({ onCreated }: { onCreated: (profile: CommunityProfileOwn) => void }) {
  const [pseudo, setPseudo] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (pseudo.trim().length < 2) {
      setError('Choisis un pseudo d’au moins 2 caractères.');
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
      setError(apiError ?? 'Impossible de créer ton profil pour le moment.');
      return;
    }
    onCreated(profile);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Crée ton profil communautaire</Text>
      <Text style={styles.subtitle}>
        Un pseudo suffit — ton numéro de téléphone ne sera jamais visible des autres membres.
      </Text>
      <AvatarPicker folder="avatars-communaute" value={avatarUrl} onChange={setAvatarUrl} />
      <Text style={styles.label}>PSEUDO</Text>
      <TextInput
        value={pseudo}
        onChangeText={setPseudo}
        placeholder="Ex. Ama_Diaspora"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        maxLength={30}
        autoCapitalize="none"
      />
      <Text style={styles.label}>BIO (optionnel)</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Quelques mots sur toi..."
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        maxLength={200}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.cta}>
        <GoldButton label={loading ? 'Création...' : 'Créer mon profil'} onPress={submit} />
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
