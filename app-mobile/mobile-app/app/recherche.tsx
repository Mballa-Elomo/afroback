import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccessBadge } from '../src/access/Access';
import { useHeroesList } from '../src/data/useHeroesData';
import { useMythesGroupedByZone } from '../src/data/useMythologieData';
import { useDecouverteItems } from '../src/data/useDecouverteData';
import { DECOUVERTE_TYPE_LABEL } from '../src/data/decouverteDisplay';
import type { ContentType } from '../src/data/contentAccess';
import { colors, typography } from '../src/theme/tokens';
import { Icon } from '../src/components/Icons';
import i18n, { useI18n } from '../src/i18n';

/**
 * Recherche globale (2026-09-30, retour de Yannick : "la recherche ne
 * fonctionne pas" — la barre de l'accueil n'ouvrait que la liste des héros).
 * Cherche dans les héros, les mythes et la Découverte déjà chargés par l'app
 * (aucun appel serveur supplémentaire), sans tenir compte des accents ni des
 * majuscules. Les contenus réservés gardent leur cadenas.
 */
interface Result {
  key: string;
  type: ContentType;
  slug: string;
  title: string;
  subtitle: string;
  image?: string | null;
  href: string;
}

const SECTIONS: { type: ContentType; label: string }[] = [
  { type: 'heros', label: 'search.heroes' },
  { type: 'mythe', label: 'search.myths' },
  { type: 'decouverte', label: 'search.discovery' },
];

