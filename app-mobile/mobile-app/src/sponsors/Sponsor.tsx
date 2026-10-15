import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { supabase } from '../data/supabaseClient';
import { colors } from '../theme/tokens';
import { useI18n } from '../i18n';

/**
 * Sponsors (backoffice/cdc-module-sponsors.md, étape 2) : bannière d'accueil,
 * « Présenté par », fin de vidéo, page Partenaires. Lecture via
 * `sponsors_publics()` (jamais le contrat), mesure anonyme via
 * `sponsor_mesure()`. JAMAIS utilisé dans l'espace enfant (décision de Yannick).
 */

type Format = 'banniere_accueil' | 'presente_par' | 'fin_video' | 'page_partenaires';
type TypeContenu = 'heros' | 'mythe' | 'decouverte';

export interface EmplacementSponsor {
  emplacement_id: string;
  format: Format;
  cible_type: TypeContenu | null;
  cible_slug: string | null;
  /** « Présenté par » : null = fiche ; sinon lecture / écoute / vidéo uniquement (schema-sponsors-ciblage.sql). */
  cible_format?: 'lecture' | 'ecoute' | 'video' | null;
  /** Chapitre visé ; null = tous. */
  cible_chapitre?: number | null;
  accroche_fr: string | null;
  accroche_en: string | null;
  sponsor: { id: string; nom: string; logo_url: string | null; site_url: string | null; description_fr: string | null; description_en: string | null };
}

let cache: Promise<EmplacementSponsor[]> | null = null;
let lu = 0;

function charger(): Promise<EmplacementSponsor[]> {
  if (!cache || Date.now() - lu > 5 * 60000) {
    lu = Date.now();
    cache = Promise.resolve(supabase.rpc('sponsors_publics'))
      .then(({ data, error }) => (error || !Array.isArray(data) ? [] : (data as EmplacementSponsor[])))
      .catch(() => []);
  }
  return cache;
}

function useSponsors(): EmplacementSponsor[] {
  const [liste, setListe] = useState<EmplacementSponsor[]>([]);
  useEffect(() => {
    let actif = true;
    charger().then((l) => actif && setListe(l));
    return () => {
      actif = false;
    };
  }, []);
  return liste;
}

function mesurer(emplacementId: string, type: 'affichage' | 'clic') {
  void Promise.resolve(supabase.rpc('sponsor_mesure', { p_emplacement: emplacementId, p_type: type })).catch(() => {});
}

/** Un affichage par apparition de l'encart à l'écran. */
function useAffichage(e: EmplacementSponsor | undefined) {
  const id = e?.emplacement_id;
  useEffect(() => {
    if (id) mesurer(id, 'affichage');
  }, [id]);
}

function ouvrir(e: EmplacementSponsor) {
  if (!e.sponsor.site_url) return;
  mesurer(e.emplacement_id, 'clic');
  void Linking.openURL(e.sponsor.site_url).catch(() => {});
}

function texte(e: EmplacementSponsor, lang: string, defaut: string) {
  return (lang === 'en' ? e.accroche_en || e.accroche_fr : e.accroche_fr || e.accroche_en) || defaut;
}

function Logo({ e, taille }: { e: EmplacementSponsor; taille: number }) {
  if (!e.sponsor.logo_url) return null;
  return <Image source={{ uri: e.sponsor.logo_url }} style={[styles.logo, { width: taille, height: taille }]} resizeMode="contain" accessibilityLabel={e.sponsor.nom} />;
}

function Etiquette() {
  const { lang } = useI18n();
  return <Text style={styles.etiquette}>{lang === 'en' ? 'SPONSORED' : 'SPONSORISÉ'}</Text>;
}

/** Bannière d'accueil : une bannière active au hasard. */
export function BanniereSponsor({ style }: { style?: StyleProp<ViewStyle> }) {
  const { lang } = useI18n();
  const liste = useSponsors();
  const [tirage] = useState(() => Math.random());
  const bannieres = liste.filter((x) => x.format === 'banniere_accueil');
  const e = bannieres.length ? bannieres[Math.floor(tirage * bannieres.length)] : undefined;
  useAffichage(e);
  if (!e) return null;
  return (
    <Pressable onPress={() => ouvrir(e)} style={[styles.banniere, style]} accessibilityRole="link" disabled={!e.sponsor.site_url}>
      <Logo e={e} taille={48} />
      <View style={{ flex: 1 }}>
        <Etiquette />
        <Text style={styles.titre} numberOfLines={2}>
          {texte(e, lang, e.sponsor.nom)}
        </Text>
        <Text style={styles.nom}>{e.sponsor.nom}</Text>
      </View>
      {!!e.sponsor.site_url && <Text style={styles.fleche}>›</Text>}
    </Pressable>
  );
}

/**
 * « Présenté par » : sur la fiche (`format` absent), ou dans la lecture,
 * l'écoute ou la vidéo d'un contenu, éventuellement pour un seul chapitre.
 * Le ciblage le plus précis (chapitre) l'emporte.
 */
