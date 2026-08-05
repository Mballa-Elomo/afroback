import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActiveProfile } from '../../../src/profils/ActiveProfileProvider';
import { useHeroesList } from '../../../src/data/useHeroesData';
import {
  getLeconResultats,
  getLeconsByNiveau,
  getNiveauByNumero,
  getOrCreateProgression,
  getQuizNiveauResultat,
} from '../../../src/data/ecoleRepository';
import type { EcoleLecon, EcoleNiveau, EnfantLeconResultat } from '../../../src/data/ecoleTypes';
import type { Heros } from '../../../src/data/types';
import { LoadingState } from '../../../src/components/LoadingState';
import { colors, typography } from '../../../src/theme/tokens';

type LeconRow = {
  lecon: EcoleLecon;
  heros: Heros | undefined;
  etat: 'verrouille' | 'disponible' | 'termine';
};

/**
 * Carte du niveau — fidèle dans l'esprit à
 * design-reference-ecole-heros.dc.excerpt.html (ÉCOLE DES HÉROS — LEVEL MAP),
 * avec de vrais héros du catalogue (jamais un héros inventé) et un état
 * honnête : tant qu'aucun contenu réel n'est produit pour une leçon (voir
 * schema-ecole-heros.sql, structure insérée le 2026-08-05 sans aucun texte/
 * audio/vidéo/BD), le déblocage reste bloqué à la première leçon puisque
 * aucun quiz ne peut être réussi — comportement attendu, pas un bug.
 */
