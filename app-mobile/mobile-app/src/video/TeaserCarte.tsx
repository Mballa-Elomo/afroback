import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../data/supabaseClient';
import { useI18n } from '../i18n';
import { colors } from '../theme/tokens';
import { Icon } from '../components/Icons';
import { LecteurVideo } from './LecteurVideo';
import { PremiumButton } from '../components/Buttons';

/**
 * Teaser d'un contenu (2026-10-17) : vidéo d'introduction de 30 s, première
 * vidéo de la fiche, visible par tous (abonnés ou non). Colonne `teaser` =
 * { fr: { paysage, vertical }, en: { … } } (supabase/schema-teasers.sql).
 * L'app préfère la version verticale dans la langue de l'app, puis la
 * paysage, puis le français. Rien n'est affiché tant qu'aucun teaser n'existe.
 * Une carte « Bande-annonce » ouvre la vidéo en plein écran.
 */

type ContentType = 'heros' | 'mythe' | 'decouverte';
type Format = 'paysage' | 'vertical';
type Teaser = Partial<Record<'fr' | 'en', Partial<Record<Format, string>>>>;
const TABLE: Record<ContentType, string> = { heros: 'heros', mythe: 'mythes', decouverte: 'decouverte_items' };

/** Nom court pour le bouton : « Ngan Medza, le serpent… » → « Ngan Medza ». */
function nomCourt(titre: string): string {
  return titre.replace(/[«»"“”]/g, '').split(/[,:!?]/)[0].trim();
}

/** « de » français avec élision et contraction : d'Abel, des Sao, du Roi, de la Reine. */
function deFr(nom: string): string {
  if (/^les\s/i.test(nom)) return `des ${nom.slice(4)}`;
  if (/^le\s/i.test(nom)) return `du ${nom.slice(3)}`;
  if (/^la\s/i.test(nom)) return `de la ${nom.slice(3)}`;
  if (/^l['’]/i.test(nom)) return `de l’${nom.slice(2)}`;
  if (/^[aeiouyàâäéèêëîïôöùûü]/i.test(nom)) return `d’${nom}`;
  return `de ${nom}`;
}

/**
 * Libellé du bouton d'appel à l'action placé juste après le teaser.
 * Avec vidéo : « Regarder la légende de Ngan Medza » ; sinon on invite à lire.
 */
export function libelleCtaTeaser(type: ContentType, titre: string, aVideo: boolean, en: boolean): string {
  const nom = nomCourt(titre);
  if (type === 'decouverte') return en ? `Watch: ${nom}` : `Regarder : ${nom}`;
  const quoi = type === 'mythe' ? (en ? 'legend' : 'la légende') : en ? 'story' : 'l’histoire';
  if (en) return `${aVideo ? 'Watch' : 'Read'} the ${quoi} of ${nom}`;
  return `${aVideo ? 'Regarder' : 'Lire'} ${quoi} ${deFr(nom)}`;
}

function choisir(t: Teaser, lang: 'fr' | 'en'): { url: string; format: Format } | null {
  const ordre: ['fr' | 'en', Format][] = [
    [lang, 'vertical'],
    [lang, 'paysage'],
    ['fr', 'vertical'],
    ['fr', 'paysage'],
  ];
  for (const [l, f] of ordre) {
    const url = t[l]?.[f];
    if (url) return { url, format: f };
  }
  return null;
}

export function TeaserCarte({
  type,
  slug,
  imageUrl,
  style,
  cta,
}: {
  type: ContentType;
  slug: string;
  imageUrl?: string | null;
  style?: StyleProp<ViewStyle>;
  /** Bouton affiché juste après le teaser (et sous la vidéo en plein écran), qui mène au contenu. */
  cta?: { label: string; icon?: 'play' | 'book'; onPress: () => void };
}) {
  const { lang } = useI18n();
  const en = lang === 'en';
  const [teaser, setTeaser] = useState<Teaser | null>(null);
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    let vivant = true;
    supabase
      .from(TABLE[type])
      .select('teaser')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (vivant) setTeaser(((data as { teaser?: Teaser } | null)?.teaser ?? {}) as Teaser);
      });
    return () => {
      vivant = false;
    };
  }, [type, slug]);

  const choix = teaser ? choisir(teaser, en ? 'en' : 'fr') : null;
  if (!choix) return null;

  const lancerCta = () => {
    setOuvert(false);
    cta?.onPress();
  };

  return (
    <View style={style}>
      <Pressable
        onPress={() => setOuvert(true)}
        style={({ pressed }) => [styles.carte, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel={en ? 'Play the trailer' : 'Lire la bande-annonce'}
      >
        {imageUrl ? <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} cachePolicy="memory-disk" /> : null}
        <View style={styles.voile} />
        <View style={styles.bouton}>
          <Icon name="play" size={22} color={colors.ctaTextOnGold} strokeWidth={2.4} />
        </View>
        <View style={styles.texte}>
          <Text style={styles.etiquette}>{en ? 'TRAILER' : 'BANDE-ANNONCE'}</Text>
          <Text style={styles.titre}>{en ? '30 seconds to step into the story' : '30 s pour entrer dans l’histoire'}</Text>
        </View>
      </Pressable>
      {cta && (
        <View style={{ marginTop: 12 }}>
          <PremiumButton label={cta.label} icon={cta.icon ?? 'play'} onPress={lancerCta} />
        </View>
      )}

      <Modal visible={ouvert} animationType="fade" onRequestClose={() => setOuvert(false)} supportedOrientations={['portrait', 'landscape']}>
        <SafeAreaView style={styles.plein} edges={['top', 'bottom']}>
          <Pressable onPress={() => setOuvert(false)} hitSlop={12} style={styles.fermer} accessibilityRole="button" accessibilityLabel={en ? 'Close' : 'Fermer'}>
            <Text style={styles.fermerTexte}>✕</Text>
          </Pressable>
          <View style={styles.zoneVideo}>
            {ouvert && <LecteurVideo key={choix.url} uri={choix.url} style={choix.format === 'vertical' ? styles.videoVerticale : styles.videoPaysage} />}
          </View>
          {cta && (
            <View style={styles.ctaPlein}>
              <PremiumButton label={cta.label} icon={cta.icon ?? 'play'} onPress={lancerCta} shimmer={false} />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(233,190,119,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voile: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  bouton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentGoldBright,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  texte: { position: 'absolute', left: 14, bottom: 12, right: 14 },
  etiquette: { color: colors.accentGold, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  titre: { color: colors.textHeading, fontSize: 14, fontWeight: '700', marginTop: 2 },
  plein: { flex: 1, backgroundColor: '#000' },
  fermer: { position: 'absolute', top: 50, right: 18, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  fermerTexte: { color: '#fff', fontSize: 18 },
  zoneVideo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ctaPlein: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
  videoVerticale: { width: '100%', aspectRatio: 9 / 16, maxHeight: '100%' },
  videoPaysage: { width: '100%', aspectRatio: 16 / 9 },
});
