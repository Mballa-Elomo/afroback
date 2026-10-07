import { useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors, typography } from '../theme/tokens';
import i18n from '../i18n';

/**
 * Champs de formulaire de la maquette (écran 7 "Crée ton compte") : icône au
 * trait à gauche, fond sombre, bordure fine qui passe à l'or au focus,
 * message d'erreur sous le champ concerné (cdc-onboarding.md, écran 7).
 */

type IconName = 'user' | 'mail' | 'lock' | 'phone';

const STROKE = '#9A8870';

function FieldIcon({ name }: { name: IconName }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={1.6}>
      {name === 'user' && (
        <>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
        </>
      )}
      {name === 'mail' && (
        <>
          <Rect x={3} y={5} width={18} height={14} rx={2} />
          <Path d="M3.5 6.5 12 13l8.5-6.5" strokeLinejoin="round" />
        </>
      )}
      {name === 'lock' && (
        <>
          <Rect x={4.5} y={10.5} width={15} height={10} rx={2} />
          <Path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </>
      )}
      {name === 'phone' && (
        <Path
          d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={1.6}>
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinejoin="round" />
      <Circle cx={12} cy={12} r={3} />
      {!open && <Path d="M4 20 20 4" strokeLinecap="round" />}
    </Svg>
  );
}

export function FormField({
  icon,
  error,
  hint,
  secure = false,
  leading,
  ...inputProps
}: TextInputProps & {
  icon: IconName;
  error?: string | null;
  /** Aide affichée sous le champ tant qu'il n'y a pas d'erreur (ex. règle du mot de passe). */
  hint?: string;
  /** Champ mot de passe : ajoute l'œil pour afficher/masquer. */
  secure?: boolean;
  /** Élément placé entre l'icône et la saisie (ex. indicatif pays). */
  leading?: ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <View style={[styles.box, focused && styles.boxFocused, !!error && styles.boxError]}>
        <FieldIcon name={icon} />
        {leading}
        <TextInput
          {...inputProps}
          secureTextEntry={secure && !visible}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          // Web : pas de cadre blanc du navigateur, le contour doré du champ suffit.
          style={[styles.input, Platform.OS === 'web' && styles.inputWeb]}
          accessibilityLabel={inputProps.accessibilityLabel ?? inputProps.placeholder}
        />
        {secure && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={visible ? i18n.t('formField.hide') : i18n.t('formField.show')}
          >
            <EyeIcon open={!visible} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function GoldCheckbox({
  checked,
  onToggle,
  children,
  error,
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
  error?: string | null;
}) {
  return (
    <View>
      <Pressable
        onPress={onToggle}
        style={styles.checkRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        hitSlop={6}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.tick}>✓</Text>}
        </View>
        <View style={{ flex: 1 }}>{children}</View>
      </Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.16)',
    backgroundColor: 'rgba(26,19,13,.85)',
  },
  boxFocused: {
    borderColor: 'rgba(240,195,107,.7)',
  },
  boxError: {
    borderColor: colors.terracotta,
  },
  input: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  inputWeb: {
    outlineStyle: 'none',
  } as object,
  error: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.terracottaText,
    marginTop: 6,
    marginLeft: 4,
  },
  hint: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMutedAlt,
    marginTop: 6,
    marginLeft: 4,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.accentGold,
  },
  tick: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ctaTextOnGold,
  },
});
