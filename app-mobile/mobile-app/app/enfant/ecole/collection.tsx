import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActiveProfile } from '../../../src/profils/ActiveProfileProvider';
import { useHeroesList } from '../../../src/data/useHeroesData';
import { getAllLecons, getLeconResultats } from '../../../src/data/ecoleRepository';
import type { EcoleLecon, EnfantLeconResultat } from '../../../src/data/ecoleTypes';
import { LoadingState } from '../../../src/components/LoadingState';
import { colors, typography } from '../../../src/theme/tokens';

/**
 * Collection — fidèle dans l'esprit à
 * design-reference-ecole-heros.dc.excerpt.html (ÉCOLE — COLLECTION). Un
 * héros peut apparaître à plusieurs niveaux (ex. Sultan Njoya niveau 1 et 2,
 * voir le mapping structurel de schema-ecole-heros.sql) : regroupé en une
 * seule carte, marquée "débloqué" dès qu'au moins une de ses leçons est
 * terminée.
 */
export default function EcoleCollectionScreen() {
  const router = useRouter();
  const { state } = useActiveProfile();
  const heroesState = useHeroesList();
  const [loading, setLoading] = useState(true);
  const [lecons, setLecons] = useState<EcoleLecon[]>([]);
  const [resultats, setResultats] = useState<Map<string, EnfantLeconResultat>>(new Map());

  const childId = state.status === 'child' ? state.profil.id : undefined;

  const load = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    try {
      const all = await getAllLecons();
      const map = await getLeconResultats(childId, all.map((l) => l.id));
      setLecons(all);
      setResultats(map);
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

  const cards = useMemo(() => {
    const byHero = new Map<string, { debloque: boolean }>();
    for (const lecon of lecons) {
      const termine = resultats.get(lecon.id)?.statut === 'termine';
      const current = byHero.get(lecon.heros_id);
      byHero.set(lecon.heros_id, { debloque: (current?.debloque ?? false) || termine });
    }
    return Array.from(byHero.entries())
      .map(([herosId, v]) => ({ heros: heroById.get(herosId), debloque: v.debloque }))
      .filter((c) => !!c.heros)
      .sort((a, b) => (a.heros!.ordre_affichage ?? 0) - (b.heros!.ordre_affichage ?? 0));
  }, [lecons, resultats, heroById]);

  if (state.status !== 'child') return <Redirect href="/profils/selection" />;

  if (loading || heroesState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="Ta collection se prépare..." />
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
          <Text style={styles.title}>Ma collection</Text>
        </View>

        {cards.length === 0 ? (
          <Text style={styles.empty}>Aucun héros configuré pour l'instant.</Text>
        ) : (
          <View style={styles.grid}>
            {cards.map(({ heros, debloque }) => (
              <View key={heros!.id} style={[styles.card, debloque ? styles.cardDone : styles.cardLocked]}>
                <View style={[styles.medal, debloque ? styles.medalDone : styles.medalLocked]}>
                  <Text style={styles.medalIcon}>{debloque ? '🏅' : '🔒'}</Text>
                </View>
                <Text style={[styles.cardName, !debloque && styles.cardNameMuted]}>{heros!.nom_affiche}</Text>
              </View>
            ))}
          </View>
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
    padding: 18,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  backIcon: {
    fontSize: 22,
    color: colors.accentGold,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textHeading,
  },
  empty: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    width: '47%',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  cardDone: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.accentGoldSoft,
  },
  cardLocked: {
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 1,
    borderColor: colors.borderHairline,
  },
  medal: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  medalDone: {
    backgroundColor: 'rgba(240,195,107,0.16)',
  },
  medalLocked: {
    backgroundColor: colors.placeholderStripeLight,
  },
  medalIcon: {
    fontSize: 28,
  },
  cardName: {
    fontFamily: typography.display,
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textHeading,
    textAlign: 'center',
  },
  cardNameMuted: {
    color: colors.textMuted,
  },
});
