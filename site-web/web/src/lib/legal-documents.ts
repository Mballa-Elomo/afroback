// Copie de app-mobile/mobile-app/src/legal/documents.ts (le site ne partage pas de code avec l'app) : garder les deux identiques.
/**
 * Conditions d'utilisation et politique de confidentialité d'AFROBACK.
 *
 * VERSION PROVISOIRE rédigée le 2026-09-29 (demande de Yannick : pouvoir
 * lire ces documents depuis l'inscription). Décrit ce que l'app fait
 * réellement de ses données, vérifié dans le code et le schéma Supabase à
 * cette date. **À faire relire par un juriste avant l'ouverture au public.**
 * Les passages "[à compléter : …]" attendent une information de Yannick
 * (raison sociale, adresse) qu'il ne faut pas inventer.
 *
 * `LEGAL_VERSION` est enregistrée dans le compte au moment du consentement
 * (`user_metadata.consent_version`) : la changer à chaque nouvelle version.
 */

export const LEGAL_VERSION = 'provisoire-2026-10-08';

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  updated: string;
  draftNotice: string;
  sections: LegalSection[];
}

type Lang = 'fr' | 'en';
export type LegalDocId = 'cgu' | 'confidentialite';

const CONTACT = 'afroback3d@gmail.com';

const cguFr: LegalDocument = {
  title: "Conditions d'utilisation",
  updated: 'Version provisoire du 8 octobre 2026',
  draftNotice:
    "Ce document est une version provisoire, en cours de relecture juridique. Il sera finalisé avant l'ouverture d'AFROBACK au public.",
  sections: [
    {
      title: '1. Objet',
      paragraphs: [
        "AFROBACK est une application consacrée à l'histoire, aux mythes, aux traditions et aux savoir-faire africains. Ces conditions encadrent l'utilisation de l'application et de ses services : récits de héros, mythologie, Explorer le Cameroun, espace enfant, Communauté, Marketplace et dons.",
        "En créant un compte, tu acceptes ces conditions et la politique de confidentialité.",
      ],
    },
    {
      title: '2. Éditeur',
      paragraphs: [
        "AFROBACK est édité par [à compléter : raison sociale, forme juridique, numéro d'immatriculation], dont le siège est situé [à compléter : adresse], Yaoundé, Cameroun.",
        `Contact : ${CONTACT}`,
      ],
    },
    {
      title: '3. Compte',
      paragraphs: [
        "La création d'un compte est réservée aux personnes de 18 ans ou plus. Tu t'engages à fournir des informations exactes (prénom, adresse e-mail, numéro de téléphone) et à les tenir à jour.",
        "Tu es responsable de la confidentialité de ton mot de passe et de ce qui est fait depuis ton compte. Tu peux activer la vérification en 2 étapes pour le protéger davantage. Préviens-nous sans attendre si tu penses que ton compte a été utilisé par quelqu'un d'autre.",
        "Tu peux aussi explorer une partie des contenus sans compte (mode invité). Certaines fonctions demandent alors de créer un compte.",
      ],
    },
    {
      title: '4. Profils enfants',
      paragraphs: [
        "Un enfant ne crée jamais son propre compte. Un parent titulaire d'un compte peut créer, dans son compte, des profils pour ses enfants (prénom, âge, couleur d'avatar). Le parent reste responsable de l'usage de l'application par ses enfants. L'accès à l'espace parent est protégé par un code parent.",
      ],
    },
    {
      title: '5. Contenus AFROBACK',
      paragraphs: [
        "Les récits, textes, illustrations, narrations, vidéos et fiches publiés dans AFROBACK sont protégés par le droit d'auteur. Ils sont mis à ta disposition pour un usage personnel et non commercial. Toute reproduction, diffusion ou revente sans autorisation écrite est interdite.",
        "AFROBACK s'efforce de distinguer ce qui est historiquement attesté de ce qui relève de la tradition orale ou de la légende, et cite ses sources. Si tu relèves une erreur, écris-nous : nous corrigerons.",
      ],
    },
    {
      title: '6. Forfaits et abonnements',
      paragraphs: [
        "Le forfait Découverte est gratuit et donne accès à une sélection de contenus. Les forfaits Racines et Héritage donnent accès à l'ensemble des contenus et fonctions décrits dans l'application, aux prix qui y sont affichés.",
        "Le paiement se fait par Mobile Money (Orange Money, MTN MoMo), par l'intermédiaire de notre prestataire de paiement Campay. Un abonnement couvre la durée choisie (un mois ou un an) ; tu peux le renouveler avant son échéance. Tu peux le résilier à tout moment : l'accès est conservé jusqu'à la date de fin, sans remboursement de la période en cours. AFROBACK peut aussi offrir des accès.",
      ],
    },
    {
      title: '7. Communauté',
      paragraphs: [
        "Dans la Communauté, tu apparais sous ton pseudo et ta photo ou ton avatar, jamais sous ton e-mail ni ton numéro. Tu es responsable de ce que tu publies.",
        "Sont interdits : les propos haineux, racistes, discriminatoires ou violents, le harcèlement, la désinformation volontaire, les contenus illégaux, pornographiques ou qui portent atteinte aux droits d'autrui, et le spam. Chacun peut signaler un contenu. AFROBACK peut masquer ou supprimer un contenu et suspendre un compte qui ne respecte pas ces règles.",
      ],
    },
    {
      title: '8. Marketplace',
      paragraphs: [
        "La Marketplace met en relation des artisans vendeurs et des acheteurs. Chaque vendeur est responsable de ses produits, de leur description, de leur prix, de leur conformité et de leur livraison. AFROBACK agit comme intermédiaire technique et n'est pas le vendeur.",
        "Les avis doivent refléter une expérience réelle d'achat.",
      ],
    },
    {
      title: '9. Dons',
      paragraphs: [
        "Les dons servent à financer la production de nouveaux récits, narrations et vidéos. Un don est volontaire et ne donne droit à aucune contrepartie, sauf mention contraire.",
      ],
    },
    {
      title: '10. Responsabilité',
      paragraphs: [
        "AFROBACK fait son possible pour que l'application soit disponible et fiable, sans pouvoir le garantir en permanence (maintenance, panne, réseau). AFROBACK ne peut être tenu responsable des dommages indirects liés à l'utilisation de l'application, ni des relations entre acheteurs et vendeurs de la Marketplace.",
      ],
    },
    {
      title: '11. Suspension et suppression du compte',
      paragraphs: [
        `Tu peux supprimer ton compte à tout moment, toi-même : dans l'application (Profil → Sécurité → Supprimer mon compte) ou sur https://afroback-web.vercel.app/supprimer-mon-compte. Tu peux aussi écrire à ${CONTACT}. AFROBACK peut suspendre ou supprimer un compte en cas de manquement grave à ces conditions, après t'en avoir informé lorsque c'est possible.`,
      ],
    },
    {
      title: '12. Modifications',
      paragraphs: [
        "Ces conditions peuvent évoluer. En cas de changement important, tu en seras informé dans l'application, et ton accord pourra t'être redemandé.",
      ],
    },
    {
      title: '13. Droit applicable',
      paragraphs: [
        `Ces conditions sont soumises au droit camerounais. En cas de litige, une solution amiable sera recherchée en priorité : écris-nous à ${CONTACT}. À défaut, les tribunaux compétents de Yaoundé seront saisis, sous réserve des règles protectrices applicables aux consommateurs dans leur pays de résidence.`,
      ],
    },
  ],
};

