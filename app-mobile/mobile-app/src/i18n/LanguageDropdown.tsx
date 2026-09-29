import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors, typography } from '../theme/tokens';
import { APP_LANGUAGES, setAppLanguage, useI18n, type AppLanguage } from './index';

/**
 * Sélecteur de langue compact de l'écran 1 (demande de Yannick du
 * 2026-09-29 : "une dropdown list avec le drapeau à côté de la langue, un
 * truc moderne" à la place de deux gros boutons). Pastille discrète
 * (drapeau + langue + chevron) ; au toucher, un menu s'ouvre en fondu avec
 * une coche sur la langue active. Toucher ailleurs le referme.
 *
 * Drapeaux dessinés en SVG plutôt qu'en emoji : les emojis drapeaux
 * s'affichent en simples lettres ("FR", "GB") sous Windows, donc sur la
 * version web de test ouverte depuis un PC.
 */

const USE_NATIVE = Platform.OS !== 'web';

export function Flag({ code, size = 20 }: { code: AppLanguage; size?: number }) {
  const w = size * 1.5;
  return (
    <View style={[styles.flag, { width: w, height: size, borderRadius: size * 0.18 }]}>
      <Svg width={w} height={size} viewBox="0 0 60 40" preserveAspectRatio="none">
        {code === 'fr' ? (
          <>
            <Rect x={0} y={0} width={20} height={40} fill="#002395" />
            <Rect x={20} y={0} width={20} height={40} fill="#FFFFFF" />
            <Rect x={40} y={0} width={20} height={40} fill="#ED2939" />
          </>
        ) : (
          // Union Jack simplifié (lisible à petite taille).
          <>
            <Rect x={0} y={0} width={60} height={40} fill="#012169" />
            <Path d="M0 0 L60 40 M60 0 L0 40" stroke="#FFFFFF" strokeWidth={8} />
            <Path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth={3} />
            <Path d="M30 0 V40 M0 20 H60" stroke="#FFFFFF" strokeWidth={12} />
            <Path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth={7} />
          </>
        )}
      </Svg>
    </View>
  );
}

export function LanguageDropdown() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const current = APP_LANGUAGES.find((l) => l.code === lang) ?? APP_LANGUAGES[0];

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: open ? 180 : 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE,
    }).start();
  }, [open, anim]);

  const choose = (code: AppLanguage) => {
    setAppLanguage(code);
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [styles.trigger, (pressed || open) && styles.triggerActive]}
        accessibilityRole="button"
        accessibilityLabel={`${t('splash.chooseLanguage')} : ${current.label}`}
        accessibilityState={{ expanded: open }}
        hitSlop={8}
      >
        <Flag code={current.code} size={16} />
        <Text style={styles.triggerLabel}>{current.label}</Text>
        <Animated.View
          style={{ transform: [{ rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}
        >
          <Svg width={12} height={12} viewBox="0 0 12 12">
            <Path d="M2.5 4.5 6 8l3.5-3.5" stroke={colors.accentGoldPale} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Animated.View>
      </Pressable>

      {open && (
        // Toucher en dehors du menu le referme (zone très large, transparente).
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel={t('wall.close')} />
      )}

      {/* Rendu seulement quand il est ouvert : un menu invisible resterait lisible par le lecteur d'écran. */}
      {open && (
        <Animated.View
          style={[
            styles.menu,
            {
              opacity: anim,
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) },
                { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
              ],
            },
          ]}
          accessibilityRole="menu"
        >
          <Text style={styles.menuTitle}>{t('splash.chooseLanguage')}</Text>
          {APP_LANGUAGES.map((l) => {
            const selected = l.code === lang;
            return (
              <Pressable
                key={l.code}
                onPress={() => choose(l.code)}
                style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.optionPressed]}
                accessibilityRole="menuitem"
                accessibilityState={{ selected }}
                accessibilityLabel={l.label}
              >
                <Flag code={l.code} size={18} />
                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{l.label}</Text>
                <Text style={styles.check}>{selected ? '✓' : ''}</Text>
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-end',
    zIndex: 20,
  },
  flag: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,.35)',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 12,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.35)',
    backgroundColor: 'rgba(11,9,6,.55)',
  },
  triggerActive: {
    borderColor: 'rgba(240,195,107,.7)',
    backgroundColor: 'rgba(11,9,6,.75)',
  },
  triggerLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -3000,
  },
  menu: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 210,
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
    backgroundColor: 'rgba(20,14,9,.97)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  menuTitle: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
    textTransform: 'uppercase',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 46,
    paddingHorizontal: 10,
    borderRadius: 11,
  },
  optionSelected: {
    backgroundColor: 'rgba(240,195,107,.1)',
  },
  optionPressed: {
    backgroundColor: 'rgba(240,195,107,.16)',
  },
  optionLabel: {
    flex: 1,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: colors.textBody,
  },
  optionLabelSelected: {
    fontFamily: typography.bodySemiBold,
    color: colors.accentGoldPale,
  },
  check: {
    width: 18,
    fontSize: 15,
    fontWeight: '800',
    color: colors.accentGoldBright,
    textAlign: 'center',
  },
});
