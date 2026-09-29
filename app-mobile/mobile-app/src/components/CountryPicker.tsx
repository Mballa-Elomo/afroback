import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../theme/tokens';
import { Icon } from './Icons';
import { useI18n } from '../i18n';

export interface Country {
  /** Code ISO, sert de clé de traduction (`country.<code>` dans src/i18n). */
  code: string;
  /** Nom français de référence ; l'affichage passe par la traduction. */
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
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦' },
  { code: 'CG', name: 'Congo-Brazzaville', dialCode: '+242', flag: '🇨🇬' },
  { code: 'CD', name: 'RD Congo', dialCode: '+243', flag: '🇨🇩' },
  { code: 'TD', name: 'Tchad', dialCode: '+235', flag: '🇹🇩' },
  { code: 'CF', name: 'République centrafricaine', dialCode: '+236', flag: '🇨🇫' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', flag: '🇬🇳' },
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'ZA', name: 'Afrique du Sud', dialCode: '+27', flag: '🇿🇦' },
  { code: 'MA', name: 'Maroc', dialCode: '+212', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algérie', dialCode: '+213', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisie', dialCode: '+216', flag: '🇹🇳' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CA', name: 'Canada / États-Unis', dialCode: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'Royaume-Uni', dialCode: '+44', flag: '🇬🇧' },
];

export function CountryPicker({
  value,
  onChange,
}: {
  value: Country;
  onChange: (country: Country) => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={styles.flag}>{value.flag}</Text>
        <Text style={styles.label} numberOfLines={1}>
          {t(`country.${value.code}`)}
        </Text>
        <Text style={styles.dialCode}>{value.dialCode}</Text>
        <View style={styles.chevron}>
          <Icon name="chevronRight" size={16} color={colors.accentGold} strokeWidth={2.2} />
        </View>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('country.sheetTitle')}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(c) => c.code}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.rowLabel}>{t(`country.${item.code}`)}</Text>
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
  // Même aspect que les champs du parcours d'inscription (src/onboarding/FormField.tsx).
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.16)',
    backgroundColor: 'rgba(26,19,13,.85)',
  },
  flag: {
    fontSize: 17,
  },
  label: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dialCode: {
    fontFamily: typography.mono,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  chevron: {
    transform: [{ rotate: '90deg' }],
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