const cguEn: LegalDocument = {
  title: 'Terms of use',
  updated: 'Provisional version of 8 October 2026',
  draftNotice:
    'This document is a provisional version under legal review. It will be finalised before AFROBACK opens to the public.',
  sections: [
    {
      title: '1. Purpose',
      paragraphs: [
        'AFROBACK is an app dedicated to African history, myths, traditions and know-how. These terms govern the use of the app and its services: hero stories, mythology, Explore Cameroon, the children space, the Community, the Marketplace and donations.',
        'By creating an account, you accept these terms and the privacy policy.',
      ],
    },
    {
      title: '2. Publisher',
      paragraphs: [
        'AFROBACK is published by [to be completed: company name, legal form, registration number], registered at [to be completed: address], Yaoundé, Cameroon.',
        `Contact: ${CONTACT}`,
      ],
    },
    {
      title: '3. Account',
      paragraphs: [
        'Creating an account is reserved for people aged 18 or over. You agree to provide accurate information (first name, email address, phone number) and to keep it up to date.',
        'You are responsible for keeping your password confidential and for what is done from your account. You can enable 2-step verification to protect it further. Let us know immediately if you think someone else has used your account.',
        'You can also explore part of the content without an account (guest mode). Some features then require an account.',
      ],
    },
    {
      title: '4. Children profiles',
      paragraphs: [
        'A child never creates their own account. A parent with an account can create profiles for their children inside that account (first name, age, avatar colour). The parent remains responsible for their children\'s use of the app. Access to the parent space is protected by a parent code.',
      ],
    },
    {
      title: '5. AFROBACK content',
      paragraphs: [
        'The stories, texts, illustrations, narrations, videos and sheets published in AFROBACK are protected by copyright. They are made available to you for personal, non-commercial use. Any reproduction, distribution or resale without written permission is prohibited.',
        'AFROBACK strives to separate what is historically attested from oral tradition or legend, and cites its sources. If you spot a mistake, write to us: we will correct it.',
      ],
    },
    {
      title: '6. Plans and subscriptions',
      paragraphs: [
        'The Découverte plan is free and gives access to a selection of content. The Racines and Héritage plans give access to all the content and features described in the app, at the prices shown there.',
        'Payment is made by Mobile Money (Orange Money, MTN MoMo), through our payment provider Campay. A subscription covers the chosen period (one month or one year); you can renew it before it ends. You can cancel it at any time: access is kept until the end date, with no refund of the current period. AFROBACK may also offer access.',
      ],
    },
    {
      title: '7. Community',
      paragraphs: [
        'In the Community, you appear under your username and your photo or avatar, never under your email or phone number. You are responsible for what you post.',
        'Hateful, racist, discriminatory or violent content, harassment, deliberate disinformation, illegal or pornographic content, content infringing the rights of others, and spam are prohibited. Anyone can report content. AFROBACK may hide or remove content and suspend an account that breaks these rules.',
      ],
    },
    {
      title: '8. Marketplace',
      paragraphs: [
        'The Marketplace connects artisan sellers and buyers. Each seller is responsible for their products, their description, price, compliance and delivery. AFROBACK acts as a technical intermediary and is not the seller.',
        'Reviews must reflect a real purchase experience.',
      ],
    },
    {
      title: '9. Donations',
      paragraphs: [
        'Donations fund the production of new stories, narrations and videos. A donation is voluntary and gives no right to anything in return, unless stated otherwise.',
      ],
    },
    {
      title: '10. Liability',
      paragraphs: [
        'AFROBACK does its best to keep the app available and reliable, without being able to guarantee it at all times (maintenance, outage, network). AFROBACK cannot be held liable for indirect damage linked to the use of the app, nor for relations between Marketplace buyers and sellers.',
      ],
    },
    {
      title: '11. Account suspension and deletion',
      paragraphs: [
        `You can delete your account yourself at any time: in the app (Profile → Security → Delete my account) or at https://afroback-web.vercel.app/supprimer-mon-compte. You can also write to ${CONTACT}. AFROBACK may suspend or delete an account in case of serious breach of these terms, after informing you when possible.`,
      ],
    },
    {
      title: '12. Changes',
      paragraphs: [
        'These terms may change. In case of an important change, you will be informed in the app, and your consent may be asked again.',
      ],
    },
    {
      title: '13. Governing law',
      paragraphs: [
        `These terms are governed by Cameroonian law. In case of dispute, an amicable solution will be sought first: write to us at ${CONTACT}. Failing that, the competent courts of Yaoundé will have jurisdiction, subject to the protective rules applying to consumers in their country of residence.`,
      ],
    },
  ],
};

