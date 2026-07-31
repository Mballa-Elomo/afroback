import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActiveProfile } from '../../src/profils/ActiveProfileProvider';
import { AVATAR_COULEURS, AVATAR_GRADIENTS, AVATAR_LABEL } from '../../src/profils/enfantPalette';
import { createChildProfile } from '../../src/data/parentEnfantRepository';
import type { AvatarCouleur, LangueCamerounaise } from '../../src/data/parentEnfantTypes';
import { GoldButton } from '../../src/components/Buttons';
import { colors, radii, spacing, typography } from '../../src/theme/tokens';

const LANGUES: { id: LangueCamerounaise; label: string }[] = [
  { id: 'ewondo', label: 'Ewondo' },
  { id: 'douala', label: 'Douala' },
  { id: 'bassa', label: 'Bassa' },
  { id: 'bamileke', label: 'Bamiléké' },
];

/**
 * Ajout d'un profil enfant — fidèle à design-reference-parent-enfant.dc.excerpt.html
 * (ONBOARDING · PROFILS ENFANTS), MAIS sans la partie tarification qui suit
 * dans la maquette : décision de Yannick du 2026-07-31, l'ajout d'un profil
 * enfant est gratuit et sans friction de paiement en V1. Pas de compteur
 * "Enfants rattachés" ni de bouton "Continuer vers les forfaits" — un
 * simple formulaire, répétable en revenant sur cet écran depuis le
 * sélecteur ou l'Espace Parent.
 *
 * Champ "Langues à activer" stocké tel quel (vraie préférence), mais
 * consommé par aucune leçon réelle à ce jour (pilier langues bloqué, voir
 * context/AFROBACK.md) — voir schema-parent-enfant.sql.
 */
export default function AjouterProfilEnfantScreen() {
  const router = useRouter();
  const { refreshChildren } = useActiveProfile();
  const [prenom, setPrenom] = useState('');
  const [age, setAge] = useState('');
  const [avatarCouleur, setAvatarCouleur] = useState<AvatarCouleur>('terracotta');
  const [langues, setLangues] = useState<LangueCamerounaise[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ageNumber = Number(age);
  const isValid = prenom.trim().length > 0 && age.trim().length > 0 && Number.isInteger(ageNumber) && ageNumber >= 0 && ageNumber <= 17;

  const toggleLangue = (id: LangueCamerounaise) => {
    setLangues((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await createChildProfile({ prenom: prenom.trim(), age: ageNumber, avatarCouleur, languesActives: langues });
      await refreshChildren();
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'ajouter ce profil pour l'instant.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Ajoute ton enfant</Text>
        <Text style={styles.subtitle}>Un profil dédié, sans mot de passe séparé — l'enfant choisit juste son avatar dans le sélecteur.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>PRÉNOM DE L'ENFANT</Text>
          <TextInput
            value={prenom}
            onChangeText={setPrenom}
            placeholder="Léa"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.label}>ÂGE</Text>
            <TextInput
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, '').slice(0, 2))}
              placeholder="8"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
          <View style={[styles.field, styles.flex2]}>
            <Text style={styles.label}>AVATAR</Text>
            <View style={styles.avatarRow}>
              {AVATAR_COULEURS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setAvatarCouleur(c)}
                  accessibilityLabel={AVATAR_LABEL[c]}
                  style={[
                    styles.avatarSwatch,
                    { backgroundColor: AVATAR_GRADIENTS[c][0] },
                    avatarCouleur === c && styles.avatarSwatchActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>LANGUES À ACTIVER</Text>
          <View style={styles.chipsRow}>
            {LANGUES.map((l) => {
              const active = langues.includes(l.id);
              return (
                <Pressable key={l.id} onPress={() => toggleLangue(l.id)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{l.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>Aucune leçon n'existe encore dans ces langues — c'est une préférence enregistrée pour plus tard.</Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.cta}>
          <GoldButton label={saving ? 'Ajout en cours…' : 'Ajouter ce profil'} onPress={handleSubmit} disabled={!isValid || saving} />
        </View>
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
    padding: spacing.md + 2,
    paddingBottom: 60,
  },
  back: {
    fontSize: 22,
    color: colors.accentGold,
    marginBottom: 6,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.textHeading,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMutedAlt,
    lineHeight: 19,
    marginBottom: 22,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 10.5,
    letterSpacing: 1,
    color: colors.textMutedAlt,
    marginBottom: 7,
  },
  input: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    borderRadius: 13,
    padding: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 8,
  },
  avatarSwatch: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSwatchActive: {
    borderColor: colors.accentGold,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  chipActive: {
    borderColor: colors.accentGold,
    backgroundColor: 'rgba(240,195,107,0.15)',
  },
  chipLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12,
    color: colors.textBodyAlt,
  },
  chipLabelActive: {
    color: colors.textHeading,
  },
  hint: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 15,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.terracottaText,
    marginBottom: 14,
  },
  cta: {
    marginTop: 6,
  },
});
