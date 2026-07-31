import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';

/**
 * Charte communautaire — contenu statique (voir data-model-communaute.md
 * §5 : brouillon rédigé par le chef de projet, pas encore un texte
 * définitif validé par Yannick). Versionné dans le code plutôt qu'en base,
 * conformément à la décision documentée dans le data model.
 */
const RULES = [
  {
    icon: '🤝',
    title: 'Respecte les personnes et les cultures',
    text: "Les désaccords existent, les insultes n'ont pas leur place. On ne se moque pas d'une tradition, d'une langue ou d'une origine.",
  },
  {
    icon: '🔎',
    title: 'Partage avec honnêteté',
    text: "Ne présente pas une rumeur ou une opinion comme un fait établi. Si tu n'es pas sûr, dis-le.",
  },
  {
    icon: '🚫',
    title: 'Pas de haine, pas de harcèlement',
    text: 'Contenu raciste, sexiste, homophobe ou tout appel à la violence : suppression immédiate et bannissement possible.',
  },
  {
    icon: '📢',
    title: 'Pas de spam',
    text: "Pas de publicité non sollicitée. Ce n'est pas une vitrine commerciale.",
  },
  {
    icon: '🔒',
    title: 'Protège la vie privée',
    text: 'Ne partage pas d’informations personnelles (numéro, adresse) sans consentement — la tienne ou celle des autres.',
  },
  {
    icon: '⚑',
    title: 'Signale plutôt que de réagir seul',
    text: "Un contenu qui te semble poser problème ? Utilise le bouton de signalement, l'équipe AFROBACK le traite.",
  },
];

export default function CharterScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Charte communautaire</Text>
        </View>

        <Text style={styles.intro}>
          AFROBACK est un espace pour célébrer, apprendre et transmettre la richesse des cultures africaines. Ici,
          chaque histoire partagée, chaque question posée, chaque souvenir raconté nourrit une mémoire collective.
          Pour que cet espace reste digne de ce qu'il célèbre, quelques règles simples :
        </Text>

        <View style={styles.rules}>
          {RULES.map((r) => (
            <View key={r.title} style={styles.rule}>
              <Text style={styles.ruleIcon}>{r.icon}</Text>
              <View style={styles.ruleBody}>
                <Text style={styles.ruleTitle}>{r.title}</Text>
                <Text style={styles.ruleText}>{r.text}</Text>
              </View>
            </View>
          ))}
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
  intro: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textBody,
    marginBottom: 20,
  },
  rules: {
    gap: 12,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: radii.button,
    padding: 14,
  },
  ruleIcon: {
    fontSize: 18,
  },
  ruleBody: {
    flex: 1,
  },
  ruleTitle: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.textHeading,
    marginBottom: 3,
  },
  ruleText: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
