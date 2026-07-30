import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../theme/tokens';

export interface Country {
  name: string;
  dialCode: string;
  flag: string;
}

/**
 * Liste courte volontairement (pas les ~195 pays du monde) : le Cameroun en
 * premier (marché V1 ciblé, voir context/AFROBACK.md), puis les pays
 * d'Afrique francophone/anglophone les plus pertinents pour AFROBACK, puis
 * quelques pays de diaspora. À élargir si le besoin se confirme.
 */
export const COUNTRIES: Country[] = [
  { name: 'Cameroun', dialCode: '+237', flag: '🇨🇲' },
  { name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮' },
  { name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
  { name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { name: 'Gabon', dialCode: '+241', flag: '🇬🇦' },
  { name: 'Congo-Brazzaville', dialCode: '+242', flag: '🇨🇬' },
  { name: 'RD Congo', dialCode: '+243', flag: '🇨🇩' },
  { name: 'Tchad', dialCode: '+235', flag: '🇹🇩' },
  { name: 'République centrafricaine', dialCode: '+236', flag: '🇨🇫' },
  { name: 'Guinée', dialCode: '+224', flag: '🇬🇳' },
  { name: 'Niger', dialCode: '+227', flag: '🇳🇪' },
  { name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { name: 'Afrique du Sud', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Maroc', dialCode: '+212', flag: '🇲🇦' },
  { name: 'Algérie', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Tunisie', dialCode: '+216', flag: '🇹🇳' },
  { name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Belgique', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Canada / États-Unis', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Royaume-Uni', dialCode: '+44', flag: '🇬🇧' },
];

export function CountryPicker({
  value,
  onChange,
}: {
  value: Country;
  onChange: (country: Country) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={styles.flag}>{value.flag}</Text>
        <Text style={styles.label} numberOfLines={1}>
          {value.name}
        </Text>
        <Text style={styles.dialCode}>{value.dialCode}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choisis ton pays</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(c) => c.dialCode + c.name}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.rowLabel}>{item.name}</Text>
                  <Text style={styles.dialCode}>{item.dialCode}</Text>
                </Pressable>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.2)',
    backgroundColor: colors.placeholderStripeDark,
  },
  flag: {
    fontSize: 17,
  },
  label: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  dialCode: {
    fontFamily: typography.mono,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 16,
    color: colors.accentGold,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.backgroundPlayerTo,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.2)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240,195,107,.14)',
  },
  sheetTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.textHeading,
  },
  closeIcon: {
    fontSize: 18,
    color: colors.accentGold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  rowLabel: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
