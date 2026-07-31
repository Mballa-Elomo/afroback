import { StyleSheet, Text, View } from 'react-native';
import type { AffirmationStatuee, StatutFactuel } from '../data/decouverteTypes';
import { STATUT_FACTUEL_LABEL } from '../data/decouverteDisplay';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { SectionTitle } from './SectionTitle';

const STATUT_COLOR: Record<StatutFactuel, string> = {
  atteste: colors.accentGoldSoft,
  tradition_orale: colors.textMutedAlt,
  debattu: colors.terracottaTextAlt,
};

/**
 * Liste des affirmations d'une fiche Découverte, chacune étiquetée
 * atteste/tradition_orale/debattu — jamais une simple liste "à retenir"
 * sans distinction, contrairement à la maquette d'origine qui ne prévoyait
 * pas cette nuance (le contenu produit par afroback-decouverte l'exige, cf.
 * data-model-decouverte.md). Non cliquable : pas de sous-écran par fait
 * (pas de galerie/carrousel produit pour ce contenu), pour éviter un bouton
 * qui ne mènerait nulle part.
 */
export function FaitsList({ faits }: { faits: AffirmationStatuee[] }) {
  if (faits.length === 0) return null;
  return (
    <View style={styles.section}>
      <SectionTitle title="Faits" />
      {faits.map((f, i) => (
        <View key={i} style={styles.row}>
          <Text style={[styles.bullet, { color: STATUT_COLOR[f.statut] }]}>◆</Text>
          <Text style={styles.text}>{f.affirmation}</Text>
          <View style={[styles.tag, { borderColor: STATUT_COLOR[f.statut] }]}>
            <Text style={[styles.tagLabel, { color: STATUT_COLOR[f.statut] }]}>
              {STATUT_FACTUEL_LABEL[f.statut].toUpperCase()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 11,
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textBodyAlt,
  },
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.badge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 1,
  },
  tagLabel: {
    fontFamily: typography.mono,
    fontSize: 7.5,
    letterSpacing: 0.4,
  },
});