const privFr: LegalDocument = {
  title: 'Politique de confidentialité',
  updated: 'Version provisoire du 8 octobre 2026',
  draftNotice:
    "Ce document est une version provisoire, en cours de relecture juridique. Il sera finalisé avant l'ouverture d'AFROBACK au public.",
  sections: [
    {
      title: '1. Qui est responsable de tes données',
      paragraphs: [
        "Le responsable du traitement est l'éditeur d'AFROBACK : [à compléter : raison sociale et adresse], Yaoundé, Cameroun.",
        `Pour toute question sur tes données : ${CONTACT}`,
      ],
    },
    {
      title: '2. Les données que nous collectons',
      paragraphs: [
        "Ton compte : prénom, adresse e-mail, numéro de téléphone, mot de passe (enregistré chiffré, jamais lisible par nous), langue choisie, date et version des conditions acceptées.",
        "Ton profil public : pseudo et photo ou avatar, visibles par les autres membres. Ton e-mail et ton numéro ne sont jamais affichés.",
        "Ce que tu nous indiques : l'usage prévu de l'application, le forfait qui t'intéresse, les profils de tes enfants (prénom, âge, couleur d'avatar, langues souhaitées).",
        "Ce que tu publies ou fais : publications, commentaires et signalements dans la Communauté ; boutique, produits, commandes (dont l'adresse de livraison) et avis dans la Marketplace ; dons ; abonnements ; résultats aux quiz.",
        "Paiements : numéro Mobile Money utilisé, montant, date, statut et référence de la transaction.",
        "Ton appareil : un identifiant créé par l'application et le nom de l'appareil, pour n'autoriser qu'un appareil connecté à la fois et t'alerter d'une nouvelle connexion.",
        "Sécurité : les tentatives de connexion (identifiant utilisé, réussite ou échec, date) pour bloquer les tentatives d'intrusion ; si tu l'actives, la clé de ta vérification en 2 étapes, enregistrée chiffrée.",
        "Statistiques : le nombre de lectures, d'écoutes et de vidéos vues par contenu, sans lien avec ton identité.",
        "Sur ton téléphone uniquement (jamais envoyés) : la langue choisie, le fait d'avoir déjà vu l'introduction et ta progression de lecture.",
      ],
    },
    {
      title: '3. Pourquoi nous les utilisons',
      paragraphs: [
        "Pour créer et sécuriser ton compte, te connecter et t'envoyer les codes de confirmation ; te donner accès aux contenus de ton forfait ; faire fonctionner la Communauté, la Marketplace et les dons ; protéger les membres (modération, lutte contre les intrusions) ; améliorer AFROBACK à partir de statistiques anonymes.",
        "Nous ne vendons pas tes données. Nous n'utilisons pas de publicité ciblée.",
      ],
    },
    {
      title: '4. Qui y a accès',
      paragraphs: [
        "L'équipe AFROBACK, pour faire fonctionner et modérer le service. Nos prestataires techniques, uniquement pour ce qui les concerne : Supabase (hébergement de la base de données, des comptes et des fichiers), Google (envoi des e-mails depuis afroback3d@gmail.com), Campay (paiements Mobile Money), Vercel (version web et site) et Expo (distribution de l'application).",
        "Certains de ces prestataires hébergent les données hors du Cameroun. [à compléter : région d'hébergement Supabase et garanties applicables aux transferts.]",
        "Les autres membres ne voient que ton pseudo, ta photo ou ton avatar et ce que tu publies. Un vendeur de la Marketplace reçoit les informations nécessaires à la livraison de ta commande.",
      ],
    },
    {
      title: '5. Combien de temps nous les gardons',
      paragraphs: [
        "Tant que ton compte existe. Quand tu supprimes ton compte (dans l'application : Profil → Sécurité → Supprimer mon compte, ou sur https://afroback-web.vercel.app/supprimer-mon-compte), tes données personnelles sont effacées immédiatement. Seules les traces de paiement sont conservées, sans lien avec toi, pour la durée prévue par la loi.",
      ],
    },
    {
      title: '6. Les enfants',
      paragraphs: [
        "Les enfants n'ont pas de compte et ne fournissent eux-mêmes aucune donnée. Les profils enfants sont créés et gérés par le parent, qui peut les supprimer à tout moment.",
      ],
    },
    {
      title: '7. Tes droits',
      paragraphs: [
        "Conformément à la loi camerounaise n° 2024/017 relative à la protection des données à caractère personnel, et au RGPD si tu résides dans l'Union européenne, tu peux demander à accéder à tes données, les corriger, les faire supprimer, t'opposer à certains usages ou en recevoir une copie.",
        `Écris-nous à ${CONTACT}. Nous répondons dans un délai d'un mois. Tu peux aussi saisir l'autorité de protection des données compétente.`,
      ],
    },
    {
      title: '8. Sécurité',
      paragraphs: [
        "Mots de passe chiffrés, accès aux données limité par des règles strictes côté serveur, vérification en 2 étapes disponible, blocage automatique après plusieurs tentatives de connexion échouées. Aucun système n'est infaillible : en cas d'incident touchant tes données, tu seras informé.",
      ],
    },
    {
      title: '9. Modifications',
      paragraphs: [
        "Cette politique peut évoluer. En cas de changement important, tu en seras informé dans l'application.",
      ],
    },
  ],
};

