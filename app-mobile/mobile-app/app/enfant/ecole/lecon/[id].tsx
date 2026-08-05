import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLeconById } from '../../../../src/data/ecoleRepository';
import { useHeroesList } from '../../../../src/data/useHeroesData';
import type { EcoleFormat, EcoleLecon } from '../../../../src/data/ecoleTypes';
import type { Heros } from '../../../../src/data/types';
import { GoldButton } from '../../../../src/components/Buttons';
import { LoadingState } from '../../../../src/components/LoadingState';
import { colors, typography } from '../../../../src/theme/tokens';

const FORMATS: { id: EcoleFormat; icon: string; label: string }[] = [
  { id: 'lire', icon: '📖', label: 'Lire' },
  { id: 'ecouter', icon: '🎧', label: 'Écouter' },
  { id: 'regarder', icon: '🎬', label: 'Regarder' },
  { id: 'bd', icon: '💬', label: 'BD' },
];

/**
 * Fiche leçon 4 formats — fidèle dans l'esprit à
 * design-reference-ecole-heros.dc.excerpt.html (ÉCOLE — LESSON). Chaque
 * format affiche un état "pas encore disponible" honnête tant que le vrai
 * contenu enfant (texte réécrit, narration dédiée, vidéo adaptée, BD
 * dessinée) n'est pas produit — jamais le récit adulte réutilisé tel quel,
 * jamais un contenu simulé. Le quiz reste accessible dès qu'un onglet a du
 * contenu (ici : uniquement si `texte_adapte` existe, seul format qui a une
 * chance d'exister avant les autres en pratique).
 */
export default function EcoleLeconScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const heroesState = useHeroesList();
  const [lecon, setLecon] = useState<EcoleLecon | undefined>();
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState<EcoleFormat>('lire');

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    getLeconById(id).then((l) => {
      if (alive) {
        setLecon(l);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const heroes = heroesState.status === 'ready' ? heroesState.data : [];
  const heros: Heros | undefined = heroes.find((h) => h.id === lecon?.heros_id);

  if (loading || heroesState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="La leçon se prépare..." />
      </SafeAreaView>
    );
  }

  if (!lecon) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Cette leçon n'existe pas ou plus.</Text>
          <GoldButton label="Retour" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const hasTexte = !!lecon.texte_adapte;
  const hasAudio = !!lecon.narration_audio_url;
  const hasVideo = !!lecon.video_url;
  const hasBd = lecon.bd_planches.length > 0;
  const canQuiz = hasTexte || hasAudio || hasVideo || hasBd;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.cover}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.coverContent}>
            <Text style={styles.heroName}>{heros?.nom_affiche ?? 'Héros'}</Text>
            <Text style={styles.heroContext}>{heros ? `${heros.epoque} · ${heros.region}` : '—'}</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {FORMATS.map((f) => {
            const active = format === f.id;
            const available =
              (f.id === 'lire' && hasTexte) ||
              (f.id === 'ecouter' && hasAudio) ||
              (f.id === 'regarder' && hasVideo) ||
              (f.id === 'bd' && hasBd);
            return (
              <Pressable key={f.id} onPress={() => setFormat(f.id)} style={[styles.tab, active && styles.tabActive]}>
                <Text style={styles.tabIcon}>{f.icon}</Text>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{f.label}</Text>
                {!available && <Text style={styles.tabLock}>🔒</Text>}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.content}>
          {format === 'lire' && (
            hasTexte ? (
              <Text style={styles.paragraph}>{lecon.texte_adapte}</Text>
            ) : (
              <SoonState icon="📖" />
            )
          )}
          {format === 'ecouter' && (
            hasAudio ? (
              <View style={styles.audioCenter}>
                <View style={styles.audioButton}>
                  <Text style={styles.audioIcon}>▶</Text>
                </View>
                <Text style={styles.audioLabel}>Narration pour les enfants</Text>
              </View>
            ) : (
              <SoonState icon="🎧" />
            )
          )}
          {format === 'regarder' && (hasVideo ? <SoonState icon="🎬" /> : <SoonState icon="🎬" />)}
          {format === 'bd' && (hasBd ? <SoonState icon="💬" /> : <SoonState icon="💬" />)}
        </View>
      </ScrollView>

      <View style={styles.ctaWrap}>
        <GoldButton
          label={canQuiz ? 'Je suis prêt pour le quiz !' : 'Contenu pas encore disponible'}
          onPress={() => router.push(`/enfant/ecole/quiz/${lecon.id}`)}
          disabled={!canQuiz}
        />
      </View>
    </SafeAreaView>
  );
}

function SoonState({ icon }: { icon: string }) {
  return (
    <View style={styles.soon}>
      <Text style={styles.soonIcon}>{icon}</Text>
      <Text style={styles.soonText}>Ce contenu n'est pas encore prêt — reviens bientôt !</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 110,
  },
  cover: {
    height: 200,
    backgroundColor: '#A0392C',
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
  },
  coverContent: {
    position: 'absolute',
    bottom: 14,
    left: 18,
    right: 18,
  },
  heroName: {
    fontFamily: typography.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  heroContext: {
    fontFamily: typography.body,
    fontSize: 12,
    color: '#FFE6C9',
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.cardBg,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  tabLock: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 8,
  },
  content: {
    padding: 18,
  },
  paragraph: {
    fontFamily: typography.body,
    fontSize: 15.5,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  audioCenter: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  audioButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#A0392C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  audioIcon: {
    fontSize: 50,
    color: '#fff',
  },
  audioLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textBodyAlt,
  },
  soon: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  soonIcon: {
    fontSize: 44,
    opacity: 0.5,
  },
  soonText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textMutedAlt,
    marginTop: 12,
    textAlign: 'center',
  },
  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 30,
  },
  notFoundText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textMutedAlt,
    textAlign: 'center',
  },
});
