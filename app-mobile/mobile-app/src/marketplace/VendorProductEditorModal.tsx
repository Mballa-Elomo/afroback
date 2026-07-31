import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createProduct, updateProduct } from '../data/marketplaceRepository';
import { MARKETPLACE_CATEGORIE_LABEL } from '../data/marketplaceDisplay';
import type { MarketplaceCategorie, MarketplaceProduct } from '../data/marketplaceTypes';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { PhotoPicker } from '../components/PhotoPicker';

/**
 * Éditeur produit vendeur — fidèle à design-reference-marketplace.dc.excerpt.html
 * (section VENDOR PRODUCT EDITOR, modal global). Ajout assumé par rapport à
 * l'extrait : un champ description (nécessaire pour que "L'histoire de
 * l'objet" de la fiche produit ait un vrai contenu, sinon le premier
 * vendeur réel ne pourrait pas la renseigner) et une sélection de catégorie
 * (chips, taxonomie de départ). L'ajout de photo est réellement branché
 * depuis le 2026-07-31 (bucket `user-uploads`).
 */
export function VendorProductEditorModal({
  visible,
  vendorId,
  product,
  onClose,
  onSaved,
}: {
  visible: boolean;
  vendorId: string;
  /** Produit à éditer, ou `null` pour une création. */
  product: MarketplaceProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState<MarketplaceCategorie>('autre');
  const [prix, setPrix] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setNom(product?.nom ?? '');
    setDescription(product?.description ?? '');
    setCategorie(product?.categorie ?? 'autre');
    setPrix(product ? String(product.prix_fcfa) : '');
    setStock(product ? String(product.stock) : '');
    setImageUrl(product?.image_url ?? null);
    setError(null);
  }, [visible, product]);

  const save = async () => {
    const prixNum = Number(prix.replace(/[^\d]/g, ''));
    const stockNum = Number(stock.replace(/[^\d]/g, ''));
    if (nom.trim().length < 2) {
      setError('Le nom du produit est obligatoire.');
      return;
    }
    if (!prixNum || prixNum <= 0) {
      setError('Indique un prix valide (en FCFA).');
      return;
    }
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      setError('Indique un stock valide (0 ou plus).');
      return;
    }
    setError(null);
    setSaving(true);
    const result = product
      ? await updateProduct(product.id, {
          nom: nom.trim(),
          description: description.trim() || null,
          categorie,
          prixFcfa: prixNum,
          stock: stockNum,
          imageUrl,
        })
      : await createProduct({
          vendorId,
          nom: nom.trim(),
          description: description.trim() || null,
          categorie,
          prixFcfa: prixNum,
          stock: stockNum,
          imageUrl,
        });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSaved();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{product ? 'Modifier le produit' : 'Nouveau produit'}</Text>

            <View style={styles.photoWrap}>
              <PhotoPicker folder="products" value={imageUrl} onChange={setImageUrl} />
            </View>

            <TextInput
              value={nom}
              onChangeText={setNom}
              placeholder="Nom du produit"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={80}
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Décris ce produit, son origine, son histoire..."
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.textarea]}
              multiline
              maxLength={2000}
            />

            <View style={styles.catRow}>
              {(Object.keys(MARKETPLACE_CATEGORIE_LABEL) as MarketplaceCategorie[]).map((c) => {
                const active = categorie === c;
                return (
                  <Pressable key={c} onPress={() => setCategorie(c)} style={[styles.catChip, active && styles.catChipActive]}>
                    <Text style={[styles.catChipLabel, active && styles.catChipLabelActive]}>
                      {MARKETPLACE_CATEGORIE_LABEL[c]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.row}>
              <TextInput
                value={prix}
                onChangeText={setPrix}
                placeholder="Prix (FCFA)"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={[styles.input, styles.rowInput]}
              />
              <TextInput
                value={stock}
                onChangeText={setStock}
                placeholder="Stock"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={[styles.input, styles.rowInput]}
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable onPress={save} style={styles.saveBtn} disabled={saving}>
              <Text style={styles.saveBtnLabel}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6,4,2,0.9)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.inputBg,
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: spacing.md + 2,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 9,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textHeading,
    marginBottom: 16,
  },
  photoWrap: {
    marginBottom: 14,
  },
  input: {
    fontFamily: typography.body,
    fontSize: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  catChip: {
    borderRadius: radii.badge,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  catChipActive: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  catChipLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11,
    color: colors.textBody,
  },
  catChipLabelActive: {
    color: colors.ctaTextOnGold,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  rowInput: {
    flex: 1,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.terracottaText,
    marginBottom: 10,
  },
  saveBtn: {
    borderRadius: 14,
    backgroundColor: colors.accentGoldBright,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  saveBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.ctaTextOnGold,
  },
});
