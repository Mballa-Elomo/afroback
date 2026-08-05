import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DecouverteItemRow } from '../../../src/components/DecouverteItemRow';
import { FaitsList } from '../../../src/components/FaitsList';
import { SourcesList } from '../../../src/components/SourcesList';
import { SectionTitle } from '../../../src/components/SectionTitle';
import { RelatedHeroes } from '../../../src/components/RelatedHeroes';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { useDecouverteItem, useRelatedDecouverteItems } from '../../../src/data/useDecouverteData';
import { getHeroBySlug } from '../../../src/data/heroesRepository';
import type { Heros } from '../../../src/data/types';
import { DECOUVERTE_TYPE_LABEL } from '../../../src/data/decouverteDisplay';
import { colors, spacing, typography } from '../../../src/theme/tokens';

/**
 * Fiche détail Découverte — fidèle à design-reference-decouverte.dc.excerpt.html,
 * avec une simplification assumée : les 4 types (village/coutume/objet/
 * personnage) partagent un seul composant à 2 variantes d'en-tête plutôt que
 * 4 gabarits distincts (VILLAGE DETAIL / COUTUME DETAIL / PERSON DETAIL /
 * FACT DETAIL de la maquette), car le contenu réel (data-model-decouverte.md)
 * a la même forme pour les 4 types — la maquette prévoyait des variantes
 * (galerie photo, carrousel de rois...) pour un contenu plus riche qu'on n'a
 * pas produit. Voir mobile-app/README.md.
 */
export default function DecouverteDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const itemState = useDecouverteItem(slug);
  const item = itemState.status === 'ready' ? itemState.data : undefined;
  const relatedItems = useRelatedDecouverteItems(item);
  const [relatedHeroes, setRelatedHeroes] = useState<Heros[]>([]);

  useEffect(() => {
    if (!item || item.heros_lies.length === 0) {
      setRelatedHeroes([]);
      return;
    }
    let alive = true;
    Promise.all(item.heros_lies.map((s) => getHeroBySlug(s))).then((heroes) => {
      if (alive) setRelatedHeroes(heroes.filter((h): h is Heros => Boolean(h)));
    });
    return () => {
      alive = false;
    };
  }, [item]);

  if (itemState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }
  if (itemState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }
  if (!item) return <Redirect href="/decouverte" />;

  // En-tête immersif (grande photo) dès qu'une vraie photo existe pour cet
  // item, quel que soit son type (personnage/coutume/fait inclus) — plutôt
  // qu'une liste de types en dur, qui laissait silencieusement de côté une
  // vraie photo produite pour un item "personnage" ou "coutume" (retour de
  // test Yannick, 2026-08-05). En-tête sobre (texte) uniquement en
  // fallback honnête pour un item sans aucune photo à ce jour.
  const immersive = Boolean(item.image_url);
  const paragraphs = item.contenu_fr_texte.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {immersive ? (
          <View style={styles.immersiveHeader}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={[colors.placeholderStripeLight, colors.placeholderStripeDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            )}
            <LinearGradient
              colors={['rgba(15,11,8,0.15)', 'rgba(15,11,8,0.1)', colors.background]}
              locations={[0, 0.4, 1]}
              style={StyleSheet.absoluteFill}
            />
            <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 8 }]} hitSlop={10}>
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
            <View style={styles.immersiveBottom}>
              <View style={styles.typePill}>
                <Text style={styles.typePillLabel}>{DECOUVERTE_TYPE_LABEL[item.type].toUpperCase()}</Text>
              </View>
              <Text style={styles.immersiveTitle}>{item.titre}</Text>
              <Text style={styles.immersiveMeta}>📍 {item.region_ethnie}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.flatHeader}>
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.flatBack}>
              <Text style={styles.flatBackIcon}>‹</Text>
            </Pressable>
            <Text style={styles.flatMeta}>
              {DECOUVERTE_TYPE_LABEL[item.type].toUpperCase()} · {item.region_ethnie}
            </Text>
            <Text style={styles.flatTitle}>{item.titre}</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.subtitle}>{item.sous_titre}</Text>

          <SectionTitle title="En détail" />
          {paragraphs.map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {p}
            </Text>
          ))}

          <FaitsList faits={item.statut_fait_legende} />
          <SourcesList sources={item.sources} />
          <RelatedHeroes heroes={relatedHeroes} title="Héros liés" />

          {relatedItems.length > 0 && (
            <View style={styles.relatedItems}>
              <SectionTitle title="À découvrir aussi" />
              <View style={styles.relatedList}>
                {relatedItems.map((it) => (
                  <DecouverteItemRow key={it.slug} item={it} onPress={() => router.push(`/decouverte/${it.slug}`)} />
                ))}
              </View>
            </View>
          )}
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
  content: {
    paddingBottom: spacing.xl,
  },
  immersiveHeader: {
    height: 280,
    overflow: 'hidden',
    backgroundColor: colors.placeholderStripeDark,
  },
  backBtn: {
    // `top` par défaut, écrasé à l'usage par `insets.top + 8` (retour de test
    // Yannick du 2026-07-31, cohérence globale avec les autres fiches).
    position: 'absolute',
    top: 12,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: colors.accentGold,
    marginTop: -2,
  },
  immersiveBottom: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    right: 18,
  },
  typePill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(233,161,92,0.4)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  typePillLabel: {
    fontFamily: typography.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.terracottaTextAlt,
  },
  immersiveTitle: {
    fontFamily: typography.display,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textHeading,
    lineHeight: 28,
  },
  immersiveMeta: {
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.textBodyAlt,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  flatHeader: {
    paddingHorizontal: spacing.md + 2,
    paddingTop: 6,
  },
  flatBack: {
    marginBottom: 10,
  },
  flatBackIcon: {
    fontSize: 22,
    color: colors.accentGold,
  },
  flatMeta: {
    fontFamily: typography.mono,
    fontSize: 8.5,
    letterSpacing: 0.7,
    color: colors.terracottaTextAlt,
  },
  flatTitle: {
    fontFamily: typography.display,
    fontSize: 23,
    fontWeight: '700',
    color: colors.textHeading,
    lineHeight: 27,
    marginTop: 6,
  },
  body: {
    padding: spacing.md + 2,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textBody,
    marginBottom: spacing.lg,
  },
  paragraph: {
    fontFamily: typography.body,
    fontSize: 14.5,
    lineHeight: 24,
    color: colors.textBody,
    marginBottom: 14,
  },
  relatedItems: {
    marginBottom: spacing.lg,
  },
  relatedList: {
    gap: 12,
  },
});
