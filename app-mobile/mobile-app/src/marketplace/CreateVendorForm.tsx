import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { createOwnVendor } from '../data/marketplaceRepository';
import type { MarketplaceVendorOwn } from '../data/marketplaceTypes';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { GoldButton } from '../components/Buttons';
import { AvatarPicker } from '../components/AvatarPicker';

/**
 * Inscription vendeur — contrairement au profil communautaire pseudonyme,
 * l'identité d'un vendeur est publique par nature (boutique commerciale) :
 * nom de boutique, région, type d'artisanat, bio.
 */
export function CreateVendorForm({ onCreated }: { onCreated: (vendor: MarketplaceVendorOwn) => void }) {
  const [nomBoutique, setNomBoutique] = useState('');
  const [region, setRegion] = useState('');
  const [artisanat, setArtisanat] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (loading) return;
    if (nomBoutique.trim().length < 2 || region.trim().length < 2 || artisanat.trim().length < 2) {
      setError('Nom de boutique, région et artisanat sont obligatoires.');
      return;
    }
    setError(null);
    setLoading(true);
    const { vendor, error: apiError } = await createOwnVendor({
      nomBoutique: nomBoutique.trim(),
      region: region.trim(),
      artisanat: artisanat.trim(),
      bio: bio.trim() || null,
      avatarUrl,
    });
    setLoading(false);
    if (apiError || !vendor) {
      setError(apiError ?? 'Impossible de créer ta boutique pour le moment.');
      return;
    }
    onCreated(vendor);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Ouvre ta boutique sur AFROBACK</Text>
      <Text style={styles.subtitle}>
        Ton nom de boutique et ta région seront visibles publiquement — c'est une vitrine commerciale, pas un profil
        anonyme.
      </Text>
      <AvatarPicker folder="avatars-marche" value={avatarUrl} onChange={setAvatarUrl} />
      <Text style={styles.label}>NOM DE LA BOUTIQUE</Text>
      <TextInput
        value={nomBoutique}
        onChangeText={setNomBoutique}
        placeholder="Ex. Atelier Nji Mama"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        maxLength={60}
      />
      <Text style={styles.label}>RÉGION</Text>
      <TextInput
        value={region}
        onChangeText={setRegion}
        placeholder="Ex. Foumban, Cameroun"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <Text style={styles.label}>ARTISANAT</Text>
      <TextInput
        value={artisanat}
        onChangeText={setArtisanat}
        placeholder="Ex. Sculpture bamoun"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <Text style={styles.label}>BIO (optionnel)</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Présente ton savoir-faire..."
        placeholderTextColor={colors.textMuted}
        style={[styles.input, styles.textarea]}
        multiline
        maxLength={500}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.cta}>
        <GoldButton label={loading ? 'Création...' : 'Créer ma boutique'} onPress={submit} disabled={loading} />
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
  textarea: {
    minHeight: 70,
    textAlignVertical: 'top',
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
