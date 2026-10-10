/**
 * Catalogue du module Paramètres (cdc-module-parametres.md).
 * Source unique pour l'interface ET pour les contrôles de l'action serveur.
 * Clés et valeurs par défaut identiques à `_parametres_defaut()` dans
 * app-mobile/mobile-app/supabase/schema-parametres-v2.sql : les garder alignées.
 */

export type Section = 'general' | 'modules' | 'paiements' | 'securite';
export type Valeur = boolean | number | string;
export type Valeurs = Record<string, Valeur>;
export type Parametres = Record<Section, Valeurs>;

/** Où le réglage est appliqué : par le serveur (incontournable) ou par l'interface du site/de l'app. */
export type Portee = 'serveur' | 'interface';

interface ChampBase {
  cle: string;
  label: string;
  aide: string;
  portee: Portee;
  /** Message de confirmation affiché avant d'enregistrer ce changement (changement sensible). */
  confirmer?: (avant: Valeur, apres: Valeur) => string | null;
  /** Le champ n'a de sens que si cet interrupteur de la même section est activé. */
  dependDe?: string;
}
export type Champ =
  | (ChampBase & { type: 'switch' })
  | (ChampBase & { type: 'int'; min: number; max: number; unite: string })
  | (ChampBase & { type: 'texte'; max: number; placeholder?: string });

export interface Groupe {
  titre: string;
  description?: string;
  champs: Champ[];
}

export interface SectionDef {
  id: Section;
  titre: string;
  icone: string;
  resume: string;
  groupes: Groupe[];
}

export const DEFAUTS: Parametres = {
  general: { maintenance: false, message_maintenance: '', inscriptions_ouvertes: true, mode_invite: true },
  modules: { communaute: true, marche: true, espace_enfant: true, quiz: true, commentaires: true },
  paiements: {
    actifs: true,
    mtn: true,
    orange: true,
    abonnements_site: true,
    abonnements_app: true,
    dons: true,
    prix_racines: 1500,
    prix_heritage: 3000,
    reduction_annuelle_pct: 17,
  },
  securite: {
    mfa_disponible: true,
    proposer_2fa: true,
    mfa_obligatoire: false,
    verification_appareil: true,
    appareil_unique: true,
    confiance_jours: 90,
    alerte_connexion: true,
    verrou_essais: 5,
    verrou_fenetre_min: 10,
    verrou_duree_min: 15,
    anti_capture_app: true,
    protection_web: true,
    voile_web: true,
  },
};

const quandCoupe = (msg: string) => (avant: Valeur, apres: Valeur) => (avant === true && apres === false ? msg : null);
const quandActive = (msg: string) => (avant: Valeur, apres: Valeur) => (avant === false && apres === true ? msg : null);
const quandChange = (msg: string) => (avant: Valeur, apres: Valeur) => (avant !== apres ? msg : null);