export function PresenteParSponsor({
  type,
  slug,
  format,
  chapitre,
  style,
}: {
  type: TypeContenu;
  slug: string;
  format?: 'lecture' | 'ecoute' | 'video';
  chapitre?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { lang } = useI18n();
  const liste = useSponsors();
  const candidats = liste.filter(
    (x) =>
      x.format === 'presente_par' &&
      x.cible_type === type &&
      x.cible_slug === slug &&
      (format ? x.cible_format === format && (!x.cible_chapitre || x.cible_chapitre === chapitre) : !x.cible_format)
  );
  const e = candidats.find((x) => x.cible_chapitre) ?? candidats[0];
  useAffichage(e);
  if (!e) return null;
  return (
    <Pressable onPress={() => ouvrir(e)} style={[styles.presente, style]} accessibilityRole="link" disabled={!e.sponsor.site_url}>
      <Logo e={e} taille={38} />
      <View style={{ flex: 1 }}>
        <Text style={styles.petit}>{texte(e, lang, lang === 'en' ? 'This story is brought to you by' : 'Cette histoire vous est offerte par')}</Text>
        <Text style={styles.nom}>{e.sponsor.nom}</Text>
      </View>
      <Etiquette />
    </Pressable>
  );
}

/** Carte « Avec le soutien de », sous le lecteur vidéo (sponsor du contenu, sinon de toutes les vidéos). */
export function FinVideoSponsor({ type, slug, chapitre, style }: { type: TypeContenu; slug: string; chapitre?: number; style?: StyleProp<ViewStyle> }) {
  const { lang } = useI18n();
  const liste = useSponsors();
  const fins = liste.filter((x) => x.format === 'fin_video');
  const duContenu = fins.filter((x) => x.cible_type === type && x.cible_slug === slug && (!x.cible_chapitre || x.cible_chapitre === chapitre));
  const e = duContenu.find((x) => x.cible_chapitre) ?? duContenu[0] ?? fins.find((x) => !x.cible_slug);
  useAffichage(e);
  if (!e) return null;
  return (
    <Pressable onPress={() => ouvrir(e)} style={[styles.fin, style]} accessibilityRole="link" disabled={!e.sponsor.site_url}>
      <Logo e={e} taille={42} />
      <View style={{ flex: 1 }}>
        <Text style={styles.finAccroche}>{texte(e, lang, lang === 'en' ? 'With the support of' : 'Avec le soutien de').toUpperCase()}</Text>
        <Text style={styles.nom}>{e.sponsor.nom}</Text>
      </View>
      <Etiquette />
    </Pressable>
  );
}

/** Liste de la page Partenaires. */
export function ListePartenaires() {
  const { lang } = useI18n();
  const liste = useSponsors();
  const partenaires = useMemo(() => {
    const vus = new Set<string>();
    return liste.filter((x) => x.format === 'page_partenaires' && !vus.has(x.sponsor.id) && vus.add(x.sponsor.id));
  }, [liste]);
  if (!partenaires.length) {
    return <Text style={styles.vide}>{lang === 'en' ? 'Our partners will be presented here soon.' : 'Nos partenaires seront bientôt présentés ici.'}</Text>;
  }
  return (
    <View style={{ gap: 14 }}>
      {partenaires.map((e) => (
        <Partenaire key={e.emplacement_id} e={e} />
      ))}
    </View>
  );
}

function Partenaire({ e }: { e: EmplacementSponsor }) {
  const { lang } = useI18n();
  useAffichage(e);
  const description = lang === 'en' ? e.sponsor.description_en || e.sponsor.description_fr : e.sponsor.description_fr || e.sponsor.description_en;
  return (
    <View style={styles.partenaire}>
      <Logo e={e} taille={64} />
      <View style={{ flex: 1 }}>
        <Text style={styles.titre}>{e.sponsor.nom}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}
        {!!e.sponsor.site_url && (
          <Pressable onPress={() => ouvrir(e)} accessibilityRole="link">
            <Text style={styles.lien}>{lang === 'en' ? 'Visit the website ›' : 'Visiter le site ›'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { borderRadius: 10, backgroundColor: '#fff' },
  etiquette: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: colors.textMuted },
  titre: { fontSize: 15, fontWeight: '800', color: colors.textHeading, marginTop: 2 },
  nom: { fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  petit: { fontSize: 12.5, color: colors.textBody },
  fleche: { fontSize: 26, color: colors.accentGold, paddingHorizontal: 4 },
  banniere: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(240,195,107,0.07)',
  },
  presente: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,240,210,0.03)' },
  fin: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(240,195,107,0.10)' },
  finAccroche: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, color: colors.accentGold },
  partenaire: { flexDirection: 'row', gap: 14, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,240,210,0.03)' },
  description: { fontSize: 13.5, lineHeight: 20, color: colors.textBody, marginTop: 6 },
  lien: { fontSize: 13.5, fontWeight: '800', color: colors.accentGold, marginTop: 10 },
  vide: { fontSize: 14, color: colors.textBody },
});
