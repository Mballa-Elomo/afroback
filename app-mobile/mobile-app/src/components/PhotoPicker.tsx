import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { pickAndUploadImage, type UploadFolder } from '../data/uploadImage';
import { colors, radii, typography } from '../theme/tokens';

/**
 * Sélecteur de photo rectangulaire (post Communauté, produit Marketplace) —
 * remplace l'ancien bouton "bientôt disponible" par un vrai upload vers le
 * bucket `user-uploads`. Affiche un aperçu une fois l'image envoyée, avec
 * possibilité de la retirer.
 */
export function PhotoPicker({
  folder,
  value,
  onChange,
  label = 'Ajouter une photo',
}: {
  folder: UploadFolder;
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    setUploading(true);
    const { url, error, cancelled } = await pickAndUploadImage(folder);
    setUploading(false);
    if (cancelled) return;
    if (error) {
      Alert.alert("Impossible d'ajouter cette photo", error);
      return;
    }
    if (url) onChange(url);
  };

  if (value) {
    return (
      <View style={styles.previewWrap}>
        <Image source={{ uri: value }} style={styles.previewImage} resizeMode="cover" />
        <Pressable style={styles.removeBtn} onPress={() => onChange(null)} hitSlop={8}>
          <Text style={styles.removeIcon}>✕</Text>
        </Pressable>
        <Pressable style={styles.changeBtn} onPress={pick} disabled={uploading}>
          <Text style={styles.changeLabel}>{uploading ? 'Envoi...' : 'Changer'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable style={styles.box} onPress={pick} disabled={uploading}>
      {uploading ? (
        <ActivityIndicator color={colors.accentGold} />
      ) : (
        <>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.cardSmall,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceCard,
    paddingVertical: 18,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  previewWrap: {
    position: 'relative',
    borderRadius: radii.cardSmall,
    overflow: 'hidden',
    height: 160,
    backgroundColor: colors.placeholderStripeDark,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    color: '#fff',
    fontSize: 13,
  },
  changeBtn: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  changeLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 10.5,
    color: '#fff',
  },
});
