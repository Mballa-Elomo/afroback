import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme/tokens';
import { useI18n } from '../i18n';

/**
 * Indicateur de solidité du mot de passe (Module 2, cdc-inscription.md).
 * Règle minimale imposée à l'inscription : 8 caractères, au moins une
 * lettre et un chiffre (`meetsPasswordRule`). La solidité affichée va au-delà
 * pour inciter à mieux, sans jamais bloquer.
 */

export function meetsPasswordRule(pw: string): boolean {
  return pw.length >= 8 && /[A-Za-zÀ-ÿ]/.test(pw) && /\d/.test(pw);
}

/** 0 = vide, 1 = faible, 2 = moyen, 3 = solide. */
export function passwordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  if (!meetsPasswordRule(pw)) return 1;
  let score = 0;
  if (pw.length >= 12) score++;
  if (/[a-zà-ÿ]/.test(pw) && /[A-ZÀ-Ý]/.test(pw)) score++;
  if (/[^A-Za-zÀ-ÿ0-9]/.test(pw)) score++;
  return score >= 2 ? 3 : 2;
}

const LEVEL_COLORS = ['transparent', '#C8553D', '#E0A24A', '#7FB069'] as const;

export function PasswordStrength({ password }: { password: string }) {
  const { t } = useI18n();
  const level = passwordStrength(password);
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fill, { toValue: level / 3, duration: 250, useNativeDriver: false /* largeur : non supportée par le pilote natif */ }).start();
  }, [level, fill]);

  if (level === 0) return null;
  const label = level === 1 ? t('signup.strength.weak') : level === 2 ? t('signup.strength.medium') : t('signup.strength.strong');

  return (
    <View style={styles.wrap} accessible accessibilityLabel={`${t('signup.strength.label')} : ${label}`}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: LEVEL_COLORS[level],
              width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: LEVEL_COLORS[level] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginHorizontal: 4,
  },
  track: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(237,227,212,.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  label: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12.5,
    minWidth: 52,
    textAlign: 'right',
    color: colors.textBody,
  },
});