export const SECTIONS: SectionDef[] = [
  {
    id: 'general',
    titre: 'Général',
    icone: '◎',
    resume: 'Maintenance, inscriptions et accès sans compte.',
    groupes: [
      {
        titre: 'Maintenance',
        description: 'Fermer temporairement le site et l’app au public. Le back-office reste accessible.',
        champs: [
          {
            cle: 'maintenance',
            type: 'switch',
            label: 'Mode maintenance',
            aide: 'Le site et l’app affichent votre message à la place du contenu.',
            portee: 'interface',
            confirmer: quandActive('Le site et l’application deviendront inaccessibles au public jusqu’à ce que vous désactiviez la maintenance.'),
          },
          {
            cle: 'message_maintenance',
            type: 'texte',
            label: 'Message affiché',
            aide: 'Obligatoire quand la maintenance est active. 300 caractères maximum.',
            portee: 'interface',
            max: 300,
            placeholder: 'Ex. AFROBACK fait peau neuve, retour prévu ce soir à 20 h.',
          },
        ],
      },
      {
        titre: 'Accès au service',
        champs: [
          {
            cle: 'inscriptions_ouvertes',
            type: 'switch',
            label: 'Inscriptions ouvertes',
            aide: 'Fermées : plus aucun nouveau compte. Les comptes existants se connectent normalement.',
            portee: 'interface',
            confirmer: quandCoupe('Plus personne ne pourra créer de compte sur le site ni dans l’application.'),
          },
          {
            cle: 'mode_invite',
            type: 'switch',
            label: 'Exploration sans compte',
            aide: 'Affiche « Explorer sans compte » dans l’application (accès aux contenus gratuits).',
            portee: 'interface',
          },
        ],
      },
    ],
  },
  {
    id: 'modules',
    titre: 'Modules',
    icone: '▦',
    resume: 'Activer ou masquer les grandes fonctionnalités.',
    groupes: [
      {
        titre: 'Fonctionnalités',
        description: 'Couper un module le retire du site et de l’application. Aucune donnée n’est supprimée.',
        champs: [
          {
            cle: 'communaute',
            type: 'switch',
            label: 'Communauté',
            aide: 'Onglet, menu et pages Communauté (publications, profils, signalements).',
            portee: 'interface',
            confirmer: quandCoupe('La Communauté disparaîtra du site et de l’application.'),
          },
          {
            cle: 'marche',
            type: 'switch',
            label: 'Marché',
            aide: 'Onglet, menu, raccourcis et pages du Marché (boutiques, produits, commandes).',
            portee: 'interface',
            confirmer: quandCoupe('Le Marché disparaîtra du site et de l’application. Les commandes en cours restent en base.'),
          },
          {
            cle: 'espace_enfant',
            type: 'switch',
            label: 'Espace enfant & École des Héros',
            aide: '« Qui regarde ? », Espace Parent, École des Héros et carnet d’explorateur.',
            portee: 'interface',
            confirmer: quandCoupe('Les profils enfants ne seront plus accessibles : tout le monde arrivera sur l’accueil adulte.'),
          },
          { cle: 'quiz', type: 'switch', label: 'Quiz de fin de contenu', aide: 'Tuiles et pages Quiz après les récits et les mythes.', portee: 'interface' },
          { cle: 'commentaires', type: 'switch', label: 'Commentaires', aide: 'Zones de commentaires sous les contenus.', portee: 'interface' },
        ],
      },
    ],
  },
  {
    id: 'paiements',
    titre: 'Paiements',
    icone: '◈',
    resume: 'Mobile Money, abonnements, dons et prix.',
    groupes: [
      {
        titre: 'Activation',
        description: 'La version Google Play reste toujours sans achat d’abonnement ni don (règle Google).',
        champs: [
          {
            cle: 'actifs',
            type: 'switch',
            label: 'Paiements activés',
            aide: 'Interrupteur général : coupe tous les paiements, abonnements comme dons.',
            portee: 'serveur',
            confirmer: quandCoupe('Plus aucun paiement ne sera accepté (abonnements et dons), sur le site comme dans l’application.'),
          },
          { cle: 'abonnements_site', type: 'switch', label: 'Abonnements payants sur le site', aide: 'Boutons « Choisir Racines / Héritage » du site.', portee: 'serveur', dependDe: 'actifs' },
          { cle: 'abonnements_app', type: 'switch', label: 'Abonnements payants dans l’application', aide: 'App web et Expo Go (jamais la version Google Play).', portee: 'serveur', dependDe: 'actifs' },
          { cle: 'dons', type: 'switch', label: 'Dons', aide: 'Bouton « Soutenir AFROBACK » et paiement des dons.', portee: 'serveur', dependDe: 'actifs' },
        ],
      },
      {
        titre: 'Moyens de paiement',
        description: 'Mobile Money au Cameroun, via Campay.',
        champs: [
          {
            cle: 'mtn',
            type: 'switch',
            label: 'MTN Mobile Money',
            aide: 'Numéros commençant par 67, 68, 650 à 654.',
            portee: 'serveur',
            dependDe: 'actifs',
            confirmer: quandCoupe('Les clients MTN ne pourront plus payer.'),
          },
          {
            cle: 'orange',
            type: 'switch',
            label: 'Orange Money',
            aide: 'Numéros commençant par 69, 655 à 659, 640.',
            portee: 'serveur',
            dependDe: 'actifs',
            confirmer: quandCoupe('Les clients Orange ne pourront plus payer.'),
          },
        ],
      },
      {
        titre: 'Tarifs',
        description: 'Prix affichés ET réellement demandés : le serveur de paiement les recalcule lui-même.',
        champs: [
          { cle: 'prix_racines', type: 'int', label: 'Racines, prix mensuel', aide: 'Accès à tous les récits.', portee: 'serveur', min: 100, max: 100000, unite: 'FCFA', confirmer: quandChange('Le prix de Racines change pour tous les nouveaux paiements.') },
          { cle: 'prix_heritage', type: 'int', label: 'Héritage, prix mensuel', aide: 'Racines + avantages Marché, badge et avant-premières.', portee: 'serveur', min: 100, max: 100000, unite: 'FCFA', confirmer: quandChange('Le prix d’Héritage change pour tous les nouveaux paiements.') },
          { cle: 'reduction_annuelle_pct', type: 'int', label: 'Réduction de l’abonnement annuel', aide: 'Prix annuel = prix mensuel × 12 × (1 − réduction).', portee: 'serveur', min: 0, max: 50, unite: '%', confirmer: quandChange('Le prix annuel des deux forfaits change.') },
        ],
      },
    ],
  },
  {
    id: 'securite',
    titre: 'Sécurité',
    icone: '◆',
    resume: 'Double authentification, appareils, connexion et protection du contenu.',
    groupes: [
      {
        titre: 'Vérification en 2 étapes',
        description: 'Code à 6 chiffres d’une application d’authentification (Google Authenticator, Authy).',
        champs: [
          {
            cle: 'mfa_disponible',
            type: 'switch',
            label: 'Disponible pour les utilisateurs',
            aide: 'Coupée : l’option disparaît. Les comptes qui l’ont déjà activée restent protégés.',
            portee: 'interface',
          },
          { cle: 'proposer_2fa', type: 'switch', label: 'Proposée à l’inscription', aide: 'Écran « Protège ton compte » juste après l’inscription.', portee: 'interface', dependDe: 'mfa_disponible' },
          {
            cle: 'mfa_obligatoire',
            type: 'switch',
            label: 'Obligatoire pour tous les comptes',
            aide: 'Tout compte sans vérification en 2 étapes devra l’activer avant d’accéder au contenu.',
            portee: 'interface',
            dependDe: 'mfa_disponible',
            confirmer: quandActive('Tous les utilisateurs sans vérification en 2 étapes seront bloqués jusqu’à ce qu’ils l’activent avec une application d’authentification.'),
          },
        ],
      },
      {
        titre: 'Appareils et sessions',
        champs: [
          {
            cle: 'verification_appareil',
            type: 'switch',
            label: 'Vérification des nouveaux appareils',
            aide: 'Code par e-mail à la connexion depuis un téléphone ou un navigateur inconnu.',
            portee: 'serveur',
            confirmer: quandCoupe('Un mot de passe volé suffira à se connecter depuis n’importe quel appareil.'),
          },
          {
            cle: 'appareil_unique',
            type: 'switch',
            label: 'Un seul appareil connecté à la fois',
            aide: 'Un téléphone + un navigateur ; une nouvelle connexion déconnecte l’ancienne.',
            portee: 'serveur',
            confirmer: quandCoupe('Un même compte pourra être utilisé sur plusieurs appareils en même temps (partage d’abonnement possible).'),
          },
          { cle: 'confiance_jours', type: 'int', label: 'Durée de confiance d’un appareil', aide: 'Au-delà sans utilisation, l’appareil doit être revérifié.', portee: 'serveur', min: 1, max: 365, unite: 'jours' },
          { cle: 'alerte_connexion', type: 'switch', label: 'E-mail d’alerte à chaque nouvelle connexion', aide: 'Prévient le titulaire quand un nouvel appareil se connecte.', portee: 'serveur' },
        ],
      },
      {
        titre: 'Protection contre les intrusions',
        description: 'Blocage temporaire d’un compte après plusieurs mots de passe faux.',
        champs: [
          { cle: 'verrou_essais', type: 'int', label: 'Blocage après', aide: 'Nombre de mots de passe faux.', portee: 'serveur', min: 3, max: 20, unite: 'essais' },
          { cle: 'verrou_fenetre_min', type: 'int', label: 'Sur une durée de', aide: 'Fenêtre glissante dans laquelle les essais sont comptés.', portee: 'serveur', min: 1, max: 120, unite: 'min' },
          { cle: 'verrou_duree_min', type: 'int', label: 'Durée du blocage', aide: 'Temps d’attente avant de pouvoir réessayer.', portee: 'serveur', min: 1, max: 1440, unite: 'min' },
        ],
      },
      {
        titre: 'Protection du contenu',
        champs: [
          {
            cle: 'anti_capture_app',
            type: 'switch',
            label: 'Anti-capture dans l’application',
            aide: 'Captures et enregistrements d’écran bloqués (Android, iPhone iOS 13+).',
            portee: 'interface',
            confirmer: quandCoupe('Les utilisateurs pourront faire des captures et des enregistrements d’écran de l’application.'),
          },
          { cle: 'protection_web', type: 'switch', label: 'Anti-copie sur le web', aide: 'Sélection, copier, clic droit et impression bloqués (site et app web).', portee: 'interface' },
          { cle: 'voile_web', type: 'switch', label: 'Voile « Contenu protégé » sur le web', aide: 'La page se floute quand la fenêtre perd le focus.', portee: 'interface' },
        ],
      },
    ],
  },
];

