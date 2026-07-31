import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { pickAndUploadImage, type UploadFolder } from '../data/uploadImage';
import { colors, typography } from '../theme/tokens';
import { HeroPlaceholder } from './HeroVisual';

/** Sélecteur d'avatar circulaire (profil communautaire, boutique vendeur) — cadrage carré forcé, upload réel vers `user-uploads`. */
export function AvatarPicker({
  folder,
  value,
  onChange,
  size = 72,
}: {
  folder: UploadFolder;
  value: string | null;
  onChange: (url: string | null) => void;
  size?: number;
}) {
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    setUploading(true);
    const { url, error, cancelled } = await pickAndUploadImage(folder, { square: true });
    setUploading(false);
    if (cancelled) return;
    if (error) {
      Alert.alert("Impossible d'ajouter cette photo", error);
      return;
    }
    if (url) onChange(url);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={pick} disabled={uploading}>
        {value ? (
          <Image source={{ uri: value }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
        ) : (
          <HeroPlaceholder style={{ width: size, height: size }} radius={size / 2} />
        )}
        {uploading && (
          <View style={[styles.overlay, { width: size, height: size, borderRadius: size / 2 }]}>
            <ActivityIndicator color={colors.accentGold} />
          </View>
        )}
      </Pressable>
      <Pressable onPress={pick} disabled={uploading} hitSlop={6}>
        <Text style={styles.label}>{value ? 'Changer la photo' : 'Ajouter une photo'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  avatar: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11.5,
    color: colors.accentGold,
  },
});