const privEn: LegalDocument = {
  title: 'Privacy policy',
  updated: 'Provisional version of 8 October 2026',
  draftNotice:
    'This document is a provisional version under legal review. It will be finalised before AFROBACK opens to the public.',
  sections: [
    {
      title: '1. Who is responsible for your data',
      paragraphs: [
        'The data controller is the publisher of AFROBACK: [to be completed: company name and address], Yaoundé, Cameroon.',
        `For any question about your data: ${CONTACT}`,
      ],
    },
    {
      title: '2. The data we collect',
      paragraphs: [
        'Your account: first name, email address, phone number, password (stored encrypted, never readable by us), chosen language, date and version of the accepted terms.',
        'Your public profile: username and photo or avatar, visible to other members. Your email and phone number are never displayed.',
        'What you tell us: how you plan to use the app, the plan you are interested in, your children\'s profiles (first name, age, avatar colour, preferred languages).',
        'What you post or do: posts, comments and reports in the Community; shop, products, orders (including the delivery address) and reviews on the Marketplace; donations; subscriptions; quiz results.',
        'Payments: Mobile Money number used, amount, date, status and transaction reference.',
        'Your device: an identifier created by the app and the device name, to allow only one connected device at a time and alert you of a new login.',
        'Security: login attempts (identifier used, success or failure, date) to block intrusion attempts; if you enable it, your 2-step verification key, stored encrypted.',
        'Statistics: the number of reads, listens and video views per content, not linked to your identity.',
        'On your phone only (never sent): your chosen language, whether you have seen the introduction, and your reading progress.',
      ],
    },
    {
      title: '3. Why we use it',
      paragraphs: [
        'To create and secure your account, log you in and send you confirmation codes; give you access to the content of your plan; run the Community, the Marketplace and donations; protect members (moderation, intrusion prevention); improve AFROBACK using anonymous statistics.',
        'We do not sell your data. We do not use targeted advertising.',
      ],
    },
    {
      title: '4. Who can access it',
      paragraphs: [
        'The AFROBACK team, to run and moderate the service. Our technical providers, only for what concerns them: Supabase (hosting of the database, accounts and files), Google (sending emails from afroback3d@gmail.com), Campay (Mobile Money payments), Vercel (web version and website) and Expo (app distribution).',
        'Some of these providers host data outside Cameroon. [to be completed: Supabase hosting region and safeguards applying to transfers.]',
        'Other members only see your username, your photo or avatar and what you post. A Marketplace seller receives the information needed to deliver your order.',
      ],
    },
    {
      title: '5. How long we keep it',
      paragraphs: [
        'As long as your account exists. When you delete your account (in the app: Profile → Security → Delete my account, or at https://afroback-web.vercel.app/supprimer-mon-compte), your personal data is erased immediately. Only payment records are kept, with no link to you, for the period set by law.',
      ],
    },
    {
      title: '6. Children',
      paragraphs: [
        'Children have no account and provide no data themselves. Children profiles are created and managed by the parent, who can delete them at any time.',
      ],
    },
    {
      title: '7. Your rights',
      paragraphs: [
        'Under Cameroonian law no. 2024/017 on the protection of personal data, and the GDPR if you live in the European Union, you can ask to access your data, correct it, have it deleted, object to certain uses or receive a copy.',
        `Write to us at ${CONTACT}. We answer within one month. You can also contact the competent data protection authority.`,
      ],
    },
    {
      title: '8. Security',
      paragraphs: [
        'Encrypted passwords, data access limited by strict server-side rules, 2-step verification available, automatic blocking after several failed login attempts. No system is infallible: if an incident affects your data, you will be informed.',
      ],
    },
    {
      title: '9. Changes',
      paragraphs: [
        'This policy may change. In case of an important change, you will be informed in the app.',
      ],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalDocId, Record<Lang, LegalDocument>> = {
  cgu: { fr: cguFr, en: cguEn },
  confidentialite: { fr: privFr, en: privEn },
};
