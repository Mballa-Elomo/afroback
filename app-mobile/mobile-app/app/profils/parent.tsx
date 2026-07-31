import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActiveProfile } from '../../src/profils/ActiveProfileProvider';
import { AVATAR_GRADIENTS } from '../../src/profils/enfantPalette';
import {
  getChildLastActivity,
  getChildTodayStats,
  updateChildDecouverteActivee,
  updateChildLimiteEcran,
} from '../../src/data/parentEnfantRepository';
import type { ChildProfile, ChildTodayStats } from '../../src/data/parentEnfantTypes';
import { relativeTime } from '../../src/data/relativeTime';
import { colors, radii, spacing, typography } from '../../src/theme/tokens';

type ChildRowData = {
  stats: ChildTodayStats | null;
  lastActivity: string | null;
  loading: boolean;
};

/**
 * Espace Parent — fidèle à design-reference-parent-enfant.dc.excerpt.html
 * (PARENT SPACE), avec deux écarts assumés (voir README, "Module
 * Parent/Enfant") :
 * - Les tuiles "% ewondo" et "badges" de la maquette sont remplacées par le
 *   seul chiffre réel disponible (temps aujourd'hui) : aucune leçon ni
 *   système de badge n'existe, mieux vaut l'omettre qu'afficher un 0 % ou
 *   un badge inventé.
 * - "Limite d'écran quotidienne" est un réglage informatif seulement (V1) :
 *   affiché et modifiable, mais n'entraîne aucun verrouillage de l'app.
 */
export default function ParentSpaceScreen() {
  const router = useRouter();
  const { children, refreshChildren } = useActiveProfile();
  const [rowData, setRowData] = useState<Record<string, ChildRowData>>({});

  useEffect(() => {
    let alive = true;
    for (const c of children) {
      setRowData((prev) => ({ ...prev, [c.id]: { stats: null, lastActivity: null, loading: true } }));
      Promise.all([getChildTodayStats(c.id), getChildLastActivity(c.id)])
        .then(([stats, lastActivity]) => {
          if (!alive) return;
          setRowData((prev) => ({ ...prev, [c.id]: { stats, lastActivity, loading: false } }));
        })
        .catch(() => {
          if (!alive) return;
          setRowData((prev) => ({ ...prev, [c.id]: { stats: null, lastActivity: null, loading: false } }));
        });
    }
    return () => {
      alive = false;
    };
  }, [children]);

  const toggleDecouverte = async (c: ChildProfile) => {
    try {
      await updateChildDecouverteActivee(c.id, !c.decouverte_activee);
      await refreshChildren();
    } catch {
      // Best-effort : si l'écriture échoue (réseau), le toggle reste
      // simplement inchangé à l'écran, pas de blocage bruyant pour un réglage secondaire.
    }
  };

  const adjustLimite = async (c: ChildProfile, deltaMinutes: number) => {
    const current = c.limite_ecran_minutes ?? 0;
    const next = Math.max(0, current + deltaMinutes);
    try {
      await updateChildLimiteEcran(c.id, next === 0 ? null : next);
      await refreshChildren();
    } catch {
      // idem : réglage secondaire, échec silencieux côté UI
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Espace Parent</Text>
        </View>
        <Text style={styles.subtitle}>Contrôle parental &amp; suivi des profils enfants.</Text>

        {children.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucun profil enfant pour l'instant.</Text>
          </View>
        )}

        {children.map((c) => {
          const row = rowData[c.id];
          const tempsLabel = row?.stats
            ? row.stats.aDejaUneSession
              ? formatMinutes(row.stats.minutesAujourdhui)
              : 'Aucune session'
            : '…';
          const derniereActiviteLabel = row?.loading ? '…' : row?.lastActivity ? relativeTime(row.lastActivity) : 'Jamais encore';

          return (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: AVATAR_GRADIENTS[c.avatar_couleur][0] }]}>
                  <Text style={styles.avatarLetter}>{c.prenom.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.cardHeaderBody}>
                  <Text style={styles.childName}>
                    {c.prenom} <Text style={styles.childAge}>· {c.age} ans</Text>
                  </Text>
                  <Text style={styles.lastActivity}>Dernière activité : {derniereActiviteLabel}</Text>
                </View>
              </View>

              <View style={styles.statTile}>
                <Text style={styles.statValue}>{tempsLabel}</Text>
                <Text style={styles.statLabel}>aujourd'hui</Text>
              </View>
              <Text style={styles.statNote}>
                Leçons de langue et badges pas encore disponibles (pilier langues bloqué) — voir mobile-app/README.md.
              </Text>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Limite d'écran quotidienne</Text>
                <View style={styles.stepper}>
                  <Pressable onPress={() => adjustLimite(c, -15)} style={styles.stepperBtn}>
                    <Text style={styles.stepperBtnLabel}>−</Text>
                  </Pressable>
                  <Text style={styles.stepperValue}>
                    {c.limite_ecran_minutes ? formatMinutes(c.limite_ecran_minutes) : 'Aucune'}
                  </Text>
                  <Pressable onPress={() => adjustLimite(c, 15)} style={styles.stepperBtn}>
                    <Text style={styles.stepperBtnLabel}>+</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.settingHint}>Informatif pour l'instant : l'app ne se verrouille pas automatiquement à la limite.</Text>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Découverte activée</Text>
                <Pressable onPress={() => toggleDecouverte(c)} style={[styles.toggle, c.decouverte_activee && styles.toggleOn]}>
                  <View style={[styles.toggleKnob, c.decouverte_activee && styles.toggleKnobOn]} />
                </Pressable>
              </View>
            </View>
          );
        })}

        <Pressable style={styles.addBtn} onPress={() => router.push('/profils/ajouter')}>
          <Text style={styles.addBtnLabel}>+ Ajouter un profil enfant</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  back: {
    fontSize: 20,
    color: colors.accentGold,
  },
  title: {
    fontFamily: typography.displaySemiBold,
    fontSize: 19,
    color: colors.textHeading,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
    marginBottom: 18,
    marginLeft: 32,
  },
  emptyCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: radii.card,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMutedAlt,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: radii.card,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: typography.display,
    fontSize: 20,
    color: '#fff',
  },
  cardHeaderBody: {
    flex: 1,
  },
  childName: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  childAge: {
    fontFamily: typography.body,
    fontWeight: '400',
    color: colors.textMuted,
    fontSize: 12,
  },
  lastActivity: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statTile: {
    backgroundColor: colors.surfaceCardDeep,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontFamily: typography.monoBold,
    fontSize: 17,
    color: colors.accentGold,
  },
  statLabel: {
    fontFamily: typography.mono,
    fontSize: 9.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  statNote: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: colors.textMuted,
    lineHeight: 14,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: colors.borderHairline,
  },
  settingLabel: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textBodyAlt,
  },
  settingHint: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.accentGold,
  },
  stepperValue: {
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.accentGold,
    minWidth: 58,
    textAlign: 'center',
  },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.placeholderStripeDark,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: colors.accentGoldSoft,
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  addBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(240,195,107,0.05)',
  },
  addBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13.5,
    color: colors.accentGold,
  },
});
