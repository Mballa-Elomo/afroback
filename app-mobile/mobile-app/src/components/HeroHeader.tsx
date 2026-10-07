import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Heros } from '../data/types';
import { colors, typography } from '../theme/tokens';
import { BackButton } from '../ui/modern';
import { Icon } from './Icons';
import { useI18n } from '../i18n';

function heroYears(heros: Heros) {
  const from = heros.annee_naissance_indicative;
  const to = heros.annee_mort_indicative;
  if (from && to) return `${from} – ${to}`;
  if (from) return from;
  return heros.epoque;
}

function shortEra(epoque: string) {
  return epoque.split(/[,(]/)[0].trim();
}

/**
 * En-tête immersif de la fiche héros (refonte moderne du 2026-09-30) :
 * grande photo qui se fond dans la page, bouton retour flottant, époque et
 * thème en pastilles, nom en grand, années et région.
 */
export function HeroHeader({ heros, onBack }: { heros: Heros; onBack: () => void }) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.placeholderStripeLight, colors.placeholderStripeDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {heros.image_carte_catalogue ? (
        <Image source={{ uri: heros.image_carte_catalogue }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} cachePolicy="memory-disk" />
      ) : (
        <View style={styles.watermark}>
          <Icon name="crown" size={90} color="rgba(240,195,107,.18)" strokeWidth={1.2} />
        </View>
      )}
      <LinearGradient
        colors={['rgba(11,9,6,0.45)', 'rgba(11,9,6,0)', 'rgba(11,9,6,0.55)', '#0B0906']}
        locations={[0, 0.25, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.back, { top: insets.top + 8 }]}>
        <BackButton onPress={onBack} floating />
      </View>
      <View style={styles.bottom}>
        <View style={styles.pills}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{shortEra(heros.epoque)}</Text>
          </View>
          {!!heros.theme[0] && (
            <View style={[styles.pill, styles.pillGold]}>
              <Text style={[styles.pillText, styles.pillGoldText]}>{t(`heroTheme.${heros.theme[0]}`, { defaultValue: heros.theme[0] })}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{heros.nom_affiche}</Text>
        <View style={styles.metaRow}>
          <Icon name="mapPin" size={14} color={colors.accentGoldSoft} />
          <Text style={styles.meta} numberOfLines={1}>
            {heroYears(heros)} · {heros.region}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 440, overflow: 'hidden', backgroundColor: colors.placeholderStripeDark },
  watermark: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', left: 16 },
  bottom: { position: 'absolute', bottom: 18, left: 18, right: 18 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(8,6,4,.55)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.35)',
  },
  pillText: { fontFamily: typography.bodySemiBold, fontSize: 11.5, color: colors.accentGoldPale },
  pillGold: { backgroundColor: colors.accentGoldBright, borderColor: colors.accentGoldBright },
  pillGoldText: { color: colors.ctaTextOnGold },
  name: { fontFamily: typography.display, fontSize: 32, lineHeight: 36, color: '#FFF4E0' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  meta: { flexShrink: 1, fontFamily: typography.body, fontSize: 13.5, color: 'rgba(255,244,224,.78)' },
});