function normalize(s: string | null | undefined): string {
  return (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export default function RechercheScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const heroesState = useHeroesList();
  const mythesState = useMythesGroupedByZone();
  const decouverteState = useDecouverteItems();

  const index = useMemo<(Result & { haystack: string })[]>(() => {
    const out: (Result & { haystack: string })[] = [];
    if (heroesState.status === 'ready') {
      for (const h of heroesState.data) {
        out.push({
          key: `h-${h.slug}`,
          type: 'heros',
          slug: h.slug,
          title: h.nom_complet,
          subtitle: [h.epoque, h.region].filter(Boolean).join(' · '),
          image: h.image_carte_catalogue,
          href: `/accueil/heros/${h.slug}`,
          haystack: normalize([h.nom_complet, h.sous_titre, h.epoque, h.region, (h.theme ?? []).join(' '), h.resume_catalogue].join(' ')),
        });
      }
    }
    if (mythesState.status === 'ready') {
      for (const g of mythesState.data) {
        for (const m of g.items) {
          out.push({
            key: `m-${m.slug}`,
            type: 'mythe',
            slug: m.slug,
            title: m.titre,
            subtitle: [m.peuple, m.region].filter(Boolean).join(' · '),
            image: m.image_url,
            href: `/accueil/mythologie/${m.slug}`,
            haystack: normalize([m.titre, m.sous_titre, m.peuple, m.region, m.zone, m.theme, m.epoque].join(' ')),
          });
        }
      }
    }
    if (decouverteState.status === 'ready') {
      for (const it of decouverteState.data) {
        out.push({
          key: `d-${it.slug}`,
          type: 'decouverte',
          slug: it.slug,
          title: it.titre,
          subtitle: [i18n.t(`decouverteType.${it.type}`), it.region_ethnie].filter(Boolean).join(' · '),
          image: it.image_url,
          href: `/decouverte/${it.slug}`,
          haystack: normalize([it.titre, it.sous_titre, it.resume_liste, it.region_ethnie, it.pays, DECOUVERTE_TYPE_LABEL[it.type], i18n.t(`decouverteType.${it.type}`)].join(' ')),
        });
      }
    }
    return out;
  }, [heroesState, mythesState, decouverteState]);

  const q = normalize(query.trim());
  const words = q.split(/\s+/).filter(Boolean);
  const results = useMemo(
    () => (words.length === 0 ? [] : index.filter((r) => words.every((w) => r.haystack.includes(w)))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, q]
  );
  const loading = heroesState.status === 'loading' || mythesState.status === 'loading' || decouverteState.status === 'loading';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('search.back')}>
          <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
        </Pressable>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder')}
            placeholderTextColor={colors.textMuted}
            // Web : retire le contour bleu du navigateur autour du champ.
            style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel={t('search.search')}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('search.clear')}>
              <Text style={styles.clear}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {words.length === 0 ? (
          <View style={styles.hint}>
            <Text style={styles.hintTitle}>{t('search.what')}</Text>
            <Text style={styles.hintText}>
              {t('search.examples')}
            </Text>
            {loading && <Text style={styles.hintText}>{t('search.loadingCatalogue')}</Text>}
          </View>
        ) : results.length === 0 ? (
          <Text style={styles.empty}>{loading ? t('search.searching') : t('search.none', { q: query.trim() })}</Text>
        ) : (
          <>
            <Text style={styles.count}>
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </Text>
            {SECTIONS.map(({ type, label }) => {
              const items = results.filter((r) => r.type === type);
              if (items.length === 0) return null;
              return (
                <View key={type} style={styles.section}>
                  <Text style={styles.sectionTitle}>{t(label).toUpperCase()}</Text>
                  <View style={styles.card}>
                    {items.map((r, i) => (
                      <Pressable
                        key={r.key}
                        onPress={() => router.push(r.href as never)}
                        style={({ pressed }) => [styles.row, i < items.length - 1 && styles.rowBorder, pressed && styles.pressed]}
                        accessibilityRole="button"
                      >
                        <Thumb uri={r.image} letter={r.title[0]} />
                        <View style={styles.rowBody}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {r.title}
                          </Text>
                          {!!r.subtitle && (
                            <Text style={styles.rowSub} numberOfLines={1}>
                              {r.subtitle}
                            </Text>
                          )}
                        </View>
                        <AccessBadge type={r.type} slug={r.slug} inline />
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Vignette : l'image si elle se charge, sinon l'initiale (images pas encore mises en ligne). */
function Thumb({ uri, letter }: { uri?: string | null; letter: string }) {
  const [failed, setFailed] = useState(false);
  if (uri && !failed) return <Image source={{ uri }} style={styles.thumb} onError={() => setFailed(true)} />;
  return (
    <View style={[styles.thumb, styles.thumbEmpty]}>
      <Text style={styles.thumbLetter}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  back: { fontSize: 30, color: colors.accentGold, paddingHorizontal: 4 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.45)',
    backgroundColor: colors.placeholderStripeDark,
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 13, opacity: 0.7 },
  input: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 13,
  },
  clear: { fontSize: 14, color: colors.textMuted },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  hint: { marginTop: 40, alignItems: 'center', paddingHorizontal: 20, gap: 8 },
  hintTitle: { fontFamily: typography.display, fontSize: 20, color: colors.textHeading },
  hintText: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.textMuted, textAlign: 'center' },
  empty: { fontFamily: typography.body, fontSize: 14.5, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  count: { fontFamily: typography.mono, fontSize: 11, letterSpacing: 1, color: colors.textMuted, marginTop: 6, marginLeft: 4 },
  section: { marginTop: 16 },
  sectionTitle: { fontFamily: typography.mono, fontSize: 10.5, letterSpacing: 1.2, color: colors.accentGoldSoft, marginBottom: 8, marginLeft: 4 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    backgroundColor: 'rgba(26,19,13,.95)',
    paddingHorizontal: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(237,227,212,.07)' },
  pressed: { opacity: 0.7 },
  thumb: { width: 48, height: 48, borderRadius: 12 },
  thumbEmpty: { backgroundColor: 'rgba(240,195,107,.12)', alignItems: 'center', justifyContent: 'center' },
  thumbLetter: { fontFamily: typography.display, fontSize: 20, color: colors.accentGold },
  rowBody: { flex: 1 },
  rowTitle: { fontFamily: typography.bodySemiBold, fontSize: 14.5, color: colors.textPrimary },
  rowSub: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
});
