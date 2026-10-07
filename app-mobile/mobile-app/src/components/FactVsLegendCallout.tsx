import { StyleSheet, Text, View } from 'react-native';
import type { Citation, LegendeAssociee, StatutAttestation } from '../data/types';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { SectionTitle } from './SectionTitle';
import { useI18n } from '../i18n';

const ATTESTATION_LABEL: Record<StatutAttestation, string> = {
  attestee: 'Citation attestée',
  rapportee_par_tiers: 'Rapportée par un tiers',
  non_authentifiee: 'Non authentifiée',
};

/**
 * Composant obligatoire (design-system-mobile.md §3) : signale visuellement
 * qu'un passage relève de la légende / tradition orale, ou qu'une citation
 * n'a pas le même niveau d'attestation qu'un fait vérifié. Ne jamais
 * présenter une légende comme un fait — logique déjà actée par le griot.
 */
export function LegendCard({ legende }: { legende: LegendeAssociee }) {
  const { t } = useI18n();
  return (
    <View style={styles.legendCard}>
      <Text style={styles.legendTag}>{t('legendCards.legendTag')}</Text>
      <Text style={styles.legendTitle}>{legende.titre}</Text>
      <Text style={styles.legendBody}>{legende.description}</Text>
    </View>
  );
}

export function CitationCard({ citation }: { citation: Citation }) {
  const { t } = useI18n();
  return (
    <View style={styles.citationCard}>
      <Text style={styles.attestationTag}>{t(`attestation.${citation.statut_attestation}`).toUpperCase()}</Text>
      <Text style={styles.citationText}>« {citation.texte} »</Text>
      <Text style={styles.citationSource}>{citation.source}</Text>
    </View>
  );
}

export function CitationsSection({ citations, bare = false }: { citations: Citation[]; /** Sans titre ni marge (dans une section repliable). */ bare?: boolean }) {
  const { t } = useI18n();
  if (citations.length === 0) return null;
  return (
    <View style={bare ? undefined : styles.section}>
      {!bare && <SectionTitle title={t('legendCards.quotes')} />}
      {citations.map((c, i) => (
        <CitationCard key={i} citation={c} />
      ))}
    </View>
  );
}

export function LegendesSection({ legendes, bare = false }: { legendes: LegendeAssociee[]; /** Sans titre ni marge (dans une section repliable). */ bare?: boolean }) {
  const { t } = useI18n();
  if (legendes.length === 0) return null;
  return (
    <View style={bare ? undefined : styles.section}>
      {!bare && <SectionTitle title={t('legendCards.legends')} />}
      {legendes.map((l, i) => (
        <LegendCard key={i} legende={l} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  legendCard: {
    borderRadius: radii.cardSmall,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(154, 136, 112, 0.5)',
    backgroundColor: 'rgba(154, 136, 112, 0.06)',
    padding: spacing.sm + 3,
    marginBottom: spacing.sm,
    gap: 4,
  },
  legendTag: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.textMutedAlt,
  },
  legendTitle: {
    fontFamily: typography.displaySemiBold,
    fontSize: 14,
    color: colors.textHeading,
  },
  legendBody: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textBody,
  },
  citationCard: {
    borderRadius: radii.cardSmall,
    borderLeftWidth: 3,
    borderLeftColor: colors.terracotta,
    backgroundColor: colors.cardBg,
    padding: spacing.sm + 3,
    marginBottom: spacing.sm,
    gap: 4,
  },
  attestationTag: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.accentGoldSoft,
  },
  citationText: {
    fontFamily: typography.displaySemiBold,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 21,
    color: colors.textQuote,
  },
  citationSource: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.textMuted,
  },
});