export function champsDe(section: Section): Champ[] {
  return SECTIONS.find((s) => s.id === section)?.groupes.flatMap((g) => g.champs) ?? [];
}

/** Réglages effectifs : défauts complétés par la ligne enregistrée. */
export function fusionner(data: unknown): Parametres {
  const d = (data ?? {}) as Partial<Parametres>;
  return {
    general: { ...DEFAUTS.general, ...(d.general ?? {}) },
    modules: { ...DEFAUTS.modules, ...(d.modules ?? {}) },
    paiements: { ...DEFAUTS.paiements, ...(d.paiements ?? {}) },
    securite: { ...DEFAUTS.securite, ...(d.securite ?? {}) },
  };
}

/** Contrôle d'une section saisie ; renvoie les valeurs propres ou un message d'erreur. */
export function valider(section: Section, saisie: Record<string, unknown>): { valeurs: Valeurs } | { erreur: string } {
  const valeurs: Valeurs = {};
  for (const c of champsDe(section)) {
    const v = saisie[c.cle];
    if (c.type === 'switch') {
      valeurs[c.cle] = v === true;
    } else if (c.type === 'int') {
      const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/\s/g, ''));
      if (!Number.isInteger(n) || n < c.min || n > c.max) return { erreur: `« ${c.label} » doit être un nombre entier entre ${c.min} et ${c.max}.` };
      valeurs[c.cle] = n;
    } else {
      valeurs[c.cle] = String(v ?? '').trim().slice(0, c.max);
    }
  }
  if (section === 'general' && valeurs.maintenance && !String(valeurs.message_maintenance).trim()) {
    return { erreur: 'Écrivez le message à afficher pendant la maintenance.' };
  }
  if (section === 'paiements' && valeurs.actifs && !valeurs.mtn && !valeurs.orange) {
    return { erreur: 'Gardez au moins un opérateur (MTN ou Orange), ou coupez les paiements.' };
  }
  return { valeurs };
}

export function affiche(v: Valeur | undefined): string {
  if (v === true) return 'activé';
  if (v === false) return 'désactivé';
  return String(v ?? '—') || '—';
}
