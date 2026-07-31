import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getParentSettings, setParentPin } from '../data/parentEnfantRepository';
import { colors, radii, spacing, typography } from '../theme/tokens';

/**
 * Verrou PIN à 4 chiffres — décision PAR DÉFAUT du chef de projet (Yannick
 * n'a pas explicitement tranché ce point, voir context/AFROBACK.md,
 * "Décisions prises" du 2026-07-31). Demandé uniquement pour (a) revenir au
 * profil adulte depuis un profil enfant, (b) entrer dans l'Espace Parent —
 * jamais pour choisir un profil enfant depuis le sélecteur.
 *
 * Si le parent n'a encore jamais défini de code (parent_settings.pin_code
 * = null), ce composant bascule automatiquement en mode "création" (saisie
 * + confirmation) au lieu de bloquer sur un code qui n'existe pas.
 */
export function PinGate({
  visible,
  onCancel,
  onSuccess,
}: {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<'loading' | 'enter' | 'create'>('loading');
  const [existingPin, setExistingPin] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const confirmInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;
    setMode('loading');
    setValue('');
    setConfirmValue('');
    setError(null);
    let alive = true;
    getParentSettings()
      .then((settings) => {
        if (!alive) return;
        setExistingPin(settings?.pin_code ?? null);
        setMode(settings?.pin_code ? 'enter' : 'create');
      })
      .catch((e) => {
        if (!alive) return;
        // Impossible de vérifier le PIN (réseau, table pas encore créée) :
        // on ne bloque jamais l'accès pour une raison purement technique —
        // on laisse passer, comme le reste de l'app en cas d'échec réseau
        // sur une donnée non critique pour la sécurité réelle du compte.
        console.warn('Vérification du code PIN impossible, accès laissé libre :', e);
        onSuccess();
      });
    return () => {
      alive = false;
    };
  }, [visible]);

  const handleEnterSubmit = () => {
    if (value.length !== 4) return;
    if (value === existingPin) {
      onSuccess();
      return;
    }
    setError('Code incorrect.');
    setValue('');
  };

  const handleCreateSubmit = async () => {
    if (value.length !== 4) return;
    if (confirmValue.length !== 4) return;
    if (value !== confirmValue) {
      setError('Les deux codes ne correspondent pas.');
      setConfirmValue('');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await setParentPin(value);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'enregistrer le code.");
    } finally {
      setSaving(false);
    }
  };

  // Validation automatique dès le 4e chiffre : sur Android le clavier
  // numérique n'a pas de touche "Terminé", il reste ouvert et peut masquer
  // le bouton "Valider" en dessous — l'utilisateur ne pouvait plus le
  // toucher. Ne plus dépendre du tap sur le bouton pour ce cas.
  useEffect(() => {
    if (mode !== 'enter' || value.length !== 4) return;
    Keyboard.dismiss();
    handleEnterSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, mode]);

  useEffect(() => {
    if (mode !== 'create' || value.length !== 4 || confirmValue.length !== 0) return;
    confirmInputRef.current?.focus();
  }, [value, mode, confirmValue.length]);

  useEffect(() => {
    if (mode !== 'create' || value.length !== 4 || confirmValue.length !== 4) return;
    Keyboard.dismiss();
    handleCreateSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmValue, mode]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Tape en dehors de la carte pour masquer le clavier sans fermer la modale. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={() => Keyboard.dismiss()} />
        <View style={styles.card}>
          {mode === 'loading' && <Text style={styles.title}>Vérification…</Text>}

          {mode === 'enter' && (
            <>
              <Text style={styles.title}>Code parent</Text>
              <Text style={styles.subtitle}>Entre le code à 4 chiffres pour continuer.</Text>
              <TextInput
                value={value}
                onChangeText={(t) => {
                  setError(null);
                  setValue(t.replace(/[^0-9]/g, '').slice(0, 4));
                }}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                style={styles.input}
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.row}>
                <Pressable onPress={onCancel} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryLabel}>Annuler</Text>
                </Pressable>
                <Pressable onPress={handleEnterSubmit} disabled={value.length !== 4} style={[styles.primaryBtn, value.length !== 4 && styles.btnDisabled]}>
                  <Text style={styles.primaryLabel}>Valider</Text>
                </Pressable>
              </View>
            </>
          )}

          {mode === 'create' && (
            <>
              <Text style={styles.title}>Créer un code parent</Text>
              <Text style={styles.subtitle}>
                Choisis un code à 4 chiffres. Il sera demandé pour revenir à l'espace adulte depuis un profil enfant, et pour accéder à l'Espace Parent.
              </Text>
              <TextInput
                value={value}
                onChangeText={(t) => {
                  setError(null);
                  setValue(t.replace(/[^0-9]/g, '').slice(0, 4));
                }}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                style={styles.input}
                placeholder="Nouveau code"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <TextInput
                ref={confirmInputRef}
                value={confirmValue}
                onChangeText={(t) => {
                  setError(null);
                  setConfirmValue(t.replace(/[^0-9]/g, '').slice(0, 4));
                }}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                style={styles.input}
                placeholder="Confirme le code"
                placeholderTextColor={colors.textMuted}
              />
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.row}>
                <Pressable onPress={onCancel} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryLabel}>Annuler</Text>
                </Pressable>
                <Pressable
                  onPress={handleCreateSubmit}
                  disabled={value.length !== 4 || confirmValue.length !== 4 || saving}
                  style={[styles.primaryBtn, (value.length !== 4 || confirmValue.length !== 4 || saving) && styles.btnDisabled]}
                >
                  <Text style={styles.primaryLabel}>{saving ? 'Enregistrement…' : 'Créer'}</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8,6,4,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#160f0a',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.card,
    padding: 22,
  },
  title: {
    fontFamily: typography.displaySemiBold,
    fontSize: 17,
    color: colors.textHeading,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMutedAlt,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    textAlign: 'center',
    letterSpacing: 8,
    fontFamily: typography.monoBold,
    fontSize: 22,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    borderRadius: 13,
    paddingVertical: 14,
    marginBottom: 10,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.terracottaText,
    textAlign: 'center',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textMutedAlt,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: colors.accentGold,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  primaryLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.ctaTextOnGold,
  },
});