export default function EcoleLevelMapScreen() {
  const router = useRouter();
  const { state } = useActiveProfile();
  const heroesState = useHeroesList();
  const [loading, setLoading] = useState(true);
  const [niveauActuel, setNiveauActuel] = useState(1);
  const [niveauInfo, setNiveauInfo] = useState<EcoleNiveau | undefined>();
  const [lecons, setLecons] = useState<EcoleLecon[]>([]);
  const [resultats, setResultats] = useState<Map<string, EnfantLeconResultat>>(new Map());
  const [finalReussi, setFinalReussi] = useState(false);

  const childId = state.status === 'child' ? state.profil.id : undefined;

  const load = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    try {
      const progression = await getOrCreateProgression(childId);
      const niveau = await getNiveauByNumero(progression.niveau_actuel);
      const leconsNiveau = await getLeconsByNiveau(progression.niveau_actuel);
      const map = await getLeconResultats(childId, leconsNiveau.map((l) => l.id));
      const quizNiveau = await getQuizNiveauResultat(childId, progression.niveau_actuel);
      setNiveauActuel(progression.niveau_actuel);
      setNiveauInfo(niveau);
      setLecons(leconsNiveau);
      setResultats(map);
      setFinalReussi(quizNiveau?.reussi ?? false);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const heroes = heroesState.status === 'ready' ? heroesState.data : [];
  const heroById = useMemo(() => new Map(heroes.map((h) => [h.id, h])), [heroes]);

  const rows: LeconRow[] = useMemo(() => {
    let previousDone = true;
    return lecons.map((lecon) => {
      const resultat = resultats.get(lecon.id);
      const termine = resultat?.statut === 'termine';
      const unlocked = previousDone;
      previousDone = termine;
      return {
        lecon,
        heros: heroById.get(lecon.heros_id),
        etat: termine ? 'termine' : unlocked ? 'disponible' : 'verrouille',
      };
    });
  }, [lecons, resultats, heroById]);

  const nbTermine = rows.filter((r) => r.etat === 'termine').length;
  const pct = rows.length > 0 ? Math.round((nbTermine / rows.length) * 100) : 0;
  const finalUnlocked = rows.length > 0 && nbTermine === rows.length;

  if (state.status !== 'child') return <Redirect href="/profils/selection" />;

  if (loading || heroesState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="Ta carte se prépare..." />
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
          <View style={styles.headerBody}>
            <Text style={styles.tag}>ÉCOLE DES HÉROS</Text>
            <Text style={styles.levelName}>{niveauInfo?.nom ?? `Niveau ${niveauActuel}`}</Text>
          </View>
          <Pressable onPress={() => router.push('/enfant/ecole/collection')} style={styles.collectionBtn}>
            <Text style={styles.collectionIcon}>🏅</Text>
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {nbTermine} sur {rows.length || '—'} héros débloqués
        </Text>

        <View style={styles.path}>
          {rows.length === 0 && (
            <Text style={styles.empty}>Ce niveau n'a pas encore de héros configuré.</Text>
          )}
          {rows.map((row) => (
            <Pressable
              key={row.lecon.id}
              disabled={row.etat === 'verrouille'}
              onPress={() => router.push(`/enfant/ecole/lecon/${row.lecon.id}`)}
              style={styles.row}
            >
              <View
                style={[
                  styles.medal,
                  row.etat === 'termine' && styles.medalTermine,
                  row.etat === 'disponible' && styles.medalDisponible,
                  row.etat === 'verrouille' && styles.medalVerrouille,
                ]}
              >
                <Text style={styles.medalIcon}>
                  {row.etat === 'verrouille' ? '🔒' : row.etat === 'termine' ? '⭐' : '👤'}
                </Text>
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowName, row.etat === 'verrouille' && styles.rowNameMuted]}>
                  {row.heros?.nom_affiche ?? 'Héros à venir'}
                </Text>
                <Text style={styles.rowSub}>{row.heros?.epoque ?? '—'}</Text>
              </View>
            </Pressable>
          ))}

          <Pressable
            disabled={!finalUnlocked}
            onPress={() => router.push({ pathname: '/enfant/ecole/quiz/[leconId]', params: { leconId: 'final', niveau: String(niveauActuel) } })}
            style={[styles.row, styles.finalRow]}
          >
            <View style={[styles.finalMedal, finalUnlocked ? styles.medalDisponible : styles.medalVerrouille]}>
              <Text style={styles.medalIconLarge}>{finalReussi ? '🏆' : finalUnlocked ? '🚪' : '🔒'}</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowName, !finalUnlocked && styles.rowNameMuted]}>Grand Quiz du niveau</Text>
              <Text style={styles.rowSub}>
                {finalUnlocked ? 'Débloque le niveau suivant' : 'Termine tous les héros du niveau'}
              </Text>
            </View>
          </Pressable>
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
    padding: 18,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  backIcon: {
    fontSize: 22,
    color: colors.accentGold,
  },
  headerBody: {
    flex: 1,
  },
  tag: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.terracottaTextAlt,
  },
  levelName: {
    fontFamily: typography.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textHeading,
  },
  collectionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.terracottaBg,
    borderWidth: 1,
    borderColor: colors.terracottaBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionIcon: {
    fontSize: 20,
  },
  progressTrack: {
    height: 8,
    borderRadius: 9,
    backgroundColor: colors.placeholderStripeLight,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.terracotta,
  },
  progressLabel: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.terracottaTextAlt,
    marginBottom: 22,
  },
  path: {
    gap: 4,
  },
  empty: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    paddingVertical: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  finalRow: {
    marginTop: 8,
  },
  medal: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalMedal: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalTermine: {
    backgroundColor: 'rgba(240,195,107,0.16)',
    borderWidth: 2,
    borderColor: colors.accentGold,
  },
  medalDisponible: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 2,
    borderColor: colors.accentGoldSoft,
  },
  medalVerrouille: {
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 2,
    borderColor: colors.borderHairline,
  },
  medalIcon: {
    fontSize: 26,
  },
  medalIconLarge: {
    fontSize: 28,
  },
  rowBody: {
    flex: 1,
  },
  rowName: {
    fontFamily: typography.display,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textHeading,
  },
  rowNameMuted: {
    color: colors.textMuted,
  },
  rowSub: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.textMutedAlt,
    marginTop: 2,
  },
});
