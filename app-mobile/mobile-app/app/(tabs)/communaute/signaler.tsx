import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateProfileForm } from '../../../src/components/CreateProfileForm';
import { GoldButton, GhostButton } from '../../../src/components/Buttons';
import { LoadingState } from '../../../src/components/LoadingState';
import { createReport } from '../../../src/data/communityRepository';
import { useOwnProfile } from '../../../src/data/useCommunityData';
import type { CommunityReportMotif, CommunityReportTargetType } from '../../../src/data/communityTypes';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';

const REASONS: { id: CommunityReportMotif; label: string }[] = [
  { id: 'contenu_inapproprie', label: 'Contenu inapproprié' },
  { id: 'harcelement', label: 'Harcèlement ou intimidation' },
  { id: 'desinformation', label: 'Désinformation' },
  { id: 'spam', label: 'Spam ou publicité' },
  { id: 'autre', label: 'Autre' },
];

/**
 * Signalement — fidèle à design-reference-communaute.dc.excerpt.html
 * (section REPORT). Écriture seule côté base (aucune lecture possible des
 * signalements, même par le signalant, voir data-model-communaute.md §6) :
 * le message de confirmation reste honnête sur l'absence de suivi visible.
 */
export default function ReportScreen() {
  const { targetType, targetId, label } = useLocalSearchParams<{
    targetType: CommunityReportTargetType;
    targetId: string;
    label?: string;
  }>();
  const router = useRouter();
  const [ownProfileState, refreshOwnProfile] = useOwnProfile();
  const [motif, setMotif] = useState<CommunityReportMotif | null>(null);
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!motif || ownProfileState.status !== 'ready' || !ownProfileState.data || !targetType || !targetId) return;
    setSending(true);
    const { error } = await createReport({
      reporterProfileId: ownProfileState.data.id,
      targetType,
      targetId,
      motif,
      description: description.trim() || null,
    });
    setSending(false);
    if (!error) setSent(true);
  };

  if (ownProfileState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Signaler</Text>
        </View>

        {sent ? (
          <View style={styles.thanks}>
            <Text style={styles.thanksIcon}>🛡️</Text>
            <Text style={styles.thanksTitle}>Merci pour ton signalement</Text>
            <Text style={styles.thanksSub}>
              Notre équipe va l'examiner. Pour rester simple au démarrage, il n'y a pas encore de suivi visible dans
              l'app — mais chaque signalement est bien traité.
            </Text>
            <GhostButton label="Retour au fil" onPress={() => router.replace('/communaute')} />
          </View>
        ) : ownProfileState.status === 'ready' && !ownProfileState.data ? (
          <CreateProfileForm onCreated={refreshOwnProfile} />
        ) : (
          <>
            {label && (
              <View style={styles.contextBox}>
                <Text style={styles.contextLabel}>Tu signales :</Text>
                <Text style={styles.contextText} numberOfLines={2}>
                  {label}
                </Text>
              </View>
            )}
            <Text style={styles.intro}>Pourquoi signales-tu ce contenu ?</Text>
            <View style={styles.reasons}>
              {REASONS.map((r) => {
                const active = motif === r.id;
                return (
                  <Pressable key={r.id} onPress={() => setMotif(r.id)} style={[styles.reason, active && styles.reasonActive]}>
                    <View style={[styles.radio, active && styles.radioActive]} />
                    <Text style={styles.reasonLabel}>{r.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Précise si besoin (optionnel)..."
              placeholderTextColor={colors.textMuted}
              style={styles.description}
              multiline
              maxLength={500}
            />
            <GoldButton label={sending ? 'Envoi...' : 'Envoyer le signalement'} onPress={send} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.md + 2,
    paddingTop: 6,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  backIcon: {
    fontSize: 20,
    color: colors.accentGold,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textHeading,
  },
  thanks: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 10,
    gap: 6,
  },
  thanksIcon: {
    fontSize: 44,
  },
  thanksTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textHeading,
    marginTop: 8,
  },
  thanksSub: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMutedAlt,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  contextBox: {
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  contextLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 0.6,
    color: colors.textMuted,
    marginBottom: 4,
  },
  contextText: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textBodyAlt,
  },
  intro: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMutedAlt,
    marginBottom: 14,
  },
  reasons: {
    gap: 10,
    marginBottom: 18,
  },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  reasonActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.cardBg,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  radioActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.accentGold,
  },
  reasonLabel: {
    fontFamily: typography.body,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  description: {
    minHeight: 70,
    fontFamily: typography.body,
    fontSize: 13,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    padding: 12,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
});
